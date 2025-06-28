"use client"

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { MapPin, Check, AlertTriangle, RefreshCw } from 'lucide-react'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./map-preview'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
})

interface CoordinateValidatorProps {
  initialCoordinates?: string
  onValidatedCoordinates?: (coordinates: { lat: number; lng: number; address?: string; confidence: number }) => void
  className?: string
}

interface ValidationResult {
  isValid: boolean
  lat: number
  lng: number
  address?: string
  confidence: number
  warnings: string[]
  suggestions: string[]
}

export function CoordinateValidator({ 
  initialCoordinates = "", 
  onValidatedCoordinates,
  className = ""
}: CoordinateValidatorProps) {
  const [coordinates, setCoordinates] = useState(initialCoordinates)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Validate coordinates format and geocode
  const validateCoordinates = useCallback(async (coordString: string) => {
    if (!coordString.trim()) {
      setValidationResult(null)
      setShowMap(false)
      return
    }

    setIsValidating(true)
    
    try {
      // Parse coordinates
      const parsed = parseCoordinates(coordString)
      if (!parsed) {
        setValidationResult({
          isValid: false,
          lat: 0,
          lng: 0,
          confidence: 0,
          warnings: ["Invalid coordinate format"],
          suggestions: [
            "Use format: latitude,longitude (e.g., 40.7128,-74.0060)",
            "Latitude should be between -90 and 90",
            "Longitude should be between -180 and 180"
          ]
        })
        setShowMap(false)
        return
      }

      // Validate ranges
      const validation = validateCoordinateRanges(parsed.lat, parsed.lng)
      if (!validation.isValid) {
        setValidationResult({
          isValid: false,
          lat: parsed.lat,
          lng: parsed.lng,
          confidence: 0,
          warnings: validation.warnings,
          suggestions: validation.suggestions
        })
        setShowMap(false)
        return
      }

      // Reverse geocode to get address
      const geocodeResult = await reverseGeocode(parsed.lat, parsed.lng)
      
      const result: ValidationResult = {
        isValid: true,
        lat: parsed.lat,
        lng: parsed.lng,
        address: geocodeResult.address,
        confidence: geocodeResult.confidence,
        warnings: geocodeResult.warnings,
        suggestions: []
      }

      setValidationResult(result)
      setShowMap(true)

      // Notify parent component
      if (onValidatedCoordinates) {
        onValidatedCoordinates({
          lat: result.lat,
          lng: result.lng,
          address: result.address,
          confidence: result.confidence
        })
      }

    } catch (error) {
      console.error('Coordinate validation error:', error)
      setValidationResult({
        isValid: false,
        lat: 0,
        lng: 0,
        confidence: 0,
        warnings: ["Validation service temporarily unavailable"],
        suggestions: ["Please try again in a few moments"]
      })
      setShowMap(false)
    } finally {
      setIsValidating(false)
    }
  }, [onValidatedCoordinates])

  // Auto-validate when coordinates change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (coordinates !== initialCoordinates) {
        validateCoordinates(coordinates)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [coordinates, initialCoordinates, validateCoordinates])

  // Update coordinates when initialCoordinates changes
  useEffect(() => {
    if (initialCoordinates !== coordinates) {
      setCoordinates(initialCoordinates)
      if (initialCoordinates) {
        validateCoordinates(initialCoordinates)
      }
    }
  }, [initialCoordinates, coordinates, validateCoordinates])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Coordinate Validation
        </CardTitle>
        <CardDescription>
          Enter coordinates to validate location and view on map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coordinate Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              placeholder="e.g., 40.7128,-74.0060 (latitude,longitude)"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => validateCoordinates(coordinates)}
              disabled={isValidating || !coordinates.trim()}
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-3">
            {validationResult.isValid ? (
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span>Valid coordinates detected</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Confidence: {validationResult.confidence}%
                      </Badge>
                    </div>
                    {validationResult.address && (
                      <div className="text-sm">
                        <strong>Location:</strong> {validationResult.address}
                      </div>
                    )}
                    <div className="text-sm font-mono">
                      Lat: {validationResult.lat.toFixed(6)}, Lng: {validationResult.lng.toFixed(6)}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>Invalid coordinates</div>
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm">• {warning}</div>
                    ))}
                    {validationResult.suggestions.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Suggestions:</div>
                        {validationResult.suggestions.map((suggestion, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings for valid coordinates */}
            {validationResult.isValid && validationResult.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-800">• {warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Map Preview */}
        {showMap && validationResult?.isValid && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Location Preview</h4>
              <Badge variant="secondary">
                Interactive Map
              </Badge>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <MapComponent
                lat={validationResult.lat}
                lng={validationResult.lng}
                address={validationResult.address}
                zoom={13}
              />
            </div>
          </div>
        )}

        {/* Quick Location Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.geolocation) {
                setIsValidating(true)
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const coords = `${position.coords.latitude},${position.coords.longitude}`
                    setCoordinates(coords)
                    validateCoordinates(coords)
                  },
                  (error) => {
                    console.error('Geolocation error:', error)
                    setIsValidating(false)
                  }
                )
              }
            }}
            disabled={isValidating}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Use My Location
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCoordinates("")
              setValidationResult(null)
              setShowMap(false)
            }}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  const cleaned = coordString.trim().replace(/\s+/g, '')
  
  // Try comma-separated format: lat,lng
  const commaMatch = cleaned.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
  if (commaMatch) {
    return {
      lat: parseFloat(commaMatch[1]),
      lng: parseFloat(commaMatch[2])
    }
  }

  // Try space-separated format: lat lng
  const spaceMatch = coordString.trim().match(/^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/)
  if (spaceMatch) {
    return {
      lat: parseFloat(spaceMatch[1]),
      lng: parseFloat(spaceMatch[2])
    }
  }

  return null
}

function validateCoordinateRanges(lat: number, lng: number): { isValid: boolean; warnings: string[]; suggestions: string[] } {
  const warnings: string[] = []
  const suggestions: string[] = []

  if (lat < -90 || lat > 90) {
    warnings.push(`Latitude ${lat} is out of valid range (-90 to 90)`)
    suggestions.push("Check if latitude and longitude are swapped")
    return { isValid: false, warnings, suggestions }
  }

  if (lng < -180 || lng > 180) {
    warnings.push(`Longitude ${lng} is out of valid range (-180 to 180)`)
    suggestions.push("Check if latitude and longitude are swapped")
    return { isValid: false, warnings, suggestions }
  }

  // Check for common mistakes
  if (Math.abs(lat) > 85) {
    warnings.push("Location is in polar region - limited map services available")
  }

  if (lat === 0 && lng === 0) {
    warnings.push("Coordinates point to Null Island (0,0) - verify this is correct")
  }

  return { isValid: true, warnings, suggestions }
}

async function reverseGeocode(lat: number, lng: number): Promise<{ address?: string; confidence: number; warnings: string[] }> {
  try {
    // Using a free geocoding service (Nominatim) as fallback
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ChatPDD-Carbon-App/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data = await response.json()
    
    if (data.error) {
      return {
        confidence: 50,
        warnings: ["Location found but address details limited"]
      }
    }

    // Build formatted address
    const address = formatAddress(data.address, data.display_name)
    
    return {
      address,
      confidence: calculateConfidence(data),
      warnings: []
    }

  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return {
      confidence: 30,
      warnings: ["Address lookup unavailable - coordinates are valid but location details limited"]
    }
  }
}

function formatAddress(addressComponents: any, displayName: string): string {
  if (!addressComponents) return displayName || 'Unknown location'

  const parts: string[] = []
  
  // Add city/town
  if (addressComponents.city || addressComponents.town || addressComponents.village) {
    parts.push(addressComponents.city || addressComponents.town || addressComponents.village)
  }
  
  // Add state/region
  if (addressComponents.state || addressComponents.region) {
    parts.push(addressComponents.state || addressComponents.region)
  }
  
  // Add country
  if (addressComponents.country) {
    parts.push(addressComponents.country)
  }

  return parts.length > 0 ? parts.join(', ') : displayName || 'Unknown location'
}

function calculateConfidence(geocodeData: any): number {
  let confidence = 70 // Base confidence

  // Increase confidence based on available data
  if (geocodeData.address) {
    if (geocodeData.address.house_number) confidence += 10
    if (geocodeData.address.road) confidence += 5
    if (geocodeData.address.city || geocodeData.address.town) confidence += 10
    if (geocodeData.address.country) confidence += 5
  }

  // Adjust based on place importance
  if (geocodeData.importance > 0.5) confidence += 5
  if (geocodeData.importance > 0.7) confidence += 5

  return Math.min(confidence, 95) // Cap at 95%
}