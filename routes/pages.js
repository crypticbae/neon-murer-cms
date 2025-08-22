const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/pages - Get all pages
router.get('/', async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      include: {
        heroSection: true,
        projectsSection: {
          include: {
            projects: {
              orderBy: { order: 'asc' }
            }
          }
        },
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      pages,
      total: pages.length
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// GET /api/pages/:id - Get single page
router.get('/:id', async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.id },
      include: {
        heroSection: true,
        projectsSection: {
          include: {
            projects: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// PUT /api/pages/:id - Update page content
router.put('/:id', [
  body('title').notEmpty().withMessage('Title is required'),
  body('heroSection.title').optional().isString(),
  body('heroSection.subtitle').optional().isString(),
  body('heroSection.description').optional().isString(),
  body('heroSection.backgroundColor').optional().isHexColor(),
  body('projectsSection.title').optional().isString(),
  body('projectsSection.description').optional().isString(),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, heroSection, projectsSection, projects } = req.body;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update page basic info
      const updatedPage = await tx.page.update({
        where: { id },
        data: {
          title,
          updatedAt: new Date()
        }
      });

      // Update or create hero section
      if (heroSection) {
        await tx.heroSection.upsert({
          where: { pageId: id },
          create: {
            ...heroSection,
            pageId: id
          },
          update: heroSection
        });
      }

      // Update or create projects section
      if (projectsSection) {
        const projectsSec = await tx.projectsSection.upsert({
          where: { pageId: id },
          create: {
            ...projectsSection,
            pageId: id
          },
          update: projectsSection
        });

        // Update projects if provided
        if (projects && Array.isArray(projects)) {
          // Delete existing projects
          await tx.project.deleteMany({
            where: { projectsSectionId: projectsSec.id }
          });

          // Create new projects
          for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            await tx.project.create({
              data: {
                ...project,
                order: i,
                projectsSectionId: projectsSec.id
              }
            });
          }
        }
      }

      return updatedPage;
    });

    // Generate updated HTML file
    await generateHTMLFile(id);

    // Fetch complete updated page
    const updatedPage = await prisma.page.findUnique({
      where: { id },
      include: {
        heroSection: true,
        projectsSection: {
          include: {
            projects: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    res.json({
      message: 'Page updated successfully',
      page: updatedPage
    });

  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// POST /api/pages/:id/generate - Generate HTML file
router.post('/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    await generateHTMLFile(id);
    
    res.json({ 
      message: 'HTML file generated successfully' 
    });
  } catch (error) {
    console.error('Error generating HTML:', error);
    res.status(500).json({ error: 'Failed to generate HTML file' });
  }
});

// Function to generate HTML file from page data
async function generateHTMLFile(pageId) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        heroSection: true,
        projectsSection: {
          include: {
            projects: {
              where: { isVisible: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!page) {
      throw new Error('Page not found');
    }

    // Read the existing HTML file directly
    const outputPath = path.join(__dirname, '../', page.path);
    let template;
    
    try {
      template = await fs.readFile(outputPath, 'utf8');
      console.log(`✅ Read existing HTML file: ${page.path}`);
    } catch (error) {
      console.log(`⚠️ Could not read existing file ${page.path}, creating from template`);
      // Create a basic template if file doesn't exist
      template = createBasicTemplate(page);
    }

    // Intelligently update specific sections of the HTML
    let html = template;

    // Update page title in <title> tag
    html = html.replace(/<title>([^<]*)<\/title>/i, `<title>${page.metaTitle || page.title}</title>`);
    
    // Update meta description
    const metaDescPattern = /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i;
    if (metaDescPattern.test(html)) {
      html = html.replace(metaDescPattern, `<meta name="description" content="${page.metaDescription || ''}">`);
    }

    // Update hero section if it exists
    if (page.heroSection) {
      // Update hero title (looking for h1, h2, or elements with hero-title class)
      html = updateHeroSection(html, page.heroSection);
    }

    // Update projects section if it exists
    if (page.projectsSection && page.projectsSection.projects) {
      html = updateProjectsSection(html, page.projectsSection);
    }

    console.log(`📝 Updated content for page: ${page.title}`);

    // Write the generated HTML to the actual file
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, 'utf8');

    console.log(`✅ Generated HTML file: ${page.path}`);
    
  } catch (error) {
    console.error('Error generating HTML file:', error);
    throw error;
  }
}

// Update hero section content in HTML
function updateHeroSection(html, heroSection) {
  // Try to find and update hero title (multiple possible patterns)
  const heroTitlePatterns = [
    /<h1[^>]*class="[^"]*hero[^"]*"[^>]*>([^<]*)<\/h1>/i,
    /<h1[^>]*>([^<]*)<\/h1>/i,
    /<div[^>]*class="[^"]*hero-title[^"]*"[^>]*>([^<]*)<\/div>/i
  ];
  
  for (let pattern of heroTitlePatterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, (match, content) => {
        return match.replace(content, heroSection.title);
      });
      break;
    }
  }
  
  // Try to find and update hero subtitle
  const heroSubtitlePatterns = [
    /<h2[^>]*class="[^"]*hero[^"]*"[^>]*>([^<]*)<\/h2>/i,
    /<h2[^>]*class="[^"]*subtitle[^"]*"[^>]*>([^<]*)<\/h2>/i,
    /<p[^>]*class="[^"]*hero-subtitle[^"]*"[^>]*>([^<]*)<\/p>/i
  ];
  
  for (let pattern of heroSubtitlePatterns) {
    if (pattern.test(html) && heroSection.subtitle) {
      html = html.replace(pattern, (match, content) => {
        return match.replace(content, heroSection.subtitle);
      });
      break;
    }
  }
  
  // Try to find and update hero description
  const heroDescPatterns = [
    /<p[^>]*class="[^"]*hero[^"]*description[^"]*"[^>]*>([^<]*)<\/p>/i,
    /<div[^>]*class="[^"]*hero[^"]*description[^"]*"[^>]*>([^<]*)<\/div>/i
  ];
  
  for (let pattern of heroDescPatterns) {
    if (pattern.test(html) && heroSection.description) {
      html = html.replace(pattern, (match, content) => {
        return match.replace(content, heroSection.description);
      });
      break;
    }
  }
  
  console.log(`📝 Updated hero section: ${heroSection.title}`);
  return html;
}

// Update projects section content in HTML
function updateProjectsSection(html, projectsSection) {
  // Try to find projects section title
  const projectsTitlePatterns = [
    /<h2[^>]*class="[^"]*projects[^"]*"[^>]*>([^<]*)<\/h2>/i,
    /<h2[^>]*class="[^"]*section-title[^"]*"[^>]*>([^<]*)<\/h2>/i,
    /<h3[^>]*class="[^"]*projects[^"]*"[^>]*>([^<]*)<\/h3>/i
  ];
  
  for (let pattern of projectsTitlePatterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, (match, content) => {
        return match.replace(content, projectsSection.title);
      });
      break;
    }
  }
  
  // Try to find projects section description
  const projectsDescPatterns = [
    /<p[^>]*class="[^"]*projects[^"]*description[^"]*"[^>]*>([^<]*)<\/p>/i,
    /<div[^>]*class="[^"]*projects[^"]*description[^"]*"[^>]*>([^<]*)<\/div>/i,
    /<p[^>]*class="[^"]*section-description[^"]*"[^>]*>([^<]*)<\/p>/i
  ];
  
  for (let pattern of projectsDescPatterns) {
    if (pattern.test(html) && projectsSection.description) {
      html = html.replace(pattern, (match, content) => {
        return match.replace(content, projectsSection.description);
      });
      break;
    }
  }
  
  // 🔥 WICHTIG: Update the JavaScript projects array in the HTML!
  const projectsArrayPattern = /const projects = \[([\s\S]*?)\];/;
  if (projectsArrayPattern.test(html)) {
    const newProjectsArray = projectsSection.projects.map(project => {
      const escapedName = project.name.replace(/'/g, "\\'");
      return `  { name: '${escapedName}', image: '${project.imageUrl}' }`;
    }).join(',\n');
    
    const newProjectsJs = `const projects = [
${newProjectsArray}
];`;
    
    html = html.replace(projectsArrayPattern, newProjectsJs);
    console.log(`🔥 FIXED: Updated JavaScript projects array with ${projectsSection.projects.length} projects!`);
  } else {
    console.log(`⚠️ Could not find projects array pattern in HTML`);
  }
  
  // 🔥🔥 MOST IMPORTANT: Update the visual project gallery HTML!
  // Precise pattern to match from gallery start to before decorative elements
  const galleryPattern = /(<div class="modern-project-gallery">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<!-- Decorative Elements -->)/;
  if (galleryPattern.test(html)) {
    // Generate new project cards HTML
    const projectCardsHTML = projectsSection.projects.map((project, index) => {
      const escapedName = project.name.replace(/'/g, "&apos;");
      const escapedAlt = project.imageAlt || project.name;
      return `            <div class="project-card" onclick="openLightbox(${index})">
              <div class="project-image-wrapper">
                <img src="${project.imageUrl}" alt="${escapedAlt}" class="project-image">
                <div class="project-overlay">
                  <div class="project-icon">
                    <i class="fa-solid fa-play"></i>
                  </div>
                </div>
              </div>
              <div class="project-content">
                <h3 class="project-name">${escapedName}</h3>
              </div>
            </div>`;
    }).join('\n            \n');
    
    const newGalleryHTML = `<div class="modern-project-gallery">
${projectCardsHTML}
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->`;
    
    html = html.replace(galleryPattern, newGalleryHTML);
    console.log(`🔥🔥 LIVE GALLERY UPDATED: Generated ${projectsSection.projects.length} project cards!`);
  } else {
    console.log(`⚠️ Could not find gallery pattern in HTML`);
  }
  
  console.log(`📝 Updated projects section: ${projectsSection.title} (${projectsSection.projects.length} projects)`);
  return html;
}

// Create a basic HTML template for a page
function createBasicTemplate(page) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.metaTitle || page.title}</title>
    <meta name="description" content="${page.metaDescription || ''}">
    <link rel="stylesheet" href="../template/assets/css/style.css">
</head>
<body>
    <header>
        <h1 class="hero-title">${page.heroSection?.title || page.title}</h1>
        <h2 class="hero-subtitle">${page.heroSection?.subtitle || ''}</h2>
        <p class="hero-description">${page.heroSection?.description || ''}</p>
    </header>
    
    <main>
        <section class="projects">
            <h2 class="projects-title">${page.projectsSection?.title || 'Projekte'}</h2>
            <p class="projects-description">${page.projectsSection?.description || ''}</p>
            <div class="projects-grid">
                <!-- Projects will be dynamically inserted -->
            </div>
        </section>
    </main>
    
    <script src="../template/assets/js/custom.js"></script>
</body>
</html>`;
}

module.exports = router; 