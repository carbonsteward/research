'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  MapPin,
  Building,
  Mail,
  Calendar,
  Crown,
  Eye,
  Edit,
  Check,
  X,
} from 'lucide-react'
import { useAuth } from './auth-context'
import { PermissionGuard } from './permission-guard'

export function UserProfile() {
  const { user, logout, isAdmin } = useAuth()
  const [showPermissions, setShowPermissions] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    await logout()
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
      super_admin: <Crown className="h-3 w-3" />,
      admin: <Shield className="h-3 w-3" />,
      project_developer: <Edit className="h-3 w-3" />,
      validator: <Check className="h-3 w-3" />,
      investor: <Eye className="h-3 w-3" />,
      analyst: <Settings className="h-3 w-3" />,
      viewer: <Eye className="h-3 w-3" />,
    }
    return icons[roleName] || <User className="h-3 w-3" />
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-green-600 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* User Info Section */}
        <div className="p-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Profile:</span>
              <span className="font-medium">{user.profileType.replace('_', ' ')}</span>
            </div>

            {user.organization && (
              <div className="flex items-center space-x-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Org:</span>
                <span className="font-medium">{user.organization.name}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Status:</span>
              <Badge variant={user.emailVerified ? "default" : "secondary"} className="text-xs">
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Roles Section */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Roles</span>
            {isAdmin() && (
              <Badge variant="outline" className="text-xs">
                {user.roles.length} assigned
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Badge
                key={role.id}
                variant="outline"
                className={`text-xs ${getRoleColor(role.name)}`}
              >
                <span className="flex items-center space-x-1">
                  {getRoleIcon(role.name)}
                  <span>{role.displayName}</span>
                </span>
              </Badge>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Permissions Dialog */}
        <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Shield className="mr-2 h-4 w-4" />
              View Permissions
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Your Permissions</DialogTitle>
              <DialogDescription>
                Permissions granted through your roles and direct assignments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Roles */}
              <div>
                <h4 className="font-medium mb-2">Active Roles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {user.roles.map((role) => (
                    <Card key={role.id} className="p-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.name)}
                        <div>
                          <p className="font-medium text-sm">{role.displayName}</p>
                          <p className="text-xs text-gray-500">Level {role.level}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div>
                <h4 className="font-medium mb-2">
                  Permissions ({user.permissions.length})
                </h4>
                <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                  {user.permissions.map((permission, index) => {
                    const [resource, action, scope] = permission.split(':')
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="font-mono text-xs">
                            {resource}:{action}
                          </span>
                        </div>
                        {scope && (
                          <Badge variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <PermissionGuard role="admin">
          <DropdownMenuItem>
            <Shield className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        </PermissionGuard>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simpler user info display component
export function UserInfo() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-green-600 text-white text-sm">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        <span className="text-xs text-gray-500">
          {user.roles[0]?.displayName || user.profileType.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}
