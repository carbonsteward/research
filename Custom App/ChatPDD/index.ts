import { CarbonStandardScraper } from "./scrapers/carbon-standard-scraper"
import { PolicyScraper } from "./scrapers/policy-scraper"
import { logger } from "./utils/logger"
import type { StandardScraperConfig, PolicyScraperConfig } from "./types/scraper-config"

// Example configuration for Verra VCS standard
const verraConfig: StandardScraperConfig = {
  name: "Verra VCS",
  baseUrl: "https://verra.org/project/vcs-program/",
  methodologyListUrl: "https://verra.org/methodologies/",
  selectors: {
    name: ".page-title",
    description: ".entry-content p:first-of-type",
    organizationType: ".organization-type",
    geographicScope: ".geographic-scope",
    focusSector: ".focus-sector",
    methodologyLinks: ".methodologies-list a",
    methodologyName: ".methodology-title",
    methodologyType: ".methodology-type",
    methodologyCategory: ".methodology-category",
    methodologyDescription: ".methodology-description",
    methodologyItmo: ".methodology-itmo",
    pddRequirements: ".pdd-requirements .requirement",
  },
}

// Example configuration for UNFCCC policies
const unfcccConfig: PolicyScraperConfig = {
  name: "UNFCCC",
  baseUrl:
    "https://unfccc.int/process-and-meetings/the-paris-agreement/nationally-determined-contributions-ndcs/nationally-determined-contributions-ndcs",
  selectors: {
    policyLinks: ".view-content .views-row a",
    nextPageButton: ".pager__item--next a",
    policyTitle: ".page-header",
    policyDescription: ".field--name-body p:first-of-type",
    policyCountry: ".field--name-field-country",
    policyEffectiveDate: ".field--name-field-effective-date",
    policyExpirationDate: ".field--name-field-expiration-date",
    policyType: ".field--name-field-type",
    policySectors: ".field--name-field-sectors .field__item",
  },
}

async function runScrapers() {
  try {
    // Run Carbon Standard scraper
    const standardScraper = new CarbonStandardScraper(verraConfig)
    await standardScraper.initialize()
    await standardScraper.scrapeStandardInfo()
    await standardScraper.close()

    // Run Policy scraper
    const policyScraper = new PolicyScraper(unfcccConfig)
    await policyScraper.initialize()
    await policyScraper.scrapePolicies()
    await policyScraper.close()

    logger.info("All scrapers completed successfully")
  } catch (error) {
    logger.error("Error running scrapers:", error)
  }
}

// Run the scrapers
runScrapers()
