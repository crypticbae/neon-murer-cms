const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Serve API specification YAML
router.get('/api-spec.yaml', (req, res) => {
    try {
        const yamlPath = path.join(__dirname, '..', 'docs', 'api-spec.yaml');
        
        if (!fs.existsSync(yamlPath)) {
            return res.status(404).json({
                success: false,
                error: 'API specification not found'
            });
        }
        
        res.setHeader('Content-Type', 'application/x-yaml');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.sendFile(yamlPath);
        
    } catch (error) {
        console.error('Error serving API spec:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to serve API specification'
        });
    }
});

// Serve API documentation HTML
router.get('/api-documentation.html', (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '..', 'docs', 'api-documentation.html');
        
        if (!fs.existsSync(htmlPath)) {
            return res.status(404).json({
                success: false,
                error: 'Documentation not found'
            });
        }
        
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(htmlPath);
        
    } catch (error) {
        console.error('Error serving documentation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to serve documentation'
        });
    }
});

// Generate OpenAPI spec dynamically (alternative endpoint)
router.get('/openapi.json', (req, res) => {
    try {
        const yaml = require('js-yaml');
        const yamlPath = path.join(__dirname, '..', 'docs', 'api-spec.yaml');
        
        if (!fs.existsSync(yamlPath)) {
            return res.status(404).json({
                success: false,
                error: 'API specification not found'
            });
        }
        
        const yamlContent = fs.readFileSync(yamlPath, 'utf8');
        const jsonSpec = yaml.load(yamlContent);
        
        // Update servers based on current request
        jsonSpec.servers = [
            {
                url: `${req.protocol}://${req.get('host')}/api`,
                description: 'Current Server'
            },
            {
                url: 'http://localhost:3001/api',
                description: 'Development Server'
            }
        ];
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(jsonSpec);
        
    } catch (error) {
        console.error('Error generating OpenAPI JSON:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate OpenAPI specification'
        });
    }
});

// Documentation index/overview
router.get('/index', (req, res) => {
    try {
        const docsInfo = {
            title: 'Neon Murer CMS - Documentation',
            version: '1.0.0',
            description: 'Comprehensive documentation for the Neon Murer Content Management System',
            sections: [
                {
                    name: 'API Reference',
                    description: 'Complete OpenAPI/Swagger documentation of all REST endpoints',
                    url: '/docs/api-documentation.html',
                    endpoints: [
                        'Authentication & Authorization',
                        'Customer Management',
                        'Media Management', 
                        'Analytics & Reporting',
                        'Settings & Configuration',
                        'Health & Monitoring'
                    ]
                },
                {
                    name: 'Deployment Guide',
                    description: 'Step-by-step production deployment instructions',
                    url: '/docs/api-documentation.html#deployment',
                    topics: [
                        'Server Requirements',
                        'Environment Configuration',
                        'Database Setup',
                        'SSL/HTTPS Configuration',
                        'PM2 Process Management',
                        'Nginx Reverse Proxy',
                        'Security Checklist',
                        'Backup Strategy'
                    ]
                },
                {
                    name: 'Admin Manual',
                    description: 'User guide for content managers and administrators',
                    url: '/docs/api-documentation.html#admin',
                    features: [
                        'Dashboard & Analytics',
                        'Customer Management',
                        'Media Library',
                        'System Settings',
                        'Backup Management',
                        'User Management'
                    ]
                },
                {
                    name: 'Troubleshooting',
                    description: 'Common problems and solutions',
                    url: '/docs/api-documentation.html#troubleshooting',
                    issues: [
                        'Login Problems',
                        'Upload Issues',
                        'Performance Problems',
                        'Database Connectivity',
                        'SSL Certificate Issues'
                    ]
                }
            ],
            downloads: [
                {
                    name: 'OpenAPI Specification (YAML)',
                    url: '/docs/api-spec.yaml',
                    description: 'Raw OpenAPI 3.0 specification file'
                },
                {
                    name: 'OpenAPI Specification (JSON)',
                    url: '/docs/openapi.json',
                    description: 'OpenAPI specification in JSON format'
                }
            ],
            healthChecks: [
                {
                    name: 'System Health',
                    url: '/api/health',
                    description: 'Overall system status and basic metrics'
                },
                {
                    name: 'Database Health',
                    url: '/api/health/database',
                    description: 'Database connectivity and performance'
                },
                {
                    name: 'API Health',
                    url: '/api/health/api',
                    description: 'API endpoint availability'
                }
            ],
            lastUpdated: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        };
        
        res.json({
            success: true,
            documentation: docsInfo
        });
        
    } catch (error) {
        console.error('Error generating docs index:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate documentation index'
        });
    }
});

module.exports = router;