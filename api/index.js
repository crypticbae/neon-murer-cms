// Vercel Serverless Function Handler
const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Basic route for testing
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../index.html'));
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all other routes
app.get('*', (req, res) => {
  try {
    // Try to serve the requested file
    const filePath = path.join(__dirname, '..', req.path);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

module.exports = app;