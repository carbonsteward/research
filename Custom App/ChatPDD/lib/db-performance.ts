import { prisma } from './prisma'

/**
 * Database Performance Utilities for ChatPDD
 * Optimizes queries for methodology search and risk assessment
 */

export class DatabasePerformance {
  /**
   * Optimized methodology search with full-text search capabilities
   */
  static async searchMethodologies(params: {
    query?: string
    standardId?: string
    category?: string
    type?: string
    itmoAcceptance?: boolean
    limit?: number
    offset?: number
  }) {
    const {
      query,
      standardId,
      category,
      type,
      itmoAcceptance,
      limit = 20,
      offset = 0,
    } = params

    // Build dynamic where clause
    const where: any = {}

    if (standardId) where.standardId = standardId
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (type) where.type = { contains: type, mode: 'insensitive' }
    if (itmoAcceptance !== undefined) where.itmoAcceptance = itmoAcceptance

    // Add text search if query provided
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const [methodologies, total] = await Promise.all([
      prisma.methodology.findMany({
        where,
        include: {
          standard: {
            select: {
              id: true,
              name: true,
              abbreviation: true,
              organizationType: true,
              geographicScope: true,
            },
          },
          _count: {
            select: {
              pddRequirements: true,
              projects: true,
            },
          },
        },
        orderBy: [
          { name: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.methodology.count({ where }),
    ])

    return {
      data: methodologies,
      total,
      hasMore: offset + limit < total,
      nextOffset: offset + limit < total ? offset + limit : null,
    }
  }

  /**
   * Optimized carbon standards lookup with methodology counts
   */
  static async getCarbonStandardsWithStats() {
    return prisma.carbonStandard.findMany({
      include: {
        _count: {
          select: {
            methodologies: true,
            pddRequirements: true,
            certificationProcess: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
    })
  }

  /**
   * Geographic risk assessment query optimization
   */
  static async getRiskDataForLocation(params: {
    countryCode: string
    regionCode?: string
    latitude?: string
    longitude?: string
    scenarios?: string[]
    variables?: string[]
  }) {
    const {
      countryCode,
      regionCode,
      latitude,
      longitude,
      scenarios,
      variables,
    } = params

    const where: any = {
      countryCode,
    }

    if (regionCode) where.regionCode = regionCode
    if (latitude && longitude) {
      where.latitude = latitude
      where.longitude = longitude
    }

    if (scenarios && scenarios.length > 0) {
      where.scenario = {
        name: { in: scenarios },
      }
    }

    if (variables && variables.length > 0) {
      where.variable = {
        name: { in: variables },
      }
    }

    return prisma.physicalRiskData.findMany({
      where,
      include: {
        scenario: {
          select: {
            name: true,
            description: true,
            timeHorizon: true,
            ssp: true,
            rcp: true,
          },
        },
        variable: {
          select: {
            name: true,
            description: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: [
        { scenario: { timeHorizon: 'asc' } },
        { variable: { category: 'asc' } },
        { confidence: 'desc' },
      ],
    })
  }

  /**
   * Cached methodology recommendations based on project profile
   */
  static async getMethodologyRecommendations(params: {
    projectType: string
    country: string
    region?: string
    itmoRequired?: boolean
  }) {
    const { projectType, country, region, itmoRequired } = params

    // Build category mapping for project types
    const categoryMapping: Record<string, string[]> = {
      AFOLU: ['Agriculture, Forestry and Other Land Use', 'Forestry', 'Agriculture'],
      ENERGY: ['Energy', 'Renewable Energy', 'Energy Efficiency'],
      TRANSPORT: ['Transport', 'Transportation'],
      MANUFACTURING: ['Manufacturing', 'Industrial'],
      WASTE: ['Waste', 'Waste Management'],
      BUILDINGS: ['Buildings', 'Construction'],
    }

    const relevantCategories = categoryMapping[projectType] || [projectType]

    const where: any = {
      OR: relevantCategories.map(cat => ({
        category: { contains: cat, mode: 'insensitive' }
      })),
    }

    if (itmoRequired) {
      where.itmoAcceptance = true
    }

    return prisma.methodology.findMany({
      where,
      include: {
        standard: {
          select: {
            name: true,
            abbreviation: true,
            geographicScope: true,
            organizationType: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: [
        { _count: { projects: 'desc' } }, // Most used methodologies first
        { name: 'asc' },
      ],
      take: 10,
    })
  }

  /**
   * Policy search optimization for regulatory landscape
   */
  static async searchPolicies(params: {
    countryCode?: string
    regionCode?: string
    policyType?: string
    sectors?: string[]
    effectiveAfter?: Date
    query?: string
    limit?: number
    offset?: number
  }) {
    const {
      countryCode,
      regionCode,
      policyType,
      sectors,
      effectiveAfter,
      query,
      limit = 20,
      offset = 0,
    } = params

    const where: any = {
      status: 'ACTIVE', // Only active policies by default
    }

    if (countryCode) where.countryCode = countryCode
    if (regionCode) where.regionCode = regionCode
    if (policyType) where.policyType = policyType
    if (effectiveAfter) where.effectiveDate = { gte: effectiveAfter }

    if (sectors && sectors.length > 0) {
      where.sectors = {
        hasSome: sectors,
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        orderBy: [
          { effectiveDate: 'desc' },
          { title: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.policy.count({ where }),
    ])

    return {
      data: policies,
      total,
      hasMore: offset + limit < total,
      nextOffset: offset + limit < total ? offset + limit : null,
    }
  }

  /**
   * Database health check and performance metrics
   */
  static async getHealthMetrics() {
    const [
      carbonStandardsCount,
      methodologiesCount,
      projectsCount,
      riskDataCount,
      policiesCount,
    ] = await Promise.all([
      prisma.carbonStandard.count(),
      prisma.methodology.count(),
      prisma.project.count(),
      prisma.physicalRiskData.count(),
      prisma.policy.count(),
    ])

    // Check for recent data updates
    const recentUpdates = await prisma.carbonStandard.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: { lastUpdated: true },
    })

    return {
      counts: {
        carbonStandards: carbonStandardsCount,
        methodologies: methodologiesCount,
        projects: projectsCount,
        riskData: riskDataCount,
        policies: policiesCount,
      },
      lastUpdate: recentUpdates?.lastUpdated,
      status: 'healthy',
    }
  }
}
