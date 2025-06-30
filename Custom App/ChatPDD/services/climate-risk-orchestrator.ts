/**
 * BMAD-ORCHESTRATOR: Climate Physical Risk Database Integration
 * Specialized agent for coordinate-level risk analysis and mapping
 */

import { logger } from '@/utils/logger'
import { prisma } from '@/lib/prisma'

export interface CoordinatePoint {
  latitude: number
  longitude: number
  name?: string
  description?: string
}

export interface RiskFactor {
  id: string
  category: 'heat' | 'water' | 'wind' | 'drought' | 'fire' | 'flood' | 'sea_level' | 'composite'
  severity: 'low' | 'medium' | 'high' | 'extreme'
  confidence: number // 0-1 confidence score
  value: number
  unit: string
  timeframe: '2030' | '2050' | '2100' | 'current'
  scenario: 'RCP2.6' | 'RCP4.5' | 'RCP8.5' | 'historical'
  source: string
  methodology: string
}

export interface PhysicalRiskAssessment {
  coordinates: CoordinatePoint
  riskFactors: RiskFactor[]
  overallRiskScore: number
  primaryHazards: string[]
  adaptationRecommendations: string[]
  dataQuality: 'high' | 'medium' | 'low'
  lastUpdated: Date
  sources: string[]
}

export interface DataSourceConfig {
  name: string
  url: string
  apiKey?: string
  accessType: 'open' | 'api' | 'proprietary' | 'scraping'
  dataFormat: 'json' | 'geotiff' | 'shapefile' | 'csv' | 'xml'
  coverage: 'global' | 'national' | 'regional' | 'local'
  resolution: string // e.g., "1km", "county", "census_tract"
  updateFrequency: 'real-time' | 'daily' | 'monthly' | 'annually' | 'static'
  reliabilityScore: number // 0-1
  costPerQuery?: number
}

/**
 * BMAD Climate Risk Orchestrator
 * Manages multiple data sources for comprehensive coordinate-level risk assessment
 */
