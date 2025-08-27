const { createContextLogger } = require('../middleware/logger');

// Create logger for configuration
const configLogger = createContextLogger('CONFIG');

// Environment validation errors
class ConfigurationError extends Error {
  constructor(message, missingVars = []) {
    super(message);
    this.name = 'ConfigurationError';
    this.missingVars = missingVars;
  }
}

/**
 * Environment variable definitions with validation rules
 */
const ENV_DEFINITIONS = {
  // Core Application
  NODE_ENV: {
    required: true,
    type: 'string',
    allowedValues: ['development', 'staging', 'production', 'test'],
    default: 'development',
    description: 'Application environment'
  },
  PORT: {
    required: true,
    type: 'number',
    default: 3835,
    min: 1000,
    max: 65535,
    description: 'Server port number'
  },
  DEPLOYMENT_ENV: {
    required: false,
    type: 'string',
    default: process.env.NODE_ENV || 'development',
    description: 'Deployment environment identifier'
  },

  // Database Configuration
  DATABASE_URL: {
    required: true,
    type: 'string',
    pattern: /^postgresql:\/\/.+/,
    description: 'PostgreSQL database connection URL',
    sensitive: true
  },
  DATABASE_MAX_CONNECTIONS: {
    required: false,
    type: 'number',
    default: 20,
    min: 1,
    max: 100,
    description: 'Maximum database connections'
  },
  DATABASE_CONNECTION_TIMEOUT: {
    required: false,
    type: 'number',
    default: 60000,
    min: 1000,
    description: 'Database connection timeout in milliseconds'
  },

  // JWT & Authentication
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT signing secret',
    sensitive: true,
    validate: (value) => {
      if (value === 'your-jwt-secret-here' || value === 'secret') {
        throw new Error('JWT_SECRET must not use default values');
      }
      return true;
    }
  },
  JWT_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '7d',
    pattern: /^\d+[smhd]$/,
    description: 'JWT access token expiration time'
  },
  JWT_REFRESH_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '30d',
    pattern: /^\d+[smhd]$/,
    description: 'JWT refresh token expiration time'
  },

  // Admin Configuration
  ADMIN_EMAIL: {
    required: true,
    type: 'email',
    description: 'Administrator email address'
  },
  ADMIN_PASSWORD: {
    required: true,
    type: 'string',
    minLength: 8,
    description: 'Administrator password',
    sensitive: true,
    validate: (value) => {
      if (value === 'admin' || value === 'password' || value === '123456') {
        throw new Error('ADMIN_PASSWORD must not use common passwords');
      }
      return true;
    }
  },
  ADMIN_NAME: {
    required: false,
    type: 'string',
    default: 'Administrator',
    description: 'Administrator display name'
  },

  // Frontend & Domains
  FRONTEND_URL: {
    required: true,
    type: 'url',
    description: 'Frontend application URL'
  },
  ALLOWED_ORIGINS: {
    required: false,
    type: 'string',
    description: 'Comma-separated list of allowed CORS origins'
  },

  // File Upload
  MAX_FILE_SIZE: {
    required: false,
    type: 'string',
    default: '10mb',
    pattern: /^\d+[kmg]b$/i,
    description: 'Maximum file upload size'
  },
  UPLOAD_DIR: {
    required: false,
    type: 'string',
    default: './uploads',
    description: 'File upload directory path'
  },

  // Email Configuration
  SMTP_HOST: {
    required: false,
    type: 'string',
    description: 'SMTP server hostname'
  },
  SMTP_PORT: {
    required: false,
    type: 'number',
    default: 587,
    description: 'SMTP server port'
  },
  SMTP_USER: {
    required: false,
    type: 'string',
    description: 'SMTP username',
    sensitive: true
  },
  SMTP_PASS: {
    required: false,
    type: 'string',
    description: 'SMTP password',
    sensitive: true
  },

  // Monitoring & Error Tracking
  SENTRY_DSN: {
    required: false,
    type: 'url',
    description: 'Sentry error tracking DSN',
    sensitive: true
  },
  SENTRY_ENVIRONMENT: {
    required: false,
    type: 'string',
    default: process.env.NODE_ENV || 'development',
    description: 'Sentry environment name'
  },

  // Logging
  LOG_LEVEL: {
    required: false,
    type: 'string',
    allowedValues: ['debug', 'info', 'warn', 'error'],
    default: 'info',
    description: 'Application log level'
  },
  LOG_TO_FILE: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable file logging'
  },
  LOG_DIR: {
    required: false,
    type: 'string',
    default: './logs',
    description: 'Log files directory'
  },

  // Security
  BCRYPT_ROUNDS: {
    required: false,
    type: 'number',
    default: 12,
    min: 10,
    max: 15,
    description: 'Bcrypt hashing rounds'
  },
  HTTPS_ENABLED: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable HTTPS server',
    validate: (value, env) => {
      if (env.NODE_ENV === 'production' && !value) {
        throw new Error('HTTPS_ENABLED must be true in production');
      }
      return true;
    }
  },
  SSL_KEY_PATH: {
    required: false,
    type: 'string',
    description: 'SSL private key file path',
    requiredIf: (env) => env.HTTPS_ENABLED === 'true'
  },
  SSL_CERT_PATH: {
    required: false,
    type: 'string',
    description: 'SSL certificate file path',
    requiredIf: (env) => env.HTTPS_ENABLED === 'true'
  },

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    default: 900000, // 15 minutes
    description: 'Rate limit window in milliseconds'
  },
  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    default: 1000,
    description: 'Maximum requests per window'
  },
  AUTH_RATE_LIMIT_MAX: {
    required: false,
    type: 'number',
    default: 5,
    description: 'Maximum auth attempts per window'
  },

  // Health Checks
  HEALTH_CHECK_ENABLED: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable health check endpoints'
  },
  METRICS_ENABLED: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable metrics collection'
  }
};

