import Redis from 'ioredis'
import { createLogger } from './logger'
import { prisma } from './database'

const logger = createLogger('cache')

// Redis client configuration
const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  
  const redis = new Redis(redisUrl, {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Connection pooling
    family: 4,
    keepAlive: true,
    // Timeouts
    connectTimeout: 10000,
    commandTimeout: 5000,
    // Automatic retry
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: false,
  })

  redis.on('connect', () => {
    logger.info('Redis client connected')
  })

  redis.on('ready', () => {
    logger.info('Redis client ready')
  })

  redis.on('error', (error) => {
    logger.error('Redis client error', { error: error.message })
  })

  redis.on('close', () => {
    logger.info('Redis client connection closed')
  })

  redis.on('reconnecting', () => {
    logger.info('Redis client reconnecting')
  })

  return redis
}

// Singleton Redis client
let redisClient: Redis | null = null

export const getRedisClient = (): Redis | null => {
  if (process.env.NODE_ENV === 'development' && process.env.REDIS_URL === undefined) {
    // In development without Redis, use in-memory fallback
    return null
  }

  if (!redisClient) {
    try {
      redisClient = createRedisClient()
    } catch (error) {
      logger.error('Failed to create Redis client', { error })
      return null
    }
  }

  return redisClient
}

// Cache interface for type safety
interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  compress?: boolean // Whether to compress large values
}

interface CacheEntry<T = any> {
  value: T
  tags: string[]
  createdAt: number
  ttl: number
}

// Default cache settings
const DEFAULT_TTL = 3600 // 1 hour
const DEFAULT_TAGS: string[] = []

export class CacheManager {
  private redis: Redis | null
  private fallbackCache: Map<string, CacheEntry> = new Map()
  private fallbackCleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.redis = getRedisClient()
    
    if (!this.redis) {
      logger.warn('Redis not available, using in-memory fallback cache')
      this.startFallbackCleanup()
    }
  }

  private startFallbackCleanup() {
    // Clean up expired entries every 5 minutes
    this.fallbackCleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.fallbackCache.entries()) {
        if (now - entry.createdAt > entry.ttl * 1000) {
          this.fallbackCache.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }

  private async handleRedisError<T>(
    operation: () => Promise<T>,
    fallback: () => T
  ): Promise<T> {
    try {
      if (this.redis) {
        return await operation()
      }
    } catch (error) {
      logger.error('Redis operation failed, using fallback', { error })
    }
    return fallback()
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.handleRedisError(
      async () => {
        if (!this.redis) return null
        
        const value = await this.redis.get(key)
        if (!value) return null

        try {
          const parsed = JSON.parse(value) as CacheEntry<T>
          
          // Update hit count in database
          this.updateHitCount(key).catch(error => {
            logger.error('Failed to update hit count', { error, key })
          })
          
          return parsed.value
        } catch (error) {
          logger.error('Failed to parse cached value', { error, key })
          return null
        }
      },
      () => {
        const entry = this.fallbackCache.get(key)
        if (!entry) return null
        
        const now = Date.now()
        if (now - entry.createdAt > entry.ttl * 1000) {
          this.fallbackCache.delete(key)
          return null
        }
        
        return entry.value as T
      }
    )
  }

  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    const { ttl = DEFAULT_TTL, tags = DEFAULT_TAGS, compress = false } = options

    const cacheEntry: CacheEntry<T> = {
      value,
      tags,
      createdAt: Date.now(),
      ttl,
    }

    return this.handleRedisError(
      async () => {
        if (!this.redis) return false
        
        let serializedValue = JSON.stringify(cacheEntry)
        
        if (compress && serializedValue.length > 1024) {
          // For large values, we could implement compression here
          // For now, just log the size
          logger.debug('Large cache value detected', { 
            key, 
            size: serializedValue.length 
          })
        }

        const result = await this.redis.setex(key, ttl, serializedValue)
        
        // Store cache entry metadata in database
        await this.storeCacheMetadata(key, tags, ttl).catch(error => {
          logger.error('Failed to store cache metadata', { error, key })
        })
        
        return result === 'OK'
      },
      () => {
        this.fallbackCache.set(key, cacheEntry)
        return true
      }
    )
  }

  async del(key: string): Promise<boolean> {
    return this.handleRedisError(
      async () => {
        if (!this.redis) return false
        const result = await this.redis.del(key)
        return result > 0
      },
      () => {
        return this.fallbackCache.delete(key)
      }
    )
  }

  async exists(key: string): Promise<boolean> {
    return this.handleRedisError(
      async () => {
        if (!this.redis) return false
        const result = await this.redis.exists(key)
        return result > 0
      },
      () => {
        const entry = this.fallbackCache.get(key)
        if (!entry) return false
        
        const now = Date.now()
        if (now - entry.createdAt > entry.ttl * 1000) {
          this.fallbackCache.delete(key)
          return false
        }
        
        return true
      }
    )
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    return this.handleRedisError(
      async () => {
        if (!this.redis) return 0
        
        // Get all keys with these tags from database
        const cacheEntries = await prisma.cacheEntry.findMany({
          where: {
            tags: {
              hasSome: tags,
            },
          },
          select: { key: true },
        })

        if (cacheEntries.length === 0) return 0

        const keys = cacheEntries.map(entry => entry.key)
        const result = await this.redis.del(...keys)
        
        // Remove from database
        await prisma.cacheEntry.deleteMany({
          where: {
            key: {
              in: keys,
            },
          },
        })
        
        return result
      },
      () => {
        let deleted = 0
        for (const [key, entry] of this.fallbackCache.entries()) {
          if (entry.tags.some(tag => tags.includes(tag))) {
            this.fallbackCache.delete(key)
            deleted++
          }
        }
        return deleted
      }
    )
  }

  async clear(): Promise<boolean> {
    return this.handleRedisError(
      async () => {
        if (!this.redis) return false
        await this.redis.flushdb()
        await prisma.cacheEntry.deleteMany()
        return true
      },
      () => {
        this.fallbackCache.clear()
        return true
      }
    )
  }

  async getStats(): Promise<{
    totalKeys: number
    memoryUsage?: string
    hitCount: number
    totalEntries: number
  }> {
    return this.handleRedisError(
      async () => {
        if (!this.redis) throw new Error('Redis not available')
        
        const info = await this.redis.info('memory')
        const keyspace = await this.redis.info('keyspace')
        
        const memoryMatch = info.match(/used_memory_human:(.+)/)
        const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown'
        
        const dbMatch = keyspace.match(/db0:keys=(\d+)/)
        const totalKeys = dbMatch ? parseInt(dbMatch[1], 10) : 0
        
        const stats = await prisma.cacheEntry.aggregate({
          _sum: {
            hitCount: true,
          },
          _count: true,
        })
        
        return {
          totalKeys,
          memoryUsage,
          hitCount: stats._sum.hitCount || 0,
          totalEntries: stats._count,
        }
      },
      () => ({
        totalKeys: this.fallbackCache.size,
        hitCount: 0,
        totalEntries: this.fallbackCache.size,
      })
    )
  }

  private async storeCacheMetadata(
    key: string,
    tags: string[],
    ttl: number
  ): Promise<void> {
    try {
      await prisma.cacheEntry.upsert({
        where: { key },
        update: {
          tags,
          ttl: new Date(Date.now() + ttl * 1000),
          hitCount: 0,
        },
        create: {
          key,
          value: {}, // We don't store actual value in DB, just metadata
          tags,
          ttl: new Date(Date.now() + ttl * 1000),
        },
      })
    } catch (error) {
      logger.error('Failed to store cache metadata', { error, key })
    }
  }

  private async updateHitCount(key: string): Promise<void> {
    try {
      await prisma.cacheEntry.update({
        where: { key },
        data: {
          hitCount: {
            increment: 1,
          },
          lastHit: new Date(),
        },
      })
    } catch (error) {
      // Ignore error if key doesn't exist in database
      if (!error.message?.includes('Record to update not found')) {
        logger.error('Failed to update hit count', { error, key })
      }
    }
  }

  async close(): Promise<void> {
    if (this.fallbackCleanupInterval) {
      clearInterval(this.fallbackCleanupInterval)
    }
    
    if (this.redis) {
      await this.redis.quit()
    }
  }
}

