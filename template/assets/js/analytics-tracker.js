/*!
 * Analytics Tracker - Lokales Analytics ohne externe Services
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // Prüfe ob Analytics bereits geladen ist
    if (window.NeonAnalytics) {
        return;
    }

    // Grundlegende Analytics-Klasse
    class NeonAnalytics {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.startTime = Date.now();
            this.pageViews = 0;
            this.events = [];
            
            this.init();
        }

        init() {
            // Session-Start tracken
            this.trackEvent('session_start', {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                screen: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`
            });

            // Page Load tracken
            this.trackPageView();

            // Event Listeners
            this.setupEventListeners();

            neonLog(`📊 Neon Analytics initialized - Session: ${this.sessionId}`);
        }

        generateSessionId() {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            return `session_${timestamp}_${random}`;
        }

        trackPageView() {
            this.pageViews++;
            const path = window.location.pathname + window.location.search;
            
            this.trackEvent('page_view', {
                path: path,
                title: document.title,
                referrer: document.referrer,
                timestamp: Date.now()
            });

            neonLog(`📊 Page view tracked: ${path}`);
        }

        trackEvent(eventName, data = {}) {
            const event = {
                sessionId: this.sessionId,
                event: eventName,
                timestamp: Date.now(),
                ...data
            };

            this.events.push(event);

            // Lokale Speicherung (nur aktuelle Session)
            this.saveToSessionStorage(event);
        }

        saveToSessionStorage(event) {
            try {
                const key = 'neon_analytics_session';
                const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
                existing.push(event);
                
                // Maximal 100 Events pro Session speichern
                if (existing.length > 100) {
                    existing.shift();
                }
                
                sessionStorage.setItem(key, JSON.stringify(existing));
            } catch (error) {
                // SessionStorage nicht verfügbar - ignorieren
            }
        }

        setupEventListeners() {
            // Page Exit tracking
            window.addEventListener('beforeunload', () => {
                const duration = Date.now() - this.startTime;
                const scrollPercent = Math.round(
                    (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );

                this.trackEvent('page_exit', {
                    duration: duration,
                    scrollPercent: Math.min(100, Math.max(0, scrollPercent || 0)),
                    pageViews: this.pageViews
                });

                neonLog(`📊 Page exit tracked: ${Math.round(duration / 1000)}s ${scrollPercent}%`);
            });

            // Error tracking (optional)
            window.addEventListener('error', (event) => {
                this.trackEvent('js_error', {
                    message: event.message,
                    filename: event.filename,
                    line: event.lineno,
                    column: event.colno
                });
            });
        }

        // Public API für manuelles Tracking
        track(eventName, data) {
            this.trackEvent(eventName, data);
        }

        // Debugging-Methode
        getSessionData() {
            return {
                sessionId: this.sessionId,
                duration: Date.now() - this.startTime,
                pageViews: this.pageViews,
                events: this.events.length
            };
        }
    }

    // Global verfügbar machen
    window.NeonAnalytics = new NeonAnalytics();
    
    // Compatibility alias
    window.neonAnalytics = window.NeonAnalytics;

})();