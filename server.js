require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Initialize and validate environment configuration (must be first)
const { initializeEnvironment } = require('./config/environment');

// Initialize environment with validation
const config = initializeEnvironment();

// Import monitoring and logging
const { initializeSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler, monitorGracefulShutdown } = require('./middleware/monitoring');
const { logAppStart, logAppShutdown, requestLogger, createContextLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler, setupGlobalErrorHandlers, asyncHandler } = require('./middleware/errorHandler');

// Import security middleware
const {
  getHelmetConfig,
  rateLimiters,
  additionalSecurityHeaders,
  requestTiming,
  configureTrust,
  getCorsConfig,
  detectSuspiciousActivity
} = require('./middleware/security');

// Initialize monitoring and error handling
const sentryInitialized = initializeSentry();
setupGlobalErrorHandlers();
monitorGracefulShutdown();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3835;

// Create logger for server events
const serverLogger = createContextLogger('SERVER');

// =====================================
// MIDDLEWARE STACK (ORDER MATTERS!)
// =====================================

// 1. Sentry request handler (must be first)
if (sentryInitialized) {
  app.use(sentryRequestHandler());
  app.use(sentryTracingHandler());
}

// 2. Configure Express trust proxy settings
configureTrust(app);

// 3. Request timing (early for accurate measurements)
app.use(requestTiming);

// 4. Request logging (after timing setup)
app.use(requestLogger);

// 5. Comprehensive Security Headers
app.use(getHelmetConfig());

// 6. Additional custom security headers
app.use(additionalSecurityHeaders);

// 7. Suspicious activity detection
app.use(detectSuspiciousActivity);

// 8. Performance compression
app.use(compression());

// 9. Advanced CORS configuration
app.use(cors(getCorsConfig()));

// 10. Rate Limiting
app.use('/api/', rateLimiters.general);
app.use('/api/auth/', rateLimiters.auth);

// 11. Body Parsing (skip for file uploads)
app.use((req, res, next) => {
  // Skip JSON parsing for file uploads (multipart/form-data)
  if (req.path.startsWith('/api/media/upload')) {
    return next();
  }
  express.json({ 
    limit: process.env.MAX_JSON_SIZE || '10mb',
    strict: true,
    type: 'application/json'
  })(req, res, next);
});

app.use((req, res, next) => {
  // Skip URL encoding for file uploads
  if (req.path.startsWith('/api/media/upload')) {
    return next();
  }
  express.urlencoded({ 
    extended: true, 
    limit: process.env.MAX_URL_ENCODED_SIZE || '10mb',
    parameterLimit: 1000
  })(req, res, next);
});

// =====================================
// STATIC FILE SERVING
// =====================================

// Upload directory with security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Security headers for uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Only allow image types to be displayed inline
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath);
    if (!isImage) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// CMS Admin Interface - with relaxed CSP to reduce console noise
app.use('/cms-admin', (req, res, next) => {
  // Override CSP header for admin interface to reduce console errors
  res.setHeader('Content-Security-Policy-Report-Only', 
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; img-src 'self' data: blob: https: http:; script-src-attr 'unsafe-inline';"
  );
  next();
}, express.static(path.join(__dirname, 'cms-admin'), {
  maxAge: '1h',
  etag: true
}));

// Website static files
app.use('/content', express.static(path.join(__dirname, 'content'), {
  maxAge: '7d',
  etag: true
}));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '30d',
  etag: true
}));
app.use('/template', express.static(path.join(__dirname, 'template'), {
  maxAge: '7d',
  etag: true
}));
app.use('/favicon', express.static(path.join(__dirname, 'favicon'), {
  maxAge: '30d',
  etag: true
}));

// Main website files
app.use(express.static(__dirname, { 
  index: false,
  dotfiles: 'ignore',
  extensions: ['html'],
  maxAge: '1h',
  etag: true
}));

// =====================================
// ROUTES
// =====================================

// Root route - main website
app.get('/', asyncHandler(async (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
}));

