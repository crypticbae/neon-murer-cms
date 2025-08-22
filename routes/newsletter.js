const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Newsletter-Templates CRUD Operations

// GET /api/newsletter/templates - Alle Newsletter-Templates abrufen
router.get('/templates', async (req, res) => {
    try {
        const templates = await prisma.newsletterTemplate.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(templates);
    } catch (error) {
        console.error('Error fetching newsletter templates:', error);
        res.status(500).json({ error: 'Failed to fetch newsletter templates' });
    }
});

// GET /api/newsletter/templates/:id - Einzelnes Template abrufen
router.get('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prisma.newsletterTemplate.findUnique({
            where: { id }
        });
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.json(template);
    } catch (error) {
        console.error('Error fetching newsletter template:', error);
        res.status(500).json({ error: 'Failed to fetch newsletter template' });
    }
});

// POST /api/newsletter/templates - Neues Template erstellen
router.post('/templates', async (req, res) => {
    try {
        const { name, content, htmlContent, previewImage } = req.body;
        
        const template = await prisma.newsletterTemplate.create({
            data: {
                name,
                content: JSON.stringify(content),
                htmlContent,
                previewImage: previewImage || null,
                isActive: true
            }
        });
        
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating newsletter template:', error);
        res.status(500).json({ error: 'Failed to create newsletter template' });
    }
});

// PUT /api/newsletter/templates/:id - Template aktualisieren
router.put('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, htmlContent, previewImage } = req.body;
        
        const template = await prisma.newsletterTemplate.update({
            where: { id },
            data: {
                name,
                content: JSON.stringify(content),
                htmlContent,
                previewImage: previewImage || null
            }
        });
        
        res.json(template);
    } catch (error) {
        console.error('Error updating newsletter template:', error);
        res.status(500).json({ error: 'Failed to update newsletter template' });
    }
});

// DELETE /api/newsletter/templates/:id - Template löschen
router.delete('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.newsletterTemplate.delete({
            where: { id }
        });
        
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting newsletter template:', error);
        res.status(500).json({ error: 'Failed to delete newsletter template' });
    }
});

