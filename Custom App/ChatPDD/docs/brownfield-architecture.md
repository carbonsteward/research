# ChatPDD Brownfield Architecture Document

## Introduction
This document captures the CURRENT STATE of the ChatPDD (Carbon Mitigation Project Feasibility Study Assistant) codebase, focusing on the technical reality for CI/CD and development workflow modernization. It serves as a reference for AI agents working on the brownfield enhancement workflow to implement comprehensive CI/CD pipelines and deployment infrastructure.

### Document Scope
**Focused on areas relevant to: CI/CD Pipeline Implementation & Development Workflow Modernization**

This analysis emphasizes the technical debt, infrastructure gaps, and modernization needs for implementing robust CI/CD workflows, testing automation, and deployment processes for the existing Next.js application.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-06-27 | 1.0 | Initial brownfield analysis for CI/CD modernization | Claude |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System
- **Main Entry**: `app/page.tsx` (Next.js App Router)
- **Layout**: `app/layout.tsx` (Global layout with branding)
- **Configuration**: `next.config.mjs`, `package.json`, `tsconfig.json`
- **Database**: `prisma/schema.prisma` (PostgreSQL schema)
- **API Routes**: `app/api/` (Next.js API routes)
- **Testing**: `jest.config.js`, `playwright.config.js`, `__tests__/`
- **Environment**: `.env.example` (environment variables template)

### CI/CD Implementation Focus Areas
**CRITICAL GAPS IDENTIFIED:**
- **NO GitHub Actions workflows exist** (`.github/` directory missing)
- **CI_CD_WORKFLOW.md exists but no implementation** (documentation without code)
- **Deployment configuration issues** (Vercel deployment problems mentioned)
- **Git tracking issues** (all files currently untracked)
- **Missing environment management** (no staging/production separation)

## High Level Architecture

### Technical Summary
**Current Reality**: Well-structured Next.js 15 application with modern React 19, comprehensive database schema, and solid testing foundation BUT lacks essential CI/CD infrastructure and deployment automation.

**CI/CD Modernization Needs**: Complete implementation of GitHub Actions workflows, environment management, automated testing pipelines, and deployment automation.

### Actual Tech Stack (from package.json)
| Category | Technology | Version | CI/CD Notes |
|----------|------------|---------|-------------|
| Framework | Next.js | 15.2.4 | Requires build optimization for CI |
| Runtime | React | 19 | Latest stable, good for CI |
| Database | PostgreSQL | latest | Needs migration strategy |
| ORM | Prisma | latest | Migration commands ready |
| Package Manager | pnpm | 10.8.1 | Faster CI builds |
| Testing | Jest | latest | Unit/integration ready |
| E2E Testing | Playwright | latest | Multi-browser configured |
| TypeScript | TypeScript | ^5 | Type checking in CI |
| Validation | Zod | latest | Runtime validation |
| Styling | Tailwind CSS | 3.4.1 | Build-time CSS processing |

### Repository Structure Reality Check
- **Type**: Monorepo (single Next.js app with comprehensive structure)
- **Package Manager**: pnpm (specified in package.json)
- **Git Status**: **CRITICAL ISSUE** - All files untracked, no initial commit
- **Deployment**: Vercel configuration exists but deployment failing
- **CI/CD**: No GitHub Actions workflows implemented

## Source Tree and Module Organization

