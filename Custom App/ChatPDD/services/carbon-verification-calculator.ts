/**
 * Enhanced Carbon Verification Calculator Service
 * Builds upon Isometric's monthly verification model with additional features
 * Integrates with ChatPDD's existing climate risk and project management
 */

import { logger } from '@/utils/logger'
import { prisma } from '@/lib/prisma'

export interface VerificationInputs {
  // Project basics
  projectName: string
  projectType: 'biochar' | 'reforestation' | 'soil_carbon' | 'dac' | 'beccs' | 'other'

  // Production parameters
  annualTonnes: number
  pricePerTonne: number

  // Cost structure
  variableCostPerTonne: number
  annualFixedCosts: number

  // Financial parameters
  costOfFinancing: number // Annual percentage

  // Verification timing
  verificationFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'

  // Project timeline
  projectStartDate: Date
  projectDuration: number // Years

  // Advanced parameters
  carbonPriceGrowth?: number // Annual growth rate
  operationalRamp?: number[] // Percentage of capacity by year
  seasonalityFactors?: number[] // Monthly factors (12 values)
  discountRate?: number // For NPV calculations
}

export interface MonthlyProjection {
  month: number
  period: string // 'Jan 2024', etc.

  // Production
  tonnageDelivered: number
  pricePerTonne: number
  grossRevenue: number

  // Costs
  variableCosts: number
  fixedCosts: number
  totalCosts: number

  // Operating metrics
  operatingIncome: number
  operatingMargin: number

  // Cash flow (verification timing impact)
  revenueRecognized: number
  cashReceived: number
  cumulativeCash: number

  // Financing impact
  availableForFinancing: number
  financingCost: number
  cumulativeFinancingCost: number

  // Verification status
  verificationDue: boolean
  creditIssueDate?: Date
}

export interface VerificationScenario {
  frequency: string
  totalNPV: number
  totalFinancingCosts: number
  cashFlowAdvantage: number
  breakEvenMonth: number
  maxDebtRequired: number
  workingCapitalSavings: number
}

export interface VerificationComparison {
  scenarios: Record<string, VerificationScenario>
  recommendedFrequency: string
  keyInsights: string[]
  riskFactors: string[]
}

export interface ProjectFinancialModel {
  inputs: VerificationInputs
  monthlyProjections: MonthlyProjection[]
  comparison: VerificationComparison

  // Summary metrics
  totalProjectRevenue: number
  totalProjectCosts: number
  projectROI: number
  paybackPeriod: number

  // Climate integration
  climateRiskScore?: number
  adaptationCosts?: number
  carbonPriceRisk?: number
}

export class CarbonVerificationCalculator {
  private readonly MONTHS_PER_YEAR = 12
  private readonly DEFAULT_DISCOUNT_RATE = 0.15

