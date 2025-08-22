const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { logActivity, logError } = require('../middleware/logger');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/agb - Get all AGB sections
 */
router.get('/', async (req, res) => {
    try {
        const sections = await prisma.agbSection.findMany({
            orderBy: { sortOrder: 'asc' }
        });

        logActivity('AGB_SECTIONS_FETCHED', req, { count: sections.length });
        
        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        logError('AGB_FETCH_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der AGB-Abschnitte'
        });
    }
});

/**
 * GET /api/agb/active - Get only active AGB sections for public display
 */
router.get('/active', async (req, res) => {
    try {
        const sections = await prisma.agbSection.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        logError('AGB_ACTIVE_FETCH_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der aktiven AGB-Abschnitte'
        });
    }
});

/**
 * GET /api/agb/:id - Get specific AGB section
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const section = await prisma.agbSection.findUnique({
            where: { id }
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'AGB-Abschnitt nicht gefunden'
            });
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        logError('AGB_GET_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden des AGB-Abschnitts'
        });
    }
});

/**
 * POST /api/agb - Create new AGB section
 */
router.post('/', 
    authenticateToken,
    [
        body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Titel ist erforderlich und max. 200 Zeichen'),
        body('content').isString().isLength({ min: 1 }).withMessage('Inhalt ist erforderlich'),
        body('boxType').optional().isString().isIn(['DEFAULT', 'HIGHLIGHT', 'IMPORTANT']).withMessage('Ungültiger Box-Typ'),
        body('iconClass').optional().isString().isLength({ max: 100 }).withMessage('Icon-Klasse max. 100 Zeichen'),
        body('showInQuickNav').optional().isBoolean().withMessage('showInQuickNav muss ein Boolean sein')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            const { title, content, boxType = 'DEFAULT', iconClass, showInQuickNav = false } = req.body;

            // Get next sort order
            const lastSection = await prisma.agbSection.findFirst({
                orderBy: { sortOrder: 'desc' }
            });
            const sortOrder = (lastSection?.sortOrder || 0) + 1;

            const section = await prisma.agbSection.create({
                data: {
                    title,
                    content,
                    boxType,
                    iconClass,
                    showInQuickNav,
                    sortOrder
                }
            });

            logActivity('AGB_SECTION_CREATED', req, { sectionId: section.id, title });

            res.status(201).json({
                success: true,
                message: 'AGB-Abschnitt erfolgreich erstellt',
                data: section
            });
        } catch (error) {
            logError('AGB_CREATE_ERROR', error, req);
            res.status(500).json({
                success: false,
                error: 'Fehler beim Erstellen des AGB-Abschnitts'
            });
        }
    }
);

// PUT /api/agb/reorder - Update sort order of multiple AGB sections
router.put('/reorder', authenticateToken, async (req, res) => {
    try {
        const { sections } = req.body;

        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                error: 'Ungültige Abschnittsdaten'
            });
        }

        // Update sort order for each section
        const updatePromises = sections.map(async (section, index) => {
            return await prisma.agbSection.update({
                where: { id: section.id },
                data: { sortOrder: index + 1 }
            });
        });

        await Promise.all(updatePromises);

        logActivity('AGB_SECTIONS_REORDERED', 'AGB-Abschnitte Reihenfolge aktualisiert', req, {
            sectionsCount: sections.length
        });

        res.json({
            success: true,
            message: 'Reihenfolge erfolgreich aktualisiert'
        });
    } catch (error) {
        logError('AGB_REORDER_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Aktualisieren der Reihenfolge'
        });
    }
});

/**
 * PUT /api/agb/:id - Update AGB section
 */
router.put('/:id',
    authenticateToken,
    [
        body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Titel max. 200 Zeichen'),
        body('content').optional().isString().isLength({ min: 1 }).withMessage('Inhalt darf nicht leer sein'),
        body('boxType').optional().isString().isIn(['DEFAULT', 'HIGHLIGHT', 'IMPORTANT']).withMessage('Ungültiger Box-Typ'),
        body('iconClass').optional().isString().isLength({ max: 100 }).withMessage('Icon-Klasse max. 100 Zeichen'),
        body('showInQuickNav').optional().isBoolean().withMessage('showInQuickNav muss ein Boolean sein'),
        body('isActive').optional().isBoolean().withMessage('isActive muss ein Boolean sein')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            const { id } = req.params;
            const updateData = req.body;

            // Check if section exists
            const existingSection = await prisma.agbSection.findUnique({
                where: { id }
            });

            if (!existingSection) {
                return res.status(404).json({
                    success: false,
                    error: 'AGB-Abschnitt nicht gefunden'
                });
            }

            const section = await prisma.agbSection.update({
                where: { id },
                data: updateData
            });

            logActivity('AGB_SECTION_UPDATED', req, { sectionId: id, title: section.title });

            res.json({
                success: true,
                message: 'AGB-Abschnitt erfolgreich aktualisiert',
                data: section
            });
        } catch (error) {
            logError('AGB_UPDATE_ERROR', error, req);
            res.status(500).json({
                success: false,
                error: 'Fehler beim Aktualisieren des AGB-Abschnitts'
            });
        }
    }
);

/**
 * PUT /api/agb/reorder - Update sort order of multiple sections
 */
router.put('/reorder',
    authenticateToken,
    [
        body('sections').isArray({ min: 1 }).withMessage('Abschnitte-Array ist erforderlich'),
        body('sections.*.id').isString().withMessage('Jeder Abschnitt muss eine gültige ID haben')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            const { sections } = req.body;

            // Update all sections in a transaction
            await prisma.$transaction(
                sections.map((section, index) => 
                    prisma.agbSection.update({
                        where: { id: section.id },
                        data: { sortOrder: index + 1 }
                    })
                )
            );

            logActivity('AGB_SECTIONS_REORDERED', req, { count: sections.length });

            res.json({
                success: true,
                message: 'AGB-Reihenfolge erfolgreich aktualisiert'
            });
        } catch (error) {
            logError('AGB_REORDER_ERROR', error, req);
            res.status(500).json({
                success: false,
                error: 'Fehler beim Neuordnen der AGB-Abschnitte'
            });
        }
    }
);

/**
 * DELETE /api/agb/:id - Delete AGB section
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if section exists
        const existingSection = await prisma.agbSection.findUnique({
            where: { id }
        });

        if (!existingSection) {
            return res.status(404).json({
                success: false,
                error: 'AGB-Abschnitt nicht gefunden'
            });
        }

        await prisma.agbSection.delete({
            where: { id }
        });

        logActivity('AGB_SECTION_DELETED', req, { sectionId: id, title: existingSection.title });

        res.json({
            success: true,
            message: 'AGB-Abschnitt erfolgreich gelöscht'
        });
    } catch (error) {
        logError('AGB_DELETE_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Löschen des AGB-Abschnitts'
        });
    }
});

module.exports = router;