"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  Leaf,
  Shield,
  Zap,
  Settings,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'

interface ProjectMilestone {
  id: string
  phase: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate: string
  endDate: string
  estimatedDuration: number // in days
  actualDuration?: number
  dependencies: string[]
  deliverables: string[]
  stakeholders: string[]
  costs: {
    estimated: number
    actual?: number
  }
  risks: Array<{
    description: string
    probability: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    mitigation: string
  }>
  kpis: Array<{
    metric: string
    target: number
    actual?: number
    unit: string
  }>
}

interface ProjectTimeline {
  projectId: string
  totalDuration: number
  phases: string[]
  milestones: ProjectMilestone[]
  criticalPath: string[]
  overallProgress: number
  riskScore: number
  budgetStatus: {
    allocated: number
    spent: number
    remaining: number
  }
  nextActions: Array<{
    action: string
    deadline: string
    responsible: string
    priority: 'low' | 'medium' | 'high'
  }>
}

interface ProjectTimelineTrackerProps {
  projectData: {
    type: string
    country: string
    region?: string
    estimatedCredits?: number
    budget?: number
    timeline?: string
  }
  selectedMethodology?: {
    id: string
    name: string
    complexity: 'Low' | 'Medium' | 'High'
    itmoCompliant: boolean
  }
  riskAssessment?: {
    overallScore: number
    vulnerabilityIndex: number
  }
  className?: string
}

