// ========== FACHKOMPETENZEN API ROUTES ==========

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createContextLogger } = require('../middleware/logger');

const router = express.Router();
const prisma = new PrismaClient();
const logger = createContextLogger('FACHKOMPETENZEN_API');

// ========== HELPER FUNCTIONS ==========

/**
 * Generate static HTML for fachkompetenzen.html page
 */
async function generateFachKompetenzenHTML() {
    try {
        console.log('🚀 Starting complete fachkompetenzen HTML generation...');
        
        const fachKompetenzen = await prisma.fachKompetenzen.findFirst({
            include: {
                cards: {
                    where: { isVisible: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!fachKompetenzen) {
            console.log('⚠️ No fachkompetenzen data found');
            return;
        }

        // Generate cards HTML
        let cardsHtml = '';
        fachKompetenzen.cards.forEach((card, index) => {
            const features = Array.isArray(card.features) ? card.features : [];
            const featuresHtml = features.map(feature => 
                `<span class="focus-card-tag">${feature}</span>`
            ).join('\n                ');

            cardsHtml += `        <!-- ${card.title} -->
        <div class="focus-card" data-title="${card.title}">
          <div class="focus-card-bg" style="background-image: url('${card.backgroundImage || '../content/images/fachkompetenzen-1.webp'}');"></div>
          <div class="focus-card-icon">
            <i class="${card.iconClass}"></i>
          </div>
          <div class="focus-card-overlay">
            <div class="focus-card-content">
              <h3 class="focus-card-title">${card.title}</h3>
              <p class="focus-card-description">
                ${card.description}
              </p>
              <div class="focus-card-features">
                ${featuresHtml}
              </div>
            </div>
          </div>
        </div>

`;
        });

        // Create complete HTML from scratch to avoid corruption
        const htmlContent = `<!DOCTYPE html>
<html lang="de" id="www-neonmurer-ch">
<head>

  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Fachkompetenzen - Neon Murer AG</title>
  <link rel="stylesheet" type="text/css" href="../template/inc_css/include.css">
  
  <!-- Font Awesome CDN für Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
<link rel="icon" type="image/png" href="https://www.neonmurer.ch/favicon/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="https://www.neonmurer.ch/favicon/favicon.svg" />
  <link rel="shortcut icon" href="https://www.neonmurer.ch/favicon/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="https://www.neonmurer.ch/favicon/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="Neon Murer" />
  <link rel="manifest" href="https://www.neonmurer.ch/favicon/site.webmanifest" />
  
  <!--[if lt IE 9]><script src="https://www.neonmurer.ch/template/lib/jquery/jquery-1.12.4.min.js"></script><![endif]-->
  <!--[if gte IE 9]><!--><script src="https://www.neonmurer.ch/template/lib/jquery/jquery-3.7.1.min.js"></script><!--<![endif]-->
  
  <meta name="description" content="Unsere Fachkompetenzen von Metallbau bis Digital-Druck - Neon Murer AG verfügt über 75 Jahre Erfahrung in der professionellen Werbetechnik.">
  <meta name="keywords" content="Fachkompetenzen, Metallbau, Blechbearbeitung, CNC-Frästechnik, Laser-Schneidtechnik, Acrylglas-Atelier, LED-Beleuchtung, Digital-Druck, Neon Murer">
  <link rel="canonical" href="https://www.neonmurer.ch/fachkompetenzen.html">
  <script src="https://www.neonmurer.ch/template/assets/js/jquery.easing.min.js"></script>
  <script src="https://www.neonmurer.ch/template/assets/js/bootstrap.bundle.min.js"></script>
  <script src="https://www.neonmurer.ch/template/assets/js/slick.min.js"></script>
  <script src="../template/assets/js/search.js"></script>
  <script src="https://www.neonmurer.ch/template/assets/js/custom.js"></script>

  <!-- ========== TEMPLATE SYSTEM ========== -->
  <script src="../template/assets/js/templates.js"></script>
  <script src="../template/assets/js/simple-template-loader.js"></script>

  <!-- Page Specific CSS -->
  <link rel="stylesheet" href="../template/assets/css/fachkompetenzen.css">
  
  <!-- Analytics Tracking -->
  <script src="../template/assets/js/analytics-tracker.js"></script>

</head>

<body class="custom">
<!-- ========== HEADER PLACEHOLDER ========== -->
<div id="header-placeholder">
  <!-- Header wird automatisch vom Template Loader geladen -->
  <div class="text-center py-4">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Header wird geladen...</span>
    </div>
  </div>
</div>

<main>
  <!-- Hero Section -->
  <section class="fachkompetenzen-hero">
    <div class="container-fluid maxwidth">
      <div class="hero-content">
        <h1 class="hero-title">${fachKompetenzen.heroTitle}</h1>
        <p class="hero-subtitle">${fachKompetenzen.heroSubtitle}</p>
        <p class="hero-description">
          ${fachKompetenzen.heroDescription}
        </p>
      </div>
    </div>
  </section>

  <!-- Fachkompetenzen Section -->
  <section class="fachkompetenzen-section">
    <div class="container-fluid maxwidth">
      <div class="section-header">
        <h2 class="section-title">${fachKompetenzen.sectionTitle}</h2>
        <p class="section-subtitle">
          ${fachKompetenzen.sectionSubtitle}
        </p>
      </div>

      <!-- Focus Cards Container -->
      <div class="focus-cards-container" id="focusCardsContainer">
${cardsHtml}      </div>
    </div>
  </section>
</main>

<!-- ========== FOOTER PLACEHOLDER ========== -->
<div id="footer-placeholder">
  <!-- Footer wird automatisch vom Template Loader geladen -->
  <div class="text-center py-4">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Footer wird geladen...</span>
    </div>
  </div>
</div>

<script>
  // Focus Cards Functionality
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('focusCardsContainer');
    const cards = container.querySelectorAll('.focus-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        // Add hovered class to current card
        this.classList.add('hovered');
        // Add has-hover class to container to trigger blur effect
        container.classList.add('has-hover');
      });
      
      card.addEventListener('mouseleave', function() {
        // Remove hovered class from current card
        this.classList.remove('hovered');
        
        // Check if any card is still hovered
        const hasHoveredCard = container.querySelector('.focus-card.hovered');
        if (!hasHoveredCard) {
          container.classList.remove('has-hover');
        }
      });
    });
    
    // Additional keyboard navigation support
    cards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  });
</script>

</body>
</html>`;

        const htmlPath = path.join(__dirname, '../neon-murer/fachkompetenzen.html');
        await fs.writeFile(htmlPath, htmlContent, 'utf8');
        console.log('✅ Complete fachkompetenzen HTML generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating fachkompetenzen HTML:', error);
        throw error;
    }
}

// ========== MAIN FACHKOMPETENZEN ROUTES ==========

// GET /api/fachkompetenzen - Get main fachkompetenzen data
router.get('/', async (req, res) => {
    try {
        const fachKompetenzen = await prisma.fachKompetenzen.findFirst();
        
        if (!fachKompetenzen) {
            // Create default fachkompetenzen if none exists
            const defaultFachKompetenzen = await prisma.fachKompetenzen.create({
                data: {}
            });
            return res.json(defaultFachKompetenzen);
        }

        res.json(fachKompetenzen);
    } catch (error) {
        logger.error('Error fetching fachkompetenzen:', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/fachkompetenzen - Update main fachkompetenzen data
router.put('/', async (req, res) => {
    try {
        const { 
            heroTitle, 
            heroSubtitle, 
            heroDescription, 
            heroBackgroundImage,
            sectionTitle, 
            sectionSubtitle 
        } = req.body;

        let fachKompetenzen = await prisma.fachKompetenzen.findFirst();
        
        if (!fachKompetenzen) {
            fachKompetenzen = await prisma.fachKompetenzen.create({
                data: {
                    heroTitle,
                    heroSubtitle,
                    heroDescription,
                    heroBackgroundImage,
                    sectionTitle,
                    sectionSubtitle
                }
            });
        } else {
            fachKompetenzen = await prisma.fachKompetenzen.update({
                where: { id: fachKompetenzen.id },
                data: {
                    heroTitle,
                    heroSubtitle,
                    heroDescription,
                    heroBackgroundImage,
                    sectionTitle,
                    sectionSubtitle
                }
            });
        }

        // Generate updated HTML for live website
        await generateFachKompetenzenHTML();
        
        res.json(fachKompetenzen);
    } catch (error) {
        logger.error('Error updating fachkompetenzen:', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== FACHKOMPETENZ CARDS ROUTES ==========

// GET /api/fachkompetenzen/cards - Get all cards
router.get('/cards', async (req, res) => {
    try {
        const fachKompetenzen = await prisma.fachKompetenzen.findFirst();
        
        if (!fachKompetenzen) {
            return res.json([]);
        }

        const cards = await prisma.fachKompetenzCard.findMany({
            where: { fachKompetenzenId: fachKompetenzen.id },
            orderBy: { order: 'asc' }
        });

        res.json(cards);
    } catch (error) {
        logger.error('Error fetching fachkompetenz cards:', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/fachkompetenzen/cards - Create new card
router.post('/cards', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            backgroundImage, 
            iconClass, 
            features, 
            order 
        } = req.body;

        const fachKompetenzen = await prisma.fachKompetenzen.findFirst();
        if (!fachKompetenzen) {
            return res.status(400).json({ error: 'Fachkompetenzen not found' });
        }

        const card = await prisma.fachKompetenzCard.create({
            data: {
                title,
                description,
                backgroundImage,
                iconClass: iconClass || 'fa-solid fa-cog',
                features: features || [],
                order: order || 0,
                fachKompetenzenId: fachKompetenzen.id
            }
        });

        // Regenerate HTML for live website
        await generateFachKompetenzenHTML();
        
        res.status(201).json(card);
    } catch (error) {
        logger.error('Error creating fachkompetenz card:', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/fachkompetenzen/cards/:id - Update card
router.put('/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            backgroundImage, 
            iconClass, 
            features, 
            order, 
            isVisible 
        } = req.body;

        const card = await prisma.fachKompetenzCard.update({
            where: { id },
            data: {
                title,
                description,
                backgroundImage,
                iconClass,
                features,
                order,
                isVisible
            }
        });

        // Regenerate HTML for live website
        await generateFachKompetenzenHTML();
        
        res.json(card);
    } catch (error) {
        logger.error('Error updating fachkompetenz card:', { error: error.message, cardId: req.params.id });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/fachkompetenzen/cards/:id - Delete card
router.delete('/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.fachKompetenzCard.delete({
            where: { id }
        });

        // Regenerate HTML for live website
        await generateFachKompetenzenHTML();
        
        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        logger.error('Error deleting fachkompetenz card:', { error: error.message, cardId: req.params.id });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/fachkompetenzen/cards/reorder - Reorder cards
router.put('/cards/reorder', async (req, res) => {
    try {
        const { cardIds } = req.body;

        if (!Array.isArray(cardIds)) {
            return res.status(400).json({ error: 'cardIds must be an array' });
        }

        // Update order for each card (use temporary high values to avoid unique constraint conflicts)
        // Step 1: Set all to temporary high order values
        for (let i = 0; i < cardIds.length; i++) {
            await prisma.fachKompetenzCard.update({
                where: { id: cardIds[i] },
                data: { order: 1000 + i }
            });
        }
        
        // Step 2: Set to final order values
        for (let i = 0; i < cardIds.length; i++) {
            await prisma.fachKompetenzCard.update({
                where: { id: cardIds[i] },
                data: { order: i }
            });
        }

        // Regenerate HTML for live website
        await generateFachKompetenzenHTML();
        
        res.json({ message: 'Cards reordered successfully' });
    } catch (error) {
        console.error('❌ Reorder error details:', error);
        logger.error('Error reordering fachkompetenz cards:', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;