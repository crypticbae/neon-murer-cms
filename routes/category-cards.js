const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/category-cards - Get all category cards
router.get('/', async (req, res) => {
  try {
    const { category, pageSlug } = req.query;
    
    const where = {};
    if (category) {
      where.category = category;
    }
    if (pageSlug) {
      where.pageSlug = pageSlug;
    }

    const cards = await prisma.categoryCard.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      cards,
      total: cards.length
    });
  } catch (error) {
    console.error('Error fetching category cards:', error);
    res.status(500).json({ error: 'Failed to fetch category cards' });
  }
});

// GET /api/category-cards/:id - Get single category card
router.get('/:id', async (req, res) => {
  try {
    const card = await prisma.categoryCard.findUnique({
      where: { id: req.params.id }
    });

    if (!card) {
      return res.status(404).json({ error: 'Category card not found' });
    }

    res.json(card);
  } catch (error) {
    console.error('Error fetching category card:', error);
    res.status(500).json({ error: 'Failed to fetch category card' });
  }
});

// POST /api/category-cards - Create new category card
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('linkUrl').notEmpty().withMessage('Link URL is required'),
  body('pageSlug').notEmpty().withMessage('Page slug is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('ctaText').optional(),
  body('backgroundImage').optional(),
  body('backgroundColor').optional(),
  body('icon').optional(),
  body('order').optional().isInt(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      title,
      subtitle,
      linkUrl,
      ctaText = 'Mehr erfahren',
      backgroundImage,
      backgroundColor,
      icon,
      pageSlug,
      category,
      order = 0,
      isActive = true
    } = req.body;

    const card = await prisma.categoryCard.create({
      data: {
        title,
        subtitle,
        linkUrl,
        ctaText,
        backgroundImage,
        backgroundColor,
        icon,
        pageSlug,
        category,
        order,
        isActive
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating category card:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'A category card with this title already exists in this category' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create category card' });
  }
});

// PUT /api/category-cards/:id - Update category card
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('linkUrl').optional().notEmpty(),
  body('pageSlug').optional().notEmpty(),
  body('category').optional().notEmpty(),
  body('ctaText').optional(),
  body('backgroundImage').optional(),
  body('backgroundColor').optional(),
  body('icon').optional(),
  body('order').optional().isInt(),
  body('isActive').optional().isBoolean()
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
    const updateData = req.body;

    const card = await prisma.categoryCard.update({
      where: { id },
      data: updateData
    });

    res.json(card);
  } catch (error) {
    console.error('Error updating category card:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category card not found' });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'A category card with this title already exists in this category' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update category card' });
  }
});

// DELETE /api/category-cards/:id - Delete category card
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.categoryCard.delete({
      where: { id }
    });

    res.json({ message: 'Category card deleted successfully' });
  } catch (error) {
    console.error('Error deleting category card:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category card not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete category card' });
  }
});

// PUT /api/category-cards/:id/reorder - Update card order
router.put('/:id/reorder', [
  body('order').isInt().withMessage('Order must be an integer')
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
    const { order } = req.body;

    const card = await prisma.categoryCard.update({
      where: { id },
      data: { order }
    });

    res.json(card);
  } catch (error) {
    console.error('Error reordering category card:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category card not found' });
    }
    
    res.status(500).json({ error: 'Failed to reorder category card' });
  }
});

// POST /api/category-cards/bulk-update - Bulk update card orders
router.post('/bulk-update', [
  body('cards').isArray().withMessage('Cards must be an array'),
  body('cards.*.id').notEmpty().withMessage('Card ID is required'),
  body('cards.*.order').isInt().withMessage('Order must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { cards } = req.body;

    // Update all cards in a transaction
    await prisma.$transaction(
      cards.map(card => 
        prisma.categoryCard.update({
          where: { id: card.id },
          data: { order: card.order }
        })
      )
    );

    res.json({ message: 'Cards reordered successfully' });
  } catch (error) {
    console.error('Error bulk updating category cards:', error);
    res.status(500).json({ error: 'Failed to update card orders' });
  }
});

module.exports = router; 