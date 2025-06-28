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
  Satellite, 
  Map, 
  TrendingUp, 
  TrendingDown,
  TreePine, 
  Home,
  Factory,
  Droplets,
  Mountain,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Zap,
  Leaf,
  Globe,
  Target,
  Camera,
  Layers,
  Activity
} from 'lucide-react'

interface SatelliteImagery {
  id: string
  source: 'Sentinel-2' | 'Landsat-8' | 'Planet' | 'MODIS'
  date: string
  cloudCover: number
  resolution: string
  bands: string[]
  downloadUrl: string
  thumbnailUrl: string
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

interface LandUseClassification {
  class: string
  area: number // in hectares
  percentage: number
  confidence: number
  change: {
    trend: 'increasing' | 'decreasing' | 'stable'
    rate: number // percentage change per year
    significance: 'high' | 'medium' | 'low'
  }
  carbonStock: {
    current: number // tCO2/ha
    potential: number
    sequestrationRate: number // tCO2/ha/year
  }
}

interface ChangeDetection {
  period: {
    start: string
    end: string
  }
  totalAreaChanged: number
  changesByClass: Array<{
    fromClass: string
    toClass: string
    area: number
    confidence: number
    impact: 'positive' | 'negative' | 'neutral'
    carbonImpact: number // tCO2
  }>
  deforestationHotspots: Array<{
    id: string
    location: { lat: number; lng: number }
    area: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    detectedDate: string
  }>
  trends: {
    forestLoss: number // ha/year
    forestGain: number // ha/year
    netChange: number
    carbonImpact: number // tCO2/year
  }
}

interface VegetationAnalysis {
  ndvi: {
    average: number
    min: number
    max: number
    trend: 'improving' | 'declining' | 'stable'
    seasonality: Array<{ month: string; value: number }>
  }
  forestCover: {
    total: number // percentage
    dense: number
    moderate: number
    sparse: number
    degraded: number
  }
  biomass: {
    aboveGround: number // tons/ha
    belowGround: number
    total: number
    carbonContent: number // tCO2/ha
  }
  biodiversityIndex: {
    score: number
    habitat: {
      primaryForest: number
      secondaryForest: number
      grassland: number
      wetland: number
      agricultural: number
    }
  }
}

interface SatelliteAnalysisResults {
  location: {
    center: { lat: number; lng: number }
    bounds: { north: number; south: number; east: number; west: number }
    area: number // hectares
  }
  imagery: SatelliteImagery[]
  landUse: LandUseClassification[]
  changeDetection: ChangeDetection
  vegetation: VegetationAnalysis
  riskAssessment: {
    deforestationRisk: 'low' | 'medium' | 'high' | 'critical'
    degradationRisk: 'low' | 'medium' | 'high' | 'critical'
    fireRisk: 'low' | 'medium' | 'high' | 'critical'
    overallRisk: number // 0-100
    recommendations: string[]
  }
  projectSuitability: {
    afoluScore: number
    conservationPotential: number
    restorationOpportunity: number
    monitoringComplexity: 'low' | 'medium' | 'high'
    baselineQuality: number
  }
  verification: {
    dataQuality: number
    analysisConfidence: number
    verificationDate: string
    methodology: string
  }
}

interface SatelliteAnalysisProps {
  coordinates?: string
  projectType?: string
  analysisArea?: number // hectares
  className?: string
  onAnalysisComplete?: (results: SatelliteAnalysisResults) => void
}

export function SatelliteAnalysis({
  coordinates,
  projectType = 'AFOLU',
  analysisArea = 1000,
  className = "",
  onAnalysisComplete
}: SatelliteAnalysisProps) {
  const [results, setResults] = useState<SatelliteAnalysisResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedImagery, setSelectedImagery] = useState<SatelliteImagery | null>(null)
  const [activeView, setActiveView] = useState('overview')
  const [analysisParams, setAnalysisParams] = useState({
    startDate: '2023-01-01',
    endDate: '2024-06-01',
    cloudThreshold: 20,
    resolution: 'high',
    includeNDVI: true,
    includeChangeDetection: true
  })

