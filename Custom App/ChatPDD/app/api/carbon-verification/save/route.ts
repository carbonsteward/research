/**
 * Carbon Verification Model Save/Load API
 * Allows users to save and retrieve their verification calculations
 */

import { NextRequest, NextResponse } from 'next/server'
import { carbonVerificationCalculator } from '@/services/carbon-verification-calculator'
import { logger } from '@/utils/logger'
import { z } from 'zod'

// Schema for save request
const SaveModelSchema = z.object({
  model: z.object({
    inputs: z.any(),
    monthlyProjections: z.any(),
    comparison: z.any(),
    totalProjectRevenue: z.number(),
    totalProjectCosts: z.number(),
    projectROI: z.number(),
    paybackPeriod: z.number(),
    climateRiskScore: z.number().optional()
  }),
  userId: z.string().uuid().optional().default('demo-user-1'), // Default for demo mode
  tags: z.array(z.string()).optional(),
  description: z.string().optional()
})

// POST /api/carbon-verification/save - Save verification model
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = SaveModelSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid save request',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const { model, userId, tags, description } = validation.data

    logger.info('Saving carbon verification model', {
      projectName: model.inputs.projectName,
      userId,
      totalRevenue: model.totalProjectRevenue
    })

    // Save the model
    const modelId = await carbonVerificationCalculator.saveCalculationResults(model, userId)

    return NextResponse.json({
      success: true,
      data: {
        modelId,
        projectName: model.inputs.projectName,
        savedAt: new Date().toISOString()
      },
      metadata: {
        message: 'Carbon verification model saved successfully'
      }
    })

  } catch (error) {
    logger.error('Failed to save carbon verification model', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Save failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// GET /api/carbon-verification/save?modelId=xyz - Load saved model
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json(
        {
          error: 'Missing model ID',
          message: 'Please provide a valid model ID to load'
        },
        { status: 400 }
      )
    }

    logger.info('Loading carbon verification model', { modelId })

    // Load the model
    const model = await carbonVerificationCalculator.loadCalculationResults(modelId)

    if (!model) {
      return NextResponse.json(
        {
          error: 'Model not found',
          message: 'The requested verification model could not be found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: model,
      metadata: {
        modelId,
        projectName: model.inputs.projectName,
        loadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Failed to load carbon verification model', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Load failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
