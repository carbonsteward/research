import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Project search and filter parameters
const searchParamsSchema = z.object({
  userId: z.string().optional(),
  projectType: z.enum(['AFOLU', 'ENERGY', 'TRANSPORT', 'MANUFACTURING', 'WASTE', 'BUILDINGS', 'OTHER']).optional(),
  status: z.enum(['PLANNING', 'DESIGN', 'VALIDATION', 'IMPLEMENTATION', 'MONITORING', 'VERIFICATION', 'COMPLETED', 'CANCELLED']).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  methodologyId: z.string().optional(),
  query: z.string().optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = searchParamsSchema.parse({
      userId: searchParams.get('userId'),
      projectType: searchParams.get('projectType'),
      status: searchParams.get('status'),
      country: searchParams.get('country'),
      region: searchParams.get('region'),
      methodologyId: searchParams.get('methodologyId'),
      query: searchParams.get('query'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    // Build where clause
    const where: any = {}

    if (params.userId) where.userId = params.userId
    if (params.projectType) where.projectType = params.projectType
    if (params.status) where.status = params.status
    if (params.country) where.country = params.country
    if (params.region) where.region = params.region
    if (params.methodologyId) where.methodologyId = params.methodologyId

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileType: true,
              organization: true,
            },
          },
          methodology: {
            select: {
              id: true,
              name: true,
              type: true,
              category: true,
              standard: {
                select: {
                  name: true,
                  abbreviation: true,
                },
              },
            },
          },
          _count: {
            select: {
              riskAssessments: true,
            },
          },
        },
        orderBy: [
          { updatedAt: 'desc' },
          { name: 'asc' },
        ],
        take: params.limit || 20,
        skip: params.offset || 0,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        total,
        limit: params.limit || 20,
        offset: params.offset || 0,
        hasMore: (params.offset || 0) + (params.limit || 20) < total,
      },
    })

  } catch (error) {
    console.error('Projects search error:', error)

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

// Create new project
const createProjectSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  projectType: z.enum(['AFOLU', 'ENERGY', 'TRANSPORT', 'MANUFACTURING', 'WASTE', 'BUILDINGS', 'OTHER']),
  country: z.string().min(2, 'Country is required'),
  region: z.string().optional(),
  coordinates: z.string().optional(), // "lat,lng" format
  estimatedCredits: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  timeline: z.string().optional(),
  methodologyId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Validate coordinates format if provided
    if (validatedData.coordinates) {
      const coords = validatedData.coordinates.split(',')
      if (coords.length !== 2 || isNaN(Number(coords[0])) || isNaN(Number(coords[1]))) {
        return NextResponse.json({
          success: false,
          error: 'Coordinates must be in "latitude,longitude" format',
        }, { status: 400 })
      }
    }

    // Check if user exists
    const user = await prisma.userProfile.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Check if methodology exists (if provided)
    if (validatedData.methodologyId) {
      const methodology = await prisma.methodology.findUnique({
        where: { id: validatedData.methodologyId },
      })

      if (!methodology) {
        return NextResponse.json({
          success: false,
          error: 'Methodology not found',
        }, { status: 404 })
      }
    }

    // Create project
    const project = await prisma.project.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileType: true,
            organization: true,
          },
        },
        methodology: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            standard: {
              select: {
                name: true,
                abbreviation: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: project,
    }, { status: 201 })

  } catch (error) {
    console.error('Project creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid project data',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
