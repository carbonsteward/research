import { createLogger } from '@/lib/logger'
import { prisma } from '@/lib/database'
import { cache } from '@/lib/cache'
import { MONITORING_CONFIG } from '@/lib/monitoring-config'

const logger = createLogger('monitoring')

export interface ProjectMilestone {
  id: string
  projectId: string
  phase: string
  title: string
  description?: string
  endDate: Date
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'BLOCKED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  startDate: Date
  estimatedDuration: number // in days
  actualDuration?: number
  dependencies: string[]
  deliverables: string[]
  stakeholders: string[]
  estimatedCost?: number
  actualCost?: number
  risks?: any
  kpis?: any
  createdAt: Date
  updatedAt: Date
}

export interface MonitoringAlert {
  id: string
  type: 'milestone_due' | 'milestone_overdue' | 'compliance_deadline' | 'risk_detected' | 'status_change' | 'document_required'
  severity: 'info' | 'warning' | 'error' | 'critical'
  projectId: string
  milestoneId?: string
  title: string
  message: string
  actionRequired?: string
  dueDate?: Date
  recipients: string[]
  channels: ('email' | 'dashboard' | 'webhook' | 'sms')[]
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved'
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export class MonitoringService {
  private checkInterval: NodeJS.Timeout | null = null
  private isRunning = false

  async start() {
    if (this.isRunning) {
      logger.warn('Monitoring service is already running')
      return
    }

    this.isRunning = true
    logger.info('Starting monitoring service')

    // Check every 5 minutes (using config)
    this.checkInterval = setInterval(() => {
      this.performMonitoringCheck().catch(error => {
        logger.error('Error in monitoring check', { error })
      })
    }, MONITORING_CONFIG.CHECK_INTERVAL)

    // Perform initial check
    await this.performMonitoringCheck()
  }

  async stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    logger.info('Monitoring service stopped')
  }

