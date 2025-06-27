import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabasePerformance } from '@/lib/db-performance'

// Policy search parameters
const policySearchSchema = z.object({
  countryCode: z.string().optional(),
  regionCode: z.string().optional(),
  policyType: z.enum(['REGULATION', 'STANDARD', 'INCENTIVE', 'TAX', 'SUBSIDY', 'MANDATE', 'VOLUNTARY', 'INTERNATIONAL_AGREEMENT']).optional(),
  sectors: z.string().transform(val => val ? val.split(',').filter(s => s.trim()) : []).optional(),
  effectiveAfter: z.string().transform(val => val ? new Date(val) : undefined).optional(),
  query: z.string().optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = policySearchSchema.parse({
      countryCode: searchParams.get('countryCode'),
      regionCode: searchParams.get('regionCode'),
      policyType: searchParams.get('policyType'),
      sectors: searchParams.get('sectors'),
      effectiveAfter: searchParams.get('effectiveAfter'),
      query: searchParams.get('query'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    // Use optimized policy search
    const result = await DatabasePerformance.searchPolicies(params)

    // Add policy impact analysis
    const analysis = {
      summary: {
        totalPolicies: result.total,
        policyTypes: [...new Set(result.data.map(p => p.policyType))],
        countries: [...new Set(result.data.map(p => p.countryCode))],
        sectors: [...new Set(result.data.flatMap(p => p.sectors))],
      },

      byType: result.data.reduce((acc, policy) => {
        if (!acc[policy.policyType]) {
          acc[policy.policyType] = 0
        }
        acc[policy.policyType]++
        return acc
      }, {} as Record<string, number>),

      byCountry: result.data.reduce((acc, policy) => {
        if (!acc[policy.countryCode]) {
          acc[policy.countryCode] = 0
        }
        acc[policy.countryCode]++
        return acc
      }, {} as Record<string, number>),

      recentPolicies: result.data
        .filter(p => new Date(p.effectiveDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) // Last year
        .length,

      expiringPolicies: result.data
        .filter(p => p.expirationDate && new Date(p.expirationDate) < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // Next year
        .map(p => ({
          title: p.title,
          countryCode: p.countryCode,
          expirationDate: p.expirationDate,
        })),
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: params.limit || 20,
        offset: params.offset || 0,
        hasMore: result.hasMore,
        nextOffset: result.nextOffset,
      },
      analysis,
    })

  } catch (error) {
    console.error('Policy search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid policy search parameters',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
