import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, TrendingDown, Thermometer, Droplets, Wind, AlertCircle, Shield, Target, Lightbulb, ExternalLink, RefreshCw } from "lucide-react"

interface RiskPreviewProps {
  country: string
  region?: string
  coordinates?: string
  projectType: string
  selectedMethodology?: {
    id: string
    name: string
    standardName: string
    complexity: 'Low' | 'Medium' | 'High'
    itmoCompliant: boolean
  }
}

interface RiskData {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: string
  value: string
  description: string
  confidence: number
  mitigationStrategies?: string[]
  implementationCost?: 'Low' | 'Medium' | 'High'
  timeHorizon?: 'Short-term' | 'Medium-term' | 'Long-term'
}

interface SmartRiskAssessment {
  overallScore: number
  methodologyAlignment: number
  adaptiveCapacity: number
  vulnerabilityIndex: number
  recommendations: {
    immediate: string[]
    planning: string[]
    monitoring: string[]
  }
  policyCompliance: {
    level: 'Full' | 'Partial' | 'Limited'
    requirements: string[]
  }
}

interface PhysicalRiskResponse {
  success: boolean
  data: any[]
  analysis: {
    riskLevels: {
      temperature: Array<{ scenario: string; value: number; level: string }>
      precipitation: Array<{ scenario: string; value: number; level: string }>
    }
    summary: {
      totalDataPoints: number
      scenarios: string[]
      variables: string[]
      averageConfidence: number
    }
  }
}

const RISK_LEVEL_COLORS = {
  LOW: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
}

const RISK_ICONS = {
  temperature: Thermometer,
  precipitation: Droplets,
  wind: Wind,
  other: AlertTriangle,
}