### Project Structure (Actual)
```
ChatPDD/
├── app/                     # Next.js App Router (main application)
│   ├── api/                 # API routes (comprehensive endpoint structure)
│   │   ├── health/          # Health check endpoint
│   │   ├── methodologies/   # Methodology CRUD + recommendations
│   │   ├── standards/       # Carbon standards API
│   │   ├── projects/        # Project management
│   │   ├── risks/           # Risk assessment APIs
│   │   └── policies/        # Policy data API
│   ├── components-demo/     # Component playground
│   ├── dashboard/           # Main dashboard
│   ├── methodologies/       # Methodology explorer
│   ├── onboarding/          # User onboarding flow
│   ├── project/             # Project creation workflow
│   └── risks/               # Risk visualization
├── components/              # React components (shadcn/ui + custom)
│   ├── ui/                  # 40+ shadcn/ui components
│   ├── magicui/             # Enhanced UI components
│   └── [feature-components] # Feature-specific components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and database connection
├── services/                # Business logic and validation
├── scrapers/                # Data scraping utilities
├── utils/                   # Shared utilities and logging
├── types/                   # TypeScript type definitions
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Comprehensive 372-line schema
│   ├── migrations/          # Database migrations
│   └── seed.ts             # Database seeding
├── __tests__/               # Testing infrastructure
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # Playwright E2E tests
├── scripts/                 # Build and utility scripts
└── public/                  # Static assets
```

### Key Modules and Their Purpose
- **API Layer**: Comprehensive REST API with 8+ endpoint groups
- **Database Layer**: PostgreSQL with Prisma ORM, complex relational schema
- **Frontend Layer**: Next.js App Router with React 19 and Tailwind CSS
- **Validation Service**: Zod-based validation with database integrity checks
- **Testing Infrastructure**: Jest + Playwright with good coverage setup
- **Scraping System**: Automated data collection from carbon standard websites

## Technical Debt and Known Issues

### Critical CI/CD Infrastructure Gaps
1. **No GitHub Actions Workflows**: Complete absence of CI/CD automation
2. **Deployment Configuration Issues**: Vercel deployment problems mentioned in git status
3. **Git Repository Setup**: All files untracked, no proper initial commit
4. **Environment Management**: No staging/production environment separation
5. **Database Migration Strategy**: No automated migration deployment
6. **Security Management**: No secrets management for CI/CD

### Build and Configuration Issues
1. **Next.js Config**: Build optimizations disabled (`ignoreBuildErrors: true`)
2. **ESLint**: Build-time linting disabled (`ignoreDuringBuilds: true`)
3. **Image Optimization**: Disabled (`unoptimized: true`)
4. **TypeScript**: Build errors ignored for development convenience

### Testing Infrastructure Gaps
1. **Test Scripts Missing**: No test scripts in package.json
2. **CI Environment**: Test configurations not optimized for CI
3. **Test Coverage**: No coverage reporting configured
4. **E2E Dependencies**: Server setup needed for Playwright

### Deployment and Infrastructure Debt
1. **Vercel Configuration**: Deployment issues with current setup
2. **Environment Variables**: No production environment configuration
3. **Health Monitoring**: Health check endpoint exists but no monitoring
4. **Performance Optimization**: Build optimizations disabled

## Data Models and APIs

### Database Models
**Comprehensive Prisma Schema (372 lines)**:
- **Carbon Standards**: `CarbonStandard` with 12 indexed fields
- **Methodologies**: `Methodology` with complex relationships
- **Projects**: `Project` with user relationships and risk assessments
- **Risk Assessment**: `RiskAssessment` with climate and transitional risks
- **Policies**: `Policy` with geographic and sector indexing
- **Physical Risk Data**: Multi-table climate scenario modeling
- **User Profiles**: `UserProfile` with project relationships

**Database Performance**: Comprehensive indexing strategy with 25+ indexes

### API Specifications
**Existing API Endpoints**:
- `GET/POST /api/methodologies` - Methodology search and management
- `GET/POST /api/standards` - Carbon standards with statistics
- `GET/POST /api/projects` - Project CRUD operations
- `GET/POST /api/risks` - Risk assessment endpoints
- `GET /api/policies` - Policy search and filtering
- `GET /api/health` - System health monitoring

**API Architecture**: Next.js API routes with comprehensive error handling and validation

## Integration Points and External Dependencies

