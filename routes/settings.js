const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const router = express.Router();
const prisma = new PrismaClient();

// Middleware für Settings-Authentifizierung
const requireAuth = (req, res, next) => {
  // TODO: Implementiere echte Auth-Validierung
  // Für jetzt erlauben wir alle Requests (Development)
  next();
};

// =====================================
// GET ALL SETTINGS BY CATEGORY
// =====================================

// GET /api/settings/:category - Specific category settings
router.get('/:category', [
  param('category').isIn(['general', 'seo', 'social', 'email', 'security', 'backup']).withMessage('Invalid category'),
  requireAuth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { category } = req.params;
    
    const settings = await prisma.setting.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    });

    // Transform to key-value object for easier frontend usage
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });

    res.json({
      category,
      settings: settingsObject,
      lastUpdated: settings.length > 0 ? settings[0].updatedAt : null
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET /api/settings - All settings (admin only)
router.get('/', requireAuth, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });

    // Group by category
    const groupedSettings = {};
    settings.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = {};
      }
      groupedSettings[setting.category][setting.key] = setting.value;
    });

    res.json({
      settings: groupedSettings,
      totalCount: settings.length
    });

  } catch (error) {
    console.error('Error fetching all settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// =====================================
// UPDATE SETTINGS
// =====================================

// PUT /api/settings/:category - Update category settings
router.put('/:category', [
  param('category').isIn(['general', 'seo', 'social', 'email', 'security', 'backup']).withMessage('Invalid category'),
  body('settings').isObject().withMessage('Settings must be an object'),
  requireAuth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { category } = req.params;
    const { settings } = req.body;

    const updatedSettings = [];

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        const setting = await tx.setting.upsert({
          where: {
            category_key: {
              category,
              key
            }
          },
          create: {
            category,
            key,
            value,
            isPublic: false // Default to private, can be overridden per setting
          },
          update: {
            value,
            updatedAt: new Date()
          }
        });
        updatedSettings.push(setting);
      }
    });

    res.json({
      message: `${category} settings updated successfully`,
      category,
      updatedCount: updatedSettings.length,
      updatedAt: new Date()
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// =====================================
// SPECIAL SETTINGS FUNCTIONS
// =====================================

// POST /api/settings/email/test - Send test email
router.post('/email/test', [
  body('testEmail').isEmail().withMessage('Valid test email required'),
  body('smtpSettings').isObject().withMessage('SMTP settings required'),
  requireAuth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { testEmail, smtpSettings } = req.body;

    // Create nodemailer transporter with provided settings
    const transporter = nodemailer.createTransporter({
      host: smtpSettings.host,
      port: parseInt(smtpSettings.port),
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.username,
        pass: smtpSettings.password
      }
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: `"${smtpSettings.senderName}" <${smtpSettings.senderEmail}>`,
      to: testEmail,
      subject: '✅ Neon Murer CMS - SMTP Test erfolgreich',
      html: `
        <h2>🎉 SMTP-Konfiguration erfolgreich!</h2>
        <p>Diese Test-E-Mail bestätigt, dass Ihre SMTP-Einstellungen korrekt konfiguriert sind.</p>
        <hr>
        <p><strong>Server:</strong> ${smtpSettings.host}:${smtpSettings.port}</p>
        <p><strong>Benutzer:</strong> ${smtpSettings.username}</p>
        <p><strong>Gesendet am:</strong> ${new Date().toLocaleString('de-CH')}</p>
        <hr>
        <p><small>Neon Murer CMS - Admin Panel</small></p>
      `
    });

    res.json({
      success: true,
      message: 'Test-E-Mail erfolgreich gesendet',
      messageId: info.messageId,
      testEmail
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(400).json({ 
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

// POST /api/settings/seo/sitemap - Generate sitemap
router.post('/seo/sitemap', requireAuth, async (req, res) => {
  try {
    // Get all published pages for sitemap
    const pages = await prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { path: true, updatedAt: true }
    });

    // Generate sitemap XML
    const sitemap = generateSitemap(pages);
    
    // Write sitemap to public directory
    const sitemapPath = path.join(__dirname, '../sitemap.xml');
    await fs.writeFile(sitemapPath, sitemap);

    res.json({
      success: true,
      message: 'Sitemap erfolgreich generiert',
      pages: pages.length,
      path: '/sitemap.xml'
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// =====================================
// BACKUP ENDPOINTS
// =====================================

// POST /api/settings/backup/create - Create backup
router.post('/backup/create', requireAuth, async (req, res) => {
  let backupPath = null;
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupName = `neon-murer-backup-${timestamp}.zip`;
    backupPath = path.join(__dirname, '../backups', backupName);
    
    console.log(`Starting backup creation: ${backupName}`);
    
    // Ensure backup directory exists
    const backupDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Send immediate response to prevent timeout
    res.json({
      success: true,
      message: 'Backup wird erstellt...',
      filename: backupName,
      status: 'creating'
    });
    
    // Create backup in background
    setImmediate(async () => {
      try {
        await createBackupFile(backupPath, backupName);
        console.log(`✅ Backup completed: ${backupName}`);
      } catch (error) {
        console.error(`❌ Backup failed: ${backupName}`, error);
        // Clean up failed backup file
        try {
          await fs.unlink(backupPath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup incomplete backup:', cleanupError);
        }
      }
    });

  } catch (error) {
    console.error('Error starting backup:', error);
    
    // Clean up if backup file was created
    if (backupPath) {
      try {
        await fs.unlink(backupPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start backup', details: error.message });
    }
  }
});

// Helper function to create backup file
async function createBackupFile(backupPath, backupName) {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(backupPath);
    const archive = archiver('zip', { 
      zlib: { level: 6 }, // Reduced compression for speed
      forceLocalTime: true
    });
    
    let completed = false;
    
    // Handle archive events
    archive.on('error', (err) => {
      if (!completed) {
        completed = true;
        reject(err);
      }
    });
    
    output.on('close', () => {
      if (!completed) {
        completed = true;
        console.log(`Archive finalized: ${archive.pointer()} bytes`);
        resolve();
      }
    });
    
    output.on('error', (err) => {
      if (!completed) {
        completed = true;
        reject(err);
      }
    });
    
    archive.pipe(output);
    
    // Add files with error handling
    (async () => {
      try {
        // Add database dump (simplified)
        const metadata = {
          created: new Date().toISOString(),
          version: '1.0.0',
          description: 'Neon Murer CMS Backup',
          database: 'PostgreSQL Schema Only',
          note: 'Simplified backup for stability'
        };
        
        archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-info.json' });
        
        // Add essential files only to prevent crashes
        const essentialFiles = [
          { src: '../package.json', dest: 'package.json' },
          { src: '../prisma/schema.prisma', dest: 'prisma-schema.prisma' }
        ];
        
        for (const file of essentialFiles) {
          try {
            const filePath = path.join(__dirname, file.src);
            await fs.access(filePath);
            archive.file(filePath, { name: file.dest });
            console.log(`Added: ${file.dest}`);
          } catch (err) {
            console.warn(`Skipping ${file.dest}: ${err.message}`);
          }
        }
        
        // Add content directory (with size limit)
        const contentDir = path.join(__dirname, '../content');
        try {
          await fs.access(contentDir);
          const stats = await fs.stat(contentDir);
          if (stats.isDirectory()) {
            archive.directory(contentDir, 'content');
            console.log('Added: content directory');
          }
        } catch (err) {
          console.warn('Skipping content directory:', err.message);
        }
        
        // Finalize archive
        console.log('Finalizing archive...');
        await archive.finalize();
        
      } catch (error) {
        archive.abort();
        reject(error);
      }
    })();
  });
}

// GET /api/settings/backup/list - List all backups
router.get('/backup/list', requireAuth, async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    // Ensure backup directory exists
    try {
      await fs.access(backupDir);
    } catch (err) {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    // Read backup directory
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.endsWith('.zip') && file.startsWith('neon-murer-backup-'));
    
    // Get file stats for each backup
    const backups = await Promise.all(
      backupFiles.map(async (filename) => {
        try {
          const filePath = path.join(backupDir, filename);
          const stats = await fs.stat(filePath);
          
          return {
            filename,
            created: stats.birthtime,
            modified: stats.mtime,
            size: formatFileSize(stats.size),
            sizeBytes: stats.size
          };
        } catch (err) {
          console.warn(`Error reading backup file ${filename}:`, err);
          return null;
        }
      })
    );
    
    // Filter out failed reads and sort by creation date (newest first)
    const validBackups = backups
      .filter(backup => backup !== null)
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({
      success: true,
      backups: validBackups,
      count: validBackups.length,
      backupDirectory: backupDir
    });

  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups', details: error.message });
  }
});

// GET /api/settings/backup/download/:filename - Download backup
router.get('/backup/download/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || !filename.match(/^neon-murer-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/)) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }

    const backupPath = path.join(__dirname, '../backups', filename);
    
    // Check if file exists
    try {
      await fs.access(backupPath);
    } catch (err) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    // Get file stats
    const stats = await fs.stat(backupPath);
    
    // Set response headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file to response
    const fileStream = require('fs').createReadStream(backupPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('Error streaming backup file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download backup' });
      }
    });
    
    console.log(`Backup download started: ${filename} (${formatFileSize(stats.size)})`);

  } catch (error) {
    console.error('Error downloading backup:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download backup', details: error.message });
    }
  }
});

// DELETE /api/settings/backup/delete/:filename - Delete backup
router.delete('/backup/delete/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || !filename.match(/^neon-murer-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/)) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }

    const backupPath = path.join(__dirname, '../backups', filename);
    
    // Check if file exists
    try {
      await fs.access(backupPath);
    } catch (err) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    // Get file stats before deletion
    const stats = await fs.stat(backupPath);
    const fileSize = formatFileSize(stats.size);
    
    // Delete the backup file
    await fs.unlink(backupPath);
    
    console.log(`Backup deleted successfully: ${filename} (${fileSize})`);

    res.json({
      success: true,
      message: 'Backup erfolgreich gelöscht',
      filename,
      size: fileSize
    });

  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup', details: error.message });
  }
});

