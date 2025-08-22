// Vercel Serverless Function Handler
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Initialize and validate environment configuration (must be first)
const { initializeEnvironment } = require('../config/environment');

// Initialize environment with validation
const config = initializeEnvironment();

// Import monitoring and logging
const { initializeSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } = require('../middleware/monitoring');
const { requestLogger, createContextLogger } = require('../middleware/logger');
const { errorHandler, notFoundHandler, setupGlobalErrorHandlers, asyncHandler } = require('../middleware/errorHandler');

// Import security middleware
const {
  getHelmetConfig,
  rateLimiters,
  additionalSecurityHeaders,
  requestTiming,
  configureTrust,
  getCorsConfig,
  detectSuspiciousActivity
} = require('../middleware/security');

// Initialize monitoring and error handling
const sentryInitialized = initializeSentry();
setupGlobalErrorHandlers();

const app = express();
const prisma = new PrismaClient();

// Create logger for server events
const serverLogger = createContextLogger('VERCEL');

// =====================================
// MIDDLEWARE STACK (ORDER MATTERS!)
// =====================================

// 1. Sentry request handler (must be first)
if (sentryInitialized) {
  app.use(sentryRequestHandler());
  app.use(sentryTracingHandler());
}

// 2. Trust proxy (for Vercel)
app.set('trust proxy', true);

// 3. Request timing and logging
app.use(requestTiming);
app.use(requestLogger);

// 4. Security headers
app.use(getHelmetConfig());
app.use(additionalSecurityHeaders);
app.use(detectSuspiciousActivity);

// 5. CORS configuration
app.use(cors(getCorsConfig()));

// 6. Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Rate limiting (apply to all routes)
app.use(rateLimiters.general);

// =====================================
// STATIC FILE SERVING
// =====================================

// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve template assets
app.use('/template', express.static(path.join(__dirname, '../template')));

// Serve content assets  
app.use('/content', express.static(path.join(__dirname, '../content')));

// Serve assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve CMS admin files
app.use('/cms-admin', express.static(path.join(__dirname, '../cms-admin')));

// =====================================
// API ROUTES
// =====================================

// Health check endpoint
app.use('/api/health', require('../routes/health'));

// Authentication routes (no additional rate limiting needed - has built-in)
app.use('/api/auth', require('../routes/auth'));

// Protected API routes with authentication rate limiting
app.use('/api/customers', rateLimiters.api, require('../routes/customers'));
app.use('/api/team-members', rateLimiters.api, require('../routes/team-members'));
app.use('/api/jobs', rateLimiters.api, require('../routes/jobs'));
app.use('/api/news', rateLimiters.api, require('../routes/news'));
app.use('/api/company-history', rateLimiters.api, require('../routes/company-history'));
app.use('/api/fachkompetenzen', rateLimiters.api, require('../routes/fachkompetenzen'));
app.use('/api/settings', rateLimiters.api, require('../routes/settings'));
app.use('/api/dienstleistungen', rateLimiters.api, require('../routes/dienstleistungen'));
app.use('/api/newsletter', rateLimiters.newsletter, require('../routes/newsletter'));
app.use('/api/agb', rateLimiters.api, require('../routes/agb'));
app.use('/api/datenschutz', rateLimiters.api, require('../routes/datenschutz'));

// Media upload routes with strict rate limiting
app.use('/api/media', rateLimiters.upload, require('../routes/media'));

// Analytics routes with moderate rate limiting
app.use('/api/analytics', rateLimiters.analytics, require('../routes/analytics'));

// Special pages API
app.use('/api/pages', rateLimiters.api, require('../routes/pages'));

// Legal content API
app.use('/api/legal', rateLimiters.api, require('../routes/legal'));

// Search API
app.use('/api/search', rateLimiters.search, require('../routes/search'));

// Documentation API
app.use('/api/docs', require('../routes/docs'));

// Category cards API
app.use('/api/category-cards', rateLimiters.api, require('../routes/category-cards'));

// Analytics stats API
app.use('/api/analytics-stats', rateLimiters.analytics, require('../routes/analytics-stats'));

// =====================================
// FRONTEND ROUTES
// =====================================

// Serve main website pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Static HTML pages
const staticPages = [
  'beschriftungen',
  'lichtwerbung', 
  'digital-signage',
  'dienstleistungen',
  'newsletter-anmeldung',
  'datenschutz',
  'impressum',
  'geschaeftsbedingungen'
];

staticPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `../${page}.html`));
  });
});

// Subpage routes
const subpageRoutes = {
  'beschriftungen': [
    'blachen-fahnen',
    'fahrzeugbeschriftung', 
    'fensterbeschriftung',
    'grossformatdruck',
    'signaletik',
    'tafelbeschriftung'
  ],
  'lichtwerbung': [
    'halbrelief-plattenschriften',
    'leuchtschriften',
    'leuchttransparente', 
    'neon-led-technik',
    'pylonen'
  ],
  'neon-murer': [
    'fachkompetenzen',
    'firmengeschichte',
    'kontaktpersonen',
    'news',
    'stellenangebote'
  ]
};

Object.entries(subpageRoutes).forEach(([category, pages]) => {
  pages.forEach(page => {
    app.get(`/${category}/${page}`, (req, res) => {
      res.sendFile(path.join(__dirname, `../${category}/${page}.html`));
    });
  });
});

// =====================================
// ERROR HANDLING
// =====================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Sentry error handler (must be last)
if (sentryInitialized) {
  app.use(sentryErrorHandler());
}

// Initialize database connection for Vercel
let dbConnected = false;

const initializeDatabase = async () => {
  if (dbConnected) return;
  
  try {
    await prisma.$connect();
    serverLogger.info('Database connection established for Vercel');
    dbConnected = true;
  } catch (error) {
    serverLogger.error('Database connection failed', { error: error.message });
    throw error;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Export for Vercel
module.exports = app;
