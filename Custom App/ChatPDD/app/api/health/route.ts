import { NextRequest, NextResponse } from 'next/server'
import { DatabasePerformance } from '@/lib/db-performance'

export async function GET(request: NextRequest) {
  try {
    // Get database health metrics
    const healthMetrics = await DatabasePerformance.getHealthMetrics()

    // Add API health information
    const apiHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json({
      success: true,
      api: apiHealth,
      database: healthMetrics,
      endpoints: {
        methodologies: '/api/methodologies',
        standards: '/api/standards',
        projects: '/api/projects',
        risks: '/api/risks',
        policies: '/api/policies',
        users: '/api/users',
      },
    })

  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json({
      success: false,
      api: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
    }, { status: 503 })
  }
}
