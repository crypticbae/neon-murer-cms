/*!
 * Simple Template Loader - Ohne CORS/Fetch Probleme
 * Verwendet eingebettete Template-Strings statt externe Dateien
 * Version: 1.0.0
 */

class SimpleTemplateLoader {
    constructor() {
        this.init();
    }

    /**
     * Initialisiert das Template-System
     */
    init() {
        // Warte bis DOM geladen ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadTemplates());
        } else {
            this.loadTemplates();
        }
    }

    /**
     * Bestimmt das korrekte Pfad-Präfix basierend auf der aktuellen Seite
     */
    getPathPrefix() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment.length > 0);
        
        // Prüfe ob wir uns in einem Unterordner befinden
        const subfolders = ['lichtwerbung', 'beschriftungen', 'neon-murer'];
        const currentFolder = segments[segments.length - 2]; // Vorletztes Segment (Ordnername)
        
        if (subfolders.includes(currentFolder)) {
            neonLog(`📁 Unterordner erkannt: ${currentFolder} - verwende ../ Präfix`);
            return '../';
        }
        
        neonLog('🏠 Root-Verzeichnis erkannt - verwende direkten Pfad');
        return '';
    }

    /**
     * Passt die Pfade im Template basierend auf der aktuellen Position an
     * Nur relative Pfade werden angepasst, absolute URLs bleiben unverändert
     */
    adjustTemplatePaths(template, pathPrefix) {
        return template
            .replace(/href="index\.html"/g, `href="${pathPrefix}index.html"`)
            .replace(/src="template\//g, `src="${pathPrefix}template/`)
            .replace(/href="template\//g, `href="${pathPrefix}template/`)
            // Navigation zwischen Unterordnern korrigieren
            .replace(/href="lichtwerbung\//g, `href="${pathPrefix}lichtwerbung/`)
            .replace(/href="beschriftungen\//g, `href="${pathPrefix}beschriftungen/`)
            .replace(/href="neon-murer\//g, `href="${pathPrefix}neon-murer/`)
            // Hauptmenü-Links zu Root-Seiten korrigieren
            .replace(/href="digital-signage\.html"/g, `href="${pathPrefix}digital-signage.html"`)
            .replace(/href="dienstleistungen\.html"/g, `href="${pathPrefix}dienstleistungen.html"`)
            .replace(/href="lichtwerbung\.html"/g, `href="${pathPrefix}lichtwerbung.html"`)
            .replace(/href="beschriftungen\.html"/g, `href="${pathPrefix}beschriftungen.html"`)
            // Footer-Links korrigieren  
            .replace(/href="impressum\.html"/g, `href="${pathPrefix}impressum.html"`)
            .replace(/href="datenschutz\.html"/g, `href="${pathPrefix}datenschutz.html"`)
            .replace(/href="geschaeftsbedingungen\.html"/g, `href="${pathPrefix}geschaeftsbedingungen.html"`);
    }

    /**
     * Lädt alle Templates
     */
    loadTemplates() {
        try {
            neonLog('🔧 Simple Template Loader: Lade Header und Footer...');
            
            // Prüfe ob Template-Strings verfügbar sind
            if (!window.EmbeddedTemplates) {
                throw new Error('EmbeddedTemplates nicht gefunden - templates.js nicht geladen?');
            }
            
            // Bestimme das korrekte Pfad-Präfix
            const pathPrefix = this.getPathPrefix();
            
            // Header laden mit angepassten Pfaden
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                neonLog('📍 Header-Platzhalter gefunden');
                const adjustedHeader = this.adjustTemplatePaths(window.EmbeddedTemplates.header, pathPrefix);
                headerPlaceholder.outerHTML = adjustedHeader;
                neonLog('✅ Header Template geladen mit korrigierten Pfaden');
            } else {
                console.warn('⚠️ Header-Platzhalter nicht gefunden');
            }
            
            // Footer laden mit angepassten Pfaden
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                neonLog('📍 Footer-Platzhalter gefunden');
                const adjustedFooter = this.adjustTemplatePaths(window.EmbeddedTemplates.footer, pathPrefix);
                footerPlaceholder.outerHTML = adjustedFooter;
                neonLog('✅ Footer Template geladen');
            } else {
                console.warn('⚠️ Footer-Platzhalter nicht gefunden');
            }
            
            neonLog('✅ Simple Template Loader: Alle Templates erfolgreich geladen');
            
            // Nach dem Laden: Events initialisieren
            this.initializeEvents();
            
            // Event auslösen dass Templates geladen sind
            this.dispatchTemplatesLoadedEvent();
            
        } catch (error) {
            console.error('❌ Simple Template Loader Fehler:', error);
            this.handleError(error);
        }
    }

    /**
     * Initialisiert Events nach dem Laden der Templates
     */
    initializeEvents() {
        // Kurz warten damit DOM vollständig geladen ist
        setTimeout(() => {
            // Bootstrap Dropdown initialisieren
            this.initializeDropdowns();
            
            // Navigation aktiven Link setzen
            this.setActiveNavigation();
            
            // Mobile Navigation Events
            this.initializeMobileNavigation();
            

            
            neonLog('✅ Template Events initialisiert');
        }, 100);
    }



        /**
     * Einfache Dropdown-Initialisierung
     */
    initializeDropdowns() {
        neonLog('🔧 Initialisiere einfache Dropdowns...');
        
        // Nur für Mobile: Klick-Verhalten für Dropdowns
        if (window.innerWidth < 992) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                const link = dropdown.querySelector('.nav-link');
                if (link) {
                    link.addEventListener('click', function(e) {
                        const hasMenu = dropdown.querySelector('.dropdown-menu');
                        if (hasMenu && !dropdown.classList.contains('mobile-open')) {
                            // Dropdown öffnen
                            e.preventDefault();
                            
                            // Andere schließen
                            document.querySelectorAll('.dropdown').forEach(d => {
                                d.classList.remove('mobile-open');
                            });
                            
                            dropdown.classList.add('mobile-open');
                        }
                        // Wenn schon offen oder kein Menü -> Link folgen (normales Verhalten)
                    });
                }
            });
            
            // Klick außerhalb schließt Mobile-Dropdowns
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    document.querySelectorAll('.dropdown').forEach(d => {
                        d.classList.remove('mobile-open');
                    });
                }
            });
        }
        
        neonLog('✅ Einfache Dropdowns initialisiert');
    }

    /**
     * Setzt den aktiven Navigation Link
     */
    setActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');
        
        // Spezielle Behandlung für Hauptkategorie-Seiten
        const categoryPages = {
            'lichtwerbung.html': ['leuchtschriften.html', 'leuchttransparente.html', 'halbrelief-plattenschriften.html', 'neon-led-technik.html', 'pylonen.html'],
            'beschriftungen.html': ['signaletik.html', 'tafelbeschriftung.html', 'fahrzeugbeschriftung.html', 'fensterbeschriftung.html', 'blachen-fahnen.html', 'grossformatdruck.html']
        };
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Direkter Match
            if (href === currentPage) {
                link.classList.add('active');
                // Für Dropdown-Items: Parent auch markieren
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const parentToggle = parentDropdown.querySelector('.dropdown-toggle');
                    parentToggle?.classList.add('active');
                }
            }
            
            // Kategorie-basierter Match (z.B. wenn auf leuchtschriften.html -> markiere auch lichtwerbung.html)
            for (const [categoryPage, subPages] of Object.entries(categoryPages)) {
                if (subPages.includes(currentPage) && href === categoryPage) {
                    link.classList.add('active');
                    break;
                }
            }
        });
    }

    /**
     * Initialisiert Mobile Navigation
     */
    initializeMobileNavigation() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        // Hamburger Animation
        navbarToggler?.addEventListener('click', function() {
            this.classList.toggle('collapsed');
        });
    }

    /**
     * Löst ein Event aus dass Templates geladen sind
     */
    dispatchTemplatesLoadedEvent() {
        const event = new CustomEvent('templatesLoaded', {
            detail: { 
                message: 'Header und Footer Templates wurden erfolgreich geladen',
                timestamp: new Date().toISOString(),
                loader: 'SimpleTemplateLoader'
            }
        });
        document.dispatchEvent(event);
        neonLog('📢 Templates-Loaded Event ausgelöst');
    }

    /**
     * Fehlerbehandlung
     */
    handleError(error) {
        // Fallback: Zeige eine Fehlermeldung oder lade eine Standard-Navigation
        console.error('Simple Template Loader Fallback aktiviert');
        
        // Optional: Fallback HTML einfügen
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = `
                <div class="alert alert-warning m-3">
                    <strong>Navigation konnte nicht geladen werden.</strong><br>
                    Bitte laden Sie die Seite neu oder kontaktieren Sie uns.
                </div>
            `;
        }
        
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = `
                <footer class="bg-dark text-light text-center py-3">
                    <p>&copy; 2025 Neon Murer AG - <a href="tel:+41552255025" class="text-warning">+41 55 225 50 25</a></p>
                </footer>
            `;
        }
    }
}

// Simple Template Loader automatisch starten (entfernt - wird unten initialisiert)

// Load Analytics Tracker
function loadAnalyticsTracker() {
    // Check if script already loaded
    if (document.querySelector('script[src*="neon-usage-stats.js"]')) {
        // Script already loaded, just initialize
        setTimeout(initAnalyticsTracker, 100);
        return;
    }
    
    // Try different paths based on current location
    const possiblePaths = [
        '../template/assets/js/neon-usage-stats.js',  // Subfolder level (like neon-murer/)
        'template/assets/js/neon-usage-stats.js'      // Root level
    ];
    
    function tryNextPath(pathIndex = 0) {
        if (pathIndex >= possiblePaths.length) {
            console.warn('📊 Failed to load analytics tracker from all paths');
            return;
        }
        
        const script = document.createElement('script');
        script.src = possiblePaths[pathIndex];
        script.async = true;
        script.onload = function() {
            neonLog('📊 Analytics tracker loaded successfully from: ' + possiblePaths[pathIndex]);
            // Initialize analytics after loading
            setTimeout(initAnalyticsTracker, 100);
        };
        script.onerror = function() {
            // Try next path
            tryNextPath(pathIndex + 1);
        };
        document.head.appendChild(script);
    }
    
    tryNextPath();
}

// Load analytics after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAnalyticsTracker);
} else {
    loadAnalyticsTracker();
}

// Load Search Function
function loadSearchSystem() {
    // Check if script already loaded
    if (document.querySelector('script[src*="modern-search.js"]')) {
        // Script already loaded, just initialize if needed
        setTimeout(initSearchSystem, 100);
        return;
    }
    
    // Try different paths based on current location
    const possiblePaths = [
        '../template/assets/js/modern-search.js',  // Subfolder level (like neon-murer/)
        'template/assets/js/modern-search.js'      // Root level
    ];
    
    function tryNextPath(pathIndex = 0) {
        if (pathIndex >= possiblePaths.length) {
            console.warn('🔍 Failed to load search system from all paths');
            return;
        }
        
        const script = document.createElement('script');
        script.src = possiblePaths[pathIndex];
        script.async = true;
        script.onload = function() {
            neonLog('🔍 Search system loaded successfully from: ' + possiblePaths[pathIndex]);
            // Initialize search after loading
            setTimeout(initSearchSystem, 100);
        };
        script.onerror = function() {
            // Try next path
            tryNextPath(pathIndex + 1);
        };
        document.head.appendChild(script);
    }
    
    tryNextPath();
}

function initSearchSystem() {
    if (typeof ModernNeonSearch !== 'undefined' && !window.modernNeonSearch) {
        window.modernNeonSearch = new ModernNeonSearch();
        neonLog('🔍 Search system initialized on', window.location.pathname);
    } else if (window.modernNeonSearch) {
        neonLog('🔍 Search system already initialized');
    } else {
        console.warn('🔍 ModernNeonSearch not found - script may not be loaded');
    }
}

// Load search after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSearchSystem);
} else {
    loadSearchSystem();
}

// Template Loader initialisieren (nur wenn noch nicht vorhanden)
if (!window.simpleTemplateLoader) {
    window.simpleTemplateLoader = new SimpleTemplateLoader();
}



// Legacy debug support (neonLog ist bereits in templates.js definiert)
if (window.NEON_DEBUG) {
    neonLog('🔍 Simple Template Loader Debug Mode aktiv');
    window.simpleTemplateLoader.debug = true;
} 