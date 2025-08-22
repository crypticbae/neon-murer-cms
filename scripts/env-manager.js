#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { validateEnvironment, generateEnvDocs, ENV_DEFINITIONS } = require('../config/environment');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Generate cryptographically secure secrets
 */
class SecretGenerator {
  static generateRandomString(length = 64) {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  static generateJWTSecret() {
    // Generate a strong 64-character JWT secret
    return crypto.randomBytes(64).toString('base64');
  }

  static generateDatabasePassword() {
    // Generate a strong database password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 32; i++) {
      password += chars[crypto.randomInt(chars.length)];
    }
    return password;
  }

  static generateAdminPassword() {
    // Generate a secure admin password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars[crypto.randomInt(chars.length)];
    }
    return password;
  }

  static generateAPIKey() {
    return 'neon_' + crypto.randomBytes(24).toString('hex');
  }

  static generateHealthCheckSecret() {
    return crypto.randomBytes(16).toString('hex');
  }
}

/**
 * Environment file manager
 */
class EnvironmentManager {
  constructor() {
    this.rootDir = process.cwd();
  }

  async createEnvironmentFile(environment = 'development', options = {}) {
    const envFileName = environment === 'development' ? '.env' : `.env.${environment}`;
    const envFilePath = path.join(this.rootDir, envFileName);

    console.log(colorize(`\n🔧 Creating ${environment} environment file...`, 'blue'));

    // Check if file exists
    try {
      await fs.access(envFilePath);
      if (!options.overwrite) {
        console.log(colorize(`⚠️  File ${envFileName} already exists. Use --overwrite to replace it.`, 'yellow'));
        return;
      }
    } catch {
      // File doesn't exist, continue
    }

    const envContent = await this.generateEnvironmentContent(environment, options);
    
    await fs.writeFile(envFilePath, envContent, 'utf8');
    console.log(colorize(`✅ Environment file created: ${envFileName}`, 'green'));

    // Set appropriate file permissions (readable only by owner)
    if (process.platform !== 'win32') {
      execSync(`chmod 600 ${envFilePath}`);
      console.log(colorize(`🔒 File permissions set to 600 (owner read/write only)`, 'green'));
    }
  }

