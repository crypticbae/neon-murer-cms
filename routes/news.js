const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, match => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[match]))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

// GET /api/news - Get all news articles
router.get('/', async (req, res) => {
  try {
    const { status, category, featured, breaking } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (featured !== undefined) where.isFeatured = featured === 'true';
    if (breaking !== undefined) where.isBreaking = breaking === 'true';
    
    const news = await prisma.newsArticle.findMany({
      where,
      orderBy: { newsDate: 'desc' }
    });

    res.json({
      news,
      total: news.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/published - Get only published news for website
router.get('/published', async (req, res) => {
  try {
    const { limit, category } = req.query;
    
    const where = {
      status: 'PUBLISHED',
      showOnWebsite: true
    };
    
    if (category) where.category = category;
    
    const news = await prisma.newsArticle.findMany({
      where,
      orderBy: { newsDate: 'desc' },
      ...(limit && { take: parseInt(limit) })
    });

    res.json({ news });
  } catch (error) {
    console.error('Error fetching published news:', error);
    res.status(500).json({ error: 'Failed to fetch published news' });
  }
});

// GET /api/news/:id - Get single news article
router.get('/:id', async (req, res) => {
  try {
    const news = await prisma.newsArticle.findUnique({
      where: { id: req.params.id }
    });

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({ error: 'Failed to fetch news article' });
  }
});

// GET /api/news/slug/:slug - Get news by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const news = await prisma.newsArticle.findUnique({
      where: { slug: req.params.slug }
    });

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    console.error('Error fetching news article by slug:', error);
    res.status(500).json({ error: 'Failed to fetch news article' });
  }
});

// POST /api/news - Create new news article
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn(['unternehmen', 'projekte', 'technologie', 'team', 'events']).withMessage('Invalid category'),
  body('newsDate').optional().isISO8601().withMessage('Invalid news date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      category,
      excerpt,
      content,
      newsDate,
      isBreaking,
      isFeatured,
      status,
      showOnWebsite,
      metaTitle,
      metaDescription,
      keywords,
      featuredImage,
      author
    } = req.body;

    // Generate slug from title
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.newsArticle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const news = await prisma.newsArticle.create({
      data: {
        title,
        slug,
        category: category || 'unternehmen',
        excerpt,
        content,
        newsDate: newsDate ? new Date(newsDate) : new Date(),
        isBreaking: isBreaking || false,
        isFeatured: isFeatured || false,
        status: status || 'DRAFT',
        showOnWebsite: showOnWebsite !== undefined ? showOnWebsite : true,
        metaTitle,
        metaDescription,
        keywords,
        featuredImage,
        author: author || 'Administrator'
      }
    });

    res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

// PUT /api/news/:id - Update news article
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('category').optional().isIn(['unternehmen', 'projekte', 'technologie', 'team', 'events']).withMessage('Invalid category'),
  body('newsDate').optional().isISO8601().withMessage('Invalid news date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newsId = req.params.id;
    const {
      title,
      category,
      excerpt,
      content,
      newsDate,
      isBreaking,
      isFeatured,
      status,
      showOnWebsite,
      metaTitle,
      metaDescription,
      keywords,
      featuredImage,
      author
    } = req.body;

    // Check if news exists
    const existingNews = await prisma.newsArticle.findUnique({
      where: { id: newsId }
    });

    if (!existingNews) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const updateData = {
      ...(title !== undefined && { title }),
      ...(category !== undefined && { category }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(newsDate !== undefined && { newsDate: new Date(newsDate) }),
      ...(isBreaking !== undefined && { isBreaking }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(status !== undefined && { status }),
      ...(showOnWebsite !== undefined && { showOnWebsite }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(keywords !== undefined && { keywords }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(author !== undefined && { author })
    };

    // Update slug if title changed
    if (title && title !== existingNews.title) {
      let baseSlug = generateSlug(title);
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique (exclude current article)
      while (await prisma.newsArticle.findFirst({ 
        where: { 
          slug,
          NOT: { id: newsId }
        } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.slug = slug;
    }

    const news = await prisma.newsArticle.update({
      where: { id: newsId },
      data: updateData
    });

    res.json(news);
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

// DELETE /api/news/:id - Delete news article
router.delete('/:id', async (req, res) => {
  try {
    const newsId = req.params.id;

    const existingNews = await prisma.newsArticle.findUnique({
      where: { id: newsId }
    });

    if (!existingNews) {
      return res.status(404).json({ error: 'News article not found' });
    }

    await prisma.newsArticle.delete({
      where: { id: newsId }
    });

    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// POST /api/news/:id/publish - Publish news article
router.post('/:id/publish', async (req, res) => {
  try {
    const newsId = req.params.id;

    const news = await prisma.newsArticle.update({
      where: { id: newsId },
      data: {
        status: 'PUBLISHED',
        showOnWebsite: true
      }
    });

    res.json(news);
  } catch (error) {
    console.error('Error publishing news article:', error);
    res.status(500).json({ error: 'Failed to publish news article' });
  }
});

// POST /api/news/:id/archive - Archive news article
router.post('/:id/archive', async (req, res) => {
  try {
    const newsId = req.params.id;

    const news = await prisma.newsArticle.update({
      where: { id: newsId },
      data: {
        status: 'ARCHIVED',
        showOnWebsite: false
      }
    });

    res.json(news);
  } catch (error) {
    console.error('Error archiving news article:', error);
    res.status(500).json({ error: 'Failed to archive news article' });
  }
});

// POST /api/news/:id/feature - Toggle featured status
router.post('/:id/feature', async (req, res) => {
  try {
    const newsId = req.params.id;
    const { featured } = req.body;

    const news = await prisma.newsArticle.update({
      where: { id: newsId },
      data: {
        isFeatured: featured !== undefined ? featured : true
      }
    });

    res.json(news);
  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

module.exports = router; 