export function ProjectTimelineTracker({
  projectData,
  selectedMethodology,
  riskAssessment,
  className = ""
}: ProjectTimelineTrackerProps) {
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeView, setActiveView] = useState('timeline')
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null)
  const [showCriticalPath, setShowCriticalPath] = useState(false)

  // Generate timeline when project data changes
  useEffect(() => {
    if (projectData.type && projectData.country) {
      generateTimeline()
    }
  }, [projectData, selectedMethodology, riskAssessment])

  const generateTimeline = useCallback(async () => {
    setIsGenerating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate generation
      
      const generatedTimeline = createProjectTimeline(projectData, selectedMethodology, riskAssessment)
      setTimeline(generatedTimeline)

    } catch (error) {
      console.error('Error generating timeline:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [projectData, selectedMethodology, riskAssessment])

  const createProjectTimeline = (
    project: any,
    methodology: any,
    risks: any
  ): ProjectTimeline => {
    const complexityMultiplier = methodology?.complexity === 'High' ? 1.5 : 
                                methodology?.complexity === 'Medium' ? 1.2 : 1.0
    
    const riskMultiplier = risks ? (risks.vulnerabilityIndex / 100) * 0.3 + 1 : 1.1

    const baseDuration = {
      'AFOLU': 540, // 18 months
      'ENERGY': 450, // 15 months
      'WASTE': 480, // 16 months
      'TRANSPORT': 420, // 14 months
      'MANUFACTURING': 390, // 13 months
    }

    const totalDuration = Math.round((baseDuration[project.type as keyof typeof baseDuration] || 480) * complexityMultiplier * riskMultiplier)

    const milestones: ProjectMilestone[] = [
      // Phase 1: Project Development
      {
        id: 'milestone-1',
        phase: 'Development',
        title: 'Project Concept & Feasibility',
        description: 'Initial project design, feasibility assessment, and stakeholder identification',
        status: 'completed',
        priority: 'high',
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        estimatedDuration: 45,
        actualDuration: 42,
        dependencies: [],
        deliverables: [
          'Project Concept Document',
          'Feasibility Study Report',
          'Stakeholder Analysis',
          'Preliminary Budget'
        ],
        stakeholders: ['Project Developer', 'Technical Consultant', 'Financial Advisor'],
        costs: { estimated: 25000, actual: 23500 },
        risks: [
          {
            description: 'Regulatory changes affecting project viability',
            probability: 'medium',
            impact: 'high',
            mitigation: 'Monitor policy developments and maintain regulatory contacts'
          }
        ],
        kpis: [
          { metric: 'Stakeholder Engagement', target: 95, actual: 98, unit: '%' },
          { metric: 'Budget Adherence', target: 100, actual: 106, unit: '%' }
        ]
      },
      {
        id: 'milestone-2',
        phase: 'Development',
        title: 'Methodology Selection & PDD Development',
        description: 'Select appropriate methodology and develop Project Design Document',
        status: 'in_progress',
        priority: 'critical',
        startDate: '2024-02-16',
        endDate: '2024-04-30',
        estimatedDuration: 74,
        dependencies: ['milestone-1'],
        deliverables: [
          'Methodology Documentation',
          'Project Design Document (PDD)',
          'Baseline Study',
          'Monitoring Plan'
        ],
        stakeholders: ['Technical Team', 'Methodology Expert', 'Local Community'],
        costs: { estimated: 75000 },
        risks: [
          {
            description: 'Methodology requirements more complex than expected',
            probability: 'medium',
            impact: 'medium',
            mitigation: 'Early engagement with methodology experts and buffer time allocation'
          }
        ],
        kpis: [
          { metric: 'PDD Completeness', target: 100, actual: 75, unit: '%' },
          { metric: 'Baseline Accuracy', target: 95, unit: '%' }
        ]
      },
      {
        id: 'milestone-3',
        phase: 'Validation',
        title: 'Third-Party Validation',
        description: 'Independent validation of PDD by accredited validation body',
        status: 'not_started',
        priority: 'high',
        startDate: '2024-05-01',
        endDate: '2024-07-15',
        estimatedDuration: 75,
        dependencies: ['milestone-2'],
        deliverables: [
          'Validation Report',
          'PDD Revisions',
          'Stakeholder Consultation Record'
        ],
        stakeholders: ['Validation Body', 'Registry', 'Local Authorities'],
        costs: { estimated: 45000 },
        risks: [
          {
            description: 'Validation findings requiring significant PDD changes',
            probability: 'medium',
            impact: 'high',
            mitigation: 'Pre-validation review and stakeholder engagement'
          }
        ],
        kpis: [
          { metric: 'Validation Success Rate', target: 100, unit: '%' },
          { metric: 'Time to Validation', target: 75, unit: 'days' }
        ]
      },
      {
        id: 'milestone-4',
        phase: 'Registration',
        title: 'Project Registration',
        description: 'Official registration with carbon standard registry',
        status: 'not_started',
        priority: 'high',
        startDate: '2024-07-16',
        endDate: '2024-08-30',
        estimatedDuration: 45,
        dependencies: ['milestone-3'],
        deliverables: [
          'Registration Application',
          'Registry Certificate',
          'Project Database Entry'
        ],
        stakeholders: ['Registry Authority', 'Legal Team'],
        costs: { estimated: 15000 },
        risks: [
          {
            description: 'Registry processing delays',
            probability: 'low',
            impact: 'medium',
            mitigation: 'Early submission and regular follow-up with registry'
          }
        ],
        kpis: [
          { metric: 'Registration Timeline', target: 45, unit: 'days' },
          { metric: 'Documentation Completeness', target: 100, unit: '%' }
        ]
      },
      {
        id: 'milestone-5',
        phase: 'Implementation',
        title: 'Project Implementation Launch',
        description: 'Begin physical implementation of project activities',
        status: 'not_started',
        priority: 'critical',
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        estimatedDuration: 122,
        dependencies: ['milestone-4'],
        deliverables: [
          'Implementation Plan',
          'Equipment Installation',
          'Training Programs',
          'Monitoring System Setup'
        ],
        stakeholders: ['Implementation Team', 'Equipment Suppliers', 'Local Community'],
        costs: { estimated: project.budget ? project.budget * 0.6 : 200000 },
        risks: [
          {
            description: 'Equipment delivery delays',
            probability: 'medium',
            impact: 'medium',
            mitigation: 'Diversified supplier base and contingency planning'
          },
          {
            description: 'Weather-related implementation delays',
            probability: 'high',
            impact: 'low',
            mitigation: 'Seasonal planning and flexible scheduling'
          }
        ],
        kpis: [
          { metric: 'Implementation Progress', target: 100, unit: '%' },
          { metric: 'Equipment Uptime', target: 95, unit: '%' },
          { metric: 'Safety Incidents', target: 0, unit: 'incidents' }
        ]
      },
      {
        id: 'milestone-6',
        phase: 'Monitoring',
        title: 'First Verification Period',
        description: 'Complete first monitoring period and verification for credit issuance',
        status: 'not_started',
        priority: 'high',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        estimatedDuration: 180,
        dependencies: ['milestone-5'],
        deliverables: [
          'Monitoring Reports',
          'Verification Statement',
          'Credit Issuance Request'
        ],
        stakeholders: ['Monitoring Team', 'Verification Body', 'Registry'],
        costs: { estimated: 35000 },
        risks: [
          {
            description: 'Monitoring data quality issues',
            probability: 'medium',
            impact: 'high',
            mitigation: 'Robust monitoring protocols and regular data validation'
          }
        ],
        kpis: [
          { metric: 'Data Quality Score', target: 95, unit: '%' },
          { metric: 'Credits Issued vs Target', target: 100, unit: '%' },
          { metric: 'Verification Timeline', target: 60, unit: 'days' }
        ]
      }
    ]

    // Calculate critical path
    const criticalPath = calculateCriticalPath(milestones)
    
    // Calculate overall progress
    const completedMilestones = milestones.filter(m => m.status === 'completed').length
    const overallProgress = (completedMilestones / milestones.length) * 100

    // Calculate risk score
    const riskScore = calculateRiskScore(milestones)

    // Calculate budget status
    const totalBudget = milestones.reduce((sum, m) => sum + m.costs.estimated, 0)
    const spentBudget = milestones.reduce((sum, m) => sum + (m.costs.actual || 0), 0)

    return {
      projectId: 'proj-001',
      totalDuration,
      phases: ['Development', 'Validation', 'Registration', 'Implementation', 'Monitoring'],
      milestones,
      criticalPath,
      overallProgress,
      riskScore,
      budgetStatus: {
        allocated: totalBudget,
        spent: spentBudget,
        remaining: totalBudget - spentBudget
      },
      nextActions: [
        {
          action: 'Complete baseline data collection',
          deadline: '2024-03-15',
          responsible: 'Technical Team',
          priority: 'high'
        },
        {
          action: 'Finalize stakeholder consultation plan',
          deadline: '2024-03-01',
          responsible: 'Community Liaison',
          priority: 'medium'
        },
        {
          action: 'Submit PDD draft for internal review',
          deadline: '2024-04-01',
          responsible: 'Project Manager',
          priority: 'critical'
        }
      ]
    }
  }

  const calculateCriticalPath = (milestones: ProjectMilestone[]): string[] => {
    // Simplified critical path calculation - in reality would use proper CPM algorithm
    return milestones
      .filter(m => m.priority === 'critical')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(m => m.id)
  }

  const calculateRiskScore = (milestones: ProjectMilestone[]): number => {
    const totalRisks = milestones.reduce((sum, m) => sum + m.risks.length, 0)
    const highRisks = milestones.reduce((sum, m) => 
      sum + m.risks.filter(r => r.probability === 'high' && r.impact === 'high').length, 0
    )
    
    return totalRisks > 0 ? Math.round((highRisks / totalRisks) * 100) : 0
  }

  const getStatusColor = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'delayed': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <PlayCircle className="h-4 w-4" />
      case 'delayed': return <Clock className="h-4 w-4" />
      case 'blocked': return <PauseCircle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const exportTimeline = () => {
    if (!timeline) return

    const data = {
      timeline,
      projectData,
      methodology: selectedMethodology,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-timeline-${new Date().toISOString().split('T')[0]}.json`
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
              <Calendar className="h-5 w-5 text-blue-600" />
              Project Timeline & Milestones
            </CardTitle>
            <CardDescription>
              Intelligent project planning with risk-adjusted timelines and milestone tracking
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {timeline && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCriticalPath(!showCriticalPath)}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {showCriticalPath ? 'Hide' : 'Show'} Critical Path
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTimeline}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Generating intelligent timeline...</span>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing</span>
              </div>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}

        {/* Timeline Overview */}
        {timeline && !isGenerating && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{Math.round(timeline.overallProgress)}%</div>
                    <div className="text-sm text-blue-700">Overall Progress</div>
                    <Progress value={timeline.overallProgress} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">{Math.round(timeline.totalDuration / 30)}</div>
                    <div className="text-sm text-green-700">Total Duration (months)</div>
                    <div className="text-xs text-green-600 mt-1">
                      {timeline.totalDuration} days
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-900">{timeline.riskScore}%</div>
                    <div className="text-sm text-yellow-700">Risk Score</div>
                    <Progress value={timeline.riskScore} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900">
                      ${Math.round(timeline.budgetStatus.remaining / 1000)}k
                    </div>
                    <div className="text-sm text-purple-700">Budget Remaining</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {Math.round((timeline.budgetStatus.remaining / timeline.budgetStatus.allocated) * 100)}% of total
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="actions">Next Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                {/* Timeline Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Project Timeline</span>
                      {showCriticalPath && (
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          Critical Path Highlighted
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {timeline.milestones.map((milestone, index) => {
                        const isCritical = timeline.criticalPath.includes(milestone.id)
                        const isHighlighted = showCriticalPath && isCritical
                        
                        return (
                          <div
                            key={milestone.id}
                            className={`p-4 border rounded-lg transition-all cursor-pointer ${
                              isHighlighted
                                ? 'border-red-300 bg-red-50'
                                : selectedMilestone?.id === milestone.id
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedMilestone(milestone)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(milestone.status)}
                                    <span className="font-medium">{milestone.title}</span>
                                  </div>
                                  <Badge className={getStatusColor(milestone.status)}>
                                    {milestone.status.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline" className={
                                    milestone.priority === 'critical' ? 'text-red-700 border-red-300' :
                                    milestone.priority === 'high' ? 'text-orange-700 border-orange-300' :
                                    'text-gray-700 border-gray-300'
                                  }>
                                    {milestone.priority}
                                  </Badge>
                                  {isCritical && (
                                    <Badge variant="destructive" className="text-xs">
                                      Critical Path
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {milestone.startDate} - {milestone.endDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {milestone.estimatedDuration} days
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    ${milestone.costs.estimated.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedMilestone(milestone)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                            
                            {/* Progress bar for in-progress milestones */}
                            {milestone.status === 'in_progress' && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>75%</span>
                                </div>
                                <Progress value={75} className="h-2" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4">
                {selectedMilestone ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{selectedMilestone.title}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMilestone(null)}
                        >
                          Back to List
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Milestone Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Phase:</span>
                              <Badge variant="outline">{selectedMilestone.phase}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge className={getStatusColor(selectedMilestone.status)}>
                                {selectedMilestone.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Priority:</span>
                              <Badge variant="outline">{selectedMilestone.priority}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span>{selectedMilestone.estimatedDuration} days</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Financial</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Estimated Cost:</span>
                              <span>${selectedMilestone.costs.estimated.toLocaleString()}</span>
                            </div>
                            {selectedMilestone.costs.actual && (
                              <div className="flex justify-between">
                                <span>Actual Cost:</span>
                                <span>${selectedMilestone.costs.actual.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Budget Variance:</span>
                              <span className={
                                selectedMilestone.costs.actual 
                                  ? selectedMilestone.costs.actual > selectedMilestone.costs.estimated
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                  : 'text-gray-500'
                              }>
                                {selectedMilestone.costs.actual 
                                  ? `${((selectedMilestone.costs.actual - selectedMilestone.costs.estimated) / selectedMilestone.costs.estimated * 100).toFixed(1)}%`
                                  : 'TBD'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <h4 className="font-medium mb-3">Deliverables</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedMilestone.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FileText className="h-3 w-3 text-gray-500" />
                              <span>{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* KPIs */}
                      <div>
                        <h4 className="font-medium mb-3">Key Performance Indicators</h4>
                        <div className="space-y-3">
                          {selectedMilestone.kpis.map((kpi, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium text-sm">{kpi.metric}</span>
                                <div className="text-xs text-gray-600">
                                  Target: {kpi.target}{kpi.unit}
                                  {kpi.actual && ` • Actual: ${kpi.actual}${kpi.unit}`}
                                </div>
                              </div>
                              {kpi.actual && (
                                <Progress 
                                  value={Math.min((kpi.actual / kpi.target) * 100, 100)} 
                                  className="w-20 h-2" 
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risks */}
                      <div>
                        <h4 className="font-medium mb-3">Associated Risks</h4>
                        <div className="space-y-3">
                          {selectedMilestone.risks.map((risk, index) => (
                            <div key={index} className="p-3 border rounded bg-yellow-50">
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-medium text-sm">{risk.description}</span>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {risk.probability} probability
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {risk.impact} impact
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>Mitigation:</strong> {risk.mitigation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timeline.milestones.map((milestone) => (
                      <Card
                        key={milestone.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedMilestone(milestone)}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(milestone.status)}>
                                {milestone.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">{milestone.phase}</Badge>
                            </div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {milestone.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{milestone.estimatedDuration} days</span>
                              <span>${(milestone.costs.estimated / 1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                <div className="space-y-4">
                  {timeline.milestones.map((milestone) => 
                    milestone.risks.length > 0 && (
                      <Card key={milestone.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{milestone.title} - Risks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {milestone.risks.map((risk, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium">{risk.description}</h4>
                                  <div className="flex gap-2">
                                    <Badge 
                                      variant="outline"
                                      className={
                                        risk.probability === 'high' ? 'text-red-700 border-red-300' :
                                        risk.probability === 'medium' ? 'text-yellow-700 border-yellow-300' :
                                        'text-green-700 border-green-300'
                                      }
                                    >
                                      {risk.probability} probability
                                    </Badge>
                                    <Badge 
                                      variant="outline"
                                      className={
                                        risk.impact === 'high' ? 'text-red-700 border-red-300' :
                                        risk.impact === 'medium' ? 'text-yellow-700 border-yellow-300' :
                                        'text-green-700 border-green-300'
                                      }
                                    >
                                      {risk.impact} impact
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  <strong>Mitigation Strategy:</strong> {risk.mitigation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Immediate Next Actions</CardTitle>
                    <CardDescription>
                      Priority actions to keep the project on track
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {timeline.nextActions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium">{action.action}</span>
                              <Badge 
                                variant="outline"
                                className={
                                  action.priority === 'critical' ? 'text-red-700 border-red-300' :
                                  action.priority === 'high' ? 'text-orange-700 border-orange-300' :
                                  'text-gray-700 border-gray-300'
                                }
                              >
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {action.deadline}
                              </span>
                              <span className="flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" />
                                Responsible: {action.responsible}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* No Data State */}
        {!timeline && !isGenerating && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">
                Project timeline will be generated automatically
              </div>
              <p className="text-sm text-gray-400">
                Complete project details to see intelligent timeline and milestone planning
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}