// Health and monitoring routes
app.use('/api/health', require('./routes/health'));
app.use('/api/analytics', require('./routes/analytics'));

// Configuration endpoint (development only)
if (config.NODE_ENV === 'development') {
  app.get('/api/config', (req, res) => {
    const { getConfigSummary } = require('./config/environment');
    res.json({
      environment: config.NODE_ENV,
      config: getConfigSummary(),
      timestamp: new Date().toISOString()
    });
  });
}

// API Routes with error handling
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/media', require('./routes/media'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/news', require('./routes/news'));
app.use('/api/category-cards', require('./routes/category-cards'));
app.use('/api/team-members', require('./routes/team-members'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/company-history', require('./routes/company-history'));
app.use('/api/fachkompetenzen', require('./routes/fachkompetenzen'));
app.use('/api/dienstleistungen', require('./routes/dienstleistungen'));
app.use('/api/settings/legal', require('./routes/legal'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/agb', require('./routes/agb'));
app.use('/api/datenschutz', require('./routes/datenschutz'));
app.use('/api/search', require('./routes/search'));
app.use('/docs', require('./routes/docs'));

// API documentation (if available)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/docs', (req, res) => {
    res.json({
      message: 'API Documentation',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      endpoints: {
        auth: '/api/auth',
        health: '/api/health',
        pages: '/api/pages',
        media: '/api/media',
        customers: '/api/customers',
        jobs: '/api/jobs',
        news: '/api/news',
        categoryCards: '/api/category-cards',
        teamMembers: '/api/team-members',
        settings: '/api/settings',
        dienstleistungen: '/api/dienstleistungen',
      legal: '/api/settings/legal'
      }
    });
  });
}

// =====================================
// ERROR HANDLING (MUST BE LAST!)
// =====================================

// Sentry error handler (must be before other error handlers)
if (sentryInitialized) {
  app.use(sentryErrorHandler());
}

// 404 handler for all unmatched routes
app.use(notFoundHandler);

// Main error handler (must be last)
app.use(errorHandler);

// =====================================
// SERVER STARTUP & SHUTDOWN
// =====================================

// Graceful shutdown handlers
async function gracefulShutdown(signal) {
  serverLogger.info(`${signal} received, starting graceful shutdown`);
  
  try {
    // Close database connections
    await prisma.$disconnect();
    serverLogger.info('Database connections closed');
    
    // Log shutdown completion
    logAppShutdown(signal);
    
    process.exit(0);
  } catch (error) {
    serverLogger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught Exception - Server will exit', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  serverLogger.error('Unhandled Promise Rejection - Server will exit', {
    reason: reason?.message || reason,
    promise: promise.toString()
  });
  process.exit(1);
});

// =====================================
// START SERVER
// =====================================

const server = app.listen(PORT, '0.0.0.0', async () => {
  // Log application startup
  logAppStart();
  
  serverLogger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uploadsDir: path.join(__dirname, 'uploads'),
    pid: process.pid,
    nodeVersion: process.version,
    sentryEnabled: sentryInitialized
  });
  
  console.log(`🚀 Neon Murer CMS Server running on port ${PORT}`);
  console.log(`🌐 Network: Available on all interfaces (0.0.0.0:${PORT})`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔒 Security: ${sentryInitialized ? 'Enhanced' : 'Basic'} monitoring enabled`);
  console.log(`📋 Health checks: http://localhost:${PORT}/api/health`);
  
  // Test database connection
  try {
    await prisma.$connect();
    serverLogger.info('Database connection established');
    console.log(`🗄️  Database: Connected`);
  } catch (error) {
    serverLogger.error('Database connection failed', { error: error.message });
    console.error(`🗄️  Database: Connection failed - ${error.message}`);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    serverLogger.error(`Port ${PORT} is already in use`, { port: PORT });
    console.error(`❌ Error: Port ${PORT} is already in use`);
  } else {
    serverLogger.error('Server error', { error: error.message });
    console.error(`❌ Server error: ${error.message}`);
  }
  process.exit(1);
});

module.exports = app; 