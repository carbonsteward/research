/**
 * Carbon Verification Calculator API
 * Enhanced version of Isometric's monthly verification model
 */

import { NextRequest, NextResponse } from 'next/server'
import { carbonVerificationCalculator, VerificationInputs } from '@/services/carbon-verification-calculator'
import { logger } from '@/utils/logger'
import { z } from 'zod'

// Validation schema for verification inputs
const VerificationInputsSchema = z.object({
  projectName: z.string().min(1).max(200),
  projectType: z.enum(['biochar', 'reforestation', 'soil_carbon', 'dac', 'beccs', 'other']),
  annualTonnes: z.number().min(1).max(10000000),
  pricePerTonne: z.number().min(1).max(1000),
  variableCostPerTonne: z.number().min(0).max(1000),
  annualFixedCosts: z.number().min(0).max(100000000),
  costOfFinancing: z.number().min(0).max(1),
  verificationFrequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']),
  projectStartDate: z.string().transform((str) => new Date(str)),
  projectDuration: z.number().min(1).max(50),
  carbonPriceGrowth: z.number().min(-0.5).max(0.5).optional(),
  operationalRamp: z.array(z.number().min(0).max(2)).optional(),
  seasonalityFactors: z.array(z.number().min(0).max(3)).length(12).optional(),
  discountRate: z.number().min(0).max(1).optional()
})

// POST /api/carbon-verification/calculate - Calculate verification financial model
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Validate inputs
    const validation = VerificationInputsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input parameters',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const inputs: VerificationInputs = validation.data

    logger.info('Carbon verification calculation request', {
      projectName: inputs.projectName,
      projectType: inputs.projectType,
      annualTonnes: inputs.annualTonnes,
      verificationFrequency: inputs.verificationFrequency
    })

    // Calculate financial model
    const model = await carbonVerificationCalculator.calculateProjectFinancials(inputs)

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: model,
      metadata: {
        calculationTime: `${duration}ms`,
        monthlyProjections: model.monthlyProjections.length,
        recommendedFrequency: model.comparison.recommendedFrequency,
        totalProjectValue: model.totalProjectRevenue,
        roi: `${(model.projectROI * 100).toFixed(2)}%`,
        paybackMonths: model.paybackPeriod,
        climateRiskScore: model.climateRiskScore
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Carbon verification calculation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    })

    return NextResponse.json(
      {
        error: 'Calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// GET /api/carbon-verification/calculate/defaults - Get default parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectType = searchParams.get('projectType') as any

    // Provide intelligent defaults based on project type
    const defaults: Partial<VerificationInputs> = {
      annualTonnes: 10000,
      pricePerTonne: 100,
      costOfFinancing: 0.15,
      verificationFrequency: 'monthly',
      projectDuration: 10,
      discountRate: 0.12
    }

    // Project-specific defaults
    switch (projectType) {
      case 'biochar':
        defaults.annualTonnes = 5000
        defaults.pricePerTonne = 150
        defaults.variableCostPerTonne = 80
        defaults.annualFixedCosts = 200000
        defaults.carbonPriceGrowth = 0.05
        break

      case 'reforestation':
        defaults.annualTonnes = 25000
        defaults.pricePerTonne = 80
        defaults.variableCostPerTonne = 30
        defaults.annualFixedCosts = 500000
        defaults.operationalRamp = [0.2, 0.5, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        defaults.carbonPriceGrowth = 0.03
        break

      case 'soil_carbon':
        defaults.annualTonnes = 15000
        defaults.pricePerTonne = 90
        defaults.variableCostPerTonne = 40
        defaults.annualFixedCosts = 300000
        defaults.operationalRamp = [0.3, 0.7, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        break

      case 'dac':
        defaults.annualTonnes = 1000
        defaults.pricePerTonne = 400
        defaults.variableCostPerTonne = 200
        defaults.annualFixedCosts = 2000000
        defaults.carbonPriceGrowth = 0.08
        break

      case 'beccs':
        defaults.annualTonnes = 50000
        defaults.pricePerTonne = 120
        defaults.variableCostPerTonne = 60
        defaults.annualFixedCosts = 5000000
        break

      default:
        defaults.variableCostPerTonne = 70
        defaults.annualFixedCosts = 200000
    }

    return NextResponse.json({
      success: true,
      data: defaults,
      metadata: {
        projectType: projectType || 'generic',
        availableProjectTypes: ['biochar', 'reforestation', 'soil_carbon', 'dac', 'beccs', 'other'],
        verificationFrequencies: ['monthly', 'quarterly', 'semi-annual', 'annual'],
        note: 'Default values are estimates. Adjust based on your specific project parameters.'
      }
    })

  } catch (error) {
    logger.error('Failed to get default parameters', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to get defaults',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
