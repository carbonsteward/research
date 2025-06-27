import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, FileCheck, Globe, Leaf, Shield } from "lucide-react"
import ClimateDataVisualization from '@/components/climate-data-visualization';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Climate Data Visualization Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-accent/20">
        <ClimateDataVisualization />
      </section>

      {/* Hero Section - Updated background to match the section above */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-accent/20 to-slate-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Carbon Mitigation Project Feasibility Study Assistant
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Navigate carbon methodologies, assess risks, and determine project feasibility with data-driven insights
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/onboarding">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/methodologies">Explore Methodologies</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Project Assessment
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Our platform provides all the tools you need to evaluate carbon mitigation projects
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Methodology Explorer</CardTitle>
                <FileCheck className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Browse and compare carbon standards and methodologies from leading certification bodies
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Risk Assessment</CardTitle>
                <Shield className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Evaluate physical and transitional climate risks based on project location and type
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Policy Navigator</CardTitle>
                <Globe className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Stay informed about relevant climate policies and regulations in your target region
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Feasibility Reports</CardTitle>
                <BarChart3 className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Generate comprehensive reports with actionable insights for your carbon projects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Certification Guidance</CardTitle>
                <Leaf className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Step-by-step guidance through certification processes and requirements</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Data-Driven Insights</CardTitle>
                <BarChart3 className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Make informed decisions with up-to-date climate data and market intelligence
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Assess Your Project?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Create a profile, input your project details, and get started with your feasibility assessment
              </p>
            </div>
            <Button asChild size="lg" className="mt-4">
              <Link href="/onboarding">
                Start Your Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