  async generateEnvironmentContent(environment, options = {}) {
    const lines = [];
    
    // Header
    lines.push('# =====================================');
    lines.push(`# NEON MURER CMS - ${environment.toUpperCase()} ENVIRONMENT`);
    lines.push('# =====================================');
    lines.push(`# Generated on: ${new Date().toISOString()}`);
    lines.push(`# Environment: ${environment}`);
    lines.push('# =====================================\n');

    // Core settings
    lines.push('# Core Application Settings');
    lines.push(`NODE_ENV=${environment}`);
    lines.push('PORT=3001');
    if (environment !== 'development') {
      lines.push(`DEPLOYMENT_ENV=${environment}`);
    }
    lines.push('');

    // Database
    lines.push('# Database Configuration');
    if (environment === 'development') {
      lines.push('DATABASE_URL="postgresql://neon_user:neon_password@localhost:5433/neon_murer_cms"');
    } else {
      lines.push('# TODO: Configure production database URL');
      lines.push('DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL_HERE"');
    }
    lines.push('');

    // JWT & Authentication
    lines.push('# JWT & Authentication');
    if (options.generateSecrets) {
      lines.push(`JWT_SECRET="${SecretGenerator.generateJWTSecret()}"`);
    } else {
      lines.push('JWT_SECRET="YOUR_JWT_SECRET_HERE"');
    }
    lines.push('JWT_EXPIRES_IN="7d"');
    lines.push('JWT_REFRESH_EXPIRES_IN="30d"');
    lines.push('');

    // Admin Configuration
    lines.push('# Administrator Configuration');
    lines.push('ADMIN_EMAIL="admin@neonmurer.ch"');
    if (options.generateSecrets) {
      lines.push(`ADMIN_PASSWORD="${SecretGenerator.generateAdminPassword()}"`);
    } else {
      lines.push('ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD_HERE"');
    }
    lines.push('ADMIN_NAME="Administrator"');
    lines.push('');

    // Frontend
    lines.push('# Frontend Configuration');
    if (environment === 'production') {
      lines.push('FRONTEND_URL="https://www.neonmurer.ch"');
    } else if (environment === 'staging') {
      lines.push('FRONTEND_URL="https://staging.neonmurer.ch"');
    } else {
      lines.push('FRONTEND_URL="http://localhost:3000"');
    }
    lines.push('');

    // Security
    lines.push('# Security Configuration');
    lines.push('BCRYPT_ROUNDS=12');
    lines.push('RATE_LIMIT_WINDOW_MS=900000');
    lines.push('RATE_LIMIT_MAX_REQUESTS=1000');
    lines.push('AUTH_RATE_LIMIT_MAX=5');
    lines.push('');

    // HTTPS (production/staging only)
    if (environment !== 'development') {
      lines.push('# HTTPS Configuration');
      lines.push('HTTPS_ENABLED="true"');
      lines.push('SSL_KEY_PATH="/path/to/private-key.pem"');
      lines.push('SSL_CERT_PATH="/path/to/certificate.pem"');
      lines.push('');
    }

    // Monitoring
    lines.push('# Monitoring & Error Tracking');
    if (environment === 'production') {
      lines.push('SENTRY_DSN="YOUR_SENTRY_DSN_HERE"');
      lines.push('LOG_LEVEL="warn"');
      lines.push('LOG_TO_FILE="true"');
    } else {
      lines.push('SENTRY_DSN=""');
      lines.push('LOG_LEVEL="debug"');
      lines.push('LOG_TO_FILE="false"');
    }
    lines.push('LOG_DIR="./logs"');
    lines.push('');

    // Health Checks
    lines.push('# Health Checks');
    lines.push('HEALTH_CHECK_ENABLED="true"');
    lines.push('METRICS_ENABLED="true"');
    if (options.generateSecrets) {
      lines.push(`HEALTH_CHECK_SECRET="${SecretGenerator.generateHealthCheckSecret()}"`);
    }
    lines.push('');

    // File Upload
    lines.push('# File Upload Configuration');
    lines.push('MAX_FILE_SIZE="10mb"');
    lines.push('UPLOAD_DIR="./uploads"');
    lines.push('');

    // External Services (placeholders)
    lines.push('# External Services (Configure as needed)');
    lines.push('SMTP_HOST=""');
    lines.push('SMTP_PORT="587"');
    lines.push('SMTP_USER=""');
    lines.push('SMTP_PASS=""');
    lines.push('');
    lines.push('GOOGLE_ANALYTICS_ID=""');
    lines.push('GOOGLE_TAG_MANAGER_ID=""');
    lines.push('');

    // Footer
    lines.push('# =====================================');
    lines.push('# IMPORTANT SECURITY NOTES:');
    lines.push('# - Change all default passwords and secrets');
    lines.push('# - Never commit secrets to version control');
    lines.push('# - Use strong, unique passwords');
    if (environment === 'production') {
      lines.push('# - Enable HTTPS in production');
      lines.push('# - Configure proper database security');
      lines.push('# - Set up monitoring and backups');
    }
    lines.push('# =====================================');

    return lines.join('\n');
  }

  async validateCurrentEnvironment() {
    console.log(colorize('\n🔍 Validating current environment configuration...', 'blue'));
    
    try {
      const { errors, warnings } = validateEnvironment();
      
      if (warnings.length > 0) {
        console.log(colorize('\n⚠️  Configuration Warnings:', 'yellow'));
        warnings.forEach(warning => {
          console.log(colorize(`  - ${warning}`, 'yellow'));
        });
      }

      if (errors.length > 0) {
        console.log(colorize('\n❌ Configuration Errors:', 'red'));
        errors.forEach(error => {
          console.log(colorize(`  - ${error}`, 'red'));
        });
        console.log(colorize('\n💡 Fix these errors before running the application.', 'yellow'));
        return false;
      } else {
        console.log(colorize('\n✅ Environment configuration is valid!', 'green'));
        return true;
      }
    } catch (error) {
      console.log(colorize(`\n❌ Validation error: ${error.message}`, 'red'));
      return false;
    }
  }

  async generateSecrets() {
    console.log(colorize('\n🔐 Generating secure secrets...', 'blue'));
    console.log(colorize('Use these in your .env file:\n', 'cyan'));

    const secrets = {
      'JWT_SECRET': SecretGenerator.generateJWTSecret(),
      'ADMIN_PASSWORD': SecretGenerator.generateAdminPassword(),
      'DATABASE_PASSWORD': SecretGenerator.generateDatabasePassword(),
      'API_KEY': SecretGenerator.generateAPIKey(),
      'HEALTH_CHECK_SECRET': SecretGenerator.generateHealthCheckSecret()
    };

    for (const [key, value] of Object.entries(secrets)) {
      console.log(colorize(`${key}=`, 'white') + colorize(`"${value}"`, 'green'));
    }

    console.log(colorize('\n🔒 Security Notes:', 'yellow'));
    console.log(colorize('- Store these secrets securely', 'yellow'));
    console.log(colorize('- Never commit secrets to version control', 'yellow'));
    console.log(colorize('- Use different secrets for each environment', 'yellow'));
  }

