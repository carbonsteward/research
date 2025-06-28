"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MetricCard } from '@/components/ui/metric-card'
import { CarbonChart } from '@/components/ui/carbon-chart'
import { ProjectStatus, RiskLevel } from '@/components/ui/status-indicator'
import {
  Leaf,
  TrendingUp,
  DollarSign,
  Target,
  Globe,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  Zap,
  Calendar,
  MapPin,
  Users
} from 'lucide-react'

interface Project {
  id: string
  name: string
  type: 'AFOLU' | 'ENERGY' | 'WASTE' | 'TRANSPORT' | 'MANUFACTURING' | 'BUILDINGS'
  status: 'development' | 'validation' | 'registered' | 'implementation' | 'monitoring' | 'completed'
  country: string
  region?: string
  methodology: {
    id: string
    name: string
    standard: string
  }
  timeline: {
    startDate: string
    endDate: string
    progress: number
  }
  credits: {
    estimated: number
    issued: number
    projected: number
  }
  financial: {
    budget: number
    spent: number
    revenue: number
    roi: number
  }
  risks: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    score: number
  }
  team: string[]
  lastUpdate: string
}

export default function ModernProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, statusFilter, typeFilter])

  const loadDashboardData = async () => {
    try {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Amazon Conservation Initiative',
          type: 'AFOLU',
          status: 'implementation',
          country: 'BRA',
          region: 'Amazonas',
          methodology: { id: 'm1', name: 'REDD+ Methodology', standard: 'VCS' },
          timeline: { startDate: '2024-01-15', endDate: '2029-01-15', progress: 65 },
          credits: { estimated: 150000, issued: 45000, projected: 105000 },
          financial: { budget: 2500000, spent: 1200000, revenue: 900000, roi: 15.5 },
          risks: { level: 'MEDIUM', score: 35 },
          team: ['Dr. Silva', 'M. Santos', 'J. Rodriguez'],
          lastUpdate: '2024-03-15'
        },
        {
          id: '2',
          name: 'Solar Farm Development',
          type: 'ENERGY',
          status: 'validation',
          country: 'USA',
          region: 'California',
          methodology: { id: 'm2', name: 'Solar Power Generation', standard: 'CDM' },
          timeline: { startDate: '2024-02-01', endDate: '2026-08-01', progress: 25 },
          credits: { estimated: 80000, issued: 0, projected: 80000 },
          financial: { budget: 1800000, spent: 350000, revenue: 0, roi: 0 },
          risks: { level: 'LOW', score: 15 },
          team: ['A. Johnson', 'S. Park'],
          lastUpdate: '2024-03-10'
        },
        {
          id: '3',
          name: 'Waste-to-Energy Facility',
          type: 'WASTE',
          status: 'registered',
          country: 'DEU',
          region: 'Bavaria',
          methodology: { id: 'm3', name: 'Waste Management', standard: 'Gold Standard' },
          timeline: { startDate: '2023-06-01', endDate: '2028-06-01', progress: 85 },
          credits: { estimated: 120000, issued: 85000, projected: 35000 },
          financial: { budget: 3200000, spent: 2800000, revenue: 1700000, roi: 12.8 },
          risks: { level: 'HIGH', score: 65 },
          team: ['H. Mueller', 'K. Weber', 'L. Schmidt'],
          lastUpdate: '2024-03-12'
        }
      ]
      
      setProjects(mockProjects)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.country.toLowerCase().includes(query) ||
        p.methodology.name.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter)
    }

    setFilteredProjects(filtered)
  }

  // Calculate metrics
  const totalCreditsIssued = projects.reduce((sum, p) => sum + p.credits.issued, 0)
  const totalRevenue = projects.reduce((sum, p) => sum + p.financial.revenue, 0)
  const averageROI = projects.reduce((sum, p) => sum + p.financial.roi, 0) / projects.length || 0
  const activeProjects = projects.filter(p => ['implementation', 'monitoring', 'validation'].includes(p.status)).length

  // Chart data
  const typeDistribution = projects.reduce((acc, project) => {
    acc[project.type] = (acc[project.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(typeDistribution).map(([label, value]) => ({
    label,
    value
  }))

  const statusDistribution = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusChartData = Object.entries(statusDistribution).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 rounded-xl"></div>
              <div className="h-64 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Carbon Portfolio Dashboard
            </h1>
            <p className="text-slate-600 scientific-text">
              Monitor and optimize your carbon credit projects with real-time insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2 carbon-gradient text-white border-0">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Credits Issued"
            value={totalCreditsIssued}
            subtitle="tCO2e across all projects"
            icon={Leaf}
            variant="carbon"
            trend={{
              value: 12.5,
              label: "vs last quarter",
              direction: "up"
            }}
          />
          <MetricCard
            title="Active Projects"
            value={activeProjects}
            subtitle={`of ${projects.length} total projects`}
            icon={Zap}
            variant="accent"
            trend={{
              value: 8.3,
              label: "vs last month",
              direction: "up"
            }}
          />
          <MetricCard
            title="Portfolio Revenue"
            value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
            subtitle="Total revenue generated"
            icon={DollarSign}
            variant="success"
            trend={{
              value: 15.2,
              label: "vs last quarter",
              direction: "up"
            }}
          />
          <MetricCard
            title="Average ROI"
            value={`${averageROI.toFixed(1)}%`}
            subtitle="Portfolio performance"
            icon={TrendingUp}
            variant="default"
            trend={{
              value: 2.1,
              label: "vs target",
              direction: "up"
            }}
          />
        </div>

        {/* Analytics and Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CarbonChart
                title="Project Types"
                subtitle="Distribution by category"
                data={chartData}
                type="donut"
                height={200}
              />
              <CarbonChart
                title="Project Status"
                subtitle="Current status overview"
                data={statusChartData}
                type="bar"
                height={200}
                showValues
              />
            </div>
          </div>

          {/* Project List */}
          <div className="space-y-6">
            <Card className="border-slate-200/60 scientific-shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent Projects</CardTitle>
                <CardDescription>Latest project updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-slate-200/60 hover-lift bg-white/80"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 text-sm leading-snug">
                            {project.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{project.type}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{project.country}</span>
                          </div>
                        </div>
                        <ProjectStatus
                          status={project.status}
                          size="sm"
                          variant="badge"
                          showIcon={false}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Credits:</span>
                          <span className="ml-1 font-medium text-slate-900">
                            {project.credits.issued.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Progress:</span>
                          <span className="ml-1 font-medium text-slate-900">
                            {project.timeline.progress}%
                          </span>
                        </div>
                      </div>
                      
                      <RiskLevel level={project.risks.level} size="sm" variant="minimal" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Project Table */}
        <Card className="border-slate-200/60 scientific-shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Portfolio</CardTitle>
                <CardDescription>Comprehensive view of all carbon projects</CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 modern-input"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="implementation">Implementation</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 rounded-xl border border-slate-200/60 hover-lift bg-white/60"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{project.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {project.country} {project.region && `• ${project.region}`}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.team.length} members
                              </div>
                            </div>
                          </div>
                          <ProjectStatus status={project.status} size="sm" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-emerald-600" />
                            <span className="text-slate-600">Standard:</span>
                            <span className="font-medium">{project.methodology.standard}</span>
                          </div>
                          <RiskLevel level={project.risks.level} size="sm" variant="minimal" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Credits Issued</div>
                          <div className="font-semibold text-emerald-700">
                            {project.credits.issued.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Revenue</div>
                          <div className="font-semibold text-blue-700">
                            ${(project.financial.revenue / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">ROI</div>
                          <div className="font-semibold text-purple-700">
                            {project.financial.roi.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Progress</div>
                          <div className="font-semibold text-slate-700">
                            {project.timeline.progress}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}