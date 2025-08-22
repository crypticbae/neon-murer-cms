const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const { createContextLogger } = require('./logger');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Logger for monitoring events
const monitoringLogger = createContextLogger('MONITORING');

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
function initializeSentry() {
  if (!process.env.SENTRY_DSN && isProduction) {
    monitoringLogger.warn('Sentry DSN not configured for production environment');
    return false;
  }

  if (process.env.SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.npm_package_version || '1.0.0',
        
        // Performance monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
        profilesSampleRate: isProduction ? 0.1 : 1.0,
        
        // Integrations
        integrations: [
          new ProfilingIntegration(),
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: true }),
          new Sentry.Integrations.Prisma({ client: undefined }) // Will be set later
        ],
        
        // Error filtering
        beforeSend(event, hint) {
          // Don't send certain errors in development
          if (isDevelopment) {
            // Filter out common development errors
            if (event.exception?.values?.[0]?.type === 'SyntaxError') {
              return null;
            }
          }
          
          // Filter out rate limiting errors (they're expected)
          if (event.exception?.values?.[0]?.value?.includes('Rate limit exceeded')) {
            return null;
          }
          
          // Add additional context
          event.tags = {
            ...event.tags,
            component: 'neon-murer-cms',
            deployment: process.env.DEPLOYMENT_ENV || 'unknown'
          };
          
          // Log to our internal logger as well
          monitoringLogger.error('Error sent to Sentry', {
            eventId: event.event_id,
            error: hint?.originalException?.message || 'Unknown error'
          });
          
          return event;
        },
        
        // Performance filtering
        tracesSampler: (samplingContext) => {
          // Always sample auth routes
          if (samplingContext.request?.url?.includes('/api/auth/')) {
            return 1.0;
          }
          
          // Sample health checks less frequently
          if (samplingContext.request?.url?.includes('/api/health')) {
            return 0.01; // 1%
          }
          
          // Default sampling
          return isProduction ? 0.1 : 1.0;
        },
        
        // Additional options
        maxBreadcrumbs: 100,
        attachStacktrace: true,
        sendDefaultPii: false, // Don't send personally identifiable information
        
        // Custom user context
        initialScope: {
          tags: {
            service: 'neon-murer-cms',
            server: require('os').hostname()
          }
        }
      });
      
      monitoringLogger.info('Sentry initialized successfully', {
        environment: process.env.NODE_ENV,
        tracesSampleRate: isProduction ? 0.1 : 1.0
      });
      
      return true;
    } catch (error) {
      monitoringLogger.error('Failed to initialize Sentry', { error: error.message });
      return false;
    }
  }
  
  return false;
}

/**
 * Sentry request handler middleware (must be first)
 */
const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler({
    user: ['id', 'email', 'role'],
    request: ['method', 'url', 'headers', 'query_string'],
    transaction: 'methodPath'
  });
};

/**
 * Sentry tracing middleware
 */
const sentryTracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

/**
 * Sentry error handler middleware (must be after routes, before other error handlers)
 */
const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only send 5xx errors to Sentry
      return error.status >= 500 || !error.status;
    }
  });
};

/**
 * Enhanced error tracking with context
 */
function captureException(error, context = {}) {
  Sentry.withScope((scope) => {
    // Add context to scope
    Object.keys(context).forEach(key => {
      if (key === 'user') {
        scope.setUser(context[key]);
      } else if (key === 'tags') {
        Object.keys(context[key]).forEach(tagKey => {
          scope.setTag(tagKey, context[key][tagKey]);
        });
      } else if (key === 'extra') {
        Object.keys(context[key]).forEach(extraKey => {
          scope.setExtra(extraKey, context[key][extraKey]);
        });
      } else {
        scope.setTag(key, context[key]);
      }
    });
    
    // Capture the exception
    const eventId = Sentry.captureException(error);
    
    monitoringLogger.error('Exception captured', {
      eventId,
      error: error.message,
      context
    });
    
    return eventId;
  });
}

/**
 * Capture custom messages/events
 */