  /**
   * Calculate comprehensive financial model for carbon project verification
   */
  async calculateProjectFinancials(inputs: VerificationInputs): Promise<ProjectFinancialModel> {
    try {
      logger.info('Starting carbon verification calculation', {
        projectName: inputs.projectName,
        projectType: inputs.projectType,
        annualTonnes: inputs.annualTonnes
      })

      // Generate monthly projections for each verification scenario
      const scenarios = await this.generateVerificationScenarios(inputs)

      // Create detailed monthly breakdown for selected frequency
      const monthlyProjections = await this.generateMonthlyProjections(inputs)

      // Compare scenarios and generate recommendations
      const comparison = this.compareVerificationScenarios(scenarios, inputs)

      // Calculate summary metrics
      const summaryMetrics = this.calculateSummaryMetrics(monthlyProjections, inputs)

      const model: ProjectFinancialModel = {
        inputs,
        monthlyProjections,
        comparison,
        ...summaryMetrics
      }

      // Optionally integrate with climate risk data
      if (inputs.projectType && monthlyProjections.length > 0) {
        model.climateRiskScore = await this.assessClimateFinancialRisk(inputs)
      }

      logger.info('Carbon verification calculation completed', {
        totalRevenue: model.totalProjectRevenue,
        recommendedFrequency: model.comparison.recommendedFrequency,
        climateRisk: model.climateRiskScore
      })

      return model

    } catch (error) {
      logger.error('Carbon verification calculation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectName: inputs.projectName
      })
      throw error
    }
  }

  /**
   * Generate verification scenarios for different frequencies
   */
  private async generateVerificationScenarios(inputs: VerificationInputs): Promise<Record<string, VerificationScenario>> {
    const frequencies = ['monthly', 'quarterly', 'semi-annual', 'annual'] as const
    const scenarios: Record<string, VerificationScenario> = {}

    for (const frequency of frequencies) {
      const scenarioInputs = { ...inputs, verificationFrequency: frequency }
      const projections = await this.generateMonthlyProjections(scenarioInputs)

      scenarios[frequency] = {
        frequency,
        totalNPV: this.calculateNPV(projections, inputs.discountRate || this.DEFAULT_DISCOUNT_RATE),
        totalFinancingCosts: this.sumFinancingCosts(projections),
        cashFlowAdvantage: this.calculateCashFlowAdvantage(projections, frequency),
        breakEvenMonth: this.findBreakEvenMonth(projections),
        maxDebtRequired: this.calculateMaxDebtRequired(projections),
        workingCapitalSavings: this.calculateWorkingCapitalSavings(projections, inputs)
      }
    }

    return scenarios
  }

  /**
   * Generate detailed monthly projections
   */
  private async generateMonthlyProjections(inputs: VerificationInputs): Promise<MonthlyProjection[]> {
    const projections: MonthlyProjection[] = []
    const totalMonths = inputs.projectDuration * this.MONTHS_PER_YEAR
    const monthlyTonnage = inputs.annualTonnes / this.MONTHS_PER_YEAR
    const monthlyFixedCosts = inputs.annualFixedCosts / this.MONTHS_PER_YEAR

    let cumulativeCash = 0
    let cumulativeFinancingCost = 0

    for (let month = 1; month <= totalMonths; month++) {
      const yearIndex = Math.floor((month - 1) / this.MONTHS_PER_YEAR)
      const monthIndex = (month - 1) % this.MONTHS_PER_YEAR

      // Apply operational ramp and seasonality
      const rampFactor = inputs.operationalRamp?.[yearIndex] || 1
      const seasonalityFactor = inputs.seasonalityFactors?.[monthIndex] || 1

      const tonnageDelivered = monthlyTonnage * rampFactor * seasonalityFactor

      // Calculate pricing with growth
      const yearsSinceStart = yearIndex
      const priceGrowthFactor = Math.pow(1 + (inputs.carbonPriceGrowth || 0), yearsSinceStart)
      const pricePerTonne = inputs.pricePerTonne * priceGrowthFactor

      const grossRevenue = tonnageDelivered * pricePerTonne
      const variableCosts = tonnageDelivered * inputs.variableCostPerTonne
      const fixedCosts = monthlyFixedCosts
      const totalCosts = variableCosts + fixedCosts
      const operatingIncome = grossRevenue - totalCosts

      // Determine revenue recognition based on verification frequency
      const { revenueRecognized, verificationDue, creditIssueDate } = this.determineRevenueRecognition(
        month, inputs.verificationFrequency, grossRevenue, inputs.projectStartDate
      )

      cumulativeCash += revenueRecognized

      // Calculate financing costs on accumulated cash
      const monthlyFinancingRate = inputs.costOfFinancing / this.MONTHS_PER_YEAR
      const financingCost = cumulativeCash * monthlyFinancingRate
      cumulativeFinancingCost += financingCost

      const projection: MonthlyProjection = {
        month,
        period: this.formatPeriod(inputs.projectStartDate, month),
        tonnageDelivered,
        pricePerTonne,
        grossRevenue,
        variableCosts,
        fixedCosts,
        totalCosts,
        operatingIncome,
        operatingMargin: grossRevenue > 0 ? operatingIncome / grossRevenue : 0,
        revenueRecognized,
        cashReceived: revenueRecognized,
        cumulativeCash,
        availableForFinancing: cumulativeCash,
        financingCost,
        cumulativeFinancingCost,
        verificationDue,
        creditIssueDate
      }

      projections.push(projection)
    }

    return projections
  }

  /**
   * Determine revenue recognition timing based on verification frequency
   */
  private determineRevenueRecognition(
    month: number,
    frequency: string,
    grossRevenue: number,
    startDate: Date
  ): { revenueRecognized: number; verificationDue: boolean; creditIssueDate?: Date } {
    let verificationDue = false
    let revenueRecognized = 0
    let creditIssueDate: Date | undefined

    switch (frequency) {
      case 'monthly':
        verificationDue = true
        revenueRecognized = grossRevenue
        creditIssueDate = new Date(startDate)
        creditIssueDate.setMonth(creditIssueDate.getMonth() + month)
        break

      case 'quarterly':
        if (month % 3 === 0) {
          verificationDue = true
          revenueRecognized = grossRevenue * 3 // Accumulated quarterly revenue
          creditIssueDate = new Date(startDate)
          creditIssueDate.setMonth(creditIssueDate.getMonth() + month)
        }
        break

      case 'semi-annual':
        if (month % 6 === 0) {
          verificationDue = true
          revenueRecognized = grossRevenue * 6 // Accumulated semi-annual revenue
          creditIssueDate = new Date(startDate)
          creditIssueDate.setMonth(creditIssueDate.getMonth() + month)
        }
        break

      case 'annual':
        if (month % 12 === 0) {
          verificationDue = true
          revenueRecognized = grossRevenue * 12 // Accumulated annual revenue
          creditIssueDate = new Date(startDate)
          creditIssueDate.setFullYear(creditIssueDate.getFullYear() + Math.floor(month / 12))
        }
        break
    }

    return { revenueRecognized, verificationDue, creditIssueDate }
  }

  /**
   * Compare verification scenarios and generate recommendations
   */
  private compareVerificationScenarios(
    scenarios: Record<string, VerificationScenario>,
    inputs: VerificationInputs
  ): VerificationComparison {
    const sortedScenarios = Object.entries(scenarios)
      .sort(([,a], [,b]) => b.cashFlowAdvantage - a.cashFlowAdvantage)

    const recommendedFrequency = sortedScenarios[0][0]
    const bestScenario = sortedScenarios[0][1]

    const keyInsights: string[] = []
    const riskFactors: string[] = []

    // Generate insights
    const monthlySavings = scenarios.monthly.workingCapitalSavings
    const annualCosts = scenarios.annual.totalFinancingCosts

    if (monthlySavings > annualCosts * 0.1) {
      keyInsights.push(`Monthly verification could save $${monthlySavings.toLocaleString()} in working capital costs`)
    }

    if (bestScenario.breakEvenMonth <= 6) {
      keyInsights.push(`Project reaches break-even in ${bestScenario.breakEvenMonth} months with ${recommendedFrequency} verification`)
    }

    if (bestScenario.maxDebtRequired > inputs.annualTonnes * inputs.pricePerTonne * 0.5) {
      riskFactors.push('High debt requirements may pose financing challenges')
    }

    if (inputs.projectType === 'reforestation' || inputs.projectType === 'soil_carbon') {
      riskFactors.push('Natural carbon projects face seasonal and climate-related verification risks')
    }

    return {
      scenarios,
      recommendedFrequency,
      keyInsights,
      riskFactors
    }
  }

  /**
   * Calculate summary financial metrics
   */
  private calculateSummaryMetrics(projections: MonthlyProjection[], inputs: VerificationInputs) {
    const totalProjectRevenue = projections.reduce((sum, p) => sum + p.grossRevenue, 0)
    const totalProjectCosts = projections.reduce((sum, p) => sum + p.totalCosts, 0)
    const projectROI = (totalProjectRevenue - totalProjectCosts) / totalProjectCosts

    // Find payback period
    let cumulativeIncome = 0
    let paybackPeriod = projections.length

    for (const projection of projections) {
      cumulativeIncome += projection.operatingIncome
      if (cumulativeIncome > 0) {
        paybackPeriod = projection.month
        break
      }
    }

    return {
      totalProjectRevenue,
      totalProjectCosts,
      projectROI,
      paybackPeriod
    }
  }

  /**
   * Calculate NPV of cash flows
   */
  private calculateNPV(projections: MonthlyProjection[], discountRate: number): number {
    return projections.reduce((npv, projection, index) => {
      const monthlyDiscount = Math.pow(1 + discountRate, index / 12)
      return npv + (projection.operatingIncome / monthlyDiscount)
    }, 0)
  }

  /**
   * Sum total financing costs
   */
  private sumFinancingCosts(projections: MonthlyProjection[]): number {
    return projections.reduce((sum, p) => sum + p.financingCost, 0)
  }

  /**
   * Calculate cash flow advantage of frequent verification
   */
  private calculateCashFlowAdvantage(projections: MonthlyProjection[], frequency: string): number {
    // Compare to annual verification baseline
    const totalFinancingCosts = this.sumFinancingCosts(projections)
    const baselineAnnualCosts = projections.length * 1000 // Simplified baseline

    return Math.max(0, baselineAnnualCosts - totalFinancingCosts)
  }

  /**
   * Find month when cumulative cash flow turns positive
   */
  private findBreakEvenMonth(projections: MonthlyProjection[]): number {
    for (const projection of projections) {
      if (projection.cumulativeCash > 0) {
        return projection.month
      }
    }
    return projections.length
  }

  /**
   * Calculate maximum debt required
   */
  private calculateMaxDebtRequired(projections: MonthlyProjection[]): number {
    return Math.max(...projections.map(p => Math.max(0, -p.cumulativeCash)))
  }

  /**
   * Calculate working capital savings
   */
  private calculateWorkingCapitalSavings(projections: MonthlyProjection[], inputs: VerificationInputs): number {
    const totalFinancingCosts = this.sumFinancingCosts(projections)
    const totalRevenue = projections.reduce((sum, p) => sum + p.grossRevenue, 0)

    return totalRevenue * 0.02 - totalFinancingCosts // Simplified calculation
  }

  /**
   * Format period string
   */
  private formatPeriod(startDate: Date, monthOffset: number): string {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + monthOffset - 1)

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  /**
   * Assess climate-related financial risks
   */
  private async assessClimateFinancialRisk(inputs: VerificationInputs): Promise<number> {
    try {
      // This could integrate with our existing climate risk orchestrator
      // For now, return a simplified risk score based on project type
      const riskScores = {
        'biochar': 0.2,
        'reforestation': 0.7,
        'soil_carbon': 0.6,
        'dac': 0.3,
        'beccs': 0.4,
        'other': 0.5
      }

      return riskScores[inputs.projectType] || 0.5

    } catch (error) {
      logger.warn('Climate risk assessment failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return 0.5 // Default moderate risk
    }
  }

  /**
   * Save calculation results to database
   */
  async saveCalculationResults(model: ProjectFinancialModel, userId: string): Promise<string> {
    try {
      const savedModel = await prisma.carbonVerificationModel.create({
        data: {
          userId,
          projectName: model.inputs.projectName,
          projectType: model.inputs.projectType,
          inputs: model.inputs as any,
          monthlyProjections: model.monthlyProjections as any,
          comparison: model.comparison as any,
          totalProjectRevenue: model.totalProjectRevenue,
          totalProjectCosts: model.totalProjectCosts,
          projectROI: model.projectROI,
          paybackPeriod: model.paybackPeriod,
          climateRiskScore: model.climateRiskScore,
          createdAt: new Date()
        }
      })

      logger.info('Carbon verification model saved', {
        modelId: savedModel.id,
        projectName: model.inputs.projectName
      })

      return savedModel.id

    } catch (error) {
      logger.error('Failed to save carbon verification model', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectName: model.inputs.projectName
      })
      throw error
    }
  }

  /**
   * Load saved calculation results
   */
  async loadCalculationResults(modelId: string): Promise<ProjectFinancialModel | null> {
    try {
      const savedModel = await prisma.carbonVerificationModel.findUnique({
        where: { id: modelId }
      })

      if (!savedModel) {
        return null
      }

      return {
        inputs: savedModel.inputs as VerificationInputs,
        monthlyProjections: savedModel.monthlyProjections as MonthlyProjection[],
        comparison: savedModel.comparison as VerificationComparison,
        totalProjectRevenue: savedModel.totalProjectRevenue,
        totalProjectCosts: savedModel.totalProjectCosts,
        projectROI: savedModel.projectROI,
        paybackPeriod: savedModel.paybackPeriod,
        climateRiskScore: savedModel.climateRiskScore || undefined
      }

    } catch (error) {
      logger.error('Failed to load carbon verification model', {
        error: error instanceof Error ? error.message : 'Unknown error',
        modelId
      })
      return null
    }
  }
}

// Export singleton instance
export const carbonVerificationCalculator = new CarbonVerificationCalculator()
