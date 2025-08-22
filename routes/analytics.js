const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const UAParser = require('ua-parser-js');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper Functions
function hashIP(ip) {
    return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').substring(0, 16);
}

function generateSessionId() {
    return crypto.randomUUID();
}

function parseUserAgent(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        device: result.device.type || (result.os.name?.includes('Mobile') ? 'mobile' : 'desktop')
    };
}

// Get country from IP using findip.net API
async function getCountryFromIP(ip) {
    // For localhost/private IPs, return Switzerland (development)
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return 'Schweiz';
    }
    
    try {
        const https = require('https');
        const url = `https://api.findip.net/${ip}/?token=b794f4870a6d4d8bb4d79c275f4b1215`;
        
        return new Promise((resolve, reject) => {
            const request = https.get(url, (response) => {
                let data = '';
                
                response.on('data', chunk => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        
                        // Check if we got a valid response
                        if (result && result.country && result.country.names) {
                            // Prefer German name, fallback to English with translation
                            if (result.country.names.de) {
                                const germanName = result.country.names.de;
                                // Normalize common variations
                                if (germanName === 'Vereinigte Staaten von Amerika') {
                                    resolve('USA');
                                } else {
                                    resolve(germanName);
                                }
                            } else if (result.country.names.en) {
                                resolve(translateCountryName(result.country.names.en));
                            } else {
                                resolve(null);
                            }
                        } else {
                            resolve(null);
                        }
                    } catch (parseError) {
                        console.error('Error parsing geolocation response:', parseError);
                        resolve(null);
                    }
                });
            });
            
            request.on('error', (error) => {
                console.error('Error fetching geolocation:', error);
                resolve(null);
            });
            
            // Set timeout for the request
            request.setTimeout(5000, () => {
                request.destroy();
                resolve(null);
            });
        });
    } catch (error) {
        console.error('Error in getCountryFromIP:', error);
        return null;
    }
}

// Helper function to translate common English country names to German
function translateCountryName(englishName) {
    const translations = {
        'Switzerland': 'Schweiz',
        'Germany': 'Deutschland',
        'Austria': 'Österreich',
        'France': 'Frankreich',
        'Italy': 'Italien',
        'United States': 'USA',
        'United States of America': 'USA',
        'United Kingdom': 'Vereinigtes Königreich',
        'Netherlands': 'Niederlande',
        'Belgium': 'Belgien',
        'Spain': 'Spanien',
        'Sweden': 'Schweden',
        'Norway': 'Norwegen',
        'Denmark': 'Dänemark',
        'Finland': 'Finnland',
        'Poland': 'Polen',
        'Czech Republic': 'Tschechien',
        'Hungary': 'Ungarn',
        'Portugal': 'Portugal',
        'Canada': 'Kanada',
        'Australia': 'Australien',
        'Japan': 'Japan',
        'China': 'China',
        'India': 'Indien',
        'Brazil': 'Brasilien',
        'Argentina': 'Argentinien',
        'Mexico': 'Mexiko',
        'Turkey': 'Türkei',
        'Russia': 'Russland',
        'South Africa': 'Südafrika'
    };
    
    return translations[englishName] || englishName;
}

// Alternative: Get country from request headers (if available)
function getCountryFromHeaders(req) {
    // Check for CloudFlare country header
    if (req.headers['cf-ipcountry']) {
        const countryCode = req.headers['cf-ipcountry'].toUpperCase();
        return countryCodeToName(countryCode);
    }
    
    // Check for other common geolocation headers
    if (req.headers['x-country-code']) {
        const countryCode = req.headers['x-country-code'].toUpperCase();
        return countryCodeToName(countryCode);
    }
    
    return null;
}

function countryCodeToName(code) {
    const countryMap = {
        'CH': 'Schweiz',
        'DE': 'Deutschland',
        'AT': 'Österreich', 
        'FR': 'Frankreich',
        'IT': 'Italien',
        'US': 'USA',
        'GB': 'Vereinigtes Königreich',
        'UK': 'Vereinigtes Königreich',
        'NL': 'Niederlande',
        'BE': 'Belgien',
        'ES': 'Spanien',
        'SE': 'Schweden',
        'NO': 'Norwegen',
        'DK': 'Dänemark',
        'FI': 'Finnland',
        'PL': 'Polen',
        'CZ': 'Tschechien',
        'HU': 'Ungarn',
        'PT': 'Portugal',
        'CA': 'Kanada',
        'AU': 'Australien',
        'JP': 'Japan',
        'CN': 'China',
        'IN': 'Indien',
        'BR': 'Brasilien',
        'AR': 'Argentinien',
        'MX': 'Mexiko',
        'TR': 'Türkei',
        'RU': 'Russland',
        'ZA': 'Südafrika'
    };
    
    return countryMap[code] || null;
}

