# Environment Management Documentation

## Overview

ChatPDD implements comprehensive environment management with secure configuration handling across development, staging, and production environments. Each environment is isolated with specific configurations, database instances, and deployment workflows.

## Environment Architecture

### 1. Development Environment
**Purpose**: Local development and testing
**Configuration**: `.env.development` + `.env.local`
**Database**: Local PostgreSQL instance
**Features**: Debug enabled, mock data, relaxed rate limiting

**Characteristics**:
- ✅ Full debugging and logging enabled
- ✅ Mock data and development tools available
- ✅ Relaxed security and performance settings
- ✅ Local database with test data
- ✅ No external analytics or monitoring

### 2. Staging Environment
**Purpose**: Production-like testing and QA
**Configuration**: `.env.staging` + GitHub Secrets
**Database**: Isolated staging database
**Features**: Production-like settings with additional monitoring

**Characteristics**:
- ✅ Production-like configuration and performance
- ✅ Real external API integrations
- ✅ Enhanced monitoring and debugging
- ✅ Staging banner for environment identification
- ✅ Separate database with anonymized production data

### 3. Production Environment
**Purpose**: Live application serving end users
**Configuration**: `.env.production` + GitHub Secrets
**Database**: Production database with backups
**Features**: Optimized performance, full monitoring, strict security

**Characteristics**:
- ✅ Maximum performance optimizations
- ✅ Strict rate limiting and security measures
- ✅ Comprehensive error tracking and monitoring
- ✅ CDN optimization and compression
- ✅ Automated backup and recovery procedures

## Environment Configuration Files

### Environment Variables Hierarchy
```
1. .env.local (highest priority, local development only)
2. .env.{environment} (environment-specific defaults)
3. .env.example (template and documentation)
4. GitHub Secrets (CI/CD and sensitive data)
```

### Configuration Structure
```typescript
// Environment validation with Zod schema
{
  // Core Environment
  NODE_ENV: "development" | "production" | "test"
  NEXT_PUBLIC_APP_ENV: "development" | "staging" | "production"
  NEXT_PUBLIC_APP_URL: string (URL)

  // Database Configuration
  DATABASE_URL: string (PostgreSQL connection)

  // External API Configuration
  CLIMATE_POLICY_RADAR_API_KEY: string
  CLIMATE_POLICY_RADAR_BASE_URL: string (URL)

  // Security & Authentication
  NEXTAUTH_SECRET: string (min 32 chars)
  NEXTAUTH_URL: string (URL)

  // Feature Flags
  NEXT_PUBLIC_ENABLE_DEBUG: boolean
  NEXT_PUBLIC_ENABLE_MOCK_DATA: boolean
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: boolean

  // Performance & Caching
  REDIS_URL: string (optional)
  CACHE_TTL_SECONDS: number
  ENABLE_COMPRESSION: boolean
  ENABLE_CDN_OPTIMIZATION: boolean
}
```

## GitHub Secrets Management

### Required Secrets by Environment

#### Staging Environment Secrets
- `STAGING_DATABASE_URL` - PostgreSQL connection for staging
- `STAGING_APP_URL` - Staging application URL
- `STAGING_NEXTAUTH_SECRET` - Authentication secret for staging
- `STAGING_CLIMATE_POLICY_RADAR_API_KEY` - External API key
- `STAGING_REDIS_URL` - Cache server connection
- `STAGING_GOOGLE_ANALYTICS_ID` - Analytics tracking (staging property)

#### Production Environment Secrets
- `PRODUCTION_DATABASE_URL` - PostgreSQL connection for production
- `PRODUCTION_APP_URL` - Production application URL
- `PRODUCTION_NEXTAUTH_SECRET` - Strong authentication secret
- `PRODUCTION_CLIMATE_POLICY_RADAR_API_KEY` - Production API key
- `PRODUCTION_REDIS_URL` - Production cache server
- `PRODUCTION_GOOGLE_ANALYTICS_ID` - Production analytics property
- `PRODUCTION_SENTRY_DSN` - Error tracking configuration
- `PRODUCTION_MONITORING_API_KEY` - Application monitoring

