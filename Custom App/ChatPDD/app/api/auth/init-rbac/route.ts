import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    // Only allow initialization in development or with admin token
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const adminSecret = process.env.ADMIN_SECRET

      if (!authHeader || !adminSecret || authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Initialize RBAC system
    await authService.initializeRBAC()

    return NextResponse.json({
      success: true,
      message: 'RBAC system initialized successfully'
    })
  } catch (error) {
    console.error('RBAC initialization error:', error)

    return NextResponse.json(
      { error: 'Failed to initialize RBAC system' },
      { status: 500 }
    )
  }
}