function captureMessage(message, level = 'info', context = {}) {
  return Sentry.withScope((scope) => {
    Object.keys(context).forEach(key => {
      scope.setTag(key, context[key]);
    });
    
    const eventId = Sentry.captureMessage(message, level);
    
    monitoringLogger.info('Message captured', {
      eventId,
      message,
      level,
      context
    });
    
    return eventId;
  });
}

/**
 * Performance monitoring wrapper
 */
function measurePerformance(operationName, operation, context = {}) {
  return Sentry.startSpan(
    {
      name: operationName,
      op: context.op || 'function',
      data: context.data || {}
    },
    async (span) => {
      try {
        const result = await operation();
        span.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: error.message });
        captureException(error, {
          operation: operationName,
          ...context
        });
        throw error;
      }
    }
  );
}

/**
 * Database operation monitoring
 */
function monitorDatabaseOperation(operation, query, params = {}) {
  return measurePerformance(
    `db.${operation}`,
    query,
    {
      op: 'db',
      data: {
        operation,
        params: Object.keys(params)
      }
    }
  );
}

/**
 * HTTP request monitoring
 */
function monitorHttpRequest(req, res, next) {
  const transaction = Sentry.startTransaction({
    name: `${req.method} ${req.route?.path || req.path}`,
    op: 'http.server'
  });
  
  // Add request context
  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
    scope.setTag('route', req.route?.path || req.path);
    scope.setTag('method', req.method);
    
    if (req.user) {
      scope.setUser({
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      });
    }
  });
  
  // Monitor response
  const originalSend = res.send;
  res.send = function(data) {
    transaction.setHttpStatus(res.statusCode);
    transaction.finish();
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Health check monitoring
 */
function monitorHealthCheck(checkName, healthCheckFunction) {
  return measurePerformance(
    `health.${checkName}`,
    healthCheckFunction,
    {
      op: 'health_check',
      data: { check: checkName }
    }
  );
}

/**
 * Business logic monitoring
 */
function monitorBusinessOperation(operationName, operation, businessContext = {}) {
  return measurePerformance(
    operationName,
    operation,
    {
      op: 'business',
      data: businessContext
    }
  );
}

/**
 * Alert system for critical issues
 */
const AlertLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

function sendAlert(level, title, message, context = {}) {
  const alertData = {
    level,
    title,
    message,
    timestamp: new Date().toISOString(),
    service: 'neon-murer-cms',
    environment: process.env.NODE_ENV,
    ...context
  };
  
  // Log the alert
  monitoringLogger.warn('Alert triggered', alertData);
  
  // Send to Sentry based on level
  if (level === AlertLevel.CRITICAL || level === AlertLevel.HIGH) {
    captureMessage(`ALERT [${level.toUpperCase()}]: ${title}`, 'error', {
      alert: true,
      ...alertData
    });
  }
  
  // In production, you might want to integrate with:
  // - Slack webhooks
  // - Email notifications
  // - PagerDuty
  // - Discord webhooks
  if (isProduction && level === AlertLevel.CRITICAL) {
    // TODO: Implement critical alert notifications
    monitoringLogger.error('CRITICAL ALERT - Manual intervention required', alertData);
  }
  
  return alertData;
}

/**
 * Graceful shutdown monitoring
 */
function monitorGracefulShutdown() {
  const shutdownHandler = (signal) => {
    monitoringLogger.info(`Received ${signal}, starting graceful shutdown`);
    
    // Close Sentry client
    Sentry.close(2000).then(() => {
      monitoringLogger.info('Sentry client closed');
      process.exit(0);
    });
  };
  
  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
}

module.exports = {
  // Core functions
  initializeSentry,
  captureException,
  captureMessage,
  
  // Middleware
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  monitorHttpRequest,
  
  // Performance monitoring
  measurePerformance,
  monitorDatabaseOperation,
  monitorHealthCheck,
  monitorBusinessOperation,
  
  // Alerting
  AlertLevel,
  sendAlert,
  
  // Utilities
  monitorGracefulShutdown,
  
  // Direct Sentry access for advanced usage
  Sentry
}; 