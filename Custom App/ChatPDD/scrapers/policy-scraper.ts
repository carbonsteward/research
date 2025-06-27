import puppeteer, { type Browser } from "puppeteer"
import { PrismaClient } from "@prisma/client"
import { logger } from "../utils/logger"
import type { PolicyScraperConfig } from "../types/scraper-config"
import { extractPDFText } from "../utils/pdf-extractor"

const prisma = new PrismaClient()

export class PolicyScraper {
  private browser: Browser | null = null
  private config: PolicyScraperConfig

  constructor(config: PolicyScraperConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    logger.info(`Initialized policy scraper for ${this.config.name}`)
  }

  async scrapePolicies(): Promise<void> {
    if (!this.browser) {
      throw new Error("Browser not initialized")
    }

    const page = await this.browser.newPage()
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )

    try {
      logger.info(`Scraping policies from ${this.config.baseUrl}`)
      await page.goto(this.config.baseUrl, { waitUntil: "networkidle2" })

      // Handle pagination if needed
      let hasNextPage = true
      let pageNum = 1

      while (hasNextPage) {
        logger.info(`Scraping policy page ${pageNum}`)

        // Extract policy links from current page
        const policyLinks = await page.evaluate((selector) => {
          const links = Array.from(document.querySelectorAll(selector))
          return links.map((link) => ({
            url: link.getAttribute("href"),
            title: link.textContent?.trim(),
          }))
        }, this.config.selectors.policyLinks)

        // Process each policy
        for (const link of policyLinks) {
          if (!link.url) continue

          // Resolve relative URLs
          const policyUrl = new URL(link.url, this.config.baseUrl).href
          await this.scrapePolicy(policyUrl, link.title)
        }

        // Check if there's a next page
        hasNextPage = await page.evaluate((selector) => {
          const nextButton = document.querySelector(selector)
          return nextButton !== null && !nextButton.hasAttribute("disabled")
        }, this.config.selectors.nextPageButton)

        if (hasNextPage) {
          await page.click(this.config.selectors.nextPageButton)
          await page.waitForNavigation({ waitUntil: "networkidle2" })
          pageNum++
        }
      }
    } catch (error) {
      logger.error(`Error scraping policies: ${error}`)
      throw error
    } finally {
      await page.close()
    }
  }

  private async scrapePolicy(url: string, title: string | undefined): Promise<void> {
    if (!this.browser) {
      throw new Error("Browser not initialized")
    }

    const page = await this.browser.newPage()

    try {
      logger.info(`Scraping policy: ${title} from ${url}`)
      await page.goto(url, { waitUntil: "networkidle2" })

      // Check if it's a PDF
      const isPDF = url.toLowerCase().endsWith(".pdf")
      let policyInfo

      if (isPDF) {
        // Extract text from PDF
        const pdfText = await extractPDFText(url)
        policyInfo = this.extractPolicyInfoFromPDF(pdfText, url)
      } else {
        // Extract policy details from HTML
        policyInfo = await page.evaluate((selectors) => {
          const getTextContent = (selector: string) => {
            const element = document.querySelector(selector)
            return element ? element.textContent?.trim() : null
          }

          return {
            title: getTextContent(selectors.policyTitle) || document.title,
            description: getTextContent(selectors.policyDescription),
            country: getTextContent(selectors.policyCountry),
            effectiveDate: getTextContent(selectors.policyEffectiveDate),
            expirationDate: getTextContent(selectors.policyExpirationDate),
            policyType: getTextContent(selectors.policyType),
            sourceUrl: window.location.href,
          }
        }, this.config.selectors)
      }

      // Extract policy sectors
      const policySectors = isPDF
        ? []
        : await page.evaluate((selector) => {
            const sectorElements = Array.from(document.querySelectorAll(selector))
            return sectorElements.map((element) => element.textContent?.trim()).filter(Boolean)
          }, this.config.selectors.policySectors)

      // Store policy info
      await this.storePolicyInfo(policyInfo, policySectors)
    } catch (error) {
      logger.error(`Error scraping policy ${title}: ${error}`)
    } finally {
      await page.close()
    }
  }

  private extractPolicyInfoFromPDF(pdfText: string, url: string): any {
    // This is a simplified example - in a real implementation,
    // you would use NLP techniques to extract structured information

    const title = pdfText.split("\n")[0]?.trim()

    // Extract country using regex patterns or keyword matching
    const countryMatch = pdfText.match(/Country:\s*([^\n]+)/i)
    const country = countryMatch ? countryMatch[1].trim() : null

    // Extract dates using regex
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g
    const dates = pdfText.match(datePattern) || []

    return {
      title,
      description: pdfText.substring(0, 500) + "...",
      country,
      effectiveDate: dates[0] || null,
      expirationDate: dates[1] || null,
      policyType: this.determinePolicyType(pdfText),
      sourceUrl: url,
    }
  }

  private determinePolicyType(text: string): string {
    const lowerText = text.toLowerCase()

    if (lowerText.includes("law") || lowerText.includes("act")) {
      return "Law"
    } else if (lowerText.includes("regulation") || lowerText.includes("rule")) {
      return "Regulation"
    } else if (lowerText.includes("strategy") || lowerText.includes("plan")) {
      return "Strategy"
    } else if (lowerText.includes("policy")) {
      return "Policy"
    } else {
      return "Other"
    }
  }

  private async storePolicyInfo(policyInfo: any, sectors: string[]): Promise<void> {
    try {
      // Convert country name to country code if needed
      const countryCode = await this.getCountryCode(policyInfo.country)

      // Create or update policy
      const policy = await prisma.policy.upsert({
        where: {
          title_sourceUrl: {
            title: policyInfo.title,
            sourceUrl: policyInfo.sourceUrl,
          },
        },
        update: {
          ...policyInfo,
          countryCode,
          source: this.config.name,
          lastUpdated: new Date(),
        },
        create: {
          ...policyInfo,
          countryCode,
          source: this.config.name,
          lastUpdated: new Date(),
        },
      })

      // Store policy sectors
      for (const sector of sectors) {
        await prisma.policySector.upsert({
          where: {
            policyId_sector: {
              policyId: policy.id,
              sector,
            },
          },
          update: {},
          create: {
            policyId: policy.id,
            sector,
          },
        })
      }

      logger.info(`Stored/updated policy: ${policyInfo.title}`)
    } catch (error) {
      logger.error(`Database error storing policy: ${error}`)
      throw error
    }
  }

  private async getCountryCode(countryName: string | null): Promise<string | null> {
    if (!countryName) return null

    // In a real implementation, you would use a country name to code mapping
    // This is a simplified example
    const countryMap: Record<string, string> = {
      "United States": "USA",
      "United Kingdom": "GBR",
      Canada: "CAN",
      Australia: "AUS",
      Germany: "DEU",
      France: "FRA",
      Japan: "JPN",
      China: "CHN",
      India: "IND",
      Brazil: "BRA",
    }

    return countryMap[countryName] || null
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      logger.info(`Closed policy scraper for ${this.config.name}`)
    }
  }
}