/**
 * Validate a single environment variable
 */
function validateEnvVar(key, definition, value, allEnv = {}) {
  const errors = [];

  // Check if required
  if (definition.required && (value === undefined || value === '')) {
    errors.push(`${key} is required`);
    return errors;
  }

  // Check conditional requirements
  if (definition.requiredIf && typeof definition.requiredIf === 'function') {
    if (definition.requiredIf(allEnv) && (value === undefined || value === '')) {
      errors.push(`${key} is required when condition is met`);
      return errors;
    }
  }

  // Skip validation if value is not provided and not required
  if (!value && !definition.required) {
    return errors;
  }

  // Type validation
  switch (definition.type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`${key} must be a valid number`);
      } else {
        if (definition.min !== undefined && num < definition.min) {
          errors.push(`${key} must be at least ${definition.min}`);
        }
        if (definition.max !== undefined && num > definition.max) {
          errors.push(`${key} must be at most ${definition.max}`);
        }
      }
      break;

    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        errors.push(`${key} must be a boolean (true/false)`);
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${key} must be a valid email address`);
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch {
        errors.push(`${key} must be a valid URL`);
      }
      break;

    case 'string':
      if (definition.minLength && value.length < definition.minLength) {
        errors.push(`${key} must be at least ${definition.minLength} characters long`);
      }
      if (definition.maxLength && value.length > definition.maxLength) {
        errors.push(`${key} must be at most ${definition.maxLength} characters long`);
      }
      break;
  }

  // Pattern validation
  if (definition.pattern && !definition.pattern.test(value)) {
    errors.push(`${key} has invalid format`);
  }

  // Allowed values validation
  if (definition.allowedValues && !definition.allowedValues.includes(value)) {
    errors.push(`${key} must be one of: ${definition.allowedValues.join(', ')}`);
  }

  // Custom validation
  if (definition.validate && typeof definition.validate === 'function') {
    try {
      definition.validate(value, allEnv);
    } catch (error) {
      errors.push(`${key}: ${error.message}`);
    }
  }

  return errors;
}

/**
 * Validate all environment variables
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const env = process.env;

  // Validate each defined variable
  for (const [key, definition] of Object.entries(ENV_DEFINITIONS)) {
    const value = env[key];
    const varErrors = validateEnvVar(key, definition, value, env);
    errors.push(...varErrors);
  }

  // Production-specific validations
  if (env.NODE_ENV === 'production') {
    // Check for development defaults in production
    if (env.JWT_SECRET === 'neon-murer-super-secure-jwt-secret-2024-production-ready') {
      warnings.push('JWT_SECRET appears to be using development default in production');
    }

    if (env.DATABASE_URL && env.DATABASE_URL.includes('localhost')) {
      warnings.push('DATABASE_URL points to localhost in production environment');
    }

    if (!env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not configured for production error tracking');
    }

    if (!env.HTTPS_ENABLED || env.HTTPS_ENABLED !== 'true') {
      errors.push('HTTPS_ENABLED must be true in production');
    }
  }

  return { errors, warnings };
}

/**
 * Load and parse configuration with defaults
 */
function loadConfiguration() {
  const config = {};
  const env = process.env;

  for (const [key, definition] of Object.entries(ENV_DEFINITIONS)) {
    let value = env[key];

    // Apply default if no value provided
    if (value === undefined && definition.default !== undefined) {
      value = definition.default.toString();
    }

    // Type conversion
    if (value !== undefined) {
      switch (definition.type) {
        case 'number':
          config[key] = Number(value);
          break;
        case 'boolean':
          config[key] = ['true', '1'].includes(value.toLowerCase());
          break;
        default:
          config[key] = value;
      }
    }
  }

  return config;
}

/**
 * Generate environment variable documentation
 */
function generateEnvDocs() {
  const docs = [];
  docs.push('# Environment Variables Documentation\n');

  for (const [key, definition] of Object.entries(ENV_DEFINITIONS)) {
    docs.push(`## ${key}`);
    docs.push(`**Description:** ${definition.description}`);
    docs.push(`**Type:** ${definition.type}`);
    docs.push(`**Required:** ${definition.required ? 'Yes' : 'No'}`);
    
    if (definition.default !== undefined) {
      docs.push(`**Default:** ${definition.default}`);
    }
    
    if (definition.allowedValues) {
      docs.push(`**Allowed Values:** ${definition.allowedValues.join(', ')}`);
    }
    
    if (definition.pattern) {
      docs.push(`**Pattern:** ${definition.pattern}`);
    }
    
    docs.push('');
  }

  return docs.join('\n');
}

