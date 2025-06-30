/**
 * Redis Configuration for Production
 * Handles graceful fallback when Redis is unavailable
 */

import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (typeof window !== 'undefined') {
    // Client-side, Redis not available
    return null
  }

  if (redis) {
    return redis
  }

  try {
    const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL

    if (!redisUrl) {
      console.warn('[Redis] No Redis URL configured, running without cache')
      return null
    }

    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      // Graceful error handling
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        return err.message.includes(targetError)
      },
    })

    redis.on('error', (err) => {
      console.warn('[Redis] Connection error:', err.message)
      // Don't throw, just log warning
    })

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully')
    })

    redis.on('ready', () => {
      console.log('[Redis] Ready for operations')
    })

    redis.on('close', () => {
      console.log('[Redis] Connection closed')
    })

    return redis
  } catch (error) {
    console.warn('[Redis] Failed to initialize:', error)
    return null
  }
}

export async function closeRedisConnection() {
  if (redis) {
    try {
      await redis.quit()
      redis = null
    } catch (error) {
      console.warn('[Redis] Error closing connection:', error)
    }
  }
}

export async function setCache(key: string, value: string, ttl = 3600): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    await client.setex(key, ttl, value)
    return true
  } catch (error) {
    console.warn('[Redis] Cache set failed:', error)
    return false
  }
}

export async function getCache(key: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    return await client.get(key)
  } catch (error) {
    console.warn('[Redis] Cache get failed:', error)
    return null
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    await client.del(key)
    return true
  } catch (error) {
    console.warn('[Redis] Cache delete failed:', error)
    return false
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeRedisConnection)
  process.on('SIGTERM', closeRedisConnection)
}
