/**
 * AI Services for GeoSpy Location Intelligence
 * Integrates OpenAI Vision API and Google Maps for real coordinate detection
 */

import OpenAI from 'openai'

// Types for AI service responses
export interface LocationDetectionResult {
  coordinates: {
    lat: number
    lng: number
  }
  confidence: number
  locationName?: string
  landmarks: string[]
  description?: string
  error?: string
}

export interface ProcessingStatus {
  isProcessing: boolean
  stage: 'analyzing' | 'geocoding' | 'validating' | 'complete' | 'error'
  progress: number
  message: string
}

// Initialize OpenAI client lazily to avoid build-time errors
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

/**
 * Analyze image using OpenAI Vision API to detect location clues
 */
export async function analyzeImageForLocation(
  imageBase64: string,
  mimeType: string
): Promise<LocationDetectionResult> {
  try {
    // Validate image
    if (!isValidImageFormat(mimeType)) {
      throw new Error(`Unsupported image format: ${mimeType}`)
    }

    if (!isValidImageSize(imageBase64)) {
      throw new Error('Image size exceeds maximum limit (10MB)')
    }

    // Create analysis prompt
    const prompt = createLocationAnalysisPrompt()

    // Call OpenAI Vision API
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Lower temperature for more consistent results
    })

    // Parse AI response
    const aiAnalysis = response.choices[0]?.message?.content
    if (!aiAnalysis) {
      throw new Error('No analysis received from AI service')
    }

    // Extract structured data from AI response
    const locationData = parseAIResponse(aiAnalysis)

    // Validate and geocode the detected location
    const geocodedResult = await geocodeLocation(locationData)

    return geocodedResult

  } catch (error) {
    console.error('Image analysis error:', error)
    return {
      coordinates: { lat: 0, lng: 0 },
      confidence: 0,
      landmarks: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create optimized prompt for location detection
 */
function createLocationAnalysisPrompt(): string {
  return `
You are a world-class geographic analyst specializing in location identification from photographs. Analyze this image and provide location information in the following JSON format:

{
  "estimated_coordinates": {
    "lat": number,
    "lng": number
  },
  "confidence": number (0-1),
  "location_name": "string",
  "landmarks": ["array", "of", "visible", "landmarks"],
  "geographic_clues": ["array", "of", "observable", "clues"],
  "reasoning": "detailed explanation of analysis"
}

Focus on:
1. **Architectural styles** and building characteristics
2. **Natural landmarks** (mountains, rivers, coastlines)
3. **Infrastructure** (road signs, license plates, architecture)
4. **Vegetation and climate** indicators
5. **Cultural markers** (language, signage, customs)
6. **Urban planning** patterns and city layout

Provide your best estimate even if confidence is low. Be specific about reasoning and observable details that led to your conclusion.

Return ONLY the JSON object, no additional text.
  `.trim()
}

/**
 * Parse AI response and extract location data
 */
function parseAIResponse(aiResponse: string): LocationDetectionResult {
  try {
    // Clean the response (remove any markdown formatting)
    const cleanedResponse = aiResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleanedResponse)

    return {
      coordinates: {
        lat: parsed.estimated_coordinates?.lat || 0,
        lng: parsed.estimated_coordinates?.lng || 0
      },
      confidence: Math.round((parsed.confidence || 0) * 100),
      locationName: parsed.location_name || 'Unknown Location',
      landmarks: parsed.landmarks || [],
      description: parsed.reasoning || 'No description provided'
    }

  } catch (error) {
    console.error('Failed to parse AI response:', error)

    // Fallback: try to extract information using regex
    return extractLocationFromText(aiResponse)
  }
}

/**
 * Fallback method to extract location data from text response
 */
function extractLocationFromText(text: string): LocationDetectionResult {
  // Simple regex patterns to extract coordinates and location names
  const latMatch = text.match(/lat(?:itude)?[:\s]+(-?\d+\.?\d*)/i)
  const lngMatch = text.match(/lng|lon(?:gitude)?[:\s]+(-?\d+\.?\d*)/i)
  const confidenceMatch = text.match(/confidence[:\s]+(\d+\.?\d*)/i)

  return {
    coordinates: {
      lat: latMatch ? parseFloat(latMatch[1]) : 0,
      lng: lngMatch ? parseFloat(lngMatch[1]) : 0
    },
    confidence: confidenceMatch ? Math.round(parseFloat(confidenceMatch[1]) * 100) : 50,
    locationName: 'Extracted from analysis',
    landmarks: [],
    description: text.substring(0, 200) + '...'
  }
}

/**
 * Geocode and validate location using Google Maps API
 */
export async function geocodeLocation(
  locationData: LocationDetectionResult
): Promise<LocationDetectionResult> {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, skipping geocoding')
      return locationData
    }

    // Reverse geocode the coordinates to get verified location name
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${locationData.coordinates.lat},${locationData.coordinates.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`

    const response = await fetch(geocodeUrl)
    const geocodeResult = await response.json()

    if (geocodeResult.status === 'OK' && geocodeResult.results.length > 0) {
      const result = geocodeResult.results[0]

      // Extract more accurate location name
      const addressComponents = result.address_components
      const locality = findAddressComponent(addressComponents, 'locality')
      const country = findAddressComponent(addressComponents, 'country')
      const adminArea = findAddressComponent(addressComponents, 'administrative_area_level_1')

      const verifiedLocationName = [locality, adminArea, country]
        .filter(Boolean)
        .join(', ')

      return {
        ...locationData,
        locationName: verifiedLocationName || locationData.locationName,
        // Boost confidence if geocoding validates the location
        confidence: Math.min(locationData.confidence + 10, 100)
      }
    }

    return locationData

  } catch (error) {
    console.error('Geocoding error:', error)
    return locationData // Return original data if geocoding fails
  }
}

/**
 * Helper function to find address component by type
 */
function findAddressComponent(components: any[], type: string): string | null {
  const component = components.find(comp => comp.types.includes(type))
  return component?.long_name || null
}

/**
 * Validate image format
 */
function isValidImageFormat(mimeType: string): boolean {
  const supportedFormats = process.env.GEOSPY_SUPPORTED_FORMATS?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  return supportedFormats.includes(mimeType)
}

/**
 * Validate image size (base64 string length approximates file size)
 */
function isValidImageSize(base64String: string): boolean {
  const maxSize = parseInt(process.env.GEOSPY_MAX_IMAGE_SIZE || '10485760') // 10MB
  const approximateSize = (base64String.length * 3) / 4 // Convert base64 length to bytes

  return approximateSize <= maxSize
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const hourInMs = 60 * 60 * 1000
  const maxRequestsPerHour = parseInt(process.env.GEOSPY_RATE_LIMIT_PER_HOUR || '100')

  const userLimit = rateLimitStore.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + hourInMs
    })
    return { allowed: true, remaining: maxRequestsPerHour - 1 }
  }

  if (userLimit.count >= maxRequestsPerHour) {
    return { allowed: false, remaining: 0 }
  }

  userLimit.count++
  return { allowed: true, remaining: maxRequestsPerHour - userLimit.count }
}

/**
 * Clean up old rate limit entries
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [userId, limit] of rateLimitStore.entries()) {
    if (now > limit.resetTime) {
      rateLimitStore.delete(userId)
    }
  }
}

// Clean up rate limit store every hour
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000)
}
