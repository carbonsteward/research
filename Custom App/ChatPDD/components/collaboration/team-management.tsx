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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  UserPlus,
  Settings,
  MoreHorizontal,
  Mail,
  Crown,
  Shield,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Search,
  Filter,
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'

interface TeamMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    profileType: string
    expertise: string[]
  }
  role: 'LEAD' | 'MANAGER' | 'CONTRIBUTOR' | 'REVIEWER' | 'VIEWER'
  permissions: string[]
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  invitedBy?: string
  invitedAt?: string
  joinedAt?: string
  isActive: boolean
  createdAt: string
}

interface ProjectTeamManagementProps {
  projectId: string
  projectName: string
  isOwner: boolean
  currentUserRole: string
}

export function ProjectTeamManagement({
  projectId,
  projectName,
  isOwner,
  currentUserRole
}: ProjectTeamManagementProps) {
  const { user, hasPermission } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'CONTRIBUTOR' as const,
    message: '',
    permissions: [] as string[]
  })

  // Permission management
  const ROLE_PERMISSIONS = {
    LEAD: ['EDIT_BASIC_INFO', 'EDIT_METHODOLOGY', 'MANAGE_TEAM', 'MANAGE_MILESTONES', 'UPLOAD_DOCUMENTS', 'VIEW_SENSITIVE_DATA', 'APPROVE_CHANGES', 'DELETE_PROJECT'],
    MANAGER: ['EDIT_BASIC_INFO', 'EDIT_METHODOLOGY', 'MANAGE_MILESTONES', 'UPLOAD_DOCUMENTS', 'VIEW_SENSITIVE_DATA', 'APPROVE_CHANGES'],
    CONTRIBUTOR: ['EDIT_BASIC_INFO', 'UPLOAD_DOCUMENTS'],
    REVIEWER: ['VIEW_SENSITIVE_DATA'],
    VIEWER: []
  }

  useEffect(() => {
    loadTeamMembers()
  }, [projectId])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          userId: 'user-1',
          user: {
            id: 'user-1',
            name: 'John Smith',
            email: 'john@example.com',
            profileType: 'PROJECT_DEVELOPER',
            expertise: ['AFOLU', 'Reforestation']
          },
          role: 'LEAD',
          permissions: ROLE_PERMISSIONS.LEAD,
          status: 'ACCEPTED',
          joinedAt: '2024-01-15T10:00:00Z',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          userId: 'user-2',
          user: {
            id: 'user-2',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            profileType: 'VALIDATOR',
            expertise: ['Risk Assessment', 'Compliance']
          },
          role: 'REVIEWER',
          permissions: ROLE_PERMISSIONS.REVIEWER,
          status: 'ACCEPTED',
          joinedAt: '2024-01-20T14:30:00Z',
          isActive: true,
          createdAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          userId: 'user-3',
          user: {
            id: 'user-3',
            name: 'Mike Chen',
            email: 'mike@example.com',
            profileType: 'CONSULTANT',
            expertise: ['Methodology', 'Carbon Credits']
          },
          role: 'CONTRIBUTOR',
          permissions: ROLE_PERMISSIONS.CONTRIBUTOR,
          status: 'PENDING',
          invitedAt: '2024-02-01T09:15:00Z',
          isActive: true,
          createdAt: '2024-02-01T09:15:00Z'
        }
      ]
      setTeamMembers(mockMembers)
    } catch (error) {
      console.error('Error loading team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Inviting member:', inviteForm)

      // Create new team member
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        userId: `invited-${Date.now()}`,
        user: {
          id: `invited-${Date.now()}`,
          name: inviteForm.email.split('@')[0],
          email: inviteForm.email,
          profileType: 'PROJECT_DEVELOPER',
          expertise: []
        },
        role: inviteForm.role,
        permissions: inviteForm.permissions.length > 0 ? inviteForm.permissions : ROLE_PERMISSIONS[inviteForm.role],
        status: 'PENDING',
        invitedBy: user?.id,
        invitedAt: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      }

      setTeamMembers(prev => [...prev, newMember])
      setInviteModalOpen(false)
      setInviteForm({
        email: '',
        role: 'CONTRIBUTOR',
        message: '',
        permissions: []
      })
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      // Mock API call
      setTeamMembers(prev => prev.map(member =>
        member.id === memberId
          ? {
              ...member,
              role: newRole as any,
              permissions: ROLE_PERMISSIONS[newRole as keyof typeof ROLE_PERMISSIONS]
            }
          : member
      ))
    } catch (error) {
      console.error('Error updating member role:', error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Mock API call
      setTeamMembers(prev => prev.filter(member => member.id !== memberId))
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  const handleResendInvitation = async (memberId: string) => {
    try {
      // Mock API call
      console.log('Resending invitation for member:', memberId)
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    const icons = {
      LEAD: <Crown className="h-4 w-4" />,
      MANAGER: <Shield className="h-4 w-4" />,
      CONTRIBUTOR: <Edit className="h-4 w-4" />,
      REVIEWER: <Eye className="h-4 w-4" />,
      VIEWER: <Eye className="h-4 w-4" />
    }
    return icons[role as keyof typeof icons] || <Users className="h-4 w-4" />
  }

  const getRoleColor = (role: string) => {
    const colors = {
      LEAD: 'bg-purple-100 text-purple-800 border-purple-200',
      MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
      CONTRIBUTOR: 'bg-green-100 text-green-800 border-green-200',
      REVIEWER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      VIEWER: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      ACCEPTED: <CheckCircle className="h-4 w-4 text-green-600" />,
      PENDING: <Clock className="h-4 w-4 text-yellow-600" />,
      DECLINED: <XCircle className="h-4 w-4 text-red-600" />,
      EXPIRED: <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const canManageTeam = isOwner || currentUserRole === 'LEAD' || currentUserRole === 'MANAGER'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">
            Manage team members and permissions for {projectName}
          </p>
        </div>
        {canManageTeam && (
          <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this project team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                      <SelectItem value="REVIEWER">Reviewer</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      {isOwner && <SelectItem value="LEAD">Lead</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Invitation Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message to the invitation..."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember} disabled={!inviteForm.email}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'ACCEPTED').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'PENDING').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roles</p>
                <p className="text-2xl font-bold">{new Set(teamMembers.map(m => m.role)).size}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                <SelectItem value="REVIEWER">Reviewer</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACCEPTED">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            Manage roles and permissions for project team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-gray-500">{member.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleColor(member.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(member.status)}
                      <span className="capitalize">{member.status.toLowerCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString()
                      : member.invitedAt
                      ? `Invited ${new Date(member.invitedAt).toLocaleDateString()}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.user.expertise.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.user.expertise.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.user.expertise.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {member.status === 'PENDING' && canManageTeam && (
                          <DropdownMenuItem onClick={() => handleResendInvitation(member.id)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        {canManageTeam && member.role !== 'LEAD' && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'MANAGER')}>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'CONTRIBUTOR')}>
                              <Edit className="mr-2 h-4 w-4" />
                              Make Contributor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'REVIEWER')}>
                              <Eye className="mr-2 h-4 w-4" />
                              Make Reviewer
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.user.email)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Email
                        </DropdownMenuItem>
                        {canManageTeam && member.role !== 'LEAD' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
