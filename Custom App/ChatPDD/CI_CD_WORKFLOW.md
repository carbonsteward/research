# CI/CD Workflow Documentation

This document outlines the automated testing and deployment workflows for the Carbon Mitigation Project Feasibility Study Assistant.

## Overview

Our CI/CD pipeline uses GitHub Actions to automate testing, quality checks, and deployments to staging and production environments. The workflow is designed to ensure code quality, catch issues early, and provide a smooth deployment process.

## Current Implementation Status

**✅ COMPLETED (Story 1.1):**
- Git repository foundation with proper tracking of all project files
- Comprehensive .gitignore for Next.js + pnpm development
- Branch structure (main/develop) with workflow documentation
- Pre-commit hooks for code quality enforcement
- Conventional commit standards for automated changelog generation

**✅ COMPLETED (Story 1.2):**
- Basic CI Pipeline Implementation with GitHub Actions
- TypeScript compilation and ESLint validation automation
- Security vulnerability scanning with audit-ci
- Code quality checks and file size monitoring
- pnpm caching for improved performance
- Parallel job execution with proper dependency management
- Comprehensive CI pipeline documentation

**🚧 IN PROGRESS:**
- Story 1.3: Comprehensive Test Automation
- Story 1.4: Environment Management and Configuration
- Story 1.5: Database Migration Automation
- Story 1.6: Deployment Automation and Optimization
- Story 1.7: Security and Monitoring Integration

## Workflow Components

### Continuous Integration (CI)

The CI workflow runs on every push to the `main` and `develop` branches, as well as on all pull requests targeting these branches. It consists of the following jobs:

1. **Lint**: Runs ESLint and TypeScript type checking to ensure code quality and consistency.
2. **Test**: Runs unit and integration tests using Jest.
3. **E2E**: Runs end-to-end tests using Playwright across multiple browsers and device viewports.

### Continuous Deployment (CD)

The CD workflow automatically deploys the application to different environments based on the branch:

1. **Staging Deployment**: Triggered on pushes to the `develop` branch.
2. **Production Deployment**: Triggered on pushes to the `main` branch, after approval.

## Environment Setup

The workflow uses the following environments:

1. **Staging**: For testing new features before they go to production.
2. **Production-Approval**: A manual approval gate before deploying to production.
3. **Production**: The live environment for end users.

## Required Secrets

The following secrets need to be configured in your GitHub repository:

- `DATABASE_URL`: Connection string for the database
- `CLIMATE_POLICY_RADAR_API_KEY`: API key for Climate Policy Radar
- `VERCEL_TOKEN`: API token for Vercel deployments
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `SLACK_WEBHOOK`: Webhook URL for Slack notifications
- `CODECOV_TOKEN`: Token for uploading coverage reports to Codecov

## Workflow Diagram

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Lint     │────▶│    Test     │────▶│     E2E     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────────────┐     ┌─────────────────────────┐
│  Deploy to Staging  │────▶│ Production Approval Gate │
└─────────────────────┘     └─────────────────────────┘
                                               │
                                               ▼
                                      ┌─────────────────────┐
                                      │ Deploy to Production │
                                      └─────────────────────┘
\`\`\`

## Running Tests Locally

Before pushing your changes, you can run the tests locally:

\`\`\`bash
# Run linting and type checking
npm run lint
npm run type-check

# Run unit and integration tests
npm run test

# Run end-to-end tests
npm run test:e2e
\`\`\`

## Deployment Process

1. **Staging Deployment**:
   - Automatically triggered on pushes to the `develop` branch
   - Builds and deploys the application to the staging environment
   - Runs database migrations
   - Sends a notification to the deployments Slack channel

2. **Production Deployment**:
   - Requires approval after staging deployment
   - Builds and deploys the application to the production environment
   - Runs database migrations
   - Creates a GitHub release with auto-generated release notes
   - Sends a notification to the deployments Slack channel

## Troubleshooting

If you encounter issues with the CI/CD pipeline:

1. Check the GitHub Actions logs for detailed error messages
2. Verify that all required secrets are properly configured
3. Ensure your tests are passing locally before pushing
4. Check that your database migrations are compatible with the production schema
