import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

// Schema definitions for validation
const CarbonStandardSchema = z.object({
  name: z.string().min(1, "Standard name is required"),
  abbreviation: z.string().optional(),
  organizationType: z.string().min(1, "Organization type is required"),
  geographicScope: z.string().min(1, "Geographic scope is required"),
  focusSector: z.string().min(1, "Focus sector is required"),
  description: z.string().min(1, "Description is required"),
  website: z.string().url("Website must be a valid URL"),
  icroaApproved: z.boolean(),
  corsiaApproved: z.boolean(),
  correspondingAdjustment: z.string().optional(),
})

const MethodologySchema = z.object({
  standardId: z.string().uuid("Standard ID must be a valid UUID"),
  name: z.string().min(1, "Methodology name is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  link: z.string().url("Link must be a valid URL"),
  itmoAcceptance: z.boolean(),
  description: z.string().min(1, "Description is required"),
})

const PolicySchema = z.object({
  title: z.string().min(1, "Policy title is required"),
  description: z.string().min(1, "Description is required"),
  countryCode: z.string().min(2, "Country code is required"),
  regionCode: z.string().optional(),
  effectiveDate: z.string().min(1, "Effective date is required"),
  expirationDate: z.string().optional(),
  policyType: z.string().min(1, "Policy type is required"),
  source: z.string().min(1, "Source is required"),
  sourceUrl: z.string().url("Source URL must be a valid URL"),
  sectors: z.array(z.string().min(1, "Sector name is required")).min(1, "At least one sector is required"),
})

const PhysicalRiskDataSchema = z.object({
  scenarioId: z.string().uuid("Scenario ID must be a valid UUID"),
  variableId: z.string().uuid("Variable ID must be a valid UUID"),
  countryCode: z.string().min(2, "Country code is required"),
  regionCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  timePeriod: z.string().min(1, "Time period is required"),
  value: z.string().min(1, "Value is required"),
  confidence: z.string().min(1, "Confidence level is required"),
  dataSource: z.string().min(1, "Data source is required"),
})

export class ValidationService {
  // Validate carbon standard data
  static async validateCarbonStandard(data: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      CarbonStandardSchema.parse(data)

      // Check for duplicate standard names
      const existingStandard = await prisma.carbonStandard.findFirst({
        where: {
          name: data.name,
          id: { not: data.id }, // Exclude current record if updating
        },
      })

      if (existingStandard) {
        return {
          valid: false,
          errors: [`A carbon standard with the name "${data.name}" already exists`],
        }
      }

      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => e.message),
        }
      }

      logger.error("Validation error:", error)
      return {
        valid: false,
        errors: ["An unexpected error occurred during validation"],
      }
    }
  }

  // Validate methodology data
  static async validateMethodology(data: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      MethodologySchema.parse(data)

      // Check if standard exists
      const standard = await prisma.carbonStandard.findUnique({
        where: { id: data.standardId },
      })

      if (!standard) {
        return {
          valid: false,
          errors: ["The specified carbon standard does not exist"],
        }
      }

      // Check for duplicate methodology names within the same standard
      const existingMethodology = await prisma.methodology.findFirst({
        where: {
          standardId: data.standardId,
          name: data.name,
          id: { not: data.id }, // Exclude current record if updating
        },
      })

      if (existingMethodology) {
        return {
          valid: false,
          errors: [`A methodology with the name "${data.name}" already exists for this standard`],
        }
      }

      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => e.message),
        }
      }

      logger.error("Validation error:", error)
      return {
        valid: false,
        errors: ["An unexpected error occurred during validation"],
      }
    }
  }

  // Validate policy data
  static async validatePolicy(data: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      PolicySchema.parse(data)

      // Validate country code against ISO 3166-1 alpha-3 (simplified check)
      const validCountryCodes = ["USA", "GBR", "CAN", "AUS", "DEU", "FRA", "JPN", "CHN", "IND", "BRA"] // Example list
      if (!validCountryCodes.includes(data.countryCode)) {
        return {
          valid: false,
          errors: ["Invalid country code"],
        }
      }

      // Check for duplicate policy (same title and source)
      const existingPolicy = await prisma.policy.findFirst({
        where: {
          title: data.title,
          source: data.source,
          id: { not: data.id }, // Exclude current record if updating
        },
      })

      if (existingPolicy) {
        return {
          valid: false,
          errors: [`A policy with the title "${data.title}" from source "${data.source}" already exists`],
        }
      }

      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => e.message),
        }
      }

      logger.error("Validation error:", error)
      return {
        valid: false,
        errors: ["An unexpected error occurred during validation"],
      }
    }
  }

  // Validate physical risk data
  static async validatePhysicalRiskData(data: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      PhysicalRiskDataSchema.parse(data)

      // Check if scenario exists
      const scenario = await prisma.physicalRiskScenario.findUnique({
        where: { id: data.scenarioId },
      })

      if (!scenario) {
        return {
          valid: false,
          errors: ["The specified climate scenario does not exist"],
        }
      }

      // Check if variable exists
      const variable = await prisma.physicalRiskVariable.findUnique({
        where: { id: data.variableId },
      })

      if (!variable) {
        return {
          valid: false,
          errors: ["The specified risk variable does not exist"],
        }
      }

      // Validate numeric values
      const value = Number.parseFloat(data.value)
      const confidence = Number.parseFloat(data.confidence)

      if (isNaN(value)) {
        return {
          valid: false,
          errors: ["Value must be a valid number"],
        }
      }

      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        return {
          valid: false,
          errors: ["Confidence level must be a number between 0 and 1"],
        }
      }

      // Check for duplicate data points
      const existingData = await prisma.physicalRiskData.findFirst({
        where: {
          scenarioId: data.scenarioId,
          variableId: data.variableId,
          countryCode: data.countryCode,
          regionCode: data.regionCode || null,
          timePeriod: data.timePeriod,
          id: { not: data.id }, // Exclude current record if updating
        },
      })

      if (existingData) {
        return {
          valid: false,
          errors: ["A data point with the same scenario, variable, location, and time period already exists"],
        }
      }

      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => e.message),
        }
      }

      logger.error("Validation error:", error)
      return {
        valid: false,
        errors: ["An unexpected error occurred during validation"],
      }
    }
  }

  // Run data quality checks on the entire database
  static async runDataQualityChecks(): Promise<{ issues: any[] }> {
    const issues = []

    try {
      // Check for standards without methodologies
      const standardsWithoutMethodologies = await prisma.carbonStandard.findMany({
        where: {
          methodologies: {
            none: {},
          },
        },
        select: {
          id: true,
          name: true,
        },
      })

      for (const standard of standardsWithoutMethodologies) {
        issues.push({
          type: "warning",
          entity: "CarbonStandard",
          id: standard.id,
          message: `Standard "${standard.name}" has no methodologies`,
        })
      }

      // Check for methodologies without PDD requirements
      const methodologiesWithoutRequirements = await prisma.methodology.findMany({
        where: {
          pddRequirements: {
            none: {},
          },
        },
        select: {
          id: true,
          name: true,
          standard: {
            select: {
              name: true,
            },
          },
        },
      })

      for (const methodology of methodologiesWithoutRequirements) {
        issues.push({
          type: "warning",
          entity: "Methodology",
          id: methodology.id,
          message: `Methodology "${methodology.name}" (${methodology.standard.name}) has no PDD requirements`,
        })
      }

      // Check for policies without sectors
      const policiesWithoutSectors = await prisma.policy.findMany({
        where: {
          sectors: {
            none: {},
          },
        },
        select: {
          id: true,
          title: true,
        },
      })

      for (const policy of policiesWithoutSectors) {
        issues.push({
          type: "warning",
          entity: "Policy",
          id: policy.id,
          message: `Policy "${policy.title}" has no sectors`,
        })
      }

      // Check for physical risk data with low confidence
      const lowConfidenceData = await prisma.physicalRiskData.findMany({
        where: {
          confidence: {
            lt: 0.5,
          },
        },
        select: {
          id: true,
          scenario: {
            select: {
              name: true,
            },
          },
          variable: {
            select: {
              name: true,
            },
          },
          countryCode: true,
          timePeriod: true,
          confidence: true,
        },
      })

      for (const data of lowConfidenceData) {
        issues.push({
          type: "info",
          entity: "PhysicalRiskData",
          id: data.id,
          message: `Low confidence (${data.confidence}) for ${data.variable.name} in ${data.countryCode} (${data.scenario.name}, ${data.timePeriod})`,
        })
      }

      return { issues }
    } catch (error) {
      logger.error("Error running data quality checks:", error)
      issues.push({
        type: "error",
        entity: "System",
        message: "An error occurred while running data quality checks",
      })

      return { issues }
    }
  }
}