### External Services
| Service | Purpose | Integration Type | Status |
|---------|---------|------------------|---------|
| Climate Policy Radar | Policy data | REST API | Configured |
| FAO FAOLEX | Legal frameworks | REST API | Configured |
| NGFS Climate Scenarios | Physical risk data | REST API | Configured |
| Climate Impact Explorer | Geographic risk | REST API | Configured |

### CI/CD Integration Requirements
- **GitHub Actions**: Workflow automation (MISSING)
- **Vercel**: Deployment platform (CONFIGURED but failing)
- **PostgreSQL**: Database hosting (Configured)
- **Environment Management**: Staging/production separation (NEEDED)

## Development and Deployment

### Current Development Setup
**Working Commands**:
```bash
pnpm dev           # Development server (port 3000)
pnpm build         # Production build
pnpm start         # Production server
pnpm lint          # ESLint (currently disabled)
pnpm db:push       # Database schema sync
pnpm db:studio     # Prisma Studio
pnpm db:migrate    # Database migrations
```

**Known Development Issues**:
- Build errors ignored for development convenience
- ESLint disabled during builds
- TypeScript errors bypassed
- No test execution scripts

### Deployment Reality
**Current State**: Vercel deployment configured but failing
**Missing Infrastructure**:
- GitHub Actions CI/CD workflows
- Automated testing pipeline
- Database migration automation
- Environment variable management
- Health check integration
- Performance monitoring

**Required Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection
- `CLIMATE_POLICY_RADAR_API_KEY`: External API access
- `NODE_ENV`: Environment specification
- Additional API keys for external services

## Testing Reality

### Current Test Infrastructure
**Testing Stack**:
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright (Chrome, Firefox, Safari, Mobile)
- **Coverage**: Configured but not reported

**Test Organization**:
```
__tests__/
├── unit/
│   └── components/         # React component tests
├── integration/
│   └── api/               # API endpoint tests
└── e2e/                   # Playwright E2E tests
```

**Testing Gaps for CI/CD**:
- No test execution scripts in package.json
- No CI-optimized test configurations
- No test coverage reporting
- No test result artifacts
- No test parallelization for CI

### Running Tests (Current Manual Process)
```bash
# Currently requires manual execution
npx jest                    # Unit and integration tests
npx playwright test         # E2E tests (requires server)
```

## CI/CD Implementation Requirements

### GitHub Actions Workflow Needs
**Required Workflows**:
1. **CI Pipeline**: Lint, test, build verification
2. **CD Pipeline**: Automated deployment to staging/production
3. **Database Migration**: Automated schema updates
4. **Security Scanning**: Dependency and code security
5. **Performance Monitoring**: Build size and performance tracking

### Environment Management Strategy
**Required Environments**:
- **Development**: Local development with hot reload
- **Staging**: Automated deployment from develop branch
- **Production**: Manual approval gate with production deployment

### Database Migration Strategy
**Current Capabilities**:
- Prisma migrations configured
- Migration commands available
- Schema versioning in place

**CI/CD Needs**:
- Automated migration deployment
- Migration rollback procedures
- Database backup before migrations
- Migration testing in staging

## Security and Compliance

### Current Security Measures
- **Input Validation**: Comprehensive Zod schemas
- **Database Security**: Prisma ORM prevents SQL injection
- **API Security**: Structured error handling
- **Environment Variables**: Secure configuration management

### CI/CD Security Requirements
- **Secrets Management**: GitHub Actions secrets for API keys
- **Dependency Scanning**: Automated vulnerability checking
- **Code Quality**: ESLint and TypeScript in CI pipeline
- **Access Control**: Deployment approval gates

## Performance Considerations

### Current Performance Issues
- **Build Optimizations**: Disabled for development convenience
- **Image Optimization**: Disabled in Next.js config
- **Bundle Analysis**: No bundle size monitoring
- **Database Queries**: No query performance monitoring

