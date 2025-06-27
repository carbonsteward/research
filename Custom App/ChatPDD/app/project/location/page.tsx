"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapSelection } from "@/components/map-selection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Globe, MapPin, ArrowRight, Info, Camera } from "lucide-react"

export default function ProjectLocationPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    address?: string
  } | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [locationType, setLocationType] = useState<string>("map")

  // Simulated country list - in a real app, this would come from an API
  const countries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "CN", name: "China" },
    { code: "IN", name: "India" },
    { code: "BR", name: "Brazil" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "UK", name: "United Kingdom" },
  ]

  // Simulated regions - would be dynamically loaded based on country in a real app
  const regions = {
    US: [
      { code: "CA", name: "California" },
      { code: "TX", name: "Texas" },
      { code: "NY", name: "New York" },
    ],
    JP: [
      { code: "TK", name: "Tokyo" },
      { code: "OS", name: "Osaka" },
      { code: "KY", name: "Kyoto" },
    ],
    // Add more as needed
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location)
  }

  const getRegionsForCountry = (countryCode: string) => {
    return regions[countryCode as keyof typeof regions] || []
  }

  const handleContinue = () => {
    // In a real app, you would save this location data to your state management or API
    const locationData = locationType === "map"
      ? selectedLocation
      : { country: selectedCountry, region: selectedRegion }

    console.log("Saving location data:", locationData)

    // Navigate to the next step in your project creation workflow
    router.push("/project/risk-assessment")
  }

  const isValidSelection = () => {
    if (locationType === "map") {
      return !!selectedLocation
    } else {
      return !!selectedCountry
    }
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Project Location</h1>
        <p className="text-muted-foreground mt-2">
          Specify the geographic location of your carbon mitigation project
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Not sure about your location's coordinates?</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Use our AI-powered GeoSpy tool to automatically detect coordinates from a photo.</span>
          <Button variant="outline" onClick={() => router.push("/project/geospy")}>
            <Camera className="h-4 w-4 mr-2" />
            Try GeoSpy
          </Button>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Tabs defaultValue="map" onValueChange={setLocationType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-2" />
              Map Selection
            </TabsTrigger>
            <TabsTrigger value="dropdown">
              <Globe className="h-4 w-4 mr-2" />
              Country/Region Selection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            <div className="grid gap-4">
              <div className="bg-muted/40 p-4 rounded-lg flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Using the Map Selection</p>
                  <p className="text-muted-foreground">
                    Click on the map to select a specific location, search for a place, or use your current location.
                    Precise coordinates help us provide more accurate climate risk assessments.
                  </p>
                </div>
              </div>

              <MapSelection
                onLocationSelect={handleLocationSelect}
                height="500px"
              />
            </div>
          </TabsContent>

          <TabsContent value="dropdown" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>
                  Select the country and region for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value)
                      setSelectedRegion("")
                    }}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && (
                  <div className="space-y-2">
                    <Label htmlFor="region">Region/State</Label>
                    <Select
                      value={selectedRegion}
                      onValueChange={setSelectedRegion}
                      disabled={!selectedCountry || getRegionsForCountry(selectedCountry).length === 0}
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRegionsForCountry(selectedCountry).map((region) => (
                          <SelectItem key={region.code} value={region.code}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="project-site">Project Site Name (Optional)</Label>
                  <Input id="project-site" placeholder="e.g. North Forest Restoration Area" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.push("/project/new")}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!isValidSelection()}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
