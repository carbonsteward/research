import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// User profile search parameters
const searchParamsSchema = z.object({
  profileType: z.enum(['LANDOWNER', 'INVESTOR', 'POLICY_ANALYST', 'PROJECT_DEVELOPER', 'CONSULTANT', 'VALIDATOR', 'BROKER', 'RESEARCHER']).optional(),
  country: z.string().optional(),
  organization: z.string().optional(),
  query: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = searchParamsSchema.parse({
      profileType: searchParams.get('profileType'),
      country: searchParams.get('country'),
      organization: searchParams.get('organization'),
      query: searchParams.get('query'),
    })

    const where: any = {}

    if (params.profileType) where.profileType = params.profileType
    if (params.country) where.country = params.country
    if (params.organization) where.organization = { contains: params.organization, mode: 'insensitive' }

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { email: { contains: params.query, mode: 'insensitive' } },
        { organization: { contains: params.query, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.userProfile.findMany({
      where,
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    })

  } catch (error) {
    console.error('Users search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// Create new user profile
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  profileType: z.enum(['LANDOWNER', 'INVESTOR', 'POLICY_ANALYST', 'PROJECT_DEVELOPER', 'CONSULTANT', 'VALIDATOR', 'BROKER', 'RESEARCHER']),
  organization: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  preferences: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check for duplicate email
    const existingUser = await prisma.userProfile.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists',
      }, { status: 409 })
    }

    // Create user profile
    const user = await prisma.userProfile.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 201 })

  } catch (error) {
    console.error('User creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user data',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
