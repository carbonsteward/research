"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusIndicator } from '@/components/ui/status-indicator'
import {
  AlertTriangle,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X,
  Search,
  Zap,
  Shield
} from 'lucide-react'

interface MonitoringAlert {
  id: string
  type: 'milestone_due' | 'milestone_overdue' | 'compliance_deadline' | 'risk_detected' | 'status_change' | 'document_required'
  severity: 'info' | 'warning' | 'error' | 'critical'
  projectId: string
  milestoneId?: string
  title: string
  message: string
  actionRequired?: string
  dueDate?: string
  recipients: string[]
  channels: string[]
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
    status: string
  }
}

interface MonitoringDashboardProps {
  projectId?: string
  className?: string
}

export function MonitoringDashboard({ projectId, className = "" }: MonitoringDashboardProps) {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<MonitoringAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const loadAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (projectId) params.append('projectId', projectId)
      params.append('limit', '50')

      const response = await fetch(`/api/monitoring?${params}`)
      const data = await response.json()

      if (data.success) {
        setAlerts(data.data)
      } else {
        console.error('Failed to load alerts:', data.error)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [projectId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAlerts()
  }

  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve', resolution?: string) => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          alertId,
          userId: 'current-user', // In real app, get from auth context
          resolution
        })
      })

      const data = await response.json()
      if (data.success) {
        // Update local state
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: action === 'acknowledge' ? 'acknowledged' : 'resolved' }
            : alert
        ))
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error)
    }
  }

  // Filter alerts
  useEffect(() => {
    let filtered = alerts

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query) ||
        alert.project?.name.toLowerCase().includes(query)
      )
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter)
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchQuery, severityFilter, statusFilter, typeFilter])

  useEffect(() => {
    loadAlerts()
    
    // Set up polling for real-time updates
    const interval = setInterval(loadAlerts, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [loadAlerts])

  // Calculate metrics
  const metrics = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    pending: alerts.filter(a => a.status === 'pending' || a.status === 'sent').length,
    overdue: alerts.filter(a => a.type === 'milestone_overdue').length
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-800 border-red-200'
      case 'error': return 'bg-red-50 text-red-700 border-red-200'
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone_due': return <Clock className="h-4 w-4" />
      case 'milestone_overdue': return <AlertTriangle className="h-4 w-4" />
      case 'compliance_deadline': return <Shield className="h-4 w-4" />
      case 'risk_detected': return <AlertTriangle className="h-4 w-4" />
      case 'status_change': return <TrendingUp className="h-4 w-4" />
      case 'document_required': return <Target className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'acknowledged': return <Eye className="h-4 w-4 text-blue-600" />
      case 'sent': return <Bell className="h-4 w-4 text-amber-600" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
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
          <h2 className="text-2xl font-bold text-slate-900">
            {projectId ? 'Project Monitoring' : 'Global Monitoring Dashboard'}
          </h2>
          <p className="text-slate-600 scientific-text">
            Real-time alerts and milestone tracking for carbon projects
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Alerts"
          value={metrics.total}
          subtitle="Active monitoring alerts"
          icon={Bell}
          variant="default"
        />
        <MetricCard
          title="Critical Issues"
          value={metrics.critical}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Pending Actions"
          value={metrics.pending}
          subtitle="Awaiting response"
          icon={Clock}
          variant="accent"
        />
        <MetricCard
          title="Overdue Items"
          value={metrics.overdue}
          subtitle="Past deadline"
          icon={XCircle}
          variant="warning"
        />
      </div>

      {/* Alerts Management */}
      <Card className="border-slate-200/60 scientific-shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Monitor and manage project alerts and notifications</CardDescription>
            </div>
            <StatusIndicator 
              status={metrics.critical > 0 ? 'error' : metrics.pending > 0 ? 'warning' : 'completed'}
              label={`${metrics.pending} pending`}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  {alerts.length === 0 ? 'No alerts found' : 'No alerts match your filters'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border hover-lift ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(alert.type)}
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${getSeverityColor(alert.severity)} border-current`}
                        >
                          {alert.severity}
                        </Badge>
                        {alert.project && (
                          <Badge variant="outline" className="text-slate-600">
                            {alert.project.name}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm mb-2">{alert.message}</p>
                      
                      {alert.actionRequired && (
                        <p className="text-sm font-medium text-slate-800 mb-2">
                          Action: {alert.actionRequired}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(alert.status)}
                          <span className="capitalize">{alert.status}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                        {alert.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {alert.status === 'pending' || alert.status === 'sent' ? (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'resolve', 'Resolved via dashboard')}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Resolve
                        </Button>
                      </div>
                    ) : alert.status === 'acknowledged' ? (
                      <Button
                        size="sm"
                        onClick={() => handleAlertAction(alert.id, 'resolve', 'Resolved via dashboard')}
                        className="gap-1 ml-4"
                      >
                        <Check className="h-3 w-3" />
                        Resolve
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 ml-4 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}