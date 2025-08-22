const express = require('express');
const { PrismaClient } = require('@prisma/client');
const os = require('os');
const fs = require('fs').promises;
const { promisify } = require('util');
const { exec } = require('child_process');
const { createContextLogger } = require('../middleware/logger');
const { monitorHealthCheck, sendAlert, AlertLevel } = require('../middleware/monitoring');

const router = express.Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);
const healthLogger = createContextLogger('HEALTH');

// Health check cache to avoid expensive operations on every request
const healthCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Basic health endpoint (fast response)
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const basicHealth = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    res.json(basicHealth);
  } catch (error) {
    healthLogger.error('Basic health check failed', { error: error.message });
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Detailed health check endpoint
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  const healthData = {
    timestamp: new Date().toISOString(),
    status: 'OK',
    checks: {},
    performance: {},
    system: {}
  };

  try {
    // Run all health checks in parallel
    const [
      databaseHealth,
      systemHealth,
      performanceHealth,
      securityHealth,
      externalHealth
    ] = await Promise.allSettled([
      checkDatabase(),
      checkSystem(),
      checkPerformance(),
      checkSecurity(),
      checkExternalServices()
    ]);

    // Process results
    healthData.checks.database = processHealthResult(databaseHealth);
    healthData.checks.system = processHealthResult(systemHealth);
    healthData.checks.performance = processHealthResult(performanceHealth);
    healthData.checks.security = processHealthResult(securityHealth);
    healthData.checks.external = processHealthResult(externalHealth);

    // Determine overall status
    const allChecks = Object.values(healthData.checks);
    const hasErrors = allChecks.some(check => check.status === 'ERROR');
    const hasWarnings = allChecks.some(check => check.status === 'WARNING');

    if (hasErrors) {
      healthData.status = 'ERROR';
    } else if (hasWarnings) {
      healthData.status = 'WARNING';
    }

    // Add response time
    healthData.responseTime = Date.now() - startTime;

    // Log health status
    const logLevel = hasErrors ? 'error' : hasWarnings ? 'warn' : 'info';
    healthLogger[logLevel]('Detailed health check completed', {
      status: healthData.status,
      responseTime: healthData.responseTime,
      failedChecks: allChecks.filter(c => c.status === 'ERROR').length
    });

    // Send alerts for critical issues
    if (hasErrors) {
      const failedChecks = allChecks.filter(c => c.status === 'ERROR');
      sendAlert(
        AlertLevel.HIGH,
        'Health Check Failed',
        `${failedChecks.length} health checks failed`,
        { failedChecks: failedChecks.map(c => c.name) }
      );
    }

    res.status(hasErrors ? 503 : 200).json(healthData);

  } catch (error) {
    healthLogger.error('Health check system error', { error: error.message });
    
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check system failure',
      responseTime: Date.now() - startTime
    });
  }
});

/**
 * Readiness probe (for Kubernetes)
 */
