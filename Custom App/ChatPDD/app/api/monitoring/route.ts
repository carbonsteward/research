import { NextRequest, NextResponse } from 'next/server'
import { monitoringService } from '@/services/monitoring-service'
import { createLogger } from '@/lib/logger'

const logger = createLogger('monitoring-api')

/**
 * Get monitoring alerts
 * GET /api/monitoring?projectId=xxx&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '10')

    let alerts
    if (projectId) {
      alerts = await monitoringService.getProjectAlerts(projectId, limit)
    } else {
      alerts = await monitoringService.getGlobalAlerts(limit)
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      meta: {
        count: alerts.length,
        projectId,
        limit
      }
    })
  } catch (error) {
    logger.error('Error fetching monitoring alerts', { error })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch monitoring alerts'
      },
      { status: 500 }
    )
  }
}

/**
 * Acknowledge or resolve alerts
 * POST /api/monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, alertId, userId, resolution } = body

    if (!action || !alertId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: action, alertId, userId'
        },
        { status: 400 }
      )
    }

    let result
    switch (action) {
      case 'acknowledge':
        result = await monitoringService.acknowledgeAlert(alertId, userId)
        break
      case 'resolve':
        result = await monitoringService.resolveAlert(alertId, userId, resolution)
        break
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('Error processing monitoring action', { error })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monitoring action'
      },
      { status: 500 }
    )
  }
}
