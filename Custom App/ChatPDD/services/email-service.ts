import { logger } from '@/utils/logger'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface TeamInvitationEmailData {
  inviterName: string
  inviterEmail: string
  inviteeName: string
  inviteeEmail: string
  workspaceName: string
  projectName: string
  role: string
  invitationUrl: string
  expirationDate: string
}

export interface NotificationEmailData {
  recipientName: string
  recipientEmail: string
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}

export class EmailService {
  private apiKey: string
  private fromEmail: string
  private fromName: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY || ''
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@chatpdd.com'
    this.fromName = process.env.FROM_NAME || 'ChatPDD Carbon Projects'
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chatpdd.com'
  }

  /**
   * Generate team invitation email template
   */
  generateTeamInvitationEmail(data: TeamInvitationEmailData): EmailTemplate {
    const subject = `${data.inviterName} invited you to join ${data.workspaceName}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px;
                     text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .project-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Team Invitation</h1>
            </div>

            <div class="content">
              <h2>Hello ${data.inviteeName},</h2>

              <p><strong>${data.inviterName}</strong> (${data.inviterEmail}) has invited you to join their carbon project team!</p>

              <div class="project-info">
                <h3>Project Details:</h3>
                <p><strong>Workspace:</strong> ${data.workspaceName}</p>
                <p><strong>Project:</strong> ${data.projectName}</p>
                <p><strong>Your Role:</strong> ${data.role}</p>
              </div>

              <p>As a team member, you'll be able to:</p>
              <ul>
                <li>Collaborate on project development</li>
                <li>Access project documents and resources</li>
                <li>Participate in project discussions</li>
                <li>Track project progress and milestones</li>
              </ul>

              <p>This invitation expires on <strong>${data.expirationDate}</strong>.</p>

              <div style="text-align: center;">
                <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
              </div>

              <p><small>If you cannot click the button, copy and paste this link into your browser:<br>
              ${data.invitationUrl}</small></p>
            </div>

            <div class="footer">
              <p>This email was sent by ChatPDD Carbon Project Platform</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Hello ${data.inviteeName},

      ${data.inviterName} (${data.inviterEmail}) has invited you to join their carbon project team!

      Project Details:
      - Workspace: ${data.workspaceName}
      - Project: ${data.projectName}
      - Your Role: ${data.role}

      As a team member, you'll be able to collaborate on project development, access project documents and resources, participate in project discussions, and track project progress and milestones.

      This invitation expires on ${data.expirationDate}.

      To accept the invitation, visit: ${data.invitationUrl}

      If you didn't expect this invitation, you can safely ignore this email.

      Best regards,
      ChatPDD Carbon Project Platform
    `

    return { subject, html, text }
  }

  /**
   * Generate general notification email template
   */
  generateNotificationEmail(data: NotificationEmailData): EmailTemplate {
    const subject = data.title

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px;
                     text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>

            <div class="content">
              <h2>Hello ${data.recipientName},</h2>

              <p>${data.message}</p>

              ${data.actionUrl && data.actionText ? `
                <div style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">${data.actionText}</a>
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p>This email was sent by ChatPDD Carbon Project Platform</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Hello ${data.recipientName},

      ${data.message}

      ${data.actionUrl && data.actionText ? `
      ${data.actionText}: ${data.actionUrl}
      ` : ''}

      Best regards,
      ChatPDD Carbon Project Platform
    `

    return { subject, html, text }
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(data: TeamInvitationEmailData): Promise<boolean> {
    try {
      const template = this.generateTeamInvitationEmail(data)

      const success = await this.sendEmail({
        to: data.inviteeEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      if (success) {
        logger.info('Team invitation email sent successfully', {
          inviteeEmail: data.inviteeEmail,
          workspaceName: data.workspaceName,
          projectName: data.projectName
        })
      }

      return success
    } catch (error) {
      logger.error('Failed to send team invitation email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        inviteeEmail: data.inviteeEmail
      })
      return false
    }
  }

  /**
   * Send notification email
   */
  async sendNotification(data: NotificationEmailData): Promise<boolean> {
    try {
      const template = this.generateNotificationEmail(data)

      const success = await this.sendEmail({
        to: data.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      if (success) {
        logger.info('Notification email sent successfully', {
          recipientEmail: data.recipientEmail,
          title: data.title
        })
      }

      return success
    } catch (error) {
      logger.error('Failed to send notification email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recipientEmail: data.recipientEmail
      })
      return false
    }
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(options: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('No email service API key configured')
      return false
    }

    try {
      // Use Resend if available (preferred)
      if (process.env.RESEND_API_KEY) {
        return await this.sendWithResend(options)
      }

      // Fallback to SendGrid
      if (process.env.SENDGRID_API_KEY) {
        return await this.sendWithSendGrid(options)
      }

      logger.warn('No supported email service configured')
      return false
    } catch (error) {
      logger.error('Failed to send email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to
      })
      return false
    }
  }

  /**
   * Send email using Resend API
   */
  private async sendWithResend(options: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${response.status} ${error}`)
      }

      return true
    } catch (error) {
      logger.error('Resend email failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Send email using SendGrid API
   */
  private async sendWithSendGrid(options: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject
            }
          ],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          content: [
            {
              type: 'text/plain',
              value: options.text
            },
            {
              type: 'text/html',
              value: options.html
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid API error: ${response.status} ${error}`)
      }

      return true
    } catch (error) {
      logger.error('SendGrid email failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Send batch team invitations
   */
  async sendBatchTeamInvitations(invitations: TeamInvitationEmailData[]): Promise<{
    success: number
    failed: number
    results: { email: string; success: boolean }[]
  }> {
    const results: { email: string; success: boolean }[] = []
    let success = 0
    let failed = 0

    for (const invitation of invitations) {
      const result = await this.sendTeamInvitation(invitation)
      results.push({ email: invitation.inviteeEmail, success: result })

      if (result) {
        success++
      } else {
        failed++
      }
    }

    logger.info('Batch team invitations completed', {
      total: invitations.length,
      success,
      failed
    })

    return { success, failed, results }
  }
}

// Export singleton instance
export const emailService = new EmailService()