#### Shared CI/CD Secrets
- `VERCEL_TOKEN` - Vercel deployment authentication
- `VERCEL_ORG_ID` - Vercel organization identifier
- `VERCEL_PROJECT_ID` - Vercel project identifier
- `CODECOV_TOKEN` - Code coverage reporting
- `GITHUB_TOKEN` - GitHub API access (automatic)

### Secret Rotation Procedures

#### Monthly Rotation (High Security)
- `PRODUCTION_NEXTAUTH_SECRET`
- `PRODUCTION_CLIMATE_POLICY_RADAR_API_KEY`
- `VERCEL_TOKEN`

#### Quarterly Rotation (Standard)
- `STAGING_NEXTAUTH_SECRET`
- Database passwords
- Redis authentication

#### Annual Rotation (Low Risk)
- Analytics tracking IDs
- Monitoring API keys

## Database Environment Isolation

### Database Architecture
```
Development:
  - Local PostgreSQL instance
  - Port: 5432
  - Database: chatpdd_dev
  - User: developer (full access)
  - Backup: Not required

Staging:
  - Managed PostgreSQL service
  - Database: chatpdd_staging
  - User: staging_user (limited permissions)
  - Backup: Daily automated backups
  - Data: Anonymized production subset

Production:
  - Managed PostgreSQL service with replicas
  - Database: chatpdd_production
  - User: production_user (restricted permissions)
  - Backup: Continuous + daily snapshots
  - Data: Live production data with encryption
```

### Migration Strategy
```yaml
Development:
  - Run: pnpm db:migrate
  - Auto-apply: Development migrations
  - Rollback: Available locally

Staging:
  - Run: pnpm db:migrate:prod (in CI)
  - Validation: Schema compatibility checks
  - Rollback: Automated on failure

Production:
  - Run: pnpm db:migrate:prod (in CI)
  - Pre-backup: Automatic database backup
  - Validation: Health checks post-migration
  - Rollback: Manual with backup restoration
```

## Deployment Workflows

### Staging Deployment (Automatic)
**Trigger**: Push to `develop` branch
**Duration**: ~15-20 minutes
**Approval**: Not required

```yaml
Flow:
1. Code checkout and dependency installation
2. Database migration execution
3. Application build with staging configuration
4. Vercel deployment to staging environment
5. Health check verification
6. Deployment status notification
```

### Production Deployment (Manual Approval)
**Trigger**: Push to `main` branch OR manual dispatch
**Duration**: ~25-35 minutes
**Approval**: Required for manual dispatch

```yaml
Flow:
1. Pre-deployment validation and critical tests
2. Manual approval gate (if workflow_dispatch)
3. Production database backup
4. Database migration execution
5. Application build with production configuration
6. Vercel deployment to production environment
7. Comprehensive health checks
8. GitHub release creation
9. Cache warm-up and monitoring updates
```

## Environment Configuration Utilities

### Environment Validation (`lib/env-config.ts`)
```typescript
// Centralized configuration management
import { env, isProduction, getFeatureFlags } from '@/lib/env-config'

// Automatic validation on import
// Throws detailed errors for missing or invalid configuration
// Provides type-safe environment variable access
```

### Configuration Helpers
```typescript
// Database configuration per environment
const dbConfig = getDatabaseConfig()

// External API configuration
const apiConfig = getApiConfig()

// Feature flags per environment
const features = getFeatureFlags()

// Performance settings
const perfConfig = getPerformanceConfig()
```

## Security Best Practices

### Secret Management
- ✅ No secrets in source code or environment files
- ✅ GitHub Secrets for all sensitive configuration
- ✅ Environment-specific secret scoping
- ✅ Regular secret rotation schedule
- ✅ Audit logging for secret access

### Database Security
- ✅ Isolated database instances per environment
- ✅ Least-privilege database user permissions
- ✅ Encrypted connections (SSL/TLS required)
- ✅ Regular security updates and patches
- ✅ Automated backup encryption

### API Security
- ✅ Environment-specific API keys
- ✅ Rate limiting per environment
- ✅ CORS configuration per environment
- ✅ Request logging and monitoring
- ✅ API key rotation procedures

## Monitoring and Observability

### Development Monitoring
- Console logging with debug level
- Request/response logging enabled
- Performance monitoring disabled
- Error tracking disabled

