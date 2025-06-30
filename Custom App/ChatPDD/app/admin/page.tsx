'use client'

import React from 'react'
import { RoleManagement } from '@/components/admin/role-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Users,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Database,
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'

export default function AdminPage() {
  const { user } = useAuth()

  const systemStats = {
    totalUsers: 156,
    activeProjects: 42,
    pendingValidations: 8,
    systemHealth: 'Good',
    uptime: '99.8%',
    lastBackup: '2 hours ago',
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-purple-100">
              Manage user roles, permissions, and system access control
            </p>
          </div>
          <Shield className="h-16 w-16 text-purple-200" />
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Validations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.pendingValidations}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Initialize RBAC
            </CardTitle>
            <CardDescription>
              Set up default roles and permissions for the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/init-rbac', {
                    method: 'POST',
                  })
                  const data = await response.json()

                  if (data.success) {
                    alert('RBAC system initialized successfully!')
                  } else {
                    alert('Failed to initialize RBAC system')
                  }
                } catch (error) {
                  alert('Error initializing RBAC system')
                }
              }}
            >
              Initialize System
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Quickly manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Export User List
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Bulk Role Assignment
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              System security and access monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                View Audit Log
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Security Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Management Section */}
      <RoleManagement />
    </div>
  )
}
