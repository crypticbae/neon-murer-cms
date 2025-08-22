/*!
 * Frontend Settings Loader - Verbindet CMS-Settings mit der Website
 * Lädt Settings aus der API und aktualisiert HTML-Elemente dynamisch
 * Version: 1.0.0
 */

class SettingsLoader {
    constructor() {
        this.settings = {};
        this.init();
    }

    init() {
        neonLog('🔧 Settings Loader: Initialisiere...');
        this.loadAllSettings();
    }

    async loadAllSettings() {
        try {
            await Promise.all([
                this.loadGeneralSettings(),
                this.loadSEOSettings(),
                this.loadEmailSettings()
            ]);
            
            this.applySettingsToPage();
            neonLog('✅ Settings Loader: Alle Settings geladen und angewendet');
            
        } catch (error) {
            console.error('❌ Settings Loader: Fehler beim Laden:', error);
        }
    }

    async loadGeneralSettings() {
        try {
            const response = await fetch('/api/settings/general');
            if (response.ok) {
                const data = await response.json();
                this.settings.general = data.settings;
                neonLog('📋 General Settings geladen');
            }
        } catch (error) {
            console.warn('⚠️ General Settings konnten nicht geladen werden:', error);
        }
    }

    async loadSEOSettings() {
        try {
            const response = await fetch('/api/settings/seo');
            if (response.ok) {
                const data = await response.json();
                this.settings.seo = data.settings;
                neonLog('🔍 SEO Settings geladen');
            }
        } catch (error) {
            console.warn('⚠️ SEO Settings konnten nicht geladen werden:', error);
        }
    }

    async loadEmailSettings() {
        try {
            const response = await fetch('/api/settings/email');
            if (response.ok) {
                const data = await response.json();
                this.settings.email = data.settings;
                neonLog('📧 Email Settings geladen');
            }
        } catch (error) {
            console.warn('⚠️ Email Settings konnten nicht geladen werden:', error);
        }
    }

    applySettingsToPage() {
        neonLog('🎨 Wende Settings auf die Seite an...');
        
        // Title aktualisieren
        this.updatePageTitle();
        
        // Meta Tags aktualisieren
        this.updateMetaTags();
        
        // Kontaktinformationen aktualisieren
        this.updateContactInfo();
        
        // Google Analytics einbinden (falls konfiguriert)
        this.loadGoogleAnalytics();
    }

    updatePageTitle() {
        if (this.settings.general?.siteTitle) {
            document.title = this.settings.general.siteTitle;
            // Website-Titel aktualisiert
        }
    }

    updateMetaTags() {
        const general = this.settings.general;
        
        if (general?.siteDescription) {
            this.updateMetaTag('name', 'description', general.siteDescription);
            this.updateMetaTag('property', 'og:description', general.siteDescription);
            this.updateMetaTag('name', 'twitter:description', general.siteDescription);
        }
        
        if (general?.siteTitle) {
            this.updateMetaTag('property', 'og:title', general.siteTitle);
            this.updateMetaTag('name', 'twitter:title', general.siteTitle);
        }
        
        if (general?.siteTagline) {
            // Tagline kann für spezielle Meta-Tags verwendet werden
            neonLog('🏷️ Tagline verfügbar:', general.siteTagline);
        }
    }

    updateMetaTag(attribute, value, content) {
        let meta = document.querySelector(`meta[${attribute}="${value}"]`);
        if (meta) {
            meta.setAttribute('content', content);
            // Meta-Tag aktualisiert
        } else {
            // Meta-Tag erstellen falls nicht vorhanden
            meta = document.createElement('meta');
            meta.setAttribute(attribute, value);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
            // Meta-Tag erstellt
        }
    }

    updateContactInfo() {
        const general = this.settings.general;
        
        // E-Mail-Links aktualisieren
        if (general?.contactEmail) {
            const emailLinks = document.querySelectorAll('a[href*="neon@neonmurer.ch"], a[onclick*="neonmurer.ch"]');
            emailLinks.forEach(link => {
                if (link.textContent.includes('@')) {
                    // Icons beibehalten
                    const icon = link.querySelector('i');
                    if (icon) {
                        link.innerHTML = icon.outerHTML + ' ' + general.contactEmail;
                    } else {
                        link.textContent = general.contactEmail;
                    }
                }
                if (link.hasAttribute('onclick')) {
                    const [localPart, domain] = general.contactEmail.split('@');
                    link.setAttribute('onclick', `mailtoLink('${localPart}','${domain}');return false;`);
                }
            });
            // E-Mail-Kontakte aktualisiert
        }

        // Telefon-Links aktualisieren
        if (general?.contactPhone) {
            const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
            phoneLinks.forEach(link => {
                const oldPhone = link.textContent.trim();
                // Nur Links mit einer spezifischen Telefonnummer aktualisieren
                if (oldPhone.startsWith('+41') && oldPhone.length > 5) {
                    link.href = `tel:${general.contactPhone}`;
                    // Icons beibehalten
                    const icon = link.querySelector('i');
                    if (icon) {
                        link.innerHTML = icon.outerHTML + ' ' + general.contactPhone;
                    } else {
                        link.textContent = general.contactPhone;
                    }
                }
            });
            // Telefon-Kontakte aktualisiert
        }
    }

    loadGoogleAnalytics() {
        const seo = this.settings.seo;
        
        if (seo?.googleAnalyticsId && seo.googleAnalyticsId.trim()) {
            const gaId = seo.googleAnalyticsId.trim();
            
            // Prüfen ob Google Analytics bereits geladen ist
            if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
                neonLog('📊 Google Analytics bereits geladen');
                return;
            }
            
            // Google Analytics 4 (gtag) laden
            if (gaId.startsWith('G-') || gaId.startsWith('GA-')) {
                this.loadGA4(gaId);
            }
            // Legacy Universal Analytics unterstützen
            else if (gaId.startsWith('UA-')) {
                this.loadUniversalAnalytics(gaId);
            }
        } else {
            neonLog('📊 Keine Google Analytics ID konfiguriert');
        }
    }

    loadGA4(gaId) {
        // Google Analytics 4 Script laden
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);
        
        // gtag konfigurieren
        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', gaId);
            
            // Global verfügbar machen
            window.gtag = gtag;
            
            neonLog('📊 Google Analytics 4 geladen:', gaId);
        };
    }

    loadUniversalAnalytics(gaId) {
        // Legacy Universal Analytics laden
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', gaId, 'auto');
        ga('send', 'pageview');
        
        neonLog('📊 Google Analytics (Universal) geladen:', gaId);
    }

    // Public API für manuellen Reload
    async reload() {
        neonLog('🔄 Settings Loader: Manueller Reload...');
        await this.loadAllSettings();
    }

    // Settings abrufen
    getSettings() {
        return this.settings;
    }
}

// Automatisch starten wenn DOM bereit ist
document.addEventListener('DOMContentLoaded', function() {
    window.settingsLoader = new SettingsLoader();
});

// Auch nach Template-Loading starten (falls Templates später geladen werden)
document.addEventListener('templatesLoaded', function() {
    if (!window.settingsLoader) {
        window.settingsLoader = new SettingsLoader();
    } else {
        // Settings erneut anwenden nach Template-Loading
        window.settingsLoader.applySettingsToPage();
    }
});

// Global verfügbar machen
window.SettingsLoader = SettingsLoader;