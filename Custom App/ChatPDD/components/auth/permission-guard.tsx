'use client'

import React, { ReactNode } from 'react'
import { useAuth } from './auth-context'

interface PermissionGuardProps {
  children: ReactNode
  resource?: string
  action?: string
  scope?: string
  role?: string
  fallback?: ReactNode
  requireAll?: boolean // If true, all conditions must be met
}

export function PermissionGuard({
  children,
  resource,
  action,
  scope,
  role,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const { user, hasPermission, hasRole } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  const conditions: boolean[] = []

  // Check permission if specified
  if (resource && action) {
    conditions.push(hasPermission(resource, action, scope))
  }

  // Check role if specified
  if (role) {
    conditions.push(hasRole(role))
  }

  // If no conditions specified, just check if user is authenticated
  if (conditions.length === 0) {
    return <>{children}</>
  }

  // Apply logic based on requireAll flag
  const hasAccess = requireAll
    ? conditions.every(condition => condition)
    : conditions.some(condition => condition)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common permission patterns
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ProjectDeveloperOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="project_developer" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ValidatorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="validator" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function InvestorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="investor" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// Permission-based guards
export function CanCreateProject({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="project" action="create" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function CanValidateProject({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="project" action="validate" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function CanManageUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="user" action="update" scope="organization" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function CanViewReports({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard resource="report" action="read" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}
