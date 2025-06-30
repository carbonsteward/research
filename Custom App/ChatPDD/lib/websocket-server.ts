import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { logger } from '@/utils/logger'
import { prisma } from '@/lib/prisma'

export interface CollaborationEvent {
  type: 'comment' | 'activity' | 'notification' | 'presence' | 'project_update' | 'file_upload'
  projectId: string
  userId: string
  data: any
  timestamp: Date
}

export interface UserPresence {
  userId: string
  userName: string
  projectId: string
  status: 'online' | 'away' | 'offline'
  lastSeen: Date
}

export class CollaborationWebSocketServer {
  private io: SocketIOServer
  private connectedUsers: Map<string, UserPresence> = new Map()
  private userSockets: Map<string, string[]> = new Map() // userId -> socketId[]

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      },
      path: '/api/websocket'
    })

    this.setupEventHandlers()
    logger.info('WebSocket server initialized')
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info('Client connected', { socketId: socket.id })

      // Handle user authentication and joining project rooms
      socket.on('join_project', async (data: { projectId: string; userId: string; userName: string }) => {
        try {
          const { projectId, userId, userName } = data

          // Verify user has access to project
          const projectAccess = await this.verifyProjectAccess(userId, projectId)
          if (!projectAccess) {
            socket.emit('error', { message: 'Access denied to project' })
            return
          }

          // Join project room
          socket.join(`project:${projectId}`)
          socket.join(`user:${userId}`)

          // Track user presence
          const presence: UserPresence = {
            userId,
            userName,
            projectId,
            status: 'online',
            lastSeen: new Date()
          }

          this.connectedUsers.set(socket.id, presence)

          // Track user sockets
          const userSocketIds = this.userSockets.get(userId) || []
          userSocketIds.push(socket.id)
          this.userSockets.set(userId, userSocketIds)

          // Notify other users in project
          socket.to(`project:${projectId}`).emit('user_joined', {
            userId,
            userName,
            timestamp: new Date()
          })

          // Send current online users to new user
          const onlineUsers = this.getOnlineUsersForProject(projectId)
          socket.emit('online_users', onlineUsers)

          logger.info('User joined project', { userId, projectId, userName })
        } catch (error) {
          logger.error('Error joining project', { error: error instanceof Error ? error.message : 'Unknown error' })
          socket.emit('error', { message: 'Failed to join project' })
        }
      })

      // Handle real-time comments
      socket.on('new_comment', async (data: {
        projectId: string
        userId: string
        content: string
        type: 'general' | 'task' | 'milestone'
        parentId?: string
      }) => {
        try {
          // Save comment to database
          const comment = await prisma.projectComment.create({
            data: {
              projectId: data.projectId,
              userId: data.userId,
              content: data.content,
              type: data.type,
              parentId: data.parentId || null
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          })

          // Broadcast to project room
          this.io.to(`project:${data.projectId}`).emit('comment_added', {
            comment: {
              id: comment.id,
              content: comment.content,
              type: comment.type,
              parentId: comment.parentId,
              createdAt: comment.createdAt,
              user: comment.user
            },
            projectId: data.projectId
          })

          // Log activity
          await this.logActivity({
            type: 'comment',
            projectId: data.projectId,
            userId: data.userId,
            data: { commentId: comment.id, content: data.content },
            timestamp: new Date()
          })

          logger.info('Comment added', { commentId: comment.id, projectId: data.projectId })
        } catch (error) {
          logger.error('Error adding comment', { error: error instanceof Error ? error.message : 'Unknown error' })
          socket.emit('error', { message: 'Failed to add comment' })
        }
      })

      // Handle project updates
      socket.on('project_update', async (data: {
        projectId: string
        userId: string
        updateType: 'status' | 'milestone' | 'document' | 'team'
        description: string
        metadata?: any
      }) => {
        try {
          // Broadcast update to project room
          this.io.to(`project:${data.projectId}`).emit('project_updated', {
            updateType: data.updateType,
            description: data.description,
            metadata: data.metadata,
            userId: data.userId,
            timestamp: new Date()
          })

          // Log activity
          await this.logActivity({
            type: 'project_update',
            projectId: data.projectId,
            userId: data.userId,
            data: { updateType: data.updateType, description: data.description, metadata: data.metadata },
            timestamp: new Date()
          })

          logger.info('Project updated', { projectId: data.projectId, updateType: data.updateType })
        } catch (error) {
          logger.error('Error updating project', { error: error instanceof Error ? error.message : 'Unknown error' })
        }
      })

      // Handle file uploads
      socket.on('file_uploaded', async (data: {
        projectId: string
        userId: string
        fileName: string
        fileType: string
        fileSize: number
        resourceId: string
      }) => {
        try {
          // Broadcast to project room
          this.io.to(`project:${data.projectId}`).emit('file_added', {
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            resourceId: data.resourceId,
            userId: data.userId,
            timestamp: new Date()
          })

          // Log activity
          await this.logActivity({
            type: 'file_upload',
            projectId: data.projectId,
            userId: data.userId,
            data: { fileName: data.fileName, fileType: data.fileType, resourceId: data.resourceId },
            timestamp: new Date()
          })

          logger.info('File uploaded', { projectId: data.projectId, fileName: data.fileName })
        } catch (error) {
          logger.error('Error broadcasting file upload', { error: error instanceof Error ? error.message : 'Unknown error' })
        }
      })

      // Handle user presence updates
      socket.on('presence_update', (data: { status: 'online' | 'away' }) => {
        const presence = this.connectedUsers.get(socket.id)
        if (presence) {
          presence.status = data.status
          presence.lastSeen = new Date()

          // Broadcast presence update
          socket.to(`project:${presence.projectId}`).emit('user_presence_updated', {
            userId: presence.userId,
            status: data.status,
            lastSeen: presence.lastSeen
          })
        }
      })

      // Handle typing indicators
      socket.on('typing_start', (data: { projectId: string; userId: string; userName: string }) => {
        socket.to(`project:${data.projectId}`).emit('user_typing', {
          userId: data.userId,
          userName: data.userName,
          isTyping: true
        })
      })

      socket.on('typing_stop', (data: { projectId: string; userId: string }) => {
        socket.to(`project:${data.projectId}`).emit('user_typing', {
          userId: data.userId,
          isTyping: false
        })
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        const presence = this.connectedUsers.get(socket.id)
        if (presence) {
          // Remove from connected users
          this.connectedUsers.delete(socket.id)

          // Remove socket from user's socket list
          const userSocketIds = this.userSockets.get(presence.userId) || []
          const updatedSocketIds = userSocketIds.filter(id => id !== socket.id)
          if (updatedSocketIds.length === 0) {
            this.userSockets.delete(presence.userId)

            // User is completely offline
            socket.to(`project:${presence.projectId}`).emit('user_left', {
              userId: presence.userId,
              userName: presence.userName,
              timestamp: new Date()
            })
          } else {
            this.userSockets.set(presence.userId, updatedSocketIds)
          }
        }

        logger.info('Client disconnected', { socketId: socket.id })
      })
    })
  }

  private async verifyProjectAccess(userId: string, projectId: string): Promise<boolean> {
    try {
      // Check if user is a team member or project owner
      const [teamMember, project] = await Promise.all([
        prisma.projectTeamMember.findFirst({
          where: {
            projectId,
            userId,
            isActive: true
          }
        }),
        prisma.project.findFirst({
          where: {
            id: projectId,
            userId // Project owner
          }
        })
      ])

      return !!(teamMember || project)
    } catch (error) {
      logger.error('Error verifying project access', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        projectId
      })
      return false
    }
  }

  private async logActivity(event: CollaborationEvent): Promise<void> {
    try {
      await prisma.projectActivity.create({
        data: {
          projectId: event.projectId,
          userId: event.userId,
          action: event.type,
          description: this.generateActivityDescription(event),
          metadata: event.data
        }
      })
    } catch (error) {
      logger.error('Error logging activity', {
        error: error instanceof Error ? error.message : 'Unknown error',
        event
      })
    }
  }

  private generateActivityDescription(event: CollaborationEvent): string {
    switch (event.type) {
      case 'comment':
        return `Added a comment: "${event.data.content?.substring(0, 50)}..."`
      case 'file_upload':
        return `Uploaded file: ${event.data.fileName}`
      case 'project_update':
        return event.data.description
      default:
        return `${event.type} activity`
    }
  }

  private getOnlineUsersForProject(projectId: string): UserPresence[] {
    return Array.from(this.connectedUsers.values())
      .filter(presence => presence.projectId === projectId)
  }

  // Public methods for sending notifications
  public sendNotificationToUser(userId: string, notification: any): void {
    this.io.to(`user:${userId}`).emit('notification', notification)
  }

  public sendNotificationToProject(projectId: string, notification: any): void {
    this.io.to(`project:${projectId}`).emit('project_notification', notification)
  }

  public broadcastProjectUpdate(projectId: string, update: any): void {
    this.io.to(`project:${projectId}`).emit('project_updated', update)
  }

  // Get server instance for external use
  public getIO(): SocketIOServer {
    return this.io
  }

  // Get connection stats
  public getConnectionStats(): {
    totalConnections: number
    uniqueUsers: number
    activeProjects: number
  } {
    const activeProjects = new Set(
      Array.from(this.connectedUsers.values()).map(p => p.projectId)
    ).size

    return {
      totalConnections: this.connectedUsers.size,
      uniqueUsers: this.userSockets.size,
      activeProjects
    }
  }
}

// Singleton instance
let collaborationWS: CollaborationWebSocketServer | null = null

export function initializeWebSocketServer(server: HTTPServer): CollaborationWebSocketServer {
  if (!collaborationWS) {
    collaborationWS = new CollaborationWebSocketServer(server)
  }
  return collaborationWS
}

export function getWebSocketServer(): CollaborationWebSocketServer | null {
  return collaborationWS
}
