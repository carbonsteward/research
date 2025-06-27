"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Save, Trash } from "lucide-react"

export default function AdminPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("standards")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Data Management Interface</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="standards">Carbon Standards</TabsTrigger>
          <TabsTrigger value="methodologies">Methodologies</TabsTrigger>
          <TabsTrigger value="policies">Climate Policies</TabsTrigger>
          <TabsTrigger value="risks">Physical Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="standards">
          <CarbonStandardForm />
        </TabsContent>

        <TabsContent value="methodologies">
          <MethodologyForm />
        </TabsContent>

        <TabsContent value="policies">
          <PolicyForm />
        </TabsContent>

        <TabsContent value="risks">
          <PhysicalRiskForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CarbonStandardForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    organizationType: "",
    geographicScope: "",
    focusSector: "",
    description: "",
    website: "",
    icroaApproved: false,
    corsiaApproved: false,
    correspondingAdjustment: "",
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      // await fetch('/api/admin/carbon-standards', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      toast({
        title: "Standard saved",
        description: `${formData.name} has been successfully saved.`,
      })

      // Reset form
      setFormData({
        name: "",
        abbreviation: "",
        organizationType: "",
        geographicScope: "",
        focusSector: "",
        description: "",
        website: "",
        icroaApproved: false,
        corsiaApproved: false,
        correspondingAdjustment: "",
      })
    } catch (error) {
      toast({
        title: "Error saving standard",
        description: "There was an error saving the standard. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add/Edit Carbon Standard</CardTitle>
        <CardDescription>Enter details about a carbon standard. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Standard Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abbreviation</Label>
              <Input
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) => handleChange("abbreviation", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type *</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) => handleChange("organizationType", value)}
              >
                <SelectTrigger id="organizationType">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="iplc">IPLC Group</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geographicScope">Geographic Scope *</Label>
              <Input
                id="geographicScope"
                value={formData.geographicScope}
                onChange={(e) => handleChange("geographicScope", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusSector">Focus Sector *</Label>
              <Input
                id="focusSector"
                value={formData.focusSector}
                onChange={(e) => handleChange("focusSector", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL *</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correspondingAdjustment">Corresponding Adjustment Label</Label>
              <Input
                id="correspondingAdjustment"
                value={formData.correspondingAdjustment}
                onChange={(e) => handleChange("correspondingAdjustment", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="icroaApproved"
                checked={formData.icroaApproved}
                onCheckedChange={(checked) => handleChange("icroaApproved", checked)}
              />
              <Label htmlFor="icroaApproved">ICROA Approved</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="corsiaApproved"
                checked={formData.corsiaApproved}
                onCheckedChange={(checked) => handleChange("corsiaApproved", checked)}
              />
              <Label htmlFor="corsiaApproved">CORSIA Approved</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Standard
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function MethodologyForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    standardId: "",
    name: "",
    type: "",
    category: "",
    link: "",
    itmoAcceptance: false,
    description: "",
  })

  // Mock data - in a real app, this would come from an API
  const standards = [
    { id: "1", name: "Verra VCS" },
    { id: "2", name: "Gold Standard" },
    { id: "3", name: "American Carbon Registry" },
  ]

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      toast({
        title: "Methodology saved",
        description: `${formData.name} has been successfully saved.`,
      })

      // Reset form
      setFormData({
        standardId: "",
        name: "",
        type: "",
        category: "",
        link: "",
        itmoAcceptance: false,
        description: "",
      })
    } catch (error) {
      toast({
        title: "Error saving methodology",
        description: "There was an error saving the methodology. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add/Edit Methodology</CardTitle>
        <CardDescription>Enter details about a methodology. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="standardId">Carbon Standard *</Label>
              <Select value={formData.standardId} onValueChange={(value) => handleChange("standardId", value)}>
                <SelectTrigger id="standardId">
                  <SelectValue placeholder="Select carbon standard" />
                </SelectTrigger>
                <SelectContent>
                  {standards.map((standard) => (
                    <SelectItem key={standard.id} value={standard.id}>
                      {standard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Methodology Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="removal">Removal</SelectItem>
                  <SelectItem value="avoidance">Avoidance (Mitigation)</SelectItem>
                  <SelectItem value="reduction">Reduction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Documentation Link *</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => handleChange("link", e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="itmoAcceptance"
                checked={formData.itmoAcceptance}
                onCheckedChange={(checked) => handleChange("itmoAcceptance", checked)}
              />
              <Label htmlFor="itmoAcceptance">ITMO Acceptance</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Methodology
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PolicyForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    countryCode: "",
    regionCode: "",
    effectiveDate: "",
    expirationDate: "",
    policyType: "",
    source: "",
    sourceUrl: "",
    sectors: [""],
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSectorChange = (index: number, value: string) => {
    const newSectors = [...formData.sectors]
    newSectors[index] = value
    setFormData((prev) => ({ ...prev, sectors: newSectors }))
  }

  const addSector = () => {
    setFormData((prev) => ({ ...prev, sectors: [...prev.sectors, ""] }))
  }

  const removeSector = (index: number) => {
    const newSectors = [...formData.sectors]
    newSectors.splice(index, 1)
    setFormData((prev) => ({ ...prev, sectors: newSectors }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      toast({
        title: "Policy saved",
        description: `${formData.title} has been successfully saved.`,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        countryCode: "",
        regionCode: "",
        effectiveDate: "",
        expirationDate: "",
        policyType: "",
        source: "",
        sourceUrl: "",
        sectors: [""],
      })
    } catch (error) {
      toast({
        title: "Error saving policy",
        description: "There was an error saving the policy. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add/Edit Climate Policy</CardTitle>
        <CardDescription>
          Enter details about a climate policy or regulation. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Policy Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policyType">Policy Type *</Label>
              <Select value={formData.policyType} onValueChange={(value) => handleChange("policyType", value)}>
                <SelectTrigger id="policyType">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="law">Law</SelectItem>
                  <SelectItem value="regulation">Regulation</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="plan">Plan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">Country *</Label>
              <Input
                id="countryCode"
                value={formData.countryCode}
                onChange={(e) => handleChange("countryCode", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionCode">Region/State</Label>
              <Input
                id="regionCode"
                value={formData.regionCode}
                onChange={(e) => handleChange("regionCode", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange("effectiveDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleChange("expirationDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL *</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleChange("sourceUrl", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Policy Sectors *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSector}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Sector
              </Button>
            </div>

            {formData.sectors.map((sector, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={sector}
                  onChange={(e) => handleSectorChange(index, e.target.value)}
                  placeholder="Enter sector name"
                  required
                />
                {formData.sectors.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSector(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Policy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PhysicalRiskForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    scenarioId: "",
    variableId: "",
    countryCode: "",
    regionCode: "",
    latitude: "",
    longitude: "",
    timePeriod: "",
    value: "",
    confidence: "",
    dataSource: "",
  })

  // Mock data - in a real app, this would come from an API
  const scenarios = [
    { id: "1", name: "NGFS Current Policies" },
    { id: "2", name: "NGFS Net Zero 2050" },
    { id: "3", name: "NGFS Delayed Transition" },
  ]

  const variables = [
    { id: "1", name: "Temperature Increase" },
    { id: "2", name: "Precipitation Change" },
    { id: "3", name: "Sea Level Rise" },
    { id: "4", name: "Extreme Weather Events" },
  ]

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      toast({
        title: "Physical risk data saved",
        description: "The physical risk data has been successfully saved.",
      })

      // Reset form
      setFormData({
        scenarioId: "",
        variableId: "",
        countryCode: "",
        regionCode: "",
        latitude: "",
        longitude: "",
        timePeriod: "",
        value: "",
        confidence: "",
        dataSource: "",
      })
    } catch (error) {
      toast({
        title: "Error saving data",
        description: "There was an error saving the physical risk data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add/Edit Physical Risk Data</CardTitle>
        <CardDescription>
          Enter details about physical climate risk data. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="scenarioId">Climate Scenario *</Label>
              <Select value={formData.scenarioId} onValueChange={(value) => handleChange("scenarioId", value)}>
                <SelectTrigger id="scenarioId">
                  <SelectValue placeholder="Select climate scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableId">Risk Variable *</Label>
              <Select value={formData.variableId} onValueChange={(value) => handleChange("variableId", value)}>
                <SelectTrigger id="variableId">
                  <SelectValue placeholder="Select risk variable" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id}>
                      {variable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">Country *</Label>
              <Input
                id="countryCode"
                value={formData.countryCode}
                onChange={(e) => handleChange("countryCode", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionCode">Region/State</Label>
              <Input
                id="regionCode"
                value={formData.regionCode}
                onChange={(e) => handleChange("regionCode", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePeriod">Time Period *</Label>
              <Select value={formData.timePeriod} onValueChange={(value) => handleChange("timePeriod", value)}>
                <SelectTrigger id="timePeriod">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2030">2030</SelectItem>
                  <SelectItem value="2050">2050</SelectItem>
                  <SelectItem value="2070">2070</SelectItem>
                  <SelectItem value="2100">2100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleChange("value", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence Level (0-1) *</Label>
              <Input
                id="confidence"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.confidence}
                onChange={(e) => handleChange("confidence", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSource">Data Source *</Label>
              <Input
                id="dataSource"
                value={formData.dataSource}
                onChange={(e) => handleChange("dataSource", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Risk Data
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
