"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Leaf, 
  TrendingUp, 
  Target, 
  BarChart3,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Plus,
  Eye,
  Settings,
  Zap,
  Shield,
  Globe,
  Heart,
  TreePine,
  Factory,
  Home,
  Truck
} from 'lucide-react'

interface ImpactMetric {
  id: string
  name: string
  category: 'environmental' | 'social' | 'economic' | 'governance'
  unit: string
  target: number
  actual: number
  baseline: number
  trend: 'increasing' | 'decreasing' | 'stable'
  lastUpdated: string
  methodology: string
  verificationStatus: 'verified' | 'pending' | 'unverified'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  dataSource: string
  confidence: number
}

interface ImpactReport {
  id: string
  projectId: string
  reportingPeriod: {
    start: string
    end: string
    type: 'monthly' | 'quarterly' | 'annual'
  }
  metrics: ImpactMetric[]
  summary: {
    totalCO2Reduced: number
    totalCreditsIssued: number
    socialBeneficiaries: number
    economicValue: number
    biodiversityImpact: number
  }
  verification: {
    status: 'verified' | 'pending' | 'failed'
    verifier: string
    date: string
    confidence: number
  }
  sdgAlignment: Array<{
    goal: number
    title: string
    contribution: number
    indicators: string[]
  }>
  stakeholderFeedback: Array<{
    stakeholder: string
    feedback: string
    rating: number
    date: string
  }>
}

interface ImpactDashboard {
  totalProjects: number
  totalImpact: {
    co2Reduced: number
    creditsIssued: number
    livesImpacted: number
    economicValue: number
    biodiversityScore: number
  }
  trends: {
    co2Reduction: Array<{ month: string; value: number }>
    creditIssuance: Array<{ month: string; value: number }>
    socialImpact: Array<{ month: string; value: number }>
  }
  sdgProgress: Array<{
    goal: number
    title: string
    progress: number
    projects: number
  }>
  verification: {
    verified: number
    pending: number
    total: number
  }
}

interface ImpactMeasurementTrackerProps {
  projectId?: string
  className?: string
}

