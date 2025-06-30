'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  UserCheck,
  UserX,
  Crown,
  Settings,
  Eye,
  Check,
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import { PermissionGuard } from '@/components/auth/permission-guard'

interface Role {
  id: string
  name: string
  displayName: string
  description?: string
  level: number
  isActive: boolean
  userCount: number
  permissionCount: number
}

interface User {
  id: string
  name: string
  email: string
  profileType: string
  isActive: boolean
  emailVerified: boolean
  roles: Array<{
    id: string
    name: string
    displayName: string
  }>
  createdAt: string
}

interface Permission {
  id: string
  name: string
  displayName: string
  resource: string
  action: string
  scope?: string
  isActive: boolean
}

export function RoleManagement() {
  const { user, hasPermission } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Check if user has admin permissions
  if (!user || !hasPermission('user', 'update', 'organization')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      setRoles([
        {
          id: '1',
          name: 'super_admin',
          displayName: 'Super Administrator',
          description: 'Full system access with all permissions',
          level: 100,
          isActive: true,
          userCount: 2,
          permissionCount: 45,
        },
        {
          id: '2',
          name: 'admin',
          displayName: 'Administrator',
          description: 'Organization-level administration',
          level: 80,
          isActive: true,
          userCount: 5,
          permissionCount: 30,
        },
        {
          id: '3',
          name: 'project_developer',
          displayName: 'Project Developer',
          description: 'Create and manage carbon projects',
          level: 60,
          isActive: true,
          userCount: 25,
          permissionCount: 20,
        },
        {
          id: '4',
          name: 'validator',
          displayName: 'Validator',
          description: 'Validate and verify carbon projects',
          level: 70,
          isActive: true,
          userCount: 8,
          permissionCount: 22,
        },
        {
          id: '5',
          name: 'investor',
          displayName: 'Investor',
          description: 'View and analyze investment opportunities',
          level: 50,
          isActive: true,
          userCount: 15,
          permissionCount: 12,
        },
      ])

      setUsers([
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          profileType: 'PROJECT_DEVELOPER',
          isActive: true,
          emailVerified: true,
          roles: [{ id: '3', name: 'project_developer', displayName: 'Project Developer' }],
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          profileType: 'VALIDATOR',
          isActive: true,
          emailVerified: true,
          roles: [{ id: '4', name: 'validator', displayName: 'Validator' }],
          createdAt: '2024-01-20T14:30:00Z',
        },
        {
          id: '3',
          name: 'Mike Chen',
          email: 'mike@example.com',
          profileType: 'INVESTOR',
          isActive: true,
          emailVerified: false,
          roles: [{ id: '5', name: 'investor', displayName: 'Investor' }],
          createdAt: '2024-02-01T09:15:00Z',
        },
      ])

      setPermissions([
        {
          id: '1',
          name: 'project:create:global',
          displayName: 'Create projects globally',
          resource: 'project',
          action: 'create',
          scope: 'global',
          isActive: true,
        },
        {
          id: '2',
          name: 'project:read:public',
          displayName: 'Read public projects',
          resource: 'project',
          action: 'read',
          scope: 'public',
          isActive: true,
        },
        {
          id: '3',
          name: 'user:update:organization',
          displayName: 'Update organization users',
          resource: 'user',
          action: 'update',
          scope: 'organization',
          isActive: true,
        },
      ])
    } catch (error) {
      setError('Failed to load data')
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-800 border-red-200',
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      project_developer: 'bg-green-100 text-green-800 border-green-200',
      validator: 'bg-blue-100 text-blue-800 border-blue-200',
      investor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      analyst: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, React.ReactNode> = {
      super_admin: <Crown className="h-4 w-4" />,
      admin: <Shield className="h-4 w-4" />,
      project_developer: <Edit className="h-4 w-4" />,
      validator: <Check className="h-4 w-4" />,
      investor: <Eye className="h-4 w-4" />,
      analyst: <Settings className="h-4 w-4" />,
      viewer: <Eye className="h-4 w-4" />,
    }
    return icons[roleName] || <Users className="h-4 w-4" />
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
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
    <PermissionGuard resource="user" action="update" scope="organization">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">
              Manage user roles, permissions, and access control
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions and access levels
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g., project_manager"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="e.g., Project Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role's responsibilities..."
                  />
                </div>
                <div>
                  <Label htmlFor="level">Access Level (1-100)</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="50"
                  />
                </div>
                <Button className="w-full">Create Role</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.name)}
                        <CardTitle className="text-lg">{role.displayName}</CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className={getRoleColor(role.name)}
                      >
                        Level {role.level}
                      </Badge>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">{role.userCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Permissions:</span>
                        <span className="font-medium">{role.permissionCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {role.name !== 'super_admin' && (
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Profile Type</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.profileType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className={getRoleColor(role.name)}
                            >
                              {role.displayName}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.isActive ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage Roles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Permissions</CardTitle>
                <CardDescription>
                  Available permissions that can be assigned to roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {permission.displayName}
                        </span>
                        <Badge variant={permission.isActive ? "default" : "secondary"}>
                          {permission.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-xs font-mono text-gray-500">
                        {permission.name}
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {permission.resource}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {permission.action}
                        </Badge>
                        {permission.scope && (
                          <Badge variant="outline" className="text-xs">
                            {permission.scope}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  )
}
