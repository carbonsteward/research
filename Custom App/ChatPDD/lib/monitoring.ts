/**
 * Application Monitoring and Alerting System
 * Provides comprehensive monitoring, error tracking, and performance metrics
 */

export interface MonitoringConfig {
  environment: 'development' | 'staging' | 'production'
  enableErrorTracking: boolean
  enablePerformanceMonitoring: boolean
  enableHealthChecks: boolean
  alertingChannels: AlertingChannel[]
}

export interface AlertingChannel {
  type: 'slack' | 'email' | 'github' | 'webhook'
  config: Record<string, any>
  severityFilter: AlertSeverity[]
}

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface MetricEvent {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
  metadata?: Record<string, any>
}

export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  details?: Record<string, any>
  timestamp: Date
}

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  message: string
  timestamp: Date
  tags: Record<string, string>
  resolved?: Date
}

class MonitoringService {
  private config: MonitoringConfig
  private metrics: Map<string, MetricEvent[]> = new Map()
  private alerts: Alert[] = []
  private healthChecks: Map<string, HealthCheckResult> = new Map()

  constructor(config: MonitoringConfig) {
    this.config = config

    if (config.enableHealthChecks) {
      this.initializeHealthChecks()
    }
  }

  /**
   * Track custom metrics
   */
  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    const event: MetricEvent = {
      name,
      value,
      timestamp: new Date(),
      tags,
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const events = this.metrics.get(name)!
    events.push(event)

    // Keep only last 100 events per metric
    if (events.length > 100) {
      events.shift()
    }

    // Check for alert conditions
    this.checkAlertConditions(name, value, tags)
  }

  /**
   * Track performance metrics
   */
  trackPerformance(operation: string, startTime: number, metadata?: Record<string, any>): void {
    if (!this.config.enablePerformanceMonitoring) return

    const duration = Date.now() - startTime

    this.trackMetric(`performance.${operation}.duration`, duration, {
      operation,
      environment: this.config.environment
    })

    // Track slow operations
    if (duration > 2000) {
      this.createAlert('warning', 'Slow Operation Detected',
        `Operation "${operation}" took ${duration}ms`, {
          operation,
          duration: duration.toString()
        })
    }
  }

  /**
   * Track errors and exceptions
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enableErrorTracking) return

    console.error('Application Error:', error)

    this.trackMetric('errors.total', 1, {
      error_type: error.name,
      environment: this.config.environment
    })

    // Create critical alert for unhandled errors
    this.createAlert('critical', 'Application Error', error.message, {
      error_name: error.name,
      error_stack: error.stack || 'No stack trace available',
      ...context
    })

    // Send to external error tracking service
    this.sendToErrorTracker(error, context)
  }

  /**
   * Track user actions and feature usage
   */
  trackUserAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    this.trackMetric('user_actions.total', 1, {
      action,
      user_id: userId || 'anonymous',
      environment: this.config.environment
    })

