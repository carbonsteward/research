import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/collaboration/projects/health-check - Health check for collaboration features
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Test database connectivity with collaboration tables
    const [
      workspaceCheck,
      teamMemberCheck,
      notificationCheck,
      activityCheck
    ] = await Promise.all([
      prisma.workspace.findFirst(),
      prisma.projectTeamMember.findFirst(),
      prisma.notification.findFirst(),
      prisma.projectActivity.findFirst()
    ])

    const responseTime = Date.now() - startTime

    // Check if essential tables are accessible
    const tablesAccessible = {
      workspace: workspaceCheck !== undefined,
      teamMember: teamMemberCheck !== undefined,
      notification: notificationCheck !== undefined,
      activity: activityCheck !== undefined
    }

    const allTablesOk = Object.values(tablesAccessible).every(Boolean)

    const health = {
      status: allTablesOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        tablesAccessible
      },
      features: {
        teamManagement: tablesAccessible.teamMember,
        notifications: tablesAccessible.notification,
        activityTracking: tablesAccessible.activity,
        workspaces: tablesAccessible.workspace
      },
      version: '1.0.0'
    }

    const statusCode = allTablesOk ? 200 : 503
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    const responseTime = Date.now() - startTime

    console.error('Collaboration health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        features: {
          teamManagement: false,
          notifications: false,
          activityTracking: false,
          workspaces: false
        },
        version: '1.0.0'
      },
      { status: 503 }
    )
  }
}
