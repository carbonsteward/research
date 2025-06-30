'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  FileText,
  Upload,
  Download,
  Share2,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react'
import { ProjectTeamManagement } from './team-management'
import { useAuth } from '@/components/auth/auth-context'

interface Comment {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
  content: string
  type: 'GENERAL' | 'MILESTONE' | 'RISK_ASSESSMENT' | 'DOCUMENT_REVIEW'
  mentions: string[]
  parentId?: string
  replies?: Comment[]
  isEdited: boolean
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
  action: string
  entity: string
  description: string
  metadata?: any
  timestamp: string
}

interface SharedResource {
  id: string
  name: string
  description?: string
  type: 'DOCUMENT' | 'IMAGE' | 'SPREADSHEET' | 'PRESENTATION'
  fileUrl: string
  fileSize: number
  uploadedBy: {
    name: string
    email: string
  }
  tags: string[]
  downloadCount: number
  isPublic: boolean
  createdAt: string
}

interface ProjectWorkspaceProps {
  projectId: string
  projectName: string
  userRole: string
  teamMembers: any[]
}

export function ProjectWorkspace({
  projectId,
  projectName,
  userRole,
  teamMembers
}: ProjectWorkspaceProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('activity')
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<string>('GENERAL')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadWorkspaceData()
  }, [projectId])

  const loadWorkspaceData = async () => {
    try {
      setLoading(true)

      // Mock data - replace with actual API calls
      setComments([
        {
          id: '1',
          userId: 'user-1',
          user: { name: 'John Smith', email: 'john@example.com' },
          content: 'We need to review the risk assessment for the forest area. The satellite data shows some concerning deforestation patterns.',
          type: 'RISK_ASSESSMENT',
          mentions: ['user-2'],
          isEdited: false,
          createdAt: '2024-06-20T10:30:00Z',
          updatedAt: '2024-06-20T10:30:00Z'
        },
        {
          id: '2',
          userId: 'user-2',
          user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          content: 'Thanks for flagging this @John. I\'ll analyze the data and provide recommendations by Friday.',
          type: 'RISK_ASSESSMENT',
          mentions: ['user-1'],
          parentId: '1',
          isEdited: false,
          createdAt: '2024-06-20T14:15:00Z',
          updatedAt: '2024-06-20T14:15:00Z'
        }
      ])

      setActivities([
        {
          id: '1',
          userId: 'user-1',
          user: { name: 'John Smith', email: 'john@example.com' },
          action: 'MILESTONE_COMPLETED',
          entity: 'milestone',
          description: 'Completed PDD preparation milestone',
          timestamp: '2024-06-20T09:00:00Z'
        },
        {
          id: '2',
          userId: 'user-2',
          user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          action: 'DOCUMENT_UPLOADED',
          entity: 'document',
          description: 'Uploaded risk assessment report',
          timestamp: '2024-06-20T11:30:00Z'
        },
        {
          id: '3',
          userId: 'user-3',
          user: { name: 'Mike Chen', email: 'mike@example.com' },
          action: 'TEAM_MEMBER_ADDED',
          entity: 'team',
          description: 'Added as project contributor',
          timestamp: '2024-06-19T16:45:00Z'
        }
      ])

      setSharedResources([
        {
          id: '1',
          name: 'Project_Design_Document_v2.pdf',
          description: 'Updated PDD with methodology details',
          type: 'DOCUMENT',
          fileUrl: '/mock/pdd.pdf',
          fileSize: 2048576,
          uploadedBy: { name: 'John Smith', email: 'john@example.com' },
          tags: ['PDD', 'Methodology'],
          downloadCount: 12,
          isPublic: false,
          createdAt: '2024-06-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Risk_Assessment_Report.xlsx',
          description: 'Comprehensive risk analysis',
          type: 'SPREADSHEET',
          fileUrl: '/mock/risk.xlsx',
          fileSize: 1024000,
          uploadedBy: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          tags: ['Risk', 'Analysis'],
          downloadCount: 8,
          isPublic: false,
          createdAt: '2024-06-18T14:30:00Z'
        }
      ])
    } catch (error) {
      console.error('Error loading workspace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const comment: Comment = {
        id: `temp-${Date.now()}`,
        userId: user?.id || 'current-user',
        user: { name: user?.name || 'Current User', email: user?.email || 'user@example.com' },
        content: newComment,
        type: commentType as any,
        mentions: extractMentions(newComment),
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return mentions
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileTypeIcon = (type: string) => {
    const icons = {
      DOCUMENT: <FileText className="h-5 w-5 text-red-600" />,
      SPREADSHEET: <BarChart3 className="h-5 w-5 text-green-600" />,
      PRESENTATION: <FileText className="h-5 w-5 text-orange-600" />,
      IMAGE: <FileText className="h-5 w-5 text-blue-600" />
    }
    return icons[type as keyof typeof icons] || <FileText className="h-5 w-5 text-gray-600" />
  }

  const getActivityIcon = (action: string) => {
    const icons = {
      MILESTONE_COMPLETED: <CheckCircle className="h-4 w-4 text-green-600" />,
      DOCUMENT_UPLOADED: <Upload className="h-4 w-4 text-blue-600" />,
      TEAM_MEMBER_ADDED: <Users className="h-4 w-4 text-purple-600" />,
      PROJECT_UPDATED: <Edit className="h-4 w-4 text-orange-600" />,
      COMMENT_ADDED: <MessageSquare className="h-4 w-4 text-gray-600" />
    }
    return icons[action as keyof typeof icons] || <Activity className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{projectName} Workspace</h1>
            <p className="text-blue-100">
              Collaborate with your team on project development and monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Team Members</p>
              <p className="text-xl font-bold">{teamMembers.length}</p>
            </div>
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {member.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamMembers.length > 4 && (
                <div className="h-8 w-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white font-medium">+{teamMembers.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared Files</p>
                <p className="text-2xl font-bold">{sharedResources.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Role</p>
                <p className="text-sm font-bold">{userRole}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {userRole}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="files">Shared Files</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Activity Feed */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and changes to the project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{activity.user.name}</span>
                          <span className="text-gray-600 ml-2">{activity.description}</span>
                        </div>
                        <time className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discussions */}
        <TabsContent value="discussions">
          <div className="space-y-6">
            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle>Start a Discussion</CardTitle>
                <CardDescription>
                  Share updates, ask questions, or discuss project details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={commentType} onValueChange={setCommentType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Comment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General Discussion</SelectItem>
                      <SelectItem value="MILESTONE">Milestone Update</SelectItem>
                      <SelectItem value="RISK_ASSESSMENT">Risk Assessment</SelectItem>
                      <SelectItem value="DOCUMENT_REVIEW">Document Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Share your thoughts, updates, or questions... Use @name to mention team members"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </CardContent>
            </Card>

            {/* Comments List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            {comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{comment.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.type.replace('_', ' ')}
                            </Badge>
                            <time className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </time>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <button className="hover:text-blue-600">Reply</button>
                            <button className="hover:text-blue-600">Like</button>
                            {comment.mentions.length > 0 && (
                              <span className="text-xs">Mentioned {comment.mentions.length} user(s)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shared Files */}
        <TabsContent value="files">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shared Resources</CardTitle>
                <CardDescription>
                  Files and documents shared with the team
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Upload File
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        {getFileTypeIcon(resource.type)}
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <h4 className="font-medium text-sm mb-1 truncate" title={resource.name}>
                        {resource.name}
                      </h4>
                      {resource.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{formatFileSize(resource.fileSize)}</span>
                        <span>{resource.downloadCount} downloads</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        By {resource.uploadedBy.name} • {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team">
          <ProjectTeamManagement
            projectId={projectId}
            projectName={projectName}
            isOwner={userRole === 'LEAD'}
            currentUserRole={userRole}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Configure workspace preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Notification Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Email notifications for comments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Email notifications for milestone updates</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Daily activity summary</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Workspace Visibility</h4>
                <Select defaultValue="PRIVATE">
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Private - Team members only</SelectItem>
                    <SelectItem value="INTERNAL">Internal - Organization members</SelectItem>
                    <SelectItem value="PUBLIC">Public - Anyone can view</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
