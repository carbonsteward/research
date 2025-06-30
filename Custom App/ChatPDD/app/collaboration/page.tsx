'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  FolderOpen,
  MessageSquare,
  Bell,
  Activity,
  Plus,
  Settings,
  Search,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { ProjectWorkspace } from '@/components/collaboration/project-workspace'
import { ActivityFeed, ActivityStats } from '@/components/collaboration/activity-feed'
import { NotificationSystem } from '@/components/collaboration/notification-system'
import { useAuth } from '@/components/auth/auth-context'

interface Project {
  id: string
  name: string
  description: string
  type: string
  status: string
  visibility: 'PRIVATE' | 'INTERNAL' | 'PUBLIC'
  teamMembers: any[]
  userRole: string
  lastActivity: string
  completedMilestones: number
  totalMilestones: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface Workspace {
  id: string
  name: string
  description: string
  memberCount: number
  projectCount: number
  isOwner: boolean
  role: string
}

export default function CollaborationPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadCollaborationData()
  }, [])

  const loadCollaborationData = async () => {
    try {
      setLoading(true)

      // Mock data - replace with actual API calls
      const mockProjects: Project[] = [
        {
          id: 'proj-1',
          name: 'Forest Conservation Project',
          description: 'Large-scale reforestation and conservation initiative in Brazil',
          type: 'AFOLU',
          status: 'IMPLEMENTATION',
          visibility: 'PRIVATE',
          teamMembers: [
            { id: '1', user: { name: 'John Smith', email: 'john@example.com' }, role: 'LEAD' },
            { id: '2', user: { name: 'Sarah Johnson', email: 'sarah@example.com' }, role: 'REVIEWER' },
            { id: '3', user: { name: 'Mike Chen', email: 'mike@example.com' }, role: 'CONTRIBUTOR' }
          ],
          userRole: 'LEAD',
          lastActivity: '2024-06-20T14:30:00Z',
          completedMilestones: 8,
          totalMilestones: 12,
          riskLevel: 'MEDIUM'
        },
        {
          id: 'proj-2',
          name: 'Renewable Energy Project',
          description: 'Solar and wind energy installation project',
          type: 'ENERGY',
          status: 'VALIDATION',
          visibility: 'INTERNAL',
          teamMembers: [
            { id: '1', user: { name: 'Emma Wilson', email: 'emma@example.com' }, role: 'LEAD' },
            { id: '2', user: { name: 'Alex Rodriguez', email: 'alex@example.com' }, role: 'CONTRIBUTOR' }
          ],
          userRole: 'REVIEWER',
          lastActivity: '2024-06-19T16:45:00Z',
          completedMilestones: 5,
          totalMilestones: 10,
          riskLevel: 'LOW'
        },
        {
          id: 'proj-3',
          name: 'Waste Management Initiative',
          description: 'Municipal waste reduction and recycling program',
          type: 'WASTE',
          status: 'PLANNING',
          visibility: 'PUBLIC',
          teamMembers: [
            { id: '1', user: { name: 'Carlos Martinez', email: 'carlos@example.com' }, role: 'LEAD' }
          ],
          userRole: 'CONTRIBUTOR',
          lastActivity: '2024-06-18T10:00:00Z',
          completedMilestones: 2,
          totalMilestones: 8,
          riskLevel: 'HIGH'
        }
      ]

      const mockWorkspaces: Workspace[] = [
        {
          id: 'ws-1',
          name: 'Climate Solutions Team',
          description: 'Primary workspace for climate mitigation projects',
          memberCount: 12,
          projectCount: 6,
          isOwner: true,
          role: 'OWNER'
        },
        {
          id: 'ws-2',
          name: 'Carbon Credit Validators',
          description: 'Specialized team for project validation',
          memberCount: 8,
          projectCount: 15,
          isOwner: false,
          role: 'MEMBER'
        }
      ]

      setProjects(mockProjects)
      setWorkspaces(mockWorkspaces)
    } catch (error) {
      console.error('Error loading collaboration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNING: 'bg-blue-100 text-blue-800',
      DESIGN: 'bg-purple-100 text-purple-800',
      VALIDATION: 'bg-yellow-100 text-yellow-800',
      IMPLEMENTATION: 'bg-green-100 text-green-800',
      MONITORING: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRiskColor = (risk: string) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTypeColor = (type: string) => {
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
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="text-gray-600 mt-2">
            Manage your projects, teams, and workspace activities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationSystem />
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <ActivityStats />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Projects you're actively working on
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-12 rounded ${
                            project.riskLevel === 'HIGH' ? 'bg-red-500' :
                            project.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {project.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getTypeColor(project.type)}>
                                {project.type}
                              </Badge>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                              <Badge variant="outline" className={getRiskColor(project.riskLevel)}>
                                {project.riskLevel} Risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex -space-x-1">
                              {project.teamMembers.slice(0, 3).map((member, index) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                                    {member.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {project.teamMembers.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                  <span className="text-xs text-gray-600">+{project.teamMembers.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimeAgo(project.lastActivity)}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${(project.completedMilestones / project.totalMilestones) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {project.completedMilestones}/{project.totalMilestones}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Overview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Team Overview</CardTitle>
                  <CardDescription>
                    Your active collaborations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <span className="font-medium">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Members</span>
                    <span className="font-medium">
                      {projects.reduce((acc, project) => acc + project.teamMembers.length, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Workspaces</span>
                    <span className="font-medium">{workspaces.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Your Role</span>
                    <Badge variant="outline">
                      {user?.roles?.[0]?.displayName || 'Project Developer'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">PDD Review Due</p>
                        <p className="text-xs text-gray-500">Forest Conservation Project</p>
                      </div>
                      <span className="text-xs text-orange-600">2 days</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Risk Assessment</p>
                        <p className="text-xs text-gray-500">Renewable Energy Project</p>
                      </div>
                      <span className="text-xs text-blue-600">5 days</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Team Review</p>
                        <p className="text-xs text-gray-500">Waste Management Initiative</p>
                      </div>
                      <span className="text-xs text-green-600">1 week</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {selectedProject ? (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  ← Back to Projects
                </Button>
                <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                <Badge className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
              </div>
              <ProjectWorkspace
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                userRole={selectedProject.userRole}
                teamMembers={selectedProject.teamMembers}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getTypeColor(project.type)}>
                        {project.type}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(project.riskLevel)}>
                          {project.riskLevel} Risk
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {project.completedMilestones}/{project.totalMilestones}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(project.completedMilestones / project.totalMilestones) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {project.teamMembers.slice(0, 4).map((member, index) => (
                            <Avatar key={index} className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {member.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.teamMembers.length > 4 && (
                            <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{project.teamMembers.length - 4}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(project.lastActivity)}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setSelectedProject(project)}
                      >
                        Open Workspace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{workspace.name}</CardTitle>
                    <Badge variant={workspace.isOwner ? "default" : "outline"}>
                      {workspace.role}
                    </Badge>
                  </div>
                  <CardDescription>{workspace.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Members</span>
                      <span className="font-medium">{workspace.memberCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Projects</span>
                      <span className="font-medium">{workspace.projectCount}</span>
                    </div>
                    <Button className="w-full">
                      Open Workspace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityFeed />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Settings</CardTitle>
              <CardDescription>
                Configure your collaboration preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Notification Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Email notifications for project invitations</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Email notifications for milestone updates</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Daily activity digest</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Comment mentions</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Default Project Visibility</h4>
                <select className="w-full p-2 border rounded-md">
                  <option value="PRIVATE">Private - Team members only</option>
                  <option value="INTERNAL">Internal - Organization members</option>
                  <option value="PUBLIC">Public - Anyone can view</option>
                </select>
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
