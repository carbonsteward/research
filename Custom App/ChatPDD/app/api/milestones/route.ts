import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { createLogger } from '@/lib/logger'
import { cache } from '@/lib/cache'

const logger = createLogger('milestones-api')

/**
 * Get project milestones
 * GET /api/milestones?projectId=xxx&status=pending
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'projectId is required'
        },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { projectId }
    if (status) where.status = status
    if (category) where.category = category

    const milestones = await prisma.projectMilestone.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ],
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    // Calculate summary statistics
    const summary = {
      total: milestones.length,
      pending: milestones.filter(m => m.status === 'pending').length,
      in_progress: milestones.filter(m => m.status === 'in_progress').length,
      completed: milestones.filter(m => m.status === 'completed').length,
      overdue: milestones.filter(m => m.status === 'overdue').length,
      at_risk: milestones.filter(m => m.status === 'at_risk').length,
      critical_priority: milestones.filter(m => m.priority === 'critical').length,
      upcoming_week: milestones.filter(m => {
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return m.dueDate <= weekFromNow && m.dueDate >= new Date()
      }).length
    }

    return NextResponse.json({
      success: true,
      data: milestones,
      summary,
      meta: {
        projectId,
        filters: { status, category },
        limit
      }
    })
  } catch (error) {
    logger.error('Error fetching milestones', { error })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch milestones'
      },
      { status: 500 }
    )
  }
}

/**
 * Create new milestone
 * POST /api/milestones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      projectId,
      title,
      description,
      endDate,
      priority = 'medium',
      category,
      assignedTo,
      dependencies,
      estimatedDuration,
      costs,
      requirements,
      deliverables,
      risks,
      metadata
    } = body

    // Validate required fields
    if (!projectId || !title || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: projectId, title, endDate'
        },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId,
        phase: 'implementation', // Default phase
        title,
        description,
        status: 'NOT_STARTED',
        priority: priority?.toUpperCase() || 'MEDIUM',
        startDate: new Date(),
        endDate: new Date(endDate),
        estimatedDuration: estimatedDuration || 30,
        dependencies: dependencies || [],
        deliverables: deliverables || [],
        stakeholders: assignedTo || [],
        estimatedCost: costs?.estimated,
        actualCost: costs?.actual,
        risks: risks || {},
        kpis: metadata || {}
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    // Invalidate project cache
    await cache.invalidateByTags([`project-${projectId}`])

    logger.info('Milestone created', {
      milestoneId: milestone.id,
      projectId,
      title,
      endDate
    })

    return NextResponse.json({
      success: true,
      data: milestone
    })
  } catch (error) {
    logger.error('Error creating milestone', { error })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create milestone'
      },
      { status: 500 }
    )
  }
}

/**
 * Bulk update milestones
 * PUT /api/milestones
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Updates must be an array'
        },
        { status: 400 }
      )
    }

    const results = []
    const projectIds = new Set<string>()

    for (const update of updates) {
      const { id, ...data } = update
      
      try {
        const milestone = await prisma.projectMilestone.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        })
        
        results.push({ id, success: true, data: milestone })
        projectIds.add(milestone.projectId)
      } catch (error) {
        results.push({ 
          id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Invalidate caches for affected projects
    for (const projectId of projectIds) {
      await cache.invalidateByTags([`project-${projectId}`])
    }

    logger.info('Bulk milestone update completed', {
      totalUpdates: updates.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        total: updates.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })
  } catch (error) {
    logger.error('Error in bulk milestone update', { error })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update milestones'
      },
      { status: 500 }
    )
  }
}