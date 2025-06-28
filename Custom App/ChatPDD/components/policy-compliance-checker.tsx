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
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  Globe,
  MapPin,
  Calendar,
  Gavel,
  Book,
  Target,
  TrendingUp,
  RefreshCw,
  Download,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Building,
  Leaf,
  Users,
  DollarSign,
  Eye,
  AlertCircle,
  Zap,
  BarChart3
} from 'lucide-react'

interface PolicyFramework {
  id: string
  name: string
  type: 'National' | 'Subnational' | 'International' | 'Sector-specific'
  jurisdiction: string
  scope: string[]
  lastUpdated: string
  status: 'Active' | 'Draft' | 'Under Review' | 'Superseded'
  carbonMarketRelevance: 'High' | 'Medium' | 'Low'
  url?: string
}

interface ComplianceRequirement {
  id: string
  frameworkId: string
  title: string
  description: string
  category: 'Environmental' | 'Social' | 'Economic' | 'Governance' | 'Technical' | 'Reporting'
  mandatory: boolean
  applicability: {
    projectTypes: string[]
    sectors: string[]
    thresholds?: {
      minCredits?: number
      minBudget?: number
      minArea?: number
    }
  }
  implementation: {
    timeframe: string
    complexity: 'Low' | 'Medium' | 'High'
    cost: 'Low' | 'Medium' | 'High'
    documentation: string[]
  }
  verification: {
    required: boolean
    frequency: 'One-time' | 'Annual' | 'Biennial' | 'Continuous'
    authority: string
  }
  penalties: {
    nonCompliance: string
    severity: 'Minor' | 'Major' | 'Critical'
  }
}

interface ComplianceAssessment {
  frameworkId: string
  frameworkName: string
  overallCompliance: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Applicable'
  complianceScore: number // 0-100
  requirements: Array<{
    requirementId: string
    title: string
    status: 'Met' | 'Partially Met' | 'Not Met' | 'Not Applicable'
    confidence: number
    gaps: string[]
    recommendations: string[]
  }>
  risks: Array<{
    type: 'Legal' | 'Financial' | 'Operational' | 'Reputational'
    description: string
    likelihood: 'Low' | 'Medium' | 'High'
    impact: 'Low' | 'Medium' | 'High'
    mitigation: string[]
  }>
  timeline: {
    assessmentDate: string
    nextReview: string
    urgentActions: Array<{
      action: string
      deadline: string
      responsible: string
    }>
  }
}

interface PolicyComplianceResults {
  location: {
    country: string
    region?: string
    coordinates?: string
  }
  projectType: string
  applicableFrameworks: PolicyFramework[]
  complianceAssessments: ComplianceAssessment[]
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical'
  summary: {
    totalFrameworks: number
    compliantFrameworks: number
    partiallyCompliantFrameworks: number
    nonCompliantFrameworks: number
    averageComplianceScore: number
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  monitoring: {
    keyIndicators: Array<{
      indicator: string
      currentValue: string
      threshold: string
      status: 'Good' | 'Warning' | 'Critical'
    }>
    reportingSchedule: Array<{
      framework: string
      nextDeadline: string
      frequency: string
    }>
  }
}

interface PolicyComplianceCheckerProps {
  projectData: {
    country: string
    region?: string
    coordinates?: string
    projectType: string
    estimatedCredits?: number
    budget?: number
  }
  methodology?: {
    name: string
    standard: string
  }
  onComplianceAssessed?: (results: PolicyComplianceResults) => void
  className?: string
}

export function PolicyComplianceChecker({
  projectData,
  methodology,
  onComplianceAssessed,
  className = ""
}: PolicyComplianceCheckerProps) {
  const [results, setResults] = useState<PolicyComplianceResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [assessmentProgress, setAssessmentProgress] = useState(0)
  const [selectedFramework, setSelectedFramework] = useState<PolicyFramework | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null)
  const [activeView, setActiveView] = useState('overview')
  const [filterSettings, setFilterSettings] = useState({
    frameworkType: 'all',
    complianceStatus: 'all',
    riskLevel: 'all'
  })

  // Start assessment when project data is available
  useEffect(() => {
    if (projectData.country && projectData.projectType) {
      performComplianceAssessment()
    }
  }, [projectData, methodology])

