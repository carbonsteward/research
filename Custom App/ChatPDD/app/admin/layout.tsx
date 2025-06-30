'use client'

import React from 'react'
import { withAuth } from '@/components/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Users,
  Settings,
  Database,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import { UserProfile } from '@/components/auth/user-profile'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin } = useAuth()

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have administrator privileges to access this page.
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-gray-600">
                    System administration and management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                System Healthy
              </Badge>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link
              href="/admin"
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent hover:border-purple-600 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Role Management</span>
            </Link>
            <Link
              href="/admin/data"
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent hover:border-purple-600 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Data Management</span>
            </Link>
            <Link
              href="/admin/monitoring"
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent hover:border-purple-600 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Activity className="h-4 w-4" />
              <span>System Monitoring</span>
            </Link>
            <Link
              href="/admin/validation"
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent hover:border-purple-600 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Project Validation</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent hover:border-purple-600 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default withAuth(AdminLayout)
