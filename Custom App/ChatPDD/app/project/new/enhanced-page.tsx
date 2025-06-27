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
import { ArrowRight, ArrowLeft, Check, HelpCircle, MapPin, AlertCircle, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useProjectCreation, ProjectFormData } from "@/hooks/use-projects"
import { MethodologySelector } from "@/components/project-creation/methodology-selector"
import { RiskPreview } from "@/components/project-creation/risk-preview"

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

export default function EnhancedNewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState("basic")
  const [coordinates, setCoordinates] = useState<string>("")

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

  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCoordinatesChange = (coords: string) => {
    setCoordinates(coords)
    setFormData((prev) => ({ ...prev, coordinates: coords }))
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

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="mr-2">Project Coordinates (Optional)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">
                          Providing coordinates enables more precise climate risk assessment and policy analysis
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={coordinates}
                    onChange={(e) => handleCoordinatesChange(e.target.value)}
                    placeholder="e.g., 40.7128,-74.0060 (latitude,longitude)"
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
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
                {coordinates && (
                  <p className="text-sm text-green-600">✓ Coordinates set for enhanced risk assessment</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Methodology Selection */}
                <div>
                  <MethodologySelector
                    projectType={formData.projectType}
                    country={formData.country}
                    region={formData.region}
                    itmoRequired={formData.itmoRequired}
                    selectedMethodologyId={formData.methodologyId}
                    onMethodologySelect={(methodologyId) => handleChange("methodologyId", methodologyId)}
                    onSkip={() => handleChange("methodologyId", undefined)}
                  />
                </div>

                {/* Risk Preview */}
                <div>
                  <RiskPreview
                    country={formData.country}
                    region={formData.region}
                    coordinates={formData.coordinates}
                    projectType={formData.projectType}
                  />
                </div>
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
