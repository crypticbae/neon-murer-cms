// Vercel Serverless Function Handler
require('dotenv').config();

const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS for API requests
const cors = require('cors');
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Initialize database connection
let dbConnected = false;

const initializeDatabase = async () => {
  if (dbConnected) return;
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    dbConnected = true;
  } catch (error) {
    console.warn('⚠️ Database connection failed:', error.message);
  }
};

// Initialize DB on startup
initializeDatabase();

// Static file serving with correct MIME types
app.use('/template', express.static(path.join(__dirname, '../template')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/content', express.static(path.join(__dirname, '../content')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/cms-admin', express.static(path.join(__dirname, '../cms-admin')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

// Basic API Routes (add main routes back)
app.use('/api/auth', require('../routes/auth'));
app.use('/api/analytics', require('../routes/analytics'));

// CMS Data Routes
app.use('/api/customers', require('../routes/customers'));
app.use('/api/team-members', require('../routes/team-members'));
app.use('/api/jobs', require('../routes/jobs'));
app.use('/api/news', require('../routes/news'));
app.use('/api/company-history', require('../routes/company-history'));
app.use('/api/fachkompetenzen', require('../routes/fachkompetenzen'));
app.use('/api/settings', require('../routes/settings'));
app.use('/api/dienstleistungen', require('../routes/dienstleistungen'));
app.use('/api/newsletter', require('../routes/newsletter'));
app.use('/api/agb', require('../routes/agb'));
app.use('/api/datenschutz', require('../routes/datenschutz'));
app.use('/api/media', require('../routes/media'));
app.use('/api/pages', require('../routes/pages'));
app.use('/api/legal', require('../routes/legal'));
app.use('/api/search', require('../routes/search'));
app.use('/api/docs', require('../routes/docs'));
app.use('/api/category-cards', require('../routes/category-cards'));
app.use('/api/analytics-stats', require('../routes/analytics-stats'));

// Test DB route
app.get('/api/test-db', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    res.json({ success: true, dbTest: result, connected: dbConnected });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Debug route to see what files exist
app.get('/debug/files', (req, res) => {
  const fs = require('fs');
  try {
    const files = fs.readdirSync(path.join(__dirname, '..'));
    res.json({ 
      files: files,
      __dirname: __dirname,
      parentDir: path.join(__dirname, '..')
    });
  } catch (error) {
    res.json({ error: error.message });
  }
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

// CMS Admin
app.get('/cms-admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../cms-admin/index.html'));
});

// Catch-all for any missing routes - try to serve as static file
app.get('*', (req, res) => {
  try {
    // Try to serve the file directly
    const filePath = path.join(__dirname, '..', req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send(`Page not found: ${req.path}`);
      }
    });
  } catch (error) {
    res.status(404).send(`Page not found: ${req.path}`);
  }
});

module.exports = app;