function detectBot(userAgent) {
    const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /crawling/i, /googlebot/i, 
        /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
        /yandexbot/i, /facebookexternalhit/i, /twitterbot/i, 
        /linkedinbot/i, /whatsapp/i, /telegram/i
    ];
    return botPatterns.some(pattern => pattern.test(userAgent));
}

function getPageTitle(path) {
    // Convert path to readable title
    const pathTitles = {
        '/': 'Homepage',
        '/lichtwerbung': 'Lichtwerbung',
        '/lichtwerbung/leuchtschriften': 'LED Leuchtschriften',
        '/lichtwerbung/leuchttransparente': 'Leuchttransparente',
        '/lichtwerbung/neon-led-technik': 'Neon & LED Technik',
        '/lichtwerbung/pylonen': 'Pylonen',
        '/lichtwerbung/halbrelief-plattenschriften': 'Halbrelief Plattenschriften',
        '/beschriftungen': 'Beschriftungen',
        '/beschriftungen/fahrzeugbeschriftung': 'Fahrzeugbeschriftung',
        '/beschriftungen/fensterbeschriftung': 'Fensterbeschriftung',
        '/beschriftungen/grossformatdruck': 'Grossformatdruck',
        '/beschriftungen/signaletik': 'Signaletik',
        '/beschriftungen/tafelbeschriftung': 'Tafelbeschriftung',
        '/beschriftungen/blachen-fahnen': 'Blachen & Fahnen',
        '/digital-signage': 'Digital Signage',
        '/dienstleistungen': 'Dienstleistungen',
        '/neon-murer/fachkompetenzen': 'Fachkompetenzen',
        '/neon-murer/firmengeschichte': 'Firmengeschichte',
        '/neon-murer/kontaktpersonen': 'Kontaktpersonen',
        '/neon-murer/stellenangebote': 'Stellenangebote',
        '/neon-murer/news': 'News',
        '/impressum': 'Impressum',
        '/datenschutz': 'Datenschutz',
        '/geschaeftsbedingungen': 'Geschäftsbedingungen'
    };
    
    return pathTitles[path] || path.replace(/^\//, '').replace(/\//g, ' › ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unbekannte Seite';
}

// ========== TRACKING ENDPOINTS ==========

// GET /api/analytics/test - Simple test endpoint
router.get('/test', async (req, res) => {
    try {
        res.json({ 
            status: 'OK',
            message: 'Analytics API is working',
            timestamp: new Date().toISOString(),
            prisma: !!prisma
        });
    } catch (error) {
        console.error('Analytics test error:', error);
        res.status(500).json({ 
            error: 'Analytics test failed',
            message: error.message
        });
    }
});

// GET /api/analytics/db-test - Database connection test
router.get('/db-test', async (req, res) => {
    try {
        // Try a simple database query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        res.json({ 
            status: 'OK',
            message: 'Database connection working',
            result: result
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ 
            error: 'Database test failed',
            message: error.message,
            stack: error.stack
        });
    }
});

// GET /api/analytics/simple-dashboard - Simple dashboard test
router.get('/simple-dashboard', async (req, res) => {
    try {
        // Simple queries one by one
        const totalSessions = await prisma.analyticsSession.count();
        const totalPageViews = await prisma.pageView.count();
        
        res.json({ 
            status: 'OK',
            message: 'Simple dashboard working',
            data: {
                totalSessions,
                totalPageViews
            }
        });
    } catch (error) {
        console.error('Simple dashboard error:', error);
        res.status(500).json({ 
            error: 'Simple dashboard failed',
            message: error.message,
            code: error.code
        });
    }
});

// GET /api/analytics/model-test - Test Prisma models
router.get('/model-test', async (req, res) => {
    try {
        // Try to access analytics models through Prisma
        const sessionCount = await prisma.analyticsSession.count();
        
        res.json({ 
            status: 'OK',
            message: 'Prisma models working',
            sessionCount: sessionCount
        });
    } catch (error) {
        console.error('Model test error:', error);
        res.status(500).json({ 
            error: 'Model test failed',
            message: error.message,
            code: error.code,
            stack: error.stack
        });
    }
});