  const performComplianceAssessment = useCallback(async () => {
    setLoading(true)
    setAssessmentProgress(0)

    try {
      const assessmentSteps = [
        'Identifying applicable policy frameworks...',
        'Analyzing national regulations...',
        'Checking subnational requirements...',
        'Evaluating sector-specific policies...',
        'Assessing compliance gaps...',
        'Calculating risk levels...',
        'Generating recommendations...',
        'Finalizing assessment...'
      ]

      for (let i = 0; i < assessmentSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600))
        setAssessmentProgress((i + 1) / assessmentSteps.length * 100)
      }

      // Generate mock compliance assessment results
      const assessmentResults = generateMockComplianceResults(projectData, methodology)
      setResults(assessmentResults)

      if (onComplianceAssessed) {
        onComplianceAssessed(assessmentResults)
      }

    } catch (error) {
      console.error('Error performing compliance assessment:', error)
    } finally {
      setLoading(false)
    }
  }, [projectData, methodology, onComplianceAssessed])

  const generateMockComplianceResults = (
    project: typeof projectData,
    method?: typeof methodology
  ): PolicyComplianceResults => {
    const frameworks: PolicyFramework[] = [
      {
        id: 'fw-001',
        name: 'National Climate Change Policy Framework',
        type: 'National',
        jurisdiction: project.country,
        scope: ['Carbon Markets', 'Forest Conservation', 'Climate Adaptation'],
        lastUpdated: '2024-03-15',
        status: 'Active',
        carbonMarketRelevance: 'High',
        url: 'https://climate.gov/policy-framework'
      },
      {
        id: 'fw-002',
        name: 'Environmental Impact Assessment Regulation',
        type: 'National',
        jurisdiction: project.country,
        scope: ['Environmental Protection', 'Impact Assessment', 'Public Consultation'],
        lastUpdated: '2023-11-20',
        status: 'Active',
        carbonMarketRelevance: 'Medium'
      },
      {
        id: 'fw-003',
        name: 'Forest Code and Land Use Regulations',
        type: 'National',
        jurisdiction: project.country,
        scope: ['Forest Management', 'Land Rights', 'Biodiversity Conservation'],
        lastUpdated: '2024-01-10',
        status: 'Active',
        carbonMarketRelevance: 'High'
      }
    ]

    const assessments: ComplianceAssessment[] = frameworks.map(framework => ({
      frameworkId: framework.id,
      frameworkName: framework.name,
      overallCompliance: Math.random() > 0.3 ? 'Compliant' : 'Partially Compliant',
      complianceScore: Math.round(75 + Math.random() * 20),
      requirements: [
        {
          requirementId: 'req-001',
          title: 'Environmental Impact Assessment',
          status: 'Met',
          confidence: 92,
          gaps: [],
          recommendations: ['Maintain current assessment standards']
        },
        {
          requirementId: 'req-002',
          title: 'Community Consultation Process',
          status: 'Partially Met',
          confidence: 78,
          gaps: ['Insufficient documentation of consultation meetings'],
          recommendations: ['Document all stakeholder meetings', 'Implement formal grievance mechanism']
        },
        {
          requirementId: 'req-003',
          title: 'Biodiversity Conservation Plan',
          status: 'Not Met',
          confidence: 85,
          gaps: ['Missing species inventory', 'Lack of habitat restoration plan'],
          recommendations: ['Conduct comprehensive biodiversity survey', 'Develop habitat restoration strategy']
        }
      ],
      risks: [
        {
          type: 'Legal',
          description: 'Potential delays due to missing biodiversity assessments',
          likelihood: 'Medium',
          impact: 'High',
          mitigation: ['Complete biodiversity survey within 6 months', 'Engage environmental consultants']
        }
      ],
      timeline: {
        assessmentDate: new Date().toISOString().split('T')[0],
        nextReview: '2025-01-01',
        urgentActions: [
          {
            action: 'Submit biodiversity conservation plan',
            deadline: '2024-09-30',
            responsible: 'Environmental Team'
          }
        ]
      }
    }))

    const summary = {
      totalFrameworks: frameworks.length,
      compliantFrameworks: assessments.filter(a => a.overallCompliance === 'Compliant').length,
      partiallyCompliantFrameworks: assessments.filter(a => a.overallCompliance === 'Partially Compliant').length,
      nonCompliantFrameworks: assessments.filter(a => a.overallCompliance === 'Non-Compliant').length,
      averageComplianceScore: Math.round(assessments.reduce((acc, a) => acc + a.complianceScore, 0) / assessments.length)
    }

    return {
      location: {
        country: project.country,
        region: project.region,
        coordinates: project.coordinates
      },
      projectType: project.projectType,
      applicableFrameworks: frameworks,
      complianceAssessments: assessments,
      overallRisk: summary.averageComplianceScore > 85 ? 'Low' : summary.averageComplianceScore > 70 ? 'Medium' : 'High',
      summary,
      recommendations: {
        immediate: [
          'Complete biodiversity conservation plan within 6 months',
          'Enhance community consultation documentation',
          'Establish environmental monitoring protocols'
        ],
        shortTerm: [
          'Implement comprehensive stakeholder engagement program',
          'Develop climate risk management framework',
          'Establish partnerships with local conservation organizations'
        ],
        longTerm: [
          'Build long-term monitoring and evaluation system',
          'Develop adaptive management strategies',
          'Create sustainability certification pathway'
        ]
      },
      monitoring: {
        keyIndicators: [
          {
            indicator: 'Environmental Compliance Score',
            currentValue: '87%',
            threshold: '90%',
            status: 'Warning'
          },
          {
            indicator: 'Community Satisfaction Index',
            currentValue: '92%',
            threshold: '85%',
            status: 'Good'
          },
          {
            indicator: 'Biodiversity Conservation Target',
            currentValue: '65%',
            threshold: '80%',
            status: 'Critical'
          }
        ],
        reportingSchedule: [
          {
            framework: 'National Climate Change Policy',
            nextDeadline: '2024-12-31',
            frequency: 'Annual'
          },
          {
            framework: 'Environmental Impact Assessment',
            nextDeadline: '2024-09-30',
            frequency: 'Biennial'
          }
        ]
      }
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant': case 'Met': return 'text-green-600 bg-green-50 border-green-200'
      case 'Partially Compliant': case 'Partially Met': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Non-Compliant': case 'Not Met': return 'text-red-600 bg-red-50 border-red-200'
      case 'Not Applicable': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200'
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant': case 'Met': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Partially Compliant': case 'Partially Met': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'Non-Compliant': case 'Not Met': return <XCircle className="h-4 w-4 text-red-600" />
      case 'Not Applicable': return <AlertCircle className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const exportComplianceReport = () => {
    if (!results) return

    const exportData = {
      complianceAssessment: results,
      projectData,
      methodology,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `policy-compliance-assessment-${projectData.country}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Policy Compliance Checker
            </CardTitle>
            <CardDescription>
              AI-powered analysis of regulatory compliance for carbon mitigation projects
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {results && (
              <>
                <Button variant="outline" onClick={exportComplianceReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" onClick={performComplianceAssessment} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Assessment
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Context */}
        <Card className="bg-gray-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Assessment Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{projectData.country}{projectData.region && `, ${projectData.region}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Project Type</p>
                  <p className="font-medium">{projectData.projectType}</p>
                </div>
              </div>
              {methodology && (
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Methodology</p>
                    <p className="font-medium">{methodology.standard}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Assessment Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {!projectData.country && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please provide project location and type to begin compliance assessment
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Assessment Progress */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Analyzing regulatory frameworks and compliance requirements...</span>
              <span>{Math.round(assessmentProgress)}%</span>
            </div>
            <Progress value={assessmentProgress} className="h-3" />
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Shield className="h-3 w-3 animate-pulse" />
              <span>This may take a few minutes for comprehensive analysis</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Compliance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Total Frameworks</p>
                          <p className="text-2xl font-bold text-blue-900">{results.summary.totalFrameworks}</p>
                        </div>
                        <Globe className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Compliant</p>
                          <p className="text-2xl font-bold text-green-900">{results.summary.compliantFrameworks}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600">Partial Compliance</p>
                          <p className="text-2xl font-bold text-yellow-900">{results.summary.partiallyCompliantFrameworks}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className={`border-2 ${getRiskColor(results.overallRisk)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Overall Risk</p>
                          <p className="text-2xl font-bold">{results.overallRisk}</p>
                        </div>
                        <Target className="h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Average Compliance Score</span>
                      <span className="text-2xl font-bold">{results.summary.averageComplianceScore}%</span>
                    </div>
                    <Progress value={results.summary.averageComplianceScore} className="h-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      {results.complianceAssessments.map((assessment) => (
                        <div key={assessment.frameworkId} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm mb-2">{assessment.frameworkName}</h4>
                          <div className="flex items-center justify-between">
                            <Badge className={getComplianceColor(assessment.overallCompliance)}>
                              {assessment.overallCompliance}
                            </Badge>
                            <span className="text-lg font-bold">{assessment.complianceScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-red-600 mb-3">Immediate Actions</h4>
                        <ul className="space-y-2">
                          {results.recommendations.immediate.map((rec, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-3">Short-term (3-6 months)</h4>
                        <ul className="space-y-2">
                          {results.recommendations.shortTerm.map((rec, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-600 mb-3">Long-term (6+ months)</h4>
                        <ul className="space-y-2">
                          {results.recommendations.longTerm.map((rec, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="frameworks" className="mt-6">
              <div className="space-y-4">
                {results.applicableFrameworks.map((framework) => {
                  const assessment = results.complianceAssessments.find(a => a.frameworkId === framework.id)
                  return (
                    <Card 
                      key={framework.id}
                      className={`cursor-pointer transition-colors ${
                        selectedFramework?.id === framework.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFramework(framework)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{framework.name}</h4>
                              <Badge variant="outline">{framework.type}</Badge>
                              <Badge className={
                                framework.carbonMarketRelevance === 'High' ? 'bg-green-100 text-green-800' :
                                framework.carbonMarketRelevance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {framework.carbonMarketRelevance} relevance
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {framework.jurisdiction}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Updated {framework.lastUpdated}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {framework.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {framework.scope.map((scope, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {scope}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            {assessment && (
                              <div className="flex items-center gap-2">
                                {getStatusIcon(assessment.overallCompliance)}
                                <Badge className={getComplianceColor(assessment.overallCompliance)}>
                                  {assessment.overallCompliance}
                                </Badge>
                              </div>
                            )}
                            {framework.url && (
                              <Button variant="ghost" size="sm" className="mt-2">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="mt-6">
              <div className="space-y-6">
                {results.complianceAssessments.map((assessment) => (
                  <Card key={assessment.frameworkId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{assessment.frameworkName}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assessment.overallCompliance)}
                          <Badge className={getComplianceColor(assessment.overallCompliance)}>
                            {assessment.overallCompliance}
                          </Badge>
                          <Badge variant="outline">{assessment.complianceScore}%</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assessment.requirements.map((req) => (
                          <div key={req.requirementId} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{req.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(req.status)}
                                  <Badge className={getComplianceColor(req.status)}>
                                    {req.status}
                                  </Badge>
                                  <Badge variant="outline">{req.confidence}% confidence</Badge>
                                </div>
                              </div>
                            </div>
                            
                            {req.gaps.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-red-600 mb-2">Identified Gaps:</h5>
                                <ul className="space-y-1">
                                  {req.gaps.map((gap, idx) => (
                                    <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                      <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      {gap}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {req.recommendations.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-blue-600 mb-2">Recommendations:</h5>
                                <ul className="space-y-1">
                                  {req.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                                      <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="mt-6">
              <div className="space-y-6">
                {/* Key Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Compliance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.monitoring.keyIndicators.map((indicator, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{indicator.indicator}</h4>
                            <p className="text-sm text-gray-600">
                              Current: {indicator.currentValue} | Threshold: {indicator.threshold}
                            </p>
                          </div>
                          <Badge className={
                            indicator.status === 'Good' ? 'bg-green-100 text-green-800' :
                            indicator.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {indicator.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reporting Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reporting Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.monitoring.reportingSchedule.map((schedule, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{schedule.framework}</h4>
                            <p className="text-sm text-gray-600">Frequency: {schedule.frequency}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Next Deadline</p>
                            <p className="text-sm text-gray-600">{schedule.nextDeadline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Urgent Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Urgent Actions Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.complianceAssessments.flatMap(assessment => 
                        assessment.timeline.urgentActions.map((action, idx) => (
                          <Alert key={`${assessment.frameworkId}-${idx}`} className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{action.action}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Responsible: {action.responsible}
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                  Due: {action.deadline}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}