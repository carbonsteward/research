"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Building, Building2, Factory, Leaf, Trees, User, Users } from "lucide-react"
import { ProfileCard } from "@/components/profile-card"

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedProfile && selectedExperience) {
      // In a real app, we would save this to the user's session/profile
      router.push("/project/new")
    }
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to the Carbon Mitigation Assistant</h1>
        <p className="text-gray-500">Tell us about yourself so we can personalize your experience</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">1. Select Your Profile</TabsTrigger>
          <TabsTrigger value="experience">2. Your Experience Level</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCard
              icon={<User className="h-8 w-8" />}
              title="Project Developer"
              description="I develop carbon mitigation projects and need to assess feasibility"
              selected={selectedProfile === "developer"}
              onClick={() => setSelectedProfile("developer")}
            />
            <ProfileCard
              icon={<Users className="h-8 w-8" />}
              title="Investor"
              description="I invest in carbon projects and need to evaluate opportunities"
              selected={selectedProfile === "investor"}
              onClick={() => setSelectedProfile("investor")}
            />
            <ProfileCard
              icon={<Building className="h-8 w-8" />}
              title="Corporate Sustainability"
              description="I work on corporate sustainability initiatives and carbon strategies"
              selected={selectedProfile === "corporate"}
              onClick={() => setSelectedProfile("corporate")}
            />
            <ProfileCard
              icon={<Building2 className="h-8 w-8" />}
              title="Policy Maker"
              description="I work in government or policy and need to understand carbon markets"
              selected={selectedProfile === "policy"}
              onClick={() => setSelectedProfile("policy")}
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => document.querySelector('[data-value="experience"]')?.click()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className={`cursor-pointer transition-all ${
                selectedExperience === "beginner" ? "border-green-500 shadow-md" : ""
              }`}
              onClick={() => setSelectedExperience("beginner")}
            >
              <CardHeader>
                <CardTitle>Beginner</CardTitle>
                <CardDescription>New to carbon projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  I'm just getting started with carbon projects and need guidance on the basics
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedExperience === "intermediate" ? "border-green-500 shadow-md" : ""
              }`}
              onClick={() => setSelectedExperience("intermediate")}
            >
              <CardHeader>
                <CardTitle>Intermediate</CardTitle>
                <CardDescription>Some experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  I have some experience with carbon projects but want to deepen my knowledge
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedExperience === "advanced" ? "border-green-500 shadow-md" : ""
              }`}
              onClick={() => setSelectedExperience("advanced")}
            >
              <CardHeader>
                <CardTitle>Advanced</CardTitle>
                <CardDescription>Experienced professional</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  I'm an experienced professional looking for detailed analysis and advanced features
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => document.querySelector('[data-value="profile"]')?.click()}>
              Back
            </Button>
            <Button onClick={handleContinue} disabled={!selectedProfile || !selectedExperience}>
              Continue to Project Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 pt-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Project Types We Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 border rounded-lg">
            <Trees className="h-6 w-6 mr-3 text-green-600" />
            <span>Forestry & Land Use</span>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <Factory className="h-6 w-6 mr-3 text-green-600" />
            <span>Renewable Energy</span>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <Leaf className="h-6 w-6 mr-3 text-green-600" />
            <span>Agriculture</span>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <Building className="h-6 w-6 mr-3 text-green-600" />
            <span>Energy Efficiency</span>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <Factory className="h-6 w-6 mr-3 text-green-600" />
            <span>Industrial Processes</span>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <Building2 className="h-6 w-6 mr-3 text-green-600" />
            <span>Waste Management</span>
          </div>
        </div>
      </div>
    </div>
  )
}
