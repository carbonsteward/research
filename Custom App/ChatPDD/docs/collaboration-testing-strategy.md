# ChatPDD Collaboration System Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for the ChatPDD collaboration system, which includes team management, project workspaces, activity feeds, notifications, and real-time collaboration features. The strategy covers unit, integration, end-to-end, performance, and security testing approaches.

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Unit Testing Strategy](#unit-testing-strategy)
3. [Integration Testing Strategy](#integration-testing-strategy)
4. [End-to-End Testing Strategy](#end-to-end-testing-strategy)
5. [Database Testing Strategy](#database-testing-strategy)
6. [Performance Testing Strategy](#performance-testing-strategy)
7. [Security Testing Strategy](#security-testing-strategy)
8. [Mock Data Strategy](#mock-data-strategy)
9. [Testing Implementation Plan](#testing-implementation-plan)
10. [CI/CD Integration](#cicd-integration)

## Testing Architecture

### Test Pyramid Structure

```
    ┌─────────────────────┐
    │    E2E Tests        │  ← Multi-user workflows, real-time features
    │    (Playwright)     │
    └─────────────────────┘
           ┌─────────────────────────────┐
           │   Integration Tests         │  ← API endpoints, database operations
           │   (Jest + Supertest)       │
           └─────────────────────────────┘
                  ┌───────────────────────────────────┐
                  │        Unit Tests                 │  ← Components, utilities, services
                  │   (Jest + React Testing Library)  │
                  └───────────────────────────────────┘
```

### Testing Tools Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest + Supertest + Test Database
- **E2E Testing**: Playwright with multi-browser support
- **Database Testing**: Jest + Prisma Test Database
- **Performance Testing**: Artillery.io + Lighthouse CI
- **Security Testing**: Custom JWT testing + OWASP checks
- **Mock Data**: MSW (Mock Service Worker) + Faker.js

## Unit Testing Strategy

### React Component Testing

#### 1. Team Management Component Testing

```typescript
// __tests__/unit/components/collaboration/team-management.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectTeamManagement } from '@/components/collaboration/team-management'
import { useAuth } from '@/components/auth/auth-context'
import { server } from '../../__mocks__/server'

// Mock the auth context
jest.mock('@/components/auth/auth-context')

describe('ProjectTeamManagement', () => {
  const mockProps = {
    projectId: 'project-123',
    projectName: 'Test Project',
    isOwner: true,
    currentUserRole: 'LEAD'
  }

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      hasPermission: jest.fn().mockReturnValue(true)
    })
  })

  test('renders team management interface', () => {
    render(<ProjectTeamManagement {...mockProps} />)

    expect(screen.getByText('Team Management')).toBeInTheDocument()
    expect(screen.getByText('Invite Member')).toBeInTheDocument()
  })

  test('opens invite modal when invite button clicked', async () => {
    render(<ProjectTeamManagement {...mockProps} />)

    fireEvent.click(screen.getByText('Invite Member'))

    await waitFor(() => {
      expect(screen.getByText('Invite Team Member')).toBeInTheDocument()
    })
  })

  test('handles member invitation submission', async () => {
    render(<ProjectTeamManagement {...mockProps} />)

    // Open invite modal
    fireEvent.click(screen.getByText('Invite Member'))

    // Fill form
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })

    // Submit form
    fireEvent.click(screen.getByText('Send Invitation'))

    await waitFor(() => {
      expect(screen.queryByText('Invite Team Member')).not.toBeInTheDocument()
    })
  })

  test('filters team members by role', async () => {
    render(<ProjectTeamManagement {...mockProps} />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    // Apply role filter
    fireEvent.click(screen.getByDisplayValue('All Roles'))
    fireEvent.click(screen.getByText('Lead'))

    // Verify filtering
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
  })

  test('handles role updates for team members', async () => {
    render(<ProjectTeamManagement {...mockProps} />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    })

    // Open actions menu
    const actionButtons = screen.getAllByLabelText('Actions')
    fireEvent.click(actionButtons[1])

    // Update role
    fireEvent.click(screen.getByText('Make Manager'))

    await waitFor(() => {
      expect(screen.getByText('MANAGER')).toBeInTheDocument()
    })
  })

  test('prevents unauthorized users from managing team', () => {
    const unauthorizedProps = {
      ...mockProps,
      isOwner: false,
      currentUserRole: 'VIEWER'
    }

    render(<ProjectTeamManagement {...unauthorizedProps} />)

    expect(screen.queryByText('Invite Member')).not.toBeInTheDocument()
  })
})
```

#### 2. Notification System Component Testing

```typescript
// __tests__/unit/components/collaboration/notification-system.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationSystem } from '@/components/collaboration/notification-system'
import { useAuth } from '@/components/auth/auth-context'

describe('NotificationSystem', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-123' }
    })
  })

  test('displays unread notification count', async () => {
    render(<NotificationSystem />)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Badge count
    })
  })

  test('marks notification as read when clicked', async () => {
    render(<NotificationSystem />)

    // Open notifications
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Project Team Invitation')).toBeInTheDocument()
    })

    // Click notification
    fireEvent.click(screen.getByText('Project Team Invitation'))

    // Verify read state change
    await waitFor(() => {
      expect(screen.getByTestId('notification-read')).toBeInTheDocument()
    })
  })

  test('handles notification actions', async () => {
    render(<NotificationSystem />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Accept'))

    // Verify action handling
    await waitFor(() => {
      expect(screen.queryByText('Accept')).not.toBeInTheDocument()
    })
  })
})
```

#### 3. Activity Feed Component Testing

```typescript
// __tests__/unit/components/collaboration/activity-feed.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { ActivityFeed } from '@/components/collaboration/activity-feed'

describe('ActivityFeed', () => {
  const mockProps = {
    projectId: 'project-123',
    limit: 10
  }

  test('renders activity feed with activities', async () => {
    render(<ActivityFeed {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Project Activity')).toBeInTheDocument()
      expect(screen.getByText('John Smith created milestone')).toBeInTheDocument()
    })
  })

  test('displays different activity types with appropriate icons', async () => {
    render(<ActivityFeed {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('milestone-icon')).toBeInTheDocument()
      expect(screen.getByTestId('comment-icon')).toBeInTheDocument()
      expect(screen.getByTestId('team-icon')).toBeInTheDocument()
    })
  })

  test('handles real-time activity updates', async () => {
    render(<ActivityFeed {...mockProps} />)

    // Simulate WebSocket message
    const mockActivity = {
      id: 'activity-new',
      action: 'COMMENT_ADDED',
      description: 'New comment added',
      timestamp: new Date().toISOString()
    }

    // Trigger WebSocket event simulation
    window.dispatchEvent(new CustomEvent('new-activity', { detail: mockActivity }))

    await waitFor(() => {
      expect(screen.getByText('New comment added')).toBeInTheDocument()
    })
  })

  test('filters activities by type', async () => {
    render(<ActivityFeed {...mockProps} showFilters={true} />)

    await waitFor(() => {
      expect(screen.getByText('All Activities')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('All Activities'))
    fireEvent.click(screen.getByText('Milestones'))

    await waitFor(() => {
      expect(screen.queryByText('comment added')).not.toBeInTheDocument()
      expect(screen.getByText('milestone')).toBeInTheDocument()
    })
  })
})
```

### Service Layer Testing

#### 1. Collaboration Service Testing

```typescript
// __tests__/unit/services/collaboration-service.test.ts
import { CollaborationService } from '@/services/collaboration-service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    projectTeamMember: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    projectActivity: {
      create: jest.fn(),
      findMany: jest.fn(),
    }
  }
}))

describe('CollaborationService', () => {
  const collaborationService = new CollaborationService()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('inviteTeamMember', () => {
    test('successfully invites team member', async () => {
      const mockTeamMember = {
        id: 'member-123',
        projectId: 'project-123',
        userId: 'user-456',
        role: 'CONTRIBUTOR'
      }

      ;(prisma.projectTeamMember.create as jest.Mock).mockResolvedValue(mockTeamMember)
      ;(prisma.notification.create as jest.Mock).mockResolvedValue({})
      ;(prisma.projectActivity.create as jest.Mock).mockResolvedValue({})

      const result = await collaborationService.inviteTeamMember({
        projectId: 'project-123',
        email: 'test@example.com',
        role: 'CONTRIBUTOR',
        invitedBy: 'user-123'
      })

      expect(result.success).toBe(true)
      expect(result.teamMember).toEqual(mockTeamMember)
      expect(prisma.projectTeamMember.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'project-123',
          role: 'CONTRIBUTOR'
        }),
        include: expect.any(Object)
      })
    })

    test('handles duplicate team member invitation', async () => {
      ;(prisma.projectTeamMember.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint violation')
      )

      const result = await collaborationService.inviteTeamMember({
        projectId: 'project-123',
        email: 'test@example.com',
        role: 'CONTRIBUTOR',
        invitedBy: 'user-123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('already a member')
    })
  })

  describe('updateTeamMemberRole', () => {
    test('successfully updates team member role', async () => {
      const mockUpdatedMember = {
        id: 'member-123',
        role: 'MANAGER',
        permissions: ['EDIT_BASIC_INFO', 'MANAGE_MILESTONES']
      }

      ;(prisma.projectTeamMember.update as jest.Mock).mockResolvedValue(mockUpdatedMember)

      const result = await collaborationService.updateTeamMemberRole(
        'member-123',
        'MANAGER',
        ['EDIT_BASIC_INFO', 'MANAGE_MILESTONES']
      )

      expect(result.success).toBe(true)
      expect(result.teamMember.role).toBe('MANAGER')
    })
  })

  describe('createNotification', () => {
    test('creates notification successfully', async () => {
      const mockNotification = {
        id: 'notification-123',
        type: 'PROJECT_INVITATION',
        recipientId: 'user-456'
      }

      ;(prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification)

      const result = await collaborationService.createNotification({
        recipientId: 'user-456',
        type: 'PROJECT_INVITATION',
        title: 'Project Invitation',
        message: 'You have been invited to join a project'
      })

      expect(result).toEqual(mockNotification)
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recipientId: 'user-456',
          type: 'PROJECT_INVITATION'
        })
      })
    })
  })
})
```

## Integration Testing Strategy

### API Endpoint Testing

#### 1. Team Management API Testing

```typescript
// __tests__/integration/api/collaboration/team.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST, PATCH } from '@/app/api/collaboration/projects/[id]/team/route'
import { prisma } from '@/lib/prisma'
import { authService } from '@/lib/auth/rbac'

// Mock dependencies
jest.mock('@/lib/prisma')
jest.mock('@/lib/auth/rbac')

describe('/api/collaboration/projects/[id]/team', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    hasPermission: jest.fn().mockReturnValue(true)
  }

  beforeEach(() => {
    ;(authService.verifyToken as jest.Mock).mockResolvedValue(mockUser)
  })

  describe('GET /api/collaboration/projects/[id]/team', () => {
    test('returns team members for authorized user', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'user-123',
        teamMembers: [
          {
            id: 'member-1',
            userId: 'user-456',
            role: 'CONTRIBUTOR',
            user: {
              id: 'user-456',
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        ]
      }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      })

      await GET(req, { params: { id: 'project-123' } })

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.teamMembers).toHaveLength(1)
    })

    test('returns 401 for unauthenticated request', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      const response = await GET(req, { params: { id: 'project-123' } })

      expect(response.status).toBe(401)
    })

    test('returns 403 for unauthorized user', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'other-user',
        teamMembers: []
      }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      mockUser.hasPermission.mockReturnValue(false)

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      })

      const response = await GET(req, { params: { id: 'project-123' } })

      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/collaboration/projects/[id]/team', () => {
    test('successfully invites team member', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'user-123',
        name: 'Test Project',
        teamMembers: []
      }

      const mockUser = {
        id: 'user-456',
        email: 'john@example.com',
        name: 'John Doe'
      }

      const mockTeamMember = {
        id: 'member-123',
        projectId: 'project-123',
        userId: 'user-456',
        role: 'CONTRIBUTOR',
        user: mockUser
      }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.projectTeamMember.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.projectTeamMember.create as jest.Mock).mockResolvedValue(mockTeamMember)
      ;(prisma.notification.create as jest.Mock).mockResolvedValue({})
      ;(prisma.projectActivity.create as jest.Mock).mockResolvedValue({})

      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          email: 'john@example.com',
          role: 'CONTRIBUTOR',
          message: 'Welcome to the team!'
        }
      })

      const response = await POST(req, { params: { id: 'project-123' } })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.teamMember).toEqual(mockTeamMember)
    })

    test('creates placeholder user for new email', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'user-123',
        name: 'Test Project',
        teamMembers: []
      }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.userProfile.create as jest.Mock).mockResolvedValue({
        id: 'user-new',
        email: 'new@example.com',
        name: 'new'
      })

      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          email: 'new@example.com',
          role: 'CONTRIBUTOR'
        }
      })

      await POST(req, { params: { id: 'project-123' } })

      expect(prisma.userProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@example.com',
          name: 'new',
          emailVerified: false,
          isActive: false
        })
      })
    })

    test('prevents duplicate team member addition', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'user-123',
        teamMembers: []
      }

      const mockUser = { id: 'user-456', email: 'john@example.com' }
      const mockExistingMember = { id: 'member-123' }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.projectTeamMember.findUnique as jest.Mock).mockResolvedValue(mockExistingMember)

      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          email: 'john@example.com',
          role: 'CONTRIBUTOR'
        }
      })

      const response = await POST(req, { params: { id: 'project-123' } })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('already a team member')
    })
  })

  describe('PATCH /api/collaboration/projects/[id]/team', () => {
    test('successfully updates team member role', async () => {
      const mockProject = {
        id: 'project-123',
        userId: 'user-123',
        teamMembers: [{ role: 'LEAD' }]
      }

      const mockUpdatedMember = {
        id: 'member-123',
        role: 'MANAGER',
        user: { name: 'John Doe' }
      }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.projectTeamMember.update as jest.Mock).mockResolvedValue(mockUpdatedMember)
      ;(prisma.projectActivity.create as jest.Mock).mockResolvedValue({})

      const { req, res } = createMocks({
        method: 'PATCH',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          memberId: 'member-123',
          role: 'MANAGER',
          permissions: ['EDIT_BASIC_INFO', 'MANAGE_MILESTONES']
        }
      })

      const response = await PATCH(req, { params: { id: 'project-123' } })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.teamMember.role).toBe('MANAGER')
    })
  })
})
```

#### 2. Notification API Testing

```typescript
// __tests__/integration/api/notifications.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, PATCH } from '@/app/api/notifications/route'
import { prisma } from '@/lib/prisma'

describe('/api/notifications', () => {
  describe('GET /api/notifications', () => {
    test('returns user notifications', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          type: 'PROJECT_INVITATION',
          title: 'Project Invitation',
          message: 'You have been invited',
          isRead: false,
          createdAt: new Date()
        }
      ]

      ;(prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications)

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      })

      const response = await GET(req)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.notifications).toHaveLength(1)
      expect(data.unreadCount).toBe(1)
    })
  })

  describe('PATCH /api/notifications', () => {
    test('marks notification as read', async () => {
      ;(prisma.notification.update as jest.Mock).mockResolvedValue({
        id: 'notification-1',
        isRead: true
      })

      const { req, res } = createMocks({
        method: 'PATCH',
        headers: { authorization: 'Bearer valid-token' },
        body: { notificationId: 'notification-1', isRead: true }
      })

      const response = await PATCH(req)

      expect(response.status).toBe(200)
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notification-1' },
        data: { isRead: true, readAt: expect.any(Date) }
      })
    })
  })
})
```

### Database Integration Testing

```typescript
// __tests__/integration/database/collaboration.test.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST
    }
  }
})

describe('Collaboration Database Integration', () => {
  beforeAll(async () => {
    // Run migrations on test database
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST }
    })
  })

  beforeEach(async () => {
    // Clean up test data
    await prisma.projectActivity.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.projectTeamMember.deleteMany()
    await prisma.project.deleteMany()
    await prisma.userProfile.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Workspace and Team Management', () => {
    test('creates workspace with team members', async () => {
      // Create users
      const owner = await prisma.userProfile.create({
        data: {
          name: 'Owner User',
          email: 'owner@example.com',
          profileType: 'PROJECT_DEVELOPER'
        }
      })

      const member = await prisma.userProfile.create({
        data: {
          name: 'Member User',
          email: 'member@example.com',
          profileType: 'CONSULTANT'
        }
      })

      // Create workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: 'Test Workspace',
          slug: 'test-workspace',
          ownerId: owner.id,
          members: {
            create: [
              { userId: owner.id, role: 'OWNER' },
              { userId: member.id, role: 'MEMBER' }
            ]
          }
        },
        include: {
          members: {
            include: { user: true }
          }
        }
      })

      expect(workspace.members).toHaveLength(2)
      expect(workspace.members[0].role).toBe('OWNER')
      expect(workspace.members[1].role).toBe('MEMBER')
    })

    test('creates project with team members and permissions', async () => {
      // Create users
      const owner = await prisma.userProfile.create({
        data: {
          name: 'Project Owner',
          email: 'owner@example.com',
          profileType: 'PROJECT_DEVELOPER'
        }
      })

      const contributor = await prisma.userProfile.create({
        data: {
          name: 'Contributor',
          email: 'contributor@example.com',
          profileType: 'CONSULTANT'
        }
      })

      // Create project
      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          description: 'A test project',
          projectType: 'AFOLU',
          country: 'US',
          userId: owner.id,
          teamMembers: {
            create: [
              {
                userId: contributor.id,
                role: 'CONTRIBUTOR',
                permissions: ['EDIT_BASIC_INFO', 'UPLOAD_DOCUMENTS'],
                status: 'ACCEPTED',
                joinedAt: new Date()
              }
            ]
          }
        },
        include: {
          teamMembers: {
            include: { user: true }
          }
        }
      })

      expect(project.teamMembers).toHaveLength(1)
      expect(project.teamMembers[0].role).toBe('CONTRIBUTOR')
      expect(project.teamMembers[0].permissions).toContain('EDIT_BASIC_INFO')
    })
  })

  describe('Activity Tracking', () => {
    test('creates activity when team member is added', async () => {
      const owner = await prisma.userProfile.create({
        data: {
          name: 'Owner',
          email: 'owner@example.com',
          profileType: 'PROJECT_DEVELOPER'
        }
      })

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          projectType: 'ENERGY',
          country: 'US',
          userId: owner.id
        }
      })

      const member = await prisma.userProfile.create({
        data: {
          name: 'New Member',
          email: 'member@example.com',
          profileType: 'VALIDATOR'
        }
      })

      // Add team member
      await prisma.projectTeamMember.create({
        data: {
          projectId: project.id,
          userId: member.id,
          role: 'REVIEWER',
          status: 'ACCEPTED'
        }
      })

      // Create activity
      const activity = await prisma.projectActivity.create({
        data: {
          projectId: project.id,
          userId: owner.id,
          action: 'TEAM_MEMBER_ADDED',
          entity: 'team',
          entityId: member.id,
          description: `Added ${member.name} as REVIEWER`
        }
      })

      expect(activity.action).toBe('TEAM_MEMBER_ADDED')
      expect(activity.description).toContain('New Member')
    })
  })

  describe('Notification System', () => {
    test('creates notification for team invitation', async () => {
      const sender = await prisma.userProfile.create({
        data: {
          name: 'Sender',
          email: 'sender@example.com',
          profileType: 'PROJECT_DEVELOPER'
        }
      })

      const recipient = await prisma.userProfile.create({
        data: {
          name: 'Recipient',
          email: 'recipient@example.com',
          profileType: 'CONSULTANT'
        }
      })

      const notification = await prisma.notification.create({
        data: {
          recipientId: recipient.id,
          senderId: sender.id,
          type: 'PROJECT_INVITATION',
          title: 'Project Team Invitation',
          message: 'You have been invited to join a project',
          actionUrl: '/project/123/invitation',
          metadata: {
            projectId: 'project-123',
            role: 'CONTRIBUTOR'
          }
        }
      })

      expect(notification.type).toBe('PROJECT_INVITATION')
      expect(notification.isRead).toBe(false)
      expect(notification.metadata).toHaveProperty('projectId')
    })
  })

  describe('Permission Constraints', () => {
    test('prevents duplicate team member entries', async () => {
      const owner = await prisma.userProfile.create({
        data: {
          name: 'Owner',
          email: 'owner@example.com',
          profileType: 'PROJECT_DEVELOPER'
        }
      })

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          projectType: 'WASTE',
          country: 'CA',
          userId: owner.id
        }
      })

      const member = await prisma.userProfile.create({
        data: {
          name: 'Member',
          email: 'member@example.com',
          profileType: 'CONSULTANT'
        }
      })

      // Add team member
      await prisma.projectTeamMember.create({
        data: {
          projectId: project.id,
          userId: member.id,
          role: 'CONTRIBUTOR',
          status: 'ACCEPTED'
        }
      })

      // Try to add same member again - should fail
      await expect(
        prisma.projectTeamMember.create({
          data: {
            projectId: project.id,
            userId: member.id,
            role: 'REVIEWER',
            status: 'PENDING'
          }
        })
      ).rejects.toThrow('Unique constraint failed')
    })
  })
})
```

## End-to-End Testing Strategy

### Multi-User Collaboration Workflows

```typescript
// __tests__/e2e/collaboration/team-workflows.spec.ts
import { test, expect, Page } from '@playwright/test'

test.describe('Team Collaboration Workflows', () => {
  let ownerPage: Page
  let memberPage: Page

  test.beforeEach(async ({ browser }) => {
    // Create separate browser contexts for different users
    const ownerContext = await browser.newContext()
    const memberContext = await browser.newContext()

    ownerPage = await ownerContext.newPage()
    memberPage = await memberContext.newPage()

    // Login as project owner
    await ownerPage.goto('/login')
    await ownerPage.fill('[data-testid="email"]', 'owner@example.com')
    await ownerPage.fill('[data-testid="password"]', 'password123')
    await ownerPage.click('[data-testid="login-button"]')
    await ownerPage.waitForURL('/dashboard')

    // Login as team member
    await memberPage.goto('/login')
    await memberPage.fill('[data-testid="email"]', 'member@example.com')
    await memberPage.fill('[data-testid="password"]', 'password123')
    await memberPage.click('[data-testid="login-button"]')
    await memberPage.waitForURL('/dashboard')
  })

  test('complete team invitation workflow', async () => {
    // Owner creates project
    await ownerPage.goto('/project/new')
    await ownerPage.fill('[data-testid="project-name"]', 'E2E Test Project')
    await ownerPage.selectOption('[data-testid="project-type"]', 'AFOLU')
    await ownerPage.fill('[data-testid="country"]', 'United States')
    await ownerPage.click('[data-testid="create-project"]')

    // Wait for project creation
    await ownerPage.waitForURL('/project/*/dashboard')

    // Navigate to team management
    await ownerPage.click('[data-testid="team-tab"]')

    // Invite team member
    await ownerPage.click('[data-testid="invite-member-button"]')
    await ownerPage.fill('[data-testid="invite-email"]', 'member@example.com')
    await ownerPage.selectOption('[data-testid="invite-role"]', 'CONTRIBUTOR')
    await ownerPage.fill('[data-testid="invite-message"]', 'Welcome to our project!')
    await ownerPage.click('[data-testid="send-invitation"]')

    // Verify invitation sent
    await expect(ownerPage.locator('[data-testid="invitation-success"]')).toBeVisible()

    // Member checks notifications
    await memberPage.goto('/dashboard')
    await memberPage.click('[data-testid="notifications-button"]')

    // Verify invitation notification
    await expect(memberPage.locator('[data-testid="notification-invitation"]')).toBeVisible()

    // Accept invitation
    await memberPage.click('[data-testid="accept-invitation"]')

    // Verify member can access project
    await memberPage.waitForURL('/project/*/dashboard')
    await expect(memberPage.locator('[data-testid="project-name"]')).toContainText('E2E Test Project')

    // Owner verifies member was added
    await ownerPage.reload()
    await expect(ownerPage.locator('[data-testid="team-member-member@example.com"]')).toBeVisible()
  })

  test('real-time activity feed updates', async () => {
    // Both users navigate to same project
    const projectId = 'test-project-123'
    await ownerPage.goto(`/project/${projectId}/dashboard`)
    await memberPage.goto(`/project/${projectId}/dashboard`)

    // Owner creates a milestone
    await ownerPage.click('[data-testid="milestones-tab"]')
    await ownerPage.click('[data-testid="add-milestone"]')
    await ownerPage.fill('[data-testid="milestone-title"]', 'Project Kickoff')
    await ownerPage.fill('[data-testid="milestone-description"]', 'Initial project setup')
    await ownerPage.click('[data-testid="save-milestone"]')

    // Member should see activity update in real-time
    await memberPage.click('[data-testid="activity-tab"]')
    await expect(memberPage.locator('[data-testid="activity-milestone-created"]')).toBeVisible({ timeout: 5000 })

    // Member adds a comment
    await memberPage.click('[data-testid="comments-tab"]')
    await memberPage.fill('[data-testid="comment-input"]', 'Great to see the project starting!')
    await memberPage.click('[data-testid="post-comment"]')

    // Owner should see comment activity
    await ownerPage.click('[data-testid="activity-tab"]')
    await expect(ownerPage.locator('[data-testid="activity-comment-added"]')).toBeVisible({ timeout: 5000 })
  })

  test('role-based permission enforcement', async () => {
    const projectId = 'test-project-456'

    // Member (VIEWER role) navigates to project
    await memberPage.goto(`/project/${projectId}/team`)

    // Verify member cannot see team management controls
    await expect(memberPage.locator('[data-testid="invite-member-button"]')).not.toBeVisible()
    await expect(memberPage.locator('[data-testid="remove-member-button"]')).not.toBeVisible()

    // Owner can see and use team management
    await ownerPage.goto(`/project/${projectId}/team`)
    await expect(ownerPage.locator('[data-testid="invite-member-button"]')).toBeVisible()

    // Try to access restricted API endpoint as member
    const response = await memberPage.request.delete(`/api/collaboration/projects/${projectId}/team/member-123`)
    expect(response.status()).toBe(403)
  })

  test('notification system interactions', async () => {
    // Owner creates urgent notification
    await ownerPage.goto('/project/test-project-789/milestones')
    await ownerPage.click('[data-testid="milestone-overdue"]')
    await ownerPage.click('[data-testid="notify-team"]')

    // Member receives notification
    await memberPage.goto('/dashboard')

    // Check notification badge
    await expect(memberPage.locator('[data-testid="notification-badge"]')).toHaveText('1')

    // Open notifications
    await memberPage.click('[data-testid="notifications-button"]')
    await expect(memberPage.locator('[data-testid="notification-milestone-overdue"]')).toBeVisible()

    // Mark as read
    await memberPage.click('[data-testid="notification-milestone-overdue"]')

    // Verify badge updated
    await expect(memberPage.locator('[data-testid="notification-badge"]')).not.toBeVisible()
  })

  test('shared resource management', async () => {
    const projectId = 'test-project-resources'

    // Owner uploads document
    await ownerPage.goto(`/project/${projectId}/resources`)
    await ownerPage.setInputFiles('[data-testid="file-upload"]', './test-fixtures/sample-document.pdf')
    await ownerPage.fill('[data-testid="resource-name"]', 'Project Requirements')
    await ownerPage.fill('[data-testid="resource-description"]', 'Initial requirements document')
    await ownerPage.click('[data-testid="upload-resource"]')

    // Verify upload success
    await expect(ownerPage.locator('[data-testid="resource-Project Requirements"]')).toBeVisible()

    // Member can view and download
    await memberPage.goto(`/project/${projectId}/resources`)
    await expect(memberPage.locator('[data-testid="resource-Project Requirements"]')).toBeVisible()

    // Download resource
    const downloadPromise = memberPage.waitForEvent('download')
    await memberPage.click('[data-testid="download-Project Requirements"]')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('sample-document.pdf')
  })
})
```

### WebSocket Real-time Testing

```typescript
// __tests__/e2e/collaboration/realtime.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Real-time Collaboration Features', () => {
  test('real-time comment synchronization', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Both users join same project
    await page1.goto('/project/realtime-test/comments')
    await page2.goto('/project/realtime-test/comments')

    // User 1 posts comment
    await page1.fill('[data-testid="comment-input"]', 'Hello from user 1!')
    await page1.click('[data-testid="post-comment"]')

    // User 2 should see comment appear in real-time
    await expect(page2.locator('[data-testid="comment-Hello from user 1!"]')).toBeVisible({ timeout: 3000 })

    // User 2 replies
    await page2.fill('[data-testid="comment-input"]', 'Hello back from user 2!')
    await page2.click('[data-testid="post-comment"]')

    // User 1 should see reply
    await expect(page1.locator('[data-testid="comment-Hello back from user 2!"]')).toBeVisible({ timeout: 3000 })
  })

  test('real-time activity feed updates', async ({ browser }) => {
    const ownerContext = await browser.newContext()
    const memberContext = await browser.newContext()

    const ownerPage = await ownerContext.newPage()
    const memberPage = await memberContext.newPage()

    // Navigate to project dashboard
    await ownerPage.goto('/project/activity-test/dashboard')
    await memberPage.goto('/project/activity-test/dashboard')

    // Keep activity feed visible on member page
    await memberPage.click('[data-testid="activity-feed-tab"]')

    // Owner performs various actions
    await ownerPage.click('[data-testid="milestones-tab"]')
    await ownerPage.click('[data-testid="add-milestone"]')
    await ownerPage.fill('[data-testid="milestone-title"]', 'Real-time Test Milestone')
    await ownerPage.click('[data-testid="save-milestone"]')

    // Member should see activity update
    await expect(memberPage.locator('[data-testid="activity-milestone-created"]')).toBeVisible({ timeout: 5000 })

    // Owner uploads document
    await ownerPage.click('[data-testid="documents-tab"]')
    await ownerPage.setInputFiles('[data-testid="file-upload"]', './test-fixtures/test-doc.pdf')
    await ownerPage.click('[data-testid="upload-document"]')

    // Member should see document upload activity
    await expect(memberPage.locator('[data-testid="activity-document-uploaded"]')).toBeVisible({ timeout: 5000 })
  })

  test('real-time notification delivery', async ({ browser }) => {
    const senderContext = await browser.newContext()
    const receiverContext = await browser.newContext()

    const senderPage = await senderContext.newPage()
    const receiverPage = await receiverContext.newPage()

    // Receiver stays on dashboard
    await receiverPage.goto('/dashboard')

    // Sender invites receiver to project
    await senderPage.goto('/project/notification-test/team')
    await senderPage.click('[data-testid="invite-member-button"]')
    await senderPage.fill('[data-testid="invite-email"]', 'receiver@example.com')
    await senderPage.click('[data-testid="send-invitation"]')

    // Receiver should see notification badge update in real-time
    await expect(receiverPage.locator('[data-testid="notification-badge"]')).toBeVisible({ timeout: 5000 })

    // Check notification content
    await receiverPage.click('[data-testid="notifications-button"]')
    await expect(receiverPage.locator('[data-testid="notification-project-invitation"]')).toBeVisible()
  })
})
```

## Performance Testing Strategy

### Load Testing with Artillery

```yaml
# __tests__/performance/collaboration-load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 600
      arrivalRate: 100
      name: "Sustained load"
  processor: "./collaboration-processor.js"

scenarios:
  - name: "Team Management Workflow"
    weight: 40
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "user{{ $randomInt(1, 1000) }}@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/collaboration/projects/{{ projectId }}/team"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - post:
          url: "/api/collaboration/projects/{{ projectId }}/team"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            email: "invite{{ $randomInt(1, 10000) }}@example.com"
            role: "CONTRIBUTOR"

  - name: "Real-time Activity Feed"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "user{{ $randomInt(1, 1000) }}@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/collaboration/projects/{{ projectId }}/activities"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - ws:
          url: "ws://localhost:3000/ws/project/{{ projectId }}/activities"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Notification System"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "user{{ $randomInt(1, 1000) }}@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/notifications"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - patch:
          url: "/api/notifications/{{ notificationId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            isRead: true
```

```javascript
// __tests__/performance/collaboration-processor.js
module.exports = {
  setProjectId: function(requestParams, context, ee, next) {
    context.vars.projectId = 'load-test-project-' + Math.floor(Math.random() * 10)
    return next()
  },

  setNotificationId: function(requestParams, context, ee, next) {
    context.vars.notificationId = 'notification-' + Math.floor(Math.random() * 1000)
    return next()
  }
}
```

### Database Performance Testing

```typescript
// __tests__/performance/database-performance.test.ts
import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'

const prisma = new PrismaClient()

describe('Database Performance Tests', () => {
  test('team member query performance', async () => {
    const startTime = performance.now()

    // Simulate complex query with joins
    const result = await prisma.project.findMany({
      where: {
        teamMembers: {
          some: {
            userId: 'user-123'
          }
        }
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                expertise: true
              }
            }
          }
        },
        activities: {
          take: 20,
          orderBy: { timestamp: 'desc' },
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      take: 50
    })

    const endTime = performance.now()
    const queryTime = endTime - startTime

    expect(queryTime).toBeLessThan(500) // Query should complete within 500ms
    expect(result.length).toBeGreaterThan(0)
  })

  test('notification query performance with pagination', async () => {
    const startTime = performance.now()

    const notifications = await prisma.notification.findMany({
      where: { recipientId: 'user-123' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      skip: 0,
      include: {
        sender: {
          select: { name: true }
        }
      }
    })

    const endTime = performance.now()
    const queryTime = endTime - startTime

    expect(queryTime).toBeLessThan(200) // Should be very fast with proper indexing
  })

  test('activity feed query performance', async () => {
    const startTime = performance.now()

    const activities = await prisma.projectActivity.findMany({
      where: {
        project: {
          teamMembers: {
            some: { userId: 'user-123' }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true } }
      }
    })

    const endTime = performance.now()
    const queryTime = endTime - startTime

    expect(queryTime).toBeLessThan(300)
  })
})
```

## Security Testing Strategy

### Authentication & Authorization Testing

```typescript
// __tests__/security/auth-security.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/collaboration/projects/[id]/team/route'
import jwt from 'jsonwebtoken'

describe('Authentication & Authorization Security', () => {
  test('rejects requests without authentication', async () => {
    const { req } = createMocks({
      method: 'GET'
    })

    const response = await GET(req, { params: { id: 'project-123' } })
    expect(response.status).toBe(401)
  })

  test('rejects invalid JWT tokens', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer invalid-token' }
    })

    const response = await GET(req, { params: { id: 'project-123' } })
    expect(response.status).toBe(401)
  })

  test('rejects expired JWT tokens', async () => {
    const expiredToken = jwt.sign(
      { userId: 'user-123', exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET || 'test-secret'
    )

    const { req } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${expiredToken}` }
    })

    const response = await GET(req, { params: { id: 'project-123' } })
    expect(response.status).toBe(401)
  })

  test('enforces role-based access control', async () => {
    // Viewer trying to manage team
    const viewerToken = jwt.sign(
      { userId: 'viewer-123', role: 'VIEWER' },
      process.env.JWT_SECRET || 'test-secret'
    )

    const { req } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${viewerToken}` },
      body: { email: 'test@example.com', role: 'CONTRIBUTOR' }
    })

    const response = await POST(req, { params: { id: 'project-123' } })
    expect(response.status).toBe(403)
  })
})
```

### Input Validation Security Testing

```typescript
// __tests__/security/input-validation.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/collaboration/projects/[id]/team/route'

describe('Input Validation Security', () => {
  test('prevents SQL injection in email field', async () => {
    const maliciousEmail = "'; DROP TABLE users; --"

    const { req } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        email: maliciousEmail,
        role: 'CONTRIBUTOR'
      }
    })

    const response = await POST(req, { params: { id: 'project-123' } })

    // Should return validation error, not internal server error
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid email format')
  })

  test('sanitizes XSS attempts in messages', async () => {
    const xssPayload = "<script>alert('xss')</script>"

    const { req } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        email: 'test@example.com',
        role: 'CONTRIBUTOR',
        message: xssPayload
      }
    })

    const response = await POST(req, { params: { id: 'project-123' } })

    if (response.status === 200) {
      const data = await response.json()
      // Message should be sanitized
      expect(data.teamMember.invitationMessage).not.toContain('<script>')
    }
  })

  test('validates role enum values', async () => {
    const { req } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        email: 'test@example.com',
        role: 'INVALID_ROLE'
      }
    })

    const response = await POST(req, { params: { id: 'project-123' } })
    expect(response.status).toBe(400)
  })

  test('prevents privilege escalation through role manipulation', async () => {
    // Contributor trying to invite someone as LEAD
    const { req } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer contributor-token' },
      body: {
        email: 'test@example.com',
        role: 'LEAD'
      }
    })

    const response = await POST(req, { params: { id: 'project-123' } })
    expect(response.status).toBe(403)
  })
})
```

### Rate Limiting Security Testing

```typescript
// __tests__/security/rate-limiting.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/collaboration/projects/[id]/team/route'

describe('Rate Limiting Security', () => {
  test('prevents invitation spam', async () => {
    const requests = []

    // Send 10 rapid invitation requests
    for (let i = 0; i < 10; i++) {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'x-forwarded-for': '192.168.1.1' // Simulate same IP
        },
        body: {
          email: `test${i}@example.com`,
          role: 'CONTRIBUTOR'
        }
      })

      requests.push(POST(req, { params: { id: 'project-123' } }))
    }

    const responses = await Promise.all(requests)

    // Later requests should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })
})
```

## Mock Data Strategy

### Mock Service Worker Setup

```typescript
// __tests__/__mocks__/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())
```

```typescript
// __tests__/__mocks__/handlers.ts
import { rest } from 'msw'
import { faker } from '@faker-js/faker'

export const handlers = [
  // Team member endpoints
  rest.get('/api/collaboration/projects/:id/team', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        teamMembers: generateMockTeamMembers(5)
      })
    )
  }),

  rest.post('/api/collaboration/projects/:id/team', (req, res, ctx) => {
    const { email, role } = req.body as any

    return res(
      ctx.json({
        success: true,
        teamMember: generateMockTeamMember({ email, role }),
        message: 'Team member invited successfully'
      })
    )
  }),

  // Notification endpoints
  rest.get('/api/notifications', (req, res, ctx) => {
    return res(
      ctx.json({
        notifications: generateMockNotifications(10),
        unreadCount: 3
      })
    )
  }),

  // Activity feed endpoints
  rest.get('/api/collaboration/projects/:id/activities', (req, res, ctx) => {
    return res(
      ctx.json({
        activities: generateMockActivities(20),
        hasMore: true
      })
    )
  }),

  // WebSocket mock
  rest.get('/ws/project/:id/activities', (req, res, ctx) => {
    // Mock WebSocket connection
    return res(ctx.status(101))
  })
]

function generateMockTeamMembers(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    user: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      profileType: faker.helpers.arrayElement(['PROJECT_DEVELOPER', 'CONSULTANT', 'VALIDATOR']),
      expertise: faker.helpers.arrayElements(['AFOLU', 'Energy', 'Waste', 'Transport'], 2)
    },
    role: faker.helpers.arrayElement(['LEAD', 'MANAGER', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER']),
    permissions: generateRolePermissions(),
    status: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'DECLINED']),
    joinedAt: faker.date.recent().toISOString(),
    isActive: true,
    createdAt: faker.date.recent().toISOString()
  }))
}

function generateMockTeamMember(overrides: any = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    user: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: overrides.email || faker.internet.email(),
      profileType: 'PROJECT_DEVELOPER',
      expertise: ['AFOLU']
    },
    role: overrides.role || 'CONTRIBUTOR',
    permissions: generateRolePermissions(overrides.role || 'CONTRIBUTOR'),
    status: 'PENDING',
    invitedAt: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString()
  }
}

function generateMockNotifications(count: number) {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['PROJECT_INVITATION', 'MILESTONE_DUE', 'COMMENT_MENTION']),
    title: faker.lorem.sentence(),
    message: faker.lorem.sentences(2),
    actionUrl: `/project/${faker.string.uuid()}/team`,
    isRead: faker.datatype.boolean(),
    createdAt: faker.date.recent().toISOString(),
    sender: {
      name: faker.person.fullName()
    }
  }))
}

function generateMockActivities(count: number) {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    action: faker.helpers.arrayElement([
      'MILESTONE_ADDED',
      'TEAM_MEMBER_ADDED',
      'COMMENT_ADDED',
      'DOCUMENT_UPLOADED'
    ]),
    description: faker.lorem.sentence(),
    timestamp: faker.date.recent().toISOString(),
    user: {
      name: faker.person.fullName()
    }
  }))
}

function generateRolePermissions(role: string = 'CONTRIBUTOR') {
  const permissions = {
    LEAD: ['EDIT_BASIC_INFO', 'EDIT_METHODOLOGY', 'MANAGE_TEAM', 'MANAGE_MILESTONES', 'UPLOAD_DOCUMENTS', 'VIEW_SENSITIVE_DATA', 'APPROVE_CHANGES', 'DELETE_PROJECT'],
    MANAGER: ['EDIT_BASIC_INFO', 'EDIT_METHODOLOGY', 'MANAGE_MILESTONES', 'UPLOAD_DOCUMENTS', 'VIEW_SENSITIVE_DATA', 'APPROVE_CHANGES'],
    CONTRIBUTOR: ['EDIT_BASIC_INFO', 'UPLOAD_DOCUMENTS'],
    REVIEWER: ['VIEW_SENSITIVE_DATA'],
    VIEWER: []
  }

  return permissions[role as keyof typeof permissions] || []
}
```

### Test Data Factories

```typescript
// __tests__/__mocks__/factories.ts
import { faker } from '@faker-js/faker'

export class TestDataFactory {
  static createUser(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      profileType: 'PROJECT_DEVELOPER',
      expertise: ['AFOLU', 'Reforestation'],
      isActive: true,
      emailVerified: true,
      createdAt: faker.date.recent(),
      ...overrides
    }
  }

  static createProject(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.company.name() + ' Carbon Project',
      description: faker.lorem.paragraph(),
      projectType: 'AFOLU',
      status: 'PLANNING',
      country: 'US',
      region: 'California',
      coordinates: '34.0522,-118.2437',
      estimatedCredits: faker.number.int({ min: 1000, max: 50000 }),
      budget: faker.number.float({ min: 100000, max: 5000000 }),
      visibility: 'PRIVATE',
      createdAt: faker.date.recent(),
      ...overrides
    }
  }

  static createWorkspace(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.company.name() + ' Workspace',
      description: faker.lorem.sentence(),
      slug: faker.lorem.slug(),
      isActive: true,
      settings: {},
      createdAt: faker.date.recent(),
      ...overrides
    }
  }

  static createTeamMember(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      role: 'CONTRIBUTOR',
      permissions: ['EDIT_BASIC_INFO', 'UPLOAD_DOCUMENTS'],
      status: 'ACCEPTED',
      joinedAt: faker.date.recent(),
      isActive: true,
      createdAt: faker.date.recent(),
      ...overrides
    }
  }

  static createNotification(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      type: 'PROJECT_INVITATION',
      title: 'Project Team Invitation',
      message: faker.lorem.sentences(2),
      actionUrl: `/project/${faker.string.uuid()}/team`,
      isRead: false,
      createdAt: faker.date.recent(),
      metadata: {
        projectId: faker.string.uuid(),
        role: 'CONTRIBUTOR'
      },
      ...overrides
    }
  }

  static createActivity(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      action: 'TEAM_MEMBER_ADDED',
      entity: 'team',
      entityId: faker.string.uuid(),
      description: faker.lorem.sentence(),
      timestamp: faker.date.recent(),
      metadata: {},
      ...overrides
    }
  }

  static createSharedResource(overrides: any = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.system.fileName(),
      description: faker.lorem.sentence(),
      type: 'DOCUMENT',
      fileUrl: faker.internet.url(),
      fileSize: faker.number.int({ min: 1024, max: 10485760 }),
      mimeType: 'application/pdf',
      tags: ['requirements', 'initial'],
      version: 1,
      isPublic: false,
      downloadCount: 0,
      createdAt: faker.date.recent(),
      ...overrides
    }
  }
}
```

## Testing Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. **Setup Test Infrastructure**
   - Configure Jest and React Testing Library
   - Setup MSW for API mocking
   - Create test database setup
   - Configure Playwright for E2E testing

2. **Unit Test Implementation**
   - Team management component tests
   - Notification system component tests
   - Activity feed component tests
   - Utility function tests

### Phase 2: Integration Testing (Week 3-4)
1. **API Endpoint Testing**
   - Team management endpoints
   - Notification endpoints
   - Activity feed endpoints
   - WebSocket connection tests

2. **Database Integration Testing**
   - Collaboration model tests
   - Permission constraint tests
   - Data integrity tests

### Phase 3: End-to-End Testing (Week 5-6)
1. **Multi-User Workflow Testing**
   - Team invitation workflows
   - Real-time collaboration scenarios
   - Permission-based access tests

2. **Performance Testing Setup**
   - Load testing configuration
   - Database performance benchmarks
   - Real-time feature performance tests

### Phase 4: Security & Advanced Testing (Week 7-8)
1. **Security Testing Implementation**
   - Authentication and authorization tests
   - Input validation and sanitization tests
   - Rate limiting tests

2. **Advanced Scenarios**
   - Concurrent user testing
   - Data consistency tests
   - Error recovery testing

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/collaboration-testing.yml
name: Collaboration System Testing

on:
  push:
    branches: [main, develop]
    paths:
      - 'components/collaboration/**'
      - 'app/api/collaboration/**'
      - '__tests__/**'
  pull_request:
    branches: [main]
    paths:
      - 'components/collaboration/**'
      - 'app/api/collaboration/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: chatpdd_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Setup test database
        run: |
          pnpm prisma migrate deploy
          pnpm prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatpdd_test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatpdd_test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: chatpdd_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps

      - name: Setup test database
        run: |
          pnpm prisma migrate deploy
          pnpm prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatpdd_test

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatpdd_test

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Artillery
        run: npm install -g artillery

      - name: Build and start application
        run: |
          pnpm build
          pnpm start &
          sleep 30
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}

      - name: Run performance tests
        run: artillery run __tests__/performance/collaboration-load-test.yml

      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: artillery-report.json
```

### Test Coverage Requirements

```javascript
// jest.config.js - Coverage thresholds for collaboration features
module.exports = {
  // ... other config
  collectCoverageFrom: [
    'components/collaboration/**/*.{ts,tsx}',
    'app/api/collaboration/**/*.{ts,tsx}',
    'services/collaboration-service.ts',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    },
    './components/collaboration/': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    './app/api/collaboration/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  }
}
```

## Monitoring and Alerting

### Test Result Monitoring

```typescript
// __tests__/utils/test-monitoring.ts
export class TestMonitoring {
  static async reportTestMetrics(testSuite: string, results: any) {
    const metrics = {
      testSuite,
      timestamp: new Date().toISOString(),
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      duration: results.duration,
      coverage: results.coverageData
    }

    // Send to monitoring service
    await fetch('/api/monitoring/test-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    })
  }

  static setupTestFailureAlerts() {
    // Setup alerts for test failures
    if (process.env.NODE_ENV === 'production') {
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Test failure detected:', reason)
        // Send alert to Slack/email
      })
    }
  }
}
```

This comprehensive testing strategy provides a robust foundation for testing the ChatPDD collaboration system. It covers all aspects from unit testing of individual components to complex end-to-end workflows, ensuring the collaboration features work reliably across different scenarios and user interactions.

The strategy is designed to be immediately implementable with the existing Next.js/Prisma/TypeScript stack and provides clear guidance for testing team management, real-time features, notifications, and security aspects of the collaboration system.
