'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  CheckCircle,
  Upload,
  MessageSquare,
  Users,
  Edit,
  FileText,
  AlertTriangle,
  Clock,
  Calendar,
  TrendingUp,
  Filter,
  RotateCcw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'

interface ProjectActivity {
  id: string
  userId: string
  user: {
    name: string
    email: string
    profileType: string
  }
  projectId: string
  project: {
    name: string
    type: string
  }
  action: 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'MILESTONE_ADDED' | 'MILESTONE_COMPLETED' | 'TEAM_MEMBER_ADDED' | 'TEAM_MEMBER_REMOVED' | 'DOCUMENT_UPLOADED' | 'COMMENT_ADDED' | 'RISK_ASSESSED' | 'METHODOLOGY_CHANGED'
  entity: string
  entityId?: string
  description: string
  metadata?: {
    milestoneName?: string
    documentName?: string
    riskLevel?: string
    methodologyName?: string
    memberName?: string
    commentType?: string
  }
  timestamp: string
}

interface ActivityFeedProps {
  projectId?: string
  userId?: string
  className?: string
  showHeader?: boolean
  maxItems?: number
}

export function ActivityFeed({
  projectId,
  userId,
  className,
  showHeader = true,
  maxItems = 20
}: ActivityFeedProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ProjectActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('7d')

  useEffect(() => {
    loadActivities()
  }, [projectId, userId, filter, timeFilter])

  const loadActivities = async () => {
    try {
      setLoading(true)

      // Mock data - replace with actual API call
      const mockActivities: ProjectActivity[] = [
        {
          id: '1',
          userId: 'user-1',
          user: {
            name: 'John Smith',
            email: 'john@example.com',
            profileType: 'PROJECT_DEVELOPER'
          },
          projectId: 'proj-1',
          project: {
            name: 'Forest Conservation Project',
            type: 'AFOLU'
          },
          action: 'MILESTONE_COMPLETED',
          entity: 'milestone',
          entityId: 'milestone-1',
          description: 'Completed PDD preparation milestone',
          metadata: {
            milestoneName: 'PDD Preparation'
          },
          timestamp: '2024-06-20T14:30:00Z'
        },
        {
          id: '2',
          userId: 'user-2',
          user: {
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            profileType: 'VALIDATOR'
          },
          projectId: 'proj-1',
          project: {
            name: 'Forest Conservation Project',
            type: 'AFOLU'
          },
          action: 'DOCUMENT_UPLOADED',
          entity: 'document',
          entityId: 'doc-1',
          description: 'Uploaded risk assessment report',
          metadata: {
            documentName: 'Risk_Assessment_Report.pdf'
          },
          timestamp: '2024-06-20T11:15:00Z'
        },
        {
          id: '3',
          userId: 'user-3',
          user: {
            name: 'Mike Chen',
            email: 'mike@example.com',
            profileType: 'CONSULTANT'
          },
          projectId: 'proj-2',
          project: {
            name: 'Renewable Energy Project',
            type: 'ENERGY'
          },
          action: 'TEAM_MEMBER_ADDED',
          entity: 'team',
          description: 'Added Alex Rodriguez as project contributor',
          metadata: {
            memberName: 'Alex Rodriguez'
          },
          timestamp: '2024-06-20T09:45:00Z'
        },
        {
          id: '4',
          userId: 'user-1',
          user: {
            name: 'John Smith',
            email: 'john@example.com',
            profileType: 'PROJECT_DEVELOPER'
          },
          projectId: 'proj-1',
          project: {
            name: 'Forest Conservation Project',
            type: 'AFOLU'
          },
          action: 'METHODOLOGY_CHANGED',
          entity: 'methodology',
          description: 'Updated project methodology',
          metadata: {
            methodologyName: 'VM0009 - Methodology for Avoided Forest Degradation'
          },
          timestamp: '2024-06-19T16:20:00Z'
        },
        {
          id: '5',
          userId: 'user-2',
          user: {
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            profileType: 'VALIDATOR'
          },
          projectId: 'proj-1',
          project: {
            name: 'Forest Conservation Project',
            type: 'AFOLU'
          },
          action: 'RISK_ASSESSED',
          entity: 'risk',
          description: 'Completed climate risk assessment',
          metadata: {
            riskLevel: 'MEDIUM'
          },
          timestamp: '2024-06-19T14:10:00Z'
        },
        {
          id: '6',
          userId: 'user-4',
          user: {
            name: 'Emma Wilson',
            email: 'emma@example.com',
            profileType: 'INVESTOR'
          },
          projectId: 'proj-2',
          project: {
            name: 'Renewable Energy Project',
            type: 'ENERGY'
          },
          action: 'COMMENT_ADDED',
          entity: 'comment',
          description: 'Added comment on financial projections',
          metadata: {
            commentType: 'GENERAL'
          },
          timestamp: '2024-06-19T12:30:00Z'
        },
        {
          id: '7',
          userId: 'user-1',
          user: {
            name: 'John Smith',
            email: 'john@example.com',
            profileType: 'PROJECT_DEVELOPER'
          },
          projectId: 'proj-3',
          project: {
            name: 'Waste Management Initiative',
            type: 'WASTE'
          },
          action: 'PROJECT_CREATED',
          entity: 'project',
          description: 'Created new carbon mitigation project',
          timestamp: '2024-06-18T10:00:00Z'
        }
      ]

      // Filter activities based on props
      let filteredActivities = mockActivities

      if (projectId) {
        filteredActivities = filteredActivities.filter(activity => activity.projectId === projectId)
      }

      if (userId) {
        filteredActivities = filteredActivities.filter(activity => activity.userId === userId)
      }

      // Apply time filter
      const now = new Date()
      const timeFilterHours = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30,
        '90d': 24 * 90
      }

      if (timeFilter !== 'all') {
        const cutoffTime = new Date(now.getTime() - (timeFilterHours[timeFilter as keyof typeof timeFilterHours] * 60 * 60 * 1000))
        filteredActivities = filteredActivities.filter(activity =>
          new Date(activity.timestamp) >= cutoffTime
        )
      }

      // Apply action filter
      if (filter !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.action === filter)
      }

      // Limit items
      filteredActivities = filteredActivities.slice(0, maxItems)

      setActivities(filteredActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    const icons = {
      PROJECT_CREATED: <FileText className="h-4 w-4 text-blue-600" />,
      PROJECT_UPDATED: <Edit className="h-4 w-4 text-orange-600" />,
      MILESTONE_ADDED: <Calendar className="h-4 w-4 text-green-600" />,
      MILESTONE_COMPLETED: <CheckCircle className="h-4 w-4 text-green-600" />,
      TEAM_MEMBER_ADDED: <Users className="h-4 w-4 text-purple-600" />,
      TEAM_MEMBER_REMOVED: <Users className="h-4 w-4 text-red-600" />,
      DOCUMENT_UPLOADED: <Upload className="h-4 w-4 text-blue-600" />,
      COMMENT_ADDED: <MessageSquare className="h-4 w-4 text-gray-600" />,
      RISK_ASSESSED: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      METHODOLOGY_CHANGED: <TrendingUp className="h-4 w-4 text-indigo-600" />
    }
    return icons[action as keyof typeof icons] || <Activity className="h-4 w-4 text-gray-600" />
  }

  const getActivityColor = (action: string) => {
    const colors = {
      PROJECT_CREATED: 'border-l-blue-500',
      PROJECT_UPDATED: 'border-l-orange-500',
      MILESTONE_ADDED: 'border-l-green-500',
      MILESTONE_COMPLETED: 'border-l-green-500',
      TEAM_MEMBER_ADDED: 'border-l-purple-500',
      TEAM_MEMBER_REMOVED: 'border-l-red-500',
      DOCUMENT_UPLOADED: 'border-l-blue-500',
      COMMENT_ADDED: 'border-l-gray-500',
      RISK_ASSESSED: 'border-l-yellow-500',
      METHODOLOGY_CHANGED: 'border-l-indigo-500'
    }
    return colors[action as keyof typeof colors] || 'border-l-gray-500'
  }

  const getProjectTypeColor = (type: string) => {
    const colors = {
      AFOLU: 'bg-green-100 text-green-800',
      ENERGY: 'bg-yellow-100 text-yellow-800',
      WASTE: 'bg-purple-100 text-purple-800',
      TRANSPORT: 'bg-blue-100 text-blue-800',
      MANUFACTURING: 'bg-orange-100 text-orange-800',
      BUILDINGS: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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

  const getActionDisplayName = (action: string) => {
    const names = {
      PROJECT_CREATED: 'Project Created',
      PROJECT_UPDATED: 'Project Updated',
      MILESTONE_ADDED: 'Milestone Added',
      MILESTONE_COMPLETED: 'Milestone Completed',
      TEAM_MEMBER_ADDED: 'Team Member Added',
      TEAM_MEMBER_REMOVED: 'Team Member Removed',
      DOCUMENT_UPLOADED: 'Document Uploaded',
      COMMENT_ADDED: 'Comment Added',
      RISK_ASSESSED: 'Risk Assessed',
      METHODOLOGY_CHANGED: 'Methodology Changed'
    }
    return names[action as keyof typeof names] || action.replace('_', ' ')
  }

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Loading recent project activities...</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Recent project activities and updates
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={loadActivities}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="PROJECT_CREATED">Projects Created</SelectItem>
              <SelectItem value="MILESTONE_COMPLETED">Milestones Completed</SelectItem>
              <SelectItem value="DOCUMENT_UPLOADED">Documents Uploaded</SelectItem>
              <SelectItem value="TEAM_MEMBER_ADDED">Team Changes</SelectItem>
              <SelectItem value="COMMENT_ADDED">Comments</SelectItem>
              <SelectItem value="RISK_ASSESSED">Risk Assessments</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-4 border-l-4 ${getActivityColor(activity.action)} bg-gray-50 rounded-r-lg hover:bg-gray-100 transition-colors`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {activity.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{activity.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.user.profileType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <time className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(activity.timestamp)}
                    </time>
                  </div>

                  <p className="text-sm text-gray-900 mb-2">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getProjectTypeColor(activity.project.type)}>
                        {activity.project.name}
                      </Badge>
                      {activity.metadata && (
                        <div className="flex space-x-1">
                          {activity.metadata.milestoneName && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.milestoneName}
                            </Badge>
                          )}
                          {activity.metadata.documentName && (
                            <Badge variant="outline" className="text-xs">
                              📄 {activity.metadata.documentName}
                            </Badge>
                          )}
                          {activity.metadata.riskLevel && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                activity.metadata.riskLevel === 'HIGH' ? 'border-red-500 text-red-700' :
                                activity.metadata.riskLevel === 'MEDIUM' ? 'border-yellow-500 text-yellow-700' :
                                'border-green-500 text-green-700'
                              }`}
                            >
                              {activity.metadata.riskLevel} Risk
                            </Badge>
                          )}
                          {activity.metadata.memberName && (
                            <Badge variant="outline" className="text-xs">
                              👤 {activity.metadata.memberName}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {activity.entityId && (
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                        View <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {activities.length === maxItems && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Activity Stats Component
export function ActivityStats({ className }: { className?: string }) {
  const [stats, setStats] = useState({
    todayActivities: 12,
    weekActivities: 45,
    mostActiveProject: 'Forest Conservation Project',
    topContributor: 'John Smith'
  })

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold">{stats.todayActivities}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold">{stats.weekActivities}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Most Active Project</p>
            <p className="text-sm font-bold truncate">{stats.mostActiveProject}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Contributor</p>
            <p className="text-sm font-bold">{stats.topContributor}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
