import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed Carbon Standards
  const verraStandard = await prisma.carbonStandard.upsert({
    where: { name: 'Verified Carbon Standard (VCS)' },
    update: {},
    create: {
      name: 'Verified Carbon Standard (VCS)',
      abbreviation: 'VCS',
      introducingEntity: 'Verra',
      organizationType: 'Non-profit',
      geographicScope: 'Global',
      focusSector: 'Multiple sectors',
      description: 'The Verified Carbon Standard (VCS) Program is the world\'s most used voluntary greenhouse gas (GHG) program.',
      websiteUrl: 'https://verra.org/programs/verified-carbon-standard/',
      icroaApproved: true,
      corsiaApproved: true,
      correspondingAdjustmentLabel: 'VCS_CA',
      totalMethodologies: 50,
    },
  })

  const goldStandard = await prisma.carbonStandard.upsert({
    where: { name: 'Gold Standard' },
    update: {},
    create: {
      name: 'Gold Standard',
      abbreviation: 'GS',
      introducingEntity: 'Gold Standard Foundation',
      organizationType: 'Non-profit',
      geographicScope: 'Global',
      focusSector: 'Sustainable development',
      description: 'Gold Standard certifies projects that reduce carbon emissions and improve lives.',
      websiteUrl: 'https://www.goldstandard.org/',
      icroaApproved: true,
      corsiaApproved: false,
      correspondingAdjustmentLabel: 'GS_CA',
      totalMethodologies: 25,
    },
  })

  const acr = await prisma.carbonStandard.upsert({
    where: { name: 'American Carbon Registry' },
    update: {},
    create: {
      name: 'American Carbon Registry',
      abbreviation: 'ACR',
      introducingEntity: 'Winrock International',
      organizationType: 'Non-profit',
      geographicScope: 'Americas',
      focusSector: 'Forest and agricultural',
      description: 'ACR is a leading carbon offset registry for the voluntary and compliance carbon markets.',
      websiteUrl: 'https://americancarbonregistry.org/',
      icroaApproved: true,
      corsiaApproved: true,
      correspondingAdjustmentLabel: 'ACR_CA',
      totalMethodologies: 15,
    },
  })

  // Seed Sample Methodologies
  const afoluMethodology = await prisma.methodology.create({
    data: {
      standardId: verraStandard.id,
      name: 'Afforestation, Reforestation and Revegetation',
      type: 'Removal',
      category: 'Agriculture, Forestry and Other Land Use',
      link: 'https://verra.org/methodologies/vm0006-methodology-for-carbon-accounting-for-mosaic-and-landscape-scale-redd-projects/',
      itmoAcceptance: true,
      description: 'Methodology for afforestation, reforestation and revegetation projects that sequester carbon in biomass and soils.',
    },
  })

  const renewableEnergyMethodology = await prisma.methodology.create({
    data: {
      standardId: goldStandard.id,
      name: 'Grid-connected Renewable Electricity Generation',
      type: 'Avoidance',
      category: 'Energy',
      link: 'https://www.goldstandard.org/our-work/innovations-consultations/renewable-energy-methodology',
      itmoAcceptance: false,
      description: 'Methodology for renewable energy projects that displace grid electricity.',
    },
  })

  // Seed PDD Requirements
  await prisma.pDDRequirement.createMany({
    data: [
      {
        standardId: verraStandard.id,
        methodologyId: afoluMethodology.id,
        sectionName: 'Project Description',
        description: 'Detailed description of the project activities and objectives',
        required: true,
        guidanceNotes: 'Include project location, timeline, and key stakeholders',
      },
      {
        standardId: verraStandard.id,
        methodologyId: afoluMethodology.id,
        sectionName: 'Baseline Scenario',
        description: 'Description of the baseline scenario and methodology',
        required: true,
        guidanceNotes: 'Must demonstrate additionality and establish baseline emissions',
      },
      {
        standardId: goldStandard.id,
        methodologyId: renewableEnergyMethodology.id,
        sectionName: 'Sustainable Development Benefits',
        description: 'Description of sustainable development co-benefits',
        required: true,
        guidanceNotes: 'Align with UN Sustainable Development Goals',
      },
    ],
  })

  // Seed Certification Process Steps
  await prisma.certificationProcess.createMany({
    data: [
      {
        standardId: verraStandard.id,
        stepNumber: 1,
        stepName: 'Project Development',
        description: 'Develop project design document (PDD)',
        estimatedDuration: '3-6 months',
        estimatedCost: '$5,000-$15,000',
        responsibleParty: 'Project Developer',
        documentationRequired: 'Project Design Document (PDD)',
      },
      {
        standardId: verraStandard.id,
        stepNumber: 2,
        stepName: 'Validation',
        description: 'Third-party validation of project design',
        estimatedDuration: '2-4 months',
        estimatedCost: '$10,000-$25,000',
        responsibleParty: 'Validation/Verification Body (VVB)',
        documentationRequired: 'Validation Report',
      },
      {
        standardId: verraStandard.id,
        stepNumber: 3,
        stepName: 'Registration',
        description: 'Project registration with Verra',
        estimatedDuration: '1-2 months',
        estimatedCost: '$2,000-$5,000',
        responsibleParty: 'Verra',
        documentationRequired: 'Registration documents and fees',
      },
    ],
  })

  // Seed Physical Risk Scenarios
  const rcp45Scenario = await prisma.physicalRiskScenario.create({
    data: {
      name: 'RCP4.5 - Moderate Climate Change',
      description: 'Representative Concentration Pathway 4.5 - stabilization scenario',
      source: 'IPCC AR6',
      timeHorizon: '2050',
      ssp: 'SSP2',
      rcp: 'RCP4.5',
    },
  })

  const rcp85Scenario = await prisma.physicalRiskScenario.create({
    data: {
      name: 'RCP8.5 - High Climate Change',
      description: 'Representative Concentration Pathway 8.5 - high emissions scenario',
      source: 'IPCC AR6',
      timeHorizon: '2100',
      ssp: 'SSP5',
      rcp: 'RCP8.5',
    },
  })

  // Seed Physical Risk Variables
  const tempVariable = await prisma.physicalRiskVariable.create({
    data: {
      name: 'Mean Temperature Change',
      description: 'Change in annual mean temperature',
      unit: '°C',
      category: 'temperature',
    },
  })

  const precipVariable = await prisma.physicalRiskVariable.create({
    data: {
      name: 'Annual Precipitation Change',
      description: 'Change in annual precipitation',
      unit: '%',
      category: 'precipitation',
    },
  })

  // Seed Sample Physical Risk Data
  await prisma.physicalRiskData.createMany({
    data: [
      {
        scenarioId: rcp45Scenario.id,
        variableId: tempVariable.id,
        countryCode: 'USA',
        regionCode: 'CA',
        timePeriod: '2040-2050',
        value: '+2.1',
        confidence: 0.85,
        dataSource: 'NASA GISS',
      },
      {
        scenarioId: rcp85Scenario.id,
        variableId: tempVariable.id,
        countryCode: 'USA',
        regionCode: 'CA',
        timePeriod: '2090-2100',
        value: '+4.8',
        confidence: 0.75,
        dataSource: 'NASA GISS',
      },
      {
        scenarioId: rcp45Scenario.id,
        variableId: precipVariable.id,
        countryCode: 'BRA',
        regionCode: 'AM',
        timePeriod: '2040-2050',
        value: '-15.2',
        confidence: 0.65,
        dataSource: 'NOAA',
      },
    ],
  })

  // Seed Sample Policies
  await prisma.policy.createMany({
    data: [
      {
        title: 'California Cap-and-Trade Program',
        description: 'Economy-wide cap-and-trade program for greenhouse gas emissions',
        countryCode: 'USA',
        regionCode: 'CA',
        effectiveDate: new Date('2013-01-01'),
        policyType: 'REGULATION',
        status: 'ACTIVE',
        source: 'California Air Resources Board',
        sourceUrl: 'https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program',
        sectors: ['Energy', 'Industry', 'Transportation'],
        impact: 'Reduces GHG emissions by 16% below 1990 levels by 2030',
        compliance: 'Mandatory participation for covered entities above threshold',
      },
      {
        title: 'EU Renewable Energy Directive',
        description: 'Directive promoting the use of renewable energy sources',
        countryCode: 'EU',
        effectiveDate: new Date('2018-12-11'),
        expirationDate: new Date('2030-12-31'),
        policyType: 'MANDATE',
        status: 'ACTIVE',
        source: 'European Commission',
        sourceUrl: 'https://energy.ec.europa.eu/topics/renewable-energy/renewable-energy-directive-targets-and-rules_en',
        sectors: ['Energy', 'Transport', 'Heating'],
        impact: '32% renewable energy target by 2030',
        compliance: 'Binding targets for member states',
      },
    ],
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Created:')
  console.log('  - 3 Carbon Standards (VCS, Gold Standard, ACR)')
  console.log('  - 2 Methodologies (AFOLU, Renewable Energy)')
  console.log('  - 3 PDD Requirements')
  console.log('  - 3 Certification Process Steps')
  console.log('  - 2 Physical Risk Scenarios')
  console.log('  - 2 Physical Risk Variables')
  console.log('  - 3 Physical Risk Data Points')
  console.log('  - 2 Climate Policies')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
