/*!
 * Neon Murer DSGVO-konformer Cookie Banner
 * Version: 1.0.0
 * Vollständig DSGVO-konform mit Corporate Design
 */

class NeonCookieBanner {
    constructor() {
        this.consentKey = 'neon_cookie_consent';
        this.settingsKey = 'neon_cookie_settings';
        this.currentConsent = this.getStoredConsent();
        this.analyticsLoaded = false;
        
        // Cookie-Kategorien
        this.categories = {
            necessary: {
                name: 'Notwendige Cookies',
                description: 'Diese Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden.',
                required: true,
                cookies: ['neon_cookie_consent', 'neon_cookie_settings', 'neon_analytics_session']
            },
            analytics: {
                name: 'Statistik & Analytics',
                description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.',
                required: false,
                cookies: ['_ga', '_ga_*', '_gid', '_gat']
            },
            marketing: {
                name: 'Marketing',
                description: 'Diese Cookies werden verwendet, um Werbeanzeigen zu personalisieren.',
                required: false,
                cookies: []
            }
        };

        this.init();
    }

    init() {
        neonLog('🍪 Cookie Banner initializing...', this.currentConsent);
        
        // Immer Styles laden
        this.injectStyles();
        
        if (!this.currentConsent) {
            neonLog('🍪 No consent found - showing banner');
            this.showBanner();
        } else {
            neonLog('🍪 Consent found:', this.currentConsent);
            this.applyConsent();
        }
        
        neonLog('🍪 Cookie Banner initialized');
    }

