import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth/rbac'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profileType: z.enum([
    'LANDOWNER',
    'INVESTOR',
    'POLICY_ANALYST',
    'PROJECT_DEVELOPER',
    'CONSULTANT',
    'VALIDATOR',
    'BROKER',
    'RESEARCHER'
  ]),
  organization: z.string().optional(),
  country: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Register user
    const result = await authService.register(validatedData)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Set HTTP-only cookie for token
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Registration successful'
    })

    if (result.token) {
      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })
    }

    return response
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
