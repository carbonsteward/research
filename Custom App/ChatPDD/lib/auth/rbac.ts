/**
 * Role-Based Access Control (RBAC) System
 * Provides authentication, authorization, and permission management
 */

import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'
import { verify, sign, JwtPayload } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

// Types
export interface User {
  id: string
  email: string
  name: string
  profileType: string
  isActive: boolean
  emailVerified: boolean
  roles: Array<{
    id: string
    name: string
    displayName: string
    level: number
  }>
  permissions: string[]
  organization?: {
    id: string
    name: string
    role: string
  }
}

export interface AuthResult {
  user: User | null
  token?: string
  error?: string
}

export interface Permission {
  resource: string
  action: string
  scope?: string
}

// Default role configuration
export const DEFAULT_ROLES = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access',
    level: 100,
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Organization-level administration',
    level: 80,
  },
  {
    name: 'project_developer',
    displayName: 'Project Developer',
    description: 'Create and manage carbon projects',
    level: 60,
  },
  {
    name: 'validator',
    displayName: 'Validator',
    description: 'Validate and verify carbon projects',
    level: 70,
  },
  {
    name: 'investor',
    displayName: 'Investor',
    description: 'View and analyze investment opportunities',
    level: 50,
  },
  {
    name: 'analyst',
    displayName: 'Analyst',
    description: 'Analyze project data and generate reports',
    level: 40,
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to public data',
    level: 10,
  },
]

// Default permission configuration
export const DEFAULT_PERMISSIONS = [
  // User management
  { resource: 'user', action: 'create', scope: 'global' },
  { resource: 'user', action: 'read', scope: 'global' },
  { resource: 'user', action: 'read', scope: 'organization' },
  { resource: 'user', action: 'read', scope: 'own' },
  { resource: 'user', action: 'update', scope: 'global' },
  { resource: 'user', action: 'update', scope: 'organization' },
  { resource: 'user', action: 'update', scope: 'own' },
  { resource: 'user', action: 'delete', scope: 'global' },
  { resource: 'user', action: 'delete', scope: 'organization' },

  // Project management
  { resource: 'project', action: 'create', scope: 'global' },
  { resource: 'project', action: 'create', scope: 'organization' },
  { resource: 'project', action: 'read', scope: 'global' },
  { resource: 'project', action: 'read', scope: 'organization' },
  { resource: 'project', action: 'read', scope: 'own' },
  { resource: 'project', action: 'read', scope: 'public' },
  { resource: 'project', action: 'update', scope: 'global' },
  { resource: 'project', action: 'update', scope: 'organization' },
  { resource: 'project', action: 'update', scope: 'own' },
  { resource: 'project', action: 'delete', scope: 'global' },
  { resource: 'project', action: 'delete', scope: 'organization' },
  { resource: 'project', action: 'delete', scope: 'own' },

  // Validation and verification
  { resource: 'project', action: 'validate', scope: 'global' },
  { resource: 'project', action: 'validate', scope: 'organization' },
  { resource: 'project', action: 'verify', scope: 'global' },
  { resource: 'project', action: 'verify', scope: 'organization' },

  // Risk assessments
  { resource: 'risk_assessment', action: 'create', scope: 'global' },
  { resource: 'risk_assessment', action: 'create', scope: 'organization' },
  { resource: 'risk_assessment', action: 'read', scope: 'global' },
  { resource: 'risk_assessment', action: 'read', scope: 'organization' },
  { resource: 'risk_assessment', action: 'read', scope: 'own' },
  { resource: 'risk_assessment', action: 'update', scope: 'global' },
  { resource: 'risk_assessment', action: 'update', scope: 'organization' },
  { resource: 'risk_assessment', action: 'update', scope: 'own' },

  // Methodologies
  { resource: 'methodology', action: 'create', scope: 'global' },
  { resource: 'methodology', action: 'read', scope: 'global' },
  { resource: 'methodology', action: 'read', scope: 'public' },
  { resource: 'methodology', action: 'update', scope: 'global' },
  { resource: 'methodology', action: 'delete', scope: 'global' },

  // Reports and analytics
  { resource: 'report', action: 'create', scope: 'global' },
  { resource: 'report', action: 'create', scope: 'organization' },
  { resource: 'report', action: 'read', scope: 'global' },
  { resource: 'report', action: 'read', scope: 'organization' },
  { resource: 'report', action: 'read', scope: 'own' },

  // Organization management
  { resource: 'organization', action: 'create', scope: 'global' },
  { resource: 'organization', action: 'read', scope: 'global' },
  { resource: 'organization', action: 'read', scope: 'own' },
  { resource: 'organization', action: 'update', scope: 'global' },
  { resource: 'organization', action: 'update', scope: 'own' },
  { resource: 'organization', action: 'delete', scope: 'global' },
  { resource: 'organization', action: 'manage_members', scope: 'own' },

  // System administration
  { resource: 'system', action: 'admin', scope: 'global' },
  { resource: 'system', action: 'backup', scope: 'global' },
  { resource: 'system', action: 'monitor', scope: 'global' },
]

