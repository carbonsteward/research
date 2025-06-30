'use client'

/**
 * BMAD Climate Risk Coordinate Viewer
 * Interactive component for coordinate-level physical risk assessment
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, MapPin, AlertTriangle, Shield, TrendingUp, Database, Clock, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface CoordinatePoint {
  latitude: number
  longitude: number
  name?: string
  description?: string
}

interface RiskFactor {
  id: string
  category: 'heat' | 'water' | 'wind' | 'drought' | 'fire' | 'flood' | 'sea_level' | 'composite'
  severity: 'low' | 'medium' | 'high' | 'extreme'
  confidence: number
  value: number
  unit: string
  timeframe: '2030' | '2050' | '2100' | 'current'
  scenario: 'RCP2.6' | 'RCP4.5' | 'RCP8.5' | 'historical'
  source: string
  methodology: string
}

interface PhysicalRiskAssessment {
  coordinates: CoordinatePoint
  riskFactors: RiskFactor[]
  overallRiskScore: number
  primaryHazards: string[]
  adaptationRecommendations: string[]
  dataQuality: 'high' | 'medium' | 'low'
  lastUpdated: Date
  sources: string[]
}

interface CoordinateRiskViewerProps {
  className?: string
  defaultCoordinates?: CoordinatePoint
  onAssessmentComplete?: (assessment: PhysicalRiskAssessment) => void
}

export function CoordinateRiskViewer({
  className,
  defaultCoordinates,
  onAssessmentComplete
}: CoordinateRiskViewerProps) {
  // State management
  const [coordinates, setCoordinates] = useState<CoordinatePoint>(
    defaultCoordinates || { latitude: 40.7128, longitude: -74.0060, name: 'New York City' }
  )
  const [scenarios, setScenarios] = useState<string[]>(['RCP4.5'])
  const [timeframes, setTimeframes] = useState<string[]>(['2050'])
  const [assessment, setAssessment] = useState<PhysicalRiskAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSources, setAvailableSources] = useState<any[]>([])

  // Load available data sources on mount
  useEffect(() => {
    loadAvailableSources()
  }, [])

  const loadAvailableSources = async () => {
    try {
      const response = await fetch('/api/climate-risk/coordinate', { method: 'OPTIONS' })
      const data = await response.json()
      if (data.success) {
        setAvailableSources(data.data.sources)
      }
    } catch (error) {
      console.error('Failed to load data sources:', error)
    }
  }

  // Perform risk assessment
  const performAssessment = async () => {
    if (!coordinates.latitude || !coordinates.longitude) {
      setError('Please provide valid coordinates')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/climate-risk/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          scenarios,
          timeframes,
          includeAdaptation: true,
          cacheStrategy: 'prefer_cache'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Assessment failed')
      }

      setAssessment(data.data)
      onAssessmentComplete?.(data.data)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Risk severity colors
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#22c55e',
      medium: '#eab308',
      high: '#f97316',
      extreme: '#ef4444'
    }
    return colors[severity as keyof typeof colors] || '#6b7280'
  }

  // Risk category icons and colors
  const getRiskCategoryInfo = (category: string) => {
    const info = {
      heat: { icon: '🌡️', color: '#ef4444', label: 'Heat Stress' },
      water: { icon: '💧', color: '#3b82f6', label: 'Water Stress' },
      wind: { icon: '💨', color: '#6b7280', label: 'Wind Hazards' },
      drought: { icon: '🏜️', color: '#a3a3a3', label: 'Drought Risk' },
      fire: { icon: '🔥', color: '#ea580c', label: 'Wildfire Risk' },
      flood: { icon: '🌊', color: '#0ea5e9', label: 'Flood Risk' },
      sea_level: { icon: '🌊', color: '#0284c7', label: 'Sea Level Rise' },
      composite: { icon: '⚠️', color: '#7c3aed', label: 'Composite Risk' }
    }
    return info[category as keyof typeof info] || { icon: '❓', color: '#6b7280', label: 'Unknown' }
  }

  // Prepare chart data
  const riskFactorChartData = useMemo(() => {
    if (!assessment) return []

    const categoryData = assessment.riskFactors.reduce((acc, factor) => {
      const category = factor.category
      if (!acc[category]) {
        acc[category] = {
          category,
          totalRisk: 0,
          count: 0,
          avgConfidence: 0
        }
      }

      const severityWeight = { low: 0.25, medium: 0.5, high: 0.75, extreme: 1.0 }[factor.severity]
      acc[category].totalRisk += severityWeight
      acc[category].count += 1
      acc[category].avgConfidence += factor.confidence

      return acc
    }, {} as Record<string, any>)

    return Object.values(categoryData).map((item: any) => ({
      ...item,
      avgRisk: item.totalRisk / item.count,
      avgConfidence: item.avgConfidence / item.count,
      ...getRiskCategoryInfo(item.category)
    }))
  }, [assessment])

  const timelineData = useMemo(() => {
    if (!assessment) return []

    const timeframeMap: Record<string, number> = {}
    assessment.riskFactors.forEach(factor => {
      const year = factor.timeframe === 'current' ? '2024' : factor.timeframe
      const severityWeight = { low: 0.25, medium: 0.5, high: 0.75, extreme: 1.0 }[factor.severity]
      timeframeMap[year] = (timeframeMap[year] || 0) + severityWeight
    })

    return Object.entries(timeframeMap)
      .map(([year, risk]) => ({ year, risk: risk / 10 })) // Normalize
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
  }, [assessment])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Climate Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={coordinates.latitude}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  latitude: parseFloat(e.target.value) || 0
                }))}
                placeholder="e.g., 40.7128"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={coordinates.longitude}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  longitude: parseFloat(e.target.value) || 0
                }))}
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name (Optional)</Label>
              <Input
                id="name"
                value={coordinates.name || ''}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="e.g., New York City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenarios">Climate Scenario</Label>
              <Select
                value={scenarios[0]}
                onValueChange={(value) => setScenarios([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RCP2.6">RCP 2.6 (Low emissions)</SelectItem>
                  <SelectItem value="RCP4.5">RCP 4.5 (Moderate emissions)</SelectItem>
                  <SelectItem value="RCP8.5">RCP 8.5 (High emissions)</SelectItem>
                  <SelectItem value="historical">Historical data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={performAssessment}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Assess Climate Risk
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Error:</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Results */}
      {assessment && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risks">Risk Factors</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="adaptation">Adaptation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Overall Risk Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall Risk Assessment</span>
                  <Badge
                    variant="outline"
                    className={`${
                      assessment.overallRiskScore >= 0.75 ? 'border-red-500 text-red-700' :
                      assessment.overallRiskScore >= 0.5 ? 'border-orange-500 text-orange-700' :
                      assessment.overallRiskScore >= 0.25 ? 'border-yellow-500 text-yellow-700' :
                      'border-green-500 text-green-700'
                    }`}
                  >
                    {assessment.dataQuality.toUpperCase()} QUALITY
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {Math.round(assessment.overallRiskScore * 100)}%
                  </div>
                  <Progress
                    value={assessment.overallRiskScore * 100}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Risk Score for {coordinates.name || `${coordinates.latitude}, ${coordinates.longitude}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-blue-600">
                      {assessment.riskFactors.length}
                    </div>
                    <div className="text-sm text-gray-600">Risk Factors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-green-600">
                      {assessment.sources.length}
                    </div>
                    <div className="text-sm text-gray-600">Data Sources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-purple-600">
                      {assessment.primaryHazards.length}
                    </div>
                    <div className="text-sm text-gray-600">Primary Hazards</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-orange-600">
                      {assessment.adaptationRecommendations.length}
                    </div>
                    <div className="text-sm text-gray-600">Recommendations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Hazards */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Climate Hazards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assessment.primaryHazards.map((hazard, index) => {
                    const info = getRiskCategoryInfo(hazard)
                    return (
                      <div
                        key={hazard}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{ borderColor: info.color + '30', backgroundColor: info.color + '10' }}
                      >
                        <div className="text-2xl">{info.icon}</div>
                        <div>
                          <div className="font-medium">{info.label}</div>
                          <div className="text-sm text-gray-600">Priority #{index + 1}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {/* Risk Factor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskFactorChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgRisk" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {assessment.riskFactors.map((factor, index) => {
                      const info = getRiskCategoryInfo(factor.category)
                      return (
                        <div
                          key={factor.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-lg">{info.icon}</div>
                            <div>
                              <div className="font-medium">{info.label}</div>
                              <div className="text-sm text-gray-600">
                                {factor.scenario} • {factor.timeframe} • {factor.source}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: getSeverityColor(factor.severity),
                                color: getSeverityColor(factor.severity)
                              }}
                            >
                              {factor.severity.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {Math.round(factor.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {/* Risk Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Risk Timeline Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="risk"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adaptation" className="space-y-4">
            {/* Adaptation Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Adaptation Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.adaptationRecommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900">
                          Recommendation #{index + 1}
                        </div>
                        <div className="text-green-700">{recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Sources Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assessment.sources.map((source, index) => {
                    const sourceInfo = availableSources.find(s => s.name === source)
                    return (
                      <div
                        key={source}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">{source.replace(/_/g, ' ')}</div>
                          {sourceInfo && (
                            <div className="text-sm text-gray-600">
                              {sourceInfo.coverage} • {sourceInfo.resolution}
                            </div>
                          )}
                        </div>
                        {sourceInfo && (
                          <Badge variant="outline">
                            {Math.round(sourceInfo.reliabilityScore * 100)}% reliable
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Last updated: {new Date(assessment.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
