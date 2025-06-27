import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabasePerformance } from '@/lib/db-performance'

// Methodology recommendations parameters schema
const recommendationParamsSchema = z.object({
  projectType: z.enum(['AFOLU', 'ENERGY', 'TRANSPORT', 'MANUFACTURING', 'WASTE', 'BUILDINGS', 'OTHER']),
  country: z.string().min(2, 'Country code is required'),
  region: z.string().optional(),
  itmoRequired: z.string().transform(val => val === 'true').optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate and parse parameters
    const params = recommendationParamsSchema.parse({
      projectType: searchParams.get('projectType'),
      country: searchParams.get('country'),
      region: searchParams.get('region'),
      itmoRequired: searchParams.get('itmoRequired'),
    })

    // Get methodology recommendations
    const recommendations = await DatabasePerformance.getMethodologyRecommendations(params)

    // Add scoring logic for recommendations
    const scoredRecommendations = recommendations.map((methodology) => {
      let score = 0

      // Base score from project usage
      score += methodology._count.projects * 10

      // Bonus for ITMO acceptance if required
      if (params.itmoRequired && methodology.itmoAcceptance) {
        score += 50
      }

      // Bonus for global standards
      if (methodology.standard.geographicScope?.toLowerCase().includes('global')) {
        score += 20
      }

      // Bonus for non-profit organizations (typically more trusted)
      if (methodology.standard.organizationType?.toLowerCase().includes('non-profit')) {
        score += 15
      }

      return {
        ...methodology,
        recommendationScore: score,
        reasons: [
          ...(methodology._count.projects > 0 ? [`Used by ${methodology._count.projects} projects`] : []),
          ...(methodology.itmoAcceptance ? ['ITMO compliant'] : []),
          ...(methodology.standard.geographicScope?.toLowerCase().includes('global') ? ['Global standard'] : []),
          ...(methodology.standard.organizationType?.toLowerCase().includes('non-profit') ? ['Trusted non-profit standard'] : []),
        ],
      }
    })

    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

    return NextResponse.json({
      success: true,
      data: scoredRecommendations,
      criteria: {
        projectType: params.projectType,
        country: params.country,
        region: params.region,
        itmoRequired: params.itmoRequired,
      },
      total: scoredRecommendations.length,
    })

  } catch (error) {
    console.error('Methodology recommendations error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid recommendation parameters',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
