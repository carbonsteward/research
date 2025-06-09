import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, FileCheck, Globe, Leaf, Shield, Star, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">ChatPDD</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/methodologies" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Methodologies
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Dashboard
              </Link>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
          <div className="container max-w-[1200px] mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badge */}
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Trusted by 500+ Carbon Project Developers
                </span>
              </div>

              {/* Main Headline - Consistent Size */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                Turn Climate Action Into Certified Reality
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                The complete platform for carbon project success - from feasibility analysis to certification.
                Navigate methodologies, assess risks, and accelerate your path to impact.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white group">
                  <Link href="/project/new" className="flex items-center">
                    Start Free Assessment
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Link href="/methodologies">
                    Explore Methodologies
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Consistent Spacing */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">1,247</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">47+</div>
                <div className="text-sm text-gray-600">Methodologies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">94%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">89</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Consistent Layout */}
        <section className="py-24 bg-white">
          <div className="container max-w-[1200px] mx-auto px-6">
            {/* Section Header - Consistent Typography */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
                Comprehensive Project Assessment
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our platform provides all the tools you need to evaluate carbon mitigation projects with confidence
              </p>
            </div>

            {/* Feature Grid - Consistent Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Methodology Explorer</CardTitle>
                    <FileCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Browse and compare carbon standards and methodologies from leading certification bodies
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Risk Assessment</CardTitle>
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Evaluate physical and transitional climate risks based on project location and type
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Policy Navigator</CardTitle>
                    <Globe className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Stay informed about relevant climate policies and regulations in your target region
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Feasibility Reports</CardTitle>
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Generate comprehensive reports with actionable insights for your carbon projects
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Certification Guidance</CardTitle>
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Step-by-step guidance through certification processes and requirements
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Data-Driven Insights</CardTitle>
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Make informed decisions with up-to-date climate data and market intelligence
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 bg-gray-50">
          <div className="container max-w-[1200px] mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4">
                Customer Success Stories
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
                Trusted by Industry Leaders
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                See how organizations worldwide are accelerating their carbon projects with ChatPDD
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "ChatPDD reduced our project assessment timeline from 8 months to just 3 weeks.
                    The methodology recommendations were spot-on."
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Head of Carbon Projects, EcoForest Solutions</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "The risk assessment feature helped us avoid a $2M investment in a high-risk region.
                    Incredible value."
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                    <div className="text-sm text-gray-600">Project Developer, Verde Impact</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "Finally, a platform that speaks our language. The methodology database is
                    comprehensive and up-to-date."
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Aisha Patel</div>
                    <div className="text-sm text-gray-600">Climate Strategy Lead, Global Carbon Initiative</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-24 bg-white">
          <div className="container max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 mb-4">
                Proven Results
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
                Why Leading Projects Choose ChatPDD
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Data-driven insights that accelerate your project timeline and increase certification success rates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">75% Faster</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Assessment</h3>
                <p className="text-gray-600">
                  Reduce assessment time from months to weeks with AI-powered methodology matching
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">94% Success</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Certification Rate</h3>
                <p className="text-gray-600">
                  Projects using our platform achieve significantly higher certification approval rates
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$250K Saved</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Average Cost Reduction</h3>
                <p className="text-gray-600">
                  Prevent costly methodology changes and delays with upfront risk assessment
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
          <div className="container max-w-[1200px] mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Accelerate Your Carbon Project Success?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Join 500+ project developers who have transformed their feasibility analysis process.
                Get started today with our comprehensive methodology database and AI-powered insights.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 group">
                  <Link href="/project/new" className="flex items-center">
                    Start Free Assessment Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Watch 2-Minute Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-emerald-500" />
                <span className="text-lg font-bold">ChatPDD</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Accelerating carbon project success through AI-powered feasibility analysis
                and comprehensive methodology intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="/methodologies" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Methodologies
                </Link>
                <Link href="/project/new" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Project Assessment
                </Link>
                <Link href="/dashboard" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="/docs" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
                <Link href="/case-studies" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Case Studies
                </Link>
                <Link href="/support" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/contact" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/privacy" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 ChatPDD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
