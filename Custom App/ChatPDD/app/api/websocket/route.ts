import { NextRequest, NextResponse } from 'next/server'
import { getWebSocketServer } from '@/lib/websocket-server'

// This endpoint provides WebSocket connection info and stats
export async function GET(request: NextRequest) {
  try {
    const wsServer = getWebSocketServer()

    if (!wsServer) {
      return NextResponse.json(
        {
          error: 'WebSocket server not initialized',
          available: false
        },
        { status: 503 }
      )
    }

    const stats = wsServer.getConnectionStats()

    return NextResponse.json({
      available: true,
      stats,
      endpoint: '/api/websocket',
      protocols: ['websocket', 'polling'],
      features: [
        'real-time-comments',
        'presence-indicators',
        'typing-indicators',
        'project-updates',
        'file-notifications',
        'activity-feed'
      ]
    })
  } catch (error) {
    console.error('WebSocket endpoint error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        available: false
      },
      { status: 500 }
    )
  }
}

// Handle WebSocket connection upgrade requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    const wsServer = getWebSocketServer()
    if (!wsServer) {
      return NextResponse.json(
        { error: 'WebSocket server not available' },
        { status: 503 }
      )
    }

    switch (action) {
      case 'send_notification':
        if (data.userId) {
          wsServer.sendNotificationToUser(data.userId, data.notification)
        } else if (data.projectId) {
          wsServer.sendNotificationToProject(data.projectId, data.notification)
        }
        return NextResponse.json({ success: true })

      case 'broadcast_update':
        if (data.projectId) {
          wsServer.broadcastProjectUpdate(data.projectId, data.update)
        }
        return NextResponse.json({ success: true })

      case 'get_stats':
        const stats = wsServer.getConnectionStats()
        return NextResponse.json({ stats })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('WebSocket API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
