const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    const { status, department, jobType, location, active } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (department) where.department = department;
    if (jobType) where.jobType = jobType;
    if (location) where.location = location;
    if (active !== undefined) where.isActive = active === 'true';
    
    const jobs = await prisma.job.findMany({
      where,
      include: {
        requirements: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      jobs,
      total: jobs.length
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/active - Get only active jobs for website
router.get('/active', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        showOnWebsite: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ]
      },
      include: {
        requirements: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({ error: 'Failed to fetch active jobs' });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        requirements: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs - Create new job
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('position').trim().isLength({ min: 1 }).withMessage('Position is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('department').isIn(['produktion', 'grafik', 'montage', 'administration', 'verkauf']).withMessage('Invalid department'),
  body('jobType').isIn(['vollzeit', 'teilzeit', 'lehrstelle', 'praktikum', 'temporaer']).withMessage('Invalid job type'),
  body('location').isIn(['neuhaus', 'uznach', 'beide']).withMessage('Invalid location'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      position,
      department,
      jobType,
      location,
      description,
      content,
      excerpt,
      requirements,
      validUntil,
      salary,
      benefits,
      status,
      isActive,
      showOnWebsite,
      metaTitle,
      metaDescription,
      keywords,
      featuredImage,
      author
    } = req.body;

    // Create job with requirements
    const job = await prisma.job.create({
      data: {
        title,
        position,
        department,
        jobType,
        location,
        description,
        content,
        excerpt,
        validUntil: validUntil ? new Date(validUntil) : null,
        salary,
        benefits,
        status: status || 'DRAFT',
        isActive: isActive !== undefined ? isActive : true,
        showOnWebsite: showOnWebsite !== undefined ? showOnWebsite : true,
        metaTitle,
        metaDescription,
        keywords,
        featuredImage,
        author: author || 'Administrator',
        requirements: {
          create: requirements?.map((req, index) => ({
            text: req,
            order: index
          })) || []
        }
      },
      include: {
        requirements: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('position').optional().trim().isLength({ min: 1 }).withMessage('Position cannot be empty'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('department').optional().isIn(['produktion', 'grafik', 'montage', 'administration', 'verkauf']).withMessage('Invalid department'),
  body('jobType').optional().isIn(['vollzeit', 'teilzeit', 'lehrstelle', 'praktikum', 'temporaer']).withMessage('Invalid job type'),
  body('location').optional().isIn(['neuhaus', 'uznach', 'beide']).withMessage('Invalid location'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobId = req.params.id;
    const {
      title,
      position,
      department,
      jobType,
      location,
      description,
      content,
      excerpt,
      requirements,
      validUntil,
      salary,
      benefits,
      status,
      isActive,
      showOnWebsite,
      metaTitle,
      metaDescription,
      keywords,
      featuredImage,
      author
    } = req.body;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update job
    const updateData = {
      ...(title !== undefined && { title }),
      ...(position !== undefined && { position }),
      ...(department !== undefined && { department }),
      ...(jobType !== undefined && { jobType }),
      ...(location !== undefined && { location }),
      ...(description !== undefined && { description }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
      ...(salary !== undefined && { salary }),
      ...(benefits !== undefined && { benefits }),
      ...(status !== undefined && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(showOnWebsite !== undefined && { showOnWebsite }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(keywords !== undefined && { keywords }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(author !== undefined && { author })
    };

    const job = await prisma.$transaction(async (tx) => {
      // Update requirements if provided
      if (requirements !== undefined) {
        // Delete existing requirements
        await tx.jobRequirement.deleteMany({
          where: { jobId }
        });

        // Create new requirements
        if (requirements.length > 0) {
          await tx.jobRequirement.createMany({
            data: requirements.map((req, index) => ({
              jobId,
              text: req,
              order: index
            }))
          });
        }
      }

      // Update job
      return await tx.job.update({
        where: { id: jobId },
        data: updateData,
        include: {
          requirements: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// POST /api/jobs/:id/archive - Archive job
router.post('/:id/archive', async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'ARCHIVED',
        isActive: false
      },
      include: {
        requirements: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error archiving job:', error);
    res.status(500).json({ error: 'Failed to archive job' });
  }
});

// POST /api/jobs/:id/publish - Publish job
router.post('/:id/publish', async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PUBLISHED',
        isActive: true,
        showOnWebsite: true
      },
      include: {
        requirements: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error publishing job:', error);
    res.status(500).json({ error: 'Failed to publish job' });
  }
});

module.exports = router; 