// GET /api/newsletter/blocks - Vorgefertigte Content-Blöcke
router.get('/blocks', async (req, res) => {
    try {
        const blocks = [
            // ===== HEADER BLOCKS =====
            {
                id: 'header',
                name: 'Header mit Logo',
                category: 'header',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExMjM1NyIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZpbGw9IiNmZmQ0MDEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+TkVPTiBNVVJFUjwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'header',
                    content: {
                        logo: 'https://via.placeholder.com/200x60/112357/ffd401?text=NEON+MURER',
                        tagline: '75 Jahre Lichtwerbung-Expertise'
                    }
                }
            },
            {
                id: 'header-minimal',
                name: 'Minimaler Header',
                category: 'header',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIxMDAiIHk9IjQ1IiBmaWxsPSIjMTEyMzU3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5ORUFOLFNMRVRURURLPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+RGV6ZW1iZXIgMjAyNDwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'header-minimal',
                    content: {
                        title: 'Newsletter',
                        date: 'Dezember 2024'
                    }
                }
            },

            // ===== HERO BLOCKS =====
            {
                id: 'hero',
                name: 'Hero mit Bild',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjxyZWN0IHg9IjIwIiB5PSI2MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2U5ZWNlZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9IiMxMTIzNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+SGVybyBUaXRlbDwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'hero',
                    content: {
                        title: 'Neue Leuchtschriften-Projekte',
                        subtitle: 'Entdecken Sie unsere neuesten Realisierungen',
                        image: 'https://via.placeholder.com/560x300/112357/ffd401?text=Hero+Project+Image',
                        imageAlt: 'Leuchtschriften Projekt'
                    }
                }
            },
            {
                id: 'hero-text',
                name: 'Hero nur Text',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZpbGw9IiMxMTIzNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPldpbnRlci1TcGV6aWFsPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+V2VpaG5hY2h0c2JlbGV1Y2h0dW5nIDIwMjQ8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSI4MCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5Ib2xlbiBTaWUgc2ljaCBJaHJlIE9mZmVydGU8L3RleHQ+PC9zdmc+',
                template: {
                    type: 'hero-text',
                    content: {
                        title: 'Winter-Spezial',
                        subtitle: 'Weihnachtsbeleuchtung 2024',
                        description: 'Holen Sie sich Ihre Offerte für festliche Beleuchtung'
                    }
                }
            },

            // ===== CONTENT BLOCKS =====
            {
                id: 'project-card',
                name: 'Projekt-Karte',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExMjM1NyIvPjx0ZXh0IHg9IjEwMCIgeT0iNjUiIGZpbGw9IiNmZmQ0MDEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+UFJPSkVLVDwvdGV4dD48dGV4dCB4PSIyMCIgeT0iMTMwIiBmaWxsPSIjMTEyMzU3IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5Qcm9qZWt0IFRpdGVsPC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSIxNTAiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+UHJvamVrdCBCZXNjaHJlaWJ1bmc8L3RleHQ+PC9zdmc+',
                template: {
                    type: 'project',
                    content: {
                        title: 'Restaurant Signage',
                        description: 'Moderne LED-Leuchtschrift mit warmweißem Licht für gemütliche Atmosphäre.',
                        image: 'https://via.placeholder.com/560x200/1a2f63/ffd401?text=Projekt+1',
                        imageAlt: 'Restaurant Leuchtschrift'
                    }
                }
            },
            {
                id: 'text-block',
                name: 'Text-Block',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjIwIiB5PSIzMCIgZmlsbD0iIzExMjM1NyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+VGV4dCBCbG9jazwvdGV4dD48dGV4dCB4PSIyMCIgeT0iNTAiIGZpbGw9IiM2NjY2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+TG9yZW0gaXBzdW0gZG9sb3Igc2l0PC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSI2NSIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5hbWV0LCBjb25zZWN0ZXR1cjwvdGV4dD48dGV4dCB4PSIyMCIgeT0iODAiIGZpbGw9IiM2NjY2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+YWRpcGlzY2luZyBlbGl0Li4uPC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSIxMDAiIGZpbGw9IiNmZmQ0MDEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgdGV4dC1kZWNvcmF0aW9uPSJ1bmRlcmxpbmUiPk1laHIgZXJmYWhyZW4gJmd0OzwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'text-block',
                    content: {
                        title: 'Text Block',
                        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        linkText: 'Mehr erfahren',
                        linkUrl: 'https://www.neonmurer.ch'
                    }
                }
            },
            {
                id: 'image-text',
                name: 'Bild + Text',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTEyMzU3Ii8+PHRleHQgeD0iNTAiIHk9IjQ1IiBmaWxsPSIjZmZkNDAxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPklNRzwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjMwIiBmaWxsPSIjMTEyMzU3IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5UaXRlbDwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjQ1IiBmaWxsPSIjNjY2NjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPlRleHQgaW5oYWx0PC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IiM2NjY2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+bWl0IEJpbGQuLi48L3RleHQ+PC9zdmc+',
                template: {
                    type: 'image-text',
                    content: {
                        title: 'Unsere Expertise',
                        text: 'Seit über 75 Jahren entwickeln wir innovative Lichtwerbung-Lösungen für unsere Kunden.',
                        image: 'https://via.placeholder.com/200x150/112357/ffd401?text=Expertise',
                        imageAlt: 'Neon Murer Expertise'
                    }
                }
            },
            {
                id: 'testimonial',
                name: 'Kundenstimme',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjIwIiB5PSIzMCIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXN0eWxlPSJpdGFsaWMiPiLEjUV4emVsbGVudGUgQXJiZWl0Li4uIjwvdGV4dD48dGV4dCB4PSIyMCIgeT0iNDUiIGZpbGw9IiMzMzMzMzMiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC1zdHlsZT0iaXRhbGljIj5TZWhyIHByb2Zlc3Npb25lbGxlPC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSI2MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXN0eWxlPSJpdGFsaWMiPkF1c2bDvGhydW5nLuKAnTwvdGV4dD48dGV4dCB4PSIyMCIgeT0iOTAiIGZpbGw9IiMxMTIzNTciIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9ImJvbGQiPk1hcmN1cyBNw7xsbGVyPC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSIxMDUiIGZpbGw9IiM2NjY2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI5Ij5SZXN0YXVyYW50IE1heGltYWw8L3RleHQ+PC9zdmc+',
                template: {
                    type: 'testimonial',
                    content: {
                        quote: 'Exzellente Arbeit und sehr professionelle Ausführung. Das Ergebnis übertrifft unsere Erwartungen.',
                        author: 'Marcus Müller',
                        company: 'Restaurant Maximal'
                    }
                }
            },
            {
                id: 'service-list',
                name: 'Service-Liste',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZmlsbD0iIzExMjM1NyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+VW5zZXJlIExlaXN0dW5nZW48L3RleHQ+PGNpcmNsZSBjeD0iMzAiIGN5PSI0NSIgcj0iNCIgZmlsbD0iI2ZmZDQwMSIvPjx0ZXh0IHg9IjQwIiB5PSI1MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5MRURCLVZ5eHRyZWE8L3RleHQ+PGNpcmNsZSBjeD0iMzAiIGN5PSI2NSIgcj0iNCIgZmlsbD0iI2ZmZDQwMSIvPjx0ZXh0IHg9IjQwIiB5PSI3MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5OZW9uLVN5c3RlZXI8L3RleHQ+PGNpcmNsZSBjeD0iMzAiIGN5PSI4NSIgcj0iNCIgZmlsbD0iI2ZmZDQwMSIvPjx0ZXh0IHg9IjQwIiB5PSI5MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5EaWdpdGFsZSBBbnplaWdlbjwvdGV4dD48Y2lyY2xlIGN4PSIzMCIgY3k9IjEwNSIgcj0iNCIgZmlsbD0iI2ZmZDQwMSIvPjx0ZXh0IHg9IjQwIiB5PSIxMTAiIGZpbGw9IiMzMzMzMzMiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+UHlsb25lbiAmYW1wOyBTaWduYWxldGlrPC90ZXh0PjwvdXN2Zz4=',
                template: {
                    type: 'service-list',
                    content: {
                        title: 'Unsere Leistungen',
                        services: [
                            'LED-Leuchtschriften',
                            'Neon-Systeme',
                            'Digitale Anzeigen',
                            'Pylonen & Signaletik'
                        ]
                    }
                }
            },
            {
                id: 'news-item',
                name: 'News-Artikel',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTllY2VmIi8+PHRleHQgeD0iMTAwIiB5PSI0NSIgZmlsbD0iIzExMjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIj5ORVdTPC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSI5MCIgZmlsbD0iIzExMjM1NyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+TmV1ZSBQcm9kdWt0bGluaWU8L3RleHQ+PHRleHQgeD0iMjAiIHk9IjEwNSIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5Jbm5vdmF0aXZlIExFRC1Uw4hjaG7Yoa4uLjwvdGV4dD48dGV4dCB4PSIyMCIgeT0iMTIwIiBmaWxsPSIjZmZkNDAxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtZGVjb3JhdGlvbj0idW5kZXJsaW5lIj5XZWl0ZXJsZXNlbiA+PC90ZXh0Pjwvc3ZnPg==',
                template: {
                    type: 'news',
                    content: {
                        title: 'Neue Produktlinie',
                        excerpt: 'Innovative LED-Technologie für energieeffiziente Lichtwerbung',
                        image: 'https://via.placeholder.com/560x200/e9ecef/112357?text=NEWS',
                        linkText: 'Weiterlesen',
                        linkUrl: 'https://www.neonmurer.ch/news'
                    }
                }
            },

            // ===== CTA BLOCKS =====
            {
                id: 'cta',
                name: 'Call-to-Action',
                category: 'cta',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzExMjM1NyIvPjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Q1RBIFRpdGVsPC90ZXh0PjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZmZkNDAxIiByeD0iMTUiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmaWxsPSIjMTEyMzU3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkJ1dHRvbjwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'cta',
                    content: {
                        title: 'Haben Sie ein Lichtwerbung-Projekt?',
                        text: 'Lassen Sie uns gemeinsam Ihre Vision zum Leuchten bringen.',
                        buttonText: 'Jetzt Beratung anfragen',
                        buttonUrl: 'https://www.neonmurer.ch/kontakt'
                    }
                }
            },
            {
                id: 'cta-contact',
                name: 'Kontakt CTA',
                category: 'cta',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2ZmZDQwMSIvPjx0ZXh0IHg9IjEwMCIgeT0iMzUiIGZpbGw9IiMxMTIzNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPktPTlRBS1Q8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSI1NSIgZmlsbD0iIzExMjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj4rNDEgNTUgMjI1IDUwIDI1PC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNzAiIGZpbGw9IiMxMTIzNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+bmVvbkBuZW9ubXVyZXIuY2g8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSI5NSIgZmlsbD0iIzExMjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWRlY29yYXRpb249InVuZGVybGluZSI+VGVybWluIGJ1Y2hlbjwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'cta-contact',
                    content: {
                        title: 'Kontakt aufnehmen',
                        phone: '+41 55 225 50 25',
                        email: 'neon@neonmurer.ch',
                        buttonText: 'Termin buchen',
                        buttonUrl: 'https://www.neonmurer.ch/kontakt'
                    }
                }
            },
            {
                id: 'cta-offer',
                name: 'Angebot CTA',
                category: 'cta',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzI4YTc0NSIvPjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPjIwJSBSQUJBVFQ8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSI1MCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5hdWYgV2VpaG5hY2h0c2JlbGV1Y2h0dW5nPC90ZXh0PjxyZWN0IHg9IjUwIiB5PSI3MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIyNSIgZmlsbD0iI2ZmZDQwMSIgcng9IjEyIi8+PHRleHQgeD0iMTAwIiB5PSI4NyIgZmlsbD0iIzExMjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCI+QW5nZWJvdCBob2xlbjwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'cta-offer',
                    content: {
                        title: '20% RABATT',
                        subtitle: 'auf Weihnachtsbeleuchtung',
                        description: 'Nur bis Ende November 2024',
                        buttonText: 'Angebot holen',
                        buttonUrl: 'https://www.neonmurer.ch/angebot'
                    }
                }
            },

            // ===== SOCIAL & DIVIDER BLOCKS =====
            {
                id: 'social-media',
                name: 'Social Media',
                category: 'social',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjEwMCIgeT0iMjUiIGZpbGw9IiMxMTIzNTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPkZvbGdlbiBTaWUgdW5zPC90ZXh0PjxjaXJjbGUgY3g9IjcwIiBjeT0iNjAiIHI9IjE1IiBmaWxsPSIjMTEyMzU3Ii8+PHRleHQgeD0iNzAiIHk9IjY2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPmY8L3RleHQ+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNjAiIHI9IjE1IiBmaWxsPSIjMTEyMzU3Ii8+PHRleHQgeD0iMTAwIiB5PSI2NiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5pPC90ZXh0PjxjaXJjbGUgY3g9IjEzMCIgY3k9IjYwIiByPSIxNSIgZmlsbD0iIzExMjM1NyIvPjx0ZXh0IHg9IjEzMCIgeT0iNjYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+bDwvdGV4dD48L3N2Zz4=',
                template: {
                    type: 'social',
                    content: {
                        title: 'Folgen Sie uns',
                        platforms: [
                            { name: 'Facebook', url: 'https://facebook.com/neonmurer', icon: 'fab fa-facebook' },
                            { name: 'Instagram', url: 'https://instagram.com/neonmurer', icon: 'fab fa-instagram' },
                            { name: 'LinkedIn', url: 'https://linkedin.com/company/neonmurer', icon: 'fab fa-linkedin' }
                        ]
                    }
                }
            },
            {
                id: 'divider',
                name: 'Trennlinie',
                category: 'divider',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNmZmZmZmYiLz48bGluZSB4MT0iMzAiIHkxPSIyNSIgeDI9IjE3MCIgeTI9IjI1IiBzdHJva2U9IiNkZGRkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
                template: {
                    type: 'divider',
                    content: {
                        style: 'solid',
                        color: '#dddddd'
                    }
                }
            },
            {
                id: 'spacer',
                name: 'Leerraum',
                category: 'divider',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIxMDAiIHk9IjM1IiBmaWxsPSIjY2NjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPkxlZXJyYXVtPC90ZXh0Pjwvc3ZnPg==',
                template: {
                    type: 'spacer',
                    content: {
                        height: '40px'
                    }
                }
            },

            // ===== FOOTER BLOCKS =====
            {
                id: 'footer',
                name: 'Footer mit Kontakt',
                category: 'footer',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExMjM1NyIvPjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9IiNmZmQ0MDEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+Tm9ldCBNdXJlciBBRzwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjUwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPktvbnRha3RkYXRlbjwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjcwIiBmaWxsPSIjZmZkNDAxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCI+QWJtZWxkZW48L3RleHQ+PC9zdmc+',
                template: {
                    type: 'footer',
                    content: {
                        logo: 'https://via.placeholder.com/150x45/ffffff/ffd401?text=NEON+MURER',
                        companyText: 'Seit 1949 Ihr vertrauensvoller Partner für Lichtwerbung',
                        contact: {
                            address: 'Tägernaustrasse 21, 8640 Rapperswil-Jona',
                            phone: '+41 55 225 50 25',
                            email: 'neon@neonmurer.ch',
                            website: 'www.neonmurer.ch'
                        }
                    }
                }
            },
            {
                id: 'footer-minimal',
                name: 'Minimaler Footer',
                category: 'footer',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIxMDAiIHk9IjMwIiBmaWxsPSIjMTEyMzU3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5Ob2V0IE11cmVyIEFHPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNDgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI5Ij7CoSAyMDI0IEFsbGUgUmVjaHRlIHZvcmJlaGFsdGVuPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IiNmZmQ0MDEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiB0ZXh0LWRlY29yYXRpb249InVuZGVybGluZSI+QWJtZWxkZW48L3RleHQ+PC9zdmc+',
                template: {
                    type: 'footer-minimal',
                    content: {
                        companyName: 'Neon Murer AG',
                        copyright: '© 2024 Alle Rechte vorbehalten',
                        unsubscribeText: 'Abmelden'
                    }
                }
            }
        ];
        
        res.json(blocks);
    } catch (error) {
        console.error('Error fetching newsletter blocks:', error);
        res.status(500).json({ error: 'Failed to fetch newsletter blocks' });
    }
});

