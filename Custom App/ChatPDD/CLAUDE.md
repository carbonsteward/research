# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

ChatPDD (Carbon Mitigation Project Feasibility Study Assistant) is a Next.js application designed to help project developers and investors conduct feasibility studies for carbon mitigation projects. It integrates climate risk data, carbon standards, and methodologies to provide data-driven project assessments.

## Deployment URLs

- **Production**: https://chatpdd-carbon-mitigation.vercel.app/
- **Staging**: https://chatpdd-carbon-mitigation-git-develop.vercel.app/
- **Health Check**: https://chatpdd-carbon-mitigation.vercel.app/api/health
- **Dashboard**: https://chatpdd-carbon-mitigation.vercel.app/dashboard

## Technology Stack

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **UI Components**: Radix UI primitives with shadcn/ui, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Package Manager**: pnpm (10.8.1)
- **Testing**: Jest (unit/integration), Playwright (E2E), React Testing Library
- **Validation**: Zod schemas
- **Logging**: Winston
- **Data Scraping**: Puppeteer
- **AI Services**: OpenAI Vision API (GPT-4 Vision), Google Maps Geocoding API
- **Performance**: LRU Cache, Memory optimization, Database query monitoring

## Development Commands

```bash
# Development
pnpm dev                    # Start Next.js development server (port 3000)
pnpm build                  # Build production application
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Testing
pnpm test                   # Run Jest unit and integration tests
pnpm test:e2e              # Run Playwright E2E tests (requires server running)
npx jest --watch           # Run tests in watch mode
npx playwright test        # Run E2E tests directly

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push               # Push schema changes to database
pnpm db:studio             # Open Prisma Studio for database management
pnpm db:seed               # Seed database with sample data
pnpm db:migrate            # Run database migrations (development)
pnpm db:migrate:prod       # Deploy migrations (production)
pnpm db:test               # Test database connection
```

## Project Architecture

### Application Structure
```
app/                       # Next.js App Router pages
├── (dashboard)/           # Dashboard layout with shared navigation
│   ├── dashboard/         # Main user dashboard
│   ├── methodologies/     # Carbon methodology exploration
│   ├── project/           # Project creation and management
│   └── risks/            # Climate risk visualization
├── admin/                 # Admin dashboard and validation tools
├── onboarding/           # User profile and project setup
├── project/              # Public project pages
│   ├── new/              # Project creation with GeoSpy AI integration
│   └── geospy/           # GeoSpy AI photo location detection
└── api/                  # API routes
    ├── geospy/analyze/   # Real OpenAI Vision API endpoint
    └── health/           # Enhanced health monitoring

components/               # Reusable React components
├── ui/                   # shadcn/ui components
├── geospy-ai.tsx         # Main GeoSpy AI component with real API
├── geospy-*.tsx          # GeoSpy widgets and A/B test variants
├── ai-status-indicator.tsx # Real-time AI service monitoring
└── *.tsx                 # Feature-specific components

lib/                      # Core libraries
├── ai-services.ts        # OpenAI Vision API and Google Maps integration
├── monitoring.ts         # Comprehensive system monitoring
├── performance.ts        # Performance optimization utilities
└── ab-testing.ts         # A/B testing framework

services/                 # Business logic and validation
scrapers/                 # Data scraping utilities
utils/                    # Shared utilities and logging
types/                   # TypeScript type definitions
```

### Database Schema
Core entities stored in PostgreSQL:
- **CarbonStandard**: Carbon certification standards (Verra, Gold Standard, etc.)
- **Methodology**: Specific methodologies within standards
- **PDDRequirement**: Project Design Document requirements
- **CertificationProcess**: Step-by-step certification workflows
- **Policy**: Climate policies and regulations
- **PhysicalRiskData**: Climate risk scenarios and projections

### Data Validation Architecture
Uses Zod schemas in `services/validation-service.ts` for:
- Input validation with custom error messages
- Database integrity checks (duplicates, references)
- Data quality monitoring across all entities
- Comprehensive validation for carbon standards, methodologies, policies, and risk data

### GeoSpy AI Integration
Real AI-powered photo location detection system:
- **OpenAI Vision API**: GPT-4 Vision model for image analysis and location detection
- **Google Maps Geocoding API**: Coordinate validation and location name resolution
- **Rate Limiting**: 100 requests per hour per user with proper error handling
- **Real-time Monitoring**: AI service status indicator and health checks
- **A/B Testing**: Multiple widget placement and CTA effectiveness tests
- **Integration Points**: Project creation form, dashboard widgets, dedicated pages

### Web Scraping System
Located in `scrapers/` with configuration in `types/scraper-config.ts`:
- **CarbonStandardScraper**: Automated scraping of carbon standard websites
- **PolicyScraper**: Climate policy data collection
- Uses Puppeteer for browser automation with proper error handling and logging

## Testing Strategy

### Unit & Integration Tests (`__tests__/`)
- Component tests using React Testing Library
- API endpoint testing with Node.js mocks
- Service layer validation testing
- Located in `__tests__/unit/` and `__tests__/integration/`

### End-to-End Tests
- Playwright configuration for multi-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing (Pixel 5, iPhone 12)
- Test server setup with `npm run build && npm run start`
- Located in `__tests__/e2e/`

## CI/CD Pipeline

