"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Leaf,
  BarChart3,
  AlertTriangle,
  Target,
  CheckCircle,
  Clock,
  Lightbulb,
  RefreshCw,
  Download,
  Info
} from 'lucide-react'

interface CarbonCreditEstimation {
  annualCredits: {
    baseline: number
    project: number
    net: number
  }
  totalCredits: {
    year5: number
    year10: number
    year20: number
  }
  financialProjections: {
    conservative: { price: number; revenue: number }
    moderate: { price: number; revenue: number }
    optimistic: { price: number; revenue: number }
  }
  methodology: {
    name: string
    efficiency: number
    uncertainty: number
    monitoringCosts: number
  }
  riskAdjustments: {
    climateRisk: number
    implementationRisk: number
    marketRisk: number
    totalAdjustment: number
  }
  qualityMetrics: {
    additionality: number
    permanence: number
    leakage: number
    overallQuality: number
  }
  timeline: {
    phases: Array<{
      phase: string
      duration: string
      credits: number
      costs: number
    }>
  }
}

interface CarbonCreditEstimatorProps {
  projectData: {
    type: string
    country: string
    region?: string
    coordinates?: string
    estimatedCredits?: number
    budget?: number
    timeline?: string
  }
  selectedMethodology?: {
    id: string
    name: string
    standardName: string
    complexity: 'Low' | 'Medium' | 'High'
    itmoCompliant: boolean
    matchScore?: number
  }
  riskAssessment?: {
    overallScore: number
    vulnerabilityIndex: number
  }
  className?: string
}

