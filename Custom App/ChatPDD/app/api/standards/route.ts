import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabasePerformance } from '@/lib/db-performance'
import { prisma } from '@/lib/prisma'

// Search parameters schema
const searchParamsSchema = z.object({
  query: z.string().optional(),
  organizationType: z.string().optional(),
  geographicScope: z.string().optional(),
  focusSector: z.string().optional(),
  icroaApproved: z.string().transform(val => val === 'true').optional(),
  corsiaApproved: z.string().transform(val => val === 'true').optional(),
  includeStats: z.string().transform(val => val === 'true').default('true'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse search parameters
    const params = searchParamsSchema.parse({
      query: searchParams.get('query'),
      organizationType: searchParams.get('organizationType'),
      geographicScope: searchParams.get('geographicScope'),
      focusSector: searchParams.get('focusSector'),
      icroaApproved: searchParams.get('icroaApproved'),
      corsiaApproved: searchParams.get('corsiaApproved'),
      includeStats: searchParams.get('includeStats'),
    })

    if (params.includeStats) {
      // Use optimized query with stats
      const standards = await DatabasePerformance.getCarbonStandardsWithStats()

      // Apply filters
      let filteredStandards = standards

      if (params.query) {
        const query = params.query.toLowerCase()
        filteredStandards = filteredStandards.filter(standard =>
          standard.name.toLowerCase().includes(query) ||
          standard.description?.toLowerCase().includes(query) ||
          standard.abbreviation?.toLowerCase().includes(query)
        )
      }

      if (params.organizationType) {
        filteredStandards = filteredStandards.filter(standard =>
          standard.organizationType?.toLowerCase().includes(params.organizationType!.toLowerCase())
        )
      }

      if (params.geographicScope) {
        filteredStandards = filteredStandards.filter(standard =>
          standard.geographicScope?.toLowerCase().includes(params.geographicScope!.toLowerCase())
        )
      }

      if (params.focusSector) {
        filteredStandards = filteredStandards.filter(standard =>
          standard.focusSector?.toLowerCase().includes(params.focusSector!.toLowerCase())
        )
      }

      if (params.icroaApproved !== undefined) {
        filteredStandards = filteredStandards.filter(standard =>
          standard.icroaApproved === params.icroaApproved
        )
      }

      if (params.corsiaApproved !== undefined) {
        filteredStandards = filteredStandards.filter(standard =>
          standard.corsiaApproved === params.corsiaApproved
        )
      }

      return NextResponse.json({
        success: true,
        data: filteredStandards,
        total: filteredStandards.length,
      })
    } else {
      // Simple query without stats for performance
      const where: any = {}

      if (params.query) {
        where.OR = [
          { name: { contains: params.query, mode: 'insensitive' } },
          { description: { contains: params.query, mode: 'insensitive' } },
          { abbreviation: { contains: params.query, mode: 'insensitive' } },
        ]
      }

      if (params.organizationType) {
        where.organizationType = { contains: params.organizationType, mode: 'insensitive' }
      }

      if (params.geographicScope) {
        where.geographicScope = { contains: params.geographicScope, mode: 'insensitive' }
      }

      if (params.focusSector) {
        where.focusSector = { contains: params.focusSector, mode: 'insensitive' }
      }

      if (params.icroaApproved !== undefined) {
        where.icroaApproved = params.icroaApproved
      }

      if (params.corsiaApproved !== undefined) {
        where.corsiaApproved = params.corsiaApproved
      }

      const standards = await prisma.carbonStandard.findMany({
        where,
        orderBy: { name: 'asc' },
      })

      return NextResponse.json({
        success: true,
        data: standards,
        total: standards.length,
      })
    }

  } catch (error) {
    console.error('Carbon standards search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// Create new carbon standard (admin functionality)
const createStandardSchema = z.object({
  name: z.string().min(1, 'Standard name is required'),
  abbreviation: z.string().optional(),
  introducingEntity: z.string().optional(),
  organizationType: z.string().optional(),
  geographicScope: z.string().optional(),
  focusSector: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  icroaApproved: z.boolean().default(false),
  corsiaApproved: z.boolean().default(false),
  correspondingAdjustmentLabel: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createStandardSchema.parse(body)

    // Check for duplicate standard name
    const existingStandard = await prisma.carbonStandard.findFirst({
      where: { name: validatedData.name },
    })

    if (existingStandard) {
      return NextResponse.json({
        success: false,
        error: 'Carbon standard with this name already exists',
      }, { status: 409 })
    }

    // Create carbon standard
    const standard = await prisma.carbonStandard.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: standard,
    }, { status: 201 })

  } catch (error) {
    console.error('Carbon standard creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid standard data',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