/**
 * Get configuration summary (without sensitive data)
 */
function getConfigSummary() {
  const config = loadConfiguration();
  const summary = {};

  for (const [key, definition] of Object.entries(ENV_DEFINITIONS)) {
    if (definition.sensitive) {
      summary[key] = config[key] ? '[REDACTED]' : undefined;
    } else {
      summary[key] = config[key];
    }
  }

  return summary;
}

/**
 * Initialize and validate environment
 */
function initializeEnvironment() {
  configLogger.info('Initializing environment configuration');

  const { errors, warnings } = validateEnvironment();

  // Log warnings
  warnings.forEach(warning => {
    configLogger.warn(`Configuration warning: ${warning}`);
  });

  // Handle errors
  if (errors.length > 0) {
    configLogger.error('Environment validation failed', { errors });
    throw new ConfigurationError(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`,
      errors
    );
  }

  const config = loadConfiguration();
  
  configLogger.info('Environment configuration loaded successfully', {
    environment: config.NODE_ENV,
    port: config.PORT,
    httpsEnabled: config.HTTPS_ENABLED,
    logLevel: config.LOG_LEVEL,
    healthChecksEnabled: config.HEALTH_CHECK_ENABLED
  });

  return config;
}

module.exports = {
  initializeEnvironment,
  validateEnvironment,
  loadConfiguration,
  getConfigSummary,
  generateEnvDocs,
  ConfigurationError,
  ENV_DEFINITIONS
}; 