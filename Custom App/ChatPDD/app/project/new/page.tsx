"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Check, HelpCircle, MapPin, AlertCircle, Loader2, Camera, Image as ImageIcon, Clock, Lightbulb, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useProjectCreation, ProjectFormData } from "@/hooks/use-projects"
import { MethodologySelector } from "@/components/project-creation/methodology-selector"
import { SmartMethodologyRecommender } from "@/components/smart-methodology-recommender"
import { RiskPreview } from "@/components/project-creation/risk-preview"
import { CarbonCreditEstimator } from "@/components/carbon-credit-estimator"
import { ProjectTimelineTracker } from "@/components/project-timeline-tracker"
import { SatelliteAnalysis } from "@/components/satellite-analysis"
import { DocumentParser } from "@/components/document-parser"
import { PolicyComplianceChecker } from "@/components/policy-compliance-checker"
import { GeoSpyAI } from "@/components/geospy-ai"
import { CoordinateValidator } from "@/components/coordinate-validator"
import { BulkPhotoUpload } from "@/components/bulk-photo-upload"
import { LocationHistory, useLocationHistory } from "@/components/location-history"

// Mock user - in real app this would come from auth context
const MOCK_USER = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
}

const PROJECT_TYPES = [
  { value: 'AFOLU', label: 'Agriculture, Forestry & Land Use', description: 'Land-based carbon sequestration projects' },
  { value: 'ENERGY', label: 'Energy', description: 'Renewable energy and efficiency projects' },
  { value: 'TRANSPORT', label: 'Transport', description: 'Sustainable transportation initiatives' },
  { value: 'MANUFACTURING', label: 'Manufacturing', description: 'Industrial process improvements' },
  { value: 'WASTE', label: 'Waste Management', description: 'Waste reduction and recycling projects' },
  { value: 'BUILDINGS', label: 'Buildings', description: 'Building efficiency and green construction' },
  { value: 'OTHER', label: 'Other', description: 'Other carbon mitigation activities' },
]

