import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { createLogger } from '@/lib/logger'
import { cache } from '@/lib/cache'

const logger = createLogger('milestone-api')

/**
 * Get specific milestone
 * GET /api/milestones/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!milestone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Milestone not found'
        },
        { status: 404 }
      )
    }

    // Calculate additional metrics
    const now = new Date()
    const daysUntilDue = Math.ceil((milestone.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isOverdue = milestone.endDate < now && milestone.status !== 'COMPLETED'
    const isAtRisk = daysUntilDue <= 3 && milestone.status !== 'COMPLETED'

    const enrichedMilestone = {
      ...milestone,
      computed: {
        daysUntilDue,
        isOverdue,
        isAtRisk,
        statusColor: getStatusColor(milestone.status, isOverdue, isAtRisk),
        priorityColor: getPriorityColor(milestone.priority),
        progressStatus: getProgressStatus(milestone.status)
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedMilestone
    })
  } catch (error) {
    logger.error('Error fetching milestone', { error, milestoneId: params.id })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch milestone'
      },
      { status: 500 }
    )
  }
}

/**
 * Update milestone
 * PATCH /api/milestones/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      endDate,
      status,
      priority,
      phase,
      assignedTo,
      dependencies,
      estimatedDuration,
      actualDuration,
      estimatedCost,
      actualCost,
      deliverables,
      stakeholders,
      risks,
      kpis
    } = body

    // Get current milestone to track changes
    const currentMilestone = await prisma.projectMilestone.findUnique({
      where: { id: params.id },
      select: { status: true, projectId: true }
    })

    if (!currentMilestone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Milestone not found'
        },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = { updatedAt: new Date() }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority?.toUpperCase()
    if (phase !== undefined) updateData.phase = phase
    if (assignedTo !== undefined) updateData.stakeholders = assignedTo
    if (dependencies !== undefined) updateData.dependencies = dependencies
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration
    if (actualDuration !== undefined) updateData.actualDuration = actualDuration
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost
    if (actualCost !== undefined) updateData.actualCost = actualCost
    if (deliverables !== undefined) updateData.deliverables = deliverables
    if (stakeholders !== undefined) updateData.stakeholders = stakeholders
    if (risks !== undefined) updateData.risks = risks
    if (kpis !== undefined) updateData.kpis = kpis

    const milestone = await prisma.projectMilestone.update({
      where: { id: params.id },
      data: updateData,
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

    // Track significant changes for audit
    const significantChanges = []
    if (status !== undefined && status !== currentMilestone.status) {
      significantChanges.push(`Status changed from ${currentMilestone.status} to ${status}`)
    }

    if (significantChanges.length > 0) {
      logger.info('Milestone updated with significant changes', {
        milestoneId: params.id,
        changes: significantChanges,
        projectId: currentMilestone.projectId
      })
    }

    // Invalidate project cache
    await cache.invalidateByTags([`project-${currentMilestone.projectId}`])

    return NextResponse.json({
      success: true,
      data: milestone,
      changes: significantChanges
    })
  } catch (error) {
    logger.error('Error updating milestone', { error, milestoneId: params.id })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update milestone'
      },
      { status: 500 }
    )
  }
}

/**
 * Delete milestone
 * DELETE /api/milestones/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: params.id },
      select: { projectId: true, title: true }
    })

    if (!milestone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Milestone not found'
        },
        { status: 404 }
      )
    }

    await prisma.projectMilestone.delete({
      where: { id: params.id }
    })

    // Invalidate project cache
    await cache.invalidateByTags([`project-${milestone.projectId}`])

    logger.info('Milestone deleted', {
      milestoneId: params.id,
      title: milestone.title,
      projectId: milestone.projectId
    })

    return NextResponse.json({
      success: true,
      message: 'Milestone deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting milestone', { error, milestoneId: params.id })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete milestone'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getStatusColor(status: string, isOverdue: boolean, isAtRisk: boolean) {
  if (isOverdue) return 'red'
  if (isAtRisk) return 'orange'
  
  switch (status) {
    case 'COMPLETED': return 'green'
    case 'IN_PROGRESS': return 'blue'
    case 'NOT_STARTED': return 'gray'
    case 'DELAYED': return 'red'
    case 'BLOCKED': return 'orange'
    default: return 'gray'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL': return 'red'
    case 'HIGH': return 'orange'
    case 'MEDIUM': return 'yellow'
    case 'LOW': return 'green'
    default: return 'gray'
  }
}

function getProgressStatus(status: string) {
  switch (status) {
    case 'NOT_STARTED': return 'not_started'
    case 'IN_PROGRESS': return 'in_progress'
    case 'COMPLETED': return 'completed'
    case 'DELAYED': return 'delayed'
    case 'BLOCKED': return 'blocked'
    default: return 'unknown'
  }
}