    // Track feature adoption
    if (action.startsWith('geospy_')) {
      this.trackMetric('features.geospy.usage', 1, {
        feature: action,
        user_id: userId || 'anonymous'
      })
    }
  }

  /**
   * Check application health
   */
  async checkHealth(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = []

    // Database health check
    try {
      const startTime = Date.now()
      // In a real app, this would be a database query
      await new Promise(resolve => setTimeout(resolve, 10))
      const responseTime = Date.now() - startTime

      const dbHealth: HealthCheckResult = {
        service: 'database',
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        timestamp: new Date()
      }

      results.push(dbHealth)
      this.healthChecks.set('database', dbHealth)
    } catch (error) {
      const dbHealth: HealthCheckResult = {
        service: 'database',
        status: 'unhealthy',
        responseTime: -1,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      }

      results.push(dbHealth)
      this.healthChecks.set('database', dbHealth)
    }

    // AI Services health check
    try {
      const startTime = Date.now()
      const response = await fetch('/api/geospy/analyze', { method: 'GET' })
      const responseTime = Date.now() - startTime

      const aiHealth: HealthCheckResult = {
        service: 'ai_services',
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        details: { status_code: response.status },
        timestamp: new Date()
      }

      results.push(aiHealth)
      this.healthChecks.set('ai_services', aiHealth)
    } catch (error) {
      const aiHealth: HealthCheckResult = {
        service: 'ai_services',
        status: 'unhealthy',
        responseTime: -1,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      }

      results.push(aiHealth)
      this.healthChecks.set('ai_services', aiHealth)
    }

    // Check for unhealthy services and create alerts
    const unhealthyServices = results.filter(r => r.status === 'unhealthy')
    if (unhealthyServices.length > 0) {
      this.createAlert('critical', 'Service Health Alert',
        `${unhealthyServices.length} services are unhealthy: ${unhealthyServices.map(s => s.service).join(', ')}`,
        { unhealthy_services: unhealthyServices.map(s => s.service) }
      )
    }

    return results
  }

  /**
   * Get current metrics
   */
  getMetrics(metricName?: string): Record<string, MetricEvent[]> {
    if (metricName) {
      return { [metricName]: this.metrics.get(metricName) || [] }
    }

    return Object.fromEntries(this.metrics.entries())
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 50): Alert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Get health check status
   */
  getHealthStatus(): Record<string, HealthCheckResult> {
    return Object.fromEntries(this.healthChecks.entries())
  }

  /**
   * Create and send alert
   */
  private createAlert(severity: AlertSeverity, title: string, message: string, tags: Record<string, string> = {}): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title,
      message,
      timestamp: new Date(),
      tags: {
        environment: this.config.environment,
        ...tags
      }
    }

    this.alerts.push(alert)

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.shift()
    }

    // Send to configured alerting channels
    this.sendAlert(alert)
  }

  /**
   * Send alert to configured channels
   */
  private async sendAlert(alert: Alert): Promise<void> {
    for (const channel of this.config.alertingChannels) {
      if (channel.severityFilter.includes(alert.severity)) {
        try {
          await this.sendToChannel(channel, alert)
        } catch (error) {
          console.error(`Failed to send alert to ${channel.type}:`, error)
        }
      }
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(channel: AlertingChannel, alert: Alert): Promise<void> {
    switch (channel.type) {
      case 'slack':
        if (channel.config.webhookUrl) {
          await this.sendToSlack(channel.config.webhookUrl, alert)
        }
        break

      case 'webhook':
        if (channel.config.url) {
          await this.sendToWebhook(channel.config.url, alert)
        }
        break

      default:
        console.log(`Alert channel ${channel.type} not implemented`)
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(webhookUrl: string, alert: Alert): Promise<void> {
    const color = alert.severity === 'critical' ? '#ff0000' :
                  alert.severity === 'warning' ? '#ffaa00' : '#00ff00'

    const payload = {
      text: `🚨 ${alert.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Environment',
              value: this.config.environment,
              short: true
            },
            {
              title: 'Message',
              value: alert.message,
              short: false
            },
            {
              title: 'Tags',
              value: Object.entries(alert.tags).map(([k, v]) => `${k}: ${v}`).join('\n'),
              short: false
            }
          ],
          timestamp: Math.floor(alert.timestamp.getTime() / 1000)
        }
      ]
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  /**
   * Send alert to webhook
   */
  private async sendToWebhook(url: string, alert: Alert): Promise<void> {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    })
  }

  /**
   * Send error to external tracking service
   */
  private sendToErrorTracker(error: Error, context?: Record<string, any>): void {
    // In production, this would integrate with Sentry, Rollbar, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          environment: this.config.environment
        },
        extra: context
      })
    }
  }

  /**
   * Check for alert conditions based on metrics
   */
  private checkAlertConditions(metricName: string, value: number, tags?: Record<string, string>): void {
    const alertRules = [
      {
        metric: 'errors.total',
        condition: (events: MetricEvent[]) => {
          // Alert if more than 5 errors in last 5 minutes
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
          const recentErrors = events.filter(e => e.timestamp.getTime() > fiveMinutesAgo)
          return recentErrors.length > 5
        },
        severity: 'critical' as AlertSeverity,
        message: 'High error rate detected'
      },
      {
        metric: 'performance.*.duration',
        condition: () => value > 5000,
        severity: 'warning' as AlertSeverity,
        message: `Slow performance detected: ${value}ms`
      }
    ]

    for (const rule of alertRules) {
      if (metricName.match(rule.metric.replace('*', '.*'))) {
        const events = this.metrics.get(metricName) || []

        let shouldAlert = false
        if (typeof rule.condition === 'function' && rule.condition.length > 0) {
          shouldAlert = rule.condition(events)
        } else if (typeof rule.condition === 'function') {
          shouldAlert = rule.condition()
        }

        if (shouldAlert) {
          this.createAlert(rule.severity, 'Metric Alert', rule.message, {
            metric: metricName,
            value: value.toString(),
            ...tags
          })
        }
      }
    }
  }

  /**
   * Initialize periodic health checks
   */
  private initializeHealthChecks(): void {
    // Run health checks every 5 minutes
    setInterval(async () => {
      try {
        await this.checkHealth()
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }, 5 * 60 * 1000)

    // Initial health check
    setTimeout(() => this.checkHealth(), 1000)
  }
}

// Global monitoring instance
let monitoringInstance: MonitoringService | null = null

/**
 * Initialize monitoring system
 */
export function initializeMonitoring(config: MonitoringConfig): MonitoringService {
  monitoringInstance = new MonitoringService(config)
  return monitoringInstance
}

/**
 * Get monitoring instance
 */
export function getMonitoring(): MonitoringService {
  if (!monitoringInstance) {
    throw new Error('Monitoring not initialized. Call initializeMonitoring() first.')
  }
  return monitoringInstance
}

/**
 * Convenience functions for common monitoring tasks
 */
export const monitor = {
  metric: (name: string, value: number, tags?: Record<string, string>) => {
    getMonitoring().trackMetric(name, value, tags)
  },

  performance: (operation: string, startTime: number, metadata?: Record<string, any>) => {
    getMonitoring().trackPerformance(operation, startTime, metadata)
  },

  error: (error: Error, context?: Record<string, any>) => {
    getMonitoring().trackError(error, context)
  },

  userAction: (action: string, userId?: string, metadata?: Record<string, any>) => {
    getMonitoring().trackUserAction(action, userId, metadata)
  },

  health: () => getMonitoring().checkHealth()
}

/**
 * Performance monitoring decorator
 */
export function monitored(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()

      try {
        const result = await method.apply(this, args)
        monitor.performance(operation, startTime)
        return result
      } catch (error) {
        monitor.performance(operation, startTime, { error: true })
        monitor.error(error instanceof Error ? error : new Error(String(error)), {
          operation,
          method: propertyName
        })
        throw error
      }
    }

    return descriptor
  }
}
