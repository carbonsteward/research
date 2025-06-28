"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Lightbulb,
  Target,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Star,
  Clock,
  DollarSign,
  Globe,
  Leaf
} from 'lucide-react'

interface MethodologyRecommendation {
  id: string
  name: string
  standardName: string
  version: string
  matchScore: number
  confidence: number
  applicabilityReasons: string[]
  potentialChallenges: string[]
  estimatedCredits?: {
    min: number
    max: number
    currency: string
  }
  timeToImplementation?: string
  complexity: 'Low' | 'Medium' | 'High'
  itmoCompliant: boolean
  suitabilityFactors: {
    geographic: number
    projectType: number
    scale: number
    regulatory: number
    technical: number
  }
  marketData?: {
    averagePrice: number
    demandLevel: 'Low' | 'Medium' | 'High'
    liquidityScore: number
  }
}

interface SmartMethodologyRecommenderProps {
  projectData: {
    type: string
    country: string
    region?: string
    coordinates?: string
    estimatedCredits?: number
    budget?: number
    timeline?: string
    itmoRequired: boolean
  }
  userProfile?: {
    experience: 'Beginner' | 'Intermediate' | 'Expert'
    previousProjects: number
    sectors: string[]
    regions: string[]
  }
  onMethodologySelect?: (methodology: MethodologyRecommendation) => void
  className?: string
}

