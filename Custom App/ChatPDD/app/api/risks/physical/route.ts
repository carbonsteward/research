import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabasePerformance } from '@/lib/db-performance'

// Physical risk data search parameters
const physicalRiskParamsSchema = z.object({
  countryCode: z.string().min(2, 'Country code is required'),
  regionCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  scenarios: z.string().transform(val => val ? val.split(',').filter(s => s.trim()) : []).optional(),
  variables: z.string().transform(val => val ? val.split(',').filter(v => v.trim()) : []).optional(),
  timeHorizon: z.string().optional(),
  minConfidence: z.string().transform(val => parseFloat(val) || 0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = physicalRiskParamsSchema.parse({
      countryCode: searchParams.get('countryCode'),
      regionCode: searchParams.get('regionCode'),
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      scenarios: searchParams.get('scenarios'),
      variables: searchParams.get('variables'),
      timeHorizon: searchParams.get('timeHorizon'),
      minConfidence: searchParams.get('minConfidence'),
    })

    // Get physical risk data using optimized query
    let riskData = await DatabasePerformance.getRiskDataForLocation({
      countryCode: params.countryCode,
      regionCode: params.regionCode,
      latitude: params.latitude,
      longitude: params.longitude,
      scenarios: params.scenarios,
      variables: params.variables,
    })

    // Apply additional filters
    if (params.timeHorizon) {
      riskData = riskData.filter(data =>
        data.scenario.timeHorizon === params.timeHorizon
      )
    }

    if (params.minConfidence) {
      riskData = riskData.filter(data =>
        parseFloat(data.confidence.toString()) >= params.minConfidence!
      )
    }

    // Group and analyze the data
    const analysis = {
      summary: {
        totalDataPoints: riskData.length,
        scenarios: [...new Set(riskData.map(d => d.scenario.name))],
        variables: [...new Set(riskData.map(d => d.variable.name))],
        timeHorizons: [...new Set(riskData.map(d => d.scenario.timeHorizon))],
        averageConfidence: riskData.length > 0
          ? Math.round((riskData.reduce((sum, d) => sum + parseFloat(d.confidence.toString()), 0) / riskData.length) * 100) / 100
          : 0,
      },

      byVariable: riskData.reduce((acc, data) => {
        const variable = data.variable.name
        if (!acc[variable]) {
          acc[variable] = {
            category: data.variable.category,
            unit: data.variable.unit,
            dataPoints: [],
          }
        }
        acc[variable].dataPoints.push({
          scenario: data.scenario.name,
          timeHorizon: data.scenario.timeHorizon,
          value: data.value,
          confidence: data.confidence,
          timePeriod: data.timePeriod,
        })
        return acc
      }, {} as any),

      byScenario: riskData.reduce((acc, data) => {
        const scenario = data.scenario.name
        if (!acc[scenario]) {
          acc[scenario] = {
            description: data.scenario.description,
            timeHorizon: data.scenario.timeHorizon,
            ssp: data.scenario.ssp,
            rcp: data.scenario.rcp,
            variables: [],
          }
        }
        acc[scenario].variables.push({
          name: data.variable.name,
          category: data.variable.category,
          value: data.value,
          unit: data.variable.unit,
          confidence: data.confidence,
        })
        return acc
      }, {} as any),

      riskLevels: {
        temperature: riskData
          .filter(d => d.variable.category === 'temperature')
          .map(d => ({
            scenario: d.scenario.name,
            value: parseFloat(d.value),
            level: parseFloat(d.value) < 1.5 ? 'LOW' :
                   parseFloat(d.value) < 2.0 ? 'MEDIUM' :
                   parseFloat(d.value) < 3.0 ? 'HIGH' : 'CRITICAL',
          })),

        precipitation: riskData
          .filter(d => d.variable.category === 'precipitation')
          .map(d => ({
            scenario: d.scenario.name,
            value: parseFloat(d.value),
            level: Math.abs(parseFloat(d.value)) < 10 ? 'LOW' :
                   Math.abs(parseFloat(d.value)) < 20 ? 'MEDIUM' :
                   Math.abs(parseFloat(d.value)) < 30 ? 'HIGH' : 'CRITICAL',
          })),
      },
    }

    return NextResponse.json({
      success: true,
      data: riskData,
      analysis,
      location: {
        countryCode: params.countryCode,
        regionCode: params.regionCode,
        coordinates: params.latitude && params.longitude
          ? `${params.latitude},${params.longitude}`
          : null,
      },
    })

  } catch (error) {
    console.error('Physical risk data error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid risk data parameters',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}