router.get('/ready', async (req, res) => {
  try {
    // Check critical components only
    await Promise.all([
      checkDatabaseConnection(),
      checkCriticalServices()
    ]);

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    healthLogger.warn('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Liveness probe (for Kubernetes)
 */
router.get('/live', async (req, res) => {
  // Simple liveness check - if this endpoint responds, the app is alive
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  });
});

/**
 * Metrics endpoint (Prometheus-compatible)
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await generateMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    healthLogger.error('Metrics generation failed', { error: error.message });
    res.status(500).send('# Metrics unavailable\n');
  }
});

/**
 * Database health check
 */
async function checkDatabase() {
  return await monitorHealthCheck('database', async () => {
    const startTime = Date.now();
    
    try {
      // Test basic connection
      await prisma.$connect();
      
      // Test query performance
      const queryStart = Date.now();
      await prisma.user.count();
      const queryTime = Date.now() - queryStart;
      
      // Check connection pool
      const connectionInfo = await prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity WHERE state = 'active'`;
      
      const result = {
        status: 'OK',
        name: 'database',
        responseTime: Date.now() - startTime,
        details: {
          queryTime,
          activeConnections: Number(connectionInfo[0]?.connections || 0),
          connectionStatus: 'connected'
        }
      };

      // Warning thresholds
      if (queryTime > 1000) {
        result.status = 'WARNING';
        result.message = 'Slow database queries detected';
      }

      if (result.details.activeConnections > 50) {
        result.status = 'WARNING';
        result.message = 'High number of active connections';
      }

      return result;
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  });
}

/**
 * System health check
 */
async function checkSystem() {
  return await monitorHealthCheck('system', async () => {
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadavg = os.loadavg();
    
    // Calculate memory usage percentage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    // Calculate heap usage percentage
    const heapUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
    
    const result = {
      status: 'OK',
      name: 'system',
      details: {
        memory: {
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
          heapUsagePercent: Math.round(heapUsagePercent),
          rss: Math.round(memory.rss / 1024 / 1024), // MB
          external: Math.round(memory.external / 1024 / 1024) // MB
        },
        system: {
          totalMemory: Math.round(totalMemory / 1024 / 1024 / 1024), // GB
          freeMemory: Math.round(freeMemory / 1024 / 1024 / 1024), // GB
          memoryUsagePercent: Math.round(memoryUsagePercent),
          cpuCount: os.cpus().length,
          loadAverage: loadavg.map(l => Math.round(l * 100) / 100),
          uptime: Math.round(os.uptime()),
          platform: os.platform()
        }
      }
    };

    // Warning thresholds
    if (heapUsagePercent > 85) {
      result.status = 'WARNING';
      result.message = 'High heap memory usage';
    }

    if (memoryUsagePercent > 90) {
      result.status = 'ERROR';
      result.message = 'Critical system memory usage';
    }

    if (loadavg[0] > os.cpus().length * 2) {
      result.status = 'WARNING';
      result.message = 'High CPU load detected';
    }

    return result;
  });
}

/**
 * Performance health check
 */
async function checkPerformance() {
  return await monitorHealthCheck('performance', async () => {
    const startTime = Date.now();
    
    // Event loop lag check
    const eventLoopStart = Date.now();
    await new Promise(resolve => setImmediate(resolve));
    const eventLoopLag = Date.now() - eventLoopStart;
    
    // File system check
    const fsStart = Date.now();
    try {
      await fs.access('./package.json');
      const fsResponseTime = Date.now() - fsStart;
      
      const result = {
        status: 'OK',
        name: 'performance',
        responseTime: Date.now() - startTime,
        details: {
          eventLoopLag,
          fsResponseTime,
          nodeVersion: process.version,
          processUptime: Math.round(process.uptime())
        }
      };

      // Warning thresholds
      if (eventLoopLag > 100) {
        result.status = 'WARNING';
        result.message = 'High event loop lag detected';
      }

      if (fsResponseTime > 500) {
        result.status = 'WARNING';
        result.message = 'Slow file system response';
      }

      return result;
    } catch (error) {
      throw new Error(`Performance check failed: ${error.message}`);
    }
  });
}

/**
 * Security health check
 */
async function checkSecurity() {
  return await monitorHealthCheck('security', async () => {
    const result = {
      status: 'OK',
      name: 'security',
      details: {
        nodeEnv: process.env.NODE_ENV,
        jwtSecretConfigured: !!process.env.JWT_SECRET,
        httpsEnabled: process.env.HTTPS_ENABLED === 'true',
        sentryConfigured: !!process.env.SENTRY_DSN
      }
    };

    // Security warnings
    const warnings = [];
    
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
      warnings.push('NODE_ENV not properly configured');
    }
    
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET not properly configured');
    }
    
    if (process.env.NODE_ENV === 'production' && !process.env.HTTPS_ENABLED) {
      warnings.push('HTTPS not enabled in production');
    }

    if (warnings.length > 0) {
      result.status = 'WARNING';
      result.message = warnings.join(', ');
      result.details.warnings = warnings;
    }

    return result;
  });
}

/**
 * External services health check
 */
async function checkExternalServices() {
  return await monitorHealthCheck('external', async () => {
    const result = {
      status: 'OK',
      name: 'external',
      details: {
        services: {}
      }
    };

    // Check external services if configured
    const services = [];
    
    // Add checks for external services here
    // Example: Email service, payment gateway, etc.
    
    if (services.length === 0) {
      result.details.message = 'No external services configured';
    }

    return result;
  });
}

/**
 * Check basic database connection
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Check critical services
 */
async function checkCriticalServices() {
  // Add checks for critical services required for the app to function
  // For now, just return true
  return true;
}

/**
 * Process health check results
 */
function processHealthResult(result) {
  if (result.status === 'fulfilled') {
    return result.value;
  } else {
    return {
      status: 'ERROR',
      name: 'unknown',
      error: result.reason?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate Prometheus-compatible metrics
 */
async function generateMetrics() {
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return `
# HELP nodejs_heap_size_used_bytes Process heap space used
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${memory.heapUsed}

# HELP nodejs_heap_size_total_bytes Process heap space total
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${memory.heapTotal}

# HELP nodejs_external_memory_bytes Nodejs external memory size
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes ${memory.external}

# HELP process_cpu_user_seconds_total Total user CPU time spent
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total ${cpuUsage.user / 1000000}

# HELP process_cpu_system_seconds_total Total system CPU time spent  
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total ${cpuUsage.system / 1000000}

# HELP nodejs_uptime_seconds Process uptime
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`.trim();
}

module.exports = router; 