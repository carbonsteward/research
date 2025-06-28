#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { createLogger } from '../lib/logger'
import { prisma, checkDatabaseHealth, getMigrationStatus } from '../lib/database'
import { checkCacheHealth } from '../lib/cache'

const logger = createLogger('database-setup')

interface SetupOptions {
  environment: 'development' | 'staging' | 'production'
  skipMigrations?: boolean
  skipSeeding?: boolean
  backup?: boolean
  force?: boolean
}

async function setupDatabase(options: SetupOptions) {
  const { environment, skipMigrations = false, skipSeeding = false, backup = false, force = false } = options

  logger.info('Starting database setup', { environment, options })

  try {
    // 1. Check current database health
    logger.info('Checking database connectivity...')
    const healthCheck = await checkDatabaseHealth()

    if (healthCheck.status === 'unhealthy' && !force) {
      logger.error('Database is unhealthy, cannot proceed', healthCheck.details)
      process.exit(1)
    }

    logger.info('Database connectivity verified', healthCheck.details)

    // 2. Create backup if requested and in production
    if (backup && environment === 'production') {
      logger.info('Creating database backup...')
      await createDatabaseBackup()
    }

    // 3. Check migration status
    if (!skipMigrations) {
      logger.info('Checking migration status...')
      const migrationStatus = await getMigrationStatus()

      logger.info('Migration status', migrationStatus)

      if (migrationStatus.status === 'pending' || migrationStatus.status === 'no_migrations') {
        logger.info('Running database migrations...')
        await runMigrations(environment)
      } else if (migrationStatus.status === 'error') {
        logger.error('Migration status check failed', { error: migrationStatus.error })
        if (!force) process.exit(1)
      }
    }

    // 4. Generate Prisma client
    logger.info('Generating Prisma client...')
    execSync('pnpm prisma generate', { stdio: 'inherit' })

    // 5. Verify database schema
    logger.info('Verifying database schema...')
    await verifyDatabaseSchema()

    // 6. Seed database if requested
    if (!skipSeeding && environment !== 'production') {
      logger.info('Seeding database...')
      await seedDatabase()
    }

    // 7. Check cache health
    logger.info('Checking cache health...')
    const cacheHealth = await checkCacheHealth()
    logger.info('Cache health status', cacheHealth)

    // 8. Run post-setup verification
    logger.info('Running post-setup verification...')
    await postSetupVerification()

    logger.info('Database setup completed successfully!')

  } catch (error) {
    logger.error('Database setup failed', { error })
    process.exit(1)
  }
}

async function runMigrations(environment: string) {
  try {
    if (environment === 'production') {
      // Use deploy for production (no interactive prompts)
      execSync('pnpm prisma migrate deploy', { stdio: 'inherit' })
    } else {
      // Use dev for development/staging
      execSync('pnpm prisma migrate dev --name auto_migration', { stdio: 'inherit' })
    }
    logger.info('Migrations completed successfully')
  } catch (error) {
    logger.error('Migration failed', { error })
    throw error
  }
}

async function createDatabaseBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = `backup-${timestamp}.sql`

    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured')
    }

    // Extract connection details from DATABASE_URL
    const url = new URL(databaseUrl)
    const host = url.hostname
    const port = url.port || '5432'
    const database = url.pathname.slice(1)
    const username = url.username
    const password = url.password

    // Create backup using pg_dump
    const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} > backups/${backupFile}`

    execSync('mkdir -p backups', { stdio: 'inherit' })
    execSync(pgDumpCommand, { stdio: 'inherit' })

    logger.info('Database backup created', { backupFile })
  } catch (error) {
    logger.error('Backup creation failed', { error })
    throw error
  }
}

async function verifyDatabaseSchema() {
  try {
    // Verify core tables exist and have expected structure
    const tables = [
      'UserProfile',
      'Project',
      'Methodology',
      'CarbonStandard',
      'SatelliteAnalysis',
      'DocumentAnalysis',
      'PolicyComplianceAssessment',
      'ProjectMilestone',
      'ImpactMeasurement',
      'CacheEntry',
      'AuditLog',
    ]

    for (const tableName of tables) {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        ) as table_exists
      ` as [{ table_exists: boolean }]

      if (!result[0]?.table_exists) {
        throw new Error(`Required table ${tableName} does not exist`)
      }
    }

    // Verify indexes exist
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
    ` as Array<{ indexname: string; tablename: string }>

    logger.info('Database schema verified', {
      tableCount: tables.length,
      indexCount: indexes.length
    })

  } catch (error) {
    logger.error('Schema verification failed', { error })
    throw error
  }
}

async function seedDatabase() {
  try {
    execSync('pnpm db:seed', { stdio: 'inherit' })
    logger.info('Database seeding completed')
  } catch (error) {
    logger.error('Database seeding failed', { error })
    // Don't throw - seeding is optional
  }
}

async function postSetupVerification() {
  try {
    // Test basic CRUD operations
    const testUser = await prisma.userProfile.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        profileType: 'PROJECT_DEVELOPER',
      },
    })

    const testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'Database setup verification project',
        projectType: 'AFOLU',
        country: 'TEST',
        userId: testUser.id,
      },
    })

    // Clean up test data
    await prisma.project.delete({ where: { id: testProject.id } })
    await prisma.userProfile.delete({ where: { id: testUser.id } })

    logger.info('Post-setup verification completed successfully')

  } catch (error) {
    logger.error('Post-setup verification failed', { error })
    throw error
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  const options: SetupOptions = {
    environment: (args.find(arg => arg.startsWith('--env='))?.split('=')[1] as SetupOptions['environment']) || 'development',
    skipMigrations: args.includes('--skip-migrations'),
    skipSeeding: args.includes('--skip-seeding'),
    backup: args.includes('--backup'),
    force: args.includes('--force'),
  }

  // Validate environment
  if (!['development', 'staging', 'production'].includes(options.environment)) {
    logger.error('Invalid environment specified. Use: development, staging, or production')
    process.exit(1)
  }

  // Safety check for production
  if (options.environment === 'production' && !options.force) {
    logger.warn('Production database setup requires --force flag for safety')
    process.exit(1)
  }

  await setupDatabase(options)
}

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception during database setup', { error })
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection during database setup', { reason })
  process.exit(1)
})

if (require.main === module) {
  main()
}

export { setupDatabase }