  // Start analysis when coordinates are provided
  useEffect(() => {
    if (coordinates && coordinates.includes(',')) {
      performSatelliteAnalysis()
    }
  }, [coordinates, analysisParams])

  const performSatelliteAnalysis = useCallback(async () => {
    if (!coordinates) return

    setLoading(true)
    setAnalysisProgress(0)

    try {
      const analysisSteps = [
        'Acquiring satellite imagery...',
        'Processing multispectral data...',
        'Performing land use classification...',
        'Analyzing vegetation indices...',
        'Detecting changes over time...',
        'Assessing deforestation risks...',
        'Calculating carbon estimates...',
        'Generating final analysis...'
      ]

      for (let i = 0; i < analysisSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setAnalysisProgress((i + 1) / analysisSteps.length * 100)
      }

      // Generate mock satellite analysis results
      const analysisResults = generateMockAnalysisResults(coordinates, projectType, analysisArea)
      setResults(analysisResults)

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResults)
      }

    } catch (error) {
      console.error('Error performing satellite analysis:', error)
    } finally {
      setLoading(false)
    }
  }, [coordinates, projectType, analysisArea, analysisParams, onAnalysisComplete])

  const generateMockAnalysisResults = (
    coords: string,
    projType: string,
    area: number
  ): SatelliteAnalysisResults => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()))
    
    return {
      location: {
        center: { lat, lng },
        bounds: {
          north: lat + 0.05,
          south: lat - 0.05,
          east: lng + 0.05,
          west: lng - 0.05
        },
        area
      },
      imagery: [
        {
          id: 'img-001',
          source: 'Sentinel-2',
          date: '2024-05-15',
          cloudCover: 5,
          resolution: '10m',
          bands: ['B02', 'B03', 'B04', 'B08', 'B11', 'B12'],
          downloadUrl: '/api/satellite/download/img-001',
          thumbnailUrl: '/images/satellite-thumb-001.jpg',
          geometry: {
            type: 'Polygon',
            coordinates: [[[lng-0.05, lat-0.05], [lng+0.05, lat-0.05], [lng+0.05, lat+0.05], [lng-0.05, lat+0.05], [lng-0.05, lat-0.05]]]
          }
        },
        {
          id: 'img-002',
          source: 'Landsat-8',
          date: '2024-03-20',
          cloudCover: 15,
          resolution: '30m',
          bands: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'],
          downloadUrl: '/api/satellite/download/img-002',
          thumbnailUrl: '/images/satellite-thumb-002.jpg',
          geometry: {
            type: 'Polygon',
            coordinates: [[[lng-0.05, lat-0.05], [lng+0.05, lat-0.05], [lng+0.05, lat+0.05], [lng-0.05, lat+0.05], [lng-0.05, lat-0.05]]]
          }
        }
      ],
      landUse: [
        {
          class: 'Dense Forest',
          area: 650,
          percentage: 65,
          confidence: 92,
          change: { trend: 'stable', rate: -0.5, significance: 'low' },
          carbonStock: { current: 150, potential: 180, sequestrationRate: 3.2 }
        },
        {
          class: 'Grassland',
          area: 180,
          percentage: 18,
          confidence: 88,
          change: { trend: 'decreasing', rate: -2.1, significance: 'medium' },
          carbonStock: { current: 45, potential: 85, sequestrationRate: 1.8 }
        },
        {
          class: 'Agricultural',
          area: 120,
          percentage: 12,
          confidence: 85,
          change: { trend: 'increasing', rate: 1.8, significance: 'medium' },
          carbonStock: { current: 25, potential: 35, sequestrationRate: 0.8 }
        },
        {
          class: 'Water Bodies',
          area: 30,
          percentage: 3,
          confidence: 95,
          change: { trend: 'stable', rate: 0.1, significance: 'low' },
          carbonStock: { current: 0, potential: 0, sequestrationRate: 0 }
        },
        {
          class: 'Built-up',
          area: 20,
          percentage: 2,
          confidence: 90,
          change: { trend: 'increasing', rate: 3.5, significance: 'high' },
          carbonStock: { current: 5, potential: 5, sequestrationRate: 0 }
        }
      ],
      changeDetection: {
        period: { start: '2020-01-01', end: '2024-06-01' },
        totalAreaChanged: 85,
        changesByClass: [
          {
            fromClass: 'Dense Forest',
            toClass: 'Grassland',
            area: 45,
            confidence: 87,
            impact: 'negative',
            carbonImpact: -4725 // tCO2
          },
          {
            fromClass: 'Grassland',
            toClass: 'Agricultural',
            area: 25,
            confidence: 82,
            impact: 'negative',
            carbonImpact: -500
          },
          {
            fromClass: 'Grassland',
            toClass: 'Dense Forest',
            area: 15,
            confidence: 78,
            impact: 'positive',
            carbonImpact: 1575
          }
        ],
        deforestationHotspots: [
          {
            id: 'hotspot-001',
            location: { lat: lat + 0.01, lng: lng + 0.015 },
            area: 12.5,
            severity: 'medium',
            confidence: 89,
            detectedDate: '2024-02-15'
          },
          {
            id: 'hotspot-002',
            location: { lat: lat - 0.02, lng: lng - 0.01 },
            area: 8.2,
            severity: 'low',
            confidence: 76,
            detectedDate: '2024-04-03'
          }
        ],
        trends: {
          forestLoss: 11.25, // ha/year
          forestGain: 3.75,
          netChange: -7.5,
          carbonImpact: -937.5 // tCO2/year
        }
      },
      vegetation: {
        ndvi: {
          average: 0.72,
          min: 0.15,
          max: 0.89,
          trend: 'stable',
          seasonality: [
            { month: 'Jan', value: 0.68 },
            { month: 'Feb', value: 0.70 },
            { month: 'Mar', value: 0.74 },
            { month: 'Apr', value: 0.78 },
            { month: 'May', value: 0.82 },
            { month: 'Jun', value: 0.85 }
          ]
        },
        forestCover: {
          total: 65,
          dense: 45,
          moderate: 15,
          sparse: 5,
          degraded: 3
        },
        biomass: {
          aboveGround: 125,
          belowGround: 35,
          total: 160,
          carbonContent: 75
        },
        biodiversityIndex: {
          score: 78,
          habitat: {
            primaryForest: 35,
            secondaryForest: 30,
            grassland: 18,
            wetland: 5,
            agricultural: 12
          }
        }
      },
      riskAssessment: {
        deforestationRisk: 'medium',
        degradationRisk: 'low',
        fireRisk: 'medium',
        overallRisk: 45,
        recommendations: [
          'Implement continuous monitoring system for deforestation hotspots',
          'Establish buffer zones around sensitive forest areas',
          'Develop community-based forest management programs',
          'Install fire detection and early warning systems',
          'Create sustainable livelihood alternatives for local communities'
        ]
      },
      projectSuitability: {
        afoluScore: 85,
        conservationPotential: 78,
        restorationOpportunity: 72,
        monitoringComplexity: 'medium',
        baselineQuality: 88
      },
      verification: {
        dataQuality: 92,
        analysisConfidence: 87,
        verificationDate: new Date().toISOString().split('T')[0],
        methodology: 'Machine Learning Classification with Random Forest Algorithm'
      }
    }
  }

  const getLandUseColor = (className: string) => {
    const colors = {
      'Dense Forest': 'bg-green-600',
      'Moderate Forest': 'bg-green-400',
      'Sparse Forest': 'bg-green-200',
      'Grassland': 'bg-yellow-400',
      'Agricultural': 'bg-orange-400',
      'Water Bodies': 'bg-blue-500',
      'Built-up': 'bg-gray-500',
      'Bare Land': 'bg-amber-600'
    }
    return colors[className as keyof typeof colors] || 'bg-gray-400'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const exportAnalysisResults = () => {
    if (!results) return

    const data = {
      analysis: results,
      parameters: analysisParams,
      exportedAt: new Date().toISOString(),
      coordinates
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `satellite-analysis-${new Date().toISOString().split('T')[0]}.json`
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
              <Satellite className="h-5 w-5 text-blue-600" />
              Satellite Imagery Analysis
            </CardTitle>
            <CardDescription>
              AI-powered land use assessment and change detection using satellite imagery
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {results && (
              <>
                <Button variant="outline" onClick={exportAnalysisResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline" onClick={performSatelliteAnalysis} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Parameters */}
        <Card className="bg-gray-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={analysisParams.startDate}
                  onChange={(e) => setAnalysisParams(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={analysisParams.endDate}
                  onChange={(e) => setAnalysisParams(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cloudThreshold">Max Cloud Cover (%)</Label>
                <Input
                  id="cloudThreshold"
                  type="number"
                  value={analysisParams.cloudThreshold}
                  onChange={(e) => setAnalysisParams(prev => ({ ...prev, cloudThreshold: parseInt(e.target.value) }))}
                  max="100"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={performSatelliteAnalysis} disabled={loading || !coordinates}>
                <Satellite className="h-4 w-4 mr-2" />
                {loading ? 'Analyzing...' : 'Start Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Processing satellite imagery and performing AI analysis...</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-3" />
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>This may take several minutes for large areas</span>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {results && !loading && (
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="landuse">Land Use</TabsTrigger>
              <TabsTrigger value="changes">Change Detection</TabsTrigger>
              <TabsTrigger value="vegetation">Vegetation</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Forest Cover</p>
                        <p className="text-2xl font-bold text-green-900">{results.vegetation.forestCover.total}%</p>
                        <p className="text-xs text-green-700">{results.vegetation.forestCover.dense}% dense forest</p>
                      </div>
                      <TreePine className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Carbon Stock</p>
                        <p className="text-2xl font-bold text-blue-900">{results.vegetation.biomass.carbonContent}</p>
                        <p className="text-xs text-blue-700">tCO2/ha average</p>
                      </div>
                      <Leaf className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Analysis Area</p>
                        <p className="text-2xl font-bold text-purple-900">{results.location.area.toLocaleString()}</p>
                        <p className="text-xs text-purple-700">hectares</p>
                      </div>
                      <Map className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Overall Risk</p>
                        <p className="text-2xl font-bold text-orange-900">{results.riskAssessment.overallRisk}/100</p>
                        <p className="text-xs text-orange-700 capitalize">{results.riskAssessment.deforestationRisk} deforestation risk</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Suitability */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Suitability Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">{results.projectSuitability.afoluScore}</div>
                      <div className="text-sm text-green-700">AFOLU Score</div>
                      <Progress value={results.projectSuitability.afoluScore} className="mt-2 h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{results.projectSuitability.conservationPotential}</div>
                      <div className="text-sm text-blue-700">Conservation Potential</div>
                      <Progress value={results.projectSuitability.conservationPotential} className="mt-2 h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-900">{results.projectSuitability.restorationOpportunity}</div>
                      <div className="text-sm text-purple-700">Restoration Opportunity</div>
                      <Progress value={results.projectSuitability.restorationOpportunity} className="mt-2 h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-900">{results.projectSuitability.baselineQuality}</div>
                      <div className="text-sm text-orange-700">Baseline Quality</div>
                      <Progress value={results.projectSuitability.baselineQuality} className="mt-2 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Satellite Imagery */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Satellite Imagery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.imagery.map((img) => (
                      <div
                        key={img.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedImagery(img)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{img.source}</h4>
                            <p className="text-sm text-gray-600">{img.date}</p>
                          </div>
                          <Badge variant="outline">{img.resolution}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Cloud Cover:</span>
                            <span className="ml-2 font-medium">{img.cloudCover}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Bands:</span>
                            <span className="ml-2 font-medium">{img.bands.length}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="landuse" className="space-y-6">
              {/* Land Use Classification */}
              <Card>
                <CardHeader>
                  <CardTitle>Land Use Classification</CardTitle>
                  <CardDescription>
                    AI-powered classification of land cover types with carbon stock estimates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.landUse.map((landUse, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded ${getLandUseColor(landUse.class)}`}></div>
                            <div>
                              <h4 className="font-medium">{landUse.class}</h4>
                              <p className="text-sm text-gray-600">{landUse.area.toLocaleString()} ha • {landUse.percentage}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{landUse.confidence}% confidence</Badge>
                            {getTrendIcon(landUse.change.trend)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Current Carbon:</span>
                            <div className="font-medium">{landUse.carbonStock.current} tCO2/ha</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Potential Carbon:</span>
                            <div className="font-medium">{landUse.carbonStock.potential} tCO2/ha</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Sequestration Rate:</span>
                            <div className="font-medium">{landUse.carbonStock.sequestrationRate} tCO2/ha/year</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Annual Change:</span>
                            <div className={`font-medium ${landUse.change.rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {landUse.change.rate > 0 ? '+' : ''}{landUse.change.rate}%/year
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Progress value={landUse.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changes" className="space-y-6">
              {/* Change Detection */}
              <Card>
                <CardHeader>
                  <CardTitle>Land Use Change Detection</CardTitle>
                  <CardDescription>
                    {results.changeDetection.period.start} to {results.changeDetection.period.end}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-900">{results.changeDetection.trends.forestLoss}</div>
                      <div className="text-sm text-red-700">Forest Loss (ha/year)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">{results.changeDetection.trends.forestGain}</div>
                      <div className="text-sm text-green-700">Forest Gain (ha/year)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{results.changeDetection.trends.netChange}</div>
                      <div className="text-sm text-blue-700">Net Change (ha/year)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-900">{results.changeDetection.trends.carbonImpact.toLocaleString()}</div>
                      <div className="text-sm text-purple-700">Carbon Impact (tCO2/year)</div>
                    </div>
                  </div>

                  {/* Change Matrix */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Significant Land Use Changes</h4>
                    {results.changeDetection.changesByClass.map((change, index) => (
                      <div key={index} className="p-3 border rounded bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {change.fromClass} → {change.toClass}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{change.confidence}% confidence</Badge>
                            <Badge className={change.impact === 'positive' ? 'bg-green-100 text-green-800' : 
                                           change.impact === 'negative' ? 'bg-red-100 text-red-800' : 
                                           'bg-gray-100 text-gray-800'}>
                              {change.impact}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">Area Changed:</span>
                            <span className="ml-2 font-medium">{change.area} ha</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Carbon Impact:</span>
                            <span className={`ml-2 font-medium ${change.carbonImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change.carbonImpact > 0 ? '+' : ''}{change.carbonImpact.toLocaleString()} tCO2
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Deforestation Hotspots */}
              <Card>
                <CardHeader>
                  <CardTitle>Deforestation Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.changeDetection.deforestationHotspots.map((hotspot) => (
                      <div key={hotspot.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="font-medium">Hotspot {hotspot.id.split('-')[1]}</span>
                          </div>
                          <Badge className={getRiskColor(hotspot.severity)}>
                            {hotspot.severity} severity
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Area:</span>
                            <div className="font-medium">{hotspot.area} ha</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <div className="font-medium">{hotspot.confidence}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Detected:</span>
                            <div className="font-medium">{hotspot.detectedDate}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <div className="font-medium font-mono text-xs">
                              {hotspot.location.lat.toFixed(4)}, {hotspot.location.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vegetation" className="space-y-6">
              {/* NDVI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Vegetation Health Analysis (NDVI)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">{results.vegetation.ndvi.average.toFixed(2)}</div>
                      <div className="text-sm text-green-700">Average NDVI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{results.vegetation.ndvi.min.toFixed(2)}</div>
                      <div className="text-sm text-blue-700">Minimum NDVI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-900">{results.vegetation.ndvi.max.toFixed(2)}</div>
                      <div className="text-sm text-purple-700">Maximum NDVI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-900 capitalize">{results.vegetation.ndvi.trend}</div>
                      <div className="text-sm text-orange-700">Trend</div>
                    </div>
                  </div>

                  {/* NDVI Seasonality */}
                  <div>
                    <h4 className="font-medium mb-3">Seasonal NDVI Pattern</h4>
                    <div className="space-y-2">
                      {results.vegetation.ndvi.seasonality.map((point) => (
                        <div key={point.month} className="flex items-center justify-between">
                          <span className="text-sm">{point.month}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={point.value * 100} className="w-24 h-2" />
                            <span className="text-sm font-medium w-12">{point.value.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Biomass Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Biomass & Carbon Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Biomass Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Above Ground:</span>
                          <span className="font-medium">{results.vegetation.biomass.aboveGround} tons/ha</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Below Ground:</span>
                          <span className="font-medium">{results.vegetation.biomass.belowGround} tons/ha</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm font-medium">Total Biomass:</span>
                          <span className="font-bold">{results.vegetation.biomass.total} tons/ha</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Carbon Content:</span>
                          <span className="font-bold text-green-600">{results.vegetation.biomass.carbonContent} tCO2/ha</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Biodiversity Index</h4>
                      <div className="text-center mb-3">
                        <div className="text-3xl font-bold text-blue-900">{results.vegetation.biodiversityIndex.score}</div>
                        <div className="text-sm text-blue-700">Biodiversity Score</div>
                        <Progress value={results.vegetation.biodiversityIndex.score} className="mt-2 h-3" />
                      </div>
                      <div className="space-y-2 text-sm">
                        {Object.entries(results.vegetation.biodiversityIndex.habitat).map(([habitat, percentage]) => (
                          <div key={habitat} className="flex items-center justify-between">
                            <span className="capitalize">{habitat.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="space-y-6">
              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <Badge className={getRiskColor(results.riskAssessment.deforestationRisk)} variant="outline">
                        {results.riskAssessment.deforestationRisk}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">Deforestation Risk</div>
                    </div>
                    <div className="text-center">
                      <Badge className={getRiskColor(results.riskAssessment.degradationRisk)} variant="outline">
                        {results.riskAssessment.degradationRisk}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">Degradation Risk</div>
                    </div>
                    <div className="text-center">
                      <Badge className={getRiskColor(results.riskAssessment.fireRisk)} variant="outline">
                        {results.riskAssessment.fireRisk}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">Fire Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-900">{results.riskAssessment.overallRisk}/100</div>
                      <div className="text-sm text-orange-700">Overall Risk Score</div>
                      <Progress value={results.riskAssessment.overallRisk} className="mt-2 h-2" />
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3">AI-Generated Recommendations</h4>
                    <div className="space-y-2">
                      {results.riskAssessment.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Quality & Verification */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Quality & Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Data Quality Metrics</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Data Quality:</span>
                            <span className="text-sm font-medium">{results.verification.dataQuality}%</span>
                          </div>
                          <Progress value={results.verification.dataQuality} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Analysis Confidence:</span>
                            <span className="text-sm font-medium">{results.verification.analysisConfidence}%</span>
                          </div>
                          <Progress value={results.verification.analysisConfidence} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Verification Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Methodology:</span>
                          <span className="font-medium">{results.verification.methodology}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Analysis Date:</span>
                          <span className="font-medium">{results.verification.verificationDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monitoring Complexity:</span>
                          <Badge variant="outline" className="capitalize">
                            {results.projectSuitability.monitoringComplexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* No Analysis State */}
        {!results && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Satellite className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">
                Satellite Analysis Ready
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Provide coordinates to start AI-powered land use assessment
              </p>
              {!coordinates && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please provide project coordinates to enable satellite analysis
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}