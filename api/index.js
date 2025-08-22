// Vercel Serverless Function Handler
const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving with correct MIME types
app.use('/template', express.static(path.join(__dirname, '../template')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/content', express.static(path.join(__dirname, '../content')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/cms-admin', express.static(path.join(__dirname, '../cms-admin')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Homepage
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

// CMS Admin
app.get('/cms-admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../cms-admin/index.html'));
});

// 404 fallback
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

module.exports = app;