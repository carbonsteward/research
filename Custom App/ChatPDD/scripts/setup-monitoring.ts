#!/usr/bin/env tsx

/**
 * Monitoring and Observability Setup Script
 * Configures comprehensive monitoring for ChatPDD collaboration features
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

interface MonitoringConfig {
  environment: 'development' | 'staging' | 'production'
  enableSentry: boolean
  enableDatadog: boolean
  enableCustomMetrics: boolean
  enableUserTracking: boolean
  enablePerformanceMonitoring: boolean
  alertingEnabled: boolean
}

interface AlertRule {
  name: string
  metric: string
  threshold: number
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  duration: string
  severity: 'critical' | 'warning' | 'info'
  channels: string[]
  description: string
}

interface Dashboard {
  name: string
  description: string
  widgets: DashboardWidget[]
}

interface DashboardWidget {
  type: 'metric' | 'graph' | 'table' | 'alert'
  title: string
  query: string
  visualization: string
  timeRange: string
}

class MonitoringSetup {
  private prisma: PrismaClient
  private config: MonitoringConfig

  constructor(config: MonitoringConfig) {
    this.config = config
    this.prisma = new PrismaClient()
  }

  async setupMonitoring(): Promise<void> {
    console.log(`🚀 Setting up monitoring for ${this.config.environment}`)

    try {
      // 1. Create monitoring tables
      await this.createMonitoringTables()

      // 2. Setup Sentry integration
      if (this.config.enableSentry) {
        await this.setupSentry()
      }

      // 3. Setup custom metrics collection
      if (this.config.enableCustomMetrics) {
        await this.setupCustomMetrics()
      }

      // 4. Create monitoring dashboards
      await this.createDashboards()

      // 5. Setup alerting rules
      if (this.config.alertingEnabled) {
        await this.setupAlertingRules()
      }

      // 6. Create health check endpoints configuration
      await this.setupHealthChecks()

      // 7. Setup performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        await this.setupPerformanceMonitoring()
      }

      // 8. Create monitoring documentation
      await this.generateMonitoringDocs()

      console.log('✅ Monitoring setup completed successfully')

    } catch (error) {
      console.error('❌ Monitoring setup failed:', error)
      throw error
    } finally {
      await this.prisma.$disconnect()
    }
  }

  private async createMonitoringTables(): Promise<void> {
    console.log('📊 Creating monitoring tables...')

    // Create metrics table for custom metrics
    const metricsTableSQL = `
      CREATE TABLE IF NOT EXISTS monitoring_metrics (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        value DECIMAL NOT NULL,
        tags JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT NOW(),
        environment TEXT DEFAULT '${this.config.environment}'
      );

      CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp
        ON monitoring_metrics(name, timestamp);
      CREATE INDEX IF NOT EXISTS idx_metrics_tags
        ON monitoring_metrics USING GIN(tags);
    `

    // Create events table for tracking user actions
    const eventsTableSQL = `
      CREATE TABLE IF NOT EXISTS monitoring_events (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type TEXT NOT NULL,
        user_id TEXT,
        session_id TEXT,
        properties JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT NOW(),
        environment TEXT DEFAULT '${this.config.environment}'
      );

      CREATE INDEX IF NOT EXISTS idx_events_type_timestamp
        ON monitoring_events(event_type, timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_user_timestamp
        ON monitoring_events(user_id, timestamp);
    `

    // Create alerts table for alert history
    const alertsTableSQL = `
      CREATE TABLE IF NOT EXISTS monitoring_alerts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        rule_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        metric_value DECIMAL,
        threshold_value DECIMAL,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP,
        environment TEXT DEFAULT '${this.config.environment}'
      );

      CREATE INDEX IF NOT EXISTS idx_alerts_rule_created
        ON monitoring_alerts(rule_name, created_at);
    `

    try {
      await this.prisma.$executeRawUnsafe(metricsTableSQL)
      await this.prisma.$executeRawUnsafe(eventsTableSQL)
      await this.prisma.$executeRawUnsafe(alertsTableSQL)
      console.log('✅ Monitoring tables created')
    } catch (error) {
      console.error('❌ Failed to create monitoring tables:', error)
    }
  }

  private async setupSentry(): Promise<void> {
    console.log('🐞 Setting up Sentry integration...')

    const sentryConfig = {
      dsn: process.env.SENTRY_DSN,
      environment: this.config.environment,
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      tracesSampleRate: this.config.environment === 'production' ? 0.1 : 1.0,
      profilesSampleRate: this.config.environment === 'production' ? 0.1 : 1.0,
      beforeSend: (event: any) => {
        // Filter out sensitive information
        if (event.exception) {
          event.exception.values?.forEach((exception: any) => {
            if (exception.stacktrace?.frames) {
              exception.stacktrace.frames.forEach((frame: any) => {
                delete frame.vars?.password
                delete frame.vars?.token
                delete frame.vars?.secret
              })
            }
          })
        }
        return event
      },
      integrations: [
        // Add collaboration-specific integrations
      ],
      tags: {
        component: 'collaboration',
        environment: this.config.environment,
      }
    }

    const sentryConfigPath = path.join(process.cwd(), 'sentry.client.config.js')
    const sentryConfigContent = `
const { init } = require('@sentry/nextjs')

init(${JSON.stringify(sentryConfig, null, 2)})
`

    fs.writeFileSync(sentryConfigPath, sentryConfigContent)
    console.log('✅ Sentry configuration created')
  }

  private async setupCustomMetrics(): Promise<void> {
    console.log('📈 Setting up custom metrics collection...')

    const metricsConfig = {
      collaboration: {
        // Team and workspace metrics
        active_workspaces: {
          query: 'SELECT COUNT(*) FROM "Workspace" WHERE is_active = true',
          type: 'gauge',
          description: 'Number of active workspaces',
        },
        total_team_members: {
          query: 'SELECT COUNT(*) FROM "ProjectTeamMember" WHERE is_active = true',
          type: 'gauge',
          description: 'Total active team members across all projects',
        },
        workspace_members: {
          query: 'SELECT COUNT(*) FROM "WorkspaceMember" WHERE is_active = true',
          type: 'gauge',
          description: 'Total workspace members',
        },

        // Real-time collaboration metrics
        active_sessions: {
          query: 'SELECT COUNT(*) FROM "UserSession" WHERE is_active = true AND expires_at > NOW()',
          type: 'gauge',
          description: 'Number of active user sessions',
        },
        websocket_connections: {
          query: 'custom', // Tracked in application code
          type: 'gauge',
          description: 'Active WebSocket connections',
        },

        // Content and sharing metrics
        shared_resources: {
          query: 'SELECT COUNT(*) FROM "SharedResource"',
          type: 'gauge',
          description: 'Total shared resources',
        },
        project_comments: {
          query: 'SELECT COUNT(*) FROM "ProjectComment" WHERE created_at > NOW() - INTERVAL \'24 hours\'',
          type: 'counter',
          description: 'Project comments in last 24 hours',
        },
        notifications_sent: {
          query: 'SELECT COUNT(*) FROM "Notification" WHERE created_at > NOW() - INTERVAL \'24 hours\'',
          type: 'counter',
          description: 'Notifications sent in last 24 hours',
        },

        // Performance metrics
        project_activities: {
          query: 'SELECT COUNT(*) FROM "ProjectActivity" WHERE timestamp > NOW() - INTERVAL \'1 hour\'',
          type: 'counter',
          description: 'Project activities in last hour',
        },
        invitation_success_rate: {
          query: `
            SELECT
              (COUNT(*) FILTER (WHERE status = 'ACCEPTED')::float /
               NULLIF(COUNT(*), 0)) * 100 as rate
            FROM "ProjectTeamMember"
            WHERE invited_at > NOW() - INTERVAL '7 days'
          `,
          type: 'gauge',
          description: 'Team invitation acceptance rate (7 days)',
        },
      },

      performance: {
        database_connections: {
          query: 'SELECT count(*) FROM pg_stat_activity WHERE state = \'active\'',
          type: 'gauge',
          description: 'Active database connections',
        },
        slow_queries: {
          query: `
            SELECT COUNT(*)
            FROM pg_stat_statements
            WHERE mean_exec_time > 1000
            AND calls > 10
          `,
          type: 'gauge',
          description: 'Number of slow queries (>1s)',
        },
        cache_hit_ratio: {
          query: 'custom', // Tracked via Redis
          type: 'gauge',
          description: 'Cache hit ratio percentage',
        },
      },

      business: {
        daily_active_users: {
          query: `
            SELECT COUNT(DISTINCT user_id)
            FROM "UserSession"
            WHERE last_activity > NOW() - INTERVAL '24 hours'
          `,
          type: 'gauge',
          description: 'Daily active users',
        },
        projects_created_today: {
          query: 'SELECT COUNT(*) FROM "Project" WHERE created_at::date = CURRENT_DATE',
          type: 'counter',
          description: 'Projects created today',
        },
        collaboration_adoption: {
          query: `
            SELECT
              (COUNT(DISTINCT p.id)::float /
               NULLIF((SELECT COUNT(*) FROM "Project"), 0)) * 100 as rate
            FROM "Project" p
            INNER JOIN "ProjectTeamMember" ptm ON p.id = ptm.project_id
            WHERE ptm.status = 'ACCEPTED'
          `,
          type: 'gauge',
          description: 'Percentage of projects with team collaboration',
        },
      }
    }

    const metricsConfigPath = path.join(process.cwd(), 'monitoring', 'metrics-config.json')
    fs.mkdirSync(path.dirname(metricsConfigPath), { recursive: true })
    fs.writeFileSync(metricsConfigPath, JSON.stringify(metricsConfig, null, 2))

    console.log('✅ Custom metrics configuration created')
  }

  private async createDashboards(): Promise<void> {
    console.log('📊 Creating monitoring dashboards...')

    const dashboards: Dashboard[] = [
      {
        name: 'Collaboration Overview',
        description: 'High-level collaboration metrics and health',
        widgets: [
          {
            type: 'metric',
            title: 'Active Workspaces',
            query: 'collaboration.active_workspaces',
            visualization: 'stat',
            timeRange: 'now',
          },
          {
            type: 'metric',
            title: 'Total Team Members',
            query: 'collaboration.total_team_members',
            visualization: 'stat',
            timeRange: 'now',
          },
          {
            type: 'graph',
            title: 'Daily Active Users',
            query: 'business.daily_active_users',
            visualization: 'timeseries',
            timeRange: '7d',
          },
          {
            type: 'graph',
            title: 'Project Activities',
            query: 'collaboration.project_activities',
            visualization: 'timeseries',
            timeRange: '24h',
          },
          {
            type: 'metric',
            title: 'WebSocket Connections',
            query: 'collaboration.websocket_connections',
            visualization: 'stat',
            timeRange: 'now',
          },
          {
            type: 'graph',
            title: 'Invitation Success Rate',
            query: 'collaboration.invitation_success_rate',
            visualization: 'stat',
            timeRange: '7d',
          },
        ],
      },
      {
        name: 'Performance Monitoring',
        description: 'Application and database performance metrics',
        widgets: [
          {
            type: 'graph',
            title: 'Database Connections',
            query: 'performance.database_connections',
            visualization: 'timeseries',
            timeRange: '1h',
          },
          {
            type: 'metric',
            title: 'Cache Hit Ratio',
            query: 'performance.cache_hit_ratio',
            visualization: 'gauge',
            timeRange: 'now',
          },
          {
            type: 'table',
            title: 'Slow Queries',
            query: 'performance.slow_queries',
            visualization: 'table',
            timeRange: '1h',
          },
          {
            type: 'graph',
            title: 'API Response Times',
            query: 'http.response_time',
            visualization: 'timeseries',
            timeRange: '1h',
          },
        ],
      },
      {
        name: 'Business Metrics',
        description: 'Business KPIs and user engagement',
        widgets: [
          {
            type: 'graph',
            title: 'User Growth',
            query: 'business.daily_active_users',
            visualization: 'timeseries',
            timeRange: '30d',
          },
          {
            type: 'metric',
            title: 'Collaboration Adoption',
            query: 'business.collaboration_adoption',
            visualization: 'gauge',
            timeRange: 'now',
          },
          {
            type: 'graph',
            title: 'Projects Created',
            query: 'business.projects_created_today',
            visualization: 'timeseries',
            timeRange: '7d',
          },
          {
            type: 'graph',
            title: 'Notifications Sent',
            query: 'collaboration.notifications_sent',
            visualization: 'timeseries',
            timeRange: '24h',
          },
        ],
      },
    ]

    const dashboardsPath = path.join(process.cwd(), 'monitoring', 'dashboards.json')
    fs.writeFileSync(dashboardsPath, JSON.stringify(dashboards, null, 2))

    console.log('✅ Monitoring dashboards created')
  }

  private async setupAlertingRules(): Promise<void> {
    console.log('🚨 Setting up alerting rules...')

    const alertRules: AlertRule[] = [
      // Critical alerts
      {
        name: 'application_down',
        metric: 'http.health_check',
        threshold: 1,
        operator: 'lt',
        duration: '1m',
        severity: 'critical',
        channels: ['slack', 'email', 'pagerduty'],
        description: 'Application health check failing',
      },
      {
        name: 'database_connections_exhausted',
        metric: 'performance.database_connections',
        threshold: 45, // 90% of 50 max connections
        operator: 'gt',
        duration: '2m',
        severity: 'critical',
        channels: ['slack', 'email', 'pagerduty'],
        description: 'Database connection pool nearly exhausted',
      },
      {
        name: 'high_error_rate',
        metric: 'http.error_rate',
        threshold: 5,
        operator: 'gt',
        duration: '3m',
        severity: 'critical',
        channels: ['slack', 'email'],
        description: 'HTTP error rate above 5%',
      },

      // Warning alerts
      {
        name: 'slow_response_times',
        metric: 'http.response_time_p95',
        threshold: 2000,
        operator: 'gt',
        duration: '5m',
        severity: 'warning',
        channels: ['slack'],
        description: '95th percentile response time above 2 seconds',
      },
      {
        name: 'websocket_connection_drops',
        metric: 'websocket.disconnection_rate',
        threshold: 10,
        operator: 'gt',
        duration: '5m',
        severity: 'warning',
        channels: ['slack'],
        description: 'High WebSocket disconnection rate',
      },
      {
        name: 'low_cache_hit_ratio',
        metric: 'performance.cache_hit_ratio',
        threshold: 80,
        operator: 'lt',
        duration: '10m',
        severity: 'warning',
        channels: ['slack'],
        description: 'Cache hit ratio below 80%',
      },

      // Info alerts
      {
        name: 'high_user_activity',
        metric: 'collaboration.project_activities',
        threshold: 1000,
        operator: 'gt',
        duration: '1h',
        severity: 'info',
        channels: ['slack'],
        description: 'High user activity detected',
      },
      {
        name: 'low_invitation_acceptance',
        metric: 'collaboration.invitation_success_rate',
        threshold: 50,
        operator: 'lt',
        duration: '24h',
        severity: 'info',
        channels: ['slack'],
        description: 'Low team invitation acceptance rate',
      },
    ]

    const alertRulesPath = path.join(process.cwd(), 'monitoring', 'alert-rules.json')
    fs.writeFileSync(alertRulesPath, JSON.stringify(alertRules, null, 2))

    console.log('✅ Alerting rules configured')
  }

  private async setupHealthChecks(): Promise<void> {
    console.log('🏥 Setting up health check endpoints...')

    const healthCheckConfig = {
      endpoints: {
        '/api/health': {
          description: 'General application health',
          checks: [
            'database_connectivity',
            'redis_connectivity',
            'external_apis',
            'file_storage'
          ],
          timeout: 5000,
          critical: true,
        },
        '/api/collaboration/health': {
          description: 'Collaboration features health',
          checks: [
            'websocket_server',
            'notification_service',
            'team_management',
            'workspace_service'
          ],
          timeout: 3000,
          critical: false,
        },
        '/api/database/health': {
          description: 'Database health and performance',
          checks: [
            'connection_pool_status',
            'query_performance',
            'replication_lag',
            'disk_space'
          ],
          timeout: 5000,
          critical: true,
        },
        '/api/cache/health': {
          description: 'Cache system health',
          checks: [
            'redis_connectivity',
            'cache_hit_ratio',
            'memory_usage',
            'eviction_rate'
          ],
          timeout: 2000,
          critical: false,
        },
      },
      monitoring: {
        check_interval: '30s',
        failure_threshold: 3,
        recovery_threshold: 2,
        notification_channels: ['slack', 'email'],
      },
    }

    const healthCheckPath = path.join(process.cwd(), 'monitoring', 'health-checks.json')
    fs.writeFileSync(healthCheckPath, JSON.stringify(healthCheckConfig, null, 2))

    console.log('✅ Health check configuration created')
  }

  private async setupPerformanceMonitoring(): Promise<void> {
    console.log('⚡ Setting up performance monitoring...')

    const performanceConfig = {
      web_vitals: {
        enabled: true,
        metrics: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'],
        sampling_rate: this.config.environment === 'production' ? 0.1 : 1.0,
        report_endpoint: '/api/performance/web-vitals',
      },
      api_performance: {
        enabled: true,
        track_all_endpoints: false,
        tracked_endpoints: [
          '/api/workspaces',
          '/api/teams',
          '/api/projects',
          '/api/collaboration/*',
          '/api/notifications',
        ],
        slow_query_threshold: 1000, // ms
        very_slow_query_threshold: 5000, // ms
      },
      database_performance: {
        enabled: true,
        track_slow_queries: true,
        slow_query_threshold: 500, // ms
        explain_plan_threshold: 1000, // ms
        track_connection_pool: true,
      },
      real_time_performance: {
        enabled: true,
        websocket_metrics: true,
        message_latency_tracking: true,
        connection_stability_tracking: true,
      },
      user_experience: {
        enabled: this.config.enableUserTracking,
        track_feature_usage: true,
        track_collaboration_events: true,
        session_replay: this.config.environment !== 'production',
      },
    }

    const performancePath = path.join(process.cwd(), 'monitoring', 'performance-config.json')
    fs.writeFileSync(performancePath, JSON.stringify(performanceConfig, null, 2))

    console.log('✅ Performance monitoring configured')
  }

  private async generateMonitoringDocs(): Promise<void> {
    console.log('📚 Generating monitoring documentation...')

    const monitoringDocs = `
# ChatPDD Monitoring and Observability

## Overview
This document describes the monitoring and observability setup for ChatPDD collaboration features.

## Monitoring Stack
- **Error Tracking**: Sentry
- **Metrics Collection**: Custom metrics + Prometheus (optional)
- **Dashboards**: Grafana (optional) or custom dashboards
- **Alerting**: Slack, Email, PagerDuty (production)
- **Health Checks**: Custom health check endpoints

## Key Metrics

### Collaboration Metrics
- \`active_workspaces\`: Number of active workspaces
- \`total_team_members\`: Total active team members
- \`websocket_connections\`: Active WebSocket connections
- \`invitation_success_rate\`: Team invitation acceptance rate
- \`project_activities\`: Recent project activities

### Performance Metrics
- \`database_connections\`: Active database connections
- \`cache_hit_ratio\`: Cache hit percentage
- \`slow_queries\`: Number of slow database queries
- \`response_time_p95\`: 95th percentile API response time

### Business Metrics
- \`daily_active_users\`: Daily active users
- \`collaboration_adoption\`: Percentage of projects with collaboration
- \`projects_created_today\`: New projects created today

## Health Check Endpoints

### \`/api/health\`
General application health including database and Redis connectivity.

### \`/api/collaboration/health\`
Collaboration-specific health checks including WebSocket server and notification service.

### \`/api/database/health\`
Database performance and connection pool status.

### \`/api/cache/health\`
Redis cache health and performance metrics.

## Alert Rules

### Critical Alerts
- Application down (health check failing)
- Database connections exhausted
- High error rate (>5%)

### Warning Alerts
- Slow response times (>2s)
- High WebSocket disconnection rate
- Low cache hit ratio (<80%)

### Info Alerts
- High user activity
- Low invitation acceptance rate

## Troubleshooting

### High Database Connections
1. Check for connection leaks in application code
2. Monitor long-running queries
3. Consider increasing connection pool size
4. Review database query optimization

### WebSocket Issues
1. Check WebSocket server health endpoint
2. Monitor connection/disconnection rates
3. Review client-side reconnection logic
4. Check load balancer configuration

### Performance Issues
1. Analyze slow query logs
2. Check cache hit ratios
3. Monitor API response times
4. Review application resource usage

## Dashboards

### Collaboration Overview
High-level collaboration metrics and user activity.

### Performance Monitoring
Application and database performance metrics.

### Business Metrics
User engagement and business KPIs.

## Configuration Files

- \`monitoring/metrics-config.json\`: Custom metrics definitions
- \`monitoring/dashboards.json\`: Dashboard configurations
- \`monitoring/alert-rules.json\`: Alerting rules
- \`monitoring/health-checks.json\`: Health check configurations
- \`monitoring/performance-config.json\`: Performance monitoring settings

## Environment Variables

### Required
- \`SENTRY_DSN\`: Sentry error tracking DSN
- \`MONITORING_API_KEY\`: Monitoring service API key

### Optional
- \`DATADOG_API_KEY\`: DataDog integration
- \`SLACK_WEBHOOK_URL\`: Slack notifications
- \`PAGERDUTY_API_KEY\`: PagerDuty alerts (production)

## Maintenance

### Daily
- Review critical alerts
- Check dashboard for anomalies
- Monitor performance trends

### Weekly
- Review alert rules effectiveness
- Analyze user behavior trends
- Check monitoring system health

### Monthly
- Update alerting thresholds
- Review dashboard configurations
- Analyze long-term trends
- Plan capacity scaling

## Contact Information

### Monitoring Team
- **Primary Contact**: [Contact Information]
- **Secondary Contact**: [Contact Information]
- **Emergency Escalation**: [Contact Information]

### External Services
- **Sentry Support**: [Support Information]
- **Monitoring Provider**: [Support Information]
`

    const docsPath = path.join(process.cwd(), 'docs', 'monitoring.md')
    fs.mkdirSync(path.dirname(docsPath), { recursive: true })
    fs.writeFileSync(docsPath, monitoringDocs)

    console.log('✅ Monitoring documentation generated')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)

  const config: MonitoringConfig = {
    environment: (args.find(arg => arg.startsWith('--environment='))?.split('=')[1] as any) || 'development',
    enableSentry: !args.includes('--no-sentry'),
    enableDatadog: args.includes('--enable-datadog'),
    enableCustomMetrics: !args.includes('--no-custom-metrics'),
    enableUserTracking: !args.includes('--no-user-tracking'),
    enablePerformanceMonitoring: !args.includes('--no-performance'),
    alertingEnabled: !args.includes('--no-alerts'),
  }

  if (args.includes('--help')) {
    console.log(`
Monitoring Setup Script

Usage: tsx scripts/setup-monitoring.ts [options]

Options:
  --environment=<env>          Target environment (development|staging|production)
  --no-sentry                  Disable Sentry integration
  --enable-datadog             Enable DataDog integration
  --no-custom-metrics          Disable custom metrics collection
  --no-user-tracking           Disable user behavior tracking
  --no-performance             Disable performance monitoring
  --no-alerts                  Disable alerting rules
  --help                       Show this help message

Examples:
  tsx scripts/setup-monitoring.ts --environment=production
  tsx scripts/setup-monitoring.ts --environment=staging --no-user-tracking
  tsx scripts/setup-monitoring.ts --environment=development --no-alerts
    `)
    process.exit(0)
  }

  console.log('📊 ChatPDD Monitoring Setup')
  console.log('===========================')
  console.log(`Environment: ${config.environment}`)
  console.log(`Sentry: ${config.enableSentry ? 'Enabled' : 'Disabled'}`)
  console.log(`Custom Metrics: ${config.enableCustomMetrics ? 'Enabled' : 'Disabled'}`)
  console.log(`Performance Monitoring: ${config.enablePerformanceMonitoring ? 'Enabled' : 'Disabled'}`)
  console.log(`Alerting: ${config.alertingEnabled ? 'Enabled' : 'Disabled'}`)
  console.log('')

  const setup = new MonitoringSetup(config)
  await setup.setupMonitoring()
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Monitoring setup script failed:', error)
    process.exit(1)
  })
}

export { MonitoringSetup, MonitoringConfig }