### Staging Monitoring
- Info-level logging
- Request logging enabled
- Performance monitoring enabled
- Basic error tracking enabled
- Staging environment banner

### Production Monitoring
- Warn-level logging only
- Request logging disabled (performance)
- Full performance monitoring
- Comprehensive error tracking with Sentry
- Real-time alerts and notifications

## Feature Flag Management

### Environment-Specific Flags
```typescript
Development:
  - enableDebug: true
  - enableMockData: true
  - enablePerformanceMonitoring: false
  - maintenanceMode: false

Staging:
  - enableDebug: false
  - enableMockData: false
  - enablePerformanceMonitoring: true
  - stagingBanner: true

Production:
  - enableDebug: false
  - enableMockData: false
  - enablePerformanceMonitoring: true
  - enableCompression: true
  - enableCdnOptimization: true
```

### Feature Flag Guidelines
- Use feature flags for gradual rollouts
- Test new features in staging first
- Implement circuit breakers for external services
- Monitor feature flag impact on performance

## Emergency Procedures

### Emergency Environment Switching
**Scenario**: Production environment failure

```bash
# 1. Immediate Response
- Enable maintenance mode via feature flag
- Redirect traffic to staging environment
- Activate incident response team

# 2. Environment Failover
- Update DNS to point to staging
- Activate production database read replicas
- Enable elevated monitoring

# 3. Recovery Process
- Identify and fix production issues
- Restore production environment
- Gradual traffic restoration
- Post-incident review and improvements
```

### Secret Compromise Response
**Scenario**: API key or secret exposure

```bash
# 1. Immediate Actions (< 15 minutes)
- Rotate compromised secrets immediately
- Update GitHub Secrets with new values
- Trigger emergency deployment
- Monitor for unauthorized access

# 2. Environment Cleanup (< 1 hour)
- Audit all environment configurations
- Check access logs for suspicious activity
- Update all related credentials
- Document incident for security review
```

### Database Emergency Procedures
**Scenario**: Database corruption or data loss

```bash
# 1. Immediate Response
- Enable read-only mode if possible
- Stop all write operations
- Activate database backup restoration
- Notify stakeholders of downtime

# 2. Recovery Process
- Restore from latest verified backup
- Apply any missed transactions
- Verify data integrity
- Gradual service restoration with monitoring
```

## Performance Optimization by Environment

### Development Optimizations
- Minimal caching for faster development
- Detailed error messages and stack traces
- Hot module replacement enabled
- Source maps enabled

### Staging Optimizations
- Production-like caching behavior
- Compressed assets but with source maps
- Performance monitoring enabled
- Realistic data volumes

### Production Optimizations
- Maximum compression and minification
- CDN optimization enabled
- Browser caching headers optimized
- Image optimization enabled
- Bundle splitting for optimal loading

## Troubleshooting

### Common Environment Issues

**1. Environment Variable Not Found**
```bash
# Check environment configuration
pnpm dev --debug
# Verify .env.local exists and contains required variables
```

**2. Database Connection Failures**
```bash
# Test database connection
pnpm db:test
# Check DATABASE_URL format and network access
```

**3. Build Failures in CI**
```bash
# Check GitHub Secrets configuration
# Verify all required secrets are set for environment
# Review build logs for specific error messages
```

**4. Deployment Health Check Failures**
```bash
# Manual health check
curl https://your-app-url/api/health
# Check application logs in Vercel dashboard
# Verify environment variables are set correctly
```

### Debug Commands
```bash
# Environment information
pnpm dev --inspect

# Database connection test
pnpm db:test

# Build with verbose output
pnpm build --debug

# Environment validation
node -e "require('./lib/env-config.js')"
```

## Future Enhancements

**Planned Improvements** (Stories 1.5-1.7):
- Blue-green deployment strategy
- Canary releases with gradual traffic shifting
- Advanced monitoring with custom metrics
- Automated rollback triggers
- Multi-region deployment support

**Current Limitations**:
- Single-region deployment only
- Manual rollback procedures
- Limited automated failover
- Basic health check implementation

---

**Environment Management Status**: ✅ Story 1.4 Implementation Complete
**Environments**: 3 fully configured (dev, staging, production)
**Secrets**: Comprehensive GitHub Secrets management
**Next**: Story 1.5 - Database Migration Automation
