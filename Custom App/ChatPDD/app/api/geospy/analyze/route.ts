import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageForLocation, checkRateLimit } from '@/lib/ai-services'
import { z } from 'zod'

// Request validation schema
const AnalyzeImageSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/, 'Invalid image format'),
  userId: z.string().optional().default('anonymous')
})

// Response type
interface AnalyzeResponse {
  success: boolean
  data?: {
    coordinates: { lat: number; lng: number }
    confidence: number
    locationName?: string
    landmarks: string[]
    description?: string
    processingTime: number
  }
  error?: string
  rateLimitInfo?: {
    remaining: number
    resetTime?: number
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  const startTime = Date.now()

  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = AnalyzeImageSchema.parse(body)

    // Check rate limiting
    const rateLimit = checkRateLimit(validatedData.userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimitInfo: {
          remaining: rateLimit.remaining
        }
      }, { status: 429 })
    }

    // Check if AI services are configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'AI services not configured. Please contact administrator.'
      }, { status: 503 })
    }

    // Remove data URL prefix if present (data:image/jpeg;base64,)
    const base64Data = validatedData.image.includes(',')
      ? validatedData.image.split(',')[1]
      : validatedData.image

    // Analyze image using AI services
    const result = await analyzeImageForLocation(base64Data, validatedData.mimeType)

    const processingTime = Date.now() - startTime

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
        rateLimitInfo: {
          remaining: rateLimit.remaining
        }
      }, { status: 400 })
    }

    // Check confidence threshold
    const confidenceThreshold = parseFloat(process.env.GEOSPY_CONFIDENCE_THRESHOLD || '0.7') * 100

    if (result.confidence < confidenceThreshold) {
      console.warn(`Low confidence result: ${result.confidence}% (threshold: ${confidenceThreshold}%)`)
    }

    return NextResponse.json({
      success: true,
      data: {
        coordinates: result.coordinates,
        confidence: result.confidence,
        locationName: result.locationName,
        landmarks: result.landmarks,
        description: result.description,
        processingTime
      },
      rateLimitInfo: {
        remaining: rateLimit.remaining
      }
    })

  } catch (error) {
    console.error('GeoSpy API Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error occurred during image analysis'
    }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Health check endpoint
export async function GET(request: NextRequest): Promise<NextResponse> {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      googleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
    },
    configuration: {
      maxImageSize: process.env.GEOSPY_MAX_IMAGE_SIZE || '10485760',
      supportedFormats: process.env.GEOSPY_SUPPORTED_FORMATS || 'image/jpeg,image/png,image/webp',
      confidenceThreshold: process.env.GEOSPY_CONFIDENCE_THRESHOLD || '0.7',
      rateLimit: process.env.GEOSPY_RATE_LIMIT_PER_HOUR || '100'
    }
  }

  return NextResponse.json(healthCheck)
}
