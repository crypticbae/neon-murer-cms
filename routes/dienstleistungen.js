const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// ========== DIENSTLEISTUNGEN PAGE MANAGEMENT ==========

// GET /api/dienstleistungen - Get page data with services
router.get('/', async (req, res) => {
  try {
    const page = await prisma.dienstleistungPage.findFirst({
      where: { isActive: true },
      include: {
        services: {
          where: { isVisible: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Dienstleistungen page not found' });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching dienstleistungen:', error);
    res.status(500).json({ error: 'Failed to fetch dienstleistungen' });
  }
});

// PUT /api/dienstleistungen - Update page data
router.put('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('subtitle').trim().isLength({ min: 1 }).withMessage('Subtitle is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subtitle, description } = req.body;

    let page = await prisma.dienstleistungPage.findFirst({
      where: { isActive: true }
    });

    if (!page) {
      // Create new page if none exists
      page = await prisma.dienstleistungPage.create({
        data: {
          title,
          subtitle,
          description,
          isActive: true
        }
      });
    } else {
      // Update existing page
      page = await prisma.dienstleistungPage.update({
        where: { id: page.id },
        data: {
          title,
          subtitle,
          description,
          updatedAt: new Date()
        }
      });
    }

    // Regenerate HTML
    try {
      await generateDienstleistungenHTML();
      console.log('✅ HTML generation successful (page update)');
    } catch (htmlError) {
      console.error('❌ HTML generation failed (page update):', htmlError);
      // Don't fail the entire request if HTML generation fails
    }

    res.json({
      success: true,
      message: 'Dienstleistungen page updated successfully',
      data: page
    });
  } catch (error) {
    console.error('Error updating dienstleistungen page:', error);
    res.status(500).json({ error: 'Failed to update dienstleistungen page' });
  }
});

// ========== SERVICES MANAGEMENT ==========

// GET /api/dienstleistungen/services - Get all services
router.get('/services', async (req, res) => {
  try {
    const page = await prisma.dienstleistungPage.findFirst({
      where: { isActive: true }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const services = await prisma.dienstleistungService.findMany({
      where: { pageId: page.id },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST /api/dienstleistungen/services - Create new service
router.post('/services', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('iconClass').trim().isLength({ min: 1 }).withMessage('Icon class is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a positive integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = await prisma.dienstleistungPage.findFirst({
      where: { isActive: true }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const {
      title,
      subtitle,
      description,
      iconClass,
      iconColor,
      backgroundImage,
      features,
      ctaText,
      order,
      isVisible
    } = req.body;

    const service = await prisma.dienstleistungService.create({
      data: {
        title,
        subtitle: subtitle || null,
        description,
        iconClass,
        iconColor: iconColor || '#ffd401',
        backgroundImage: backgroundImage || null,
        features: Array.isArray(features) ? features : [],
        ctaText: ctaText || 'Service anfragen',
        order: parseInt(order),
        isVisible: isVisible !== undefined ? isVisible : true,
        pageId: page.id
      }
    });

    // Regenerate HTML
    try {
      await generateDienstleistungenHTML();
      console.log('✅ HTML generation successful (service create)');
    } catch (htmlError) {
      console.error('❌ HTML generation failed (service create):', htmlError);
      // Don't fail the entire request if HTML generation fails
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /api/dienstleistungen/services/reorder - Reorder services (MUST BE BEFORE /:id route)
router.put('/services/reorder', [
  body('services').isArray().withMessage('Services must be an array'),
  body('services.*.id').isString().withMessage('Service ID is required'),
  body('services.*.order').isInt({ min: 0 }).withMessage('Order must be a positive integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { services } = req.body;

    console.log('🔄 Reordering services:', services.map(s => `${s.id.slice(-8)}: ${s.order}`).join(', '));

    // Use transaction to avoid order conflicts
    await prisma.$transaction(async (tx) => {
      // First, set all orders to negative values to avoid conflicts
      const tempUpdatePromises = services.map((service, index) =>
        tx.dienstleistungService.update({
          where: { id: service.id },
          data: { order: -1000 - index } // Negative temporary values
        })
      );
      await Promise.all(tempUpdatePromises);

      // Then, set the final orders
      const finalUpdatePromises = services.map(service =>
        tx.dienstleistungService.update({
          where: { id: service.id },
          data: { order: service.order }
        })
      );
      await Promise.all(finalUpdatePromises);
    });

    // Regenerate HTML
    try {
      await generateDienstleistungenHTML();
      console.log('✅ HTML generation successful (service reorder)');
    } catch (htmlError) {
      console.error('❌ HTML generation failed (service reorder):', htmlError);
      // Don't fail the entire request if HTML generation fails
    }

    res.json({
      success: true,
      message: 'Services reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering services:', error);
    res.status(500).json({ error: 'Failed to reorder services' });
  }
});

// PUT /api/dienstleistungen/services/:id - Update service
router.put('/services/:id', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('iconClass').trim().isLength({ min: 1 }).withMessage('Icon class is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a positive integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      iconClass,
      iconColor,
      backgroundImage,
      features,
      ctaText,
      order,
      isVisible
    } = req.body;

    const service = await prisma.dienstleistungService.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        description,
        iconClass,
        iconColor: iconColor || '#ffd401',
        backgroundImage: backgroundImage || null,
        features: Array.isArray(features) ? features : [],
        ctaText: ctaText || 'Service anfragen',
        order: parseInt(order),
        isVisible: isVisible !== undefined ? isVisible : true,
        updatedAt: new Date()
      }
    });

    // Regenerate HTML
    try {
      await generateDienstleistungenHTML();
      console.log('✅ HTML generation successful (service update)');
    } catch (htmlError) {
      console.error('❌ HTML generation failed (service update):', htmlError);
      // Don't fail the entire request if HTML generation fails
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE /api/dienstleistungen/services/:id - Delete service
router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.dienstleistungService.delete({
      where: { id }
    });

    // Regenerate HTML
    try {
      await generateDienstleistungenHTML();
      console.log('✅ HTML generation successful (service delete)');
    } catch (htmlError) {
      console.error('❌ HTML generation failed (service delete):', htmlError);
      // Don't fail the entire request if HTML generation fails
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});



// ========== HTML GENERATION ==========

async function generateDienstleistungenHTML() {
  try {
    const page = await prisma.dienstleistungPage.findFirst({
      where: { isActive: true },
      include: {
        services: {
          where: { isVisible: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!page) {
      console.warn('No active dienstleistungen page found');
      return;
    }

    // Read the template file
    const templatePath = path.join(__dirname, '../dienstleistungen.html');
    let htmlContent = await fs.readFile(templatePath, 'utf8');

    // Replace hero section content
    htmlContent = htmlContent.replace(
      /<h1 class="hero-title">.*?<\/h1>/s,
      `<h1 class="hero-title">${escapeHtml(page.title)}</h1>`
    );

    htmlContent = htmlContent.replace(
      /<p class="hero-subtitle">.*?<\/p>/s,
      `<p class="hero-subtitle">${escapeHtml(page.subtitle)}</p>`
    );

    htmlContent = htmlContent.replace(
      /<p class="hero-description">[\s\S]*?<\/p>/s,
      `<p class="hero-description">\n          ${escapeHtml(page.description)}\n        </p>`
    );

    // Generate services carousel
    const servicesHTML = generateServicesCarousel(page.services);
    
    // Replace the entire carousel section
    const carouselStart = '<!-- Service Slide 1:';
    const carouselEnd = '<!-- Carousel Navigation Arrows -->';
    
    const startIndex = htmlContent.indexOf(carouselStart);
    const endIndex = htmlContent.indexOf(carouselEnd);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const beforeCarousel = htmlContent.substring(0, startIndex);
      const afterCarousel = htmlContent.substring(endIndex);
      
      htmlContent = beforeCarousel + servicesHTML + afterCarousel;
    }

    // Update navigation pills
    const navPillsHTML = generateNavPills(page.services);
    htmlContent = htmlContent.replace(
      /<div class="carousel-nav d-flex justify-content-center flex-wrap gap-3">[\s\S]*?<\/div>/,
      `<div class="carousel-nav d-flex justify-content-center flex-wrap gap-3">\n          ${navPillsHTML}\n        </div>`
    );

    // Update total slides in JavaScript
    htmlContent = htmlContent.replace(
      /const totalSlides = \d+;/,
      `const totalSlides = ${page.services.length};`
    );

    // Write the updated HTML
    await fs.writeFile(templatePath, htmlContent, 'utf8');
    console.log('✅ Dienstleistungen HTML successfully generated');

  } catch (error) {
    console.error('❌ Error generating dienstleistungen HTML:', error);
    throw error;
  }
}

function generateServicesCarousel(services) {
  return services.map((service, index) => {
    const isActive = index === 0;
    const features = service.features.map(feature => 
      `<span class="feature-pill" style="
        background: rgba(255, 212, 1, 0.15);
        color: #112357;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        border: 1px solid rgba(255, 212, 1, 0.3);
      ">${escapeHtml(feature)}</span>`
    ).join('\n                    ');

    const orderClass = index % 2 === 0 ? '' : 'order-lg-2';
    const imageOrderClass = index % 2 === 0 ? '' : 'order-lg-1';

    return `<!-- Service Slide ${index + 1}: ${escapeHtml(service.title)} -->
        <div class="service-slide ${isActive ? 'active' : ''}" data-slide="${index}" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: ${isActive ? 1 : 0};
          transform: ${isActive ? 'translateX(0) rotateY(0deg) scale(1)' : 'translateX(100px) rotateY(15deg) scale(0.95)'};
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        ">
          <div class="row align-items-center">
            <div class="col-lg-6 ${orderClass}">
              <div class="service-card-3d" style="
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
                backdrop-filter: blur(20px);
                border-radius: 25px;
                padding: 3rem;
                box-shadow: 
                  0 25px 50px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3);
                border: 1px solid rgba(255, 212, 1, 0.3);
                transform: translateZ(50px);
                transition: all 0.5s ease;
              ">
                <h3 style="
                  color: #112357; 
                  font-weight: 700; 
                  font-size: 2.2rem; 
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                ">
                  <i class="${escapeHtml(service.iconClass)}" style="color: ${escapeHtml(service.iconColor)}; margin-right: 15px; font-size: 2rem;"></i>
                  ${escapeHtml(service.title)}
                </h3>
                
                ${service.subtitle ? `<h4 style="color: #666; font-size: 1.3rem; margin-bottom: 1rem;">${escapeHtml(service.subtitle)}</h4>` : ''}
                
                <p style="
                  color: #666; 
                  line-height: 1.7; 
                  font-size: 1.1rem; 
                  margin-bottom: 2rem;
                ">
                  ${escapeHtml(service.description)}
                </p>

                ${features ? `
                <div class="service-features mb-3">
                  <div class="d-flex flex-wrap gap-2">
                    ${features}
                  </div>
                </div>` : ''}

                <div class="service-action mt-4">
                  <button class="cta-button" href="#" onclick="mailtoLink('neon','neonmurer.ch');return false;" style="
                    background: linear-gradient(45deg, #112357, #1a2f63);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 25px rgba(17, 35, 87, 0.3);
                  ">
                    ${escapeHtml(service.ctaText)}
                    <i class="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="col-lg-6 ${imageOrderClass}">
              <div class="service-visual" style="
                position: relative;
                height: 500px;
                border-radius: 25px;
                overflow: hidden;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
              ">
                ${service.backgroundImage ? `
                <picture>
                  <source data-srcset="${escapeHtml(service.backgroundImage.replace('.jpg', '.webp'))}" type="image/webp">
                  <source data-srcset="${escapeHtml(service.backgroundImage.replace('.jpg', '-optimized.jpg'))}" type="image/jpeg">
                  <img data-src="${escapeHtml(service.backgroundImage)}" loading="lazy" class="lazy-image" alt="${escapeHtml(service.title)}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                  ">
                </picture>` : `
                <div style="
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(135deg, #112357 0%, #1a3066 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <i class="${escapeHtml(service.iconClass)}" style="font-size: 6rem; color: ${escapeHtml(service.iconColor)};"></i>
                </div>`}
                <div class="image-overlay" style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(45deg, rgba(255, 212, 1, 0.2), rgba(17, 35, 87, 0.3));
                  opacity: 0;
                  transition: opacity 0.3s ease;
                "></div>
              </div>
            </div>
          </div>
        </div>`;
  }).join('\n        ');
}

function generateNavPills(services) {
  return services.map((service, index) => 
    `<button class="nav-pill" data-slide="${index}" style="
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.15);
      padding: 14px 28px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      backdrop-filter: blur(15px);
      letter-spacing: 0.3px;
    ">
      <i class="${escapeHtml(service.iconClass)} me-2"></i>${escapeHtml(service.title)}
    </button>`
  ).join('\n          ');
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
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = router;