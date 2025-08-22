// Add stats endpoint to analytics routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/analytics/stats - Basic analytics statistics
router.get('/stats', async (req, res) => {
    try {
        const totalPageViews = await prisma.pageView.count();
        const totalSessions = await prisma.analyticsSession.count();
        
        res.json({
            totalPageViews,
            totalSessions,
            success: true
        });
    } catch (error) {
        console.error('Analytics stats error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch analytics stats',
            success: false 
        });
    }
});

module.exports = router;