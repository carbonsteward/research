import winston from 'winston'

// Log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      service: service || 'chatpdd',
      message,
      ...meta,
    }
    return JSON.stringify(logEntry)
  })
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const serviceTag = service ? `[${service}]` : '[chatpdd]'
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} ${level} ${serviceTag} ${message}${metaStr}`
  })
)

// Create transports based on environment
const createTransports = () => {
  const transports: winston.transport[] = []

  // Console transport (always enabled in development)
  if (process.env.NODE_ENV === 'development') {
    transports.push(
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        format: consoleFormat,
      })
    )
  } else {
    // Production console logging (structured JSON)
    transports.push(
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
      })
    )
  }

  // File transports (optional)
  if (process.env.ENABLE_FILE_LOGGING === 'true') {
    // Error log file
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    )

    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    )
  }

  return transports
}

// Create the main logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  format: logFormat,
  transports: createTransports(),
  exitOnError: false,
})

// Handle uncaught exceptions and rejections in production
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.Console({
      format: logFormat,
    })
  )

  logger.rejections.handle(
    new winston.transports.Console({
      format: logFormat,
    })
  )
}

// Create service-specific loggers
export function createLogger(service: string) {
  return {
    error: (message: string, meta?: any) => logger.error(message, { service, ...meta }),
    warn: (message: string, meta?: any) => logger.warn(message, { service, ...meta }),
    info: (message: string, meta?: any) => logger.info(message, { service, ...meta }),
    debug: (message: string, meta?: any) => logger.debug(message, { service, ...meta }),
  }
}

// Performance logging helper
export function logPerformance(
  service: string,
  operation: string,
  duration: number,
  meta?: any
) {
  const serviceLogger = createLogger(service)
  const level = duration > 1000 ? 'warn' : duration > 500 ? 'info' : 'debug'
  
  serviceLogger[level](`Operation completed`, {
    operation,
    duration: `${duration}ms`,
    ...meta,
  })
}

// Request logging middleware helper
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userAgent?: string,
  userId?: string
) {
  const requestLogger = createLogger('api')
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
  
  requestLogger[level](`${method} ${url}`, {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    userAgent,
    userId,
  })
}

// Error logging helper
export function logError(
  service: string,
  error: Error | unknown,
  context?: any
) {
  const serviceLogger = createLogger(service)
  
  if (error instanceof Error) {
    serviceLogger.error(error.message, {
      stack: error.stack,
      name: error.name,
      ...context,
    })
  } else {
    serviceLogger.error('Unknown error occurred', {
      error: String(error),
      ...context,
    })
  }
}

// Database query logging helper
export function logQuery(
  query: string,
  params: any[],
  duration: number,
  error?: Error
) {
  if (process.env.LOG_QUERIES === 'true') {
    const dbLogger = createLogger('database')
    
    if (error) {
      dbLogger.error('Query failed', {
        query,
        params,
        duration: `${duration}ms`,
        error: error.message,
      })
    } else {
      const level = duration > 1000 ? 'warn' : 'debug'
      dbLogger[level]('Query executed', {
        query,
        params,
        duration: `${duration}ms`,
      })
    }
  }
}

// Cache operation logging helper
export function logCacheOperation(
  operation: 'get' | 'set' | 'del' | 'clear',
  key: string,
  hit: boolean = false,
  duration?: number
) {
  if (process.env.ENABLE_CACHE_STATS === 'true') {
    const cacheLogger = createLogger('cache')
    
    cacheLogger.debug(`Cache ${operation}`, {
      operation,
      key,
      hit,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// Security event logging
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any,
  userId?: string,
  ipAddress?: string
) {
  const securityLogger = createLogger('security')
  const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info'
  
  securityLogger[level](`Security event: ${event}`, {
    event,
    severity,
    userId,
    ipAddress,
    ...details,
  })
}

// Audit logging for important actions
export function logAudit(
  action: string,
  entity: string,
  entityId: string,
  userId?: string,
  oldValues?: any,
  newValues?: any,
  metadata?: any
) {
  const auditLogger = createLogger('audit')
  
  auditLogger.info(`Audit: ${action} ${entity}`, {
    action,
    entity,
    entityId,
    userId,
    oldValues,
    newValues,
    ...metadata,
  })
}

// Health check logging
export function logHealthCheck(
  component: string,
  status: 'healthy' | 'unhealthy' | 'degraded',
  details?: any
) {
  const healthLogger = createLogger('health')
  const level = status === 'unhealthy' ? 'error' : status === 'degraded' ? 'warn' : 'info'
  
  healthLogger[level](`Health check: ${component}`, {
    component,
    status,
    ...details,
  })
}

// Export the main logger for direct use
export default logger

// Export a structured logging interface
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  
  // Convenience methods
  performance: logPerformance,
  request: logRequest,
  error: logError,
  query: logQuery,
  cache: logCacheOperation,
  security: logSecurityEvent,
  audit: logAudit,
  health: logHealthCheck,
}