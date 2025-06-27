import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabasePerformance } from '@/lib/db-performance'

// Search parameters validation schema
const searchParamsSchema = z.object({
  query: z.string().optional(),
  standardId: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  itmoAcceptance: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate and parse search parameters
    const params = searchParamsSchema.parse({
      query: searchParams.get('query'),
      standardId: searchParams.get('standardId'),
      category: searchParams.get('category'),
      type: searchParams.get('type'),
      itmoAcceptance: searchParams.get('itmoAcceptance'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    // Execute optimized search
    const result = await DatabasePerformance.searchMethodologies(params)

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
    })

  } catch (error) {
    console.error('Methodology search error:', error)

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

// Create new methodology (admin functionality)
const createMethodologySchema = z.object({
  standardId: z.string().min(1, 'Standard ID is required'),
  name: z.string().min(1, 'Methodology name is required'),
  type: z.string().optional(),
  category: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
  itmoAcceptance: z.boolean().default(false),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMethodologySchema.parse(body)

    const { prisma } = await import('@/lib/prisma')

    // Check if standard exists
    const standard = await prisma.carbonStandard.findUnique({
      where: { id: validatedData.standardId },
    })

    if (!standard) {
      return NextResponse.json({
        success: false,
        error: 'Carbon standard not found',
      }, { status: 404 })
    }

    // Check for duplicate methodology name within same standard
    const existingMethodology = await prisma.methodology.findFirst({
      where: {
        standardId: validatedData.standardId,
        name: validatedData.name,
      },
    })

    if (existingMethodology) {
      return NextResponse.json({
        success: false,
        error: 'Methodology with this name already exists for this standard',
      }, { status: 409 })
    }

    // Create methodology
    const methodology = await prisma.methodology.create({
      data: validatedData,
      include: {
        standard: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
      },
    })

    // Update total methodologies count on standard
    await prisma.carbonStandard.update({
      where: { id: validatedData.standardId },
      data: {
        totalMethodologies: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: methodology,
    }, { status: 201 })

  } catch (error) {
    console.error('Methodology creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid methodology data',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
