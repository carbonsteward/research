/**
 * Performance Optimization Utilities
 * Provides caching, memoization, and performance monitoring
 */

import { LRUCache } from 'lru-cache'

// Performance configuration
interface PerformanceConfig {
  enableCaching: boolean
  enableMemoization: boolean
  enableQueryOptimization: boolean
  cacheMaxAge: number
  maxCacheSize: number
}

// Cache instances
const responseCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes
})

const queryCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 minutes
})

const computationCache = new LRUCache<string, any>({
  max: 200,
  ttl: 1000 * 60 * 30, // 30 minutes
})

/**
 * Response caching decorator
 */
export function cached(ttl: number = 300000) { // 5 minutes default
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`

      // Check cache first
      const cached = responseCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      responseCache.set(cacheKey, result, { ttl })

      return result
    }

    return descriptor
  }
}

/**
 * Memoization for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (computationCache.has(key)) {
      return computationCache.get(key)
    }

    const result = fn(...args)
    computationCache.set(key, result)

    return result
  }) as T
}

/**
 * Database query optimization utilities
 */
export class DatabaseOptimizer {
  private static queryMetrics = new Map<string, {
    totalTime: number
    callCount: number
    avgTime: number
    slowQueries: number
  }>()

  /**
   * Track query performance
   */
  static trackQuery(queryName: string, executionTime: number) {
    const metrics = this.queryMetrics.get(queryName) || {
      totalTime: 0,
      callCount: 0,
      avgTime: 0,
      slowQueries: 0
    }

    metrics.totalTime += executionTime
    metrics.callCount += 1
    metrics.avgTime = metrics.totalTime / metrics.callCount

    if (executionTime > 1000) { // Queries over 1 second
      metrics.slowQueries += 1
    }

    this.queryMetrics.set(queryName, metrics)

    // Log slow queries
    if (executionTime > 2000) {
      console.warn(`Slow query detected: ${queryName} took ${executionTime}ms`)
    }
  }

  /**
   * Get query performance metrics
   */
  static getQueryMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {}

    for (const [queryName, stats] of this.queryMetrics.entries()) {
      metrics[queryName] = {
        averageTime: Math.round(stats.avgTime),
        totalCalls: stats.callCount,
        slowQueryCount: stats.slowQueries,
        totalTime: stats.totalTime
      }
    }

    return metrics
  }

  /**
   * Optimize database queries decorator
   */
  static optimized(queryName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now()

        try {
          const result = await method.apply(this, args)
          const executionTime = Date.now() - startTime

          DatabaseOptimizer.trackQuery(queryName, executionTime)

          return result
        } catch (error) {
          const executionTime = Date.now() - startTime
          DatabaseOptimizer.trackQuery(`${queryName}_error`, executionTime)
          throw error
        }
      }

      return descriptor
    }
  }
}

/**
 * Memory usage optimization
 */
export class MemoryOptimizer {
  private static memoryMetrics: Array<{
    timestamp: number
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }> = []

  /**
   * Track memory usage
   */
  static trackMemoryUsage() {
    const memUsage = process.memoryUsage()

    this.memoryMetrics.push({
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    })

    // Keep only last 100 measurements
    if (this.memoryMetrics.length > 100) {
      this.memoryMetrics.shift()
    }

    // Check for memory leaks
    const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    if (usagePercent > 90) {
      console.warn(`High memory usage detected: ${usagePercent.toFixed(1)}%`)
    }
  }

  /**
   * Get memory usage metrics
   */
  static getMemoryMetrics() {
    const recent = this.memoryMetrics.slice(-10)
    const current = process.memoryUsage()

    return {
      current: {
        heapUsed: Math.round(current.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(current.heapTotal / 1024 / 1024), // MB
        usage: Math.round((current.heapUsed / current.heapTotal) * 100), // %
        external: Math.round(current.external / 1024 / 1024), // MB
        rss: Math.round(current.rss / 1024 / 1024) // MB
      },
      trend: recent.map(m => ({
        timestamp: new Date(m.timestamp).toISOString(),
        usage: Math.round((m.heapUsed / m.heapTotal) * 100)
      }))
    }
  }

  /**
   * Force garbage collection (if available)
   */
  static forceGC() {
    if (global.gc) {
      global.gc()
      console.log('Garbage collection forced')
    }
  }

  /**
   * Auto memory cleanup
   */
  static startAutoCleanup(intervalMs: number = 60000) {
    setInterval(() => {
      this.trackMemoryUsage()

      // Clear old cache entries
      responseCache.purgeStale()
      queryCache.purgeStale()
      computationCache.purgeStale()

      // Force GC if memory usage is high
      const usage = process.memoryUsage()
      if ((usage.heapUsed / usage.heapTotal) > 0.8) {
        this.forceGC()
      }
    }, intervalMs)
  }
}

/**
 * Asset optimization utilities
 */
export class AssetOptimizer {
  /**
   * Generate optimized image URLs
   */
  static optimizeImageUrl(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpg' | 'png'
  } = {}): string {
    if (!url) return url

    // For Next.js Image optimization
    const params = new URLSearchParams()

    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)

    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  /**
   * Preload critical resources
   */
  static preloadCriticalResources() {
    if (typeof window === 'undefined') return

    const criticalResources = [
      '/api/health',
      '/api/standards',
      '/api/methodologies'
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = resource
      document.head.appendChild(link)
    })
  }

  /**
   * Lazy load non-critical components
   */
  static createLazyLoader<T>(
    loader: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) {
    if (typeof window === 'undefined') {
      // Server-side: return the loader directly
      return loader
    }

    // Client-side: implement intersection observer lazy loading
    return () => {
      return new Promise<{ default: T }>((resolve) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loader().then(resolve)
              observer.disconnect()
            }
          })
        })

        // Observe a placeholder element
        const placeholder = document.createElement('div')
        observer.observe(placeholder)
      })
    }
  }
}

/**
 * API response optimization
 */
export class APIOptimizer {
  /**
   * Compress API responses
   */
  static compressResponse(data: any): string {
    try {
      // Simple JSON minification
      return JSON.stringify(data, null, 0)
    } catch (error) {
      console.error('Response compression failed:', error)
      return JSON.stringify(data)
    }
  }

  /**
   * Paginate large datasets
   */
  static paginate<T>(
    data: T[],
    page: number = 1,
    limit: number = 10
  ): {
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  } {
    const total = data.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = data.slice(offset, offset + limit)

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  /**
   * Batch API requests
   */
  static async batchRequests<T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = []

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(request => request())
      )
      results.push(...batchResults)
    }

    return results
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static performanceMetrics = new Map<string, number[]>()

  /**
   * Mark performance timing
   */
  static mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name)
    }
  }

  /**
   * Measure performance between marks
   */
  static measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance === 'undefined') return 0

    try {
      performance.measure(name, startMark, endMark)
      const entries = performance.getEntriesByName(name, 'measure')
      const duration = entries[entries.length - 1]?.duration || 0

      // Store metric
      if (!this.performanceMetrics.has(name)) {
        this.performanceMetrics.set(name, [])
      }
      const metrics = this.performanceMetrics.get(name)!
      metrics.push(duration)

      // Keep only last 50 measurements
      if (metrics.length > 50) {
        metrics.shift()
      }

      return duration
    } catch (error) {
      console.warn('Performance measurement failed:', error)
      return 0
    }
  }

  /**
   * Get performance metrics summary
   */
  static getMetrics(): Record<string, {
    avg: number
    min: number
    max: number
    count: number
  }> {
    const summary: Record<string, any> = {}

    for (const [name, measurements] of this.performanceMetrics.entries()) {
      if (measurements.length > 0) {
        summary[name] = {
          avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
          min: Math.min(...measurements),
          max: Math.max(...measurements),
          count: measurements.length
        }
      }
    }

    return summary
  }

  /**
   * Monitor Core Web Vitals
   */
  static monitorWebVitals() {
    if (typeof window === 'undefined') return

    // FCP - First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime)
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // CLS - Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Initialize performance optimization
export function initializePerformanceOptimization(config: Partial<PerformanceConfig> = {}) {
  const defaultConfig: PerformanceConfig = {
    enableCaching: true,
    enableMemoization: true,
    enableQueryOptimization: true,
    cacheMaxAge: 300000, // 5 minutes
    maxCacheSize: 1000
  }

  const finalConfig = { ...defaultConfig, ...config }

  // Start memory monitoring
  if (finalConfig.enableCaching) {
    MemoryOptimizer.startAutoCleanup()
  }

  // Preload critical resources
  AssetOptimizer.preloadCriticalResources()

  // Monitor web vitals in browser
  if (typeof window !== 'undefined') {
    PerformanceMonitor.monitorWebVitals()
  }

  console.log('Performance optimization initialized with config:', finalConfig)
}

// Export performance utilities
export {
  DatabaseOptimizer,
  MemoryOptimizer,
  AssetOptimizer,
  APIOptimizer,
  PerformanceMonitor
}
