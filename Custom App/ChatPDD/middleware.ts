import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/project',
  '/risks',
  '/admin',
  '/api/projects',
  '/api/risks',
  '/api/methodologies',
  '/api/users',
  '/api/monitoring',
  '/api/milestones',
]

// Routes that require specific roles
const roleProtectedRoutes: Record<string, string[]> = {
  '/admin': ['super_admin', 'admin'],
  '/api/admin': ['super_admin', 'admin'],
  '/api/users': ['super_admin', 'admin'],
  '/project/validate': ['validator', 'admin', 'super_admin'],
  '/api/projects/validate': ['validator', 'admin', 'super_admin'],
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/methodologies',
  '/api/health',
  '/api/public',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))

  if (!requiresAuth) {
    return NextResponse.next()
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production'
    const decoded = verify(token, secret) as any

    if (!decoded.userId) {
      throw new Error('Invalid token')
    }

    // Add user ID to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)

    // For now, we'll skip role checking in middleware
    // Role checking will be done in individual API routes
    // This is because we need database access to check user roles

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Token verification failed:', error)

    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