// Singleton cache manager
export const cache = new CacheManager()

// Cache helper functions
export const cacheKeys = {
  project: (id: string) => `project:${id}`,
  methodology: (id: string) => `methodology:${id}`,
  riskAssessment: (projectId: string) => `risk_assessment:${projectId}`,
  satelliteAnalysis: (projectId: string) => `satellite_analysis:${projectId}`,
  documentAnalysis: (projectId: string) => `document_analysis:${projectId}`,
  policyCompliance: (projectId: string) => `policy_compliance:${projectId}`,
  userProjects: (userId: string) => `user_projects:${userId}`,
  projectStats: () => 'project_stats',
  methodologyList: (filters: string) => `methodology_list:${filters}`,
} as const

export const cacheTags = {
  project: (id: string) => [`project:${id}`, 'projects'],
  methodology: (id: string) => [`methodology:${id}`, 'methodologies'],
  user: (id: string) => [`user:${id}`, 'users'],
  riskAssessment: ['risk_assessments'],
  satelliteAnalysis: ['satellite_analyses'],
  documentAnalysis: ['document_analyses'],
  policyCompliance: ['policy_compliance'],
} as const

// Cache health check
export async function checkCacheHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded'
  details: {
    redis: boolean
    fallback: boolean
    stats?: any
    error?: string
  }
}> {
  try {
    const redis = getRedisClient()
    
    if (!redis) {
      return {
        status: 'degraded',
        details: {
          redis: false,
          fallback: true,
          stats: await cache.getStats(),
        },
      }
    }

    // Test Redis connection
    await redis.ping()
    const stats = await cache.getStats()
    
    return {
      status: 'healthy',
      details: {
        redis: true,
        fallback: false,
        stats,
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        redis: false,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await cache.close()
})

process.on('SIGINT', async () => {
  await cache.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await cache.close()
  process.exit(0)
})

export default cache