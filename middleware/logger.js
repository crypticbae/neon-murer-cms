const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Log directory setup
const logDir = process.env.LOG_DIR || './logs';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Transport configurations
const transports = [];

// Console transport (always active)
transports.push(
  new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',
    format: isDevelopment ? consoleFormat : logFormat
  })
);

// File transports (production + development with file logging)
if (isProduction || process.env.LOG_TO_FILE === 'true') {
  // Error log (errors only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  );

  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    })
  );

  // Security log (security events only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxSize: '20m',
      maxFiles: '60d',
      format: logFormat
    })
  );

  // Access log (HTTP requests)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: {
    service: 'neon-murer-cms',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

// Custom log methods for different contexts
const createContextLogger = (context) => {
  return {
    debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
    error: (message, meta = {}) => logger.error(message, { context, ...meta }),
    
    // Security-specific logging
    security: (type, message, meta = {}) => {
      logger.warn(message, { 
        context: 'SECURITY', 
        securityEvent: type,
        timestamp: new Date().toISOString(),
        ...meta 
      });
    },
    
    // Performance logging
    performance: (operation, duration, meta = {}) => {
      logger.info(`Performance: ${operation} completed in ${duration}ms`, {
        context: 'PERFORMANCE',
        operation,
        duration,
        ...meta
      });
    },
    
    // Database logging
    database: (operation, query, duration, meta = {}) => {
      logger.debug(`DB: ${operation}`, {
        context: 'DATABASE',
        operation,
        query: isDevelopment ? query : '[REDACTED]',
        duration,
        ...meta
      });
    },
    
    // HTTP request logging
    http: (method, url, statusCode, duration, meta = {}) => {
      const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
      logger[level](`${method} ${url} ${statusCode} - ${duration}ms`, {
        context: 'HTTP',
        method,
        url,
        statusCode,
        duration,
        ...meta
      });
    }
  };
};

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // Override res.send to capture response
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const logData = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      contentLength: res.get('Content-Length') || 0,
      userId: req.user?.userId || null,
      requestId: req.id || null
    };
    
    // Log to access log
    logger.info('HTTP Request', {
      context: 'ACCESS',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ...logData
    });
    
    // Log errors and warnings
    if (res.statusCode >= 400) {
      const errorLogger = createContextLogger('HTTP_ERROR');
      errorLogger.error(`${req.method} ${req.originalUrl} failed with ${res.statusCode}`, {
        body: isDevelopment ? req.body : '[REDACTED]',
        query: req.query,
        params: req.params,
        ...logData
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const errorData = {
    errorId,
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || null,
    body: isDevelopment ? req.body : '[REDACTED]',
    query: req.query,
    params: req.params
  };
  
  // Log the error
  logger.error('Unhandled Error', {
    context: 'ERROR_HANDLER',
    ...errorData
  });
  
  // Add error ID to response
  req.errorId = errorId;
  next(err);
};

// Structured application events
const events = {
  APP_START: 'app_start',
  APP_SHUTDOWN: 'app_shutdown',
  DB_CONNECTED: 'database_connected',
  DB_DISCONNECTED: 'database_disconnected',
  AUTH_SUCCESS: 'authentication_success',
  AUTH_FAILURE: 'authentication_failure',
  RATE_LIMIT_HIT: 'rate_limit_exceeded',
  SECURITY_VIOLATION: 'security_violation',
  PERFORMANCE_ISSUE: 'performance_issue'
};

// Health check logging
const healthLogger = createContextLogger('HEALTH');

// Export everything
module.exports = {
  logger,
  createContextLogger,
  requestLogger,
  errorLogger,
  events,
  healthLogger,
  
  // Pre-configured loggers for common contexts
  authLogger: createContextLogger('AUTH'),
  dbLogger: createContextLogger('DATABASE'),
  securityLogger: createContextLogger('SECURITY'),
  performanceLogger: createContextLogger('PERFORMANCE'),
  
  // Utility functions
  logAppStart: () => {
    logger.info('🚀 Application starting', {
      context: 'STARTUP',
      event: events.APP_START,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      memory: process.memoryUsage()
    });
  },
  
  logAppShutdown: (signal) => {
    logger.info('🛑 Application shutting down', {
      context: 'SHUTDOWN',
      event: events.APP_SHUTDOWN,
      signal,
      uptime: process.uptime()
    });
  },
  
  // Activity and error logging functions
  logActivity: (type, message, req = null, meta = {}) => {
    const activityData = {
      context: 'ACTIVITY',
      activityType: type,
      ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : req?.headers?.['user-agent'] || 'unknown',
      userId: req?.user?.userId || null,
      timestamp: new Date().toISOString(),
      ...meta
    };
    
    logger.info(message, activityData);
  },
  
  logError: (type, error, req = null, meta = {}) => {
    const errorData = {
      context: 'ERROR',
      errorType: type,
      errorMessage: error.message || error,
      errorStack: error.stack || null,
      ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : req?.headers?.['user-agent'] || 'unknown',
      userId: req?.user?.userId || null,
      url: req?.originalUrl || 'unknown',
      method: req?.method || 'unknown',
      timestamp: new Date().toISOString(),
      ...meta
    };
    
    logger.error(error.message || error, errorData);
  }
}; 