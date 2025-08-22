/*!
 * Neon Murer Analytics Tracker
 * DSGVO-konform, lightweight, real-time tracking
 * Version: 1.0.0
 */

class NeonAnalyticsTracker {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.startTime = Date.now();
        this.currentPage = window.location.pathname;
        this.pageTitle = document.title;
        this.loadTime = null;
        this.scrollDepth = 0;
        this.timeOnPage = 0;
        this.isExiting = false;

        // Initialize tracking
        this.init();
    }

    // Initialize tracking system
    init() {
        // Prüfe Cookie-Zustimmung
        if (!this.hasAnalyticsConsent()) {
            neonLog('📊 Analytics waiting for cookie consent');
            // Warte auf Cookie-Zustimmung
            this.waitForConsent();
            return;
        }

        // Track page load
        this.trackPageLoad();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Track page view
        this.trackPageView();

        neonLog('📊 Neon Analytics initialized - Session:', this.sessionId);
    }

    // Prüfe ob Analytics-Cookies zugestimmt wurde
    hasAnalyticsConsent() {
        try {
            const consent = localStorage.getItem('neon_cookie_consent');
            if (!consent) return false;
            
            const consentData = JSON.parse(consent);
            return consentData.analytics === true;
        } catch (e) {
            return false;
        }
    }

    // Warte auf Cookie-Zustimmung
    waitForConsent() {
        const checkConsent = () => {
            if (this.hasAnalyticsConsent()) {
                neonLog('📊 Analytics consent granted - initializing tracking');
                this.trackPageLoad();
                this.setupEventListeners();
                this.trackPageView();
            } else {
                // Prüfe alle 1000ms erneut
                setTimeout(checkConsent, 1000);
            }
        };
        
        checkConsent();
    }

    // Get or create session ID
    getOrCreateSessionId() {
        // Check for existing session (localStorage for persistence across pages)
        let sessionId = localStorage.getItem('neon_analytics_session');
        const sessionExpiry = localStorage.getItem('neon_analytics_session_expiry');
        
        // Check if session expired (30 minutes of inactivity)
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (sessionId && sessionExpiry && (now - parseInt(sessionExpiry)) < thirtyMinutes) {
            // Session still valid, update expiry
            localStorage.setItem('neon_analytics_session_expiry', now.toString());
            neonLog('📊 Using existing session:', sessionId.substring(0, 15) + '...');
            return sessionId;
        }
        
        // Create new session
        sessionId = this.generateSessionId();
        localStorage.setItem('neon_analytics_session', sessionId);
        localStorage.setItem('neon_analytics_session_expiry', now.toString());
        neonLog('📊 Created NEW session:', sessionId.substring(0, 15) + '...');
        
        return sessionId;
    }

    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Track page load performance
    trackPageLoad() {
        if (performance && performance.timing) {
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                this.loadTime = loadTime;
                neonLog('📊 Page load time:', loadTime + 'ms');
            });
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrolled = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            if (scrolled > maxScroll) {
                maxScroll = scrolled;
                this.scrollDepth = Math.min(maxScroll, 100);
            }
        });

        // Track conversions
        this.trackConversions();

        // Track page exit
        window.addEventListener('beforeunload', () => {
            this.trackPageExit();
        });

        // Track visibility changes (for mobile)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackPageExit();
            }
        });

        // Track hash changes (SPA navigation)
        window.addEventListener('hashchange', () => {
            this.trackPageView();
        });
    }

    // Track conversion events
    trackConversions() {
        // Track phone clicks
        document.addEventListener('click', (e) => {
            const element = e.target.closest('a');
            if (!element) return;

            const href = element.href;
            
            if (href?.startsWith('tel:')) {
                this.trackEvent('phone_click', href.replace('tel:', ''));
            } else if (href?.startsWith('mailto:')) {
                this.trackEvent('email_click', href.replace('mailto:', ''));
            } else if (element.target === '_blank') {
                this.trackEvent('external_link', href);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                const formName = form.name || form.id || 'unknown_form';
                this.trackEvent('contact_form', formName);
            }
        });

        // Track downloads
        document.addEventListener('click', (e) => {
            const element = e.target.closest('a');
            if (!element) return;

            const href = element.href;
            const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'];
            
            if (downloadExtensions.some(ext => href?.toLowerCase().includes(ext))) {
                this.trackEvent('download', href.split('/').pop());
            }
        });
    }

    // Track main page view
    async trackPageView() {
        try {
            const data = {
                sessionId: this.sessionId,
                path: this.currentPage,
                title: this.pageTitle,
                referrer: document.referrer || null,
                loadTime: this.loadTime,
                screenResolution: `${screen.width}x${screen.height}`,
                language: navigator.language,
                // UTM parameters
                utmSource: this.getUrlParameter('utm_source'),
                utmMedium: this.getUrlParameter('utm_medium'),
                utmCampaign: this.getUrlParameter('utm_campaign')
            };
            
            // Debug logging
            neonLog('📊 Analytics tracking data:', {
                sessionId: this.sessionId,
                path: this.currentPage,
                storedSessionId: localStorage.getItem('neon_analytics_session'),
                sessionExpiry: localStorage.getItem('neon_analytics_session_expiry')
            });

            const response = await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                // Only update session ID if it's different AND save it to localStorage
                if (result.sessionId && result.sessionId !== this.sessionId) {
                    this.sessionId = result.sessionId;
                    localStorage.setItem('neon_analytics_session', this.sessionId);
                    localStorage.setItem('neon_analytics_session_expiry', Date.now().toString());
                    neonLog('📊 Session ID updated:', this.sessionId);
                }
                neonLog('📊 Page view tracked:', this.currentPage);
            }

        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    // Track conversion events
    async trackEvent(eventType, eventValue = null) {
        try {
            const data = {
                sessionId: this.sessionId,
                eventType,
                eventValue,
                path: this.currentPage
            };

            const response = await fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                neonLog('📊 Event tracked:', eventType, eventValue);
            }

        } catch (error) {
            console.warn('Event tracking failed:', error);
        }
    }

    // Track page exit
    async trackPageExit() {
        if (this.isExiting) return; // Prevent multiple calls
        this.isExiting = true;

        this.timeOnPage = Math.round((Date.now() - this.startTime) / 1000);

        try {
            const data = {
                sessionId: this.sessionId,
                path: this.currentPage,
                timeOnPage: this.timeOnPage,
                scrollDepth: this.scrollDepth
            };

            // Use sendBeacon for reliable tracking on page exit
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                navigator.sendBeacon('/api/analytics/page-exit', blob);
            } else {
                // Fallback for older browsers
                await fetch('/api/analytics/page-exit', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    keepalive: true
                });
            }

            neonLog('📊 Page exit tracked:', this.timeOnPage + 's', this.scrollDepth + '%');

        } catch (error) {
            console.warn('Page exit tracking failed:', error);
        }
    }

    // Get URL parameter
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Manual event tracking (for custom events)
    track(eventType, eventValue = null) {
        this.trackEvent(eventType, eventValue);
    }

    // Get current session info (for debugging)
    getSessionInfo() {
        return {
            sessionId: this.sessionId,
            currentPage: this.currentPage,
            timeOnPage: Math.round((Date.now() - this.startTime) / 1000),
            scrollDepth: this.scrollDepth
        };
    }
}

