"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusIndicator, ProjectStatus } from '@/components/ui/status-indicator'
import {
  Calendar,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react'

interface ProjectMilestone {
  id: string
  projectId: string
  title: string
  description?: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'at_risk'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'development' | 'validation' | 'registration' | 'monitoring' | 'verification' | 'compliance'
  assignedTo?: string[]
  dependencies?: string[]
  completionPercentage: number
  estimatedDuration?: number
  actualDuration?: number
  costs?: {
    estimated: number
    actual?: number
  }
  requirements?: string[]
  deliverables?: string[]
  risks?: Array<{
    description: string
    impact: 'low' | 'medium' | 'high'
    probability: 'low' | 'medium' | 'high'
    mitigation?: string
  }>
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
    status: string
  }
  computed?: {
    daysUntilDue: number
    isOverdue: boolean
    isAtRisk: boolean
    statusColor: string
    priorityColor: string
    progressStatus: string
  }
}

interface MilestoneManagerProps {
  projectId: string
  className?: string
}

export function MilestoneManager({ projectId, className = "" }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [filteredMilestones, setFilteredMilestones] = useState<ProjectMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Form state for creating/editing milestones
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'development',
    assignedTo: [],
    estimatedDuration: '',
    costs: { estimated: 0 },
    requirements: [],
    deliverables: []
  })

  const loadMilestones = useCallback(async () => {
    try {
      const response = await fetch(`/api/milestones?projectId=${projectId}`)
      const data = await response.json()

      if (data.success) {
        setMilestones(data.data)
      } else {
        console.error('Failed to load milestones:', data.error)
      }
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Filter milestones
  useEffect(() => {
    let filtered = milestones

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(m => m.priority === priorityFilter)
    }

    setFilteredMilestones(filtered)
  }, [milestones, statusFilter, categoryFilter, priorityFilter])

  useEffect(() => {
    loadMilestones()
  }, [loadMilestones])

  const handleCreateMilestone = async () => {
    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadMilestones()
        setIsCreating(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating milestone:', error)
    }
  }

  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      if (data.success) {
        setMilestones(prev => prev.map(m =>
          m.id === milestoneId ? { ...m, ...data.data } : m
        ))
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMilestones(prev => prev.filter(m => m.id !== milestoneId))
        setSelectedMilestone(null)
      }
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: 'development',
      assignedTo: [],
      estimatedDuration: '',
      costs: { estimated: 0 },
      requirements: [],
      deliverables: []
    })
  }

  // Calculate metrics
  const metrics = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    in_progress: milestones.filter(m => m.status === 'in_progress').length,
    overdue: milestones.filter(m => m.status === 'overdue').length,
    at_risk: milestones.filter(m => m.status === 'at_risk').length,
    completion_rate: milestones.length > 0 ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 : 0
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'development': return <Target className="h-4 w-4" />
      case 'validation': return <CheckCircle className="h-4 w-4" />
      case 'registration': return <FileText className="h-4 w-4" />
      case 'monitoring': return <BarChart3 className="h-4 w-4" />
      case 'verification': return <CheckCircle className="h-4 w-4" />
      case 'compliance': return <FileText className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Milestones</h2>
          <p className="text-slate-600 scientific-text">
            Track and manage project milestones and deadlines
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="gap-2 carbon-gradient text-white border-0"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Milestones"
          value={metrics.total}
          subtitle="All project milestones"
          icon={Target}
          variant="default"
        />
        <MetricCard
          title="Completed"
          value={metrics.completed}
          subtitle={`${metrics.completion_rate.toFixed(1)}% complete`}
          icon={CheckCircle}
          variant="success"
          trend={{
            value: metrics.completion_rate,
            label: "completion rate",
            direction: "up"
          }}
        />
        <MetricCard
          title="In Progress"
          value={metrics.in_progress}
          subtitle="Active milestones"
          icon={Clock}
          variant="accent"
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdue}
          subtitle="Require attention"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestone List */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/60 scientific-shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Milestones</CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="at_risk">At Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMilestones.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No milestones found</p>
                    <Button
                      onClick={() => setIsCreating(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      Create First Milestone
                    </Button>
                  </div>
                ) : (
                  filteredMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`p-4 rounded-lg border hover-lift cursor-pointer ${
                        selectedMilestone?.id === milestone.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200/60 bg-white/60'
                      }`}
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getCategoryIcon(milestone.category)}
                              <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                              <Badge className={`${getPriorityColor(milestone.priority)} border`}>
                                {milestone.priority}
                              </Badge>
                            </div>

                            {milestone.description && (
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                {milestone.description}
                              </p>
                            )}
                          </div>

                          <StatusIndicator
                            status={milestone.status as any}
                            size="sm"
                            variant="badge"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </div>
                            {milestone.computed?.daysUntilDue !== undefined && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {milestone.computed.daysUntilDue > 0
                                  ? `${milestone.computed.daysUntilDue} days left`
                                  : `${Math.abs(milestone.computed.daysUntilDue)} days overdue`
                                }
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{milestone.completionPercentage}%</span>
                          </div>
                          <Progress
                            value={milestone.completionPercentage}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Details/Form */}
        <div>
          {isCreating ? (
            <Card className="border-slate-200/60 scientific-shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Milestone</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false)
                      resetForm()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Milestone title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Milestone description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="validation">Validation</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="verification">Verification</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateMilestone}
                    className="flex-1"
                    disabled={!formData.title || !formData.dueDate}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Milestone
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedMilestone ? (
            <Card className="border-slate-200/60 scientific-shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Milestone Details</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">{selectedMilestone.title}</h3>
                  {selectedMilestone.description && (
                    <p className="text-sm text-slate-600">{selectedMilestone.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Due Date:</span>
                    <div className="font-medium">
                      {new Date(selectedMilestone.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Category:</span>
                    <div className="font-medium capitalize">{selectedMilestone.category}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Priority:</span>
                    <Badge className={`${getPriorityColor(selectedMilestone.priority)} border mt-1`}>
                      {selectedMilestone.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <StatusIndicator
                      status={selectedMilestone.status as any}
                      size="sm"
                      variant="badge"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">Progress:</span>
                    <span className="font-medium">{selectedMilestone.completionPercentage}%</span>
                  </div>
                  <Progress value={selectedMilestone.completionPercentage} className="h-3" />
                </div>

                {isEditing && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="progress">Update Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedMilestone.completionPercentage}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (value >= 0 && value <= 100) {
                            handleUpdateMilestone(selectedMilestone.id, {
                              completionPercentage: value
                            })
                          }
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        defaultValue={selectedMilestone.status}
                        onValueChange={(value) => {
                          handleUpdateMilestone(selectedMilestone.id, { status: value as any })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="at_risk">At Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200/60 scientific-shadow-lg">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Select a milestone to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
