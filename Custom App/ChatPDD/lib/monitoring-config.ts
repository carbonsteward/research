import { monitoringService } from '@/services/monitoring-service'
import { createLogger } from '@/lib/logger'

const logger = createLogger('monitoring-config')

/**
 * Initialize and start the monitoring service
 * This should be called when the application starts
 */
export async function initializeMonitoring() {
  try {
    logger.info('Initializing monitoring service...')

    // Start the monitoring service
    await monitoringService.start()

    logger.info('Monitoring service initialized successfully')

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, stopping monitoring service...')
      await monitoringService.stop()
      logger.info('Monitoring service stopped')
    })

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, stopping monitoring service...')
      await monitoringService.stop()
      logger.info('Monitoring service stopped')
    })

  } catch (error) {
    logger.error('Failed to initialize monitoring service', { error })
    throw error
  }
}

/**
 * Configuration for monitoring service
 */
export const MONITORING_CONFIG = {
  // Check interval in milliseconds (5 minutes)
  CHECK_INTERVAL: 5 * 60 * 1000,

  // Alert thresholds
  MILESTONE_WARNING_DAYS: 7, // Warn when milestone is due within 7 days
  MILESTONE_CRITICAL_DAYS: 3, // Critical alert when milestone is due within 3 days

  // Notification channels configuration
  CHANNELS: {
    EMAIL: {
      enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
      provider: process.env.EMAIL_PROVIDER || 'console'
    },
    WEBHOOK: {
      enabled: process.env.WEBHOOK_NOTIFICATIONS === 'true',
      url: process.env.WEBHOOK_URL
    },
    SMS: {
      enabled: process.env.SMS_NOTIFICATIONS === 'true',
      provider: process.env.SMS_PROVIDER || 'console'
    }
  },

  // Cache configuration
  CACHE: {
    ALERT_TTL: 24 * 60 * 60, // 24 hours in seconds
    DASHBOARD_TTL: 5 * 60, // 5 minutes in seconds
  },

  // Risk assessment thresholds
  RISK_THRESHOLDS: {
    OVERDUE_MILESTONE: 'critical',
    DUE_WITHIN_3_DAYS: 'error',
    DUE_WITHIN_7_DAYS: 'warning',
    COMPLETION_BEHIND_SCHEDULE: 'warning'
  }
} as const

export type MonitoringConfig = typeof MONITORING_CONFIG