export function ImpactMeasurementTracker({
  projectId,
  className = ""
}: ImpactMeasurementTrackerProps) {
  const [dashboard, setDashboard] = useState<ImpactDashboard | null>(null)
  const [reports, setReports] = useState<ImpactReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ImpactReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedMetric, setSelectedMetric] = useState<ImpactMetric | null>(null)
  const [newMetricData, setNewMetricData] = useState({
    name: '',
    category: 'environmental',
    target: '',
    actual: '',
    unit: ''
  })

  // Load impact data
  useEffect(() => {
    loadImpactData()
  }, [projectId])

  const loadImpactData = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data generation
      const mockDashboard = generateMockDashboard()
      const mockReports = generateMockReports()
      
      setDashboard(mockDashboard)
      setReports(mockReports)

    } catch (error) {
      console.error('Error loading impact data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockDashboard = (): ImpactDashboard => {
    return {
      totalProjects: 4,
      totalImpact: {
        co2Reduced: 425000, // tCO2e
        creditsIssued: 113000,
        livesImpacted: 25000,
        economicValue: 12500000, // USD
        biodiversityScore: 78
      },
      trends: {
        co2Reduction: [
          { month: 'Jan 2024', value: 12000 },
          { month: 'Feb 2024', value: 15000 },
          { month: 'Mar 2024', value: 18000 },
          { month: 'Apr 2024', value: 22000 },
          { month: 'May 2024', value: 25000 },
          { month: 'Jun 2024', value: 28000 }
        ],
        creditIssuance: [
          { month: 'Jan 2024', value: 8000 },
          { month: 'Feb 2024', value: 12000 },
          { month: 'Mar 2024', value: 15000 },
          { month: 'Apr 2024', value: 18000 },
          { month: 'May 2024', value: 22000 },
          { month: 'Jun 2024', value: 25000 }
        ],
        socialImpact: [
          { month: 'Jan 2024', value: 1200 },
          { month: 'Feb 2024', value: 1800 },
          { month: 'Mar 2024', value: 2200 },
          { month: 'Apr 2024', value: 2800 },
          { month: 'May 2024', value: 3200 },
          { month: 'Jun 2024', value: 3800 }
        ]
      },
      sdgProgress: [
        { goal: 7, title: 'Affordable and Clean Energy', progress: 85, projects: 2 },
        { goal: 13, title: 'Climate Action', progress: 92, projects: 4 },
        { goal: 15, title: 'Life on Land', progress: 76, projects: 2 },
        { goal: 8, title: 'Decent Work and Economic Growth', progress: 68, projects: 3 },
        { goal: 11, title: 'Sustainable Cities and Communities', progress: 72, projects: 2 },
        { goal: 6, title: 'Clean Water and Sanitation', progress: 45, projects: 1 }
      ],
      verification: {
        verified: 85,
        pending: 12,
        total: 97
      }
    }
  }

  const generateMockReports = (): ImpactReport[] => {
    return [
      {
        id: 'report-001',
        projectId: 'proj-001',
        reportingPeriod: {
          start: '2024-01-01',
          end: '2024-03-31',
          type: 'quarterly'
        },
        metrics: [
          {
            id: 'metric-001',
            name: 'CO2 Emissions Reduced',
            category: 'environmental',
            unit: 'tCO2e',
            target: 50000,
            actual: 48500,
            baseline: 0,
            trend: 'increasing',
            lastUpdated: '2024-03-31',
            methodology: 'VCS AFOLU',
            verificationStatus: 'verified',
            frequency: 'quarterly',
            dataSource: 'Monitoring System',
            confidence: 95
          },
          {
            id: 'metric-002',
            name: 'Local Employment Created',
            category: 'social',
            unit: 'jobs',
            target: 150,
            actual: 162,
            baseline: 0,
            trend: 'increasing',
            lastUpdated: '2024-03-31',
            methodology: 'Social Impact Assessment',
            verificationStatus: 'verified',
            frequency: 'quarterly',
            dataSource: 'HR Records',
            confidence: 98
          },
          {
            id: 'metric-003',
            name: 'Forest Area Protected',
            category: 'environmental',
            unit: 'hectares',
            target: 10000,
            actual: 10500,
            baseline: 0,
            trend: 'stable',
            lastUpdated: '2024-03-31',
            methodology: 'Satellite Monitoring',
            verificationStatus: 'verified',
            frequency: 'quarterly',
            dataSource: 'Remote Sensing',
            confidence: 92
          },
          {
            id: 'metric-004',
            name: 'Community Revenue Generated',
            category: 'economic',
            unit: 'USD',
            target: 500000,
            actual: 425000,
            baseline: 50000,
            trend: 'increasing',
            lastUpdated: '2024-03-31',
            methodology: 'Economic Impact Study',
            verificationStatus: 'pending',
            frequency: 'quarterly',
            dataSource: 'Financial Records',
            confidence: 88
          },
          {
            id: 'metric-005',
            name: 'Biodiversity Index',
            category: 'environmental',
            unit: 'index',
            target: 80,
            actual: 78,
            baseline: 45,
            trend: 'increasing',
            lastUpdated: '2024-03-31',
            methodology: 'Biodiversity Assessment',
            verificationStatus: 'verified',
            frequency: 'quarterly',
            dataSource: 'Field Surveys',
            confidence: 85
          }
        ],
        summary: {
          totalCO2Reduced: 48500,
          totalCreditsIssued: 15000,
          socialBeneficiaries: 8500,
          economicValue: 2100000,
          biodiversityImpact: 78
        },
        verification: {
          status: 'verified',
          verifier: 'TÜV SÜD',
          date: '2024-04-15',
          confidence: 94
        },
        sdgAlignment: [
          {
            goal: 13,
            title: 'Climate Action',
            contribution: 95,
            indicators: ['13.1.1', '13.2.1', '13.3.1']
          },
          {
            goal: 15,
            title: 'Life on Land',
            contribution: 88,
            indicators: ['15.1.1', '15.2.1', '15.4.2']
          },
          {
            goal: 8,
            title: 'Decent Work and Economic Growth',
            contribution: 72,
            indicators: ['8.5.2', '8.9.1']
          }
        ],
        stakeholderFeedback: [
          {
            stakeholder: 'Local Community',
            feedback: 'Positive impact on employment and forest conservation',
            rating: 4.5,
            date: '2024-03-28'
          },
          {
            stakeholder: 'Environmental NGO',
            feedback: 'Excellent biodiversity protection measures',
            rating: 4.8,
            date: '2024-03-30'
          }
        ]
      }
    ]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <Leaf className="h-4 w-4 text-green-600" />
      case 'social': return <Users className="h-4 w-4 text-blue-600" />
      case 'economic': return <DollarSign className="h-4 w-4 text-purple-600" />
      case 'governance': return <Shield className="h-4 w-4 text-orange-600" />
      default: return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'decreasing': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
      case 'stable': return <Target className="h-3 w-3 text-yellow-600" />
      default: return <Target className="h-3 w-3 text-gray-600" />
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'unverified': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const exportImpactData = () => {
    const data = {
      dashboard,
      reports,
      exportedAt: new Date().toISOString(),
      projectId
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `impact-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Impact Measurement & Tracking
            </CardTitle>
            <CardDescription>
              Comprehensive monitoring and verification of project impacts across environmental, social, and economic dimensions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadImpactData()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportImpactData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Impact Summary Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">CO2 Reduced</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(dashboard.totalImpact.co2Reduced / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-green-700">tCO2e total</p>
                  </div>
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Credits Issued</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(dashboard.totalImpact.creditsIssued / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-blue-700">verified credits</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Lives Impacted</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {(dashboard.totalImpact.livesImpacted / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-purple-700">beneficiaries</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Economic Value</p>
                    <p className="text-2xl font-bold text-orange-900">
                      ${(dashboard.totalImpact.economicValue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-orange-700">generated</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Biodiversity</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {dashboard.totalImpact.biodiversityScore}
                    </p>
                    <p className="text-xs text-emerald-700">impact score</p>
                  </div>
                  <TreePine className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="sdg">SDG Alignment</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {dashboard && (
              <>
                {/* Verification Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-900">{dashboard.verification.verified}</div>
                        <div className="text-sm text-green-700">Verified Metrics</div>
                        <Progress value={(dashboard.verification.verified / dashboard.verification.total) * 100} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-900">{dashboard.verification.pending}</div>
                        <div className="text-sm text-yellow-700">Pending Verification</div>
                        <Progress value={(dashboard.verification.pending / dashboard.verification.total) * 100} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-900">
                          {Math.round((dashboard.verification.verified / dashboard.verification.total) * 100)}%
                        </div>
                        <div className="text-sm text-blue-700">Verification Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">CO2 Reduction Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.trends.co2Reduction.slice(-3).map((point, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{point.month}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={(point.value / 30000) * 100} className="w-16 h-2" />
                              <span className="text-sm font-medium">{(point.value / 1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Credit Issuance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.trends.creditIssuance.slice(-3).map((point, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{point.month}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={(point.value / 25000) * 100} className="w-16 h-2" />
                              <span className="text-sm font-medium">{(point.value / 1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Social Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.trends.socialImpact.slice(-3).map((point, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{point.month}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={(point.value / 4000) * 100} className="w-16 h-2" />
                              <span className="text-sm font-medium">{point.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {/* Metric Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.length > 0 && reports[0].metrics.map((metric) => (
                <Card key={metric.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedMetric(metric)}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(metric.category)}
                          <div>
                            <h4 className="font-medium">{metric.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{metric.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getVerificationColor(metric.verificationStatus)}>
                            {metric.verificationStatus}
                          </Badge>
                          {getTrendIcon(metric.trend)}
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Progress to Target</span>
                          <span className="text-sm font-medium">
                            {metric.actual.toLocaleString()} / {metric.target.toLocaleString()} {metric.unit}
                          </span>
                        </div>
                        <Progress value={Math.min((metric.actual / metric.target) * 100, 100)} className="h-2" />
                        <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                          <span>Baseline: {metric.baseline.toLocaleString()}</span>
                          <span>{Math.round((metric.actual / metric.target) * 100)}% achieved</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600">Methodology:</span>
                          <div className="font-medium">{metric.methodology}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <div className="font-medium">{metric.confidence}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <div className="font-medium capitalize">{metric.frequency}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Updated:</span>
                          <div className="font-medium">{metric.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New Metric */}
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Impact Metric
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="metricName">Metric Name</Label>
                    <Input
                      id="metricName"
                      value={newMetricData.name}
                      onChange={(e) => setNewMetricData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Water Conservation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="metricCategory">Category</Label>
                    <Select 
                      value={newMetricData.category} 
                      onValueChange={(value) => setNewMetricData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="economic">Economic</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="metricUnit">Unit</Label>
                    <Input
                      id="metricUnit"
                      value={newMetricData.unit}
                      onChange={(e) => setNewMetricData(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., liters, jobs, USD"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="metricTarget">Target Value</Label>
                    <Input
                      id="metricTarget"
                      type="number"
                      value={newMetricData.target}
                      onChange={(e) => setNewMetricData(prev => ({ ...prev, target: e.target.value }))}
                      placeholder="e.g., 10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="metricActual">Current Value</Label>
                    <Input
                      id="metricActual"
                      type="number"
                      value={newMetricData.actual}
                      onChange={(e) => setNewMetricData(prev => ({ ...prev, actual: e.target.value }))}
                      placeholder="e.g., 7500"
                    />
                  </div>
                </div>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Report List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedReport(report)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">
                            {report.reportingPeriod.type.charAt(0).toUpperCase() + report.reportingPeriod.type.slice(1)} Report
                          </h4>
                          <Badge className={getVerificationColor(report.verification.status)}>
                            {report.verification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {report.reportingPeriod.start} to {report.reportingPeriod.end}
                        </p>
                        
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">CO2 Reduced</div>
                            <div className="font-medium">{report.summary.totalCO2Reduced.toLocaleString()} tCO2e</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Credits Issued</div>
                            <div className="font-medium">{report.summary.totalCreditsIssued.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Beneficiaries</div>
                            <div className="font-medium">{report.summary.socialBeneficiaries.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Economic Value</div>
                            <div className="font-medium">${(report.summary.economicValue / 1000000).toFixed(1)}M</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generate New Report */}
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-4">Generate New Impact Report</div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sdg" className="space-y-6">
            {/* SDG Progress */}
            {dashboard && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboard.sdgProgress.map((sdg) => (
                  <Card key={sdg.goal} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-2xl font-bold text-blue-900">SDG {sdg.goal}</div>
                            <h4 className="font-medium text-sm">{sdg.title}</h4>
                          </div>
                          <Badge variant="outline">{sdg.projects} projects</Badge>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm font-medium">{sdg.progress}%</span>
                          </div>
                          <Progress value={sdg.progress} className="h-3" />
                        </div>

                        <div className="text-xs text-gray-600">
                          Contributing to sustainable development through verified impact measurement
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* SDG Impact Statement */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">SDG Impact Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p className="text-blue-800">
                    Our carbon mitigation projects are directly contributing to {dashboard?.sdgProgress.length || 0} Sustainable Development Goals, 
                    creating measurable positive impact across environmental, social, and economic dimensions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Primary Contributions:</h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Climate action through verified emission reductions</li>
                        <li>• Clean energy deployment and access</li>
                        <li>• Sustainable economic growth in local communities</li>
                        <li>• Environmental conservation and biodiversity protection</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Measurement Framework:</h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Quantified impact indicators aligned with SDG targets</li>
                        <li>• Third-party verification and validation</li>
                        <li>• Regular monitoring and reporting cycles</li>
                        <li>• Stakeholder engagement and feedback integration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Metric Detail Modal */}
        {selectedMetric && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedMetric.category)}
                    <CardTitle>{selectedMetric.name}</CardTitle>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedMetric(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Metric Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Current Performance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Progress to Target</span>
                          <span className="text-sm font-medium">
                            {Math.round((selectedMetric.actual / selectedMetric.target) * 100)}%
                          </span>
                        </div>
                        <Progress value={Math.min((selectedMetric.actual / selectedMetric.target) * 100, 100)} className="h-3" />
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div>
                          <div className="text-gray-600">Baseline</div>
                          <div className="font-bold">{selectedMetric.baseline.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Current</div>
                          <div className="font-bold text-blue-600">{selectedMetric.actual.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Target</div>
                          <div className="font-bold text-green-600">{selectedMetric.target.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Metric Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <Badge variant="outline" className="capitalize">{selectedMetric.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Unit:</span>
                        <span>{selectedMetric.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(selectedMetric.trend)}
                          <span className="capitalize">{selectedMetric.trend}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Verification:</span>
                        <Badge className={getVerificationColor(selectedMetric.verificationStatus)}>
                          {selectedMetric.verificationStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{selectedMetric.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Methodology & Data Source */}
                <div>
                  <h4 className="font-medium mb-3">Measurement Framework</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Methodology:</span>
                      <div className="font-medium">{selectedMetric.methodology}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Source:</span>
                      <div className="font-medium">{selectedMetric.dataSource}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Update Frequency:</span>
                      <div className="font-medium capitalize">{selectedMetric.frequency}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <div className="font-medium">{selectedMetric.lastUpdated}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}