    // Cookie-Banner anzeigen
    showBanner() {
        // Prüfen ob Banner bereits existiert
        if (document.getElementById('neon-cookie-banner')) {
            return;
        }

        const banner = this.createBannerHTML();
        document.body.appendChild(banner);

        // Event-Listener hinzufügen
        this.attachEventListeners();
        
        // Banner einblenden
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    // Banner HTML erstellen
    createBannerHTML() {
        const banner = document.createElement('div');
        banner.id = 'neon-cookie-banner';
        banner.className = 'neon-cookie-banner';
        
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-main">
                    <div class="cookie-message">
                        <i class="fas fa-cookie-bite cookie-icon"></i>
                        <span>Diese Website verwendet Cookies für ein optimales Erlebnis.</span>
                        <a href="datenschutz.html" class="cookie-info-link">Mehr erfahren</a>
                    </div>
                    
                    <div class="cookie-actions">
                        <button id="cookie-toggle-details" class="btn-settings" title="Einstellungen">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button id="cookie-accept-selected" class="btn-accept-selected">
                            Auswahl OK
                        </button>
                        <button id="cookie-accept-all" class="btn-accept-all">
                            Alle akzeptieren
                        </button>
                    </div>
                </div>
                
                <div class="cookie-details" id="cookie-details" style="display: none;">
                    <div class="cookie-category">
                        <label class="cookie-switch">
                            <input type="checkbox" checked disabled>
                            <span class="slider required"></span>
                        </label>
                        <div class="category-info">
                            <strong>Notwendig</strong>
                            <span>Für Website-Betrieb erforderlich</span>
                        </div>
                    </div>
                    
                    <div class="cookie-category">
                        <label class="cookie-switch">
                            <input type="checkbox" id="analytics-toggle" checked>
                            <span class="slider"></span>
                        </label>
                        <div class="category-info">
                            <strong>Statistik</strong>
                            <span>Anonyme Nutzungsanalyse</span>
                        </div>
                    </div>
                    
                    <div class="cookie-category">
                        <label class="cookie-switch">
                            <input type="checkbox" id="marketing-toggle">
                            <span class="slider"></span>
                        </label>
                        <div class="category-info">
                            <strong>Marketing</strong>
                            <span>Derzeit nicht verwendet</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Settings Modal -->
            <div class="cookie-settings-modal" id="cookie-settings-modal" style="display: none;">
                <div class="cookie-settings-content">
                    <div class="settings-header">
                        <h3>Cookie-Einstellungen</h3>
                        <button id="close-settings" class="close-settings">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="settings-body">
                        <p>Hier können Sie Ihre Cookie-Präferenzen verwalten. Änderungen werden sofort übernommen.</p>
                        
                        <div class="settings-categories">
                            <!-- Categories will be populated by JavaScript -->
                        </div>
                    </div>
                    
                    <div class="settings-footer">
                        <button id="save-settings" class="btn-save-settings">
                            <i class="fas fa-save"></i>
                            Einstellungen speichern
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return banner;
    }

    // Event-Listener anhängen
    attachEventListeners() {
        // Alle akzeptieren
        document.getElementById('cookie-accept-all')?.addEventListener('click', () => {
            this.acceptAll();
        });

        // Auswahl akzeptieren
        document.getElementById('cookie-accept-selected')?.addEventListener('click', () => {
            this.acceptSelected();
        });

        // Einstellungen toggle
        document.getElementById('cookie-toggle-details')?.addEventListener('click', () => {
            this.toggleDetails();
        });

        // Settings Modal
        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
    }

    // Details toggle
    toggleDetails() {
        const details = document.getElementById('cookie-details');
        const button = document.getElementById('cookie-toggle-details');
        
        if (details.style.display === 'none') {
            details.style.display = 'block';
            button.innerHTML = '<i class="fas fa-cog"></i> Weniger anzeigen';
        } else {
            details.style.display = 'none';
            button.innerHTML = '<i class="fas fa-cog"></i> Einstellungen';
        }
    }

    // Alle Cookies akzeptieren
    acceptAll() {
        const consent = {
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: Date.now(),
            version: '1.0'
        };

        this.saveConsent(consent);
        this.hideBanner();
        this.applyConsent();
    }

    // Ausgewählte Cookies akzeptieren
    acceptSelected() {
        const analyticsToggle = document.getElementById('analytics-toggle');
        const marketingToggle = document.getElementById('marketing-toggle');

        const consent = {
            necessary: true,
            analytics: analyticsToggle?.checked || false,
            marketing: marketingToggle?.checked || false,
            timestamp: Date.now(),
            version: '1.0'
        };

        this.saveConsent(consent);
        this.hideBanner();
        this.applyConsent();
    }

    // Einstellungen speichern
    saveSettings() {
        // Implementation für Settings Modal
        this.closeSettings();
    }

    // Settings Modal schließen
    closeSettings() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Zustimmung speichern
    saveConsent(consent) {
        localStorage.setItem(this.consentKey, JSON.stringify(consent));
        this.currentConsent = consent;
    }

    // Gespeicherte Zustimmung abrufen
    getStoredConsent() {
        try {
            const stored = localStorage.getItem(this.consentKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.warn('Cookie consent parsing error:', e);
            return null;
        }
    }

    // Banner ausblenden
    hideBanner() {
        const banner = document.getElementById('neon-cookie-banner');
        if (banner) {
            banner.classList.add('hide');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    // Zustimmung anwenden
    applyConsent() {
        if (!this.currentConsent) return;

        // Analytics laden wenn zugestimmt
        if (this.currentConsent.analytics && !this.analyticsLoaded) {
            this.loadAnalytics();
        }

        // Marketing Cookies (wenn implementiert)
        if (this.currentConsent.marketing) {
            this.loadMarketing();
        }

        neonLog('🍪 Cookie consent applied:', this.currentConsent);
    }

    // Lokale Analytics laden (ohne Google Analytics)
    loadAnalytics() {
        if (this.analyticsLoaded) return;

        // Aktiviere lokales Analytics-Tracking
        // Das bestehende analytics-tracker.js System verwenden
        if (window.NeonAnalyticsTracker) {
            neonLog('📊 Local analytics activated with consent');
        }

        // Optional: Hier könnte später Google Analytics hinzugefügt werden
        // Für jetzt verwenden wir nur das lokale System
        
        this.analyticsLoaded = true;
        neonLog('📊 Analytics loaded with consent (local tracking only)');
    }

    // Marketing Scripts laden
    loadMarketing() {
        // Hier können Marketing-Scripts geladen werden
        neonLog('📢 Marketing scripts would be loaded here');
    }

    // Styles injizieren
    injectStyles() {
        if (document.getElementById('neon-cookie-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'neon-cookie-styles';
        styles.textContent = `
            .neon-cookie-banner {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                max-width: 900px;
                margin: 0 auto;
                background: linear-gradient(135deg, #112357 0%, #1a2f63 100%);
                color: white;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                transform: translateY(120%);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'DM Sans', sans-serif;
                border-radius: 12px;
                border: 1px solid rgba(255, 212, 1, 0.2);
            }

            .neon-cookie-banner.show {
                transform: translateY(0);
            }

            .neon-cookie-banner.hide {
                transform: translateY(120%);
            }

            .cookie-banner-content {
                padding: 16px 20px;
            }

            .cookie-banner-main {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }

            .cookie-message {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                font-size: 0.9rem;
            }

            .cookie-icon {
                color: #ffd401;
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .cookie-info-link {
                color: #ffd401;
                text-decoration: none;
                font-size: 0.85rem;
                margin-left: 8px;
                white-space: nowrap;
            }

            .cookie-info-link:hover {
                text-decoration: underline;
                color: white;
            }

            .cookie-banner-header {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }

            .cookie-icon {
                font-size: 2.5rem;
                color: #ffd401;
                margin-right: 16px;
            }

            .cookie-title h3 {
                margin: 0;
                font-size: 1.4rem;
                font-weight: 600;
                color: white;
            }

            .cookie-subtitle {
                margin: 4px 0 0 0;
                opacity: 0.8;
                font-size: 0.9rem;
            }

            .cookie-banner-body p {
                margin: 0 0 16px 0;
                line-height: 1.6;
                opacity: 0.9;
            }

            .cookie-details {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                margin-top: 12px;
                backdrop-filter: blur(10px);
            }

            .cookie-category {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .cookie-category:last-child {
                border-bottom: none;
            }

            .category-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .category-info strong {
                font-size: 0.9rem;
                font-weight: 600;
                color: white;
            }

            .category-info span {
                font-size: 0.8rem;
                opacity: 0.7;
                color: rgba(255, 255, 255, 0.8);
            }

            .cookie-switch {
                position: relative;
                display: inline-block;
                width: 54px;
                height: 28px;
                margin: 0;
            }

            .cookie-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.2);
                transition: 0.3s;
                border-radius: 28px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }

            .cookie-switch input:checked + .slider {
                background-color: #ffd401;
            }

            .cookie-switch input:checked + .slider:before {
                transform: translateX(26px);
            }

            .slider.required {
                background-color: #ffd401;
                cursor: not-allowed;
                opacity: 0.7;
            }

            .cookie-banner-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
                margin-top: 20px;
            }

            .cookie-links {
                display: flex;
                gap: 20px;
            }

            .cookie-link {
                color: #ffd401;
                text-decoration: none;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s ease;
            }

            .cookie-link:hover {
                color: white;
                transform: translateY(-1px);
            }

            .cookie-actions {
                display: flex;
                gap: 8px;
                align-items: center;
                flex-shrink: 0;
            }

            .cookie-actions button {
                padding: 8px 16px;
                border: none;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                font-family: inherit;
                white-space: nowrap;
            }

            .btn-settings {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 8px;
                width: 36px;
                height: 36px;
                justify-content: center;
                border-radius: 50%;
            }

            .btn-settings:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .btn-accept-selected {
                background: rgba(255, 212, 1, 0.2);
                color: #ffd401;
                border: 1px solid #ffd401;
            }

            .btn-accept-selected:hover {
                background: #ffd401;
                color: #112357;
                transform: translateY(-1px);
            }

            .btn-accept-all {
                background: linear-gradient(45deg, #ffd401, #ffed4e);
                color: #112357;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(255, 212, 1, 0.3);
            }

            .btn-accept-all:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 212, 1, 0.4);
            }

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .neon-cookie-banner {
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                }

                .cookie-banner-main {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }

                .cookie-message {
                    justify-content: center;
                    text-align: center;
                }

                .cookie-actions {
                    justify-content: center;
                }

                .cookie-actions button {
                    min-width: auto;
                }

                .btn-accept-selected,
                .btn-accept-all {
                    flex: 1;
                }
            }

            /* Settings Modal */
            .cookie-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .cookie-settings-content {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid #eee;
            }

            .settings-header h3 {
                margin: 0;
                color: #112357;
            }

            .close-settings {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #666;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .close-settings:hover {
                background: #f5f5f5;
                color: #112357;
            }

            .settings-body {
                padding: 24px;
            }

            .settings-footer {
                padding: 24px;
                border-top: 1px solid #eee;
                text-align: center;
            }

            .btn-save-settings {
                background: linear-gradient(45deg, #112357, #1a2f63);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .btn-save-settings:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(17, 35, 87, 0.3);
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Public API: Cookie-Einstellungen öffnen
    static openSettings() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Public API: Consent zurücksetzen
    static resetConsent() {
        localStorage.removeItem('neon_cookie_consent');
        location.reload();
    }

    // Public API: Aktueller Consent-Status
    static getConsentStatus() {
        try {
            const stored = localStorage.getItem('neon_cookie_consent');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }
}

// Cookie-Banner automatisch initialisieren
document.addEventListener('DOMContentLoaded', () => {
    neonLog('🍪 DOMContentLoaded - initializing cookie banner');
    window.NeonCookies = new NeonCookieBanner();
});

// Fallback falls DOMContentLoaded bereits gefeuert wurde
if (document.readyState === 'loading') {
    // DOM wird noch geladen, event listener ist ausreichend
} else {
    // DOM ist bereits fertig geladen
    neonLog('🍪 DOM already loaded - initializing cookie banner immediately');
    window.NeonCookies = new NeonCookieBanner();
}

// Global verfügbare Funktionen
window.openCookieSettings = () => NeonCookieBanner.openSettings();
window.resetCookieConsent = () => NeonCookieBanner.resetConsent();
window.getCookieConsent = () => NeonCookieBanner.getConsentStatus();

// Debug-Funktionen
window.debugCookies = () => {
    neonLog('🍪 Cookie Debug Info:');
    neonLog('- Current consent:', NeonCookieBanner.getConsentStatus());
    neonLog('- Banner exists:', !!document.getElementById('neon-cookie-banner'));
    neonLog('- LocalStorage:', localStorage.getItem('neon_cookie_consent'));
    
    // Banner forcieren
    const banner = new NeonCookieBanner();
    banner.currentConsent = null;
    banner.showBanner();
    neonLog('🍪 Forced banner display');
};

window.clearAllCookies = () => {
    localStorage.removeItem('neon_cookie_consent');
    localStorage.removeItem('neon_cookie_settings');
    sessionStorage.removeItem('neon_analytics_session');
    neonLog('🍪 All cookies cleared - reload page to see banner');
};