import puppeteer, { type Browser, type Page } from "puppeteer"
import { PrismaClient } from "@prisma/client"
import { logger } from "../utils/logger"
import type { StandardScraperConfig } from "../types/scraper-config"

const prisma = new PrismaClient()

export class CarbonStandardScraper {
  private browser: Browser | null = null
  private config: StandardScraperConfig

  constructor(config: StandardScraperConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    logger.info(`Initialized scraper for ${this.config.name}`)
  }

  async scrapeStandardInfo(): Promise<void> {
    if (!this.browser) {
      throw new Error("Browser not initialized")
    }

    const page = await this.browser.newPage()
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )

    try {
      logger.info(`Scraping standard info from ${this.config.baseUrl}`)
      await page.goto(this.config.baseUrl, { waitUntil: "networkidle2" })

      // Extract standard information based on config selectors
      const standardInfo = await this.extractStandardInfo(page)

      // Store or update in database
      await this.storeStandardInfo(standardInfo)

      // Scrape methodologies if configured
      if (this.config.methodologyListUrl) {
        await this.scrapeMethodologies(page)
      }
    } catch (error) {
      logger.error(`Error scraping ${this.config.name}: ${error}`)
      throw error
    } finally {
      await page.close()
    }
  }

  private async extractStandardInfo(page: Page): Promise<any> {
    return await page.evaluate((selectors) => {
      const getTextContent = (selector: string) => {
        const element = document.querySelector(selector)
        return element ? element.textContent?.trim() : null
      }

      return {
        name: getTextContent(selectors.name),
        description: getTextContent(selectors.description),
        organizationType: getTextContent(selectors.organizationType),
        geographicScope: getTextContent(selectors.geographicScope),
        focusSector: getTextContent(selectors.focusSector),
        website: window.location.href,
        lastUpdated: new Date().toISOString(),
      }
    }, this.config.selectors)
  }

  private async storeStandardInfo(standardInfo: any): Promise<void> {
    try {
      await prisma.carbonStandard.upsert({
        where: { name: standardInfo.name },
        update: standardInfo,
        create: standardInfo,
      })
      logger.info(`Stored/updated standard info for ${standardInfo.name}`)
    } catch (error) {
      logger.error(`Database error storing standard info: ${error}`)
      throw error
    }
  }

  async scrapeMethodologies(page: Page): Promise<void> {
    try {
      logger.info(`Scraping methodologies from ${this.config.methodologyListUrl}`)
      await page.goto(this.config.methodologyListUrl, { waitUntil: "networkidle2" })

      // Extract methodology links
      const methodologyLinks = await page.evaluate((selector) => {
        const links = Array.from(document.querySelectorAll(selector))
        return links.map((link) => ({
          url: link.getAttribute("href"),
          name: link.textContent?.trim(),
        }))
      }, this.config.selectors.methodologyLinks)

      // Process each methodology
      for (const link of methodologyLinks) {
        if (!link.url) continue

        // Resolve relative URLs
        const methodologyUrl = new URL(link.url, this.config.methodologyListUrl).href
        await this.scrapeMethodology(methodologyUrl, link.name)
      }
    } catch (error) {
      logger.error(`Error scraping methodologies: ${error}`)
      throw error
    }
  }

  private async scrapeMethodology(url: string, name: string | undefined): Promise<void> {
    if (!this.browser) {
      throw new Error("Browser not initialized")
    }

    const page = await this.browser.newPage()

    try {
      logger.info(`Scraping methodology: ${name} from ${url}`)
      await page.goto(url, { waitUntil: "networkidle2" })

      // Extract methodology details
      const methodologyInfo = await page.evaluate((selectors) => {
        const getTextContent = (selector: string) => {
          const element = document.querySelector(selector)
          return element ? element.textContent?.trim() : null
        }

        return {
          name: getTextContent(selectors.methodologyName),
          type: getTextContent(selectors.methodologyType),
          category: getTextContent(selectors.methodologyCategory),
          description: getTextContent(selectors.methodologyDescription),
          link: window.location.href,
          itmoAcceptance: getTextContent(selectors.methodologyItmo) === "Yes",
        }
      }, this.config.selectors)

      // Store methodology info
      await this.storeMethodologyInfo(methodologyInfo)

      // Scrape PDD requirements if configured
      if (this.config.selectors.pddRequirements) {
        await this.scrapePDDRequirements(page, methodologyInfo.name)
      }
    } catch (error) {
      logger.error(`Error scraping methodology ${name}: ${error}`)
    } finally {
      await page.close()
    }
  }

  private async storeMethodologyInfo(methodologyInfo: any): Promise<void> {
    try {
      // Get standard ID
      const standard = await prisma.carbonStandard.findUnique({
        where: { name: this.config.name },
      })

      if (!standard) {
        throw new Error(`Standard ${this.config.name} not found in database`)
      }

      await prisma.methodology.upsert({
        where: {
          standardId_name: {
            standardId: standard.id,
            name: methodologyInfo.name,
          },
        },
        update: {
          ...methodologyInfo,
          standardId: standard.id,
        },
        create: {
          ...methodologyInfo,
          standardId: standard.id,
        },
      })

      logger.info(`Stored/updated methodology: ${methodologyInfo.name}`)
    } catch (error) {
      logger.error(`Database error storing methodology: ${error}`)
      throw error
    }
  }

  private async scrapePDDRequirements(page: Page, methodologyName: string): Promise<void> {
    try {
      // Extract PDD requirements
      const pddRequirements = await page.evaluate((selector) => {
        const requirementElements = Array.from(document.querySelectorAll(selector))
        return requirementElements.map((element) => ({
          sectionName: element.querySelector("h3, h4")?.textContent?.trim(),
          description: element.querySelector("p")?.textContent?.trim(),
          required: element.textContent?.includes("required") || false,
        }))
      }, this.config.selectors.pddRequirements)

      // Store PDD requirements
      await this.storePDDRequirements(pddRequirements, methodologyName)
    } catch (error) {
      logger.error(`Error scraping PDD requirements: ${error}`)
      throw error
    }
  }

  private async storePDDRequirements(requirements: any[], methodologyName: string): Promise<void> {
    try {
      // Get standard and methodology IDs
      const standard = await prisma.carbonStandard.findUnique({
        where: { name: this.config.name },
      })

      if (!standard) {
        throw new Error(`Standard ${this.config.name} not found in database`)
      }

      const methodology = await prisma.methodology.findUnique({
        where: {
          standardId_name: {
            standardId: standard.id,
            name: methodologyName,
          },
        },
      })

      if (!methodology) {
        throw new Error(`Methodology ${methodologyName} not found in database`)
      }

      // Store each requirement
      for (const req of requirements) {
        await prisma.pDDRequirement.upsert({
          where: {
            methodologyId_sectionName: {
              methodologyId: methodology.id,
              sectionName: req.sectionName,
            },
          },
          update: {
            ...req,
            standardId: standard.id,
            methodologyId: methodology.id,
          },
          create: {
            ...req,
            standardId: standard.id,
            methodologyId: methodology.id,
          },
        })
      }

      logger.info(`Stored ${requirements.length} PDD requirements for ${methodologyName}`)
    } catch (error) {
      logger.error(`Database error storing PDD requirements: ${error}`)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      logger.info(`Closed scraper for ${this.config.name}`)
    }
  }
}
