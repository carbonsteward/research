"use client"

import { useState } from "react"
import { EnhancedProfileCard } from "@/components/enhanced-profile-card"
import { EnhancedProjectCard } from "@/components/enhanced-project-card"
import { AnalyticsCard } from "@/components/analytics-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BadgeInfo,
  BarChart3,
  Building2,
  Download,
  FileSpreadsheet,
  Leaf,
  LineChart,
  RefreshCw,
  User
} from "lucide-react"

export default function ComponentsDemo() {
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)

  const handleSelectProfile = (index: number) => {
    setSelectedProfile(index === selectedProfile ? null : index)
  }

  // Sample chart data
  const carbonData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 59 },
    { name: "Mar", value: 80 },
    { name: "Apr", value: 81 },
    { name: "May", value: 56 },
    { name: "Jun", value: 55 },
    { name: "Jul", value: 40 },
  ]

  const energyData = [
    { name: "Jan", value: 120 },
    { name: "Feb", value: 110 },
    { name: "Mar", value: 130 },
    { name: "Apr", value: 105 },
    { name: "May", value: 95 },
    { name: "Jun", value: 85 },
    { name: "Jul", value: 80 },
  ]

  const waterData = [
    { name: "Jan", value: 30 },
    { name: "Feb", value: 25 },
    { name: "Mar", value: 35 },
    { name: "Apr", value: 45 },
    { name: "May", value: 40 },
    { name: "Jun", value: 30 },
    { name: "Jul", value: 28 },
  ]

  // Sample project data
  const sampleProject = {
    id: "project-1",
    name: "Green Energy Initiative",
    type: "Renewable Energy",
    country: "United States",
    status: "In Progress",
    progress: 65,
    methodologies: ["GHG Protocol", "TCFD", "SBTi"],
    risks: {
      physical: "medium",
      transitional: "low"
    },
    lastUpdated: "2025-05-15T10:30:00Z"
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Enhanced UI Components</h1>

      <Tabs defaultValue="profile-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile-cards">Profile Cards</TabsTrigger>
          <TabsTrigger value="project-cards">Project Cards</TabsTrigger>
          <TabsTrigger value="analytics-cards">Analytics Cards</TabsTrigger>
        </TabsList>

        {/* Profile Cards Demo */}
        <TabsContent value="profile-cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnhancedProfileCard
              icon={<User className="h-6 w-6" />}
              title="Professional"
              description="For professional teams managing multiple sustainability projects."
              selected={selectedProfile === 0}
              onClick={() => handleSelectProfile(0)}
              tags={["Teams", "Pro"]}
              infoTooltip="Access to advanced reporting, custom fields, and API."
            />

            <EnhancedProfileCard
              icon={<Building2 className="h-6 w-6" />}
              title="Enterprise"
              description="For large organizations with complex sustainability requirements."
              selected={selectedProfile === 1}
              onClick={() => handleSelectProfile(1)}
              tags={["Enterprise", "Custom"]}
              infoTooltip="Full access to all features plus dedicated support and custom integrations."
            />

            <EnhancedProfileCard
              icon={<Leaf className="h-6 w-6" />}
              title="Climate Action"
              description="For organizations focused specifically on climate initiatives."
              selected={selectedProfile === 2}
              onClick={() => handleSelectProfile(2)}
              tags={["Climate", "Specialized"]}
              infoTooltip="Specialized tools for climate accounting and target setting."
            />
          </div>
        </TabsContent>

        {/* Project Cards Demo */}
        <TabsContent value="project-cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedProjectCard project={sampleProject} />

            <EnhancedProjectCard
              project={{
                ...sampleProject,
                id: "project-2",
                name: "Water Conservation Program",
                type: "Water Management",
                status: "Planning",
                progress: 25,
                methodologies: ["AWS", "CDP Water"],
                risks: {
                  physical: "high",
                  transitional: "medium"
                }
              }}
            />
          </div>
        </TabsContent>

        {/* Analytics Cards Demo */}
        <TabsContent value="analytics-cards">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnalyticsCard
              title="Carbon Emissions"
              value="85.2 tCO2e"
              description="Total carbon emissions for Q2 2025"
              icon={<BarChart3 className="h-5 w-5" />}
              change={{
                value: 12.5,
                trend: "down",
                label: "vs previous period"
              }}
              chartData={carbonData}
              chartColor="hsl(var(--chart-1))"
              additionalInfo="Scope 1 & 2 emissions only"
              actions={[
                { label: "Download CSV", onClick: () => console.log("Download report") },
                { label: "Share", onClick: () => console.log("Share report") },
                { label: "Refresh", onClick: () => console.log("Refresh data") }
              ]}
            />

            <AnalyticsCard
              title="Energy Usage"
              value="1,245 kWh"
              description="Monthly average for Q2 2025"
              icon={<LineChart className="h-5 w-5" />}
              change={{
                value: 3.8,
                trend: "down",
                label: "vs previous period"
              }}
              chartData={energyData}
              chartColor="hsl(var(--chart-2))"
              additionalInfo="15% from renewable sources"
              actions={[
                { label: "Download Report", onClick: () => console.log("Download") },
                { label: "View Details", onClick: () => console.log("View details") }
              ]}
            />

            <AnalyticsCard
              title="Water Usage"
              value="450 m³"
              description="Monthly average for Q2 2025"
              icon={<BadgeInfo className="h-5 w-5" />}
              change={{
                value: 7.2,
                trend: "up",
                label: "vs previous period"
              }}
              chartData={waterData}
              chartColor="hsl(var(--chart-3))"
              additionalInfo="Increased due to facility expansion"
              actions={[
                { label: "Download Report", onClick: () => console.log("Download") },
                { label: "View Details", onClick: () => console.log("View details") }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <AnalyticsCard
              title="Reports Generated"
              value="24"
              description="Last 30 days"
              icon={<FileSpreadsheet className="h-5 w-5" />}
              change={{
                value: 50,
                trend: "up",
                label: "vs previous period"
              }}
            />

            <AnalyticsCard
              title="Data Exports"
              value="37"
              description="Last 30 days"
              icon={<Download className="h-5 w-5" />}
              change={{
                value: 12,
                trend: "up",
                label: "vs previous period"
              }}
            />

            <AnalyticsCard
              title="Data Refreshes"
              value="142"
              description="Last 30 days"
              icon={<RefreshCw className="h-5 w-5" />}
              change={{
                value: 0,
                trend: "neutral",
                label: "vs previous period"
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