// POST /api/newsletter/generate-html - HTML aus Template-Daten generieren
router.post('/generate-html', async (req, res) => {
    try {
        const { blocks } = req.body;
        
        let html = generateNewsletterHTML(blocks);
        
        res.json({ html });
    } catch (error) {
        console.error('Error generating newsletter HTML:', error);
        res.status(500).json({ error: 'Failed to generate newsletter HTML' });
    }
});

// HTML-Generator-Funktion
function generateNewsletterHTML(blocks) {
    const baseHTML = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Murer Newsletter</title>
    <style>
        /* Newsletter Styles */
        body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        .nm-primary { background-color: #112357; }
        .nm-accent { background-color: #ffd401; }
        .nm-text-primary { color: #112357; }
        .nm-text-accent { color: #ffd401; }
        .nm-text-white { color: #ffffff; }
        .nm-font-primary { font-family: 'DM Sans', Arial, Helvetica, sans-serif; }
        .nm-font-fallback { font-family: Arial, Helvetica, sans-serif; }
        
        .nm-header { background: linear-gradient(135deg, #112357 0%, #1a2f63 100%); padding: 30px 20px; text-align: center; }
        .nm-logo { max-width: 200px; height: auto; }
        .nm-tagline { color: #ffd401; font-size: 14px; margin: 10px 0 0 0; font-weight: 600; }
        
        .nm-hero { background: #f8f9fa; padding: 40px 20px; text-align: center; }
        .nm-hero-title { color: #112357; font-size: 28px; font-weight: 900; margin: 0 0 15px 0; line-height: 1.2; }
        .nm-hero-subtitle { color: #666666; font-size: 16px; margin: 0 0 25px 0; line-height: 1.4; }
        .nm-hero-image { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(17, 35, 87, 0.15); }
        
        .nm-content { padding: 30px 20px; }
        .nm-project-card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); margin: 0 0 20px 0; overflow: hidden; }
        .nm-project-image { width: 100%; height: auto; display: block; }
        .nm-project-content { padding: 20px; }
        .nm-project-title { color: #112357; font-size: 18px; font-weight: 700; margin: 0 0 10px 0; }
        .nm-project-desc { color: #666666; font-size: 14px; line-height: 1.5; margin: 0; }
        
        .nm-cta { background: linear-gradient(135deg, #112357 0%, #1a2f63 100%); padding: 40px 20px; text-align: center; margin: 30px 0; border-radius: 12px; }
        .nm-cta-title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 15px 0; }
        .nm-cta-text { color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0 0 25px 0; line-height: 1.4; }
        .nm-button { background: linear-gradient(45deg, #ffd401, #ffed4e); color: #112357; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(255, 212, 1, 0.3); }
        
        .nm-footer { background: #112357; padding: 30px 20px; text-align: center; }
        .nm-footer-logo { max-width: 150px; height: auto; margin: 0 0 20px 0; }
        .nm-footer-text { color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.5; margin: 0 0 20px 0; }
        .nm-contact-info { color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0 0 20px 0; }
        .nm-contact-info a { color: #ffd401; text-decoration: none; }
        .nm-unsubscribe { color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 20px 0 0 0; }
        .nm-unsubscribe a { color: #ffd401; text-decoration: underline; }
        
        @media only screen and (max-width: 600px) {
            .nm-hero-title { font-size: 24px; }
            .nm-cta-title { font-size: 20px; }
            .nm-button { padding: 12px 25px; font-size: 14px; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
        <tr>
            <td align="center" valign="top">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">`;
    
    let contentHTML = '';
    
    blocks.forEach(block => {
        switch (block.type) {
            case 'header':
                contentHTML += `
                    <tr>
                        <td class="nm-header">
                            <img src="${block.content.logo}" alt="Neon Murer AG" class="nm-logo nm-font-primary">
                            <p class="nm-tagline nm-font-primary">${block.content.tagline}</p>
                        </td>
                    </tr>`;
                break;
                
            case 'hero':
                contentHTML += `
                    <tr>
                        <td class="nm-hero">
                            <h1 class="nm-hero-title nm-font-primary">${block.content.title}</h1>
                            <p class="nm-hero-subtitle nm-font-fallback">${block.content.subtitle}</p>
                            <img src="${block.content.image}" alt="${block.content.imageAlt}" class="nm-hero-image">
                        </td>
                    </tr>`;
                break;
                
            case 'project':
                contentHTML += `
                    <tr>
                        <td class="nm-content">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="nm-project-card">
                                <tr>
                                    <td>
                                        <img src="${block.content.image}" alt="${block.content.imageAlt}" class="nm-project-image">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="nm-project-content">
                                        <h3 class="nm-project-title nm-font-primary">${block.content.title}</h3>
                                        <p class="nm-project-desc nm-font-fallback">${block.content.description}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;
                break;
                
            case 'cta':
                contentHTML += `
                    <tr>
                        <td class="nm-cta">
                            <h2 class="nm-cta-title nm-font-primary">${block.content.title}</h2>
                            <p class="nm-cta-text nm-font-fallback">${block.content.text}</p>
                            <a href="${block.content.buttonUrl}" class="nm-button nm-font-primary">${block.content.buttonText}</a>
                        </td>
                    </tr>`;
                break;
                
            case 'footer':
                contentHTML += `
                    <tr>
                        <td class="nm-footer">
                            <img src="${block.content.logo}" alt="Neon Murer AG" class="nm-footer-logo">
                            <p class="nm-footer-text nm-font-fallback">${block.content.companyText}</p>
                            <div class="nm-contact-info nm-font-fallback">
                                <strong>Neon Murer AG</strong><br>
                                ${block.content.contact.address}<br>
                                Tel: <a href="tel:${block.content.contact.phone.replace(/\s/g, '')}">${block.content.contact.phone}</a><br>
                                E-Mail: <a href="mailto:${block.content.contact.email}">${block.content.contact.email}</a><br>
                                Web: <a href="https://${block.content.contact.website}">${block.content.contact.website}</a>
                            </div>
                            <p class="nm-unsubscribe nm-font-fallback">
                                <a href="{$unsubscribe_link}">Newsletter abmelden</a> | 
                                <a href="https://www.neonmurer.ch/datenschutz.html">Datenschutz</a> | 
                                <a href="https://www.neonmurer.ch/impressum.html">Impressum</a>
                            </p>
                        </td>
                    </tr>`;
                break;
        }
    });
    
    const endHTML = `
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    
    return baseHTML + contentHTML + endHTML;
}

// ===== NEWSLETTER SUBSCRIPTION ENDPOINTS =====

// POST /api/newsletter/subscribe - Newsletter-Anmeldung
router.post('/subscribe', async (req, res) => {
    try {
        const { email, firstName, lastName, source = 'website' } = req.body;
        
        // Validierung
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ 
                error: 'Email, Vorname und Nachname sind erforderlich' 
            });
        }
        
        // Email-Format prüfen
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Ungültiges Email-Format' 
            });
        }
        
        // Prüfen ob Email bereits existiert
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase() }
        });
        
        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(409).json({ 
                    error: 'Diese Email-Adresse ist bereits für den Newsletter angemeldet' 
                });
            } else {
                // Reaktiviere inaktiven Abonnenten
                const updatedSubscriber = await prisma.newsletterSubscriber.update({
                    where: { email: email.toLowerCase() },
                    data: {
                        firstName,
                        lastName,
                        isActive: true,
                        isConfirmed: true,
                        confirmedAt: new Date(),
                        unsubscribedAt: null,
                        source,
                        ipAddress: req.ip,
                        userAgent: req.get('User-Agent'),
                        updatedAt: new Date()
                    }
                });
                
                return res.json({ 
                    message: 'Newsletter-Anmeldung erfolgreich reaktiviert!',
                    subscriber: {
                        email: updatedSubscriber.email,
                        firstName: updatedSubscriber.firstName,
                        lastName: updatedSubscriber.lastName
                    }
                });
            }
        }
        
        // Neuen Abonnenten erstellen
        const newSubscriber = await prisma.newsletterSubscriber.create({
            data: {
                email: email.toLowerCase(),
                firstName,
                lastName,
                isActive: true,
                isConfirmed: true,
                confirmedAt: new Date(),
                source,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                segments: ['general'] // Default-Segment
            }
        });
        
        res.status(201).json({ 
            message: 'Newsletter-Anmeldung erfolgreich!',
            subscriber: {
                email: newSubscriber.email,
                firstName: newSubscriber.firstName,
                lastName: newSubscriber.lastName
            }
        });
        
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ error: 'Fehler bei der Newsletter-Anmeldung' });
    }
});

// GET /api/newsletter/subscribers - Alle aktiven Abonnenten abrufen (für CMS)
router.get('/subscribers', async (req, res) => {
    try {
        const { page = 1, limit = 50, search, status = 'active' } = req.query;
        
        const where = {};
        
        // Status-Filter
        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }
        
        // Such-Filter
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    isConfirmed: true,
                    source: true,
                    segments: true,
                    subscribedAt: true,
                    confirmedAt: true,
                    unsubscribedAt: true,
                    createdAt: true
                }
            }),
            prisma.newsletterSubscriber.count({ where })
        ]);
        
        res.json({
            subscribers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Abonnenten' });
    }
});

// GET /api/newsletter/subscribers/export - CSV-Export der Abonnenten
router.get('/subscribers/export', async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        
        const where = {};
        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }
        
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                email: true,
                firstName: true,
                lastName: true,
                source: true,
                segments: true,
                subscribedAt: true,
                confirmedAt: true
            }
        });
        
        // CSV-Format: EMAIL,VORNAME,NACHNAME
        const csvHeader = 'EMAIL,VORNAME,NACHNAME,QUELLE,SEGMENTE,ANMELDEDATUM\n';
        const csvData = subscribers.map(sub => 
            `"${sub.email}","${sub.firstName}","${sub.lastName}","${sub.source || ''}","${sub.segments.join(';')}","${sub.subscribedAt.toISOString().split('T')[0]}"`
        ).join('\n');
        
        const csv = csvHeader + csvData;
        
        // CSV-Download-Headers setzen
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=newsletter_abonnenten_${new Date().toISOString().split('T')[0]}.csv`);
        
        res.send(csv);
        
    } catch (error) {
        console.error('Error exporting newsletter subscribers:', error);
        res.status(500).json({ error: 'Fehler beim Exportieren der Abonnenten' });
    }
});

// DELETE /api/newsletter/subscribers/:id - Abonnent löschen
router.delete('/subscribers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.newsletterSubscriber.delete({
            where: { id }
        });
        
        res.json({ message: 'Abonnent erfolgreich gelöscht' });
        
    } catch (error) {
        console.error('Error deleting newsletter subscriber:', error);
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Abonnent nicht gefunden' });
        } else {
            res.status(500).json({ error: 'Fehler beim Löschen des Abonnenten' });
        }
    }
});

// POST /api/newsletter/unsubscribe - Abmeldung vom Newsletter
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email-Adresse ist erforderlich' });
        }
        
        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase() }
        });
        
        if (!subscriber) {
            return res.status(404).json({ error: 'Email-Adresse nicht gefunden' });
        }
        
        if (!subscriber.isActive) {
            return res.json({ message: 'Sie sind bereits vom Newsletter abgemeldet' });
        }
        
        await prisma.newsletterSubscriber.update({
            where: { email: email.toLowerCase() },
            data: {
                isActive: false,
                unsubscribedAt: new Date()
            }
        });
        
        res.json({ message: 'Sie wurden erfolgreich vom Newsletter abgemeldet' });
        
    } catch (error) {
        console.error('Error unsubscribing from newsletter:', error);
        res.status(500).json({ error: 'Fehler bei der Newsletter-Abmeldung' });
    }
});

module.exports = router;