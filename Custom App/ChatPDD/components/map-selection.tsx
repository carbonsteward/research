"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search, Crosshair, Navigation } from 'lucide-react'
import { Badge } from './ui/badge'

// These would normally be imported from Leaflet, but we're using dynamic imports
// for server-side compatibility
interface MapSelectionProps {
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void
  initialLocation?: { lat: number; lng: number }
  height?: string
  showSearch?: boolean
}

export function MapSelection({
  onLocationSelect,
  initialLocation = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  height = '400px',
  showSearch = true
}: MapSelectionProps) {
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string }>(initialLocation)
  const [isLoading, setIsLoading] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Load Leaflet dynamically on the client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isMapLoaded) {
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)

      // Load Leaflet JS and initialize map
      import('leaflet').then(L => {
        if (mapRef.current && !map) {
          // Initialize map
          const newMap = L.map(mapRef.current).setView([initialLocation.lat, initialLocation.lng], 13)

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(newMap)

          // Add initial marker
          const newMarker = L.marker([initialLocation.lat, initialLocation.lng], {
            draggable: true
          }).addTo(newMap)

          // Handle marker drag
          newMarker.on('dragend', function(e) {
            const position = newMarker.getLatLng()
            const newLocation = {
              lat: parseFloat(position.lat.toFixed(6)),
              lng: parseFloat(position.lng.toFixed(6))
            }
            setSelectedLocation(newLocation)
            onLocationSelect?.(newLocation)

            // Reverse geocode to get address (in a real app)
            reverseGeocode(newLocation.lat, newLocation.lng)
          })

          // Handle map click
          newMap.on('click', function(e: any) {
            const { lat, lng } = e.latlng
            const newLocation = {
              lat: parseFloat(lat.toFixed(6)),
              lng: parseFloat(lng.toFixed(6))
            }
            newMarker.setLatLng([lat, lng])
            setSelectedLocation(newLocation)
            onLocationSelect?.(newLocation)

            // Reverse geocode to get address (in a real app)
            reverseGeocode(newLocation.lat, newLocation.lng)
          })

          setMap(newMap)
          setMarker(newMarker)
          setIsMapLoaded(true)
        }
      })
    }

    return () => {
      // Clean up map when component unmounts
      if (map) {
        map.remove()
      }
    }
  }, [initialLocation.lat, initialLocation.lng, map, onLocationSelect])

  // Function to simulate reverse geocoding (in a real app, you would call an API)
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // In a real app, you would call a geocoding API like Nominatim or Google Maps
      const mockAddress = `Sample Address near ${lat.toFixed(4)}, ${lng.toFixed(4)}`

      setSelectedLocation(prev => ({
        ...prev,
        address: mockAddress
      }))

      setIsLoading(false)
    }, 500)
  }

  // Function to handle location search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !map || !marker) return

    setIsLoading(true)

    // In a real app, you would call a geocoding API here
    // For now, we'll simulate with fixed coordinates based on the search query
    setTimeout(() => {
      // Mock coordinates based on search hash
      const hash = searchQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const lat = 35 + (hash % 10) / 10
      const lng = 135 + (hash % 15) / 10

      const newLocation = {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        address: searchQuery
      }

      // Update marker and map view
      marker.setLatLng([newLocation.lat, newLocation.lng])
      map.setView([newLocation.lat, newLocation.lng], 13)

      setSelectedLocation(newLocation)
      onLocationSelect?.(newLocation)
      setIsLoading(false)
    }, 800)
  }

  // Handle user's current location
  const getCurrentLocation = () => {
    if (!map || !marker) return

    setIsLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          const newLocation = {
            lat: parseFloat(latitude.toFixed(6)),
            lng: parseFloat(longitude.toFixed(6))
          }

          // Update marker and map view
          marker.setLatLng([newLocation.lat, newLocation.lng])
          map.setView([newLocation.lat, newLocation.lng], 13)

          setSelectedLocation(newLocation)
          onLocationSelect?.(newLocation)

          // Reverse geocode
          reverseGeocode(newLocation.lat, newLocation.lng)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLoading(false)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geographic Location Selection
        </CardTitle>
        <CardDescription>
          Select a location by clicking on the map, searching, or using your current location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map container */}
        <div
          ref={mapRef}
          className="w-full rounded-md border border-input bg-muted"
          style={{ height }}
        />

        {/* Selected location information */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Crosshair className="h-3 w-3" />
              Lat: {selectedLocation.lat}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Crosshair className="h-3 w-3" />
              Lng: {selectedLocation.lng}
            </Badge>
          </div>
          {selectedLocation.address && (
            <div className="text-sm text-muted-foreground">
              {selectedLocation.address}
            </div>
          )}
        </div>

        {/* Search box */}
        {showSearch && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="location-search" className="sr-only">Search location</Label>
              <Input
                id="location-search"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={getCurrentLocation} disabled={isLoading}>
          <Navigation className="h-4 w-4 mr-1" />
          Use My Location
        </Button>
        <Button
          onClick={() => onLocationSelect?.(selectedLocation)}
          disabled={isLoading}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Confirm Location
        </Button>
      </CardFooter>
    </Card>
  )
}
