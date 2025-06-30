'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

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

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    name: string
    email: string
    password: string
    profileType: string
    organization?: string
    country?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  hasPermission: (resource: string, action: string, scope?: string) => boolean
  hasRole: (roleName: string) => boolean
  isAdmin: () => boolean
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Authentication disabled - set default demo user
  useEffect(() => {
    // Set a demo user for testing purposes
    setUser({
      id: 'demo-user-1',
      email: 'demo@chatpdd.com',
      name: 'Demo User',
      profileType: 'project_developer',
      isActive: true,
      emailVerified: true,
      roles: [
        {
          id: 'user-role',
          name: 'user',
          displayName: 'User',
          level: 1
        }
      ],
      permissions: ['*:*']
    })
    setLoading(false)
  }, [])

  const fetchUser = async () => {
    // Authentication disabled
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (registerData: {
    name: string
    email: string
    password: string
    profileType: string
    organization?: string
    country?: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!user) return false

    // Super admin has all permissions
    if (user.roles.some(role => role.name === 'super_admin')) {
      return true
    }

    // Check exact permission
    const permissionString = `${resource}:${action}${scope ? `:${scope}` : ''}`
    if (user.permissions.includes(permissionString)) {
      return true
    }

    // Check wildcard permissions
    const wildcardPermissions = [
      `${resource}:*${scope ? `:${scope}` : ''}`,
      `*:${action}${scope ? `:${scope}` : ''}`,
      `*:*${scope ? `:${scope}` : ''}`,
    ]

    return wildcardPermissions.some(wildcardPermission =>
      user.permissions.includes(wildcardPermission)
    )
  }

  const hasRole = (roleName: string): boolean => {
    if (!user) return false
    return user.roles.some(role => role.name === roleName)
  }

  const isAdmin = (): boolean => {
    return hasRole('super_admin') || hasRole('admin')
  }

  const refetchUser = async () => {
    await fetchUser()
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    refetchUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: string
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please log in to access this page.
            </p>
            <a
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      )
    }

    if (requiredRole && !user.roles.some(role => role.name === requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}