const COUNTRIES = [
  { value: 'USA', label: 'United States' },
  { value: 'BRA', label: 'Brazil' },
  { value: 'IDN', label: 'Indonesia' },
  { value: 'KEN', label: 'Kenya' },
  { value: 'IND', label: 'India' },
  { value: 'DEU', label: 'Germany' },
  { value: 'GBR', label: 'United Kingdom' },
  { value: 'CAN', label: 'Canada' },
  { value: 'AUS', label: 'Australia' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState("basic")
  const [coordinates, setCoordinates] = useState<string>("")
  const [showGeospy, setShowGeospy] = useState(false)
  const [showCoordinateValidator, setShowCoordinateValidator] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showLocationHistory, setShowLocationHistory] = useState(false)
  const [validatedLocation, setValidatedLocation] = useState<{
    lat: number
    lng: number
    address?: string
    confidence: number
  } | null>(null)
  const [bulkLocations, setBulkLocations] = useState<Array<{
    id: string
    fileName: string
    lat: number
    lng: number
    confidence: number
    locationName?: string
    landmarks?: string[]
  }>>([])
  const [selectedMethodology, setSelectedMethodology] = useState<any>(null)
  const [useSmartRecommendations, setUseSmartRecommendations] = useState(true)

  const [formData, setFormData] = useState<ProjectFormData>({
    // Basic Info
    name: "",
    description: "",
    projectType: 'AFOLU',
    country: "",
    region: "",
    coordinates: "",

    // Project Details
    estimatedCredits: undefined,
    budget: undefined,
    timeline: "",

    // Methodology
    methodologyId: undefined,
    itmoRequired: false,

    // User Context
    userId: MOCK_USER.id,
  })

  const { createProject, loading, error } = useProjectCreation()
  const { addToHistory } = useLocationHistory()

  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCoordinatesChange = (coords: string) => {
    setCoordinates(coords)
    setFormData((prev) => ({ ...prev, coordinates: coords }))
  }

  const handleGeospyResult = (result: { lat: number; lng: number; confidence: number; locationName?: string }) => {
    const coords = `${result.lat},${result.lng}`
    handleCoordinatesChange(coords)
    setValidatedLocation({
      lat: result.lat,
      lng: result.lng,
      address: result.locationName,
      confidence: result.confidence
    })

    // Add to location history
    addToHistory({
      lat: result.lat,
      lng: result.lng,
      address: result.locationName,
      confidence: result.confidence,
      source: 'geospy'
    })

    setShowGeospy(false)
  }

  const handleValidatedCoordinates = (result: { lat: number; lng: number; address?: string; confidence: number }) => {
    setValidatedLocation(result)

    // Add to location history if this is a new validation
    addToHistory({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
      confidence: result.confidence,
      source: 'manual'
    })
  }

  const handleLocationHistorySelect = (location: { lat: number; lng: number; address?: string; confidence: number }) => {
    const coords = `${location.lat},${location.lng}`
    handleCoordinatesChange(coords)
    setValidatedLocation(location)
  }

  const handleBulkLocationsDetected = (locations: Array<{
    id: string
    fileName: string
    lat: number
    lng: number
    confidence: number
    locationName?: string
    landmarks?: string[]
  }>) => {
    setBulkLocations(locations)

    // Add all locations to history
    locations.forEach(location => {
      addToHistory({
        lat: location.lat,
        lng: location.lng,
        address: location.locationName,
        confidence: location.confidence,
        landmarks: location.landmarks,
        source: 'bulk',
        name: `Photo: ${location.fileName}`
      })
    })

    // If multiple locations detected, use the one with highest confidence as primary
    if (locations.length > 0) {
      const bestLocation = locations.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      )

      const coords = `${bestLocation.lat},${bestLocation.lng}`
      handleCoordinatesChange(coords)
      setValidatedLocation({
        lat: bestLocation.lat,
        lng: bestLocation.lng,
        address: bestLocation.locationName,
        confidence: bestLocation.confidence
      })
    }
  }

  const handleMethodologySelect = (methodology: any) => {
    setSelectedMethodology(methodology)
    handleChange("methodologyId", methodology.id)
  }

  const handleSubmit = async () => {
    try {
      const project = await createProject(formData)
      if (project) {
        router.push(`/dashboard?newProject=${project.id}`)
      }
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  // Validation functions
  const isBasicInfoComplete = () => {
    return (
      formData.name.trim() !== "" &&
      formData.projectType !== "" &&
      formData.description.trim() !== "" &&
      formData.country !== ""
    )
  }

  const isDetailsComplete = () => {
    return isBasicInfoComplete() // Add more validation as needed
  }

  // Get current project type info
  const selectedProjectType = PROJECT_TYPES.find(type => type.value === formData.projectType)
  const selectedCountry = COUNTRIES.find(country => country.value === formData.country)

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-500">
          Provide details about your carbon mitigation project to get personalized recommendations and risk assessments
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { id: 'basic', label: 'Basic Info', number: 1 },
            { id: 'details', label: 'Project Details', number: 2 },
            { id: 'methodology', label: 'Methodology', number: 3 },
            { id: 'review', label: 'Review', number: 4 },
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : ['basic', 'details', 'methodology'].indexOf(currentStep) > ['basic', 'details', 'methodology'].indexOf(step.id) ||
                      (currentStep === 'review' && step.id !== 'review')
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {(['basic', 'details', 'methodology'].indexOf(currentStep) > ['basic', 'details', 'methodology'].indexOf(step.id) ||
                  (currentStep === 'review' && step.id !== 'review')) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700">
                {step.label}
              </div>
              {index < 3 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-8">
        {/* Step 1: Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Project Information</CardTitle>
              <CardDescription>Essential information about your carbon mitigation project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter a descriptive project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">
                  Project Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => handleChange("projectType", value as any)}
                >
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProjectType && (
                  <p className="text-sm text-gray-600">{selectedProjectType.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Project Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your project's objectives, activities, and expected outcomes"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="country" className="mr-2">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">
                            The country where your project is located determines applicable policies, risks, and methodologies
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region/State</Label>
                  <Input
                    id="region"
                    value={formData.region || ""}
                    onChange={(e) => handleChange("region", e.target.value)}
                    placeholder="Enter region, state, or province"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Label className="mr-2">Project Location (Optional)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">
                            Providing precise location enables enhanced climate risk assessment, policy analysis, and methodology recommendations
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGeospy(true)}
                      className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200"
                      title="Upload single photo to detect location coordinates"
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Single Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkUpload(!showBulkUpload)}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                      title="Upload multiple photos to detect multiple locations"
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Photos'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCoordinateValidator(!showCoordinateValidator)}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {showCoordinateValidator ? 'Hide Map' : 'Validate & Map'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLocationHistory(!showLocationHistory)}
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                      title="View saved locations and history"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      {showLocationHistory ? 'Hide History' : 'Location History'}
                    </Button>
                  </div>
                </div>

                {/* Quick coordinate input */}
                <div className="flex gap-2">
                  <Input
                    value={coordinates}
                    onChange={(e) => handleCoordinatesChange(e.target.value)}
                    placeholder="e.g., 40.7128,-74.0060 (latitude,longitude)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const coords = `${position.coords.latitude},${position.coords.longitude}`
                          handleCoordinatesChange(coords)
                        })
                      }
                    }}
                    title="Use my current location"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>

                {/* Validated location display */}
                {validatedLocation && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Primary Location Validated</span>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {validatedLocation.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    {validatedLocation.address && (
                      <p className="text-sm text-green-700 mt-1">{validatedLocation.address}</p>
                    )}
                    <p className="text-xs text-green-600 font-mono mt-1">
                      {validatedLocation.lat.toFixed(6)}, {validatedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Bulk locations summary */}
                {bulkLocations.length > 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">
                          Multiple Locations Detected
                        </span>
                        <Badge variant="outline" className="text-purple-700 border-purple-300">
                          {bulkLocations.length} locations
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {bulkLocations.slice(0, 6).map((location, index) => (
                        <div key={location.id} className="text-xs bg-white p-2 rounded border">
                          <div className="font-medium truncate" title={location.fileName}>
                            📷 {location.fileName}
                          </div>
                          <div className="text-purple-600 font-mono">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            {location.locationName && (
                              <span className="truncate text-gray-600 flex-1" title={location.locationName}>
                                {location.locationName}
                              </span>
                            )}
                            <Badge variant="outline" className="ml-1 text-xs">
                              {location.confidence}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {bulkLocations.length > 6 && (
                        <div className="text-xs bg-white p-2 rounded border flex items-center justify-center text-gray-500">
                          +{bulkLocations.length - 6} more locations...
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      💡 Primary location (highest confidence) is set as project coordinates. View all in bulk upload panel.
                    </p>
                  </div>
                )}

                {/* Location History */}
                {showLocationHistory && (
                  <LocationHistory
                    onLocationSelect={handleLocationHistorySelect}
                    currentCoordinates={coordinates}
                    className="border-dashed"
                  />
                )}

                {/* Coordinate Validator */}
                {showCoordinateValidator && (
                  <CoordinateValidator
                    initialCoordinates={coordinates}
                    onValidatedCoordinates={handleValidatedCoordinates}
                    className="border-dashed"
                  />
                )}

                {/* Bulk Photo Upload */}
                {showBulkUpload && (
                  <BulkPhotoUpload
                    onLocationsDetected={handleBulkLocationsDetected}
                    maxFiles={10}
                    className="border-dashed"
                  />
                )}

                {/* GeoSpy AI Modal */}
                {showGeospy && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">📸 GeoSpy AI - Single Photo Location Detection</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowGeospy(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    <GeoSpyAI
                      onCoordinatesDetected={handleGeospyResult}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button
                onClick={() => setCurrentStep("details")}
                disabled={!isBasicInfoComplete()}
                type="button"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 2: Project Details */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Additional information to help assess your project's feasibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="estimatedCredits" className="mr-2">
                      Estimated Annual Credits (tCO2e)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">
                            Your best estimate of annual carbon credits in tonnes of CO2 equivalent
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="estimatedCredits"
                    type="number"
                    value={formData.estimatedCredits || ""}
                    onChange={(e) => handleChange("estimatedCredits", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Estimated Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget || ""}
                    onChange={(e) => handleChange("budget", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 100000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline || ""}
                    onChange={(e) => handleChange("timeline", e.target.value)}
                    placeholder="e.g., 5 years, 2024-2029"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itmoRequired">ITMO Compliance Required?</Label>
                  <Select
                    value={formData.itmoRequired ? "yes" : "no"}
                    onValueChange={(value) => handleChange("itmoRequired", value === "yes")}
                  >
                    <SelectTrigger id="itmoRequired">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes - ITMO compliance required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Project Summary</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProjectType && (
                    <Badge variant="outline">{selectedProjectType.label}</Badge>
                  )}
                  {selectedCountry && (
                    <Badge variant="outline">{selectedCountry.label}</Badge>
                  )}
                  {formData.region && (
                    <Badge variant="outline">{formData.region}</Badge>
                  )}
                  {formData.itmoRequired && (
                    <Badge className="bg-blue-100 text-blue-800">ITMO Required</Badge>
                  )}
                  {formData.estimatedCredits && (
                    <Badge variant="outline">{formData.estimatedCredits.toLocaleString()} tCO2e/year</Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("basic")} type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("methodology")}
                disabled={!isDetailsComplete()}
                type="button"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 3: Methodology Selection */}
        <TabsContent value="methodology">
          <Card>
            <CardHeader>
              <CardTitle>Methodology & Risk Assessment</CardTitle>
              <CardDescription>
                Select a methodology and review climate risks for your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Methodology Selection Mode Toggle */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">Smart Project Analysis</h4>
                    <p className="text-sm text-gray-600">AI-powered methodology selection, risk assessment, and project planning</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={useSmartRecommendations ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseSmartRecommendations(true)}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      AI Recommendations
                    </Button>
                    <Button
                      variant={!useSmartRecommendations ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseSmartRecommendations(false)}
                    >
                      Manual Selection
                    </Button>
                  </div>
                </div>

                {/* Analysis Tabs */}
                <Tabs defaultValue="methodology" className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="methodology">Methodology</TabsTrigger>
                    <TabsTrigger value="satellite">Satellite Analysis</TabsTrigger>
                    <TabsTrigger value="documents">Document Parser</TabsTrigger>
                    <TabsTrigger value="compliance">Policy Compliance</TabsTrigger>
                    <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
                    <TabsTrigger value="credits">Credit Estimation</TabsTrigger>
                    <TabsTrigger value="timeline">Project Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="methodology" className="mt-6">
                    {useSmartRecommendations ? (
                      <SmartMethodologyRecommender
                        projectData={{
                          type: formData.projectType,
                          country: formData.country,
                          region: formData.region,
                          coordinates: formData.coordinates,
                          estimatedCredits: formData.estimatedCredits,
                          budget: formData.budget,
                          timeline: formData.timeline,
                          itmoRequired: formData.itmoRequired
                        }}
                        userProfile={{
                          experience: 'Intermediate',
                          previousProjects: 0,
                          sectors: [formData.projectType],
                          regions: [formData.country]
                        }}
                        onMethodologySelect={handleMethodologySelect}
                      />
                    ) : (
                      <MethodologySelector
                        projectType={formData.projectType}
                        country={formData.country}
                        region={formData.region}
                        itmoRequired={formData.itmoRequired}
                        selectedMethodologyId={formData.methodologyId}
                        onMethodologySelect={(methodologyId) => handleChange("methodologyId", methodologyId)}
                        onSkip={() => handleChange("methodologyId", undefined)}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="satellite" className="mt-6">
                    <SatelliteAnalysis
                      coordinates={formData.coordinates}
                      projectType={formData.projectType}
                      analysisArea={1000}
                      onAnalysisComplete={(results) => {
                        console.log('Satellite analysis completed:', results)
                        // Here you could store the results in state or pass to parent
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="documents" className="mt-6">
                    <DocumentParser
                      maxFiles={5}
                      allowedTypes={['.pdf', '.docx', '.xlsx', '.png', '.jpg']}
                      onDocumentParsed={(document) => {
                        console.log('Document parsed:', document)
                        // Here you could auto-populate form fields based on parsed data
                        if (document.analysis.projectData) {
                          const projectData = document.analysis.projectData
                          if (projectData.name && !formData.name) {
                            handleChange('name', projectData.name)
                          }
                          if (projectData.type && !formData.projectType) {
                            handleChange('projectType', projectData.type)
                          }
                          if (projectData.location?.country && !formData.country) {
                            handleChange('country', projectData.location.country)
                          }
                          if (projectData.location?.coordinates && !formData.coordinates) {
                            handleChange('coordinates', projectData.location.coordinates)
                          }
                          if (projectData.credits?.annual && !formData.estimatedCredits) {
                            handleChange('estimatedCredits', projectData.credits.annual)
                          }
                          if (projectData.budget?.total && !formData.budget) {
                            handleChange('budget', projectData.budget.total)
                          }
                          if (projectData.timeline?.duration && !formData.timeline) {
                            handleChange('timeline', projectData.timeline.duration)
                          }
                        }
                      }}
                      onError={(error) => {
                        console.error('Document parsing error:', error)
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-6">
                    <PolicyComplianceChecker
                      projectData={{
                        country: formData.country,
                        region: formData.region,
                        coordinates: formData.coordinates,
                        projectType: formData.projectType,
                        estimatedCredits: formData.estimatedCredits,
                        budget: formData.budget
                      }}
                      methodology={selectedMethodology ? {
                        name: selectedMethodology.name,
                        standard: selectedMethodology.standardName
                      } : undefined}
                      onComplianceAssessed={(results) => {
                        console.log('Policy compliance assessed:', results)
                        // Here you could store compliance results or integrate with risk assessment
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="risks" className="mt-6">
                    <RiskPreview
                      country={formData.country}
                      region={formData.region}
                      coordinates={formData.coordinates}
                      projectType={formData.projectType}
                      selectedMethodology={selectedMethodology}
                    />
                  </TabsContent>

                  <TabsContent value="credits" className="mt-6">
                    <CarbonCreditEstimator
                      projectData={{
                        type: formData.projectType,
                        country: formData.country,
                        region: formData.region,
                        coordinates: formData.coordinates,
                        estimatedCredits: formData.estimatedCredits,
                        budget: formData.budget,
                        timeline: formData.timeline
                      }}
                      selectedMethodology={selectedMethodology}
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <ProjectTimelineTracker
                      projectData={{
                        type: formData.projectType,
                        country: formData.country,
                        region: formData.region,
                        estimatedCredits: formData.estimatedCredits,
                        budget: formData.budget,
                        timeline: formData.timeline
                      }}
                      selectedMethodology={selectedMethodology}
                    />
                  </TabsContent>
                </Tabs>

                {/* Selected Methodology Summary */}
                {selectedMethodology && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Selected Methodology</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <span className="font-medium">{selectedMethodology.name}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedMethodology.standardName} v{selectedMethodology.version}</span>
                      {selectedMethodology.matchScore && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{selectedMethodology.matchScore}% match</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("details")} type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep("review")} type="button">
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 4: Review */}
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review Project Information</CardTitle>
              <CardDescription>Review all details before creating your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Project Name</h4>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Type</h4>
                      <p>{selectedProjectType?.label}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p>{selectedCountry?.label}{formData.region && `, ${formData.region}`}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.estimatedCredits && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Annual Credits</h4>
                        <p>{formData.estimatedCredits.toLocaleString()} tCO2e</p>
                      </div>
                    )}
                    {formData.budget && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Budget</h4>
                        <p>${formData.budget.toLocaleString()}</p>
                      </div>
                    )}
                    {formData.timeline && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Timeline</h4>
                        <p>{formData.timeline}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{formData.description}</p>
                </CardContent>
              </Card>

              {formData.methodologyId && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Methodology selected. You can change this later in your project settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("methodology")} type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="min-w-32"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Project
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
