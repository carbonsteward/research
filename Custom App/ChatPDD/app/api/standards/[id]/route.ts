import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Get carbon standard by ID with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const includeMethodologies = searchParams.get('includeMethodologies') === 'true'

    const standard = await prisma.carbonStandard.findUnique({
      where: { id },
      include: {
        methodologies: includeMethodologies ? {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                projects: true,
              },
            },
          },
        } : false,
        pddRequirements: {
          where: { methodologyId: null }, // General requirements for the standard
          orderBy: { sectionName: 'asc' },
        },
        certificationProcess: {
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: {
            methodologies: true,
            pddRequirements: true,
            certificationProcess: true,
          },
        },
      },
    })

    if (!standard) {
      return NextResponse.json({
        success: false,
        error: 'Carbon standard not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: standard,
    })

  } catch (error) {
    console.error('Carbon standard fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// Update carbon standard
const updateStandardSchema = z.object({
  name: z.string().min(1).optional(),
  abbreviation: z.string().optional(),
  introducingEntity: z.string().optional(),
  organizationType: z.string().optional(),
  geographicScope: z.string().optional(),
  focusSector: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  icroaApproved: z.boolean().optional(),
  corsiaApproved: z.boolean().optional(),
  correspondingAdjustmentLabel: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateStandardSchema.parse(body)

    // Check if standard exists
    const existingStandard = await prisma.carbonStandard.findUnique({
      where: { id },
    })

    if (!existingStandard) {
      return NextResponse.json({
        success: false,
        error: 'Carbon standard not found',
      }, { status: 404 })
    }

    // Check for duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingStandard.name) {
      const duplicateStandard = await prisma.carbonStandard.findFirst({
        where: {
          name: validatedData.name,
          id: { not: id },
        },
      })

      if (duplicateStandard) {
        return NextResponse.json({
          success: false,
          error: 'Carbon standard with this name already exists',
        }, { status: 409 })
      }
    }

    // Update standard
    const updatedStandard = await prisma.carbonStandard.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: updatedStandard,
    })

  } catch (error) {
    console.error('Carbon standard update error:', error)

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

// Delete carbon standard
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if standard exists and get methodology count
    const standard = await prisma.carbonStandard.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            methodologies: true,
          },
        },
      },
    })

    if (!standard) {
      return NextResponse.json({
        success: false,
        error: 'Carbon standard not found',
      }, { status: 404 })
    }

    // Check if standard has methodologies
    if (standard._count.methodologies > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete standard. It has ${standard._count.methodologies} associated methodologies.`,
      }, { status: 409 })
    }

    // Delete standard (cascade will handle related records)
    await prisma.carbonStandard.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Carbon standard deleted successfully',
    })

  } catch (error) {
    console.error('Carbon standard deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
