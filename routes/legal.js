const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ============ LEGAL CONTENT ROUTES ============

// GET /api/settings/legal/:type - Get legal content (impressum, agb, datenschutz)
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        // Validate type
        if (!['impressum', 'agb', 'datenschutz'].includes(type)) {
            return res.status(400).json({ error: 'Invalid legal content type' });
        }
        
        const setting = await prisma.setting.findUnique({
            where: { 
                category_key: {
                    category: 'legal',
                    key: type
                }
            }
        });
        
        res.json({
            content: setting?.value || ''
        });
    } catch (error) {
        console.error('Error loading legal content:', error);
        res.status(500).json({ error: 'Failed to load legal content' });
    }
});

// PUT /api/settings/legal/:type - Update legal content
router.put('/:type', [
    body('content').isString().withMessage('Content must be a string'),
    body('generateHtml').optional().isBoolean().withMessage('generateHtml must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { type } = req.params;
        const { content, generateHtml } = req.body;
        
        // Validate type
        if (!['impressum', 'agb', 'datenschutz'].includes(type)) {
            return res.status(400).json({ error: 'Invalid legal content type' });
        }
        
        // Upsert the setting
        await prisma.setting.upsert({
            where: { 
                category_key: {
                    category: 'legal',
                    key: type
                }
            },
            update: { 
                value: content,
                updatedAt: new Date()
            },
            create: { 
                category: 'legal',
                key: type,
                value: content
            }
        });
        
        // Generate HTML file if requested (specifically for impressum)
        if (generateHtml && type === 'impressum') {
            try {
                await generateImpressumHTML(content);
                console.log('✅ Impressum HTML generated successfully');
            } catch (htmlError) {
                console.error('❌ HTML generation failed:', htmlError);
                // Don't fail the entire request if HTML generation fails
            }
        }
        
        res.json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} successfully updated`
        });
    } catch (error) {
        console.error('Error saving legal content:', error);
        res.status(500).json({ error: 'Failed to save legal content' });
    }
});

// HTML Generation for Impressum
const fs = require('fs').promises;
const path = require('path');

async function generateImpressumHTML(contentString) {
    try {
        const content = JSON.parse(contentString);
        
        // Read the current impressum.html file
        const impressumPath = path.join(process.cwd(), 'impressum.html');
        let htmlContent = await fs.readFile(impressumPath, 'utf8');
        
        // Replace Hero Section
        htmlContent = htmlContent.replace(
            /<h1 class="hero-title">.*?<\/h1>/s,
            `<h1 class="hero-title">${escapeHtml(content.heroTitle || 'Impressum')}</h1>`
        );
        
        htmlContent = htmlContent.replace(
            /<p class="hero-subtitle">.*?<\/p>/s,
            `<p class="hero-subtitle">${escapeHtml(content.heroSubtitle || 'Anbieterkennzeichnung und rechtliche Hinweise')}</p>`
        );
        
        htmlContent = htmlContent.replace(
            /<p class="hero-description">\s*.*?\s*<\/p>/s,
            `<p class="hero-description">
          ${escapeHtml(content.heroDescription || 'Kontaktdaten unserer Firma und Richtlinien zur Verwendung dieser Website.')}
        </p>`
        );
        
        // Replace Company Information
        htmlContent = htmlContent.replace(
            /<h3 class="company-name">.*?<\/h3>/s,
            `<h3 class="company-name">${escapeHtml(content.companyName || 'Neon Murer AG')}</h3>`
        );
        
        // Replace Address
        const addressLines = (content.address || 'Tägernaustrasse 21\nCH-8640 Rapperswil-Jona').split('\n');
        const addressHTML = addressLines.map(line => escapeHtml(line)).join('<br>\n                  ');
        htmlContent = htmlContent.replace(
            /<p class="address">\s*<i class="fa-solid fa-map-marker-alt me-2"><\/i>\s*.*?\s*<\/p>/s,
            `<p class="address">
                  <i class="fa-solid fa-map-marker-alt me-2"></i>
                  ${addressHTML}
                </p>`
        );
        
        // Replace Phone
        htmlContent = htmlContent.replace(
            /<p class="contact">\s*<i class="fa-solid fa-phone me-2"><\/i>\s*<a href="tel:.*?">.*?<\/a>\s*<\/p>/s,
            `<p class="contact">
                  <i class="fa-solid fa-phone me-2"></i>
                  <a href="tel:${escapeHtml(content.phone?.replace(/[^+\d]/g, '') || '+41552255025')}">${escapeHtml(content.phone || 'Tel. +41 (0)55 225 50 25')}</a>
                </p>`
        );
        
        // Replace Email
        htmlContent = htmlContent.replace(
            /<p class="contact">\s*<i class="fa-solid fa-envelope me-2"><\/i>\s*<a href="mailto:.*?">.*?<\/a>\s*<\/p>/s,
            `<p class="contact">
                  <i class="fa-solid fa-envelope me-2"></i>
                  <a href="mailto:${escapeHtml(content.email || 'neon@neonmurer.ch')}">${escapeHtml(content.email || 'neon@neonmurer.ch')}</a>
                </p>`
        );
        
        // Replace Owner
        htmlContent = htmlContent.replace(
            /<p class="owner-name">.*?<\/p>/s,
            `<p class="owner-name">${escapeHtml(content.owner || 'Benno Murer')}</p>`
        );
        
        // Replace Business Info
        htmlContent = htmlContent.replace(
            /<p><strong>Firmennummer:<\/strong>.*?<\/p>/s,
            `<p><strong>Firmennummer:</strong> ${escapeHtml(content.firmenNummer || 'CH-320.3.058.479-4')}</p>`
        );
        
        htmlContent = htmlContent.replace(
            /<p><strong>UID\/MWST:<\/strong>.*?<\/p>/s,
            `<p><strong>UID/MWST:</strong> ${escapeHtml(content.mwst || 'CHE-112.688.538')}</p>`
        );
        
        // Replace Opening Hours
        htmlContent = htmlContent.replace(
            /<span class="times">.*?<\/span>/s,
            `<span class="times">${escapeHtml(content.openingWeekdays || '08.00-12.00 / 13.30-17.00 Uhr')}</span>`
        );
        
        htmlContent = htmlContent.replace(
            /<span class="times closed">.*?<\/span>/s,
            `<span class="times closed">${escapeHtml(content.openingWeekend || 'geschlossen')}</span>`
        );
        
        // Replace Realization Info
        const realizationLines = (content.realization || 'Marcel Teixeira\nm.teix@proton.me\n+41 77 222 66 88').split('\n');
        const realizationHTML = realizationLines.map((line, index) => {
            if (line.includes('@')) {
                return `<a href="mailto:${escapeHtml(line)}">${escapeHtml(line)}</a>`;
            } else if (line.match(/^\+?\d+/)) {
                return `<a href="tel:${escapeHtml(line.replace(/[^+\d]/g, ''))}">${escapeHtml(line)}</a>`;
            } else {
                return escapeHtml(line);
            }
        }).join('<br>\n                 ');
        
        htmlContent = htmlContent.replace(
            /<p class="realization-info">\s*.*?\s*<\/p>/s,
            `<p class="realization-info">
                 ${realizationHTML}
               </p>`
        );
        
        // Replace Legal Text (simplified approach - replace the whole legal section)
        const legalParagraphs = (content.legalText || '').split('\n\n').filter(p => p.trim());
        const legalHTML = legalParagraphs.map(p => `              <p>
                ${escapeHtml(p.trim())}
              </p>`).join('\n');
        
        htmlContent = htmlContent.replace(
            /<div class="info-card legal-text">\s*.*?\s*<\/div>/s,
            `<div class="info-card legal-text">
${legalHTML}
            </div>`
        );
        
        // Write the updated HTML back
        await fs.writeFile(impressumPath, htmlContent, 'utf8');
        console.log('✅ Impressum HTML file updated successfully');
        
    } catch (error) {
        console.error('❌ Error generating Impressum HTML:', error);
        throw error;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

module.exports = router;