// Auto-initialize analytics (only in browser environment)
if (typeof window !== 'undefined') {
    // Check if analytics should be disabled (for development/testing)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const analyticsDisabled = localStorage.getItem('neon_analytics_disabled') === 'true';
    
    if (!analyticsDisabled) {
        // Initialize with small delay to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.NeonAnalytics = new NeonAnalyticsTracker();
            });
        } else {
            window.NeonAnalytics = new NeonAnalyticsTracker();
        }

        // Add to window for manual tracking
        window.trackEvent = function(eventType, eventValue) {
            if (window.NeonAnalytics) {
                window.NeonAnalytics.track(eventType, eventValue);
            }
        };

        // Development helpers
        if (isLocalhost) {
            window.getAnalyticsSession = function() {
                return window.NeonAnalytics ? window.NeonAnalytics.getSessionInfo() : null;
            };
            
            window.disableAnalytics = function() {
                localStorage.setItem('neon_analytics_disabled', 'true');
                neonLog('📊 Analytics disabled for this session');
            };
            
            window.enableAnalytics = function() {
                localStorage.removeItem('neon_analytics_disabled');
                neonLog('📊 Analytics enabled - refresh page to start tracking');
            };
        }
    } else {
        neonLog('📊 Analytics tracking disabled');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeonAnalyticsTracker;
} 