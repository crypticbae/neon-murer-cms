const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ========== CUSTOMERS ==========

// GET /api/customers/stats - Get customer statistics (BEFORE /:id route!)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.$transaction([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'PROSPECT' } }),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count({ where: { status: 'VIP' } }),
      prisma.customer.aggregate({
        _sum: { actualRevenue: true },
        _avg: { actualRevenue: true }
      }),
      prisma.activity.count({
        where: {
          activityDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      })
    ]);

    res.json({
      totalCustomers: stats[0],
      prospects: stats[1],
      activeCustomers: stats[2],
      vipCustomers: stats[3],
      totalRevenue: stats[4]._sum.actualRevenue || 0,
      averageRevenue: stats[4]._avg.actualRevenue || 0,
      recentActivities: stats[5]
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
});

// GET /api/customers - Get all customers with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      customerType, 
      priority, 
      segment,
      search,
      includeContacts,
      includeActivities,
      includeProjects 
    } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (customerType) where.customerType = customerType;
    if (priority) where.priority = priority;
    if (segment) where.segment = segment;
    
    // Search across multiple fields
    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const include = {};
    if (includeContacts === 'true') include.contacts = { where: { isActive: true } };
    if (includeActivities === 'true') include.activities = { 
      orderBy: { activityDate: 'desc' },
      take: 5
    };
    if (includeProjects === 'true') include.projects = {
      orderBy: { createdAt: 'desc' }
    };
    
    const customers = await prisma.customer.findMany({
      where,
      include,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      customers,
      total: customers.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id - Get single customer with full details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: { 
          where: { isActive: true },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
        },
        activities: {
          include: { contact: true },
          orderBy: { activityDate: 'desc' }
        },
        projects: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST /api/customers - Create new customer
router.post('/', authenticateToken, [
  body('company').optional().trim().isLength({ min: 1 }).withMessage('Company name cannot be empty'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(), 
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('customerType').optional().isIn(['BUSINESS', 'PRIVATE', 'GOVERNMENT', 'NGO']).withMessage('Invalid customer type'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('status').optional().isIn(['PROSPECT', 'ACTIVE', 'INACTIVE', 'LOST', 'VIP']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company, firstName, lastName, email, phone, website,
      street, city, zipCode, state, country,
      industry, customerType, leadSource, segment,
      revenuePotential, priority, status, notes, tags
    } = req.body;

    const customer = await prisma.customer.create({
      data: {
        company,
        firstName,
        lastName,
        email,
        phone,
        website,
        street,
        city,
        zipCode,
        state,
        country: country || 'Schweiz',
        industry,
        customerType: customerType || 'BUSINESS',
        leadSource,
        segment,
        revenuePotential: revenuePotential ? parseFloat(revenuePotential) : null,
        priority: priority || 'MEDIUM',
        status: status || 'PROSPECT',
        notes,
        tags: tags ? JSON.stringify(tags) : null
      },
      include: {
        contacts: true
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', authenticateToken, [
  body('company').optional().trim().isLength({ min: 1 }).withMessage('Company name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('customerType').optional().isIn(['BUSINESS', 'PRIVATE', 'GOVERNMENT', 'NGO']).withMessage('Invalid customer type'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('status').optional().isIn(['PROSPECT', 'ACTIVE', 'INACTIVE', 'LOST', 'VIP']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customerId = req.params.id;
    const updateData = { ...req.body };
    
    // Handle special fields
    if (updateData.revenuePotential) {
      updateData.revenuePotential = parseFloat(updateData.revenuePotential);
    }
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.nextFollowUp) {
      updateData.nextFollowUp = new Date(updateData.nextFollowUp);
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
      include: {
        contacts: true,
        activities: { 
          orderBy: { activityDate: 'desc' },
          take: 5
        }
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// ========== CONTACTS ==========

// GET /api/customers/:id/contacts - Get customer contacts
router.get('/:id/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { 
        customerId: req.params.id,
        isActive: true
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });

    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST /api/customers/:id/contacts - Add contact to customer
router.post('/:id/contacts', [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName, lastName, title, department,
      email, phone, mobile, position,
      isPrimary, language, notes
    } = req.body;

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      await prisma.contact.updateMany({
        where: { 
          customerId: req.params.id,
          isPrimary: true 
        },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        title,
        department,
        email,
        phone,
        mobile,
        position,
        isPrimary: isPrimary || false,
        language: language || 'de',
        notes,
        customerId: req.params.id
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /api/customers/:customerId/contacts/:contactId - Update contact
router.put('/:customerId/contacts/:contactId', [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, contactId } = req.params;
    const updateData = { ...req.body };

    // If this is set as primary, unset other primary contacts
    if (updateData.isPrimary) {
      await prisma.contact.updateMany({
        where: { 
          customerId,
          isPrimary: true,
          NOT: { id: contactId }
        },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: updateData
    });

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE /api/customers/:customerId/contacts/:contactId - Delete contact
router.delete('/:customerId/contacts/:contactId', async (req, res) => {
  try {
    await prisma.contact.update({
      where: { id: req.params.contactId },
      data: { isActive: false }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ========== ACTIVITIES ==========

// GET /api/customers/:id/activities - Get customer activities
router.get('/:id/activities', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit } = req.query;
    
    const where = { customerId: req.params.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const activities = await prisma.activity.findMany({
      where,
      include: { contact: true },
      orderBy: { activityDate: 'desc' },
      ...(limit && { take: parseInt(limit) })
    });

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// POST /api/customers/:id/activities - Add activity to customer
router.post('/:id/activities', [
  body('type').isIn(['CALL', 'MEETING', 'EMAIL', 'VISIT', 'QUOTE', 'PROPOSAL', 'FOLLOW_UP', 'COMPLAINT', 'SUPPORT', 'OTHER']).withMessage('Invalid activity type'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('activityDate').isISO8601().withMessage('Invalid activity date')
], async (req, res) => {
  try {
    console.log('📝 Creating activity with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type, subject, description, status,
      activityDate, duration, location,
      followUpDate, followUpNotes, contactId
    } = req.body;

    // Convert duration to integer if it's a string
    const durationInt = duration ? parseInt(duration, 10) : null;
    
    // Ensure contactId is null if empty string
    const contactIdValue = contactId && contactId !== '' ? contactId : null;

    console.log('📝 Processed data:', {
      type, subject, description, status,
      activityDate, duration: durationInt, location,
      followUpDate, followUpNotes, contactId: contactIdValue,
      customerId: req.params.id
    });

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description: description || null,
        status: status || 'PLANNED',
        activityDate: new Date(activityDate),
        duration: durationInt,
        location: location || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes: followUpNotes || null,
        customerId: req.params.id,
        contactId: contactIdValue
      },
      include: { contact: true }
    });

    // Update customer last contact date
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { lastContact: new Date() }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// GET /api/customers/:id/activities/:activityId - Get single activity
router.get('/:id/activities/:activityId', authenticateToken, async (req, res) => {
  try {
    const activity = await prisma.activity.findFirst({
      where: {
        id: req.params.activityId,
        customerId: req.params.id
      },
      include: { contact: true }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// PUT /api/customers/:id/activities/:activityId - Update activity
router.put('/:id/activities/:activityId', [
  body('type').isIn(['CALL', 'MEETING', 'EMAIL', 'VISIT', 'QUOTE', 'PROPOSAL', 'FOLLOW_UP', 'COMPLAINT', 'SUPPORT', 'OTHER']).withMessage('Invalid activity type'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('activityDate').isISO8601().withMessage('Invalid activity date')
], async (req, res) => {
  try {
    console.log('📝 Updating activity with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type, subject, description, status,
      activityDate, duration, location,
      followUpDate, followUpNotes, contactId
    } = req.body;

    // Convert duration to integer if it's a string
    const durationInt = duration ? parseInt(duration, 10) : null;
    
    // Ensure contactId is null if empty string
    const contactIdValue = contactId && contactId !== '' ? contactId : null;

    console.log('📝 Processed update data:', {
      type, subject, description, status,
      activityDate, duration: durationInt, location,
      followUpDate, followUpNotes, contactId: contactIdValue
    });

    const activity = await prisma.activity.update({
      where: { 
        id: req.params.activityId,
        customerId: req.params.id
      },
      data: {
        type,
        subject,
        description: description || null,
        status: status || 'PLANNED',
        activityDate: new Date(activityDate),
        duration: durationInt,
        location: location || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes: followUpNotes || null,
        contactId: contactIdValue
      },
      include: { contact: true }
    });

    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// DELETE /api/customers/:id/activities/:activityId - Delete activity
router.delete('/:id/activities/:activityId', async (req, res) => {
  try {
    await prisma.activity.delete({
      where: {
        id: req.params.activityId,
        customerId: req.params.id
      }
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// ========== PROJECTS ==========

// GET /api/customers/:id/projects - Get customer projects
router.get('/:id/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.customerProject.findMany({
      where: { customerId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/customers/:id/projects - Add project to customer
router.post('/:id/projects', [
  body('title').trim().isLength({ min: 1 }).withMessage('Project title is required'),
  body('status').optional().isIn(['PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).withMessage('Invalid project status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, description, type, status,
      estimatedValue, actualValue,
      startDate, endDate, deadline
    } = req.body;

    const project = await prisma.customerProject.create({
      data: {
        title,
        description,
        type,
        status: status || 'PLANNED',
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        actualValue: actualValue ? parseFloat(actualValue) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        customerId: req.params.id
      }
    });

    // Update customer project count
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { 
        totalProjects: { increment: 1 },
        actualRevenue: actualValue ? { increment: parseFloat(actualValue) } : undefined
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ========== HELPER ROUTES ==========

module.exports = router; 