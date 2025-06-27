export interface ScraperConfig {
  name: string
  baseUrl: string
  selectors: Record<string, string>
}

export interface StandardScraperConfig extends ScraperConfig {
  methodologyListUrl?: string
  selectors: {
    name: string
    description: string
    organizationType: string
    geographicScope: string
    focusSector: string
    methodologyLinks: string
    methodologyName: string
    methodologyType: string
    methodologyCategory: string
    methodologyDescription: string
    methodologyItmo: string
    pddRequirements?: string
  }
}

export interface PolicyScraperConfig extends ScraperConfig {
  selectors: {
    policyLinks: string
    nextPageButton: string
    policyTitle: string
    policyDescription: string
    policyCountry: string
    policyEffectiveDate: string
    policyExpirationDate: string
    policyType: string
    policySectors: string
  }
}
