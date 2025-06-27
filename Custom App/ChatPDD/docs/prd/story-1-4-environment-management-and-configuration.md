# Story 1.4: Environment Management and Configuration

## Story

As a **development team**,
I want **proper environment separation with secure configuration management**,
so that **staging and production environments are properly isolated and configured**.

## Acceptance Criteria

- AC1: Staging environment configuration is created with appropriate environment variables
- AC2: Production environment configuration is established with secure secrets management
- AC3: GitHub Secrets integration provides secure access to API keys and database credentials
- AC4: Environment-specific build configurations optimize for staging vs production needs
- AC5: Environment variables documentation is updated with new configuration requirements
- AC6: Environment isolation prevents cross-environment data contamination
- AC7: Emergency environment switching procedures are documented and tested

## Environment Separation Implementation Details

### Environment Architecture

```
Local Development:
- .env.local (ignored by git)
- Full feature flags enabled
- Development database connection
- Verbose logging enabled

Staging Environment:
- .env.staging (encrypted in GitHub Secrets)
- Production-like configuration
- Staging database with production data subset
- Debug logging enabled
- Performance monitoring enabled

Production Environment:
- .env.production (encrypted in GitHub Secrets)
- Optimized configuration
- Production database with backup procedures
- Error-only logging
- Full monitoring and alerting
```

### Configuration Management Strategy

1. **Environment Variable Hierarchy**:
   - `.env.local` (highest priority, local development)
   - `.env.staging` (staging-specific overrides)
   - `.env.production` (production-specific overrides)
   - `.env.example` (template for all environments)

2. **Secret Management Implementation**:
   - GitHub Secrets for sensitive data (API keys, database URLs)
   - Environment-specific secret scoping
   - Automatic secret rotation procedures
   - Audit logging for secret access

3. **Database Environment Separation**:
   - Separate database instances for each environment
   - Production database with read replicas
   - Staging database with anonymized production data
   - Development database with seed data

4. **External API Configuration**:
   - Environment-specific API endpoints
   - Separate API keys for each environment
   - Rate limiting configuration per environment
   - Fallback and circuit breaker patterns

## Integration Verification

- IV1: All existing environment variables continue to work in new environment structure
- IV2: Local development environment remains unchanged and fully functional
- IV3: External API integrations (Climate Policy Radar, etc.) work correctly in all environments
- IV4: Database connections are properly isolated between environments
- IV5: Environment-specific configurations don't interfere with each other

## Rollback Procedures for Story 1.4

### Environment Configuration Rollback

1. **Immediate Rollback to Single Environment**:
   - Disable environment-specific configurations
   - Restore original .env.example as primary configuration
   - Revert to manual environment variable management
   - Restore original database connection patterns

2. **Secret Management Rollback**:
   - Export all GitHub Secrets to secure backup
   - Restore manual secret management procedures
   - Revert to local .env files for development
   - Implement temporary manual secret rotation

3. **Database Environment Rollback**:
   - Consolidate to single database instance if needed
   - Restore original database connection configuration
   - Implement manual database environment switching
   - Backup and restore procedures for data consistency

### Emergency Environment Switching

- **Production to Staging Failover**: Documented procedure to switch production traffic to staging
- **Database Failover**: Automated database failover with manual approval
- **Configuration Rollback**: Ability to quickly revert to previous environment configuration
- **Emergency Access**: Bypass procedures for critical production issues

## Technical Context

**Current State**: Single environment configuration with .env.example template
**Target State**: Multi-environment configuration with secure secrets management
**Risk Level**: High - Environment changes affect all subsequent deployment and database stories
**Dependencies**: Story 1.3 (Test automation for environment validation)
**Blocks**: Story 1.5 (Database migration automation), Story 1.6 (Deployment automation)

## Implementation Notes

### External API Environment Configuration

Current External APIs requiring environment-specific configuration:
- **Climate Policy Radar API**: Separate keys and endpoints per environment
- **FAO FAOLEX API**: Environment-specific rate limits
- **NGFS Climate Scenarios**: Staging vs production data access
- **Climate Impact Explorer**: Geographic data API configuration

### Database Environment Requirements

- **Development**: Seed data with comprehensive test scenarios
- **Staging**: Anonymized production data subset for realistic testing
- **Production**: Full database with backup and read replica configuration
- **Migration Strategy**: Environment-specific migration deployment procedures
