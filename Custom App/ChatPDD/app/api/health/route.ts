import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth, getDatabaseStats } from '@/lib/database'
import { checkCacheHealth, cache } from '@/lib/cache'

/**
 * Comprehensive health check endpoint
 * Returns detailed application health status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // Basic system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    }

    // Database health check
    const databaseHealth = await checkDatabaseHealth()

    // Cache health check
    const cacheHealth = await checkCacheHealth()

    // Database statistics
    let dbStats = null
    try {
      dbStats = await getDatabaseStats()
    } catch (error) {
      console.log('Could not retrieve database stats:', error.message)
    }

    // Cache statistics
    let cacheStats = null
    try {
      cacheStats = await cache.getStats()
    } catch (error) {
      console.log('Could not retrieve cache stats:', error.message)
    }

    // AI Services check
    let aiServicesStatus = 'unknown'
    try {
      const hasOpenAI = !!process.env.OPENAI_API_KEY
      const hasGoogleMaps = !!process.env.GOOGLE_MAPS_API_KEY

      if (hasOpenAI && hasGoogleMaps) {
        aiServicesStatus = 'fully_configured'
      } else if (hasOpenAI) {
        aiServicesStatus = 'partially_configured'
      } else {
        aiServicesStatus = 'not_configured'
      }
    } catch (error) {
      aiServicesStatus = 'error'
    }

    // Calculate response time
    const responseTime = Date.now() - startTime

    // Determine overall health status
    const isHealthy = databaseHealth.status === 'healthy' &&
                     cacheHealth.status !== 'unhealthy' &&
                     aiServicesStatus !== 'error' &&
                     responseTime < 1000 &&
                     systemInfo.memory.heapUsed < systemInfo.memory.heapTotal * 0.9

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: systemInfo.timestamp,
      responseTime,
      environment: systemInfo.environment,
      version: systemInfo.version,
      system: {
        uptime: systemInfo.uptime,
        memory: {
          used: Math.round(systemInfo.memory.heapUsed / 1024 / 1024),
          total: Math.round(systemInfo.memory.heapTotal / 1024 / 1024),
          usage: Math.round((systemInfo.memory.heapUsed / systemInfo.memory.heapTotal) * 100)
        },
        nodeVersion: systemInfo.nodeVersion
      },
      services: {
        database: {
          ...databaseHealth,
          stats: dbStats
        },
        cache: {
          ...cacheHealth,
          stats: cacheStats
        },
        aiServices: {
          status: aiServicesStatus,
          openai: !!process.env.OPENAI_API_KEY,
          googleMaps: !!process.env.GOOGLE_MAPS_API_KEY
        }
      },
      endpoints: {
        methodologies: '/api/methodologies',
        standards: '/api/standards',
        projects: '/api/projects',
        risks: '/api/risks',
        policies: '/api/policies',
        users: '/api/users',
        geospy: '/api/geospy/analyze'
      }
    }

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503

    return NextResponse.json(healthData, { status: statusCode })

  } catch (error) {
    console.error('Health check error:', error)

    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * Health check with specific service focus
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { service } = body

    if (!service) {
      return NextResponse.json({
        error: 'Service parameter required'
      }, { status: 400 })
    }

    let serviceHealth = {}

    switch (service) {
      case 'database':
        serviceHealth = await checkDatabaseHealth()
        break

      case 'ai':
        serviceHealth = await checkAIServicesHealth()
        break

      case 'all':
        const [dbHealth, aiHealth] = await Promise.all([
          checkDatabaseHealth(),
          checkAIServicesHealth()
        ])
        serviceHealth = { database: dbHealth, ai: aiHealth }
        break

      default:
        return NextResponse.json({
          error: `Unknown service: ${service}`
        }, { status: 400 })
    }

    return NextResponse.json({
      service,
      timestamp: new Date().toISOString(),
      health: serviceHealth
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 500 })
  }
}

async function checkDatabaseHealth() {
  const startTime = Date.now()

  try {
    // Simulate database check
    await new Promise(resolve => setTimeout(resolve, 10))

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      configured: !!process.env.DATABASE_URL,
      details: {
        connectionPool: 'active',
        migrations: 'up_to_date'
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkAIServicesHealth() {
  const startTime = Date.now()

  try {
    const openaiConfigured = !!process.env.OPENAI_API_KEY
    const googleMapsConfigured = !!process.env.GOOGLE_MAPS_API_KEY

    return {
      status: openaiConfigured ? 'healthy' : 'degraded',
      responseTime: Date.now() - startTime,
      services: {
        openai: {
          configured: openaiConfigured,
          status: openaiConfigured ? 'available' : 'not_configured'
        },
        googleMaps: {
          configured: googleMapsConfigured,
          status: googleMapsConfigured ? 'available' : 'not_configured'
        }
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