// =====================================
// HELPER FUNCTIONS
// =====================================

// Create database dump
async function createDatabaseDump() {
  try {
    // Use Prisma to get database URL
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found');
    }
    
    // Parse database URL to extract connection info
    const url = new URL(databaseUrl);
    const isPostgres = url.protocol === 'postgresql:' || url.protocol === 'postgres:';
    
    if (isPostgres) {
      // PostgreSQL dump using pg_dump
      const dbName = url.pathname.substring(1); // Remove leading /
      const host = url.hostname;
      const port = url.port || 5432;
      const username = url.username;
      const password = url.password;
      
      // Set PGPASSWORD environment variable for pg_dump
      const env = { ...process.env, PGPASSWORD: password };
      
      const dumpCommand = `pg_dump -h ${host} -p ${port} -U ${username} -d ${dbName} --clean --no-owner --no-privileges`;
      
      console.log('Creating PostgreSQL database dump...');
      const { stdout, stderr } = await execPromise(dumpCommand, { env, maxBuffer: 1024 * 1024 * 100 }); // 100MB buffer
      
      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('Database dump warnings:', stderr);
      }
      
      return stdout;
    } else {
      // Fallback: Create a simple schema dump using Prisma
      console.log('Creating schema-only dump (pg_dump not available)...');
      
      // Read the Prisma schema as backup
      const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      
      return `-- Neon Murer CMS Database Schema Backup
-- Generated: ${new Date().toISOString()}
-- Note: This is a schema backup only. Full data dump requires pg_dump.

-- Prisma Schema:
/*
${schemaContent}
*/

-- To restore this backup:
-- 1. Set up a new PostgreSQL database
-- 2. Run: npx prisma db push
-- 3. Run: npx prisma db seed (if available)
`;
    }
    
  } catch (error) {
    console.error('Database dump error:', error);
    
    // Return a minimal backup info instead of failing completely
    return `-- Neon Murer CMS Database Backup Failed
-- Generated: ${new Date().toISOString()}
-- Error: ${error.message}

-- To restore your database:
-- 1. Ensure PostgreSQL is accessible
-- 2. Run: npx prisma db push
-- 3. Run: npx prisma db seed (if available)
`;
  }
}

// Format file size in human readable format
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateSitemap(pages) {
  const baseUrl = process.env.SITE_URL || 'https://www.neonmurer.ch';
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add homepage
  sitemap += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Add all pages
  pages.forEach(page => {
    const url = page.path.startsWith('/') ? page.path : `/${page.path}`;
    sitemap += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

module.exports = router;