  private async tableExists(tableName: string): Promise<boolean> {
    try {
      // Check specifically for each table we need
      switch (tableName) {
        case 'ProjectMilestone':
          await prisma.projectMilestone.findFirst({ take: 1 })
          return true
        case 'Project':
          await prisma.project.findFirst({ take: 1 })
          return true
        default:
          return false
      }
    } catch (error: any) {
      // P2021 is the Prisma error code for table not found
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        return false
      }
      // For other errors, assume table exists but there's another issue
      logger.warn(`Error checking table existence for ${tableName}`, { error })
      return true
    }
  }

  private async performMonitoringCheck() {
    logger.debug('Performing monitoring check')

    try {
      // Check for upcoming milestones
      await this.checkUpcomingMilestones()
      
      // Check for overdue milestones
      await this.checkOverdueMilestones()
      
      // Check compliance deadlines
      await this.checkComplianceDeadlines()
      
      // Check project risks
      await this.checkProjectRisks()
      
      // Update project statuses
      await this.updateProjectStatuses()

      logger.debug('Monitoring check completed successfully')
    } catch (error) {
      logger.error('Error in monitoring check', { error })
    }
  }

  private async checkUpcomingMilestones() {
    const upcomingThreshold = new Date()
    upcomingThreshold.setDate(upcomingThreshold.getDate() + MONITORING_CONFIG.MILESTONE_WARNING_DAYS)

    try {
      // Check if ProjectMilestone table exists
      if (!await this.tableExists('ProjectMilestone')) {
        logger.debug('ProjectMilestone table does not exist, skipping milestone checks')
        return
      }

      // Get milestones due in the next 7 days
      const upcomingMilestones = await prisma.projectMilestone.findMany({
        where: {
          endDate: {
            gte: new Date(),
            lte: upcomingThreshold
          },
          status: {
            in: ['NOT_STARTED', 'IN_PROGRESS']
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          }
        }
      })

      for (const milestone of upcomingMilestones) {
        const daysUntilDue = Math.ceil(
          (milestone.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        // Create alert based on urgency (using config thresholds)
        let severity: MonitoringAlert['severity'] = 'info'
        if (daysUntilDue <= 1) severity = 'critical'
        else if (daysUntilDue <= MONITORING_CONFIG.MILESTONE_CRITICAL_DAYS) severity = 'error'
        else if (daysUntilDue <= MONITORING_CONFIG.MILESTONE_WARNING_DAYS) severity = 'warning'

        await this.createAlert({
          type: 'milestone_due',
          severity,
          projectId: milestone.projectId,
          milestoneId: milestone.id,
          title: `Milestone Due Soon: ${milestone.title}`,
          message: `Milestone "${milestone.title}" is due in ${daysUntilDue} day(s)`,
          actionRequired: 'Review milestone progress and ensure completion on time',
          dueDate: milestone.endDate,
          recipients: milestone.project.userId ? [milestone.project.userId] : [],
          channels: severity === 'critical' ? ['email', 'dashboard'] : ['dashboard']
        })
      }

      logger.debug(`Checked ${upcomingMilestones.length} upcoming milestones`)
    } catch (error) {
      logger.error('Error checking upcoming milestones', { error })
    }
  }

  private async checkOverdueMilestones() {
    try {
      // Check if ProjectMilestone table exists
      if (!await this.tableExists('ProjectMilestone')) {
        logger.debug('ProjectMilestone table does not exist, skipping overdue checks')
        return
      }

      const overdueMilestones = await prisma.projectMilestone.findMany({
        where: {
          endDate: {
            lt: new Date()
          },
          status: {
            in: ['NOT_STARTED', 'IN_PROGRESS']
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          }
        }
      })

      for (const milestone of overdueMilestones) {
        const daysOverdue = Math.floor(
          (Date.now() - milestone.endDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Update milestone status
        await prisma.projectMilestone.update({
          where: { id: milestone.id },
          data: { status: 'DELAYED' }
        })

        await this.createAlert({
          type: 'milestone_overdue',
          severity: 'error',
          projectId: milestone.projectId,
          milestoneId: milestone.id,
          title: `Overdue Milestone: ${milestone.title}`,
          message: `Milestone "${milestone.title}" is ${daysOverdue} day(s) overdue`,
          actionRequired: 'Immediate attention required to get project back on track',
          dueDate: milestone.endDate,
          recipients: milestone.project.userId ? [milestone.project.userId] : [],
          channels: ['email', 'dashboard']
        })
      }

      logger.debug(`Checked ${overdueMilestones.length} overdue milestones`)
    } catch (error) {
      logger.error('Error checking overdue milestones', { error })
    }
  }

  private async checkComplianceDeadlines() {
    try {
      // Check if Project table exists
      if (!await this.tableExists('Project')) {
        logger.debug('Project table does not exist, skipping compliance checks')
        return
      }

      // Check for upcoming compliance deadlines (validation, verification, etc.)
      const complianceThreshold = new Date()
      complianceThreshold.setDate(complianceThreshold.getDate() + 30) // 30 days ahead

      const projects = await prisma.project.findMany({
        where: {
          status: {
            in: ['DESIGN', 'VALIDATION', 'IMPLEMENTATION', 'MONITORING']
          }
        },
        include: {
          methodology: {
            select: {
              standard: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })

      for (const project of projects) {
        const complianceChecks = this.generateComplianceChecks(project)
        
        for (const check of complianceChecks) {
          if (check.dueDate <= complianceThreshold) {
            await this.createAlert({
              type: 'compliance_deadline',
              severity: check.severity,
              projectId: project.id,
              title: `Compliance Deadline: ${check.title}`,
              message: check.message,
              actionRequired: check.actionRequired,
              dueDate: check.dueDate,
              recipients: project.userId ? [project.userId] : [],
              channels: ['email', 'dashboard']
            })
          }
        }
      }

      logger.debug(`Checked compliance deadlines for ${projects.length} projects`)
    } catch (error) {
      logger.error('Error checking compliance deadlines', { error })
    }
  }

  private generateComplianceChecks(project: any) {
    const checks = []
    const now = new Date()

    // Generate compliance checks based on project status and methodology
    switch (project.status) {
      case 'DESIGN':
        checks.push({
          title: 'PDD Submission',
          message: 'Project Design Document must be submitted for validation',
          actionRequired: 'Complete and submit PDD to validation body',
          dueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days
          severity: 'warning' as const
        })
        break

      case 'VALIDATION':
        checks.push({
          title: 'Validation Period Completion',
          message: 'Validation process must be completed within standard timeframe',
          actionRequired: 'Follow up with validation body on progress',
          dueDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
          severity: 'warning' as const
        })
        break

      case 'IMPLEMENTATION':
        checks.push({
          title: 'Monitoring Report Due',
          message: 'Annual monitoring report submission required',
          actionRequired: 'Prepare and submit monitoring report',
          dueDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
          severity: 'info' as const
        })
        break
    }

    return checks
  }

  private async checkProjectRisks() {
    try {
      const projects = await prisma.project.findMany({
        where: {
          status: {
            not: 'COMPLETED'
          }
        }
      })

      for (const project of projects) {
        const risks = await this.assessProjectRisks(project)
        
        for (const risk of risks) {
          if (risk.severity === 'critical' || risk.severity === 'error') {
            await this.createAlert({
              type: 'risk_detected',
              severity: risk.severity,
              projectId: project.id,
              title: `Risk Detected: ${risk.title}`,
              message: risk.message,
              actionRequired: risk.actionRequired,
              recipients: project.userId ? [project.userId] : [],
              channels: risk.severity === 'critical' ? ['email', 'dashboard'] : ['dashboard']
            })
          }
        }
      }

      logger.debug(`Assessed risks for ${projects.length} projects`)
    } catch (error) {
      logger.error('Error checking project risks', { error })
    }
  }

  private async assessProjectRisks(project: any) {
    const risks = []
    const now = new Date()

    // Check for budget overruns
    if (project.budget && project.spent && project.spent > project.budget * 0.9) {
      risks.push({
        title: 'Budget Risk',
        message: 'Project is approaching or exceeding budget limits',
        actionRequired: 'Review budget allocation and cost optimization opportunities',
        severity: project.spent > project.budget ? 'critical' : 'error'
      })
    }

    // Check for timeline delays
    if (project.timeline && new Date(project.timeline) < now) {
      risks.push({
        title: 'Timeline Risk',
        message: 'Project timeline may be at risk based on current progress',
        actionRequired: 'Review project schedule and adjust timeline if necessary',
        severity: 'warning'
      })
    }

    // Check for incomplete requirements
    const incompleteMilestones = await prisma.projectMilestone.count({
      where: {
        projectId: project.id,
        status: {
          in: ['NOT_STARTED', 'DELAYED']
        },
        priority: {
          in: ['HIGH', 'CRITICAL']
        }
      }
    })

    if (incompleteMilestones > 3) {
      risks.push({
        title: 'Milestone Risk',
        message: `${incompleteMilestones} high-priority milestones are incomplete`,
        actionRequired: 'Prioritize completion of critical milestones',
        severity: 'warning'
      })
    }

    return risks
  }

  private async updateProjectStatuses() {
    try {
      // Check if Project table exists
      if (!await this.tableExists('Project')) {
        logger.debug('Project table does not exist, skipping project status updates')
        return
      }

      const projects = await prisma.project.findMany({
        include: {
          _count: {
            select: {
              milestones: {
                where: {
                  status: 'COMPLETED'
                }
              }
            }
          },
          milestones: {
            select: {
              status: true
            }
          }
        }
      })

      for (const project of projects) {
        const totalMilestones = project.milestones.length
        const completedMilestones = project._count.milestones
        const overdueMilestones = project.milestones.filter(m => m.status === 'DELAYED').length

        let newStatus = project.status
        let progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

        // Update project status based on milestone completion
        if (overdueMilestones > 0) {
          // Project has risks due to overdue milestones
          await this.createAlert({
            type: 'status_change',
            severity: 'warning',
            projectId: project.id,
            title: 'Project Status Update',
            message: `Project has ${overdueMilestones} overdue milestone(s)`,
            actionRequired: 'Review and address overdue milestones',
            recipients: project.userId ? [project.userId] : [],
            channels: ['dashboard']
          })
        }

        // Cache project progress for real-time dashboard
        await cache.set(
          `project:${project.id}:progress`,
          {
            progress,
            status: newStatus,
            completedMilestones,
            totalMilestones,
            overdueMilestones,
            lastUpdated: new Date().toISOString()
          },
          300, // 5 minutes TTL
          ['project-progress', `project-${project.id}`]
        )
      }

      logger.debug(`Updated status for ${projects.length} projects`)
    } catch (error) {
      logger.error('Error updating project statuses', { error })
    }
  }

  private async createAlert(alertData: Omit<MonitoringAlert, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      // Check if similar alert already exists (avoid duplicates)
      const existingAlert = await prisma.monitoringAlert.findFirst({
        where: {
          type: alertData.type,
          projectId: alertData.projectId,
          milestoneId: alertData.milestoneId,
          status: {
            in: ['pending', 'sent']
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
          }
        }
      })

      if (existingAlert) {
        logger.debug('Similar alert already exists, skipping creation', {
          existingAlertId: existingAlert.id,
          type: alertData.type,
          projectId: alertData.projectId
        })
        return existingAlert
      }

      const alert = await prisma.monitoringAlert.create({
        data: {
          ...alertData,
          status: 'pending'
        }
      })

      logger.info('Alert created', {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        projectId: alert.projectId
      })

      // Trigger notification delivery
      await this.deliverAlert(alert)

      return alert
    } catch (error) {
      logger.error('Error creating alert', { error, alertData })
      throw error
    }
  }

  private async deliverAlert(alert: MonitoringAlert) {
    try {
      const deliveryPromises = alert.channels.map(channel => {
        switch (channel) {
          case 'dashboard':
            return this.deliverToDashboard(alert)
          case 'email':
            return this.deliverToEmail(alert)
          case 'webhook':
            return this.deliverToWebhook(alert)
          case 'sms':
            return this.deliverToSMS(alert)
          default:
            logger.warn(`Unknown delivery channel: ${channel}`)
            return Promise.resolve()
        }
      })

      await Promise.allSettled(deliveryPromises)

      await prisma.monitoringAlert.update({
        where: { id: alert.id },
        data: { status: 'sent' }
      })

      logger.info('Alert delivered', { alertId: alert.id, channels: alert.channels })
    } catch (error) {
      logger.error('Error delivering alert', { error, alertId: alert.id })
    }
  }

  private async deliverToDashboard(alert: MonitoringAlert) {
    // Cache alert for real-time dashboard display
    await cache.set(
      `alerts:project:${alert.projectId}`,
      alert,
      3600, // 1 hour TTL
      ['alerts', `project-${alert.projectId}`]
    )

    // Also store in global alerts cache
    const globalAlerts = await cache.get('alerts:global') || []
    globalAlerts.unshift(alert)
    
    // Keep only latest 100 alerts
    if (globalAlerts.length > 100) {
      globalAlerts.splice(100)
    }

    await cache.set('alerts:global', globalAlerts, 3600, ['alerts'])
  }

  private async deliverToEmail(alert: MonitoringAlert) {
    // Email delivery implementation would go here
    // For now, just log the intent
    logger.info('Email delivery (mock)', {
      alertId: alert.id,
      recipients: alert.recipients,
      subject: alert.title
    })
  }

  private async deliverToWebhook(alert: MonitoringAlert) {
    // Webhook delivery implementation would go here
    logger.info('Webhook delivery (mock)', {
      alertId: alert.id,
      type: alert.type
    })
  }

  private async deliverToSMS(alert: MonitoringAlert) {
    // SMS delivery implementation would go here
    logger.info('SMS delivery (mock)', {
      alertId: alert.id,
      recipients: alert.recipients
    })
  }

  // Public methods for external use
  async getProjectAlerts(projectId: string, limit = 10) {
    return prisma.monitoringAlert.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  async getGlobalAlerts(limit = 50) {
    return cache.get('alerts:global') || []
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = await prisma.monitoringAlert.update({
      where: { id: alertId },
      data: { 
        status: 'acknowledged',
        metadata: {
          acknowledgedBy: userId,
          acknowledgedAt: new Date().toISOString()
        }
      }
    })

    logger.info('Alert acknowledged', { alertId, userId })
    return alert
  }

  async resolveAlert(alertId: string, userId: string, resolution?: string) {
    const alert = await prisma.monitoringAlert.update({
      where: { id: alertId },
      data: { 
        status: 'resolved',
        metadata: {
          resolvedBy: userId,
          resolvedAt: new Date().toISOString(),
          resolution
        }
      }
    })

    logger.info('Alert resolved', { alertId, userId, resolution })
    return alert
  }
}

// Singleton instance
export const monitoringService = new MonitoringService()

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  monitoringService.start().catch(error => {
    logger.error('Failed to start monitoring service', { error })
  })
}