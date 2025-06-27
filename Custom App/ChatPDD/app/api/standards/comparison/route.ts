import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Comparison parameters schema
const comparisonParamsSchema = z.object({
  standardIds: z.string().transform(val => val.split(',').filter(id => id.trim().length > 0)),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = comparisonParamsSchema.parse({
      standardIds: searchParams.get('standardIds') || '',
    })

    if (params.standardIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one standard ID is required',
      }, { status: 400 })
    }

    if (params.standardIds.length > 5) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 5 standards can be compared at once',
      }, { status: 400 })
    }

    // Fetch standards with comprehensive data for comparison
    const standards = await prisma.carbonStandard.findMany({
      where: {
        id: { in: params.standardIds },
      },
      include: {
        methodologies: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            itmoAcceptance: true,
            _count: {
              select: {
                projects: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        pddRequirements: {
          where: { methodologyId: null }, // General requirements
          select: {
            sectionName: true,
            description: true,
            required: true,
          },
          orderBy: { sectionName: 'asc' },
        },
        certificationProcess: {
          select: {
            stepNumber: true,
            stepName: true,
            estimatedDuration: true,
            estimatedCost: true,
            responsibleParty: true,
          },
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: {
            methodologies: true,
            pddRequirements: true,
          },
        },
      },
    })

    if (standards.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No standards found with the provided IDs',
      }, { status: 404 })
    }

    // Create comparison analysis
    const comparison = {
      standards: standards.map(standard => ({
        id: standard.id,
        name: standard.name,
        abbreviation: standard.abbreviation,
        introducingEntity: standard.introducingEntity,
        organizationType: standard.organizationType,
        geographicScope: standard.geographicScope,
        focusSector: standard.focusSector,
        icroaApproved: standard.icroaApproved,
        corsiaApproved: standard.corsiaApproved,
        websiteUrl: standard.websiteUrl,
        stats: {
          totalMethodologies: standard._count.methodologies,
          totalRequirements: standard._count.pddRequirements,
          certificationSteps: standard.certificationProcess.length,
        },
        methodologyCategories: [...new Set(standard.methodologies.map(m => m.category).filter(Boolean))],
        methodologyTypes: [...new Set(standard.methodologies.map(m => m.type).filter(Boolean))],
        itmoMethodologies: standard.methodologies.filter(m => m.itmoAcceptance).length,
        averageProjectsPerMethodology: standard.methodologies.length > 0
          ? Math.round(standard.methodologies.reduce((sum, m) => sum + m._count.projects, 0) / standard.methodologies.length)
          : 0,
        certificationProcess: standard.certificationProcess,
        requirements: standard.pddRequirements,
      })),

      // Comparative analysis
      analysis: {
        approvals: {
          icroa: standards.filter(s => s.icroaApproved).map(s => s.name),
          corsia: standards.filter(s => s.corsiaApproved).map(s => s.name),
        },
        geographicScopes: [...new Set(standards.map(s => s.geographicScope).filter(Boolean))],
        organizationTypes: [...new Set(standards.map(s => s.organizationType).filter(Boolean))],
        focusSectors: [...new Set(standards.map(s => s.focusSector).filter(Boolean))],
        methodologyStats: {
          highest: standards.reduce((max, s) => s._count.methodologies > max.count ?
            { name: s.name, count: s._count.methodologies } : max,
            { name: '', count: 0 }
          ),
          total: standards.reduce((sum, s) => sum + s._count.methodologies, 0),
        },
        certificationComplexity: standards.map(s => ({
          name: s.name,
          steps: s.certificationProcess.length,
          complexity: s.certificationProcess.length < 3 ? 'Simple' :
                     s.certificationProcess.length < 6 ? 'Moderate' : 'Complex',
        })),
      },
    }

    return NextResponse.json({
      success: true,
      data: comparison,
      requestedIds: params.standardIds,
      foundCount: standards.length,
    })

  } catch (error) {
    console.error('Standards comparison error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid comparison parameters',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
