#!/usr/bin/env tsx

/**
 * Pre-deployment Verification Script
 * Verifies all systems are ready for production deployment
 */

import { PrismaClient } from '@prisma/client'
import { getRedisClient, closeRedisConnection } from '../lib/redis-config'

interface CheckResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const checks: CheckResult[] = []

async function checkDatabase(): Promise<CheckResult> {
  try {
    const prisma = new PrismaClient()

    // Test basic connection
    await prisma.$connect()

    // Test collaboration tables exist
    const workspaceCount = await prisma.workspace.count()
    const teamMemberCount = await prisma.projectTeamMember.count()

    await prisma.$disconnect()

    return {
      name: 'Database Connection',
      status: 'PASS',
      message: `Database connected successfully. Found ${workspaceCount} workspaces, ${teamMemberCount} team members.`,
      details: { workspaces: workspaceCount, teamMembers: teamMemberCount }
    }
  } catch (error) {
    return {
      name: 'Database Connection',
      status: 'FAIL',
      message: 'Database connection failed',
      details: { error: error instanceof Error ? error.message : String(error) }
    }
  }
}

async function checkRedis(): Promise<CheckResult> {
  try {
    const redis = getRedisClient()

    if (!redis) {
      return {
        name: 'Redis Connection',
        status: 'WARN',
        message: 'Redis not configured - running without cache',
        details: { note: 'Application will work without Redis but with reduced performance' }
      }
    }

    await redis.ping()
    await closeRedisConnection()

    return {
      name: 'Redis Connection',
      status: 'PASS',
      message: 'Redis connected successfully',
    }
  } catch (error) {
    return {
      name: 'Redis Connection',
      status: 'WARN',
      message: 'Redis connection failed - will run without cache',
      details: { error: error instanceof Error ? error.message : String(error) }
    }
  }
}

async function checkEnvironmentVariables(): Promise<CheckResult> {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL',
    'NODE_ENV'
  ]

  const optional = [
    'REDIS_URL',
    'CLIMATE_POLICY_RADAR_API_KEY',
    'VERCEL_TOKEN'
  ]

  const missing = required.filter(key => !process.env[key])
  const optionalMissing = optional.filter(key => !process.env[key])

  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      status: 'FAIL',
      message: `Missing required environment variables: ${missing.join(', ')}`,
      details: { missing, optionalMissing }
    }
  }

  return {
    name: 'Environment Variables',
    status: 'PASS',
    message: `All required variables present. ${optionalMissing.length} optional variables missing.`,
    details: { optionalMissing }
  }
}

async function checkBuildArtifacts(): Promise<CheckResult> {
  try {
    const fs = await import('fs')
    const path = await import('path')

    const buildDir = path.join(process.cwd(), '.next')
    const standaloneDir = path.join(buildDir, 'standalone')
    const staticDir = path.join(buildDir, 'static')

    const buildExists = fs.existsSync(buildDir)
    const staticExists = fs.existsSync(staticDir)

    if (!buildExists) {
      return {
        name: 'Build Artifacts',
        status: 'FAIL',
        message: 'Build directory not found. Run "pnpm build" first.',
      }
    }

    if (!staticExists) {
      return {
        name: 'Build Artifacts',
        status: 'FAIL',
        message: 'Static assets not found. Build may have failed.',
      }
    }

    // Check for critical pages
    const serverDir = path.join(buildDir, 'server', 'app')
    const collaborationPage = path.join(serverDir, 'collaboration', 'page.js')
    const apiRoutes = path.join(buildDir, 'server', 'pages', 'api')

    const collaborationExists = fs.existsSync(collaborationPage)
    const apiExists = fs.existsSync(apiRoutes)

    return {
      name: 'Build Artifacts',
      status: 'PASS',
      message: 'Build artifacts verified',
      details: {
        collaboration: collaborationExists,
        apiRoutes: apiExists,
        buildSize: getBuildSize(buildDir)
      }
    }
  } catch (error) {
    return {
      name: 'Build Artifacts',
      status: 'FAIL',
      message: 'Failed to verify build artifacts',
      details: { error: error instanceof Error ? error.message : String(error) }
    }
  }
}

function getBuildSize(buildDir: string): string {
  try {
    const fs = require('fs')
    const path = require('path')

    function getDirectorySize(dirPath: string): number {
      let totalSize = 0
      const files = fs.readdirSync(dirPath)

      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = fs.statSync(filePath)

        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath)
        } else {
          totalSize += stats.size
        }
      }

      return totalSize
    }

    const sizeBytes = getDirectorySize(buildDir)
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2)
    return `${sizeMB} MB`
  } catch {
    return 'unknown'
  }
}

async function checkCollaborationFeatures(): Promise<CheckResult> {
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()

    // Check if collaboration tables have proper structure
    const tableChecks = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) FROM "Workspace" WHERE 1=0`,
      prisma.$queryRaw`SELECT COUNT(*) FROM "ProjectTeamMember" WHERE 1=0`,
      prisma.$queryRaw`SELECT COUNT(*) FROM "Notification" WHERE 1=0`,
      prisma.$queryRaw`SELECT COUNT(*) FROM "ProjectActivity" WHERE 1=0`,
      prisma.$queryRaw`SELECT COUNT(*) FROM "SharedResource" WHERE 1=0`,
    ])

    await prisma.$disconnect()

    return {
      name: 'Collaboration Features',
      status: 'PASS',
      message: 'All collaboration tables verified',
      details: { tablesChecked: 5 }
    }
  } catch (error) {
    return {
      name: 'Collaboration Features',
      status: 'FAIL',
      message: 'Collaboration tables verification failed',
      details: { error: error instanceof Error ? error.message : String(error) }
    }
  }
}

async function runAllChecks() {
  console.log('🔍 Running Pre-Deployment Verification...\n')

  const checkFunctions = [
    checkEnvironmentVariables,
    checkDatabase,
    checkRedis,
    checkBuildArtifacts,
    checkCollaborationFeatures,
  ]

  for (const checkFn of checkFunctions) {
    try {
      const result = await checkFn()
      checks.push(result)

      const emoji = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌'
      console.log(`${emoji} ${result.name}: ${result.message}`)

      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
      }
    } catch (error) {
      checks.push({
        name: checkFn.name,
        status: 'FAIL',
        message: 'Check execution failed',
        details: { error: error instanceof Error ? error.message : String(error) }
      })
      console.log(`❌ ${checkFn.name}: Check execution failed`)
    }
    console.log()
  }

  // Summary
  const passed = checks.filter(c => c.status === 'PASS').length
  const warned = checks.filter(c => c.status === 'WARN').length
  const failed = checks.filter(c => c.status === 'FAIL').length

  console.log('📊 Summary:')
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ⚠️  Warnings: ${warned}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log()

  if (failed > 0) {
    console.log('❌ Deployment NOT READY - Fix failed checks before deploying')
    process.exit(1)
  } else if (warned > 0) {
    console.log('⚠️  Deployment READY with warnings - Review warnings before deploying')
  } else {
    console.log('✅ Deployment READY - All checks passed!')
  }
}

// Run if called directly
if (require.main === module) {
  runAllChecks().catch(console.error)
}

export { runAllChecks, checks }