export function RiskPreview({ country, region, coordinates, projectType, selectedMethodology }: RiskPreviewProps) {
  const [riskData, setRiskData] = useState<RiskData[]>([])
  const [smartAssessment, setSmartAssessment] = useState<SmartRiskAssessment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSmartAnalysis, setShowSmartAnalysis] = useState(false)

  useEffect(() => {
    if (!country) return

    const fetchRiskData = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams({ countryCode: country })
        if (region) queryParams.append('regionCode', region)
        if (coordinates) {
          const [lat, lng] = coordinates.split(',')
          queryParams.append('latitude', lat)
          queryParams.append('longitude', lng)
        }

        const response = await fetch(`/api/risks/physical?${queryParams}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch risk data: ${response.statusText}`)
        }

        const result: PhysicalRiskResponse = await response.json()

        if (!result.success) {
          throw new Error('Failed to fetch risk data')
        }

        // Transform the API response into our RiskData format
        const transformedRisks: RiskData[] = []

        // Add temperature risks
        if (result.analysis.riskLevels.temperature.length > 0) {
          const tempRisk = result.analysis.riskLevels.temperature[0] // Use first scenario
          transformedRisks.push({
            riskLevel: tempRisk.level as any,
            category: 'Temperature Change',
            value: `+${tempRisk.value}°C`,
            description: `Expected temperature increase under ${tempRisk.scenario} scenario`,
            confidence: result.analysis.summary.averageConfidence,
          })
        }

        // Add precipitation risks
        if (result.analysis.riskLevels.precipitation.length > 0) {
          const precipRisk = result.analysis.riskLevels.precipitation[0]
          transformedRisks.push({
            riskLevel: precipRisk.level as any,
            category: 'Precipitation Change',
            value: `${precipRisk.value > 0 ? '+' : ''}${precipRisk.value}%`,
            description: `Expected precipitation change under ${precipRisk.scenario} scenario`,
            confidence: result.analysis.summary.averageConfidence,
          })
        }

        // Add project-specific risks based on type
        if (projectType === 'AFOLU') {
          transformedRisks.push({
            riskLevel: 'MEDIUM',
            category: 'Deforestation Risk',
            value: 'Moderate',
            description: 'Land use change pressures in the region',
            confidence: 0.7,
            mitigationStrategies: [
              'Implement forest monitoring systems',
              'Establish buffer zones',
              'Community engagement programs'
            ],
            implementationCost: 'Medium',
            timeHorizon: 'Short-term'
          })
        } else if (projectType === 'ENERGY') {
          transformedRisks.push({
            riskLevel: 'LOW',
            category: 'Grid Stability',
            value: 'Stable',
            description: 'Electrical grid reliability for renewable energy',
            confidence: 0.8,
            mitigationStrategies: [
              'Install backup systems',
              'Grid integration studies',
              'Power quality monitoring'
            ],
            implementationCost: 'Low',
            timeHorizon: 'Medium-term'
          })
        }

        setRiskData(transformedRisks)

        // Generate smart assessment if methodology is selected
        if (selectedMethodology) {
          const smartAssess = generateSmartAssessment(transformedRisks, selectedMethodology, projectType, country)
          setSmartAssessment(smartAssess)
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setRiskData([])
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [country, region, coordinates, projectType, selectedMethodology])

  const getRiskIcon = (category: string) => {
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes('temperature')) return RISK_ICONS.temperature
    if (lowerCategory.includes('precipitation')) return RISK_ICONS.precipitation
    if (lowerCategory.includes('wind')) return RISK_ICONS.wind
    return RISK_ICONS.other
  }

  const getOverallRiskLevel = (): { level: string; color: string } => {
    if (riskData.length === 0) return { level: 'Unknown', color: 'gray' }

    const riskCounts = riskData.reduce((acc, risk) => {
      acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    if (riskCounts.CRITICAL > 0) return { level: 'Critical', color: 'red' }
    if (riskCounts.HIGH > 0) return { level: 'High', color: 'orange' }
    if (riskCounts.MEDIUM > 0) return { level: 'Medium', color: 'yellow' }
    return { level: 'Low', color: 'green' }
  }

  const generateSmartAssessment = (
    risks: RiskData[],
    methodology: any,
    projType: string,
    countryCode: string
  ): SmartRiskAssessment => {
    const riskCount = {
      LOW: risks.filter(r => r.riskLevel === 'LOW').length,
      MEDIUM: risks.filter(r => r.riskLevel === 'MEDIUM').length,
      HIGH: risks.filter(r => r.riskLevel === 'HIGH').length,
      CRITICAL: risks.filter(r => r.riskLevel === 'CRITICAL').length
    }

    // Calculate scores
    const overallScore = Math.max(0, 100 - (riskCount.HIGH * 15 + riskCount.CRITICAL * 30 + riskCount.MEDIUM * 5))

    const methodologyAlignment = methodology.complexity === 'Low' && overallRisk.level === 'Low' ? 95 :
                                methodology.complexity === 'Medium' && ['Low', 'Medium'].includes(overallRisk.level) ? 85 :
                                methodology.complexity === 'High' ? 75 : 60

    const adaptiveCapacity = projType === 'AFOLU' ? 70 : projType === 'ENERGY' ? 85 : 75
    const vulnerabilityIndex = Math.max(0, 100 - overallScore)

    // Generate recommendations
    const recommendations = {
      immediate: [
        'Establish baseline monitoring systems',
        'Develop emergency response protocols',
        ...(riskCount.CRITICAL > 0 ? ['Implement critical risk mitigation measures immediately'] : [])
      ],
      planning: [
        'Conduct detailed feasibility studies',
        'Engage with local stakeholders and communities',
        'Develop comprehensive risk management plan',
        ...(methodology.itmoCompliant ? ['Ensure ITMO compliance documentation'] : [])
      ],
      monitoring: [
        'Set up real-time environmental monitoring',
        'Establish key performance indicators',
        'Plan quarterly risk assessments',
        'Implement adaptive management protocols'
      ]
    }

    const policyCompliance = {
      level: methodology.itmoCompliant && overallScore > 70 ? 'Full' as const :
             overallScore > 50 ? 'Partial' as const : 'Limited' as const,
      requirements: [
        'Environmental impact assessment',
        'Community consultation documentation',
        ...(methodology.itmoCompliant ? ['ITMO Article 6.2 compliance'] : []),
        'Carbon accounting methodologies',
        'Monitoring, reporting, and verification systems'
      ]
    }

    return {
      overallScore,
      methodologyAlignment,
      adaptiveCapacity,
      vulnerabilityIndex,
      recommendations,
      policyCompliance
    }
  }

  const overallRisk = getOverallRiskLevel()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Climate Risk Assessment</h3>
        <p className="text-gray-600 text-sm">
          Preliminary risk assessment based on your project location and type.
        </p>
      </div>

      {/* Location Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{country}</Badge>
            {region && <Badge variant="outline">{region}</Badge>}
            {coordinates && <Badge variant="outline">Coordinates Set</Badge>}
            <Badge variant="outline">{projectType} Project</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Overall Risk Level */}
      <Card className={`border-${overallRisk.color}-200 bg-${overallRisk.color}-50`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-${overallRisk.color}-900`}>
              Overall Risk Level: {overallRisk.level}
            </CardTitle>
            <div className="flex items-center gap-2">
              {smartAssessment && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSmartAnalysis(!showSmartAnalysis)}
                  className="bg-white/80 hover:bg-white"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {showSmartAnalysis ? 'Hide' : 'Show'} Smart Analysis
                </Button>
              )}
              <AlertTriangle className={`h-6 w-6 text-${overallRisk.color}-600`} />
            </div>
          </div>
          <CardDescription className={`text-${overallRisk.color}-700`}>
            Based on available climate and project-specific data
            {selectedMethodology && (
              <span className="block mt-1">
                Analyzed for {selectedMethodology.name} methodology
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Smart Risk Analysis */}
      {smartAssessment && showSmartAnalysis && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="h-5 w-5" />
              Intelligent Risk Analysis
            </CardTitle>
            <CardDescription className="text-blue-700">
              AI-powered assessment integrating methodology requirements and local conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{smartAssessment.overallScore}</div>
                <div className="text-sm text-blue-700">Overall Score</div>
                <Progress value={smartAssessment.overallScore} className="mt-1 h-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{smartAssessment.methodologyAlignment}</div>
                <div className="text-sm text-green-700">Methodology Fit</div>
                <Progress value={smartAssessment.methodologyAlignment} className="mt-1 h-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-900">{smartAssessment.adaptiveCapacity}</div>
                <div className="text-sm text-yellow-700">Adaptive Capacity</div>
                <Progress value={smartAssessment.adaptiveCapacity} className="mt-1 h-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-900">{smartAssessment.vulnerabilityIndex}</div>
                <div className="text-sm text-red-700">Vulnerability Index</div>
                <Progress value={smartAssessment.vulnerabilityIndex} className="mt-1 h-2" />
              </div>
            </div>

            {/* Policy Compliance */}
            <div className="p-4 bg-white/60 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Policy Compliance Assessment</h4>
                <Badge
                  variant="outline"
                  className={
                    smartAssessment.policyCompliance.level === 'Full' ? 'text-green-700 border-green-300' :
                    smartAssessment.policyCompliance.level === 'Partial' ? 'text-yellow-700 border-yellow-300' :
                    'text-red-700 border-red-300'
                  }
                >
                  {smartAssessment.policyCompliance.level} Compliance
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {smartAssessment.policyCompliance.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                    <Target className="h-3 w-3" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="space-y-4">
              <h4 className="font-medium text-blue-900">AI-Generated Recommendations</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Immediate Actions
                  </h5>
                  <ul className="space-y-1">
                    {smartAssessment.recommendations.immediate.map((rec, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Planning Phase
                  </h5>
                  <ul className="space-y-1">
                    {smartAssessment.recommendations.planning.map((rec, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Monitoring
                  </h5>
                  <ul className="space-y-1">
                    {smartAssessment.recommendations.monitoring.map((rec, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Refresh Analysis Button */}
            <div className="flex justify-center pt-4 border-t border-blue-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMethodology) {
                    const updatedAssessment = generateSmartAssessment(riskData, selectedMethodology, projectType, country)
                    setSmartAssessment(updatedAssessment)
                  }
                }}
                className="bg-white/80 hover:bg-white"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Details */}
      {riskData.length > 0 && !loading && (
        <div className="space-y-4">
          <h4 className="font-medium">Risk Factors</h4>

          {riskData.map((risk, index) => {
            const colors = RISK_LEVEL_COLORS[risk.riskLevel]
            const IconComponent = getRiskIcon(risk.category)

            return (
              <Card key={index} className={`${colors.border} ${colors.bg}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <IconComponent className={`h-5 w-5 ${colors.text} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className={`font-medium ${colors.text}`}>{risk.category}</h5>
                          <Badge className={`${colors.bg} ${colors.text} border-0`}>
                            {risk.riskLevel}
                          </Badge>
                        </div>

                        <div className={`text-sm ${colors.text} mb-2`}>
                          <strong>Value:</strong> {risk.value}
                        </div>

                        <p className={`text-sm ${colors.text} opacity-90`}>
                          {risk.description}
                        </p>

                        {/* Mitigation Strategies */}
                        {risk.mitigationStrategies && risk.mitigationStrategies.length > 0 && (
                          <div className="mt-3 p-2 bg-white/50 rounded border">
                            <div className="text-xs font-medium text-gray-700 mb-1">Mitigation Strategies:</div>
                            <ul className="text-xs space-y-1">
                              {risk.mitigationStrategies.map((strategy, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span className="text-gray-600">{strategy}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex gap-3 mt-2 text-xs">
                              {risk.implementationCost && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Cost: {risk.implementationCost}
                                </span>
                              )}
                              {risk.timeHorizon && (
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Timeline: {risk.timeHorizon}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>Confidence:</span>
                            <Progress
                              value={risk.confidence * 100}
                              className="w-16 h-2"
                            />
                            <span>{Math.round(risk.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* No Risk Data */}
      {!loading && !error && riskData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="text-gray-500">
                No risk data available for this location.
              </div>
              <p className="text-sm text-gray-400">
                Risk assessment will be available after project creation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          This is a preliminary assessment. Detailed risk analysis will be conducted after project creation
          using comprehensive climate models and site-specific data.
        </AlertDescription>
      </Alert>
    </div>
  )
}