  async generateDocumentation() {
    console.log(colorize('\n📚 Generating environment documentation...', 'blue'));
    
    const docs = generateEnvDocs();
    const docsPath = path.join(this.rootDir, 'docs', 'ENVIRONMENT_VARIABLES.md');
    
    // Create docs directory if it doesn't exist
    await fs.mkdir(path.dirname(docsPath), { recursive: true });
    
    await fs.writeFile(docsPath, docs, 'utf8');
    console.log(colorize(`✅ Documentation generated: ${docsPath}`, 'green'));
  }

  async checkEnvironmentFiles() {
    console.log(colorize('\n📁 Checking environment files...', 'blue'));
    
    const files = ['.env', '.env.production', '.env.staging', '.env.test'];
    
    for (const file of files) {
      const filePath = path.join(this.rootDir, file);
      try {
        await fs.access(filePath);
        console.log(colorize(`✅ ${file} exists`, 'green'));
      } catch {
        console.log(colorize(`❌ ${file} missing`, 'red'));
      }
    }
  }

  async backupEnvironment() {
    console.log(colorize('\n💾 Creating environment backup...', 'blue'));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.rootDir, 'backups', 'env');
    await fs.mkdir(backupDir, { recursive: true });

    const files = ['.env', '.env.production', '.env.staging'];
    let backedUp = 0;

    for (const file of files) {
      const sourcePath = path.join(this.rootDir, file);
      try {
        await fs.access(sourcePath);
        const backupPath = path.join(backupDir, `${file}.${timestamp}.backup`);
        await fs.copyFile(sourcePath, backupPath);
        console.log(colorize(`✅ Backed up ${file}`, 'green'));
        backedUp++;
      } catch {
        // File doesn't exist, skip
      }
    }

    if (backedUp > 0) {
      console.log(colorize(`\n💾 ${backedUp} files backed up to: ${backupDir}`, 'green'));
    } else {
      console.log(colorize('\n⚠️  No environment files found to backup', 'yellow'));
    }
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const envManager = new EnvironmentManager();

  console.log(colorize('🚀 Neon Murer CMS - Environment Manager\n', 'bright'));

  try {
    switch (command) {
      case 'create':
        const environment = args[1] || 'development';
        const overwrite = args.includes('--overwrite');
        const generateSecrets = args.includes('--generate-secrets');
        await envManager.createEnvironmentFile(environment, { overwrite, generateSecrets });
        break;

      case 'validate':
        await envManager.validateCurrentEnvironment();
        break;

      case 'secrets':
        await envManager.generateSecrets();
        break;

      case 'docs':
        await envManager.generateDocumentation();
        break;

      case 'check':
        await envManager.checkEnvironmentFiles();
        break;

      case 'backup':
        await envManager.backupEnvironment();
        break;

      case 'setup':
        console.log(colorize('🛠️  Setting up complete environment...', 'blue'));
        await envManager.createEnvironmentFile('development', { generateSecrets: true, overwrite: true });
        await envManager.createEnvironmentFile('production', { generateSecrets: false });
        await envManager.createEnvironmentFile('staging', { generateSecrets: false });
        await envManager.generateDocumentation();
        console.log(colorize('\n✅ Environment setup complete!', 'green'));
        break;

      default:
        console.log(colorize('Usage: node scripts/env-manager.js <command>', 'white'));
        console.log('\nCommands:');
        console.log(colorize('  create <env>     ', 'cyan') + 'Create environment file (development|staging|production)');
        console.log(colorize('  validate         ', 'cyan') + 'Validate current environment configuration');
        console.log(colorize('  secrets          ', 'cyan') + 'Generate secure secrets');
        console.log(colorize('  docs             ', 'cyan') + 'Generate environment documentation');
        console.log(colorize('  check            ', 'cyan') + 'Check which environment files exist');
        console.log(colorize('  backup           ', 'cyan') + 'Backup current environment files');
        console.log(colorize('  setup            ', 'cyan') + 'Complete environment setup');
        console.log('\nOptions:');
        console.log(colorize('  --overwrite      ', 'yellow') + 'Overwrite existing files');
        console.log(colorize('  --generate-secrets', 'yellow') + 'Generate secure secrets automatically');
        console.log('\nExamples:');
        console.log(colorize('  node scripts/env-manager.js create development --generate-secrets', 'green'));
        console.log(colorize('  node scripts/env-manager.js create production --overwrite', 'green'));
        console.log(colorize('  node scripts/env-manager.js validate', 'green'));
        console.log(colorize('  node scripts/env-manager.js setup', 'green'));
        break;
    }
  } catch (error) {
    console.error(colorize(`\n❌ Error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  SecretGenerator,
  EnvironmentManager
}; 