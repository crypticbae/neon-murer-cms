const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, logError } = require('../middleware/logger');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/datenschutz - Get all datenschutz sections
 */
router.get('/', async (req, res) => {
    try {
        const sections = await prisma.datenschutzSection.findMany({
            orderBy: { sortOrder: 'asc' }
        });

        logActivity('DATENSCHUTZ_SECTIONS_FETCHED', 'Datenschutz-Abschnitte abgerufen', req);

        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        logError('DATENSCHUTZ_FETCH_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der Datenschutz-Abschnitte'
        });
    }
});

/**
 * GET /api/datenschutz/:id - Get single datenschutz section
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const section = await prisma.datenschutzSection.findUnique({
            where: { id }
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Datenschutz-Abschnitt nicht gefunden'
            });
        }

        logActivity('DATENSCHUTZ_SECTION_FETCHED', 'Datenschutz-Abschnitt abgerufen', req, { sectionId: id });

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        logError('DATENSCHUTZ_SECTION_FETCH_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden des Datenschutz-Abschnitts'
        });
    }
});

/**
 * POST /api/datenschutz - Create new datenschutz section
 */
router.post('/',
    authenticateToken,
    [
        body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Titel max. 200 Zeichen'),
        body('content').isString().isLength({ min: 1 }).withMessage('Inhalt darf nicht leer sein'),
        body('boxType').optional().isString().isIn(['DEFAULT', 'HIGHLIGHT', 'IMPORTANT']).withMessage('Ungültiger Box-Typ'),
        body('iconClass').optional().isString().isLength({ max: 100 }).withMessage('Icon-Klasse max. 100 Zeichen'),
        body('showInQuickNav').optional().isBoolean().withMessage('showInQuickNav muss boolean sein'),
        body('sortOrder').optional().isInt({ min: 1 }).withMessage('Sortierreihenfolge muss eine positive Zahl sein')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Ungültige Eingabedaten',
                    details: errors.array()
                });
            }

            const { title, content, boxType = 'DEFAULT', iconClass, showInQuickNav = false, sortOrder } = req.body;

            // Automatische sortOrder Bestimmung wenn nicht angegeben
            let finalSortOrder = sortOrder;
            if (!finalSortOrder) {
                const maxOrder = await prisma.datenschutzSection.findFirst({
                    orderBy: { sortOrder: 'desc' },
                    select: { sortOrder: true }
                });
                finalSortOrder = (maxOrder?.sortOrder || 0) + 1;
            }

            const section = await prisma.datenschutzSection.create({
                data: {
                    title,
                    content,
                    boxType,
                    iconClass,
                    showInQuickNav,
                    sortOrder: finalSortOrder
                }
            });

            logActivity('DATENSCHUTZ_SECTION_CREATED', req, { sectionId: section.id, title });

            res.status(201).json({
                success: true,
                message: 'Datenschutz-Abschnitt erfolgreich erstellt',
                data: section
            });
        } catch (error) {
            logError('DATENSCHUTZ_CREATE_ERROR', error, req);
            res.status(500).json({
                success: false,
                error: 'Fehler beim Erstellen des Datenschutz-Abschnitts'
            });
        }
    }
);

// PUT /api/datenschutz/reorder - Update sort order of multiple datenschutz sections
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
            return await prisma.datenschutzSection.update({
                where: { id: section.id },
                data: { sortOrder: index + 1 }
            });
        });

        await Promise.all(updatePromises);

        logActivity('DATENSCHUTZ_SECTIONS_REORDERED', 'Datenschutz-Abschnitte Reihenfolge aktualisiert', req, {
            sectionsCount: sections.length
        });

        res.json({
            success: true,
            message: 'Reihenfolge erfolgreich aktualisiert'
        });
    } catch (error) {
        logError('DATENSCHUTZ_REORDER_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Aktualisieren der Reihenfolge'
        });
    }
});

/**
 * PUT /api/datenschutz/:id - Update datenschutz section
 */
router.put('/:id',
    authenticateToken,
    [
        body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Titel max. 200 Zeichen'),
        body('content').optional().isString().isLength({ min: 1 }).withMessage('Inhalt darf nicht leer sein'),
        body('boxType').optional().isString().isIn(['DEFAULT', 'HIGHLIGHT', 'IMPORTANT']).withMessage('Ungültiger Box-Typ'),
        body('iconClass').optional().isString().isLength({ max: 100 }).withMessage('Icon-Klasse max. 100 Zeichen'),
        body('showInQuickNav').optional().isBoolean().withMessage('showInQuickNav muss boolean sein'),
        body('sortOrder').optional().isInt({ min: 1 }).withMessage('Sortierreihenfolge muss eine positive Zahl sein')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Ungültige Eingabedaten',
                    details: errors.array()
                });
            }

            const { id } = req.params;
            const { title, content, boxType, iconClass, showInQuickNav, sortOrder } = req.body;

            // Prüfe ob Abschnitt existiert
            const existingSection = await prisma.datenschutzSection.findUnique({
                where: { id }
            });

            if (!existingSection) {
                return res.status(404).json({
                    success: false,
                    error: 'Datenschutz-Abschnitt nicht gefunden'
                });
            }

            // Prüfe ob Abschnitt editierbar ist (Cookie-Abschnitt nicht editierbar)
            if (!existingSection.isEditable) {
                return res.status(403).json({
                    success: false,
                    error: 'Dieser Abschnitt ist nicht editierbar'
                });
            }

            const updatedSection = await prisma.datenschutzSection.update({
                where: { id },
                data: {
                    ...(title !== undefined && { title }),
                    ...(content !== undefined && { content }),
                    ...(boxType !== undefined && { boxType }),
                    ...(iconClass !== undefined && { iconClass }),
                    ...(showInQuickNav !== undefined && { showInQuickNav }),
                    ...(sortOrder !== undefined && { sortOrder })
                }
            });

            logActivity('DATENSCHUTZ_SECTION_UPDATED', 'Datenschutz-Abschnitt aktualisiert', req, { sectionId: id, title: updatedSection.title });

            res.json({
                success: true,
                message: 'Datenschutz-Abschnitt erfolgreich aktualisiert',
                data: updatedSection
            });
        } catch (error) {
            logError('DATENSCHUTZ_UPDATE_ERROR', error, req);
            res.status(500).json({
                success: false,
                error: 'Fehler beim Aktualisieren des Datenschutz-Abschnitts'
            });
        }
    }
);

/**
 * DELETE /api/datenschutz/:id - Delete datenschutz section
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Prüfe ob Abschnitt existiert
        const existingSection = await prisma.datenschutzSection.findUnique({
            where: { id }
        });

        if (!existingSection) {
            return res.status(404).json({
                success: false,
                error: 'Datenschutz-Abschnitt nicht gefunden'
            });
        }

        // Prüfe ob Abschnitt editierbar ist (Cookie-Abschnitt nicht löschbar)
        if (!existingSection.isEditable) {
            return res.status(403).json({
                success: false,
                error: 'Dieser Abschnitt kann nicht gelöscht werden'
            });
        }

        await prisma.datenschutzSection.delete({
            where: { id }
        });

        logActivity('DATENSCHUTZ_SECTION_DELETED', 'Datenschutz-Abschnitt gelöscht', req, { sectionId: id, title: existingSection.title });

        res.json({
            success: true,
            message: 'Datenschutz-Abschnitt erfolgreich gelöscht'
        });
    } catch (error) {
        logError('DATENSCHUTZ_DELETE_ERROR', error, req);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Löschen des Datenschutz-Abschnitts'
        });
    }
});

module.exports = router;