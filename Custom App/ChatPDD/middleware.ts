import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
  '/carbon-verification',
  '/dashboard',
  '/api/health',
  '/api/public',
  '/api/carbon-verification',
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

  // Authentication disabled - allow all requests
  return NextResponse.next()
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
