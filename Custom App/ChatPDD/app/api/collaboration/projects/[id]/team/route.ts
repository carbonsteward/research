import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authService } from '@/lib/auth/rbac'

// GET /api/collaboration/projects/[id]/team - Get project team members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const user = await authService.verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileType: true,
                expertise: true,
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is team member or has permission to view team
    const isTeamMember = project.teamMembers.some(member => member.userId === user.id)
    const isOwner = project.userId === user.id

    if (!isTeamMember && !isOwner && !user.hasPermission('project', 'read', 'organization')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      teamMembers: project.teamMembers
    })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/collaboration/projects/[id]/team - Invite team member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { email, role, permissions, message } = body

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const user = await authService.verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check project access and permissions
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamMembers: {
          where: { userId: user.id }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user can manage team
    const isOwner = project.userId === user.id
    const userTeamMember = project.teamMembers[0]
    const canManageTeam = isOwner ||
                         (userTeamMember && ['LEAD', 'MANAGER'].includes(userTeamMember.role)) ||
                         user.hasPermission('project', 'manage_team', 'organization')

    if (!canManageTeam) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage team' },
        { status: 403 }
      )
    }

    // Find or create user by email
    let invitedUser = await prisma.userProfile.findUnique({
      where: { email }
    })

    if (!invitedUser) {
      // Create placeholder user for invitation
      invitedUser = await prisma.userProfile.create({
        data: {
          name: email.split('@')[0], // Temporary name
          email,
          profileType: 'PROJECT_DEVELOPER',
          emailVerified: false,
          isActive: false // Will be activated when they accept invitation
        }
      })
    }

    // Check if user is already a team member
    const existingMember = await prisma.projectTeamMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: invitedUser.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      )
    }

    // Create team member invitation
    const teamMember = await prisma.projectTeamMember.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role,
        permissions: permissions || [],
        invitedBy: user.id,
        invitedAt: new Date(),
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileType: true,
            expertise: true,
          }
        }
      }
    })

    // Create notification for invited user
    await prisma.notification.create({
      data: {
        recipientId: invitedUser.id,
        senderId: user.id,
        type: 'PROJECT_INVITATION',
        title: 'Project Team Invitation',
        message: `You have been invited to join ${project.name} as ${role}`,
        actionUrl: `/project/${projectId}/team/invitation/${teamMember.id}`,
        metadata: {
          projectId,
          projectName: project.name,
          role,
          invitationMessage: message
        }
      }
    })

    // Create activity log
    await prisma.projectActivity.create({
      data: {
        projectId,
        userId: user.id,
        action: 'TEAM_MEMBER_ADDED',
        entity: 'team',
        description: `Invited ${invitedUser.name} to join as ${role}`,
        metadata: {
          invitedUserId: invitedUser.id,
          role
        }
      }
    })

    // TODO: Send invitation email

    return NextResponse.json({
      success: true,
      teamMember,
      message: 'Team member invited successfully'
    })
  } catch (error) {
    console.error('Error inviting team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/collaboration/projects/[id]/team - Update team member role/permissions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { memberId, role, permissions } = body

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const user = await authService.verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check permissions
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamMembers: {
          where: { userId: user.id }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const isOwner = project.userId === user.id
    const userTeamMember = project.teamMembers[0]
    const canManageTeam = isOwner ||
                         (userTeamMember && ['LEAD', 'MANAGER'].includes(userTeamMember.role))

    if (!canManageTeam) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage team' },
        { status: 403 }
      )
    }

    // Update team member
    const updatedMember = await prisma.projectTeamMember.update({
      where: { id: memberId },
      data: {
        role,
        permissions: permissions || [],
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileType: true,
            expertise: true,
          }
        }
      }
    })

    // Create activity log
    await prisma.projectActivity.create({
      data: {
        projectId,
        userId: user.id,
        action: 'TEAM_MEMBER_UPDATED',
        entity: 'team',
        description: `Updated ${updatedMember.user.name}'s role to ${role}`,
        metadata: {
          memberId,
          newRole: role
        }
      }
    })

    return NextResponse.json({
      success: true,
      teamMember: updatedMember,
      message: 'Team member updated successfully'
    })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
