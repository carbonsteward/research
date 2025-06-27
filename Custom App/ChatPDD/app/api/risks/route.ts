import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabasePerformance } from '@/lib/db-performance'
import { prisma } from '@/lib/prisma'

// Risk assessment search parameters
const riskSearchSchema = z.object({
  projectId: z.string().optional(),
  riskType: z.enum(['PHYSICAL', 'TRANSITIONAL', 'REGULATORY', 'MARKET', 'OPERATIONAL', 'REPUTATIONAL']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  methodologyId: z.string().optional(),
  minConfidence: z.string().transform(val => parseFloat(val) || 0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = riskSearchSchema.parse({
      projectId: searchParams.get('projectId'),
      riskType: searchParams.get('riskType'),
      riskLevel: searchParams.get('riskLevel'),
      country: searchParams.get('country'),
      region: searchParams.get('region'),
      methodologyId: searchParams.get('methodologyId'),
      minConfidence: searchParams.get('minConfidence'),
    })

    const where: any = {}

    if (params.projectId) where.projectId = params.projectId
    if (params.riskType) where.riskType = params.riskType
    if (params.riskLevel) where.riskLevel = params.riskLevel
    if (params.methodologyId) where.methodologyId = params.methodologyId
    if (params.minConfidence) where.confidence = { gte: params.minConfidence }

    // Add location-based filtering through project relationship
    if (params.country || params.region) {
      where.project = {}
      if (params.country) where.project.country = params.country
      if (params.region) where.project.region = params.region
    }

    const riskAssessments = await prisma.riskAssessment.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectType: true,
            country: true,
            region: true,
            coordinates: true,
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
      orderBy: [
        { riskLevel: 'desc' },
        { confidence: 'desc' },
        { assessmentDate: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: riskAssessments,
      total: riskAssessments.length,
    })

  } catch (error) {
    console.error('Risk assessments search error:', error)

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

// Create new risk assessment
const createRiskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  methodologyId: z.string().optional(),
  riskType: z.enum(['PHYSICAL', 'TRANSITIONAL', 'REGULATORY', 'MARKET', 'OPERATIONAL', 'REPUTATIONAL']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  riskCategory: z.string().min(1, 'Risk category is required'),
  description: z.string().min(1, 'Description is required'),
  mitigationSteps: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
  dataSource: z.string().min(1, 'Data source is required'),
  validUntil: z.string().transform(val => new Date(val)).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRiskSchema.parse(body)

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
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

    // Create risk assessment
    const riskAssessment = await prisma.riskAssessment.create({
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectType: true,
            country: true,
            region: true,
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
      data: riskAssessment,
    }, { status: 201 })

  } catch (error) {
    console.error('Risk assessment creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid risk assessment data',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
