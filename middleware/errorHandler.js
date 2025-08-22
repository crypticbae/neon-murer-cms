const path = require('path');
const { createContextLogger } = require('./logger');
const { captureException, sendAlert, AlertLevel } = require('./monitoring');

// Create error logger
const errorLogger = createContextLogger('ERROR_HANDLER');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 900) {
    super('Too many requests', 429, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Error response formatter
 */
function formatErrorResponse(err, req) {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const baseResponse = {
    success: false,
    error: err.message,
    code: err.code || 'INTERNAL_ERROR',
    errorId,
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (isDevelopment) {
    baseResponse.stack = err.stack;
    baseResponse.details = err.details || undefined;
  }

  // Add retry information for rate limits
  if (err instanceof RateLimitError) {
    baseResponse.retryAfter = err.retryAfter;
  }

  // Add validation details
  if (err instanceof ValidationError && err.details) {
    baseResponse.validationErrors = err.details;
  }

  return baseResponse;
}

/**
 * HTML Error Pages
 */
function renderErrorPage(statusCode, message, errorId, req) {
  const errorPages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden', 
    404: 'Page Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };

  const title = errorPages[statusCode] || 'Error';
  const isClientError = statusCode >= 400 && statusCode < 500;
  
  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusCode} - ${title} | Neon Murer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #112357 0%, #1e3a8a 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .error-container {
            text-align: center;
            max-width: 600px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px 40px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .error-code {
            font-size: 120px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #fff, #e2e8f0);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }
        
        .error-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #f8fafc;
        }
        
        .error-message {
            font-size: 18px;
            margin-bottom: 40px;
            color: #cbd5e1;
            line-height: 1.6;
        }
        
        .error-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
            color: white;
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .error-id {
            margin-top: 40px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #94a3b8;
        }
        
        .contact-info {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            font-size: 14px;
            color: #e2e8f0;
        }
        
        .icon {
            width: 20px;
            height: 20px;
        }
        
        @media (max-width: 768px) {
            .error-container {
                padding: 40px 20px;
            }
            
            .error-code {
                font-size: 80px;
            }
            
            .error-title {
                font-size: 24px;
            }
            
            .error-actions {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">${statusCode}</div>
        <h1 class="error-title">${title}</h1>
        <p class="error-message">${message}</p>
        
        <div class="error-actions">
            <a href="/" class="btn btn-primary">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Zur Startseite
            </a>
            
            ${isClientError ? `
            <button onclick="window.history.back()" class="btn btn-secondary">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                </svg>
                Zurück
            </button>
            ` : `
            <button onclick="window.location.reload()" class="btn btn-secondary">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Seite neu laden
            </button>
            `}
        </div>
        
        ${!isProduction ? `
        <div class="error-id">
            <strong>Error ID:</strong> ${errorId}<br>
            <strong>Path:</strong> ${req.originalUrl}<br>
            <strong>Time:</strong> ${new Date().toLocaleString('de-DE')}
        </div>
        ` : ''}
        
        <div class="contact-info">
            <strong>Benötigen Sie Hilfe?</strong><br>
            Kontaktieren Sie uns unter: 
            <a href="mailto:info@neonmurer.ch" style="color: #60a5fa;">info@neonmurer.ch</a> oder 
            <a href="tel:+41552255025" style="color: #60a5fa;">+41 55 225 50 25</a>
        </div>
    </div>
    
    <script>
        // Auto-reload for 5xx errors after 30 seconds
        ${statusCode >= 500 ? `
        setTimeout(() => {
            if (confirm('Möchten Sie die Seite automatisch neu laden?')) {
                window.location.reload();
            }
        }, 30000);
        ` : ''}
    </script>
</body>
</html>`;
}

/**
 * Main error handling middleware
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  const errorData = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || null
  };

  // Handle different error types
  if (err.name === 'CastError') {
    error = new ValidationError('Invalid ID format');
  }
  
  if (err.code === 11000) {
    error = new ConflictError('Duplicate field value');
  }
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = new ValidationError('Validation Error', messages);
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Prisma errors
  if (err.code === 'P2002') {
    error = new ConflictError('Unique constraint violation');
  }
  
  if (err.code === 'P2025') {
    error = new NotFoundError('Record');
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new AppError('Internal Server Error', 500);
  }

  // Log the error
  const level = error.statusCode >= 500 ? 'error' : 'warn';
  errorLogger[level]('Request failed', {
    ...errorData,
    statusCode: error.statusCode,
    errorCode: error.code
  });

  // Send alerts for critical errors
  if (error.statusCode >= 500) {
    const alertLevel = error.statusCode >= 500 ? AlertLevel.HIGH : AlertLevel.MEDIUM;
    sendAlert(
      alertLevel,
      `${error.statusCode} Error in ${req.method} ${req.originalUrl}`,
      error.message,
      errorData
    );
    
    // Capture exception in monitoring
    captureException(err, {
      user: req.user ? {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      } : undefined,
      tags: {
        route: req.originalUrl,
        method: req.method,
        statusCode: error.statusCode
      },
      extra: errorData
    });
  }

  // Format response
  const errorResponse = formatErrorResponse(error, req);

  // Send response based on request type
  if (req.accepts('html') && !req.originalUrl.startsWith('/api/')) {
    // HTML error page for browser requests
    const errorPage = renderErrorPage(
      error.statusCode,
      isProduction ? 'Ein Fehler ist aufgetreten.' : error.message,
      errorResponse.errorId,
      req
    );
    
    res.status(error.statusCode).send(errorPage);
  } else {
    // JSON response for API requests
    res.status(error.statusCode).json(errorResponse);
  }
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
}

/**
 * Async error wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global uncaught exception handlers
 */
function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (err) => {
    errorLogger.error('UNCAUGHT EXCEPTION! Shutting down...', {
      error: err.message,
      stack: err.stack
    });
    
    sendAlert(
      AlertLevel.CRITICAL,
      'Uncaught Exception',
      err.message,
      { stack: err.stack }
    );
    
    captureException(err, {
      tags: { type: 'uncaught_exception' }
    });
    
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    errorLogger.error('UNHANDLED REJECTION! Shutting down...', {
      reason: reason?.message || reason,
      promise: promise.toString()
    });
    
    sendAlert(
      AlertLevel.CRITICAL,
      'Unhandled Promise Rejection',
      reason?.message || 'Unknown rejection',
      { reason }
    );
    
    if (reason instanceof Error) {
      captureException(reason, {
        tags: { type: 'unhandled_rejection' }
      });
    }
    
    process.exit(1);
  });
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  
  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Setup
  setupGlobalErrorHandlers,
  
  // Utilities
  formatErrorResponse,
  renderErrorPage
}; 