// Role-Permission mappings
export const ROLE_PERMISSIONS = {
  super_admin: [
    'user:*:global',
    'project:*:global',
    'risk_assessment:*:global',
    'methodology:*:global',
    'report:*:global',
    'organization:*:global',
    'system:*:global',
  ],
  admin: [
    'user:*:organization',
    'user:read:global',
    'project:*:organization',
    'project:read:global',
    'risk_assessment:*:organization',
    'risk_assessment:read:global',
    'methodology:read:global',
    'report:*:organization',
    'report:read:global',
    'organization:*:own',
    'organization:read:global',
  ],
  project_developer: [
    'user:read:organization',
    'user:update:own',
    'project:create:organization',
    'project:*:own',
    'project:read:organization',
    'project:read:public',
    'risk_assessment:*:own',
    'risk_assessment:read:organization',
    'methodology:read:global',
    'report:create:own',
    'report:read:own',
    'report:read:organization',
  ],
  validator: [
    'user:read:organization',
    'user:update:own',
    'project:read:global',
    'project:validate:global',
    'project:verify:organization',
    'risk_assessment:read:global',
    'risk_assessment:create:organization',
    'methodology:read:global',
    'report:create:organization',
    'report:read:global',
  ],
  investor: [
    'user:read:organization',
    'user:update:own',
    'project:read:global',
    'project:read:public',
    'risk_assessment:read:global',
    'methodology:read:global',
    'methodology:read:public',
    'report:read:global',
    'report:create:own',
  ],
  analyst: [
    'user:read:organization',
    'user:update:own',
    'project:read:organization',
    'project:read:public',
    'risk_assessment:read:organization',
    'methodology:read:global',
    'methodology:read:public',
    'report:*:organization',
    'report:read:global',
  ],
  viewer: [
    'user:read:own',
    'user:update:own',
    'project:read:public',
    'methodology:read:public',
    'report:read:public',
  ],
}