export function CarbonCreditEstimator({
  projectData,
  selectedMethodology,
  riskAssessment,
  className = ""
}: CarbonCreditEstimatorProps) {
  const [estimation, setEstimation] = useState<CarbonCreditEstimation | null>(null)
  const [customInputs, setCustomInputs] = useState({
    projectArea: '',
    baselineEmissions: '',
    projectEmissions: '',
    implementationCost: '',
    operationalCost: ''
  })
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Auto-calculate when project data changes
  useEffect(() => {
    if (projectData.type && projectData.country) {
      calculateCredits()
    }
  }, [projectData, selectedMethodology, riskAssessment])

  const calculateCredits = useCallback(async () => {
    setIsCalculating(true)
    setCalculationProgress(0)

    try {
      // Simulate calculation phases
      const phases = [
        'Analyzing baseline emissions...',
        'Calculating project emissions...',
        'Applying methodology factors...',
        'Assessing risk adjustments...',
        'Generating financial projections...',
        'Finalizing estimates...'
      ]

      for (let i = 0; i < phases.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setCalculationProgress((i + 1) * 16.67)
      }

      const estimation = generateEstimation(projectData, selectedMethodology, riskAssessment, customInputs)
      setEstimation(estimation)

    } catch (error) {
      console.error('Error calculating credits:', error)
    } finally {
      setIsCalculating(false)
      setCalculationProgress(100)
    }
  }, [projectData, selectedMethodology, riskAssessment, customInputs])

  const generateEstimation = (
    project: any,
    methodology: any,
    risks: any,
    inputs: any
  ): CarbonCreditEstimation => {
    // Base calculation factors by project type
    const projectFactors = {
      'AFOLU': { baselineMultiplier: 1.2, efficiency: 0.85, uncertainty: 0.15 },
      'ENERGY': { baselineMultiplier: 1.5, efficiency: 0.90, uncertainty: 0.10 },
      'WASTE': { baselineMultiplier: 2.0, efficiency: 0.75, uncertainty: 0.20 },
      'TRANSPORT': { baselineMultiplier: 1.3, efficiency: 0.80, uncertainty: 0.18 },
      'MANUFACTURING': { baselineMultiplier: 1.8, efficiency: 0.88, uncertainty: 0.12 },
      'BUILDINGS': { baselineMultiplier: 1.4, efficiency: 0.85, uncertainty: 0.15 }
    }

    const factors = projectFactors[project.type as keyof typeof projectFactors] || projectFactors['AFOLU']

    // Calculate baseline and project emissions
    const baselineEmissions = project.estimatedCredits
      ? project.estimatedCredits * factors.baselineMultiplier
      : parseInt(inputs.baselineEmissions) || 10000

    const projectEmissions = parseInt(inputs.projectEmissions) || baselineEmissions * 0.3
    const netCredits = Math.max(0, (baselineEmissions - projectEmissions) * factors.efficiency)

    // Methodology adjustments
    const methodologyEfficiency = methodology ?
      (methodology.complexity === 'High' ? 0.95 : methodology.complexity === 'Medium' ? 0.90 : 0.85) : 0.85

    const methodologyUncertainty = methodology ?
      (methodology.complexity === 'High' ? 0.08 : methodology.complexity === 'Medium' ? 0.12 : 0.18) : 0.15

    // Risk adjustments
    const climateRiskFactor = risks ? (100 - risks.vulnerabilityIndex) / 100 : 0.85
    const implementationRiskFactor = methodology ?
      (methodology.matchScore ? methodology.matchScore / 100 : 0.8) : 0.8
    const marketRiskFactor = project.country === 'USA' ? 0.95 :
                           ['DEU', 'GBR', 'CAN'].includes(project.country) ? 0.90 : 0.80

    const totalRiskAdjustment = climateRiskFactor * implementationRiskFactor * marketRiskFactor

    // Apply adjustments
    const adjustedNetCredits = netCredits * methodologyEfficiency * totalRiskAdjustment

    // Financial projections based on current market data
    const marketPrices = {
      conservative: project.type === 'AFOLU' ? 8 : project.type === 'ENERGY' ? 12 : 10,
      moderate: project.type === 'AFOLU' ? 15 : project.type === 'ENERGY' ? 22 : 18,
      optimistic: project.type === 'AFOLU' ? 25 : project.type === 'ENERGY' ? 35 : 30
    }

    // Quality metrics
    const additionality = methodology?.matchScore ? Math.min(95, methodology.matchScore + 10) : 80
    const permanence = project.type === 'AFOLU' ? 75 : project.type === 'ENERGY' ? 95 : 85
    const leakage = project.type === 'AFOLU' ? 15 : project.type === 'ENERGY' ? 5 : 10
    const overallQuality = (additionality + permanence + (100 - leakage)) / 3

    // Timeline phases
    const phases = [
      {
        phase: 'Project Development',
        duration: '6-12 months',
        credits: 0,
        costs: project.budget ? project.budget * 0.3 : 50000
      },
      {
        phase: 'Validation & Registration',
        duration: '3-6 months',
        credits: 0,
        costs: methodology?.complexity === 'High' ? 75000 :
               methodology?.complexity === 'Medium' ? 50000 : 30000
      },
      {
        phase: 'Implementation',
        duration: '12-18 months',
        credits: adjustedNetCredits * 0.3,
        costs: project.budget ? project.budget * 0.5 : 100000
      },
      {
        phase: 'Monitoring & Verification',
        duration: 'Ongoing',
        credits: adjustedNetCredits * 0.7,
        costs: adjustedNetCredits * 2 // $2 per credit for MRV
      }
    ]

    return {
      annualCredits: {
        baseline: Math.round(baselineEmissions),
        project: Math.round(projectEmissions),
        net: Math.round(adjustedNetCredits)
      },
      totalCredits: {
        year5: Math.round(adjustedNetCredits * 5),
        year10: Math.round(adjustedNetCredits * 10 * 0.95), // Slight degradation
        year20: Math.round(adjustedNetCredits * 20 * 0.90)
      },
      financialProjections: {
        conservative: {
          price: marketPrices.conservative,
          revenue: Math.round(adjustedNetCredits * marketPrices.conservative)
        },
        moderate: {
          price: marketPrices.moderate,
          revenue: Math.round(adjustedNetCredits * marketPrices.moderate)
        },
        optimistic: {
          price: marketPrices.optimistic,
          revenue: Math.round(adjustedNetCredits * marketPrices.optimistic)
        }
      },
      methodology: {
        name: methodology?.name || 'Standard Methodology',
        efficiency: Math.round(methodologyEfficiency * 100),
        uncertainty: Math.round(methodologyUncertainty * 100),
        monitoringCosts: Math.round(adjustedNetCredits * 2)
      },
      riskAdjustments: {
        climateRisk: Math.round((1 - climateRiskFactor) * 100),
        implementationRisk: Math.round((1 - implementationRiskFactor) * 100),
        marketRisk: Math.round((1 - marketRiskFactor) * 100),
        totalAdjustment: Math.round(totalRiskAdjustment * 100)
      },
      qualityMetrics: {
        additionality: Math.round(additionality),
        permanence: Math.round(permanence),
        leakage: Math.round(leakage),
        overallQuality: Math.round(overallQuality)
      },
      timeline: { phases }
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const exportEstimation = () => {
    if (!estimation) return

    const data = {
      projectInfo: projectData,
      methodology: selectedMethodology,
      estimation: estimation,
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carbon-credit-estimation-${new Date().toISOString().split('T')[0]}.json`
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
              <Calculator className="h-5 w-5 text-green-600" />
              Carbon Credit Estimation
            </CardTitle>
            <CardDescription>
              AI-powered carbon credit calculations with methodology integration
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Target className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
            {estimation && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportEstimation}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calculation Progress */}
        {isCalculating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Calculating carbon credits...</span>
              <span>{Math.round(calculationProgress)}%</span>
            </div>
            <Progress value={calculationProgress} className="h-2" />
          </div>
        )}

        {/* Advanced Custom Inputs */}
        {showAdvanced && (
          <Card className="bg-gray-50 border-dashed">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Custom Parameters</CardTitle>
              <CardDescription>Override default calculations with project-specific data</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectArea">Project Area (hectares)</Label>
                <Input
                  id="projectArea"
                  value={customInputs.projectArea}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, projectArea: e.target.value }))}
                  placeholder="e.g., 1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baselineEmissions">Baseline Emissions (tCO2e/year)</Label>
                <Input
                  id="baselineEmissions"
                  value={customInputs.baselineEmissions}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, baselineEmissions: e.target.value }))}
                  placeholder="e.g., 15000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectEmissions">Project Emissions (tCO2e/year)</Label>
                <Input
                  id="projectEmissions"
                  value={customInputs.projectEmissions}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, projectEmissions: e.target.value }))}
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="col-span-full flex gap-2">
                <Button onClick={calculateCredits} disabled={isCalculating}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Recalculate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {estimation && !isCalculating && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Annual Credits Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">
                        {estimation.annualCredits.net.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-700">Annual Credits (tCO2e)</div>
                      <Progress value={75} className="mt-2 h-2" />
                      <div className="text-xs text-blue-600 mt-1">75% of baseline</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">
                        {estimation.totalCredits.year10.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">10-Year Total</div>
                      <Progress value={estimation.riskAdjustments.totalAdjustment} className="mt-2 h-2" />
                      <div className="text-xs text-green-600 mt-1">
                        {estimation.riskAdjustments.totalAdjustment}% risk adjustment
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-900">
                        {estimation.qualityMetrics.overallQuality}%
                      </div>
                      <div className="text-sm text-yellow-700">Quality Score</div>
                      <Progress value={estimation.qualityMetrics.overallQuality} className="mt-2 h-2" />
                      <div className="text-xs text-yellow-600 mt-1">
                        {estimation.qualityMetrics.overallQuality >= 85 ? 'Premium' : 'Standard'} grade
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Methodology Impact */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">Methodology Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-purple-700 mb-1">Methodology</div>
                      <div className="font-medium text-purple-900">{estimation.methodology.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-700 mb-1">Efficiency</div>
                      <div className="font-medium text-purple-900">{estimation.methodology.efficiency}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-700 mb-1">Uncertainty</div>
                      <div className="font-medium text-purple-900">±{estimation.methodology.uncertainty}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Adjustments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Risk Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Climate Risk', value: estimation.riskAdjustments.climateRisk },
                      { label: 'Implementation', value: estimation.riskAdjustments.implementationRisk },
                      { label: 'Market Risk', value: estimation.riskAdjustments.marketRisk },
                      { label: 'Total Adjustment', value: 100 - estimation.riskAdjustments.totalAdjustment }
                    ].map((risk, index) => (
                      <div key={index} className="text-center">
                        <div className="text-lg font-bold text-orange-900">{risk.value}%</div>
                        <div className="text-sm text-orange-700">{risk.label}</div>
                        <Progress value={risk.value} className="mt-1 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              {/* Revenue Projections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { scenario: 'Conservative', data: estimation.financialProjections.conservative, color: 'blue' },
                  { scenario: 'Moderate', data: estimation.financialProjections.moderate, color: 'green' },
                  { scenario: 'Optimistic', data: estimation.financialProjections.optimistic, color: 'purple' }
                ].map((projection, index) => (
                  <Card key={index} className={`bg-${projection.color}-50 border-${projection.color}-200`}>
                    <CardHeader>
                      <CardTitle className={`text-${projection.color}-900`}>
                        {projection.scenario} Scenario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Price per Credit</div>
                        <div className={`text-xl font-bold text-${projection.color}-900`}>
                          ${projection.data.price}/tCO2e
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Annual Revenue</div>
                        <div className={`text-xl font-bold text-${projection.color}-900`}>
                          ${projection.data.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">10-Year Revenue</div>
                        <div className={`text-lg font-medium text-${projection.color}-800`}>
                          ${(projection.data.revenue * 10).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Annual Monitoring Costs</span>
                      <span className="font-medium">${estimation.methodology.monitoringCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Cost per Credit (MRV)</span>
                      <span className="font-medium">$2.00/tCO2e</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                      <span className="font-medium">Net Profit Margin</span>
                      <span className="font-bold text-green-700">
                        {Math.round(((estimation.financialProjections.moderate.revenue - estimation.methodology.monitoringCosts) / estimation.financialProjections.moderate.revenue) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              {/* Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { metric: 'Additionality', value: estimation.qualityMetrics.additionality, description: 'Project would not happen without carbon credits' },
                  { metric: 'Permanence', value: estimation.qualityMetrics.permanence, description: 'Long-term durability of emission reductions' },
                  { metric: 'Leakage Risk', value: estimation.qualityMetrics.leakage, description: 'Risk of shifting emissions elsewhere', inverse: true },
                  { metric: 'Overall Quality', value: estimation.qualityMetrics.overallQuality, description: 'Composite quality assessment' }
                ].map((quality, index) => (
                  <Card key={index} className={`border ${getQualityColor(quality.inverse ? 100 - quality.value : quality.value)}`}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{quality.metric}</h4>
                          <Badge className={getQualityColor(quality.inverse ? 100 - quality.value : quality.value)}>
                            {quality.value}%
                          </Badge>
                        </div>
                        <Progress value={quality.inverse ? 100 - quality.value : quality.value} className="h-2" />
                        <p className="text-sm text-gray-600">{quality.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quality Recommendations */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quality Enhancement Recommendations:</strong>
                  <ul className="mt-2 space-y-1">
                    {estimation.qualityMetrics.additionality < 85 && (
                      <li>• Strengthen additionality demonstration with detailed barrier analysis</li>
                    )}
                    {estimation.qualityMetrics.permanence < 80 && (
                      <li>• Implement additional permanence safeguards and buffer pools</li>
                    )}
                    {estimation.qualityMetrics.leakage > 15 && (
                      <li>• Develop comprehensive leakage monitoring and mitigation plan</li>
                    )}
                    <li>• Consider third-party validation for premium market access</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              {/* Implementation Timeline */}
              <div className="space-y-4">
                {estimation.timeline.phases.map((phase, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-medium text-blue-900">{phase.phase}</h4>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {phase.duration}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Credits Generated</div>
                          <div className="font-medium">
                            {phase.credits > 0 ? `${Math.round(phase.credits).toLocaleString()} tCO2e` : 'None'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Phase Costs</div>
                          <div className="font-medium">${phase.costs.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <Badge variant={index === 0 ? "default" : "outline"}>
                            {index === 0 ? "Current Phase" : "Planned"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Timeline Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">Timeline Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-green-700">Total Development Time</div>
                      <div className="font-bold text-green-900">24-36 months</div>
                    </div>
                    <div>
                      <div className="text-sm text-green-700">First Credits</div>
                      <div className="font-bold text-green-900">18-24 months</div>
                    </div>
                    <div>
                      <div className="text-sm text-green-700">Full Operation</div>
                      <div className="font-bold text-green-900">36+ months</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* No Data State */}
        {!estimation && !isCalculating && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">
                Carbon credit estimation will be generated automatically
              </div>
              <p className="text-sm text-gray-400">
                Complete project details and select a methodology to see detailed calculations
              </p>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            These are preliminary estimates based on project parameters and market data.
            Actual credit volumes may vary based on detailed feasibility studies, validation requirements,
            and real-world implementation factors. Consult with carbon market experts for investment decisions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
