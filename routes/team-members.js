const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/team-members - Get all team members
router.get('/', async (req, res) => {
  try {
    const { includeInactive = false, publicOnly = false } = req.query;
    
    const where = {};
    
    if (!includeInactive || includeInactive === 'false') {
      where.isActive = true;
    }
    
    if (publicOnly === 'true') {
      where.isPublic = true;
    }

    const teamMembers = await prisma.teamMember.findMany({
      where,
      orderBy: { displayOrder: 'asc' }
    });

    res.json({
      teamMembers,
      total: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/team-members/public - Get public team members for website
router.get('/public', async (req, res) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        isActive: true,
        isPublic: true
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        location: true,
        profileImage: true,
        biography: true,
        specialties: true,
        linkedinUrl: true
      }
    });

    res.json({
      teamMembers,
      total: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching public team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/team-members/:id - Get single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: req.params.id }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(teamMember);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// POST /api/team-members - Create new team member
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('phone').optional(),
  body('department').optional(),
  body('location').optional(),
  body('profileImage').optional(),
  body('biography').optional(),
  body('specialties').optional(),
  body('linkedinUrl').custom((value) => {
    // Completely optional - accept any value including null, undefined, empty string
    return true;
  }),
  body('displayOrder').optional().isNumeric(),
  body('isActive').optional().isBoolean(),
  body('isPublic').optional().isBoolean()
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
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      location = 'Werk Uznach',
      profileImage,
      biography,
      specialties,
      linkedinUrl,
      displayOrder = 0,
      isActive = true,
      isPublic = true
    } = req.body;

    const teamMember = await prisma.teamMember.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        department,
        location,
        profileImage,
        biography,
        specialties,
        linkedinUrl,
        displayOrder,
        isActive,
        isPublic
      }
    });

    res.status(201).json(teamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'A team member with this email already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT /api/team-members/:id - Update team member
router.put('/:id', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('phone').optional(),
  body('department').optional(),
  body('location').optional(),
  body('profileImage').optional(),
  body('biography').optional(),
  body('specialties').optional(),
  body('linkedinUrl').custom((value) => {
    // Completely optional - accept any value including null, undefined, empty string
    return true;
  }),
  body('displayOrder').optional().isNumeric(),
  body('isActive').optional().isBoolean(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    console.log('PUT /api/team-members/:id - Received data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    
    // Build update data - set missing optional fields to null to clear them
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      position: req.body.position,
      phone: req.body.phone || null,
      department: req.body.department || null,
      location: req.body.location || 'Werk Uznach',
      profileImage: req.body.profileImage || null,
      biography: req.body.biography || null,
      specialties: req.body.specialties || null,
      linkedinUrl: req.body.linkedinUrl || null,
      displayOrder: req.body.displayOrder || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
    };

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: updateData
    });

    res.json(teamMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'A team member with this email already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE /api/team-members/:id - Delete team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.teamMember.delete({
      where: { id }
    });

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// PUT /api/team-members/:id/reorder - Update team member order
router.put('/:id/reorder', [
  body('displayOrder').isInt().withMessage('Display order must be an integer')
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
    const { displayOrder } = req.body;

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: { displayOrder }
    });

    res.json(teamMember);
  } catch (error) {
    console.error('Error reordering team member:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.status(500).json({ error: 'Failed to reorder team member' });
  }
});

// POST /api/team-members/bulk-update - Bulk update team member orders
router.post('/bulk-update', [
  body('teamMembers').isArray().withMessage('Team members must be an array'),
  body('teamMembers.*.id').notEmpty().withMessage('Team member ID is required'),
  body('teamMembers.*.displayOrder').isInt().withMessage('Display order must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { teamMembers } = req.body;

    // Update all team members in a transaction
    await prisma.$transaction(
      teamMembers.map(member => 
        prisma.teamMember.update({
          where: { id: member.id },
          data: { displayOrder: member.displayOrder }
        })
      )
    );

    res.json({ message: 'Team members reordered successfully' });
  } catch (error) {
    console.error('Error bulk updating team members:', error);
    res.status(500).json({ error: 'Failed to update team member orders' });
  }
});

// PUT /api/team-members/:id/toggle-status - Toggle active/inactive status
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const currentMember = await prisma.teamMember.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!currentMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Toggle status
    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: { isActive: !currentMember.isActive }
    });

    res.json(teamMember);
  } catch (error) {
    console.error('Error toggling team member status:', error);
    res.status(500).json({ error: 'Failed to toggle team member status' });
  }
});

module.exports = router; 