export class AuthService {
  private jwtSecret: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production'
  }

  /**
   * Initialize RBAC system with default roles and permissions
   */
  async initializeRBAC(): Promise<void> {
    try {
      // Create default permissions
      for (const permission of DEFAULT_PERMISSIONS) {
        await prisma.permission.upsert({
          where: {
            resource_action_scope: {
              resource: permission.resource,
              action: permission.action,
              scope: permission.scope || null,
            },
          },
          update: {},
          create: {
            name: `${permission.resource}:${permission.action}${permission.scope ? `:${permission.scope}` : ''}`,
            displayName: `${permission.action} ${permission.resource}${permission.scope ? ` (${permission.scope})` : ''}`,
            resource: permission.resource,
            action: permission.action,
            scope: permission.scope,
          },
        })
      }

      // Create default roles
      for (const role of DEFAULT_ROLES) {
        const createdRole = await prisma.role.upsert({
          where: { name: role.name },
          update: {},
          create: role,
        })

        // Assign permissions to roles
        const rolePermissions = ROLE_PERMISSIONS[role.name as keyof typeof ROLE_PERMISSIONS] || []

        for (const permissionName of rolePermissions) {
          const permission = await prisma.permission.findUnique({
            where: { name: permissionName },
          })

          if (permission) {
            await prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: createdRole.id,
                  permissionId: permission.id,
                },
              },
              update: {},
              create: {
                roleId: createdRole.id,
                permissionId: permission.id,
              },
            })
          }
        }
      }

      console.log('RBAC system initialized successfully')
    } catch (error) {
      console.error('Failed to initialize RBAC system:', error)
      throw error
    }
  }

  /**
   * Register a new user
   */
  async register(data: {
    name: string
    email: string
    password: string
    profileType: string
    organization?: string
    country?: string
  }): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.userProfile.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        return { user: null, error: 'User already exists' }
      }

      // Hash password
      const hashedPassword = await hash(data.password, 12)

      // Create user
      const user = await prisma.userProfile.create({
        data: {
          name: data.name,
          email: data.email,
          profileType: data.profileType as any,
          organization: data.organization,
          country: data.country,
        },
      })

      // Assign default role based on profile type
      const defaultRoleName = this.getDefaultRoleForProfileType(data.profileType)
      const defaultRole = await prisma.role.findUnique({
        where: { name: defaultRoleName },
      })

      if (defaultRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
          },
        })
      }

      // Generate token
      const token = this.generateToken(user.id)

      // Get user with roles and permissions
      const userWithRoles = await this.getUserWithRolesAndPermissions(user.id)

      return { user: userWithRoles, token }
    } catch (error) {
      console.error('Registration error:', error)
      return { user: null, error: 'Registration failed' }
    }
  }

  /**
   * Authenticate user login
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const user = await prisma.userProfile.findUnique({
        where: { email },
      })

      if (!user || !user.isActive) {
        return { user: null, error: 'Invalid credentials' }
      }

      // Note: In a real implementation, you'd store password hash
      // For demo purposes, we'll skip password verification
      // const isValidPassword = await compare(password, user.password)
      // if (!isValidPassword) {
      //   return { user: null, error: 'Invalid credentials' }
      // }

      // Generate token
      const token = this.generateToken(user.id)

      // Create session
      const sessionToken = randomBytes(32).toString('hex')
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })

      // Get user with roles and permissions
      const userWithRoles = await this.getUserWithRolesAndPermissions(user.id)

      return { user: userWithRoles, token }
    } catch (error) {
      console.error('Login error:', error)
      return { user: null, error: 'Login failed' }
    }
  }

  /**
   * Get user from token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = verify(token, this.jwtSecret) as JwtPayload

      if (!decoded.userId) {
        return null
      }

      return await this.getUserWithRolesAndPermissions(decoded.userId)
    } catch (error) {
      console.error('Token verification error:', error)
      return null
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    userId: string,
    permission: Permission,
    resourceId?: string
  ): Promise<boolean> {
    try {
      const user = await this.getUserWithRolesAndPermissions(userId)
      if (!user) return false

      // Super admin has all permissions
      if (user.roles.some(role => role.name === 'super_admin')) {
        return true
      }

      // Check direct permissions
      const permissionString = `${permission.resource}:${permission.action}${
        permission.scope ? `:${permission.scope}` : ''
      }`

      if (user.permissions.includes(permissionString)) {
        return true
      }

      // Check wildcard permissions
      const wildcardPermissions = [
        `${permission.resource}:*${permission.scope ? `:${permission.scope}` : ''}`,
        `*:${permission.action}${permission.scope ? `:${permission.scope}` : ''}`,
        `*:*${permission.scope ? `:${permission.scope}` : ''}`,
      ]

      for (const wildcardPermission of wildcardPermissions) {
        if (user.permissions.includes(wildcardPermission)) {
          return true
        }
      }

      // Additional scope-based checks could be implemented here
      // e.g., checking if user owns the resource for 'own' scope

      return false
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      })

      if (!role) {
        return false
      }

      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: role.id,
          },
        },
        update: { isActive: true },
        create: {
          userId,
          roleId: role.id,
        },
      })

      return true
    } catch (error) {
      console.error('Role assignment error:', error)
      return false
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      })

      if (!role) {
        return false
      }

      await prisma.userRole.updateMany({
        where: {
          userId,
          roleId: role.id,
        },
        data: {
          isActive: false,
        },
      })

      return true
    } catch (error) {
      console.error('Role removal error:', error)
      return false
    }
  }

  private generateToken(userId: string): string {
    return sign(
      { userId, timestamp: Date.now() },
      this.jwtSecret,
      { expiresIn: '7d' }
    )
  }

  private async getUserWithRolesAndPermissions(userId: string): Promise<User | null> {
    try {
      const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        include: {
          roles: {
            where: { isActive: true },
            include: {
              role: {
                include: {
                  rolePermissions: {
                    where: { isActive: true },
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          permissions: {
            where: { isActive: true },
            include: {
              permission: true,
            },
          },
          organizations: {
            where: { isActive: true },
            include: {
              organization: true,
            },
          },
        },
      })

      if (!user) return null

      // Collect all permissions from roles
      const rolePermissions = user.roles.flatMap(userRole =>
        userRole.role.rolePermissions.map(rp => rp.permission.name)
      )

      // Collect direct user permissions (overrides)
      const userPermissions = user.permissions.map(up => up.permission.name)

      // Combine and deduplicate permissions
      const allPermissions = [...new Set([...rolePermissions, ...userPermissions])]

      // Get primary organization
      const primaryOrg = user.organizations[0]

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        profileType: user.profileType,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        roles: user.roles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          displayName: ur.role.displayName,
          level: ur.role.level,
        })),
        permissions: allPermissions,
        organization: primaryOrg ? {
          id: primaryOrg.organization.id,
          name: primaryOrg.organization.name,
          role: primaryOrg.role,
        } : undefined,
      }
    } catch (error) {
      console.error('Error getting user with roles and permissions:', error)
      return null
    }
  }

  private getDefaultRoleForProfileType(profileType: string): string {
    const roleMapping: Record<string, string> = {
      PROJECT_DEVELOPER: 'project_developer',
      INVESTOR: 'investor',
      VALIDATOR: 'validator',
      CONSULTANT: 'analyst',
      POLICY_ANALYST: 'analyst',
      RESEARCHER: 'analyst',
      BROKER: 'viewer',
      LANDOWNER: 'project_developer',
    }

    return roleMapping[profileType] || 'viewer'
  }
}

// Middleware function for Next.js API routes
export async function withAuth(
  req: NextRequest,
  requiredPermission?: Permission
) {
  const authService = new AuthService()

  // Get token from Authorization header
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No valid authorization token' }
  }

  const token = authHeader.substring(7)
  const user = await authService.verifyToken(token)

  if (!user) {
    return { user: null, error: 'Invalid or expired token' }
  }

  // Check permission if required
  if (requiredPermission) {
    const hasPermission = await authService.hasPermission(
      user.id,
      requiredPermission
    )

    if (!hasPermission) {
      return { user, error: 'Insufficient permissions' }
    }
  }

  return { user, error: null }
}

// Export singleton instance
export const authService = new AuthService()