// GET /api/analytics/tables-test - Check if analytics tables exist
router.get('/tables-test', async (req, res) => {
    try {
        // Check if analytics tables exist
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'analytics%'
        `;
        
        res.json({ 
            status: 'OK',
            message: 'Analytics tables check',
            tables: tables
        });
    } catch (error) {
        console.error('Tables test error:', error);
        res.status(500).json({ 
            error: 'Tables test failed',
            message: error.message,
            stack: error.stack
        });
    }
});

// POST /api/analytics/track - Main tracking endpoint
router.post('/track', async (req, res) => {
    try {
        const {
            sessionId: clientSessionId,
            path,
            title,
            referrer,
            loadTime,
            screenResolution,
            language,
            utmSource,
            utmMedium,
            utmCampaign
        } = req.body;

        const userAgent = req.headers['user-agent'] || '';
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
        const ipHash = hashIP(clientIP);
        
        // Skip if bot
        if (detectBot(userAgent)) {
            return res.status(200).json({ success: true, message: 'Bot detected, not tracked' });
        }

        // Parse user agent
        const { browser, os, device } = parseUserAgent(userAgent);
        
        // Get country information
        let country = getCountryFromHeaders(req);
        if (!country) {
            country = await getCountryFromIP(clientIP);
        }
        console.log(`📍 Country detection for IP ${clientIP}: ${country || 'Unknown'}`);
        

        // Get or create session
        let sessionId = clientSessionId;
        let session = null;

        if (sessionId) {
            session = await prisma.analyticsSession.findUnique({
                where: { sessionId }
            });
        }

        if (!session) {
            sessionId = generateSessionId();
            session = await prisma.analyticsSession.create({
                data: {
                    sessionId,
                    ipHash,
                    userAgent,
                    device,
                    browser,
                    os,
                    country, // Add country information
                    referrer,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                    language,
                    screenResolution,
                    isBot: false,
                    totalPageViews: 1
                }
            });
        } else {
            // Update existing session
            const updateData = {
                lastActivity: new Date(),
                totalPageViews: { increment: 1 }
            };
            
            // If session doesn't have country info yet, add it
            if (!session.country && country) {
                updateData.country = country;
                console.log(`📍 Updated existing session ${sessionId} with country: ${country}`);
            }
            
            await prisma.analyticsSession.update({
                where: { sessionId },
                data: updateData
            });
        }

        // Create page view
        await prisma.pageView.create({
            data: {
                sessionId,
                path,
                title,
                loadTime,
                timestamp: new Date()
            }
        });

        res.json({ 
            success: true, 
            sessionId,
            message: 'Page view tracked successfully'
        });

    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ error: 'Failed to track analytics' });
    }
});

// POST /api/analytics/event - Track events (conversions, clicks, etc.)
router.post('/event', async (req, res) => {
    try {
        const { sessionId, eventType, eventValue, path } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // Create event
        await prisma.analyticsEvent.create({
            data: {
                sessionId,
                eventType,
                eventValue,
                path,
                timestamp: new Date()
            }
        });

        // Mark session as converted if it's a conversion event
        const conversionEvents = ['contact_form', 'phone_click', 'email_click'];
        if (conversionEvents.includes(eventType)) {
            await prisma.analyticsSession.update({
                where: { sessionId },
                data: { converted: true }
            });
        }

        res.json({ success: true, message: 'Event tracked successfully' });

    } catch (error) {
        console.error('Event tracking error:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

// POST/PUT /api/analytics/page-exit - Update page view when user leaves  
router.post('/page-exit', async (req, res) => {
    try {
        const { sessionId, path, timeOnPage, scrollDepth } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // Find the most recent page view for this session and path
        const pageView = await prisma.pageView.findFirst({
            where: { sessionId, path },
            orderBy: { timestamp: 'desc' }
        });

        if (pageView) {
            await prisma.pageView.update({
                where: { id: pageView.id },
                data: {
                    timeOnPage,
                    scrollDepth,
                    exitPage: true
                }
            });

            // Update session total duration
            await prisma.analyticsSession.update({
                where: { sessionId },
                data: {
                    totalDuration: { increment: timeOnPage },
                    // Mark as bounced if only 1 page and < 30 seconds
                    bounced: pageView.timeOnPage < 30 && await checkIfSinglePageSession(sessionId)
                }
            });
        }

        res.json({ success: true, message: 'Page exit tracked successfully' });

    } catch (error) {
        console.error('Page exit tracking error:', error);
        res.status(500).json({ error: 'Failed to track page exit' });
    }
});

// Also support PUT for backward compatibility
router.put('/page-exit', async (req, res) => {
    try {
        const { sessionId, path, timeOnPage, scrollDepth } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // Find the most recent page view for this session and path
        const pageView = await prisma.pageView.findFirst({
            where: { sessionId, path },
            orderBy: { timestamp: 'desc' }
        });

        if (pageView) {
            await prisma.pageView.update({
                where: { id: pageView.id },
                data: {
                    timeOnPage,
                    scrollDepth,
                    exitPage: true
                }
            });

            // Update session total duration
            await prisma.analyticsSession.update({
                where: { sessionId },
                data: {
                    totalDuration: { increment: timeOnPage },
                    // Mark as bounced if only 1 page and < 30 seconds
                    bounced: pageView.timeOnPage < 30 && await checkIfSinglePageSession(sessionId)
                }
            });
        }

        res.json({ success: true, message: 'Page exit tracked successfully' });

    } catch (error) {
        console.error('Page exit tracking error:', error);
        res.status(500).json({ error: 'Failed to track page exit' });
    }
});

// Helper function
async function checkIfSinglePageSession(sessionId) {
    const pageCount = await prisma.pageView.count({
        where: { sessionId }
    });
    return pageCount === 1;
}

// ========== DASHBOARD DATA ENDPOINTS ==========

// GET /api/analytics/dashboard - Main dashboard data (NO AUTH required for analytics)
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        console.log('📊 Dashboard endpoint called with query:', req.query);
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        
        console.log('📊 Calculating date range for period:', period);

        // Calculate date range
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        console.log('📊 Starting queries with startDate:', startDate);
        
        // Try simple queries first
        const totalPageViews = await prisma.pageView.count({
            where: { timestamp: { gte: startDate } }
        });
        console.log('📊 Total page views:', totalPageViews);
        
        const uniqueVisitors = await prisma.analyticsSession.count({
            where: { firstVisit: { gte: startDate } }
        });
        console.log('📊 Unique visitors:', uniqueVisitors);
        
        // Try basic aggregation
        const avgSessionDuration = await prisma.analyticsSession.aggregate({
            where: { firstVisit: { gte: startDate } },
            _avg: { totalDuration: true }
        });
        console.log('📊 Avg session duration:', avgSessionDuration);
        
        // Get top pages with real data
        let topPages = [];
        try {
            const topPagesData = await prisma.pageView.groupBy({
                by: ['path'],
                where: { timestamp: { gte: startDate } },
                _count: { path: true },
                orderBy: { _count: { path: 'desc' } },
                take: 10
            });
            
            topPages = topPagesData.map(item => ({
                page: item.path,
                views: item._count.path,
                title: getPageTitle(item.path)
            }));
            console.log('📊 Top pages loaded:', topPages.length);
            
        } catch (topPagesError) {
            console.warn('📊 Could not load top pages:', topPagesError.message);
            topPages = [];
        }

        // Calculate device breakdown
        let deviceBreakdown = { desktop: 50, mobile: 50 };
        try {
            const deviceData = await prisma.analyticsSession.groupBy({
                by: ['device'],
                where: { firstVisit: { gte: startDate } },
                _count: { device: true }
            });
            
            const totalDevices = deviceData.reduce((sum, item) => sum + item._count.device, 0);
            if (totalDevices > 0) {
                deviceBreakdown = {};
                deviceData.forEach(item => {
                    const percentage = Math.round((item._count.device / totalDevices) * 100);
                    deviceBreakdown[item.device || 'unknown'] = percentage;
                });
            }
            console.log('📊 Device breakdown:', deviceBreakdown);
            
        } catch (deviceError) {
            console.warn('📊 Could not load device breakdown:', deviceError.message);
        }

        // Generate trend data based on period
        let trendData = [];
        let trendLabel = 'weeklyTrend';
        
        if (period === 'week' || period === 'today') {
            // Generate daily trend data (last 7 days)
            trendLabel = 'weeklyTrend';
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                
                try {
                    const dayViews = await prisma.pageView.count({
                        where: {
                            timestamp: {
                                gte: dayStart,
                                lt: dayEnd
                            }
                        }
                    });
                    
                    // Get unique visitors (sessions) for this day
                    const dayVisitors = await prisma.analyticsSession.count({
                        where: {
                            firstVisit: {
                                gte: dayStart,
                                lt: dayEnd
                            }
                        }
                    });
                    
                    const dayName = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()];
                    trendData.push({
                        day: dayName,
                        visitors: dayVisitors,  // Real unique visitors
                        pageViews: dayViews,    // Real page views
                        date: dayStart.toISOString().split('T')[0]
                    });
                } catch (error) {
                    console.warn('📊 Error loading day data for', date, error.message);
                    const dayName = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()];
                    trendData.push({
                        day: dayName,
                        visitors: 0,
                        pageViews: 0,
                        date: dayStart.toISOString().split('T')[0]
                    });
                }
            }
        } else if (period === 'month') {
            // Generate weekly trend data (last 4 weeks)
            trendLabel = 'monthlyTrend';
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
                weekStart.setHours(0, 0, 0, 0);
                
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                
                try {
                    const weekViews = await prisma.pageView.count({
                        where: {
                            timestamp: {
                                gte: weekStart,
                                lt: weekEnd
                            }
                        }
                    });
                    
                    const weekVisitors = await prisma.analyticsSession.count({
                        where: {
                            firstVisit: {
                                gte: weekStart,
                                lt: weekEnd
                            }
                        }
                    });
                    
                    const weekLabel = `KW ${Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7)}`;
                    trendData.push({
                        day: weekLabel,
                        visitors: weekVisitors,
                        pageViews: weekViews,
                        date: weekStart.toISOString().split('T')[0]
                    });
                } catch (error) {
                    console.warn('📊 Error loading week data for', weekStart, error.message);
                    const weekLabel = `KW ${Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7)}`;
                    trendData.push({
                        day: weekLabel,
                        visitors: 0,
                        pageViews: 0,
                        date: weekStart.toISOString().split('T')[0]
                    });
                }
            }
        } else if (period === 'quarter' || period === 'year') {
            // Generate monthly trend data (last 3 months for quarter, 12 for year)
            trendLabel = 'quarterlyTrend';
            const monthsBack = period === 'year' ? 11 : 2;
            
            for (let i = monthsBack; i >= 0; i--) {
                const monthStart = new Date();
                monthStart.setMonth(monthStart.getMonth() - i, 1);
                monthStart.setHours(0, 0, 0, 0);
                
                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1);
                
                try {
                    const monthViews = await prisma.pageView.count({
                        where: {
                            timestamp: {
                                gte: monthStart,
                                lt: monthEnd
                            }
                        }
                    });
                    
                    const monthVisitors = await prisma.analyticsSession.count({
                        where: {
                            firstVisit: {
                                gte: monthStart,
                                lt: monthEnd
                            }
                        }
                    });
                    
                    const monthLabel = monthStart.toLocaleDateString('de-DE', { month: 'short' });
                    trendData.push({
                        day: monthLabel,
                        visitors: monthVisitors,
                        pageViews: monthViews,
                        date: monthStart.toISOString().split('T')[0]
                    });
                } catch (error) {
                    console.warn('📊 Error loading month data for', monthStart, error.message);
                    const monthLabel = monthStart.toLocaleDateString('de-DE', { month: 'short' });
                    trendData.push({
                        day: monthLabel,
                        visitors: 0,
                        pageViews: 0,
                        date: monthStart.toISOString().split('T')[0]
                    });
                }
            }
        }
        
        console.log(`📊 Generated ${trendLabel} with ${trendData.length} data points for period: ${period}`);
        
        // Get real traffic sources data from database
        let trafficSources = [];
        try {
            console.log('📊 Loading real referrer data...');
            
            // Get all referrers and UTM sources from sessions in the period
            const referrerData = await prisma.analyticsSession.groupBy({
                by: ['referrer'],
                where: { 
                    firstVisit: { gte: startDate },
                    referrer: { not: null }
                },
                _count: { referrer: true },
                orderBy: { _count: { referrer: 'desc' } },
                take: 20
            });
            
            console.log('📊 Referrer data loaded:', referrerData.length, 'sources');
            
            // Categorize referrers into traffic source types
            const categorizedSources = {};
            let totalReferrerSessions = 0;
            
            referrerData.forEach(item => {
                const referrer = item.referrer?.toLowerCase() || '';
                const count = item._count.referrer;
                totalReferrerSessions += count;
                
                let category = 'Andere';
                
                // Categorize based on referrer domain
                if (referrer.includes('google.') || referrer.includes('bing.') || referrer.includes('duckduckgo.') || referrer.includes('yahoo.')) {
                    category = 'Suchmaschinen';
                } else if (referrer.includes('facebook.') || referrer.includes('instagram.') || referrer.includes('twitter.') || referrer.includes('linkedin.') || referrer.includes('youtube.')) {
                    category = 'Social Media';
                } else if (referrer === '' || referrer === 'direct' || referrer === 'null') {
                    category = 'Direkt';
                } else if (referrer.includes('.ch') || referrer.includes('.com') || referrer.includes('.de')) {
                    category = 'Referrals';
                }
                
                if (!categorizedSources[category]) {
                    categorizedSources[category] = 0;
                }
                categorizedSources[category] += count;
            });
            
            // Calculate sessions without referrer (direct traffic)
            const directSessions = uniqueVisitors - totalReferrerSessions;
            if (directSessions > 0) {
                categorizedSources['Direkt'] = (categorizedSources['Direkt'] || 0) + directSessions;
                totalReferrerSessions += directSessions;
            }
            
            // Convert to percentage format
            trafficSources = Object.entries(categorizedSources)
                .map(([source, count]) => ({
                    source,
                    percentage: Math.round((count / Math.max(totalReferrerSessions, 1)) * 100),
                    visitors: count
                }))
                .sort((a, b) => b.visitors - a.visitors)
                .slice(0, 6); // Top 6 sources
            
            console.log('📊 Categorized traffic sources:', trafficSources);
            
        } catch (referrerError) {
            console.warn('📊 Could not load real referrer data:', referrerError.message);
            
            // Fallback to estimated data if database query fails
            trafficSources = [
                { source: 'Direkt', percentage: 85, visitors: Math.floor(uniqueVisitors * 0.85) },
                { source: 'Suchmaschinen', percentage: 10, visitors: Math.floor(uniqueVisitors * 0.10) },
                { source: 'Andere', percentage: 5, visitors: Math.floor(uniqueVisitors * 0.05) }
            ];
            console.log('📊 Using fallback traffic sources');
        }

        // Get country statistics
        let countryStats = [];
        try {
            console.log('📊 Loading country statistics...');
            
            const countryData = await prisma.analyticsSession.groupBy({
                by: ['country'],
                where: { 
                    firstVisit: { gte: startDate },
                    country: { not: null }
                },
                _count: { country: true },
                orderBy: { _count: { country: 'desc' } },
                take: 10
            });
            
            console.log('📊 Country data loaded:', countryData.length, 'countries');
            
            const totalCountrySessions = countryData.reduce((sum, item) => sum + item._count.country, 0);
            const unknownSessions = uniqueVisitors - totalCountrySessions;
            
            countryStats = countryData.map(item => ({
                country: item.country || 'Unbekannt',
                visitors: item._count.country,
                percentage: Math.round((item._count.country / Math.max(uniqueVisitors, 1)) * 100)
            }));
            
            // Add unknown countries if any
            if (unknownSessions > 0) {
                countryStats.push({
                    country: 'Unbekannt',
                    visitors: unknownSessions,
                    percentage: Math.round((unknownSessions / Math.max(uniqueVisitors, 1)) * 100)
                });
            }
            
            // Sort by visitors descending
            countryStats.sort((a, b) => b.visitors - a.visitors);
            
            console.log('📊 Country statistics:', countryStats);
            
        } catch (countryError) {
            console.warn('📊 Could not load country statistics:', countryError.message);
            
            // Fallback to estimated data
            countryStats = [
                { country: 'Schweiz', visitors: Math.floor(uniqueVisitors * 0.70), percentage: 70 },
                { country: 'Deutschland', visitors: Math.floor(uniqueVisitors * 0.15), percentage: 15 },
                { country: 'Österreich', visitors: Math.floor(uniqueVisitors * 0.08), percentage: 8 },
                { country: 'Andere', visitors: Math.floor(uniqueVisitors * 0.07), percentage: 7 }
            ];
            console.log('📊 Using fallback country statistics');
        }
        
        // Format duration as MM:SS
        const avgDurationSeconds = Math.round(avgSessionDuration._avg.totalDuration || 154);
        const minutes = Math.floor(avgDurationSeconds / 60);
        const seconds = avgDurationSeconds % 60;
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Format mobile percentage
        const mobilePercent = deviceBreakdown.mobile || 50;
        const formattedMobileRatio = `${mobilePercent}%`;

        const dashboardData = {
            kpis: {
                // Original fields for backward compatibility
                totalPageViews,
                uniqueVisitors,
                avgSessionDuration: avgDurationSeconds,
                bounceRate: 0,
                conversionRate: 0,
                mobilePercentage: mobilePercent,
                topPagesCount: topPages.length,
                
                // New fields for extended analytics UI
                pageViews: totalPageViews,
                avgDuration: formattedDuration,
                mobileRatio: formattedMobileRatio,
                
                trends: {
                    pageViews: 0,
                    visitors: 0
                }
            },
            charts: {
                dailyPageViews: {},
                deviceBreakdown,
                topPages,
                topReferrers: [],
                weeklyTrend: trendLabel === 'weeklyTrend' ? trendData : [],
                monthlyTrend: trendLabel === 'monthlyTrend' ? trendData : [],
                quarterlyTrend: trendLabel === 'quarterlyTrend' ? trendData : [],
                currentTrend: trendData, // Always include current trend data
                trendType: trendLabel,   // Indicate which trend type is being returned
                trafficSources,
                countryStats
            }
        };

        // Return the simple dashboard data
        console.log('📊 Returning dashboard data:', dashboardData);

        res.json(dashboardData);

    } catch (error) {
        console.error('📊 Dashboard data error:', error);
        console.error('📊 Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to get dashboard data',
            details: error.message,
            code: error.code
        });
    }
});

// GET /api/analytics/realtime - Real-time analytics
router.get('/realtime', authenticateToken, async (req, res) => {
    try {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const lastHour = new Date(Date.now() - 60 * 60 * 1000);
        const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);

        const [
            activeNow,
            last24HoursViews,
            lastHourViews,
            recentPages
        ] = await Promise.all([
            // Active users (sessions with activity in last 5 minutes)
            prisma.analyticsSession.count({
                where: { lastActivity: { gte: last5Minutes } }
            }),
            
            // Page views in last 24 hours
            prisma.pageView.count({
                where: { timestamp: { gte: last24Hours } }
            }),
            
            // Page views in last hour
            prisma.pageView.count({
                where: { timestamp: { gte: lastHour } }
            }),
            
            // Recent page views
            prisma.pageView.findMany({
                where: { timestamp: { gte: lastHour } },
                orderBy: { timestamp: 'desc' },
                take: 25,
                select: {
                    path: true,
                    title: true,
                    timestamp: true,
                    session: {
                        select: {
                            country: true,
                            device: true,
                            referrer: true
                        }
                    }
                }
            })
        ]);

        res.json({
            activeNow,
            last24HoursViews,
            lastHourViews,
            recentPages
        });

    } catch (error) {
        console.error('Realtime analytics error:', error);
        res.status(500).json({ error: 'Failed to get realtime data' });
    }
});

// GET /api/analytics/export - Export analytics data
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const { format = 'json', period = 'month' } = req.query;
        
        // Get date range (similar to dashboard)
        const now = new Date();
        let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const sessions = await prisma.analyticsSession.findMany({
            where: { firstVisit: { gte: startDate } },
            include: {
                pageViews: true
            }
        });

        if (format === 'csv') {
            // Convert to CSV
            const csvData = sessions.map(session => ({
                sessionId: session.sessionId,
                firstVisit: session.firstVisit,
                device: session.device,
                browser: session.browser,
                country: session.country,
                pageViews: session.totalPageViews,
                duration: session.totalDuration,
                bounced: session.bounced,
                converted: session.converted
            }));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
            
            // Simple CSV conversion (in production, use proper CSV library)
            const csvHeader = Object.keys(csvData[0] || {}).join(',');
            const csvRows = csvData.map(row => Object.values(row).join(','));
            const csv = [csvHeader, ...csvRows].join('\n');
            
            res.send(csv);
        } else {
            res.json(sessions);
        }

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// GET /api/analytics/stats - Basic analytics statistics
router.get('/stats', authenticateToken, async (req, res) => {
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