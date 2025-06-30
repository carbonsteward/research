'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Settings,
  Trash2,
  MessageSquare,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  Info,
  Clock,
  X,
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'

interface Notification {
  id: string
  type: 'PROJECT_INVITATION' | 'MILESTONE_DUE' | 'COMMENT_MENTION' | 'DOCUMENT_SHARED' | 'RISK_ALERT' | 'TEAM_UPDATE' | 'SYSTEM_ANNOUNCEMENT'
  title: string
  message: string
  actionUrl?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  sender?: {
    name: string
    email: string
  }
  metadata?: {
    projectName?: string
    projectId?: string
    documentName?: string
    riskLevel?: string
  }
}

interface NotificationSystemProps {
  className?: string
  showBadge?: boolean
}

export function NotificationSystem({ className, showBadge = true }: NotificationSystemProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)

      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'PROJECT_INVITATION',
          title: 'Project Team Invitation',
          message: 'You have been invited to join the Forest Conservation Project as a Reviewer',
          actionUrl: '/project/forest-conservation/team',
          isRead: false,
          createdAt: '2024-06-20T14:30:00Z',
          sender: { name: 'John Smith', email: 'john@example.com' },
          metadata: { projectName: 'Forest Conservation Project', projectId: 'proj-1' }
        },
        {
          id: '2',
          type: 'MILESTONE_DUE',
          title: 'Milestone Due Soon',
          message: 'PDD Preparation milestone is due in 2 days',
          actionUrl: '/project/renewable-energy/milestones',
          isRead: false,
          createdAt: '2024-06-20T10:15:00Z',
          metadata: { projectName: 'Renewable Energy Project', projectId: 'proj-2' }
        },
        {
          id: '3',
          type: 'COMMENT_MENTION',
          title: 'You were mentioned in a comment',
          message: 'Sarah Johnson mentioned you in a risk assessment discussion',
          actionUrl: '/project/forest-conservation/workspace#comment-123',
          isRead: false,
          createdAt: '2024-06-20T09:45:00Z',
          sender: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          metadata: { projectName: 'Forest Conservation Project', projectId: 'proj-1' }
        },
        {
          id: '4',
          type: 'DOCUMENT_SHARED',
          title: 'New Document Shared',
          message: 'Risk Assessment Report has been uploaded to your project',
          actionUrl: '/project/forest-conservation/files',
          isRead: true,
          readAt: '2024-06-19T16:20:00Z',
          createdAt: '2024-06-19T15:30:00Z',
          sender: { name: 'Mike Chen', email: 'mike@example.com' },
          metadata: {
            projectName: 'Forest Conservation Project',
            projectId: 'proj-1',
            documentName: 'Risk Assessment Report.pdf'
          }
        },
        {
          id: '5',
          type: 'RISK_ALERT',
          title: 'High Risk Alert',
          message: 'Climate risk assessment shows HIGH risk level for your project location',
          actionUrl: '/project/renewable-energy/risks',
          isRead: true,
          readAt: '2024-06-19T14:10:00Z',
          createdAt: '2024-06-19T14:00:00Z',
          metadata: {
            projectName: 'Renewable Energy Project',
            projectId: 'proj-2',
            riskLevel: 'HIGH'
          }
        },
        {
          id: '6',
          type: 'TEAM_UPDATE',
          title: 'Team Member Added',
          message: 'Alex Rodriguez has joined your project team as a Contributor',
          actionUrl: '/project/forest-conservation/team',
          isRead: true,
          readAt: '2024-06-18T11:30:00Z',
          createdAt: '2024-06-18T11:15:00Z',
          metadata: { projectName: 'Forest Conservation Project', projectId: 'proj-1' }
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      ))

      // API call to mark as read
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString()
      })))

      // API call to mark all as read
      // await fetch('/api/notifications/read-all', { method: 'PATCH' })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))

      // API call to delete notification
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons = {
      PROJECT_INVITATION: <Users className="h-4 w-4 text-blue-600" />,
      MILESTONE_DUE: <Calendar className="h-4 w-4 text-orange-600" />,
      COMMENT_MENTION: <MessageSquare className="h-4 w-4 text-green-600" />,
      DOCUMENT_SHARED: <FileText className="h-4 w-4 text-purple-600" />,
      RISK_ALERT: <AlertTriangle className="h-4 w-4 text-red-600" />,
      TEAM_UPDATE: <Users className="h-4 w-4 text-blue-600" />,
      SYSTEM_ANNOUNCEMENT: <Info className="h-4 w-4 text-gray-600" />
    }
    return icons[type as keyof typeof icons] || <Bell className="h-4 w-4 text-gray-600" />
  }

  const getNotificationColor = (type: string) => {
    const colors = {
      PROJECT_INVITATION: 'border-l-blue-500',
      MILESTONE_DUE: 'border-l-orange-500',
      COMMENT_MENTION: 'border-l-green-500',
      DOCUMENT_SHARED: 'border-l-purple-500',
      RISK_ALERT: 'border-l-red-500',
      TEAM_UPDATE: 'border-l-blue-500',
      SYSTEM_ANNOUNCEMENT: 'border-l-gray-500'
    }
    return colors[type as keyof typeof colors] || 'border-l-gray-500'
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return time.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {showBadge && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-hidden">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications ({unreadCount} unread)</span>
            <div className="flex space-x-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-6 px-2 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Filter Tabs */}
          <div className="px-2 py-1">
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs">Read</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } cursor-pointer`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id)
                    }
                    if (notification.actionUrl) {
                      // Navigate to action URL
                      window.location.href = notification.actionUrl
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full ml-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {notification.sender && (
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                  {notification.sender.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {notification.metadata?.projectName && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {notification.metadata.projectName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center py-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All Notifications
                </Button>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Full page notifications component
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    // Load notifications - same logic as above but for full page
    setLoading(false)
  }, [])

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600">
          Stay updated with your projects and team activities
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences and history
              </CardDescription>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {/* Notification list would go here - similar to dropdown but expanded */}
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">You have no new notifications.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
