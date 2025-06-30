'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/components/auth/auth-context'
import { logger } from '@/utils/logger'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: Date
}

export interface UserPresence {
  userId: string
  userName: string
  status: 'online' | 'away' | 'offline'
  lastSeen: Date
}

export interface Comment {
  id: string
  content: string
  type: 'general' | 'task' | 'milestone'
  parentId?: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

export interface ProjectUpdate {
  updateType: 'status' | 'milestone' | 'document' | 'team'
  description: string
  metadata?: any
  userId: string
  timestamp: Date
}

export interface FileUpload {
  fileName: string
  fileType: string
  fileSize: number
  resourceId: string
  userId: string
  timestamp: Date
}

interface UseWebSocketOptions {
  projectId?: string
  autoConnect?: boolean
  reconnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user } = useAuth()
  const { projectId, autoConnect = true, reconnect = true } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())

  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!user || !projectId || socketRef.current?.connected) {
      return
    }

    try {
      const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        path: '/api/websocket',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: reconnect,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      // Connection event handlers
      newSocket.on('connect', () => {
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
        logger.info('WebSocket connected')

        // Join project room
        newSocket.emit('join_project', {
          projectId,
          userId: user.id,
          userName: user.name
        })
      })

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false)
        logger.info('WebSocket disconnected', { reason })

        if (reason === 'io server disconnect') {
          // Server initiated disconnect, reconnect manually
          setTimeout(() => {
            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++
              connect()
            }
          }, 1000 * reconnectAttempts.current)
        }
      })

      newSocket.on('connect_error', (error) => {
        setConnectionError(error.message)
        setIsConnected(false)
        logger.error('WebSocket connection error', { error: error.message })
      })

      // Real-time event handlers
      newSocket.on('user_joined', (data: { userId: string; userName: string; timestamp: Date }) => {
        setMessages(prev => [...prev, {
          type: 'user_joined',
          data,
          timestamp: new Date()
        }])
      })

      newSocket.on('user_left', (data: { userId: string; userName: string; timestamp: Date }) => {
        setMessages(prev => [...prev, {
          type: 'user_left',
          data,
          timestamp: new Date()
        }])

        // Remove from typing users
        setTypingUsers(prev => {
          const updated = new Map(prev)
          updated.delete(data.userId)
          return updated
        })
      })

      newSocket.on('online_users', (users: UserPresence[]) => {
        setOnlineUsers(users)
      })

      newSocket.on('user_presence_updated', (data: { userId: string; status: string; lastSeen: Date }) => {
        setOnlineUsers(prev => prev.map(user =>
          user.userId === data.userId
            ? { ...user, status: data.status as 'online' | 'away' | 'offline', lastSeen: data.lastSeen }
            : user
        ))
      })

      newSocket.on('comment_added', (data: { comment: Comment; projectId: string }) => {
        setMessages(prev => [...prev, {
          type: 'comment_added',
          data,
          timestamp: new Date()
        }])
      })

      newSocket.on('project_updated', (data: ProjectUpdate) => {
        setMessages(prev => [...prev, {
          type: 'project_updated',
          data,
          timestamp: new Date()
        }])
      })

      newSocket.on('file_added', (data: FileUpload) => {
        setMessages(prev => [...prev, {
          type: 'file_added',
          data,
          timestamp: new Date()
        }])
      })

      newSocket.on('user_typing', (data: { userId: string; userName?: string; isTyping: boolean }) => {
        setTypingUsers(prev => {
          const updated = new Map(prev)
          if (data.isTyping && data.userName) {
            updated.set(data.userId, data.userName)
          } else {
            updated.delete(data.userId)
          }
          return updated
        })
      })

      newSocket.on('notification', (notification: any) => {
        setMessages(prev => [...prev, {
          type: 'notification',
          data: notification,
          timestamp: new Date()
        }])
      })

      newSocket.on('project_notification', (notification: any) => {
        setMessages(prev => [...prev, {
          type: 'project_notification',
          data: notification,
          timestamp: new Date()
        }])
      })

      newSocket.on('error', (error: { message: string }) => {
        setConnectionError(error.message)
        logger.error('WebSocket error', { error: error.message })
      })

    } catch (error) {
      logger.error('Failed to initialize WebSocket', { error: error instanceof Error ? error.message : 'Unknown error' })
      setConnectionError('Failed to initialize connection')
    }
  }, [user, projectId, reconnect])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
      setOnlineUsers([])
      setTypingUsers(new Map())
    }
  }, [])

  // Send comment
  const sendComment = useCallback((content: string, type: 'general' | 'task' | 'milestone' = 'general', parentId?: string) => {
    if (!socketRef.current || !user || !projectId) return

    socketRef.current.emit('new_comment', {
      projectId,
      userId: user.id,
      content,
      type,
      parentId
    })
  }, [user, projectId])

  // Send project update
  const sendProjectUpdate = useCallback((updateType: 'status' | 'milestone' | 'document' | 'team', description: string, metadata?: any) => {
    if (!socketRef.current || !user || !projectId) return

    socketRef.current.emit('project_update', {
      projectId,
      userId: user.id,
      updateType,
      description,
      metadata
    })
  }, [user, projectId])

  // Notify file upload
  const notifyFileUpload = useCallback((fileName: string, fileType: string, fileSize: number, resourceId: string) => {
    if (!socketRef.current || !user || !projectId) return

    socketRef.current.emit('file_uploaded', {
      projectId,
      userId: user.id,
      fileName,
      fileType,
      fileSize,
      resourceId
    })
  }, [user, projectId])

  // Update presence
  const updatePresence = useCallback((status: 'online' | 'away') => {
    if (!socketRef.current) return

    socketRef.current.emit('presence_update', { status })
  }, [])

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socketRef.current || !user || !projectId) return

    socketRef.current.emit('typing_start', {
      projectId,
      userId: user.id,
      userName: user.name
    })

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [user, projectId])

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !user || !projectId) return

    socketRef.current.emit('typing_stop', {
      projectId,
      userId: user.id
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [user, projectId])

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Get messages by type
  const getMessagesByType = useCallback((type: string) => {
    return messages.filter(msg => msg.type === type)
  }, [messages])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user && projectId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [connect, disconnect, autoConnect, user, projectId])

  // Handle page visibility changes for presence
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away')
      } else {
        updatePresence('online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [updatePresence])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Connection state
    socket,
    isConnected,
    connectionError,

    // Data
    onlineUsers,
    messages,
    typingUsers: Array.from(typingUsers.entries()),

    // Actions
    connect,
    disconnect,
    sendComment,
    sendProjectUpdate,
    notifyFileUpload,
    updatePresence,
    startTyping,
    stopTyping,
    clearMessages,
    getMessagesByType
  }
}
