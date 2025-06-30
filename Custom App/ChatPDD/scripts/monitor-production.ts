#!/usr/bin/env tsx

/**
 * Production Monitoring Script
 * Real-time monitoring of collaboration features in production
 */

interface MonitoringMetrics {
  timestamp: string
  endpoint: string
  responseTime: number
  status: number
  success: boolean
  error?: string
}

interface CollaborationMetrics {
  activeUsers: number
  activeWorkspaces: number
  realtimeConnections: number
  notificationsSent: number
  teamInvitations: number
}

class ProductionMonitor {
  private baseUrl: string
  private metrics: MonitoringMetrics[] = []
  private isMonitoring = false
  private interval?: NodeJS.Timeout

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  async checkEndpoint(path: string): Promise<MonitoringMetrics> {
    const url = `${this.baseUrl}${path}`
    const startTime = Date.now()

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'ChatPDD-Monitor/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      const responseTime = Date.now() - startTime

      return {
        timestamp: new Date().toISOString(),
        endpoint: path,
        responseTime,
        status: response.status,
        success: response.ok
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        timestamp: new Date().toISOString(),
        endpoint: path,
        responseTime,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  async getCollaborationMetrics(): Promise<CollaborationMetrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/monitoring/collaboration`, {
        headers: { 'User-Agent': 'ChatPDD-Monitor/1.0' }
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      return null
    }
  }

  async runHealthChecks(): Promise<MonitoringMetrics[]> {
    const endpoints = [
      '/api/health',
      '/api/collaboration/projects/health-check',
      '/collaboration',
      '/api/auth/me',
      '/api/methodologies',
      '/api/standards'
    ]

    console.log(`🔍 Checking ${endpoints.length} endpoints...`)

    const results = await Promise.all(
      endpoints.map(endpoint => this.checkEndpoint(endpoint))
    )

    this.metrics.push(...results)

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    return results
  }

  displayResults(results: MonitoringMetrics[], collaborationMetrics?: CollaborationMetrics | null) {
    console.clear()
    console.log('🚀 ChatPDD Production Monitor')
    console.log('================================')
    console.log(`🌐 Base URL: ${this.baseUrl}`)
    console.log(`⏰ Last Check: ${new Date().toLocaleString()}`)
    console.log()

    // Health Check Results
    console.log('📊 Health Check Results:')
    results.forEach(metric => {
      const emoji = metric.success ? '✅' : '❌'
      const status = metric.success ? `${metric.status}` : `${metric.status || 'TIMEOUT'}`
      const time = `${metric.responseTime}ms`

      console.log(`${emoji} ${metric.endpoint.padEnd(35)} ${status.padEnd(8)} ${time.padStart(8)}`)

      if (metric.error) {
        console.log(`     Error: ${metric.error}`)
      }
    })

    // Collaboration Metrics
    if (collaborationMetrics) {
      console.log()
      console.log('🤝 Collaboration Metrics:')
      console.log(`   Active Users: ${collaborationMetrics.activeUsers}`)
      console.log(`   Active Workspaces: ${collaborationMetrics.activeWorkspaces}`)
      console.log(`   Real-time Connections: ${collaborationMetrics.realtimeConnections}`)
      console.log(`   Notifications Sent (1h): ${collaborationMetrics.notificationsSent}`)
      console.log(`   Team Invitations (24h): ${collaborationMetrics.teamInvitations}`)
    }

    // Summary Statistics
    const successful = results.filter(r => r.success).length
    const failed = results.length - successful
    const avgResponseTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.responseTime, 0) / (successful || 1)

    console.log()
    console.log('📈 Summary:')
    console.log(`   Success Rate: ${successful}/${results.length} (${((successful/results.length)*100).toFixed(1)}%)`)
    console.log(`   Avg Response Time: ${avgResponseTime.toFixed(0)}ms`)
    console.log(`   Failed Checks: ${failed}`)

    // Alerts
    if (failed > 0) {
      console.log()
      console.log('🚨 ALERTS:')
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`   • ${r.endpoint} - ${r.error || `HTTP ${r.status}`}`))
    }

    if (avgResponseTime > 2000) {
      console.log()
      console.log('⚠️  WARNING: High response times detected')
    }

    console.log()
    console.log('Press Ctrl+C to stop monitoring')
  }

  async startMonitoring(intervalSeconds = 30) {
    console.log(`🚀 Starting production monitoring (checking every ${intervalSeconds}s)`)
    this.isMonitoring = true

    // Initial check
    await this.performCheck()

    // Set up interval
    this.interval = setInterval(async () => {
      if (this.isMonitoring) {
        await this.performCheck()
      }
    }, intervalSeconds * 1000)

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stopMonitoring()
      process.exit(0)
    })
  }

  private async performCheck() {
    try {
      const healthResults = await this.runHealthChecks()
      const collaborationMetrics = await this.getCollaborationMetrics()
      this.displayResults(healthResults, collaborationMetrics)
    } catch (error) {
      console.error('❌ Monitoring check failed:', error)
    }
  }

  stopMonitoring() {
    console.log('\n🛑 Stopping monitoring...')
    this.isMonitoring = false
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  getMetricsReport(): { total: number, successful: number, averageResponseTime: number } {
    const total = this.metrics.length
    const successful = this.metrics.filter(m => m.success).length
    const successfulMetrics = this.metrics.filter(m => m.success)
    const averageResponseTime = successfulMetrics.length > 0
      ? successfulMetrics.reduce((sum, m) => sum + m.responseTime, 0) / successfulMetrics.length
      : 0

    return { total, successful, averageResponseTime }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
ChatPDD Production Monitor

Usage: pnpm tsx scripts/monitor-production.ts [options] <url>

Options:
  --interval <seconds>   Check interval in seconds (default: 30)
  --once                Run checks once and exit
  --help                Show this help message

Examples:
  pnpm tsx scripts/monitor-production.ts https://chatpdd.vercel.app
  pnpm tsx scripts/monitor-production.ts --interval 60 https://chatpdd.vercel.app
  pnpm tsx scripts/monitor-production.ts --once https://chatpdd.vercel.app
`)
    process.exit(0)
  }

  const url = args.find(arg => arg.startsWith('http')) || 'https://chatpdd.vercel.app'
  const intervalArg = args.findIndex(arg => arg === '--interval')
  const interval = intervalArg !== -1 ? parseInt(args[intervalArg + 1]) || 30 : 30
  const runOnce = args.includes('--once')

  const monitor = new ProductionMonitor(url)

  if (runOnce) {
    console.log('🔍 Running single health check...')
    const results = await monitor.runHealthChecks()
    const collaborationMetrics = await monitor.getCollaborationMetrics()
    monitor.displayResults(results, collaborationMetrics)

    const report = monitor.getMetricsReport()
    console.log(`\n📋 Final Report: ${report.successful}/${report.total} checks passed, avg ${report.averageResponseTime.toFixed(0)}ms`)
  } else {
    await monitor.startMonitoring(interval)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { ProductionMonitor }
