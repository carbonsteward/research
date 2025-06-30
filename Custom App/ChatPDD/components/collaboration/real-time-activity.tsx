'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useWebSocket, WebSocketMessage, UserPresence } from '@/hooks/use-websocket'
import { useAuth } from '@/components/auth/auth-context'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageCircle,
  FileUp,
  Users,
  Activity,
  Clock,
  Circle,
  ChevronDown,
  Send,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface RealTimeActivityProps {
  projectId: string
  className?: string
}

export function RealTimeActivity({ projectId, className }: RealTimeActivityProps) {
  const { user } = useAuth()
  const {
    isConnected,
    connectionError,
    onlineUsers,
    messages,
    typingUsers,
    sendComment,
    sendProjectUpdate,
    startTyping,
    stopTyping,
    clearMessages,
    getMessagesByType
  } = useWebSocket({ projectId, autoConnect: true })

  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing indicators
  const handleTypingStart = () => {
    startTyping()

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }

  const handleTypingStop = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    stopTyping()
  }

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    try {
      sendComment(commentText.trim(), 'general')
      setCommentText('')
      handleTypingStop()
    } catch (error) {
      console.error('Failed to send comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Format activity message
  const formatActivityMessage = (message: WebSocketMessage) => {
    const { type, data, timestamp } = message
    const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true })

    switch (type) {
      case 'comment_added':
        return {
          icon: <MessageCircle className="w-4 h-4" />,
          content: (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">{data.comment.user.name}</span> added a comment
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                {data.comment.content}
              </div>
              <div className="text-xs text-gray-500">{timeAgo}</div>
            </div>
          ),
          color: 'blue'
        }

      case 'file_added':
        return {
          icon: <FileUp className="w-4 h-4" />,
          content: (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">File uploaded:</span> {data.fileName}
              </div>
              <div className="text-xs text-gray-500">
                {(data.fileSize / 1024).toFixed(1)} KB • {timeAgo}
              </div>
            </div>
          ),
          color: 'green'
        }

      case 'project_updated':
        return {
          icon: <Activity className="w-4 h-4" />,
          content: (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Project {data.updateType}:</span> {data.description}
              </div>
              <div className="text-xs text-gray-500">{timeAgo}</div>
            </div>
          ),
          color: 'orange'
        }

      case 'user_joined':
        return {
          icon: <Users className="w-4 h-4" />,
          content: (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">{data.userName}</span> joined the project
              </div>
              <div className="text-xs text-gray-500">{timeAgo}</div>
            </div>
          ),
          color: 'green'
        }

      case 'user_left':
        return {
          icon: <Users className="w-4 h-4" />,
          content: (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">{data.userName}</span> left the project
              </div>
              <div className="text-xs text-gray-500">{timeAgo}</div>
            </div>
          ),
          color: 'gray'
        }

      default:
        return {
          icon: <Circle className="w-4 h-4" />,
          content: (
            <div className="space-y-1">
              <div className="text-sm">{type}: {JSON.stringify(data)}</div>
              <div className="text-xs text-gray-500">{timeAgo}</div>
            </div>
          ),
          color: 'gray'
        }
    }
  }

  // Filter messages for display
  const displayMessages = showAllActivity ? messages : messages.slice(-10)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Activity
            </span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Circle className="w-2 h-2 fill-green-500 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <Circle className="w-2 h-2 fill-red-500 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Error */}
          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-700">
                Connection Error: {connectionError}
              </div>
            </div>
          )}

          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Online Users ({onlineUsers.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {onlineUsers.map((userPresence) => (
                  <div
                    key={userPresence.userId}
                    className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(userPresence.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{userPresence.userName}</span>
                    <Circle
                      className={`w-2 h-2 ${
                        userPresence.status === 'online'
                          ? 'fill-green-500 text-green-500'
                          : 'fill-yellow-500 text-yellow-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-600 italic">
              {typingUsers.map(([userId, userName]) => userName).join(', ')}
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </div>
          )}

          {/* Activity Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                Activity Feed
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="text-xs"
                >
                  {showAllActivity ? 'Show Recent' : `Show All (${messages.length})`}
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAllActivity ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64 border rounded-md">
              <div className="p-3 space-y-3">
                {displayMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No recent activity
                  </div>
                ) : (
                  displayMessages.map((message, index) => {
                    const formatted = formatActivityMessage(message)
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50"
                      >
                        <div className={`p-1.5 rounded-full bg-${formatted.color}-100 text-${formatted.color}-600`}>
                          {formatted.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          {formatted.content}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                Add Comment
              </label>
              <Textarea
                id="comment"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value)
                  handleTypingStart()
                }}
                onBlur={handleTypingStop}
                placeholder="Type your comment here..."
                className="min-h-[80px]"
                disabled={!isConnected || isSubmittingComment}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!commentText.trim() || !isConnected || isSubmittingComment}
                size="sm"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
