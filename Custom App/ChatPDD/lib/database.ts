import { PrismaClient } from '@prisma/client'
import { createLogger } from './logger'

const logger = createLogger('database')

declare global {
  var __prisma: PrismaClient | undefined
}

// Database connection with optimized settings
const createPrismaClient = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Singleton pattern for Prisma client
export const prisma = globalThis.__prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Event listeners for logging
prisma.$on('query', (e) => {
  if (process.env.LOG_QUERIES === 'true') {
    logger.debug('Query executed', {
      query: e.query,
      params: e.params,
      duration: e.duration,
      target: e.target,
    })
  }
})

prisma.$on('error', (e) => {
  logger.error('Database error', {
    message: e.message,
    target: e.target,
  })
})

prisma.$on('warn', (e) => {
  logger.warn('Database warning', {
    message: e.message,
    target: e.target,
  })
})

prisma.$on('info', (e) => {
  logger.info('Database info', {
    message: e.message,
    target: e.target,
  })
})

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  details: {
    connected: boolean
    latency?: number
    error?: string
  }
}> {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    
    logger.info('Database health check passed', { latency })
    
    return {
      status: 'healthy',
      details: {
        connected: true,
        latency,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Database health check failed', { error: errorMessage })
    
    return {
      status: 'unhealthy',
      details: {
        connected: false,
        error: errorMessage,
      },
    }
  }
}

// Database statistics
export async function getDatabaseStats() {
  try {
    const [
      userCount,
      projectCount,
      methodologyCount,
      riskAssessmentCount,
      satelliteAnalysisCount,
      documentAnalysisCount,
      policyComplianceCount,
    ] = await Promise.all([
      prisma.userProfile.count(),
      prisma.project.count(),
      prisma.methodology.count(),
      prisma.riskAssessment.count(),
      prisma.satelliteAnalysis.count(),
      prisma.documentAnalysis.count(),
      prisma.policyComplianceAssessment.count(),
    ])

    return {
      userCount,
      projectCount,
      methodologyCount,
      riskAssessmentCount,
      satelliteAnalysisCount,
      documentAnalysisCount,
      policyComplianceCount,
    }
  } catch (error) {
    logger.error('Failed to get database stats', { error })
    throw error
  }
}

// Connection pool management
export async function closeDatabaseConnection() {
  try {
    await prisma.$disconnect()
    logger.info('Database connection closed')
  } catch (error) {
    logger.error('Error closing database connection', { error })
    throw error
  }
}

// Database transaction helper
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      return await fn(tx as PrismaClient)
    })
    return result
  } catch (error) {
    logger.error('Transaction failed', { error })
    throw error
  }
}

// Database migration status
export async function getMigrationStatus() {
  try {
    // Check if _prisma_migrations table exists
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      ) as migrations_table_exists
    ` as [{ migrations_table_exists: boolean }]

    if (!result[0]?.migrations_table_exists) {
      return {
        status: 'no_migrations',
        pendingMigrations: [],
        appliedMigrations: [],
      }
    }

    // Get migration status
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations
      ORDER BY finished_at DESC
    ` as Array<{
      migration_name: string
      finished_at: Date | null
      applied_steps_count: number
    }>

    const appliedMigrations = migrations.filter(m => m.finished_at !== null)
    const pendingMigrations = migrations.filter(m => m.finished_at === null)

    return {
      status: pendingMigrations.length > 0 ? 'pending' : 'up_to_date',
      pendingMigrations,
      appliedMigrations,
    }
  } catch (error) {
    logger.error('Failed to get migration status', { error })
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      pendingMigrations: [],
      appliedMigrations: [],
    }
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await closeDatabaseConnection()
})

process.on('SIGINT', async () => {
  await closeDatabaseConnection()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeDatabaseConnection()
  process.exit(0)
})

export default prisma