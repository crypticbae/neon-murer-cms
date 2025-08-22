const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// ========== COMPANY HISTORY API ==========

// GET /api/company-history - Get company history with all chapters
router.get('/', async (req, res) => {
  try {
    const companyHistory = await prisma.companyHistory.findFirst({
      include: {
        chapters: {
          where: { isVisible: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!companyHistory) {
      // Create default company history if none exists
      const defaultHistory = await prisma.companyHistory.create({
        data: {
          title: "Unsere Geschichte",
          subtitle: "75 Jahre Leidenschaft für Lichtwerbung",
          finaleTitle: "Heute und in die Zukunft",
          finaleText: "Die langjährige Erfahrung und eine gut ausgebaute Infrastruktur ermöglichen es uns, Ihre Ideen effizient und qualitativ hochstehend zu realisieren. Das möchten wir Ihnen gerne beweisen."
        },
        include: {
          chapters: {
            orderBy: { order: 'asc' }
          }
        }
      });
      return res.json(defaultHistory);
    }

    res.json(companyHistory);
  } catch (error) {
    console.error('Error fetching company history:', error);
    res.status(500).json({ error: 'Failed to fetch company history' });
  }
});

// PUT /api/company-history - Update company history hero and finale
router.put('/', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('subtitle').notEmpty().withMessage('Subtitle is required'),
  body('finaleTitle').notEmpty().withMessage('Finale title is required'),
  body('finaleText').notEmpty().withMessage('Finale text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, subtitle, heroBackgroundImage, finaleTitle, finaleText } = req.body;

    // Get or create company history
    let companyHistory = await prisma.companyHistory.findFirst();
    
    if (!companyHistory) {
      companyHistory = await prisma.companyHistory.create({
        data: {
          title,
          subtitle,
          heroBackgroundImage,
          finaleTitle,
          finaleText
        }
      });
    } else {
      companyHistory = await prisma.companyHistory.update({
        where: { id: companyHistory.id },
        data: {
          title,
          subtitle,
          heroBackgroundImage,
          finaleTitle,
          finaleText,
          updatedAt: new Date()
        }
      });
    }

            // Generate updated HTML file
        await generateCompanyHistoryHTML();
        
        res.json(companyHistory);
    } catch (error) {
        console.error('Error updating company history:', error);
        res.status(500).json({ error: 'Failed to update company history' });
    }
});

// GET /api/company-history/chapters - Get all chapters
router.get('/chapters', async (req, res) => {
  try {
    const companyHistory = await prisma.companyHistory.findFirst();
    
    if (!companyHistory) {
      return res.json({ chapters: [] });
    }

    const chapters = await prisma.companyHistoryChapter.findMany({
      where: { companyHistoryId: companyHistory.id },
      orderBy: { order: 'asc' }
    });

    res.json({ chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// POST /api/company-history/chapters - Create new chapter
router.post('/chapters', authenticateToken, [
  body('year').notEmpty().withMessage('Year is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('text').notEmpty().withMessage('Text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { year, title, text, backgroundImage, foregroundImage, imageAlt, layoutDirection } = req.body;

    // Get or create company history
    let companyHistory = await prisma.companyHistory.findFirst();
    if (!companyHistory) {
      companyHistory = await prisma.companyHistory.create({
        data: {
          title: "Unsere Geschichte",
          subtitle: "75 Jahre Leidenschaft für Lichtwerbung"
        }
      });
    }

    // Get next order number
    const lastChapter = await prisma.companyHistoryChapter.findFirst({
      where: { companyHistoryId: companyHistory.id },
      orderBy: { order: 'desc' }
    });
    
    const nextOrder = lastChapter ? lastChapter.order + 1 : 0;

    const chapter = await prisma.companyHistoryChapter.create({
      data: {
        year,
        title,
        text,
        backgroundImage,
        foregroundImage,
        imageAlt,
        order: nextOrder,
        layoutDirection: layoutDirection || (nextOrder % 2 === 0 ? 'LEFT' : 'RIGHT'),
        companyHistoryId: companyHistory.id
      }
    });

    res.json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// PUT /api/company-history/chapters/:id - Update chapter
router.put('/chapters/:id', authenticateToken, [
  body('year').notEmpty().withMessage('Year is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('text').notEmpty().withMessage('Text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { year, title, text, backgroundImage, foregroundImage, imageAlt, layoutDirection } = req.body;

    const chapter = await prisma.companyHistoryChapter.update({
      where: { id },
      data: {
        year,
        title,
        text,
        backgroundImage,
        foregroundImage,
        imageAlt,
        layoutDirection,
        updatedAt: new Date()
      }
    });

    res.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// DELETE /api/company-history/chapters/:id - Delete chapter
router.delete('/chapters/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.companyHistoryChapter.delete({
      where: { id }
    });

            // Generate updated HTML
        await generateCompanyHistoryHTML();
        
        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error('Error deleting chapter:', error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
});

// PUT /api/company-history/chapters/reorder - Reorder chapters
router.put('/chapters/reorder', authenticateToken, [
  body('chapters').isArray().withMessage('Chapters must be an array'),
  body('chapters.*.id').notEmpty().withMessage('Chapter ID is required'),
  body('chapters.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { chapters } = req.body;

    // Update order for each chapter
    const updatePromises = chapters.map((chapter, index) => {
      return prisma.companyHistoryChapter.update({
        where: { id: chapter.id },
        data: { 
          order: index,
          layoutDirection: index % 2 === 0 ? 'LEFT' : 'RIGHT' // Auto-alternate layout
        }
      });
    });

            await Promise.all(updatePromises);

        // Generate updated HTML
        await generateCompanyHistoryHTML();

        res.json({ message: 'Chapters reordered successfully' });
  } catch (error) {
    console.error('Error reordering chapters:', error);
    res.status(500).json({ error: 'Failed to reorder chapters' });
  }
});

// ========== HTML GENERATION ==========

async function generateCompanyHistoryHTML() {
  try {
    console.log('🏗️ Generating company history HTML...');
    
    // Get current data from database
    const companyHistory = await prisma.companyHistory.findFirst({
      include: {
        chapters: {
          where: { isVisible: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!companyHistory) {
      console.log('⚠️ No company history data found');
      return;
    }

    // Read the existing HTML file
    const htmlPath = path.join(__dirname, '../neon-murer/firmengeschichte.html');
    let html = await fs.readFile(htmlPath, 'utf8');

    // Update Hero Section
    html = html.replace(
      /<h1 class="story-title">([^<]*)<\/h1>/,
      `<h1 class="story-title">${companyHistory.title}</h1>`
    );
    
    html = html.replace(
      /<p class="story-subtitle">([^<]*)<\/p>/,
      `<p class="story-subtitle">${companyHistory.subtitle}</p>`
    );

    // Update Hero Background if provided
    if (companyHistory.heroBackgroundImage) {
      html = html.replace(
        /<section class="story-hero"[^>]*>/,
        `<section class="story-hero" style="background-image: url('${companyHistory.heroBackgroundImage}');">`
      );
    }

    // Ensure hero-overlay exists (add if missing)
    if (!html.includes('<div class="hero-overlay"></div>')) {
      html = html.replace(
        /(<section class="story-hero"[^>]*>\s*)/,
        '$1\n    <div class="hero-overlay"></div>'
      );
    }

    // Generate chapters HTML
    let chaptersHtml = '';
    companyHistory.chapters.forEach((chapter, index) => {
      const isRightLayout = chapter.layoutDirection === 'RIGHT';
      const orderClass = isRightLayout ? 'order-lg-2' : '';
      const orderClassImage = isRightLayout ? 'order-lg-1' : '';

      chaptersHtml += `
  <!-- Chapter ${index + 1}: ${chapter.title} -->
  <section class="story-section story-chapter">
    <div class="chapter-background" style="background-image: url('${chapter.backgroundImage || ''}');"></div>
    <div class="chapter-overlay"></div>
    <div class="container-fluid maxwidth">
      <div class="row align-items-center">
        <div class="col-12 col-lg-6 ${orderClass}">
          <div class="chapter-content">
            <div class="chapter-year">${chapter.year}</div>
            <h2 class="chapter-title">${chapter.title}</h2>
            <p class="chapter-text">
              ${chapter.text}
            </p>
          </div>
        </div>
        <div class="col-12 col-lg-6 ${orderClassImage}">
          <div class="chapter-image">
            <picture>
  <source data-srcset="${chapter.foregroundImage?.replace('../content/images/', '../content/images-optimized/').replace(/\.(jpg|jpeg|png)$/, '.webp') || ''}" type="image/webp">
  <source data-srcset="${chapter.foregroundImage?.replace('../content/images/', '../content/images-optimized/').replace(/\.(jpg|jpeg|png)$/, '-optimized.$1') || ''}" type="image/jpeg">
  <img src="${chapter.foregroundImage || ''}" alt="${chapter.imageAlt || chapter.title}" class="project-image" loading="lazy">
</picture>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
    });

    // Replace the chapters section in HTML
    const chapterStartPattern = /<!-- Chapter 1: .*? -->/;
    const chapterEndPattern = /<!-- Final Section -->/;
    
    const startMatch = html.search(chapterStartPattern);
    const endMatch = html.search(chapterEndPattern);
    
    if (startMatch !== -1 && endMatch !== -1) {
      html = html.substring(0, startMatch) + chaptersHtml + '\n  ' + html.substring(endMatch);
    }

    // Update Finale Section
    html = html.replace(
      /<h2 class="finale-title">([^<]*)<\/h2>/,
      `<h2 class="finale-title">${companyHistory.finaleTitle}</h2>`
    );
    
    html = html.replace(
      /<p class="finale-text">\s*([^<]*)\s*<\/p>/,
      `<p class="finale-text">
        ${companyHistory.finaleText}
      </p>`
    );

    // Write the updated HTML back to file
    await fs.writeFile(htmlPath, html, 'utf8');
    
    console.log('✅ Company history HTML generated successfully');
    
  } catch (error) {
    console.error('❌ Error generating company history HTML:', error);
    throw error;
  }
}

module.exports = router;