"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'
import { CarbonChart } from '@/components/ui/carbon-chart'
import { StatusIndicator } from '@/components/ui/status-indicator'
import {
  Leaf,
  Target,
  BarChart3,
  Shield,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Award
} from 'lucide-react'

export function ModernLanding() {
  const sampleChartData = [
    { label: 'AFOLU', value: 45, color: 'hsl(var(--chart-1))' },
    { label: 'Energy', value: 30, color: 'hsl(var(--chart-2))' },
    { label: 'Waste', value: 15, color: 'hsl(var(--chart-3))' },
    { label: 'Transport', value: 10, color: 'hsl(var(--chart-4))' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
                Carbon Project
                <span className="block carbon-gradient bg-clip-text text-transparent">
                  Development Platform
                </span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto scientific-text">
                Streamline your carbon mitigation projects with AI-powered feasibility studies, 
                real-time monitoring, and comprehensive compliance tracking.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="carbon-gradient text-white border-0 px-8 py-4 text-lg">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Driving Global Impact
            </h2>
            <p className="text-slate-600 scientific-text max-w-2xl mx-auto">
              Our platform has facilitated millions of carbon credits and supported 
              sustainable development across the globe.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Carbon Credits Issued"
              value="2.4M"
              subtitle="tCO2e across all projects"
              icon={Leaf}
              variant="carbon"
              trend={{
                value: 23.5,
                label: "YoY growth",
                direction: "up"
              }}
            />
            <MetricCard
              title="Active Projects"
              value="156"
              subtitle="Across 25 countries"
              icon={Target}
              variant="accent"
              trend={{
                value: 18.2,
                label: "this quarter",
                direction: "up"
              }}
            />
            <MetricCard
              title="Total Investment"
              value="$45M"
              subtitle="Deployed capital"
              icon={TrendingUp}
              variant="success"
              trend={{
                value: 12.8,
                label: "portfolio growth",
                direction: "up"
              }}
            />
            <MetricCard
              title="Compliance Rate"
              value="99.2%"
              subtitle="Verification success"
              icon={Shield}
              variant="default"
              trend={{
                value: 1.2,
                label: "improvement",
                direction: "up"
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Complete Carbon Project Lifecycle
            </h2>
            <p className="text-slate-600 scientific-text max-w-2xl mx-auto">
              From initial feasibility studies to credit issuance and beyond, 
              manage every aspect of your carbon projects in one platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="p-6 border-slate-200/60 scientific-shadow-lg hover-lift">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Target className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Project Development
                      </h3>
                    </div>
                    <p className="text-slate-600 scientific-text">
                      AI-powered feasibility studies, methodology recommendations, 
                      and risk assessments to optimize your project design.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Smart methodology matching
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Climate risk analysis
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Credit estimation tools
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6 border-slate-200/60 scientific-shadow-lg hover-lift">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Monitoring & Verification
                      </h3>
                    </div>
                    <p className="text-slate-600 scientific-text">
                      Real-time satellite monitoring, automated reporting, 
                      and streamlined verification processes.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Satellite data integration
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Automated MRV reporting
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Third-party integration
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <CarbonChart
                title="Project Distribution"
                subtitle="By sector and performance"
                data={sampleChartData}
                type="donut"
                height={300}
                className="h-full"
              />
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 border-slate-200/60 scientific-shadow-lg hover-lift">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Compliance & Standards
                      </h3>
                    </div>
                    <p className="text-slate-600 scientific-text">
                      Comprehensive compliance tracking across all major 
                      carbon standards and regulatory frameworks.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        VCS, Gold Standard, ACR
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        CORSIA compliance
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Article 6.2 & 6.4 support
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6 border-slate-200/60 scientific-shadow-lg hover-lift">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Users className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Collaboration & Insights
                      </h3>
                    </div>
                    <p className="text-slate-600 scientific-text">
                      Team collaboration tools, portfolio analytics, 
                      and market intelligence for informed decisions.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Multi-user collaboration
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Portfolio analytics
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Market intelligence
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Status Examples */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Real-Time Project Tracking
            </h2>
            <p className="text-slate-600 scientific-text">
              Monitor project status and compliance in real-time with our 
              intelligent status indicators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center border-slate-200/60 scientific-shadow-lg">
              <CardContent className="p-0 space-y-4">
                <StatusIndicator status="completed" label="Project Completed" />
                <p className="text-sm text-slate-600">
                  All verification requirements met, credits issued successfully
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center border-slate-200/60 scientific-shadow-lg">
              <CardContent className="p-0 space-y-4">
                <StatusIndicator status="in_progress" label="Implementation" />
                <p className="text-sm text-slate-600">
                  Project activities underway, monitoring systems active
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center border-slate-200/60 scientific-shadow-lg">
              <CardContent className="p-0 space-y-4">
                <StatusIndicator status="warning" label="Attention Required" />
                <p className="text-sm text-slate-600">
                  Minor compliance issues detected, review recommended
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">
              Ready to Scale Your Carbon Impact?
            </h2>
            <p className="text-xl text-slate-600 scientific-text">
              Join leading organizations using ChatPDD to develop, monitor, 
              and optimize their carbon mitigation projects.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="carbon-gradient text-white border-0 px-8 py-4 text-lg">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              Schedule Demo
            </Button>
          </div>
          
          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              ISO 14064 Certified
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Global Standards
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}