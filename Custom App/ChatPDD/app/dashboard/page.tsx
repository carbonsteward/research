"use client"

import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonitoringDashboard } from '@/components/monitoring-dashboard'
import { MilestoneManager } from '@/components/milestone-manager'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Leaf,
  Calendar,
  MapPin,
  AlertTriangle,
  Target,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Users,
  Globe,
  Shield,
  Zap
} from 'lucide-react'
// import { ImpactMeasurementTracker } from '@/components/impact-measurement-tracker'

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

interface PortfolioMetrics {
  totalProjects: number
  activeProjects: number
  totalCredits: {
    estimated: number
    issued: number
    projected: number
  }
  totalRevenue: number
  totalInvestment: number
  averageROI: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  typeDistribution: Record<string, number>
  countryDistribution: Record<string, number>
}

function ProjectPortfolioDashboardComponent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState('overview')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')

  // Load portfolio data
  useEffect(() => {
    loadPortfolioData()
  }, [])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [projects, searchQuery, statusFilter, typeFilter, riskFilter])

  const loadPortfolioData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call - in real app this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockProjects: Project[] = [
        {
          id: 'proj-001',
          name: 'Amazon Rainforest Conservation',
          type: 'AFOLU',
          status: 'implementation',
          country: 'BRA',
          region: 'Amazonas',
          methodology: {
            id: 'vcs-001',
            name: 'Afforestation and Reforestation',
            standard: 'Verra VCS'
          },
          timeline: {
            startDate: '2024-01-01',
            endDate: '2026-12-31',
            progress: 65
          },
          credits: {
            estimated: 150000,
            issued: 45000,
            projected: 105000
          },
          financial: {
            budget: 2500000,
            spent: 1200000,
            revenue: 675000,
            roi: 15.2
          },
          risks: {
            level: 'MEDIUM',
            score: 35
          },
          team: ['Maria Silva', 'Carlos Rodriguez', 'Ana Costa'],
          lastUpdate: '2024-03-15'
        },
        {
          id: 'proj-002',
          name: 'Solar Farm Initiative',
          type: 'ENERGY',
          status: 'monitoring',
          country: 'USA',
          region: 'California',
          methodology: {
            id: 'cdm-002',
            name: 'Solar Power Generation',
            standard: 'CDM'
          },
          timeline: {
            startDate: '2023-06-01',
            endDate: '2025-05-31',
            progress: 85
          },
          credits: {
            estimated: 80000,
            issued: 68000,
            projected: 12000
          },
          financial: {
            budget: 1800000,
            spent: 1650000,
            revenue: 1360000,
            roi: 22.8
          },
          risks: {
            level: 'LOW',
            score: 15
          },
          team: ['John Smith', 'Sarah Johnson'],
          lastUpdate: '2024-03-10'
        },
        {
          id: 'proj-003',
          name: 'Waste-to-Energy Plant',
          type: 'WASTE',
          status: 'validation',
          country: 'IND',
          region: 'Maharashtra',
          methodology: {
            id: 'vcs-003',
            name: 'Landfill Gas Capture',
            standard: 'Verra VCS'
          },
          timeline: {
            startDate: '2024-02-01',
            endDate: '2027-01-31',
            progress: 25
          },
          credits: {
            estimated: 200000,
            issued: 0,
            projected: 200000
          },
          financial: {
            budget: 3200000,
            spent: 650000,
            revenue: 0,
            roi: -100
          },
          risks: {
            level: 'HIGH',
            score: 70
          },
          team: ['Rajesh Patel', 'Priya Sharma', 'Amit Kumar'],
          lastUpdate: '2024-03-12'
        },
        {
          id: 'proj-004',
          name: 'Sustainable Transportation Hub',
          type: 'TRANSPORT',
          status: 'development',
          country: 'DEU',
          region: 'Bavaria',
          methodology: {
            id: 'gs-004',
            name: 'Modal Shift to Public Transport',
            standard: 'Gold Standard'
          },
          timeline: {
            startDate: '2024-04-01',
            endDate: '2026-03-31',
            progress: 10
          },
          credits: {
            estimated: 60000,
            issued: 0,
            projected: 60000
          },
          financial: {
            budget: 1500000,
            spent: 120000,
            revenue: 0,
            roi: -100
          },
          risks: {
            level: 'MEDIUM',
            score: 45
          },
          team: ['Hans Mueller', 'Ingrid Weber'],
          lastUpdate: '2024-03-08'
        }
      ]

      setProjects(mockProjects)

      // Calculate metrics
      const portfolioMetrics = calculateMetrics(mockProjects)
      setMetrics(portfolioMetrics)

    } catch (error) {
      console.error('Error loading portfolio data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (projectList: Project[]): PortfolioMetrics => {
    const totalProjects = projectList.length
    const activeProjects = projectList.filter(p =>
      ['development', 'validation', 'registered', 'implementation', 'monitoring'].includes(p.status)
    ).length

    const totalCredits = projectList.reduce((acc, p) => ({
      estimated: acc.estimated + p.credits.estimated,
      issued: acc.issued + p.credits.issued,
      projected: acc.projected + p.credits.projected
    }), { estimated: 0, issued: 0, projected: 0 })

    const totalRevenue = projectList.reduce((sum, p) => sum + p.financial.revenue, 0)
    const totalInvestment = projectList.reduce((sum, p) => sum + p.financial.spent, 0)
    const averageROI = projectList.reduce((sum, p) => sum + p.financial.roi, 0) / projectList.length

    const riskDistribution = projectList.reduce((acc, p) => {
      acc[p.risks.level.toLowerCase() as keyof typeof acc]++
      return acc
    }, { low: 0, medium: 0, high: 0, critical: 0 })

    const typeDistribution = projectList.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const countryDistribution = projectList.reduce((acc, p) => {
      acc[p.country] = (acc[p.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalProjects,
      activeProjects,
      totalCredits,
      totalRevenue,
      totalInvestment,
      averageROI,
      riskDistribution,
      typeDistribution,
      countryDistribution
    }
  }

  const applyFilters = () => {
    let filtered = projects

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.country.toLowerCase().includes(query) ||
        p.methodology.name.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter)
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(p => p.risks.level.toLowerCase() === riskFilter)
    }

    setFilteredProjects(filtered)
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'development': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'validation': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'registered': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'implementation': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'monitoring': return 'bg-green-100 text-green-800 border-green-300'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const exportPortfolioData = () => {
    const data = {
      projects: filteredProjects,
      metrics,
      filters: { searchQuery, statusFilter, typeFilter, riskFilter },
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Error loading dashboard:</strong> {error}
            <br />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setError(null)
                loadPortfolioData()
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Portfolio Dashboard</h1>
            <p className="text-gray-500">
              Comprehensive overview of your carbon mitigation project portfolio
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => loadPortfolioData()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportPortfolioData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Projects</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.totalProjects}</p>
                  <p className="text-xs text-blue-700">{metrics.activeProjects} active</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Credits</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(metrics.totalCredits.estimated / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-green-700">
                    {(metrics.totalCredits.issued / 1000).toFixed(0)}k issued
                  </p>
                </div>
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${(metrics.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-purple-700">
                    {metrics.averageROI.toFixed(1)}% avg ROI
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Portfolio Risk</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {metrics.riskDistribution.high + metrics.riskDistribution.critical > 0 ? 'Medium' : 'Low'}
                  </p>
                  <p className="text-xs text-orange-700">
                    {metrics.riskDistribution.high + metrics.riskDistribution.critical} high-risk projects
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="projects">Project List</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring & Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="impact">Impact Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Portfolio Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="implementation">Implementation</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="AFOLU">AFOLU</SelectItem>
                      <SelectItem value="ENERGY">Energy</SelectItem>
                      <SelectItem value="WASTE">Waste</SelectItem>
                      <SelectItem value="TRANSPORT">Transport</SelectItem>
                      <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                      <SelectItem value="BUILDINGS">Buildings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Level</label>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="critical">Critical Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProject(project)}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {project.country} {project.region && `• ${project.region}`}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline">{project.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{project.timeline.progress}%</span>
                    </div>
                    <Progress value={project.timeline.progress} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Credits Issued</div>
                      <div className="font-medium">{(project.credits.issued / 1000).toFixed(0)}k tCO2e</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Revenue</div>
                      <div className="font-medium">${(project.financial.revenue / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-gray-600">ROI</div>
                      <div className={`font-medium ${project.financial.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {project.financial.roi.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Risk Level</div>
                      <Badge className={getRiskColor(project.risks.level)} variant="outline">
                        {project.risks.level}
                      </Badge>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {project.team.length} team members
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-2">No projects match your current filters</div>
                <p className="text-sm text-gray-400">
                  Try adjusting your search criteria or create a new project
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Project Table */}
          <Card>
            <CardHeader>
              <CardTitle>Project List</CardTitle>
              <CardDescription>
                Detailed view of all projects in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Project</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Progress</th>
                      <th className="text-left p-3">Credits</th>
                      <th className="text-left p-3">Revenue</th>
                      <th className="text-left p-3">Risk</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-gray-600">{project.methodology.name}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{project.type}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span>{project.country}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={project.timeline.progress} className="w-16 h-2" />
                            <span className="text-xs">{project.timeline.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{(project.credits.issued / 1000).toFixed(0)}k</div>
                            <div className="text-xs text-gray-600">of {(project.credits.estimated / 1000).toFixed(0)}k</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">${(project.financial.revenue / 1000).toFixed(0)}k</div>
                            <div className={`text-xs ${project.financial.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {project.financial.roi.toFixed(1)}% ROI
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getRiskColor(project.risks.level)} variant="outline">
                            {project.risks.level}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Real-time Monitoring Dashboard */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Real-time Monitoring & Alerts</h2>
              <p className="text-slate-600">
                Monitor project milestones, compliance deadlines, and risk changes across your portfolio
              </p>
            </div>

            {/* Global Monitoring Dashboard */}
            <MonitoringDashboard className="mb-8" />

            {/* Milestone Management for Selected Project */}
            {selectedProject ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Milestone Management - {selectedProject.name}
                  </h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProject(null)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View All Projects
                  </Button>
                </div>
                <MilestoneManager projectId={selectedProject.id} />
              </div>
            ) : (
              <Card className="border-slate-200/60 scientific-shadow-lg">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">
                      Select a project to manage its milestones and deadlines
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {projects.slice(0, 4).map((project) => (
                        <Button
                          key={project.id}
                          variant="outline"
                          onClick={() => setSelectedProject(project)}
                          className="gap-2"
                        >
                          <Target className="h-4 w-4" />
                          {project.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Charts */}
          {metrics && (
            <>
              {/* Portfolio Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(metrics.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(count / metrics.totalProjects) * 100}
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(metrics.riskDistribution).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{level} Risk</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(count / metrics.totalProjects) * 100}
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">
                        {((metrics.totalCredits.issued / metrics.totalCredits.estimated) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Credits Issuance Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">
                        ${(metrics.totalRevenue / metrics.totalInvestment).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue Multiple</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-900">
                        {(metrics.activeProjects / metrics.totalProjects * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Active Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-900">
                        {((metrics.riskDistribution.low + metrics.riskDistribution.medium) / metrics.totalProjects * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Low-Medium Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          {/* Temporarily disabled for deployment stability */}
          <Card>
            <CardHeader>
              <CardTitle>Impact Measurement</CardTitle>
              <CardDescription>Track and measure project impact across environmental, social, and economic dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Impact measurement tracking is currently being enhanced. Please check back soon for detailed impact analytics and reporting.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProject.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    {selectedProject.country} {selectedProject.region && `• ${selectedProject.region}`}
                    <Badge className={getStatusColor(selectedProject.status)} variant="outline">
                      {selectedProject.status}
                    </Badge>
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{selectedProject.timeline.progress}%</div>
                      <div className="text-sm text-blue-700">Overall Progress</div>
                      <Progress value={selectedProject.timeline.progress} className="mt-2 h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">
                        {(selectedProject.credits.issued / 1000).toFixed(0)}k
                      </div>
                      <div className="text-sm text-green-700">Credits Issued</div>
                      <div className="text-xs text-green-600 mt-1">
                        of {(selectedProject.credits.estimated / 1000).toFixed(0)}k estimated
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-900">
                        {selectedProject.financial.roi.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-700">Return on Investment</div>
                      <div className="text-xs text-purple-600 mt-1">
                        ${(selectedProject.financial.revenue / 1000).toFixed(0)}k revenue
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Project Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="outline">{selectedProject.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Methodology:</span>
                      <span>{selectedProject.methodology.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard:</span>
                      <span>{selectedProject.methodology.standard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span>{selectedProject.timeline.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span>{selectedProject.timeline.endDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Financial Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Budget:</span>
                      <span>${selectedProject.financial.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Spent:</span>
                      <span>${selectedProject.financial.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue Generated:</span>
                      <span>${selectedProject.financial.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Budget:</span>
                      <span>${(selectedProject.financial.budget - selectedProject.financial.spent).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team & Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {selectedProject.team.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Risk Assessment</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge className={getRiskColor(selectedProject.risks.level)} variant="outline">
                        {selectedProject.risks.level}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Risk Score:</span>
                        <span className="text-sm">{selectedProject.risks.score}/100</span>
                      </div>
                      <Progress value={selectedProject.risks.score} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// React Error Boundary for deployment stability
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard error boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Dashboard Error:</strong> The project portfolio dashboard encountered an unexpected error.
              Please refresh the page or contact support if the issue persists.
              <br />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

export default function ProjectPortfolioDashboard() {
  return (
    <DashboardErrorBoundary>
      <ProjectPortfolioDashboardComponent />
    </DashboardErrorBoundary>
  )
}
