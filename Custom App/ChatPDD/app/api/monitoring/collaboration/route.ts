import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/monitoring/collaboration - Get collaboration metrics for monitoring
export async function GET(request: NextRequest) {
  try {
    // Get real-time metrics for monitoring
    const [
      totalUsers,
      activeWorkspaces,
      recentActivities,
      recentNotifications,
      recentInvitations,
      totalProjects,
      recentComments
    ] = await Promise.all([
      // Total users with collaboration features
      prisma.userProfile.count({
        where: {
          OR: [
            { workspaceMembers: { some: {} } },
            { teamMemberships: { some: {} } }
          ]
        }
      }),

      // Active workspaces (with recent activity)
      prisma.workspace.count({
        where: {
          members: { some: {} }
        }
      }),

      // Recent activities (last hour)
      prisma.projectActivity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      }),

      // Recent notifications (last hour)
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      }),

      // Recent team invitations (last 24 hours)
      prisma.projectTeamMember.count({
        where: {
          status: 'PENDING',
          invitedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),

      // Total projects with collaboration enabled
      prisma.project.count({
        where: {
          teamMembers: { some: {} }
        }
      }),

      // Recent comments (last hour)
      prisma.projectComment.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      })
    ])

    // Calculate some derived metrics
    const activeUsers = Math.min(totalUsers, recentActivities * 2) // Estimate based on activity
    const realtimeConnections = Math.floor(activeUsers * 0.3) // Estimate 30% of active users online

    const metrics = {
      activeUsers,
      activeWorkspaces,
      realtimeConnections,
      notificationsSent: recentNotifications,
      teamInvitations: recentInvitations,
      totalProjects,
      recentActivities,
      recentComments,
      timestamp: new Date().toISOString(),
      status: 'healthy'
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching collaboration metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch collaboration metrics',
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
