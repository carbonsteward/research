import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const includeRiskAssessments = searchParams.get('includeRiskAssessments') === 'true'

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileType: true,
            organization: true,
            country: true,
            region: true,
            expertise: true,
          },
        },
        methodology: {
          include: {
            standard: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
                organizationType: true,
                geographicScope: true,
                icroaApproved: true,
                corsiaApproved: true,
              },
            },
            pddRequirements: {
              orderBy: { sectionName: 'asc' },
            },
          },
        },
        riskAssessments: includeRiskAssessments ? {
          orderBy: [
            { riskLevel: 'desc' },
            { assessmentDate: 'desc' },
          ],
        } : false,
        _count: {
          select: {
            riskAssessments: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: project,
    })

  } catch (error) {
    console.error('Project fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// Update project
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  projectType: z.enum(['AFOLU', 'ENERGY', 'TRANSPORT', 'MANUFACTURING', 'WASTE', 'BUILDINGS', 'OTHER']).optional(),
  status: z.enum(['PLANNING', 'DESIGN', 'VALIDATION', 'IMPLEMENTATION', 'MONITORING', 'VERIFICATION', 'COMPLETED', 'CANCELLED']).optional(),
  country: z.string().min(2).optional(),
  region: z.string().optional(),
  coordinates: z.string().optional(),
  estimatedCredits: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  timeline: z.string().optional(),
  methodologyId: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
      }, { status: 404 })
    }

    // Check if methodology exists (if being updated)
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

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
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
      data: updatedProject,
    })

  } catch (error) {
    console.error('Project update error:', error)

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

// Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            riskAssessments: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
      }, { status: 404 })
    }

    // Delete project (cascade will handle related risk assessments)
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
      deletedRiskAssessments: project._count.riskAssessments,
    })

  } catch (error) {
    console.error('Project deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
