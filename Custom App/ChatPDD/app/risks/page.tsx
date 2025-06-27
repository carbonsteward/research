"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ArrowDownToLine, ChevronDown, ChevronUp, FileText, Info, Leaf, Thermometer } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Mock data - in a real app, this would come from an API
const mockTransitionalRisks = {
  policies: [
    {
      id: "1",
      title: "Carbon Tax Implementation",
      description: "New carbon tax of $50 per ton CO2e to be implemented in phases starting 2024.",
      policyType: "Tax",
      effectiveDate: "2024-01-01",
      expirationDate: null,
      source: "Ministry of Environment",
      sourceUrl: "https://example.gov/carbon-tax",
      sectors: ["Energy", "Industry", "Transport"],
      impacts: [
        {
          id: "1",
          impactType: "Cost Increase",
          impactLevel: "High",
          description: "Will significantly increase operational costs for fossil fuel intensive operations.",
        },
      ],
      riskLevel: "high",
    },
    {
      id: "2",
      title: "Renewable Energy Mandate",
      description: "Requirement for 50% renewable energy in electricity generation by 2030.",
      policyType: "Regulation",
      effectiveDate: "2023-06-15",
      expirationDate: null,
      source: "Energy Regulatory Commission",
      sourceUrl: "https://example.gov/renewable-mandate",
      sectors: ["Energy"],
      impacts: [
        {
          id: "2",
          impactType: "Market Shift",
          impactLevel: "Medium",
          description: "Will create market advantages for renewable energy projects.",
        },
      ],
      riskLevel: "medium",
    },
    {
      id: "3",
      title: "Deforestation Ban in Protected Areas",
      description: "Complete ban on deforestation activities in nationally protected forest areas.",
      policyType: "Law",
      effectiveDate: "2022-03-10",
      expirationDate: null,
      source: "Forest Conservation Agency",
      sourceUrl: "https://example.gov/deforestation-ban",
      sectors: ["Forestry", "Agriculture"],
      impacts: [
        {
          id: "3",
          impactType: "Operational Restriction",
          impactLevel: "High",
          description: "Prevents any forest conversion projects in protected areas.",
        },
      ],
      riskLevel: "high",
    },
  ],
  legalFrameworks: [
    {
      id: "1",
      country: "US",
      frameworkType: "National Climate Law",
      description: "Comprehensive climate legislation establishing emissions targets and regulatory framework.",
      relevanceToCarbon: "High - establishes legal basis for carbon markets and offset mechanisms.",
    },
  ],
  summary: {
    highRiskCount: 2,
    mediumRiskCount: 1,
    lowRiskCount: 0,
  },
}

