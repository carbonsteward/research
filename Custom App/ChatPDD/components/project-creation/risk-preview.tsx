import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, TrendingDown, Thermometer, Droplets, Wind, AlertCircle } from "lucide-react"

interface RiskPreviewProps {
  country: string
  region?: string
  coordinates?: string
  projectType: string
}

interface RiskData {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: string
  value: string
  description: string
  confidence: number
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

export function RiskPreview({ country, region, coordinates, projectType }: RiskPreviewProps) {
  const [riskData, setRiskData] = useState<RiskData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          })
        } else if (projectType === 'ENERGY') {
          transformedRisks.push({
            riskLevel: 'LOW',
            category: 'Grid Stability',
            value: 'Stable',
            description: 'Electrical grid reliability for renewable energy',
            confidence: 0.8,
          })
        }

        setRiskData(transformedRisks)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setRiskData([])
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [country, region, coordinates, projectType])

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
            <AlertTriangle className={`h-6 w-6 text-${overallRisk.color}-600`} />
          </div>
          <CardDescription className={`text-${overallRisk.color}-700`}>
            Based on available climate and project-specific data
          </CardDescription>
        </CardHeader>
      </Card>

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
