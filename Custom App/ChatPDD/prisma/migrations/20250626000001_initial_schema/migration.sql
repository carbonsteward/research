-- CreateEnum
CREATE TYPE "user_profile_type" AS ENUM ('LANDOWNER', 'INVESTOR', 'POLICY_ANALYST', 'PROJECT_DEVELOPER', 'CONSULTANT', 'VALIDATOR', 'BROKER', 'RESEARCHER');

-- CreateEnum
CREATE TYPE "project_type" AS ENUM ('AFOLU', 'ENERGY', 'TRANSPORT', 'MANUFACTURING', 'WASTE', 'BUILDINGS', 'OTHER');

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('PLANNING', 'DESIGN', 'VALIDATION', 'IMPLEMENTATION', 'MONITORING', 'VERIFICATION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "risk_type" AS ENUM ('PHYSICAL', 'TRANSITIONAL', 'REGULATORY', 'MARKET', 'OPERATIONAL', 'REPUTATIONAL');

-- CreateEnum
CREATE TYPE "risk_level" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "policy_type" AS ENUM ('REGULATION', 'STANDARD', 'INCENTIVE', 'TAX', 'SUBSIDY', 'MANDATE', 'VOLUNTARY', 'INTERNATIONAL_AGREEMENT');

-- CreateEnum
CREATE TYPE "policy_status" AS ENUM ('DRAFT', 'PROPOSED', 'ACTIVE', 'AMENDED', 'EXPIRED', 'REPEALED');

-- CreateTable
CREATE TABLE "CarbonStandard" (
    "standard_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "introducing_entity" TEXT,
    "organization_type" TEXT,
    "geographic_scope" TEXT,
    "focus_sector" TEXT,
    "description" TEXT,
    "website_url" TEXT,
    "icroa_approved" BOOLEAN NOT NULL DEFAULT false,
    "corsia_approved" BOOLEAN NOT NULL DEFAULT false,
    "corresponding_adjustment_label" TEXT,
    "total_methodologies" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarbonStandard_pkey" PRIMARY KEY ("standard_id")
);

-- CreateTable
CREATE TABLE "Methodology" (
    "methodology_id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "category" TEXT,
    "link" TEXT,
    "itmo_acceptance" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Methodology_pkey" PRIMARY KEY ("methodology_id")
);

-- CreateTable
CREATE TABLE "PDDRequirement" (
    "requirement_id" TEXT NOT NULL,
    "standard_id" TEXT,
    "methodology_id" TEXT,
    "section_name" TEXT,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "guidance_notes" TEXT,
    "template_url" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PDDRequirement_pkey" PRIMARY KEY ("requirement_id")
);

-- CreateTable
CREATE TABLE "CertificationProcess" (
    "process_id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "step_name" TEXT,
    "description" TEXT,
    "estimated_duration" TEXT,
    "estimated_cost" TEXT,
    "responsible_party" TEXT,
    "documentation_required" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificationProcess_pkey" PRIMARY KEY ("process_id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_type" "user_profile_type" NOT NULL,
    "organization" TEXT,
    "country" TEXT,
    "region" TEXT,
    "expertise" TEXT[],
    "preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "project_type" "project_type" NOT NULL,
    "status" "project_status" NOT NULL DEFAULT 'PLANNING',
    "country" TEXT NOT NULL,
    "region" TEXT,
    "coordinates" TEXT,
    "estimatedCredits" INTEGER,
    "budget" DECIMAL(65,30),
    "timeline" TEXT,
    "methodology_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "methodology_id" TEXT,
    "risk_type" "risk_type" NOT NULL,
    "risk_level" "risk_level" NOT NULL,
    "risk_category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mitigation_steps" TEXT[],
    "confidence" DECIMAL(3,2) NOT NULL,
    "data_source" TEXT NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "region_code" TEXT,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3),
    "policy_type" "policy_type" NOT NULL,
    "status" "policy_status" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "sectors" TEXT[],
    "impact" TEXT,
    "compliance" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalRiskScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "time_horizon" TEXT NOT NULL,
    "ssp" TEXT,
    "rcp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysicalRiskScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalRiskVariable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysicalRiskVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalRiskData" (
    "id" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "variable_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "region_code" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "time_period" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "data_source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysicalRiskData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarbonStandard_name_key" ON "CarbonStandard"("name");

-- CreateIndex
CREATE INDEX "CarbonStandard_name_idx" ON "CarbonStandard"("name");

-- CreateIndex
CREATE INDEX "CarbonStandard_organization_type_idx" ON "CarbonStandard"("organization_type");

-- CreateIndex
CREATE INDEX "CarbonStandard_geographic_scope_idx" ON "CarbonStandard"("geographic_scope");

-- CreateIndex
CREATE INDEX "CarbonStandard_focus_sector_idx" ON "CarbonStandard"("focus_sector");

-- CreateIndex
CREATE UNIQUE INDEX "Methodology_standard_id_name_key" ON "Methodology"("standard_id", "name");

-- CreateIndex
CREATE INDEX "Methodology_standard_id_idx" ON "Methodology"("standard_id");

-- CreateIndex
CREATE INDEX "Methodology_type_idx" ON "Methodology"("type");

-- CreateIndex
CREATE INDEX "Methodology_category_idx" ON "Methodology"("category");

-- CreateIndex
CREATE INDEX "Methodology_itmo_acceptance_idx" ON "Methodology"("itmo_acceptance");

-- CreateIndex
CREATE INDEX "PDDRequirement_standard_id_idx" ON "PDDRequirement"("standard_id");

-- CreateIndex
CREATE INDEX "PDDRequirement_methodology_id_idx" ON "PDDRequirement"("methodology_id");

-- CreateIndex
CREATE INDEX "PDDRequirement_required_idx" ON "PDDRequirement"("required");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationProcess_standard_id_step_number_key" ON "CertificationProcess"("standard_id", "step_number");

-- CreateIndex
CREATE INDEX "CertificationProcess_standard_id_idx" ON "CertificationProcess"("standard_id");

-- CreateIndex
CREATE INDEX "CertificationProcess_step_number_idx" ON "CertificationProcess"("step_number");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "UserProfile_profile_type_idx" ON "UserProfile"("profile_type");

-- CreateIndex
CREATE INDEX "UserProfile_country_idx" ON "UserProfile"("country");

-- CreateIndex
CREATE INDEX "Project_user_id_idx" ON "Project"("user_id");

-- CreateIndex
CREATE INDEX "Project_project_type_idx" ON "Project"("project_type");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_country_idx" ON "Project"("country");

-- CreateIndex
CREATE INDEX "Project_methodology_id_idx" ON "Project"("methodology_id");

-- CreateIndex
CREATE INDEX "RiskAssessment_project_id_idx" ON "RiskAssessment"("project_id");

-- CreateIndex
CREATE INDEX "RiskAssessment_methodology_id_idx" ON "RiskAssessment"("methodology_id");

-- CreateIndex
CREATE INDEX "RiskAssessment_risk_type_idx" ON "RiskAssessment"("risk_type");

-- CreateIndex
CREATE INDEX "RiskAssessment_risk_level_idx" ON "RiskAssessment"("risk_level");

-- CreateIndex
CREATE INDEX "RiskAssessment_assessment_date_idx" ON "RiskAssessment"("assessment_date");

-- CreateIndex
CREATE INDEX "Policy_country_code_idx" ON "Policy"("country_code");

-- CreateIndex
CREATE INDEX "Policy_region_code_idx" ON "Policy"("region_code");

-- CreateIndex
CREATE INDEX "Policy_policy_type_idx" ON "Policy"("policy_type");

-- CreateIndex
CREATE INDEX "Policy_status_idx" ON "Policy"("status");

-- CreateIndex
CREATE INDEX "Policy_effective_date_idx" ON "Policy"("effective_date");

-- CreateIndex
CREATE INDEX "Policy_expiration_date_idx" ON "Policy"("expiration_date");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalRiskScenario_name_key" ON "PhysicalRiskScenario"("name");

-- CreateIndex
CREATE INDEX "PhysicalRiskScenario_time_horizon_idx" ON "PhysicalRiskScenario"("time_horizon");

-- CreateIndex
CREATE INDEX "PhysicalRiskScenario_ssp_idx" ON "PhysicalRiskScenario"("ssp");

-- CreateIndex
CREATE INDEX "PhysicalRiskScenario_rcp_idx" ON "PhysicalRiskScenario"("rcp");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalRiskVariable_name_key" ON "PhysicalRiskVariable"("name");

-- CreateIndex
CREATE INDEX "PhysicalRiskVariable_category_idx" ON "PhysicalRiskVariable"("category");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalRiskData_scenario_id_variable_id_country_code_region_code_time_period_key" ON "PhysicalRiskData"("scenario_id", "variable_id", "country_code", "region_code", "time_period");

-- CreateIndex
CREATE INDEX "PhysicalRiskData_scenario_id_idx" ON "PhysicalRiskData"("scenario_id");

-- CreateIndex
CREATE INDEX "PhysicalRiskData_variable_id_idx" ON "PhysicalRiskData"("variable_id");

-- CreateIndex
CREATE INDEX "PhysicalRiskData_country_code_idx" ON "PhysicalRiskData"("country_code");

-- CreateIndex
CREATE INDEX "PhysicalRiskData_region_code_idx" ON "PhysicalRiskData"("region_code");

-- CreateIndex
CREATE INDEX "PhysicalRiskData_time_period_idx" ON "PhysicalRiskData"("time_period");

-- AddForeignKey
ALTER TABLE "Methodology" ADD CONSTRAINT "Methodology_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "CarbonStandard"("standard_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDDRequirement" ADD CONSTRAINT "PDDRequirement_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "CarbonStandard"("standard_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDDRequirement" ADD CONSTRAINT "PDDRequirement_methodology_id_fkey" FOREIGN KEY ("methodology_id") REFERENCES "Methodology"("methodology_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationProcess" ADD CONSTRAINT "CertificationProcess_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "CarbonStandard"("standard_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_methodology_id_fkey" FOREIGN KEY ("methodology_id") REFERENCES "Methodology"("methodology_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_methodology_id_fkey" FOREIGN KEY ("methodology_id") REFERENCES "Methodology"("methodology_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalRiskData" ADD CONSTRAINT "PhysicalRiskData_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "PhysicalRiskScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalRiskData" ADD CONSTRAINT "PhysicalRiskData_variable_id_fkey" FOREIGN KEY ("variable_id") REFERENCES "PhysicalRiskVariable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