const mockPhysicalRisks = {
  scenarios: [
    {
      scenario: {
        id: "1",
        name: "NGFS Current Policies",
        description: "Scenario based on currently implemented policies, leading to ~3°C warming by 2100.",
        warmingLevel: 3.0,
        timeHorizon: "2100",
      },
      variables: [
        {
          variable: {
            id: "1",
            name: "Temperature Increase",
            unit: "°C",
            category: "Temperature",
          },
          dataPoints: [
            { id: "1", timePeriod: "2030", value: 1.2, confidence: 0.8 },
            { id: "2", timePeriod: "2050", value: 2.1, confidence: 0.7 },
            { id: "3", timePeriod: "2100", value: 3.0, confidence: 0.6 },
          ],
          impacts: [
            {
              sector: "Agriculture",
              impact_level: "High",
              description: "Reduced crop yields, changing growing seasons, increased water stress.",
              adaptation_measures: "Drought-resistant crops, improved irrigation, crop diversification.",
            },
            {
              sector: "Forestry",
              impact_level: "High",
              description: "Increased wildfire risk, pest outbreaks, shifting species ranges.",
              adaptation_measures: "Fire management, diverse species planting, monitoring programs.",
            },
          ],
        },
        {
          variable: {
            id: "2",
            name: "Precipitation Change",
            unit: "%",
            category: "Precipitation",
          },
          dataPoints: [
            { id: "4", timePeriod: "2030", value: -5, confidence: 0.7 },
            { id: "5", timePeriod: "2050", value: -12, confidence: 0.6 },
            { id: "6", timePeriod: "2100", value: -20, confidence: 0.5 },
          ],
          impacts: [
            {
              sector: "Agriculture",
              impact_level: "High",
              description: "Water scarcity, drought conditions, reduced soil moisture.",
              adaptation_measures: "Water harvesting, efficient irrigation, soil management.",
            },
          ],
        },
      ],
    },
    {
      scenario: {
        id: "2",
        name: "NGFS Net Zero 2050",
        description: "Ambitious scenario limiting warming to 1.5°C through rapid decarbonization.",
        warmingLevel: 1.5,
        timeHorizon: "2100",
      },
      variables: [
        {
          variable: {
            id: "1",
            name: "Temperature Increase",
            unit: "°C",
            category: "Temperature",
          },
          dataPoints: [
            { id: "7", timePeriod: "2030", value: 1.0, confidence: 0.8 },
            { id: "8", timePeriod: "2050", value: 1.3, confidence: 0.7 },
            { id: "9", timePeriod: "2100", value: 1.5, confidence: 0.6 },
          ],
          impacts: [
            {
              sector: "Agriculture",
              impact_level: "Medium",
              description: "Some crop yield impacts, manageable with adaptation.",
              adaptation_measures: "Improved crop varieties, adjusted planting schedules.",
            },
          ],
        },
      ],
    },
  ],
  summary: {
    location: {
      countryCode: "US",
      regionCode: "CA",
      coordinates: null,
    },
    riskLevels: {
      "1": {
        Temperature: "high",
        Precipitation: "high",
        "Sea Level": "medium",
        "Extreme Events": "high",
      },
      "2": {
        Temperature: "medium",
        Precipitation: "medium",
        "Sea Level": "low",
        "Extreme Events": "medium",
      },
    },
  },
}

