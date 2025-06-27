"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GeoSpyAI } from "@/components/geospy-ai"
import { MapSelection } from "@/components/map-selection"
import { ArrowLeft, ArrowRight, Info, MapPin } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function GeoSpyPage() {
  const router = useRouter()
  const [detectedCoordinates, setDetectedCoordinates] = useState<{
    lat: number
    lng: number
    confidence: number
    locationName?: string
  } | null>(null)

  const [mapCoordinates, setMapCoordinates] = useState<{
    lat: number
    lng: number
    address?: string
  } | null>(null)

  const handleCoordinatesDetected = (coordinates: {
    lat: number
    lng: number
    confidence: number
    locationName?: string
  }) => {
    setDetectedCoordinates(coordinates)
    // Also update the map with these coordinates
    setMapCoordinates({
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: coordinates.locationName
    })
  }

  const handleMapLocationSelect = (location: {
    lat: number
    lng: number
    address?: string
  }) => {
    setMapCoordinates(location)
  }

  const handleContinue = () => {
    // Store the selected coordinates (either from GeoSpy or map) in your state management
    const coordinates = mapCoordinates
    console.log("Using coordinates:", coordinates)

    // Navigate to the risk assessment page
    router.push("/project/risk-assessment")
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">GeoSpy Location Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image or take a photo to automatically detect project coordinates
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>AI-Powered Location Detection</AlertTitle>
        <AlertDescription>
          GeoSpy uses advanced image recognition to identify landmarks and determine the
          geographic coordinates of your project location from photos. This is especially
          useful if you don't know the exact coordinates of your project site.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <GeoSpyAI onCoordinatesDetected={handleCoordinatesDetected} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verify Location on Map</CardTitle>
              <CardDescription>
                Review and adjust the detected location if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapSelection
                onLocationSelect={handleMapLocationSelect}
                initialLocation={mapCoordinates || { lat: 37.7749, lng: -122.4194 }}
              />
            </CardContent>
          </Card>

          {detectedCoordinates && (
            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Detection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Confidence Score:</dt>
                  <dd className="font-medium">{detectedCoordinates.confidence}%</dd>

                  <dt className="text-muted-foreground">Detected Location:</dt>
                  <dd className="font-medium">{detectedCoordinates.locationName || "Unknown"}</dd>

                  <dt className="text-muted-foreground">Latitude:</dt>
                  <dd className="font-mono">{detectedCoordinates.lat.toFixed(6)}</dd>

                  <dt className="text-muted-foreground">Longitude:</dt>
                  <dd className="font-mono">{detectedCoordinates.lng.toFixed(6)}</dd>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => router.push("/project/location")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Location Selection
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!mapCoordinates}
        >
          Continue to Risk Assessment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
