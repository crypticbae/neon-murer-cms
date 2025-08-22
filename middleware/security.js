const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Production-ready Security Middleware
 * Comprehensive security headers and policies for Neon Murer CMS
 */

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Advanced Content Security Policy
 * Prevents XSS, code injection, and other security threats
 */
const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      // Development: Allow inline scripts and eval for hot reloading
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      // CDN sources for libraries
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com", 
      "https://stackpath.bootstrapcdn.com",
      "https://code.jquery.com",
      "https://unpkg.com",
      // Google Analytics & Tag Manager
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://ssl.google-analytics.com"
    ],
    scriptSrcAttr: [
      ...(isDevelopment ? ["'unsafe-inline'"] : []),
      "'unsafe-hashes'"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for dynamic styles
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://stackpath.bootstrapcdn.com", 
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdnjs.cloudflare.com",
      "data:"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "http:",
      // Analytics
      "https://www.google-analytics.com",
      "https://ssl.google-analytics.com"
    ],
    connectSrc: [
      "'self'",
      // API endpoints
      "http://localhost:3001",
      "https://*.neonmurer.ch",
      // Analytics
      "https://www.google-analytics.com",
      "https://ssl.google-analytics.com"
    ],
    mediaSrc: ["'self'", "data:", "https:"],
    objectSrc: ["'none'"],
    frameSrc: [
      "'self'",
      // YouTube embeds (if needed)
      "https://www.youtube.com",
      "https://youtube.com"
    ],
    frameAncestors: ["'none'"], // Prevents clickjacking
    baseUri: ["'self'"],
    formAction: ["'self'"],
    ...(isProduction && { upgradeInsecureRequests: [] })
  },
  reportOnly: isDevelopment
};

/**
 * Comprehensive Helmet Configuration
 */
function getHelmetConfig() {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: contentSecurityPolicy,
    
    // Cross-Origin Policies
    crossOriginEmbedderPolicy: {
      policy: isDevelopment ? "unsafe-none" : "require-corp"
    },
    crossOriginOpenerPolicy: {
      policy: "same-origin"
    },
    crossOriginResourcePolicy: {
      policy: isDevelopment ? "cross-origin" : "same-origin"
    },
    
    // Security Headers
    dnsPrefetchControl: {
      allow: false
    },
    frameguard: {
      action: 'deny' // Prevents clickjacking
    },
    hidePoweredBy: true,
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin"
    },
    xssFilter: true
  });
}

/**
 * Rate Limiting Configuration
 */
const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // per IP
    message: {
      error: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.',
      retryAfter: '15 Minuten'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  }),

  // Strict rate limiting for authentication
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // 5 attempts per IP
    message: {
      error: 'Zu viele Login-Versuche. Account temporär gesperrt.',
      retryAfter: '15 Minuten'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Authentication rate limit exceeded',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
        code: 'AUTH_RATE_LIMIT'
      });
    }
  }),

  // File upload rate limiting
  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 uploads per minute
    message: {
      error: 'Zu viele Upload-Versuche. Bitte warten Sie einen Moment.',
      retryAfter: '1 Minute'
    }
  }),

  // Password reset limiting
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: {
      error: 'Zu viele Passwort-Reset-Versuche. Bitte kontaktieren Sie den Support.',
      retryAfter: '1 Stunde'
    }
  })
};

/**
 * Additional Security Middleware
 */
function additionalSecurityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Feature Policy / Permissions Policy
  res.setHeader('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'fullscreen=(self)',
    'payment=()'
  ].join(', '));
  
  // Expect-CT (Certificate Transparency)
  if (isProduction) {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }
  
  // Custom security headers
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Response-Time', Date.now() - req.startTime + 'ms');
  
  next();
}

/**
 * Request timing middleware
 */
function requestTiming(req, res, next) {
  req.startTime = Date.now();
  next();
}

/**
 * IP Trust Configuration for Proxies
 */
function configureTrust(app) {
  if (isProduction) {
    // Trust first proxy (load balancer, CloudFlare, etc.)
    app.set('trust proxy', 1);
  } else {
    // Development: trust localhost
    app.set('trust proxy', 'loopback');
  }
}

/**
 * CORS Configuration
 */
function getCorsConfig() {
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://neonmurer.ch',
    'https://www.neonmurer.ch',
    'https://cms.neonmurer.ch'
  ];

  return {
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-API-Key'
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Response-Time',
      'X-API-Version'
    ]
  };
}

/**
 * Security Event Logging
 */
function logSecurityEvent(type, req, details = {}) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    type: type,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    ...details
  };
  
  // In production, send to security monitoring service
  if (isProduction) {
    // TODO: Integrate with Sentry, LogDNA, or similar service
    console.warn('SECURITY_EVENT:', JSON.stringify(securityLog));
  } else {
    console.log('Security Event:', securityLog);
  }
}

/**
 * Suspicious Activity Detection
 */
function detectSuspiciousActivity(req, res, next) {
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /exec\(/i, // Code injection
    /eval\(/i, // Code injection
    /javascript:/i, // Javascript protocol
    /vbscript:/i, // VBScript protocol
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  
  const suspiciousPattern = suspiciousPatterns.find(pattern => 
    pattern.test(requestData)
  );
  
  if (suspiciousPattern) {
    logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
      pattern: suspiciousPattern.toString(),
      data: requestData.substring(0, 500) // Limit log size
    });
    
    return res.status(400).json({
      success: false,
      error: 'Malicious request detected',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  next();
}

module.exports = {
  getHelmetConfig,
  rateLimiters,
  additionalSecurityHeaders,
  requestTiming,
  configureTrust,
  getCorsConfig,
  logSecurityEvent,
  detectSuspiciousActivity
}; 