export default function RisksPage() {
  const searchParams = useSearchParams()
  const methodologyId = searchParams.get("methodologyId")
  const countryCode = searchParams.get("countryCode") || "US"
  const regionCode = searchParams.get("regionCode")

  const [loading, setLoading] = useState(true)
  const [transitionalRisks, setTransitionalRisks] = useState<any>(null)
  const [physicalRisks, setPhysicalRisks] = useState<any>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("2050")

  useEffect(() => {
    // In a real app, this would be API calls
    // const fetchTransitionalRisks = async () => {
    //   const response = await fetch(
    //     `/api/risks/transitional?countryCode=${countryCode}${methodologyId ? `&methodologyId=${methodologyId}` : ''}`
    //   );
    //   return response.json();
    // };

    // const fetchPhysicalRisks = async () => {
    //   const response = await fetch(
    //     `/api/risks/physical?countryCode=${countryCode}${regionCode ? `&regionCode=${regionCode}` : ''}`
    //   );
    //   return response.json();
    // };

    // Promise.all([fetchTransitionalRisks(), fetchPhysicalRisks()])
    //   .then(([transitionalData, physicalData]) => {
    //     setTransitionalRisks(transitionalData.transitionalRisks);
    //     setPhysicalRisks(physicalData.physicalRisks);
    //     if (physicalData.physicalRisks.scenarios.length > 0) {
    //       setSelectedScenario(physicalData.physicalRisks.scenarios[0].scenario.id);
    //     }
    //   })
    //   .catch(error => console.error('Error fetching risks:', error))
    //   .finally(() => setLoading(false));

    // Simulate API call with mock data
    const timer = setTimeout(() => {
      setTransitionalRisks(mockTransitionalRisks)
      setPhysicalRisks(mockPhysicalRisks)
      if (mockPhysicalRisks.scenarios.length > 0) {
        setSelectedScenario(mockPhysicalRisks.scenarios[0].scenario.id)
      }
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [countryCode, regionCode, methodologyId])

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getSelectedScenarioData = () => {
    if (!physicalRisks || !selectedScenario) return null
    return physicalRisks.scenarios.find((s: any) => s.scenario.id === selectedScenario)
  }

  const getDataPointForTimePeriod = (dataPoints: any[], timePeriod: string) => {
    return dataPoints.find((dp) => dp.timePeriod === timePeriod) || null
  }

  const downloadRiskReport = () => {
    // In a real app, this would generate and download a PDF report
    alert("In a real application, this would generate and download a comprehensive risk report PDF.")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Climate Risk Assessment</h1>
          <p className="text-gray-600">
            For {countryCode}
            {regionCode ? `, ${regionCode}` : ""}
            {methodologyId ? " - Filtered for selected methodology" : ""}
          </p>
        </div>
        <Button onClick={downloadRiskReport}>
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Download Risk Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Risk Summary</CardTitle>
              <CardDescription>Overview of climate risks for your project location</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Risk Assessment</AlertTitle>
                    <AlertDescription>
                      This assessment is based on climate data for {countryCode}
                      {regionCode ? `, ${regionCode}` : ""} and includes both transitional (policy & legal) and physical
                      climate risks.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-red-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                          <span className="text-red-600">High Risk Policies</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-red-600">{transitionalRisks.summary.highRiskCount}</p>
                        <p className="text-sm text-gray-600">Policies that may significantly impact your project</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                          <span className="text-amber-600">Medium Risk Policies</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-amber-600">{transitionalRisks.summary.mediumRiskCount}</p>
                        <p className="text-sm text-gray-600">Policies with moderate potential impact</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Thermometer className="mr-2 h-4 w-4 text-blue-600" />
                          <span className="text-blue-600">Temperature Risk</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-blue-600">
                          {physicalRisks.summary.riskLevels["1"].Temperature === "high"
                            ? "High"
                            : physicalRisks.summary.riskLevels["1"].Temperature === "medium"
                              ? "Medium"
                              : "Low"}
                        </p>
                        <p className="text-sm text-gray-600">Based on NGFS Current Policies scenario</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Leaf className="mr-2 h-4 w-4 text-green-600" />
                          <span className="text-green-600">Project Viability</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">
                          {transitionalRisks.summary.highRiskCount > 2 ? "At Risk" : "Viable"}
                        </p>
                        <p className="text-sm text-gray-600">Overall assessment based on combined risks</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="transitional" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transitional">Transitional Risks</TabsTrigger>
              <TabsTrigger value="physical">Physical Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="transitional">
              <Card>
                <CardHeader>
                  <CardTitle>Policy & Legal Risks</CardTitle>
                  <CardDescription>
                    Climate-related policies and regulations that may impact your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {transitionalRisks.policies.map((policy: any) => (
                        <AccordionItem
                          key={policy.id}
                          value={policy.id}
                          className="border rounded-lg p-0 overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-2 hover:no-underline">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left">
                              <div>
                                <h3 className="font-medium text-lg">{policy.title}</h3>
                                <p className="text-sm text-gray-500">{policy.policyType}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-2 md:mt-0">
                                <Badge className={getRiskBadgeColor(policy.riskLevel)}>
                                  {policy.riskLevel.charAt(0).toUpperCase() + policy.riskLevel.slice(1)} Risk
                                </Badge>
                                <Badge variant="outline">
                                  Effective: {new Date(policy.effectiveDate).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <p>{policy.description}</p>

                              <div>
                                <h4 className="font-medium mb-2">Sectors Affected</h4>
                                <div className="flex flex-wrap gap-2">
                                  {policy.sectors.map((sector: string) => (
                                    <Badge key={sector} variant="secondary">
                                      {sector}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Potential Impacts</h4>
                                <div className="space-y-2">
                                  {policy.impacts.map((impact: any) => (
                                    <Alert key={impact.id}>
                                      <AlertTitle className="flex items-center">
                                        {impact.impactType}
                                        <Badge className={`ml-2 ${getRiskBadgeColor(impact.impactLevel)}`}>
                                          {impact.impactLevel} Impact
                                        </Badge>
                                      </AlertTitle>
                                      <AlertDescription>{impact.description}</AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">Source: {policy.source}</p>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Source
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="physical">
              <Card>
                <CardHeader>
                  <CardTitle>Physical Climate Risks</CardTitle>
                  <CardDescription>Projected physical climate changes that may impact your project</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-1/2">
                          <Label htmlFor="scenario">Climate Scenario</Label>
                          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                            <SelectTrigger id="scenario">
                              <SelectValue placeholder="Select scenario" />
                            </SelectTrigger>
                            <SelectContent>
                              {physicalRisks.scenarios.map((s: any) => (
                                <SelectItem key={s.scenario.id} value={s.scenario.id}>
                                  {s.scenario.name} ({s.scenario.warmingLevel}°C)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-full md:w-1/2">
                          <Label htmlFor="timePeriod">Time Period</Label>
                          <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                            <SelectTrigger id="timePeriod">
                              <SelectValue placeholder="Select time period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2030">2030</SelectItem>
                              <SelectItem value="2050">2050</SelectItem>
                              <SelectItem value="2100">2100</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {getSelectedScenarioData() && (
                        <div className="space-y-6">
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>{getSelectedScenarioData().scenario.name}</AlertTitle>
                            <AlertDescription>{getSelectedScenarioData().scenario.description}</AlertDescription>
                          </Alert>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getSelectedScenarioData().variables.map((variable: any) => {
                              const dataPoint = getDataPointForTimePeriod(variable.dataPoints, selectedTimePeriod)
                              if (!dataPoint) return null

                              return (
                                <Card key={variable.variable.id} className="overflow-hidden">
                                  <CardHeader className="bg-gray-50">
                                    <CardTitle className="text-lg">{variable.variable.name}</CardTitle>
                                    <CardDescription>
                                      {variable.variable.category} | {variable.variable.unit}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <p className="text-3xl font-bold">
                                          {dataPoint.value > 0 ? "+" : ""}
                                          {dataPoint.value} {variable.variable.unit}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          By {dataPoint.timePeriod} | Confidence:{" "}
                                          {Math.round(dataPoint.confidence * 100)}%
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-center">
                                        {dataPoint.value > 0 ? (
                                          <ChevronUp className="h-8 w-8 text-red-500" />
                                        ) : (
                                          <ChevronDown className="h-8 w-8 text-blue-500" />
                                        )}
                                        <Badge
                                          className={
                                            Math.abs(dataPoint.value) > 2
                                              ? getRiskBadgeColor("high")
                                              : Math.abs(dataPoint.value) > 1
                                                ? getRiskBadgeColor("medium")
                                                : getRiskBadgeColor("low")
                                          }
                                        >
                                          {Math.abs(dataPoint.value) > 2
                                            ? "High"
                                            : Math.abs(dataPoint.value) > 1
                                              ? "Medium"
                                              : "Low"}{" "}
                                          Risk
                                        </Badge>
                                      </div>
                                    </div>

                                    {variable.impacts.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Potential Impacts</h4>
                                        <Accordion type="single" collapsible>
                                          {variable.impacts.map((impact: any, index: number) => (
                                            <AccordionItem key={index} value={`${variable.variable.id}-${index}`}>
                                              <AccordionTrigger>Impact on {impact.sector}</AccordionTrigger>
                                              <AccordionContent>
                                                <div className="space-y-2">
                                                  <p>{impact.description}</p>
                                                  <div>
                                                    <h5 className="font-medium text-sm">Adaptation Measures</h5>
                                                    <p className="text-sm">{impact.adaptation_measures}</p>
                                                  </div>
                                                </div>
                                              </AccordionContent>
                                            </AccordionItem>
                                          ))}
                                        </Accordion>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