export class ClimateRiskOrchestrator {
  private dataSources: Map<string, DataSourceConfig> = new Map()
  private cacheTimeout = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.initializeDataSources()
  }

  /**
   * Initialize available data sources based on the climate risk database inventory
   */
  private initializeDataSources(): void {
    // Governmental Sources (Open Access)
    this.addDataSource({
      name: 'US_Climate_Vulnerability_Index',
      url: 'https://map.climatevulnerabilityindex.org/',
      accessType: 'open',
      dataFormat: 'json',
      coverage: 'national',
      resolution: 'census_tract',
      updateFrequency: 'annually',
      reliabilityScore: 0.9
    })

    this.addDataSource({
      name: 'CMRA_Resilience_Gov',
      url: 'https://resilience.climate.gov/',
      accessType: 'open',
      dataFormat: 'geotiff',
      coverage: 'national',
      resolution: '1km',
      updateFrequency: 'monthly',
      reliabilityScore: 0.95
    })

    this.addDataSource({
      name: 'EPA_Climate_Risk',
      url: 'https://www.epa.gov/resilient-investments/climate-risk-assessment-resources',
      accessType: 'open',
      dataFormat: 'json',
      coverage: 'national',
      resolution: 'county',
      updateFrequency: 'annually',
      reliabilityScore: 0.85
    })

    // Non-Governmental Sources (Open)
    this.addDataSource({
      name: 'WorldClim',
      url: 'https://www.worldclim.org/',
      accessType: 'open',
      dataFormat: 'geotiff',
      coverage: 'global',
      resolution: '1km',
      updateFrequency: 'static',
      reliabilityScore: 0.9
    })

    this.addDataSource({
      name: 'Resource_Watch',
      url: 'https://resourcewatch.org/dashboards/climate-related-physical-risks',
      accessType: 'api',
      dataFormat: 'json',
      coverage: 'global',
      resolution: '10km',
      updateFrequency: 'monthly',
      reliabilityScore: 0.8
    })

    this.addDataSource({
      name: 'Four_Twenty_Seven',
      url: 'https://www.americancommunities.org/mapping-climate-risks-by-county-and-community/',
      accessType: 'scraping',
      dataFormat: 'json',
      coverage: 'national',
      resolution: 'county',
      updateFrequency: 'annually',
      reliabilityScore: 0.75
    })

    // Proprietary Sources (API Access Required)
    if (process.env.MAPLECROFT_API_KEY) {
      this.addDataSource({
        name: 'Maplecroft',
        url: 'https://www.maplecroft.com/global-risk-data/climate-risk-data/',
        apiKey: process.env.MAPLECROFT_API_KEY,
        accessType: 'api',
        dataFormat: 'json',
        coverage: 'global',
        resolution: 'subnational',
        updateFrequency: 'monthly',
        reliabilityScore: 0.95,
        costPerQuery: 0.10
      })
    }

    if (process.env.XDI_API_KEY) {
      this.addDataSource({
        name: 'XDI_Systems',
        url: 'https://xdi.systems/',
        apiKey: process.env.XDI_API_KEY,
        accessType: 'api',
        dataFormat: 'json',
        coverage: 'global',
        resolution: 'asset_level',
        updateFrequency: 'real-time',
        reliabilityScore: 0.9,
        costPerQuery: 0.25
      })
    }

    if (process.env.SPGLOBAL_API_KEY) {
      this.addDataSource({
        name: 'SP_Global_Physical_Risk',
        url: 'https://www.spglobal.com/esg/solutions/physical-climate-risk-solutions',
        apiKey: process.env.SPGLOBAL_API_KEY,
        accessType: 'api',
        dataFormat: 'json',
        coverage: 'global',
        resolution: 'asset_level',
        updateFrequency: 'daily',
        reliabilityScore: 0.95,
        costPerQuery: 0.30
      })
    }

    logger.info('BMAD Risk Orchestrator initialized', {
      totalSources: this.dataSources.size,
      openSources: Array.from(this.dataSources.values()).filter(s => s.accessType === 'open').length,
      apiSources: Array.from(this.dataSources.values()).filter(s => s.accessType === 'api').length
    })
  }

  private addDataSource(config: DataSourceConfig): void {
    this.dataSources.set(config.name, config)
  }

  /**
   * Main orchestration method for comprehensive risk assessment
   */
  async assessCoordinateRisk(
    coordinates: CoordinatePoint,
    scenarios: string[] = ['RCP4.5'],
    timeframes: string[] = ['2050']
  ): Promise<PhysicalRiskAssessment> {
    const startTime = Date.now()

    try {
      // Check cache first
      const cached = await this.getCachedAssessment(coordinates)
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        logger.info('Using cached risk assessment', { coordinates })
        return cached
      }

      // Orchestrate data collection from multiple sources
      const riskFactors: RiskFactor[] = []
      const sources: string[] = []

      // Prioritize data sources by reliability and cost
      const prioritizedSources = this.prioritizeDataSources(coordinates)

      for (const sourceConfig of prioritizedSources) {
        try {
          const sourceRisks = await this.queryDataSource(sourceConfig, coordinates, scenarios, timeframes)
          riskFactors.push(...sourceRisks)
          sources.push(sourceConfig.name)
        } catch (error) {
          logger.warn('Data source query failed', {
            source: sourceConfig.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Synthesize comprehensive assessment
      const assessment = await this.synthesizeAssessment(coordinates, riskFactors, sources)

      // Cache the result
      await this.cacheAssessment(assessment)

      const duration = Date.now() - startTime
      logger.info('BMAD risk assessment completed', {
        coordinates,
        sources: sources.length,
        riskFactors: riskFactors.length,
        overallScore: assessment.overallRiskScore,
        duration: `${duration}ms`
      })

      return assessment

    } catch (error) {
      logger.error('BMAD risk assessment failed', {
        coordinates,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Prioritize data sources based on coverage, reliability, cost, and coordinate location
   */
  private prioritizeDataSources(coordinates: CoordinatePoint): DataSourceConfig[] {
    const available = Array.from(this.dataSources.values())

    return available
      .filter(source => this.isSourceApplicable(source, coordinates))
      .sort((a, b) => {
        // Priority factors: reliability, cost, coverage
        const scoreA = a.reliabilityScore - (a.costPerQuery || 0) * 0.1
        const scoreB = b.reliabilityScore - (b.costPerQuery || 0) * 0.1
        return scoreB - scoreA
      })
  }

  /**
   * Check if a data source is applicable for given coordinates
   */
  private isSourceApplicable(source: DataSourceConfig, coordinates: CoordinatePoint): boolean {
    // Check geographic coverage
    if (source.coverage === 'national') {
      // Assume US-focused for national sources
      return coordinates.latitude >= 24 && coordinates.latitude <= 49 &&
             coordinates.longitude >= -125 && coordinates.longitude <= -66
    }

    // Global sources are always applicable
    return source.coverage === 'global' || source.coverage === 'regional'
  }

  /**
   * Query individual data source for risk factors
   */
  private async queryDataSource(
    source: DataSourceConfig,
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = []

    switch (source.accessType) {
      case 'open':
        return await this.queryOpenSource(source, coordinates, scenarios, timeframes)

      case 'api':
        return await this.queryAPISource(source, coordinates, scenarios, timeframes)

      case 'scraping':
        return await this.queryScrapeSource(source, coordinates, scenarios, timeframes)

      default:
        logger.warn('Unsupported data source access type', { source: source.name, type: source.accessType })
        return []
    }
  }

  /**
   * Query open data sources
   */
  private async queryOpenSource(
    source: DataSourceConfig,
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    // Implementation would vary by source
    switch (source.name) {
      case 'WorldClim':
        return await this.queryWorldClim(coordinates, scenarios, timeframes)

      case 'Resource_Watch':
        return await this.queryResourceWatch(coordinates, scenarios, timeframes)

      case 'US_Climate_Vulnerability_Index':
        return await this.queryUSCVI(coordinates, scenarios, timeframes)

      default:
        return []
    }
  }

  /**
   * Query API-based sources
   */
  private async queryAPISource(
    source: DataSourceConfig,
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    // Implement API queries with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (source.apiKey) {
      headers['Authorization'] = `Bearer ${source.apiKey}`
    }

    // Implementation would vary by API specification
    return []
  }

  /**
   * Query sources requiring web scraping
   */
  private async queryScrapeSource(
    source: DataSourceConfig,
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    // Implement responsible web scraping with rate limiting
    return []
  }

  /**
   * WorldClim data integration
   */
  private async queryWorldClim(
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    // WorldClim provides global climate data in GeoTIFF format
    // Implementation would involve coordinate-based data extraction
    return [
      {
        id: `worldclim_temp_${Date.now()}`,
        category: 'heat',
        severity: 'medium',
        confidence: 0.9,
        value: 35.5,
        unit: '°C',
        timeframe: '2050',
        scenario: 'RCP4.5',
        source: 'WorldClim',
        methodology: 'Global climate modeling with bioclimatic variables'
      }
    ]
  }

  /**
   * Resource Watch API integration
   */
  private async queryResourceWatch(
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    try {
      // Resource Watch API for climate hazards
      const response = await fetch(
        `https://api.resourcewatch.org/v1/query?sql=SELECT * FROM climate_hazards WHERE lat=${coordinates.latitude} AND lon=${coordinates.longitude}`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (!response.ok) {
        throw new Error(`Resource Watch API error: ${response.status}`)
      }

      const data = await response.json()

      // Transform Resource Watch data to RiskFactor format
      return this.transformResourceWatchData(data, coordinates)

    } catch (error) {
      logger.error('Resource Watch query failed', {
        coordinates,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return []
    }
  }

  /**
   * US Climate Vulnerability Index integration
   */
  private async queryUSCVI(
    coordinates: CoordinatePoint,
    scenarios: string[],
    timeframes: string[]
  ): Promise<RiskFactor[]> {
    // USCVI provides census tract level vulnerability data
    // Implementation would involve spatial lookup and data extraction
    return []
  }

  /**
   * Transform Resource Watch data to standardized format
   */
  private transformResourceWatchData(data: any, coordinates: CoordinatePoint): RiskFactor[] {
    const risks: RiskFactor[] = []

    // Transform based on Resource Watch data structure
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        risks.push({
          id: `rw_${item.id || Date.now()}`,
          category: this.mapResourceWatchCategory(item.hazard_type),
          severity: this.mapResourceWatchSeverity(item.severity),
          confidence: item.confidence || 0.7,
          value: item.value || 0,
          unit: item.unit || 'index',
          timeframe: '2050',
          scenario: 'RCP4.5',
          source: 'Resource_Watch',
          methodology: 'TCFD-aligned climate hazard mapping'
        })
      })
    }

    return risks
  }

  private mapResourceWatchCategory(hazardType: string): RiskFactor['category'] {
    const mapping: Record<string, RiskFactor['category']> = {
      'temperature': 'heat',
      'precipitation': 'water',
      'drought': 'drought',
      'flood': 'flood',
      'wildfire': 'fire',
      'wind': 'wind',
      'sea_level': 'sea_level'
    }
    return mapping[hazardType] || 'composite'
  }

  private mapResourceWatchSeverity(severity: number): RiskFactor['severity'] {
    if (severity >= 0.8) return 'extreme'
    if (severity >= 0.6) return 'high'
    if (severity >= 0.4) return 'medium'
    return 'low'
  }

  /**
   * Synthesize comprehensive risk assessment from multiple sources
   */
  private async synthesizeAssessment(
    coordinates: CoordinatePoint,
    riskFactors: RiskFactor[],
    sources: string[]
  ): Promise<PhysicalRiskAssessment> {
    // Calculate overall risk score using weighted average
    const overallRiskScore = this.calculateOverallRisk(riskFactors)

    // Identify primary hazards
    const primaryHazards = this.identifyPrimaryHazards(riskFactors)

    // Generate adaptation recommendations
    const adaptationRecommendations = await this.generateAdaptationRecommendations(riskFactors, coordinates)

    // Assess data quality
    const dataQuality = this.assessDataQuality(riskFactors, sources)

    return {
      coordinates,
      riskFactors,
      overallRiskScore,
      primaryHazards,
      adaptationRecommendations,
      dataQuality,
      lastUpdated: new Date(),
      sources
    }
  }

  private calculateOverallRisk(riskFactors: RiskFactor[]): number {
    if (riskFactors.length === 0) return 0

    const weightedSum = riskFactors.reduce((sum, factor) => {
      const severityWeight = this.getSeverityWeight(factor.severity)
      return sum + (severityWeight * factor.confidence)
    }, 0)

    return Math.min(weightedSum / riskFactors.length, 1.0)
  }

  private getSeverityWeight(severity: RiskFactor['severity']): number {
    const weights = { low: 0.25, medium: 0.5, high: 0.75, extreme: 1.0 }
    return weights[severity]
  }

  private identifyPrimaryHazards(riskFactors: RiskFactor[]): string[] {
    const hazardCounts = new Map<string, number>()

    riskFactors.forEach(factor => {
      const count = hazardCounts.get(factor.category) || 0
      hazardCounts.set(factor.category, count + this.getSeverityWeight(factor.severity))
    })

    return Array.from(hazardCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)
  }

  private async generateAdaptationRecommendations(
    riskFactors: RiskFactor[],
    coordinates: CoordinatePoint
  ): Promise<string[]> {
    const recommendations: string[] = []

    const primaryHazards = this.identifyPrimaryHazards(riskFactors)

    primaryHazards.forEach(hazard => {
      switch (hazard) {
        case 'heat':
          recommendations.push('Implement cooling systems and heat-resistant infrastructure')
          break
        case 'water':
        case 'flood':
          recommendations.push('Develop flood management and drainage systems')
          break
        case 'drought':
          recommendations.push('Establish water conservation and storage systems')
          break
        case 'fire':
          recommendations.push('Create defensible space and fire-resistant landscaping')
          break
        case 'wind':
          recommendations.push('Strengthen structural elements for wind resistance')
          break
        case 'sea_level':
          recommendations.push('Consider sea level rise in coastal planning')
          break
      }
    })

    return recommendations
  }

  private assessDataQuality(riskFactors: RiskFactor[], sources: string[]): 'high' | 'medium' | 'low' {
    const avgConfidence = riskFactors.reduce((sum, factor) => sum + factor.confidence, 0) / riskFactors.length
    const sourceReliability = sources.reduce((sum, sourceName) => {
      const source = this.dataSources.get(sourceName)
      return sum + (source?.reliabilityScore || 0.5)
    }, 0) / sources.length

    const overallQuality = (avgConfidence + sourceReliability) / 2

    if (overallQuality >= 0.8) return 'high'
    if (overallQuality >= 0.6) return 'medium'
    return 'low'
  }

  /**
   * Cache management
   */
  private async getCachedAssessment(coordinates: CoordinatePoint): Promise<PhysicalRiskAssessment | null> {
    try {
      const cached = await prisma.physicalRiskData.findFirst({
        where: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        },
        orderBy: { createdAt: 'desc' }
      })

      if (!cached) return null

      return {
        coordinates,
        riskFactors: cached.riskFactors as RiskFactor[],
        overallRiskScore: cached.overallRiskScore,
        primaryHazards: cached.primaryHazards,
        adaptationRecommendations: cached.adaptationRecommendations,
        dataQuality: cached.dataQuality as 'high' | 'medium' | 'low',
        lastUpdated: cached.createdAt,
        sources: cached.dataSources
      }
    } catch (error) {
      logger.error('Cache retrieval failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return null
    }
  }

  private isCacheValid(lastUpdated: Date): boolean {
    return Date.now() - lastUpdated.getTime() < this.cacheTimeout
  }

  private async cacheAssessment(assessment: PhysicalRiskAssessment): Promise<void> {
    try {
      await prisma.physicalRiskData.create({
        data: {
          latitude: assessment.coordinates.latitude,
          longitude: assessment.coordinates.longitude,
          riskFactors: assessment.riskFactors,
          overallRiskScore: assessment.overallRiskScore,
          primaryHazards: assessment.primaryHazards,
          adaptationRecommendations: assessment.adaptationRecommendations,
          dataQuality: assessment.dataQuality,
          dataSources: assessment.sources,
          rawData: {} // Store any additional raw data if needed
        }
      })
    } catch (error) {
      logger.error('Cache storage failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  /**
   * Public methods for external integration
   */

  async getAvailableDataSources(): Promise<DataSourceConfig[]> {
    return Array.from(this.dataSources.values())
  }

  async bulkAssessCoordinates(
    coordinates: CoordinatePoint[],
    scenarios: string[] = ['RCP4.5'],
    timeframes: string[] = ['2050']
  ): Promise<PhysicalRiskAssessment[]> {
    const assessments: PhysicalRiskAssessment[] = []

    for (const coord of coordinates) {
      try {
        const assessment = await this.assessCoordinateRisk(coord, scenarios, timeframes)
        assessments.push(assessment)
      } catch (error) {
        logger.error('Bulk assessment item failed', {
          coordinates: coord,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return assessments
  }
}

// Export singleton instance
export const climateRiskOrchestrator = new ClimateRiskOrchestrator()
