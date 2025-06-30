-- CreateEnum
CREATE TYPE "project_visibility" AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "workspace_role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "project_team_role" AS ENUM ('LEAD', 'MANAGER', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER');

-- CreateEnum
CREATE TYPE "project_permission" AS ENUM ('EDIT_BASIC_INFO', 'EDIT_METHODOLOGY', 'MANAGE_TEAM', 'MANAGE_MILESTONES', 'UPLOAD_DOCUMENTS', 'VIEW_SENSITIVE_DATA', 'APPROVE_CHANGES', 'DELETE_PROJECT');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "comment_type" AS ENUM ('GENERAL', 'MILESTONE', 'RISK_ASSESSMENT', 'DOCUMENT_REVIEW', 'METHODOLOGY_DISCUSSION', 'COMPLIANCE_NOTE');

-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('PROJECT_CREATED', 'PROJECT_UPDATED', 'MILESTONE_ADDED', 'MILESTONE_COMPLETED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'DOCUMENT_UPLOADED', 'COMMENT_ADDED', 'RISK_ASSESSED', 'METHODOLOGY_CHANGED');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('PROJECT_INVITATION', 'MILESTONE_DUE', 'COMMENT_MENTION', 'DOCUMENT_SHARED', 'RISK_ALERT', 'TEAM_UPDATE', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "resource_type" AS ENUM ('DOCUMENT', 'IMAGE', 'SPREADSHEET', 'PRESENTATION', 'VIDEO', 'ARCHIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "organization_role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "change_impact" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('PDF', 'WORD', 'EXCEL', 'IMAGE', 'TEXT');

-- CreateEnum
CREATE TYPE "processing_status" AS ENUM ('UPLOADED', 'PROCESSING', 'ANALYZED', 'ERROR');

-- CreateEnum
CREATE TYPE "finding_category" AS ENUM ('METHODOLOGY', 'LOCATION', 'CREDITS', 'TIMELINE', 'BUDGET', 'RISKS', 'STAKEHOLDERS', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "compliance_status" AS ENUM ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "monitoring_status" AS ENUM ('GOOD', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "milestone_status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "verification_status" AS ENUM ('VERIFIED', 'PENDING', 'UNVERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "metric_category" AS ENUM ('ENVIRONMENTAL', 'SOCIAL', 'ECONOMIC', 'GOVERNANCE');

-- CreateEnum
CREATE TYPE "trend" AS ENUM ('INCREASING', 'DECREASING', 'STABLE');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "visibility" "project_visibility" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN "workspace_id" TEXT;

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "organization_role" NOT NULL DEFAULT 'MEMBER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "workspace_role" NOT NULL DEFAULT 'MEMBER',
    "permissions" JSONB,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "project_team_role" NOT NULL DEFAULT 'CONTRIBUTOR',
    "permissions" "project_permission"[],
    "invited_by" TEXT,
    "invited_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3),
    "status" "invitation_status" NOT NULL DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "type" "comment_type" NOT NULL DEFAULT 'GENERAL',
    "mentions" TEXT[],
    "metadata" JSONB,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectActivity" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "activity_type" NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedResource" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "resource_type" NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SatelliteAnalysis" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "analysis_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coordinates" TEXT NOT NULL,
    "analysis_area" INTEGER NOT NULL,
    "data_source" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "cloud_cover" INTEGER NOT NULL,
    "overall_risk" "risk_level" NOT NULL,
    "quality_score" INTEGER NOT NULL,
    "analysis_results" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SatelliteAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandUseData" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "land_use_class" TEXT NOT NULL,
    "area" DECIMAL(10,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "carbon_stock" DECIMAL(10,2),
    "sequestration_rate" DECIMAL(8,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandUseData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeDetection" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "from_class" TEXT NOT NULL,
    "to_class" TEXT NOT NULL,
    "area" DECIMAL(10,2) NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "impact" "change_impact" NOT NULL,
    "carbon_impact" DECIMAL(10,2) NOT NULL,
    "detected_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeDetection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAnalysis" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" "document_type" NOT NULL,
    "file_size" INTEGER NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_status" "processing_status" NOT NULL,
    "document_type" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "quality_score" INTEGER NOT NULL,
    "extracted_data" JSONB NOT NULL,
    "analysis_results" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFinding" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "finding_category" "finding_category" NOT NULL,
    "finding" TEXT NOT NULL,
    "value" TEXT,
    "confidence" DECIMAL(3,2) NOT NULL,
    "page_refs" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyComplianceAssessment" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_risk" "risk_level" NOT NULL,
    "average_score" INTEGER NOT NULL,
    "total_frameworks" INTEGER NOT NULL,
    "compliant_frameworks" INTEGER NOT NULL,
    "assessment_results" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "next_review_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyComplianceAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkCompliance" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "framework_name" TEXT NOT NULL,
    "framework_type" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "compliance_status" "compliance_status" NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "requirements_met" INTEGER NOT NULL,
    "total_requirements" INTEGER NOT NULL,
    "gaps" TEXT[],
    "recommendations" TEXT[],
    "urgent_actions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceMonitoring" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "current_value" TEXT NOT NULL,
    "threshold" TEXT NOT NULL,
    "status" "monitoring_status" NOT NULL,
    "last_checked" TIMESTAMP(3) NOT NULL,
    "next_check" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "alert_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "standard_name" TEXT NOT NULL,
    "compliant" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,
    "missing" TEXT[],
    "recommendations" TEXT[],
    "check_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "milestone_status" NOT NULL,
    "priority" "priority" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "actual_duration" INTEGER,
    "dependencies" TEXT[],
    "deliverables" TEXT[],
    "stakeholders" TEXT[],
    "estimated_cost" DECIMAL(10,2),
    "actual_cost" DECIMAL(10,2),
    "risks" JSONB,
    "kpis" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactMeasurement" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "reporting_period" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_co2_reduced" DECIMAL(12,2) NOT NULL,
    "credits_issued" INTEGER NOT NULL,
    "social_beneficiaries" INTEGER NOT NULL,
    "economic_value" DECIMAL(15,2) NOT NULL,
    "biodiversity_score" DECIMAL(5,2) NOT NULL,
    "verification_status" "verification_status" NOT NULL,
    "verifier" TEXT,
    "verification_date" TIMESTAMP(3),
    "confidence" DECIMAL(3,2) NOT NULL,
    "sdg_alignment" JSONB NOT NULL,
    "stakeholder_feedback" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactMetric" (
    "id" TEXT NOT NULL,
    "measurement_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric_category" "metric_category" NOT NULL,
    "unit" TEXT NOT NULL,
    "target" DECIMAL(15,4) NOT NULL,
    "actual" DECIMAL(15,4) NOT NULL,
    "baseline" DECIMAL(15,4) NOT NULL,
    "trend" "trend" NOT NULL,
    "methodology" TEXT NOT NULL,
    "verification_status" "verification_status" NOT NULL,
    "frequency" TEXT NOT NULL,
    "data_source" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CacheEntry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "ttl" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_hit" TIMESTAMP(3),

    CONSTRAINT "CacheEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_level_idx" ON "Role"("level");

-- CreateIndex
CREATE INDEX "Role_is_active_idx" ON "Role"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_scope_key" ON "Permission"("resource", "action", "scope");

-- CreateIndex
CREATE INDEX "Permission_resource_idx" ON "Permission"("resource");

-- CreateIndex
CREATE INDEX "Permission_action_idx" ON "Permission"("action");

-- CreateIndex
CREATE INDEX "Permission_is_active_idx" ON "Permission"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "UserRole"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "UserRole_user_id_idx" ON "UserRole"("user_id");

-- CreateIndex
CREATE INDEX "UserRole_role_id_idx" ON "UserRole"("role_id");

-- CreateIndex
CREATE INDEX "UserRole_is_active_idx" ON "UserRole"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_id_permission_id_key" ON "RolePermission"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "RolePermission_role_id_idx" ON "RolePermission"("role_id");

-- CreateIndex
CREATE INDEX "RolePermission_permission_id_idx" ON "RolePermission"("permission_id");

-- CreateIndex
CREATE INDEX "RolePermission_is_active_idx" ON "RolePermission"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_user_id_permission_id_key" ON "UserPermission"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "UserPermission_user_id_idx" ON "UserPermission"("user_id");

-- CreateIndex
CREATE INDEX "UserPermission_permission_id_idx" ON "UserPermission"("permission_id");

-- CreateIndex
CREATE INDEX "UserPermission_granted_idx" ON "UserPermission"("granted");

-- CreateIndex
CREATE INDEX "UserPermission_is_active_idx" ON "UserPermission"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_session_token_key" ON "UserSession"("session_token");

-- CreateIndex
CREATE INDEX "UserSession_user_id_idx" ON "UserSession"("user_id");

-- CreateIndex
CREATE INDEX "UserSession_session_token_idx" ON "UserSession"("session_token");

-- CreateIndex
CREATE INDEX "UserSession_is_active_idx" ON "UserSession"("is_active");

-- CreateIndex
CREATE INDEX "UserSession_expires_at_idx" ON "UserSession"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_is_active_idx" ON "Organization"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organization_id_user_id_key" ON "OrganizationMember"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "OrganizationMember_organization_id_idx" ON "OrganizationMember"("organization_id");

-- CreateIndex
CREATE INDEX "OrganizationMember_user_id_idx" ON "OrganizationMember"("user_id");

-- CreateIndex
CREATE INDEX "OrganizationMember_role_idx" ON "OrganizationMember"("role");

-- CreateIndex
CREATE INDEX "OrganizationMember_is_active_idx" ON "OrganizationMember"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_owner_id_idx" ON "Workspace"("owner_id");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_is_active_idx" ON "Workspace"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspace_id_user_id_key" ON "WorkspaceMember"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspace_id_idx" ON "WorkspaceMember"("workspace_id");

-- CreateIndex
CREATE INDEX "WorkspaceMember_user_id_idx" ON "WorkspaceMember"("user_id");

-- CreateIndex
CREATE INDEX "WorkspaceMember_role_idx" ON "WorkspaceMember"("role");

-- CreateIndex
CREATE INDEX "WorkspaceMember_is_active_idx" ON "WorkspaceMember"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTeamMember_project_id_user_id_key" ON "ProjectTeamMember"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_project_id_idx" ON "ProjectTeamMember"("project_id");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_user_id_idx" ON "ProjectTeamMember"("user_id");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_role_idx" ON "ProjectTeamMember"("role");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_status_idx" ON "ProjectTeamMember"("status");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_is_active_idx" ON "ProjectTeamMember"("is_active");

-- CreateIndex
CREATE INDEX "ProjectComment_project_id_idx" ON "ProjectComment"("project_id");

-- CreateIndex
CREATE INDEX "ProjectComment_user_id_idx" ON "ProjectComment"("user_id");

-- CreateIndex
CREATE INDEX "ProjectComment_parent_id_idx" ON "ProjectComment"("parent_id");

-- CreateIndex
CREATE INDEX "ProjectComment_type_idx" ON "ProjectComment"("type");

-- CreateIndex
CREATE INDEX "ProjectComment_created_at_idx" ON "ProjectComment"("created_at");

-- CreateIndex
CREATE INDEX "ProjectActivity_project_id_idx" ON "ProjectActivity"("project_id");

-- CreateIndex
CREATE INDEX "ProjectActivity_user_id_idx" ON "ProjectActivity"("user_id");

-- CreateIndex
CREATE INDEX "ProjectActivity_action_idx" ON "ProjectActivity"("action");

-- CreateIndex
CREATE INDEX "ProjectActivity_timestamp_idx" ON "ProjectActivity"("timestamp");

-- CreateIndex
CREATE INDEX "Notification_recipient_id_idx" ON "Notification"("recipient_id");

-- CreateIndex
CREATE INDEX "Notification_sender_id_idx" ON "Notification"("sender_id");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_is_read_idx" ON "Notification"("is_read");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- CreateIndex
CREATE INDEX "SharedResource_project_id_idx" ON "SharedResource"("project_id");

-- CreateIndex
CREATE INDEX "SharedResource_uploaded_by_idx" ON "SharedResource"("uploaded_by");

-- CreateIndex
CREATE INDEX "SharedResource_type_idx" ON "SharedResource"("type");

-- CreateIndex
CREATE INDEX "SharedResource_tags_idx" ON "SharedResource"("tags");

-- CreateIndex
CREATE INDEX "SharedResource_is_public_idx" ON "SharedResource"("is_public");

-- CreateIndex
CREATE INDEX "SatelliteAnalysis_project_id_idx" ON "SatelliteAnalysis"("project_id");

-- CreateIndex
CREATE INDEX "SatelliteAnalysis_analysis_date_idx" ON "SatelliteAnalysis"("analysis_date");

-- CreateIndex
CREATE INDEX "SatelliteAnalysis_overall_risk_idx" ON "SatelliteAnalysis"("overall_risk");

-- CreateIndex
CREATE INDEX "LandUseData_analysis_id_idx" ON "LandUseData"("analysis_id");

-- CreateIndex
CREATE INDEX "LandUseData_land_use_class_idx" ON "LandUseData"("land_use_class");

-- CreateIndex
CREATE INDEX "ChangeDetection_analysis_id_idx" ON "ChangeDetection"("analysis_id");

-- CreateIndex
CREATE INDEX "ChangeDetection_impact_idx" ON "ChangeDetection"("impact");

-- CreateIndex
CREATE INDEX "ChangeDetection_detected_date_idx" ON "ChangeDetection"("detected_date");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_project_id_idx" ON "DocumentAnalysis"("project_id");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_processing_status_idx" ON "DocumentAnalysis"("processing_status");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_document_type_idx" ON "DocumentAnalysis"("document_type");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_upload_date_idx" ON "DocumentAnalysis"("upload_date");

-- CreateIndex
CREATE INDEX "DocumentFinding_document_id_idx" ON "DocumentFinding"("document_id");

-- CreateIndex
CREATE INDEX "DocumentFinding_finding_category_idx" ON "DocumentFinding"("finding_category");

-- CreateIndex
CREATE INDEX "PolicyComplianceAssessment_project_id_idx" ON "PolicyComplianceAssessment"("project_id");

-- CreateIndex
CREATE INDEX "PolicyComplianceAssessment_assessment_date_idx" ON "PolicyComplianceAssessment"("assessment_date");

-- CreateIndex
CREATE INDEX "PolicyComplianceAssessment_overall_risk_idx" ON "PolicyComplianceAssessment"("overall_risk");

-- CreateIndex
CREATE INDEX "PolicyComplianceAssessment_next_review_date_idx" ON "PolicyComplianceAssessment"("next_review_date");

-- CreateIndex
CREATE INDEX "FrameworkCompliance_assessment_id_idx" ON "FrameworkCompliance"("assessment_id");

-- CreateIndex
CREATE INDEX "FrameworkCompliance_framework_name_idx" ON "FrameworkCompliance"("framework_name");

-- CreateIndex
CREATE INDEX "FrameworkCompliance_compliance_status_idx" ON "FrameworkCompliance"("compliance_status");

-- CreateIndex
CREATE INDEX "ComplianceMonitoring_assessment_id_idx" ON "ComplianceMonitoring"("assessment_id");

-- CreateIndex
CREATE INDEX "ComplianceMonitoring_status_idx" ON "ComplianceMonitoring"("status");

-- CreateIndex
CREATE INDEX "ComplianceMonitoring_next_check_idx" ON "ComplianceMonitoring"("next_check");

-- CreateIndex
CREATE INDEX "ComplianceCheck_document_id_idx" ON "ComplianceCheck"("document_id");

-- CreateIndex
CREATE INDEX "ComplianceCheck_standard_name_idx" ON "ComplianceCheck"("standard_name");

-- CreateIndex
CREATE INDEX "ComplianceCheck_compliant_idx" ON "ComplianceCheck"("compliant");

-- CreateIndex
CREATE INDEX "ProjectMilestone_project_id_idx" ON "ProjectMilestone"("project_id");

-- CreateIndex
CREATE INDEX "ProjectMilestone_status_idx" ON "ProjectMilestone"("status");

-- CreateIndex
CREATE INDEX "ProjectMilestone_priority_idx" ON "ProjectMilestone"("priority");

-- CreateIndex
CREATE INDEX "ProjectMilestone_start_date_idx" ON "ProjectMilestone"("start_date");

-- CreateIndex
CREATE INDEX "ProjectMilestone_end_date_idx" ON "ProjectMilestone"("end_date");

-- CreateIndex
CREATE INDEX "ImpactMeasurement_project_id_idx" ON "ImpactMeasurement"("project_id");

-- CreateIndex
CREATE INDEX "ImpactMeasurement_reporting_period_idx" ON "ImpactMeasurement"("reporting_period");

-- CreateIndex
CREATE INDEX "ImpactMeasurement_verification_status_idx" ON "ImpactMeasurement"("verification_status");

-- CreateIndex
CREATE INDEX "ImpactMeasurement_start_date_idx" ON "ImpactMeasurement"("start_date");

-- CreateIndex
CREATE INDEX "ImpactMeasurement_end_date_idx" ON "ImpactMeasurement"("end_date");

-- CreateIndex
CREATE INDEX "ImpactMetric_measurement_id_idx" ON "ImpactMetric"("measurement_id");

-- CreateIndex
CREATE INDEX "ImpactMetric_metric_category_idx" ON "ImpactMetric"("metric_category");

-- CreateIndex
CREATE INDEX "ImpactMetric_verification_status_idx" ON "ImpactMetric"("verification_status");

-- CreateIndex
CREATE INDEX "ImpactMetric_last_updated_idx" ON "ImpactMetric"("last_updated");

-- CreateIndex
CREATE UNIQUE INDEX "CacheEntry_key_key" ON "CacheEntry"("key");

-- CreateIndex
CREATE INDEX "CacheEntry_key_idx" ON "CacheEntry"("key");

-- CreateIndex
CREATE INDEX "CacheEntry_ttl_idx" ON "CacheEntry"("ttl");

-- CreateIndex
CREATE INDEX "CacheEntry_tags_idx" ON "CacheEntry"("tags");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entity_id_idx" ON "AuditLog"("entity_id");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "UserProfile_is_active_idx" ON "UserProfile"("is_active");

-- CreateIndex
CREATE INDEX "UserProfile_email_idx" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "Project_visibility_idx" ON "Project"("visibility");

-- CreateIndex
CREATE INDEX "Project_workspace_id_idx" ON "Project"("workspace_id");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ProjectComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SatelliteAnalysis" ADD CONSTRAINT "SatelliteAnalysis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandUseData" ADD CONSTRAINT "LandUseData_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "SatelliteAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeDetection" ADD CONSTRAINT "ChangeDetection_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "SatelliteAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFinding" ADD CONSTRAINT "DocumentFinding_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "DocumentAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyComplianceAssessment" ADD CONSTRAINT "PolicyComplianceAssessment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkCompliance" ADD CONSTRAINT "FrameworkCompliance_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "PolicyComplianceAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceMonitoring" ADD CONSTRAINT "ComplianceMonitoring_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "PolicyComplianceAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "DocumentAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMeasurement" ADD CONSTRAINT "ImpactMeasurement_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "ImpactMeasurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
