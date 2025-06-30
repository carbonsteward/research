/**
 * BMAD Climate Risk API Endpoint
 * Coordinate-level physical risk assessment using multiple data sources
 */

import { NextRequest, NextResponse } from 'next/server'
import { climateRiskOrchestrator, CoordinatePoint } from '@/services/climate-risk-orchestrator'
import { logger } from '@/utils/logger'
import { z } from 'zod'

// Validation schemas
const CoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().optional(),
  description: z.string().optional()
})

const RiskAssessmentRequestSchema = z.object({
  coordinates: z.union([
    CoordinateSchema,
    z.array(CoordinateSchema)
  ]),
  scenarios: z.array(z.enum(['RCP2.6', 'RCP4.5', 'RCP8.5', 'historical'])).optional().default(['RCP4.5']),
  timeframes: z.array(z.enum(['2030', '2050', '2100', 'current'])).optional().default(['2050']),
  includeAdaptation: z.boolean().optional().default(true),
  cacheStrategy: z.enum(['prefer_cache', 'force_refresh', 'cache_only']).optional().default('prefer_cache')
})

// GET /api/climate-risk/coordinate - Get risk assessment for coordinates
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')
    const scenarios = searchParams.get('scenarios')?.split(',') || ['RCP4.5']
    const timeframes = searchParams.get('timeframes')?.split(',') || ['2050']

    // Validate coordinates
    if (!lat || !lon || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        {
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        },
        { status: 400 }
      )
    }

    const coordinates: CoordinatePoint = {
      latitude: lat,
      longitude: lon,
      name: searchParams.get('name') || undefined,
      description: searchParams.get('description') || undefined
    }

    logger.info('BMAD risk assessment request', { coordinates, scenarios, timeframes })

    // Perform risk assessment
    const assessment = await climateRiskOrchestrator.assessCoordinateRisk(
      coordinates,
      scenarios,
      timeframes
    )

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: assessment,
      metadata: {
        requestDuration: `${duration}ms`,
        dataSourcesUsed: assessment.sources.length,
        riskFactorsAnalyzed: assessment.riskFactors.length,
        dataQuality: assessment.dataQuality,
        cacheHit: duration < 1000 // Assume cache hit if very fast
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('BMAD risk assessment failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    })

    return NextResponse.json(
      {
        error: 'Risk assessment failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// POST /api/climate-risk/coordinate - Bulk risk assessment or detailed configuration
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Validate request
    const validation = RiskAssessmentRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const { coordinates, scenarios, timeframes, includeAdaptation, cacheStrategy } = validation.data

    logger.info('BMAD bulk risk assessment request', {
      coordinateCount: Array.isArray(coordinates) ? coordinates.length : 1,
      scenarios,
      timeframes,
      cacheStrategy
    })

    // Handle single or bulk assessment
    let assessments
    if (Array.isArray(coordinates)) {
      // Bulk assessment
      assessments = await climateRiskOrchestrator.bulkAssessCoordinates(
        coordinates,
        scenarios,
        timeframes
      )
    } else {
      // Single assessment
      const assessment = await climateRiskOrchestrator.assessCoordinateRisk(
        coordinates,
        scenarios,
        timeframes
      )
      assessments = [assessment]
    }

    const duration = Date.now() - startTime

    // Calculate summary statistics
    const totalRiskFactors = assessments.reduce((sum, a) => sum + a.riskFactors.length, 0)
    const avgRiskScore = assessments.reduce((sum, a) => sum + a.overallRiskScore, 0) / assessments.length
    const allSources = [...new Set(assessments.flatMap(a => a.sources))]

    return NextResponse.json({
      success: true,
      data: Array.isArray(coordinates) ? assessments : assessments[0],
      metadata: {
        requestDuration: `${duration}ms`,
        assessmentCount: assessments.length,
        totalRiskFactors,
        averageRiskScore: Math.round(avgRiskScore * 100) / 100,
        dataSourcesUsed: allSources,
        processingStats: {
          coordinatesProcessed: assessments.length,
          successfulAssessments: assessments.filter(a => a.riskFactors.length > 0).length,
          averageDataQuality: this.calculateAverageDataQuality(assessments)
        }
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('BMAD bulk risk assessment failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    })

    return NextResponse.json(
      {
        error: 'Bulk risk assessment failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// GET /api/climate-risk/coordinate/sources - Get available data sources
export async function OPTIONS(request: NextRequest) {
  try {
    const sources = await climateRiskOrchestrator.getAvailableDataSources()

    return NextResponse.json({
      success: true,
      data: {
        sources: sources.map(source => ({
          name: source.name,
          coverage: source.coverage,
          resolution: source.resolution,
          dataFormat: source.dataFormat,
          updateFrequency: source.updateFrequency,
          reliabilityScore: source.reliabilityScore,
          accessType: source.accessType,
          costPerQuery: source.costPerQuery || 0
        })),
        totalSources: sources.length,
        openSources: sources.filter(s => s.accessType === 'open').length,
        apiSources: sources.filter(s => s.accessType === 'api').length,
        proprietarySources: sources.filter(s => s.accessType === 'proprietary').length
      },
      metadata: {
        supportedScenarios: ['RCP2.6', 'RCP4.5', 'RCP8.5', 'historical'],
        supportedTimeframes: ['2030', '2050', '2100', 'current'],
        riskCategories: ['heat', 'water', 'wind', 'drought', 'fire', 'flood', 'sea_level', 'composite'],
        responseFormats: ['json'],
        rateLimits: {
          requestsPerMinute: 60,
          bulkLimit: 100
        }
      }
    })

  } catch (error) {
    logger.error('Failed to retrieve data sources', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to retrieve data sources',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate average data quality
function calculateAverageDataQuality(assessments: any[]): string {
  const qualityScores = {
    'high': 3,
    'medium': 2,
    'low': 1
  }

  const reverseMapping = ['', 'low', 'medium', 'high']

  const avgScore = assessments.reduce((sum, assessment) => {
    return sum + (qualityScores[assessment.dataQuality as keyof typeof qualityScores] || 1)
  }, 0) / assessments.length

  return reverseMapping[Math.round(avgScore)] || 'medium'
}
