"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Check, Download, FileText, Info, LinkIcon } from "lucide-react"

// Mock data for demonstration
const methodology = {
  id: "1",
  name: "VM0007: REDD+ Methodology Framework",
  standard: "Verra VCS",
  standardLogo: "/verra-logo.png",
  type: "Forestry",
  category: "REDD+",
  description:
    "Methodology for Reduced Emissions from Deforestation and Forest Degradation (REDD+) and other forest carbon activities. This methodology provides procedures for estimating reductions in GHG emissions or increases in carbon sequestration from avoiding unplanned deforestation and forest degradation.",
  corsiaApproved: true,
  icroaApproved: true,
  lastUpdated: "2022-06-15",
  version: "4.0",
  documentationUrl: "#",
  applicability: [
    "Project activities that reduce emissions from unplanned deforestation and forest degradation",
    "Project activities that reduce emissions from planned deforestation",
    "Project activities that reduce emissions from forest degradation",
    "Project activities that include carbon stock enhancement",
  ],
  requirements: [
    {
      id: "1",
      section: "Baseline Scenario",
      description:
        "The baseline scenario must represent the most likely land-use change in the absence of the project.",
      required: true,
    },
    {
      id: "2",
      section: "Additionality",
      description:
        "Project proponents must demonstrate that the project activities would not have occurred in the absence of the project.",
      required: true,
    },
    {
      id: "3",
      section: "Leakage",
      description: "Project proponents must identify potential sources of leakage and implement mitigation measures.",
      required: true,
    },
    {
      id: "4",
      section: "Monitoring",
      description:
        "Project proponents must establish a monitoring plan that includes monitoring of carbon stocks, project emissions, and leakage.",
      required: true,
    },
  ],
  certificationSteps: [
    {
      id: "1",
      step: "Project Description",
      description: "Develop a detailed project description document (PD) using the VCS template.",
      estimatedTime: "2-3 months",
      estimatedCost: "$20,000 - $50,000",
    },
    {
      id: "2",
      step: "Validation",
      description: "Engage a VCS-approved validation/verification body (VVB) to validate the project description.",
      estimatedTime: "3-6 months",
      estimatedCost: "$30,000 - $70,000",
    },
    {
      id: "3",
      step: "Registration",
      description: "Register the validated project with the VCS registry.",
      estimatedTime: "1-2 months",
      estimatedCost: "$10,000 - $20,000",
    },
    {
      id: "4",
      step: "Monitoring",
      description: "Implement the monitoring plan and collect data on project performance.",
      estimatedTime: "Ongoing",
      estimatedCost: "$15,000 - $40,000 per year",
    },
    {
      id: "5",
      step: "Verification",
      description: "Engage a VVB to verify the monitoring results and issue a verification report.",
      estimatedTime: "2-4 months",
      estimatedCost: "$25,000 - $60,000",
    },
    {
      id: "6",
      step: "Issuance",
      description: "Request issuance of Verified Carbon Units (VCUs) based on the verification report.",
      estimatedTime: "1-2 months",
      estimatedCost: "Registration fee + issuance fee (percentage of credits)",
    },
  ],
  successFactors: [
    "Strong baseline data and historical deforestation analysis",
    "Clear land tenure and community engagement",
    "Robust monitoring systems and technology",
    "Effective leakage management strategies",
    "Sustainable financing mechanisms",
  ],
  caseStudies: [
    {
      id: "1",
      name: "Rimba Raya Biodiversity Reserve",
      location: "Indonesia",
      description:
        "The Rimba Raya Biodiversity Reserve project protects nearly 65,000 hectares of peat swamp forest in Central Kalimantan, Indonesia. The project prevents the emission of approximately 130 million tonnes of carbon dioxide equivalent over its 30-year lifetime.",
      results: "Issued over 30 million VCUs since project inception",
    },
    {
      id: "2",
      name: "Keo Seima Wildlife Sanctuary",
      location: "Cambodia",
      description:
        "The Keo Seima Wildlife Sanctuary REDD+ project protects 166,983 hectares of forest in eastern Cambodia. The project reduces emissions from deforestation while conserving biodiversity and supporting local communities.",
      results: "Issued approximately 14 million VCUs since project inception",
    },
  ],
}