### CI/CD Performance Optimization
- **Build Caching**: pnpm and Next.js build caching
- **Test Parallelization**: Parallel test execution in CI
- **Deployment Optimization**: Incremental deployments
- **Asset Optimization**: Re-enable image and bundle optimization

## Enhancement Impact Analysis - CI/CD Modernization

### Files That Will Need Creation
**GitHub Actions Workflows**:
- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/cd.yml` - Continuous Deployment
- `.github/workflows/pr.yml` - Pull Request validation

**Configuration Files**:
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables
- `vercel.json` - Vercel deployment configuration

### Files That Will Need Modification
**Package.json Updates**:
- Add test execution scripts
- Add CI-specific build scripts
- Add deployment preparation scripts

**Next.js Configuration**:
- Re-enable build optimizations for production
- Configure environment-specific settings
- Add CI/CD friendly configurations

**Database Configuration**:
- Add migration deployment scripts
- Configure connection pooling for production
- Add health check database queries

### New CI/CD Infrastructure Components
**GitHub Actions Jobs**:
- Lint and type checking
- Unit and integration testing
- E2E testing with Playwright
- Database migration testing
- Security scanning
- Performance monitoring
- Automated deployment

**Monitoring and Observability**:
- Build status reporting
- Test result reporting
- Deployment notifications
- Performance metrics collection

## Appendix - Useful Commands and Scripts

### Development Commands
```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Production build
pnpm start                  # Production server

# Database
pnpm db:push               # Sync schema to database
pnpm db:studio             # Open Prisma Studio
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database

# Testing (manual execution required)
npx jest                   # Unit/integration tests
npx playwright test        # E2E tests
```

### CI/CD Commands (To Be Implemented)
```bash
# Testing
pnpm test                  # Run all tests
pnpm test:unit            # Unit tests only
pnpm test:integration     # Integration tests only
pnpm test:e2e             # E2E tests only
pnpm test:coverage        # Coverage report

# Quality
pnpm lint:fix             # Fix linting issues
pnpm type-check           # TypeScript verification
pnpm audit                # Security audit

# Deployment
pnpm build:staging        # Staging build
pnpm build:production     # Production build
pnpm deploy:staging       # Deploy to staging
pnpm deploy:production    # Deploy to production
```

### Debugging and Troubleshooting
**Current Issues**:
- All files untracked in git (need initial commit)
- Vercel deployment failing (need configuration fixes)
- No CI/CD infrastructure (complete implementation needed)
- Build optimizations disabled (need production configuration)

**Monitoring**:
- Health check endpoint: `/api/health`
- Database connection testing: `pnpm db:test`
- Application logs: Console and Winston logger
- Performance metrics: To be implemented with CI/CD

**Common CI/CD Implementation Challenges**:
- Environment variable management across environments
- Database migration coordination with deployments
- Test execution in CI environment
- Build optimization balance between development and production
- Deployment rollback procedures

## Next Steps for CI/CD Implementation

### Priority 1: Foundation
1. **Git Repository Setup**: Commit all files, establish proper git workflow
2. **GitHub Actions Setup**: Create basic CI/CD workflow files
3. **Environment Configuration**: Set up staging and production environments
4. **Test Scripts**: Add test execution scripts to package.json

### Priority 2: Automation
1. **CI Pipeline**: Implement comprehensive testing and validation
2. **CD Pipeline**: Automate deployment to staging and production
3. **Database Migrations**: Automate migration deployment
4. **Security Integration**: Add dependency scanning and security checks

### Priority 3: Optimization
1. **Performance Monitoring**: Implement build and runtime performance tracking
2. **Advanced Testing**: Add visual regression and performance testing
3. **Monitoring Integration**: Add application monitoring and alerting
4. **Documentation**: Create comprehensive CI/CD documentation

This brownfield architecture document provides the technical foundation needed for AI agents to implement comprehensive CI/CD workflows while respecting the current system architecture and addressing the identified technical debt.
