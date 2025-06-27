/**
 * Environment Configuration Management
 * Centralizes environment variable handling and validation
 */

import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),

  // External APIs
  CLIMATE_POLICY_RADAR_API_KEY: z.string().optional(),
  CLIMATE_POLICY_RADAR_BASE_URL: z.string().url().default('https://api.climatepolicyradar.org/v1'),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_MOCK_DATA: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === 'true').default('false'),

  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),

  // Rate Limiting
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('false'),
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.string().transform(val => parseInt(val, 10)).default('60'),

  // Cache
  REDIS_URL: z.string().optional(),
  CACHE_TTL_SECONDS: z.string().transform(val => parseInt(val, 10)).default('300'),

  // Environment Specific
  NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
  NEXT_PUBLIC_MAINTENANCE_MODE: z.string().transform(val => val === 'true').default('false'),
  ENABLE_STAGING_BANNER: z.string().transform(val => val === 'true').default('false'),

  // Production Optimizations
  ENABLE_COMPRESSION: z.string().transform(val => val === 'true').default('false'),
  ENABLE_CDN_OPTIMIZATION: z.string().transform(val => val === 'true').default('false'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  MONITORING_API_KEY: z.string().optional(),
  ENABLE_ERROR_TRACKING: z.string().transform(val => val === 'true').default('false'),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Environment validation failed:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    }
    throw new Error('Invalid environment configuration')
  }
}

// Export validated environment configuration
export const env = parseEnv()

// Environment helper functions
export const isProduction = () => env.NODE_ENV === 'production'
export const isDevelopment = () => env.NODE_ENV === 'development'
export const isTest = () => env.NODE_ENV === 'test'

export const isProductionEnv = () => env.NEXT_PUBLIC_APP_ENV === 'production'
export const isStagingEnv = () => env.NEXT_PUBLIC_APP_ENV === 'staging'
export const isDevelopmentEnv = () => env.NEXT_PUBLIC_APP_ENV === 'development'

// Database configuration
export const getDatabaseConfig = () => ({
  url: env.DATABASE_URL,
  pool: {
    min: isDevelopment() ? 1 : 2,
    max: isDevelopment() ? 5 : 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  logging: isDevelopment() || env.LOG_LEVEL === 'debug',
})

// External API configuration
export const getApiConfig = () => ({
  climatePolicyRadar: {
    apiKey: env.CLIMATE_POLICY_RADAR_API_KEY,
    baseUrl: env.CLIMATE_POLICY_RADAR_BASE_URL,
    timeout: isProduction() ? 10000 : 30000,
    retries: isProduction() ? 3 : 1,
  },
})

// Cache configuration
export const getCacheConfig = () => ({
  enabled: !!env.REDIS_URL,
  url: env.REDIS_URL,
  ttl: env.CACHE_TTL_SECONDS,
  keyPrefix: `chatpdd:${env.NEXT_PUBLIC_APP_ENV}:`,
})

// Logging configuration
export const getLoggingConfig = () => ({
  level: env.LOG_LEVEL,
  enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
  enableErrorTracking: env.ENABLE_ERROR_TRACKING,
  sentryDsn: env.SENTRY_DSN,
})

// Rate limiting configuration
export const getRateLimitConfig = () => ({
  enabled: env.RATE_LIMIT_ENABLED,
  requestsPerMinute: env.RATE_LIMIT_REQUESTS_PER_MINUTE,
  keyGenerator: (req: any) => {
    return req.ip || req.connection.remoteAddress || 'anonymous'
  },
})

// Feature flags
export const getFeatureFlags = () => ({
  enableDebug: env.NEXT_PUBLIC_ENABLE_DEBUG,
  enableMockData: env.NEXT_PUBLIC_ENABLE_MOCK_DATA,
  enablePerformanceMonitoring: env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
  enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  maintenanceMode: env.NEXT_PUBLIC_MAINTENANCE_MODE,
  stagingBanner: env.ENABLE_STAGING_BANNER,
})

// Performance configuration
export const getPerformanceConfig = () => ({
  enableCompression: env.ENABLE_COMPRESSION,
  enableCdnOptimization: env.ENABLE_CDN_OPTIMIZATION,
  cacheHeaders: isProduction() ? 'max-age=31536000' : 'no-cache',
})

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  nodeEnv: env.NODE_ENV,
  appEnv: env.NEXT_PUBLIC_APP_ENV,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  vercelEnv: env.NEXT_PUBLIC_VERCEL_ENV,
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isTest: isTest(),
  isDevelopmentEnv: isDevelopmentEnv(),
  isStagingEnv: isStagingEnv(),
  isProductionEnv: isProductionEnv(),
})

// Validate required secrets for each environment
export const validateEnvironmentSecrets = () => {
  const errors: string[] = []

  if (isProductionEnv()) {
    if (!env.NEXTAUTH_SECRET) errors.push('NEXTAUTH_SECRET is required in production')
    if (!env.CLIMATE_POLICY_RADAR_API_KEY) errors.push('CLIMATE_POLICY_RADAR_API_KEY is required in production')
  }

  if (isStagingEnv()) {
    if (!env.CLIMATE_POLICY_RADAR_API_KEY) errors.push('CLIMATE_POLICY_RADAR_API_KEY is required in staging')
  }

  if (errors.length > 0) {
    console.error('❌ Environment secrets validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    if (isProduction()) {
      throw new Error('Missing required secrets in production environment')
    }
  }

  return errors.length === 0
}

// Initialize environment validation
if (typeof window === 'undefined') {
  // Server-side validation only
  validateEnvironmentSecrets()
}