export function SmartMethodologyRecommender({
  projectData,
  userProfile,
  onMethodologySelect,
  className = ""
}: SmartMethodologyRecommenderProps) {
  const [recommendations, setRecommendations] = useState<MethodologyRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // Generate intelligent recommendations
  const generateRecommendations = useCallback(async () => {
    if (!projectData.type || !projectData.country) return

    setIsLoading(true)
    setAnalysisProgress(0)

    try {
      // Simulate intelligent analysis phases
      const analysisPhases = [
        'Analyzing project characteristics...',
        'Evaluating regulatory environment...',
        'Assessing market conditions...',
        'Calculating compatibility scores...',
        'Generating recommendations...'
      ]

      for (let i = 0; i < analysisPhases.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setAnalysisProgress((i + 1) * 20)
      }

      // Generate smart recommendations based on project data
      const smartRecommendations = await analyzeAndRecommend(projectData, userProfile)
      setRecommendations(smartRecommendations)

    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setIsLoading(false)
      setAnalysisProgress(100)
    }
  }, [projectData, userProfile])

  // Auto-generate recommendations when project data changes
  useEffect(() => {
    if (projectData.type && projectData.country) {
      generateRecommendations()
    }
  }, [generateRecommendations])

  const handleMethodologySelect = (methodology: MethodologyRecommendation) => {
    setSelectedRecommendation(methodology.id)
    if (onMethodologySelect) {
      onMethodologySelect(methodology)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'Low': return <Leaf className="h-4 w-4 text-green-600" />
      case 'Medium': return <Target className="h-4 w-4 text-yellow-600" />
      case 'High': return <TrendingUp className="h-4 w-4 text-red-600" />
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Smart Methodology Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered methodology suggestions based on your project characteristics and location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Progress */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Analyzing project compatibility...</span>
              <span>{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Evaluating {recommendations.length > 0 ? `${recommendations.length} methodologies` : 'methodologies'}
            </div>
          </div>
        )}

        {/* Project Analysis Summary */}
        {!isLoading && recommendations.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Analysis Summary</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-blue-600">Project Type:</span>
                <div className="font-medium">{projectData.type}</div>
              </div>
              <div>
                <span className="text-blue-600">Location:</span>
                <div className="font-medium">{projectData.country}</div>
              </div>
              <div>
                <span className="text-blue-600">ITMO Required:</span>
                <div className="font-medium">{projectData.itmoRequired ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <span className="text-blue-600">Recommendations:</span>
                <div className="font-medium">{recommendations.length} found</div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {!isLoading && recommendations.length === 0 && projectData.type && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No suitable methodologies found for your project configuration. Try adjusting your project parameters.
            </AlertDescription>
          </Alert>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Recommended Methodologies</h4>
              <Badge variant="outline">
                {recommendations.length} matches
              </Badge>
            </div>

            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedRecommendation === rec.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMethodologySelect(rec)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">{rec.name}</span>
                        {index === 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <Star className="h-3 w-3 mr-1" />
                            Best Match
                          </Badge>
                        )}
                        {rec.itmoCompliant && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            ITMO
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {rec.standardName} v{rec.version}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium px-2 py-1 rounded border ${getMatchScoreColor(rec.matchScore)}`}>
                        {rec.matchScore}% match
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {rec.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      {getComplexityIcon(rec.complexity)}
                      <span>{rec.complexity} complexity</span>
                    </div>
                    {rec.timeToImplementation && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{rec.timeToImplementation}</span>
                      </div>
                    )}
                    {rec.estimatedCredits && (
                      <div className="flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-green-600" />
                        <span>{rec.estimatedCredits.min}-{rec.estimatedCredits.max}k tCO2e</span>
                      </div>
                    )}
                    {rec.marketData && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-blue-600" />
                        <span>${rec.marketData.averagePrice}/tCO2e</span>
                      </div>
                    )}
                  </div>

                  {/* Applicability Reasons */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-green-700 mb-1">Why this fits:</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.applicabilityReasons.slice(0, 3).map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-green-700 border-green-300">
                            ✓ {reason}
                          </Badge>
                        ))}
                        {rec.applicabilityReasons.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rec.applicabilityReasons.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {rec.potentialChallenges.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-yellow-700 mb-1">Consider:</div>
                        <div className="flex flex-wrap gap-1">
                          {rec.potentialChallenges.slice(0, 2).map((challenge, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                              ! {challenge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed View Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDetails(showDetails === rec.id ? null : rec.id)
                      }}
                    >
                      {showDetails === rec.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMethodologySelect(rec)}
                      className={selectedRecommendation === rec.id ? 'bg-blue-600' : ''}
                    >
                      {selectedRecommendation === rec.id ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        'Select Methodology'
                      )}
                    </Button>
                  </div>

                  {/* Detailed Analysis */}
                  {showDetails === rec.id && (
                    <div className="pt-3 border-t space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Suitability Analysis</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Geographic Match:</span>
                              <div className="flex items-center gap-1">
                                <div className="w-16 bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full"
                                    style={{ width: `${rec.suitabilityFactors.geographic}%` }}
                                  />
                                </div>
                                <span>{rec.suitabilityFactors.geographic}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>Project Type Fit:</span>
                              <div className="flex items-center gap-1">
                                <div className="w-16 bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-green-600 h-1 rounded-full"
                                    style={{ width: `${rec.suitabilityFactors.projectType}%` }}
                                  />
                                </div>
                                <span>{rec.suitabilityFactors.projectType}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>Regulatory Alignment:</span>
                              <div className="flex items-center gap-1">
                                <div className="w-16 bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-purple-600 h-1 rounded-full"
                                    style={{ width: `${rec.suitabilityFactors.regulatory}%` }}
                                  />
                                </div>
                                <span>{rec.suitabilityFactors.regulatory}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {rec.marketData && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Market Intelligence</h5>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span>Market Demand:</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    rec.marketData.demandLevel === 'High' ? 'text-green-700 border-green-300' :
                                    rec.marketData.demandLevel === 'Medium' ? 'text-yellow-700 border-yellow-300' :
                                    'text-gray-700 border-gray-300'
                                  }
                                >
                                  {rec.marketData.demandLevel}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Liquidity Score:</span>
                                <span>{rec.marketData.liquidityScore}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Average Price:</span>
                                <span>${rec.marketData.averagePrice}/tCO2e</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {!isLoading && recommendations.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={generateRecommendations}
              disabled={isLoading}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Smart analysis engine
async function analyzeAndRecommend(
  projectData: SmartMethodologyRecommenderProps['projectData'],
  userProfile?: SmartMethodologyRecommenderProps['userProfile']
): Promise<MethodologyRecommendation[]> {

  // Simulate intelligent methodology matching
  const mockRecommendations: MethodologyRecommendation[] = []

  // Generate recommendations based on project type
  const typeBasedRecs = getProjectTypeRecommendations(projectData.type)
  const locationRecs = getLocationBasedRecommendations(projectData.country, projectData.coordinates)
  const scaleRecs = getScaleBasedRecommendations(projectData.estimatedCredits)

  // Combine and score recommendations
  const allRecs = [...typeBasedRecs, ...locationRecs, ...scaleRecs]

  // Apply intelligent scoring
  return allRecs
    .map(rec => ({
      ...rec,
      matchScore: calculateMatchScore(rec, projectData, userProfile),
      confidence: calculateConfidence(rec, projectData)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5) // Top 5 recommendations
}

function getProjectTypeRecommendations(projectType: string): Partial<MethodologyRecommendation>[] {
  const recommendations: Record<string, Partial<MethodologyRecommendation>[]> = {
    'AFOLU': [
      {
        id: 'afolu-1',
        name: 'Afforestation and Reforestation',
        standardName: 'Verra VCS',
        version: '4.5',
        complexity: 'Medium',
        itmoCompliant: true,
        applicabilityReasons: ['Suitable for forestry projects', 'High carbon sequestration potential', 'Strong market demand'],
        potentialChallenges: ['Long implementation timeline', 'Requires monitoring infrastructure'],
        timeToImplementation: '12-18 months',
        suitabilityFactors: { geographic: 85, projectType: 95, scale: 80, regulatory: 90, technical: 75 }
      },
      {
        id: 'afolu-2',
        name: 'Improved Forest Management',
        standardName: 'Gold Standard',
        version: '1.3',
        complexity: 'Low',
        itmoCompliant: false,
        applicabilityReasons: ['Existing forest enhancement', 'Faster implementation', 'Lower complexity'],
        potentialChallenges: ['Lower credit volume', 'Baseline establishment'],
        timeToImplementation: '6-12 months',
        suitabilityFactors: { geographic: 90, projectType: 85, scale: 70, regulatory: 85, technical: 90 }
      }
    ],
    'ENERGY': [
      {
        id: 'energy-1',
        name: 'Solar Power Generation',
        standardName: 'CDM',
        version: '2.1',
        complexity: 'Medium',
        itmoCompliant: true,
        applicabilityReasons: ['Renewable energy displacement', 'Scalable technology', 'Government incentives'],
        potentialChallenges: ['Grid connection requirements', 'Technology verification'],
        timeToImplementation: '8-14 months',
        suitabilityFactors: { geographic: 80, projectType: 95, scale: 85, regulatory: 80, technical: 85 }
      }
    ],
    'WASTE': [
      {
        id: 'waste-1',
        name: 'Landfill Gas Capture',
        standardName: 'Verra VCS',
        version: '4.2',
        complexity: 'High',
        itmoCompliant: true,
        applicabilityReasons: ['High emission reduction potential', 'Waste-to-energy benefits', 'Methane capture'],
        potentialChallenges: ['Technical complexity', 'Infrastructure investment'],
        timeToImplementation: '18-24 months',
        suitabilityFactors: { geographic: 75, projectType: 90, scale: 95, regulatory: 70, technical: 60 }
      }
    ]
  }

  return recommendations[projectType] || []
}

function getLocationBasedRecommendations(country: string, coordinates?: string): Partial<MethodologyRecommendation>[] {
  // Location-specific methodology adjustments
  const locationFactors: Record<string, { regulatory: number; market: number }> = {
    'BRA': { regulatory: 90, market: 85 }, // Brazil - strong forestry regulations
    'USA': { regulatory: 85, market: 95 }, // USA - mature carbon markets
    'IDN': { regulatory: 75, market: 70 }, // Indonesia - developing frameworks
    'KEN': { regulatory: 80, market: 60 }  // Kenya - emerging markets
  }

  const factor = locationFactors[country] || { regulatory: 70, market: 70 }

  return [{
    id: `location-${country}`,
    name: 'Location-Optimized Methodology',
    standardName: 'Regional Standard',
    version: '1.0',
    complexity: 'Medium',
    itmoCompliant: true,
    applicabilityReasons: [`Optimized for ${country} regulations`, 'Local market alignment'],
    potentialChallenges: ['Regional compliance requirements'],
    suitabilityFactors: {
      geographic: 95,
      projectType: 70,
      scale: 80,
      regulatory: factor.regulatory,
      technical: 75
    }
  }]
}

function getScaleBasedRecommendations(estimatedCredits?: number): Partial<MethodologyRecommendation>[] {
  if (!estimatedCredits) return []

  const isLargeScale = estimatedCredits > 10000

  return [{
    id: `scale-${isLargeScale ? 'large' : 'small'}`,
    name: `${isLargeScale ? 'Large' : 'Small'} Scale Methodology`,
    standardName: 'Scale-Optimized',
    version: '2.0',
    complexity: isLargeScale ? 'High' : 'Low',
    itmoCompliant: true,
    applicabilityReasons: [`Optimized for ${isLargeScale ? 'large' : 'small'} scale projects`],
    potentialChallenges: isLargeScale ? ['Complex monitoring requirements'] : ['Limited credit volume'],
    estimatedCredits: {
      min: isLargeScale ? 50 : 5,
      max: isLargeScale ? 500 : 50,
      currency: 'USD'
    },
    suitabilityFactors: {
      geographic: 80,
      projectType: 85,
      scale: isLargeScale ? 95 : 90,
      regulatory: 80,
      technical: isLargeScale ? 60 : 85
    }
  }]
}

function calculateMatchScore(
  rec: Partial<MethodologyRecommendation>,
  projectData: SmartMethodologyRecommenderProps['projectData'],
  userProfile?: SmartMethodologyRecommenderProps['userProfile']
): number {
  let score = 0
  const factors = rec.suitabilityFactors || { geographic: 70, projectType: 70, scale: 70, regulatory: 70, technical: 70 }

  // Weight factors based on project requirements
  score += factors.projectType * 0.3
  score += factors.geographic * 0.25
  score += factors.regulatory * 0.2
  score += factors.technical * 0.15
  score += factors.scale * 0.1

  // ITMO bonus if required
  if (projectData.itmoRequired && rec.itmoCompliant) {
    score += 10
  }

  // User experience factor
  if (userProfile) {
    const complexityPenalty = {
      'Beginner': rec.complexity === 'High' ? -15 : 0,
      'Intermediate': rec.complexity === 'High' ? -5 : 0,
      'Expert': 5
    }
    score += complexityPenalty[userProfile.experience] || 0
  }

  return Math.min(Math.round(score), 100)
}

function calculateConfidence(
  rec: Partial<MethodologyRecommendation>,
  projectData: SmartMethodologyRecommenderProps['projectData']
): number {
  let confidence = 70

  // Increase confidence based on data completeness
  if (projectData.coordinates) confidence += 10
  if (projectData.estimatedCredits) confidence += 10
  if (projectData.budget) confidence += 5
  if (projectData.timeline) confidence += 5

  return Math.min(confidence, 95)
}
