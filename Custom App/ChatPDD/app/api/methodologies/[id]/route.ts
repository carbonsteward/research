import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Get methodology by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const methodology = await prisma.methodology.findUnique({
      where: { id },
      include: {
        standard: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            organizationType: true,
            geographicScope: true,
            focusSector: true,
            websiteUrl: true,
            icroaApproved: true,
            corsiaApproved: true,
          },
        },
        pddRequirements: {
          orderBy: { sectionName: 'asc' },
        },
        _count: {
          select: {
            projects: true,
            riskAssessments: true,
          },
        },
      },
    })

    if (!methodology) {
      return NextResponse.json({
        success: false,
        error: 'Methodology not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: methodology,
    })

  } catch (error) {
    console.error('Methodology fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// Update methodology
const updateMethodologySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
  itmoAcceptance: z.boolean().optional(),
  description: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateMethodologySchema.parse(body)

    // Check if methodology exists
    const existingMethodology = await prisma.methodology.findUnique({
      where: { id },
    })

    if (!existingMethodology) {
      return NextResponse.json({
        success: false,
        error: 'Methodology not found',
      }, { status: 404 })
    }

    // Check for duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingMethodology.name) {
      const duplicateMethodology = await prisma.methodology.findFirst({
        where: {
          standardId: existingMethodology.standardId,
          name: validatedData.name,
          id: { not: id },
        },
      })

      if (duplicateMethodology) {
        return NextResponse.json({
          success: false,
          error: 'Methodology with this name already exists for this standard',
        }, { status: 409 })
      }
    }

    // Update methodology
    const updatedMethodology = await prisma.methodology.update({
      where: { id },
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

    return NextResponse.json({
      success: true,
      data: updatedMethodology,
    })

  } catch (error) {
    console.error('Methodology update error:', error)

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

// Delete methodology
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if methodology exists
    const methodology = await prisma.methodology.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    if (!methodology) {
      return NextResponse.json({
        success: false,
        error: 'Methodology not found',
      }, { status: 404 })
    }

    // Check if methodology is being used by projects
    if (methodology._count.projects > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete methodology. It is currently used by ${methodology._count.projects} project(s).`,
      }, { status: 409 })
    }

    // Delete methodology
    await prisma.methodology.delete({
      where: { id },
    })

    // Update total methodologies count on standard
    await prisma.carbonStandard.update({
      where: { id: methodology.standardId },
      data: {
        totalMethodologies: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Methodology deleted successfully',
    })

  } catch (error) {
    console.error('Methodology deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