export default function MethodologyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/methodologies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Methodologies
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{methodology.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge>{methodology.standard}</Badge>
              <Badge variant="outline">{methodology.type}</Badge>
              <Badge variant="outline">{methodology.category}</Badge>
              {methodology.corsiaApproved && <Badge className="bg-blue-100 text-blue-800">CORSIA Approved</Badge>}
              {methodology.icroaApproved && <Badge className="bg-green-100 text-green-800">ICROA Approved</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={methodology.documentationUrl} target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                Documentation
              </Link>
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="certification">Certification</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Methodology Overview</CardTitle>
                  <CardDescription>Key information about {methodology.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={methodology.standardLogo || "/placeholder.svg"}
                      alt={`${methodology.standard} logo`}
                      className="h-12 object-contain"
                    />
                    <div>
                      <h3 className="font-medium">{methodology.standard}</h3>
                      <p className="text-sm text-gray-500">Version {methodology.version}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-700">{methodology.description}</p>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Last Updated</AlertTitle>
                    <AlertDescription>
                      This methodology was last updated on{" "}
                      {new Date(methodology.lastUpdated).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="font-medium mb-2">Applicability Conditions</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {methodology.applicability.map((condition, index) => (
                        <li key={index} className="text-gray-700">
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Success Factors</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {methodology.successFactors.map((factor, index) => (
                        <li key={index} className="text-gray-700">
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements">
              <Card>
                <CardHeader>
                  <CardTitle>Methodology Requirements</CardTitle>
                  <CardDescription>Key requirements and documentation needed for {methodology.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {methodology.requirements.map((req) => (
                      <AccordionItem key={req.id} value={req.id}>
                        <AccordionTrigger>
                          <div className="flex items-center">
                            <span>{req.section}</span>
                            {req.required && <Badge className="ml-2 bg-red-100 text-red-800">Required</Badge>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700 mb-4">{req.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            <Link href="#" className="hover:underline">
                              View detailed guidance
                            </Link>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certification">
              <Card>
                <CardHeader>
                  <CardTitle>Certification Process</CardTitle>
                  <CardDescription>Step-by-step guide to certification under {methodology.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {methodology.certificationSteps.map((step, index) => (
                      <div key={step.id} className="relative pl-8 pb-8">
                        {index < methodology.certificationSteps.length - 1 && (
                          <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-gray-200" />
                        )}
                        <div className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                          {index + 1}
                        </div>
                        <div className="pt-1">
                          <h3 className="font-medium text-lg mb-2">{step.step}</h3>
                          <p className="text-gray-700 mb-4">{step.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-500">Estimated Time</p>
                              <p className="font-medium">{step.estimatedTime}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                              <p className="font-medium">{step.estimatedCost}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="case-studies">
              <Card>
                <CardHeader>
                  <CardTitle>Case Studies</CardTitle>
                  <CardDescription>Real-world examples of projects using {methodology.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {methodology.caseStudies.map((caseStudy) => (
                    <Card key={caseStudy.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{caseStudy.name}</CardTitle>
                        <CardDescription>{caseStudy.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{caseStudy.description}</p>
                        <div className="bg-green-50 p-4 rounded-md">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="font-medium">Results</h4>
                          </div>
                          <p className="mt-1 text-gray-700">{caseStudy.results}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Methodology Suitability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Match</span>
                  <Badge className="bg-green-100 text-green-800">95% Match</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Project Type</span>
                    <Badge variant="outline" className="bg-green-50">
                      <Check className="mr-1 h-3 w-3 text-green-600" />
                      Compatible
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Geography</span>
                    <Badge variant="outline" className="bg-green-50">
                      <Check className="mr-1 h-3 w-3 text-green-600" />
                      Compatible
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Project Scale</span>
                    <Badge variant="outline" className="bg-green-50">
                      <Check className="mr-1 h-3 w-3 text-green-600" />
                      Compatible
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Data Requirements</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-800">
                      Medium Complexity
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply to Your Project</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Methodologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <Link href="#" className="font-medium hover:underline">
                    VM0006: Carbon Accounting for Mosaic REDD
                  </Link>
                  <p className="text-sm text-gray-500">Verra VCS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <Link href="#" className="font-medium hover:underline">
                    VM0009: Avoided Deforestation
                  </Link>
                  <p className="text-sm text-gray-500">Verra VCS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <Link href="#" className="font-medium hover:underline">
                    AR-ACM0003: Afforestation and Reforestation
                  </Link>
                  <p className="text-sm text-gray-500">CDM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
