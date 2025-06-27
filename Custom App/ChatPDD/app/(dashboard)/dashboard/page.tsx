"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowRight, BarChart3, FileText, Globe, Leaf, MapPin, PlusCircle, Settings, Shield } from "lucide-react"
import { AIStatusIndicator } from "@/components/ai-status-indicator"
import { ProjectCard } from "@/components/project-card"
import { RecommendedMethodology } from "@/components/recommended-methodology"
import { GeoSpyDashboardWidget } from "@/components/geospy-dashboard-widget"
import { GeoSpyABTestWidget, GeoSpyBannerWidget, GeoSpyFloatingWidget } from "@/components/geospy-ab-test-widgets"
import { useGeoSpyABTesting } from "@/hooks/use-ab-testing"

// Mock data for demonstration
const projects = [
  {
    id: "1",
    name: "Reforestation Project - Amazon Basin",
    type: "Forestry & Land Use",
    country: "Brazil",
    status: "In Progress",
    progress: 65,
    methodologies: ["Verra VCS VM0007", "CCB Standards"],
    risks: {
      physical: "medium",
      transitional: "high",
    },
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Solar Farm Development",
    type: "Renewable Energy",
    country: "Kenya",
    status: "Planning",
    progress: 25,
    methodologies: ["Gold Standard GS-RE"],
    risks: {
      physical: "low",
      transitional: "medium",
    },
    lastUpdated: "2023-05-10T14:45:00Z",
  },
]

const recommendedMethodologies = [
  {
    id: "1",
    name: "VM0007: REDD+ Methodology Framework",
    standard: "Verra VCS",
    match: 95,
    description:
      "Methodology for Reduced Emissions from Deforestation and Forest Degradation (REDD+) and other forest carbon activities.",
  },
  {
    id: "2",
    name: "AR-ACM0003: Afforestation and reforestation of lands except wetlands",
    standard: "CDM",
    match: 87,
    description:
      "Methodology for afforestation and reforestation project activities implemented on lands other than wetlands.",
  },
  {
    id: "3",
    name: "VM0006: Carbon Accounting for Mosaic and Landscape-scale REDD",
    standard: "Verra VCS",
    match: 82,
    description: "Methodology for carbon accounting from mosaic and landscape-scale REDD projects.",
  },
]

export default function DashboardPage() {
  // A/B testing hook would be used here in a client component
  // For now, we'll use the original widget but the AB test components are ready

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-500">Manage your carbon mitigation projects</p>
            <AIStatusIndicator />
          </div>
        </div>
        <Button asChild>
          <Link href="/project/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Projects</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {projects.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 mb-4">You don't have any active projects yet</p>
                    <Button asChild>
                      <Link href="/project/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">You don't have any completed projects</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archived">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">You don't have any archived projects</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Leaf className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Project Created: Reforestation Project - Amazon Basin</p>
                      <p className="text-sm text-gray-500">May 15, 2023</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Risk Assessment Completed: Solar Farm Development</p>
                      <p className="text-sm text-gray-500">May 10, 2023</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">New Policy Alert: Carbon Tax Implementation in Brazil</p>
                      <p className="text-sm text-gray-500">May 5, 2023</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {/* GeoSpy AI Widget - Prominent placement */}
          <GeoSpyDashboardWidget />

          <Card>
            <CardHeader>
              <CardTitle>Recommended Methodologies</CardTitle>
              <CardDescription>Based on your project profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedMethodologies.map((methodology) => (
                <RecommendedMethodology key={methodology.id} methodology={methodology} />
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/methodologies">
                  View All Methodologies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/project/geospy">
                  <MapPin className="mr-2 h-4 w-4" />
                  Location Intelligence
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/risks">
                  <Shield className="mr-2 h-4 w-4" />
                  Risk Assessment
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/methodologies">
                  <FileText className="mr-2 h-4 w-4" />
                  Methodology Explorer
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/policies">
                  <Globe className="mr-2 h-4 w-4" />
                  Policy Navigator
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