Comprehensive GitHub Actions workflow supporting:
- **Staging**: Auto-deploy from `develop` branch
- **Production**: Manual approval gate from `main` branch
- **Database Migration Automation**: Zero-downtime strategies with safety checks
- **Performance Optimization**: Lighthouse analysis, load testing, bundle optimization
- **Monitoring Setup**: Error tracking, health checks, multi-channel alerting
- Multi-environment secrets management
- Slack notifications for deployments

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI Vision API access (GPT-4 Vision)
- `GOOGLE_MAPS_API_KEY`: Google Maps Geocoding API
- `CLIMATE_POLICY_RADAR_API_KEY`: External API access
- `SLACK_WEBHOOK_URL`: Monitoring alerts (optional)
- `SENTRY_DSN`: Error tracking (optional)
- `DATADOG_API_KEY`: Performance monitoring (optional)
- Vercel deployment tokens (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)

## External Integrations

### Climate Data APIs
- **Climate Policy Radar**: Policy and regulation data
- **FAO FAOLEX**: Legal framework information
- **NGFS Climate Scenarios**: Physical risk projections
- **Climate Impact Explorer**: Geographic risk assessment

### Data Import/Export
- CSV import for carbon standards data
- Scheduled scraping with rate limiting and error recovery
- PDF extraction utilities for documentation processing

## Key Development Patterns

### Component Structure
- shadcn/ui components in `components/ui/`
- Feature components follow naming convention: `enhanced-*`, `climate-*`
- Shared utilities in `lib/utils.ts` with `cn()` helper for class merging

### GeoSpy AI Integration
- **Component**: `components/geospy-ai.tsx` - Full-featured photo location detection UI
- **API Endpoint**: `/api/geospy/analyze` - RESTful service for image analysis
- **AI Services**: `lib/ai-services.ts` - OpenAI Vision API integration with rate limiting
- **Integration Point**: Project creation form (`app/project/new/page.tsx`) - Camera button next to coordinates field
- **Live Demo**: https://chatpdd-carbon-mitigation.vercel.app/project/new (camera button visible after build fixes)

### Validation Patterns
All data validation through `ValidationService` class:
- Async validation with database checks
- Comprehensive error reporting
- Data quality monitoring functions
- UUID validation for foreign key relationships

### Error Handling
- Winston logging with file and console outputs
- Structured error responses in API endpoints
- Client-side error boundaries for React components

## Performance Considerations

### Build Configuration
- ESLint and TypeScript errors ignored during builds (development convenience)
- Image optimization disabled for static exports
- Build tools included in `dependencies` for deployment compatibility

### Database Performance
- Efficient Prisma queries with selective field loading
- Validation checks prevent duplicate data
- Background data quality monitoring

## Security Practices

- No PII storage in database schema
- Secure API key management through environment variables
- Input validation for all external data
- Rate limiting on scraping operations
- HTTPS enforcement for all communications

## API Endpoints

**Methodology Management:**
- `GET/POST /api/methodologies` - Search and create methodologies
- `GET/PATCH/DELETE /api/methodologies/[id]` - Individual methodology operations
- `GET /api/methodologies/recommendations` - Smart recommendations

**Carbon Standards:**
- `GET/POST /api/standards` - Carbon standards with stats
- `GET/PATCH/DELETE /api/standards/[id]` - Individual standard operations
- `GET /api/standards/comparison` - Multi-standard comparison

**Project Management:**
- `GET/POST /api/projects` - Project CRUD operations
- `GET/PATCH/DELETE /api/projects/[id]` - Individual project operations
- `GET/POST /api/users` - User profile management

**Risk Assessment:**
- `GET/POST /api/risks` - Risk assessments
- `GET /api/risks/physical` - Physical risk data with analysis
- `GET /api/policies` - Policy search with impact analysis

**GeoSpy AI Services:**
- `POST /api/geospy/analyze` - Real OpenAI Vision API photo location detection
- `GET /api/geospy/analyze` - Service health and configuration check

**System Monitoring:**
- `GET /api/health` - Comprehensive system health monitoring with AI services status
- `GET /api/health?service=ai` - Specific AI services health check
- `GET /api/health?service=database` - Database-specific health check

## Enhanced UI Features

**GeoSpy AI Integration:**
- **Project Creation**: Camera button in coordinates field for photo-based location detection
- **Dashboard Widgets**: Multiple A/B test variants (sidebar, banner, inline, floating)
- **Dedicated Pages**: Full GeoSpy experience at `/project/geospy` and `/(dashboard)/project/geospy`
- **Real-time Status**: AI service health indicator showing OpenAI and Google Maps availability
- **A/B Testing**: Comprehensive testing framework for widget placement and CTA effectiveness
- **Performance Monitoring**: Response time tracking, error monitoring, and usage analytics

**Methodology Explorer:**
- Real-time search with debounced queries
- Advanced filtering by standard, type, category, ITMO compliance
- Smart recommendations based on project profile
- Interactive methodology cards with stats
- Skeleton loading states and error handling
- Pagination with load more functionality

**Component Architecture:**
- `GeospyAI` - Main AI component with real OpenAI Vision API integration
- `GeoSpyABTestWidget` - A/B test variants for widget placement optimization
- `AIStatusIndicator` - Real-time AI service monitoring component
- `useMethodologies` - Custom hook for methodology data management
- `useStandards` - Carbon standards data fetching
- `useABTesting` - A/B testing framework with analytics tracking
- `MethodologyCard` - Rich display component with badges and actions
- `MethodologyFilters` - Advanced filter sidebar with active filter tracking
- `useDebounce` - Performance optimization for search queries
