/**
 * 🔍 ULTRA-MODERNE SUCHFUNKTION für Neon Murer Website
 * Features: Instant Search, AI-ähnliche Suggestions, Voice Search, Fuzzy Matching
 * Version: 2.0.0 - Hochmodern & Intelligent
 */

class ModernNeonSearch {
  constructor() {
    // Determine path prefix based on current location
    this.pathPrefix = this.getPathPrefix();
    
    this.searchablePages = [
      // HAUPTSEITEN
      { 
        title: 'Startseite', 
        url: 'index.html',
        description: 'Ihre erste Anlaufstelle für professionelle Lichtwerbung und Werbetechnik',
        category: 'Hauptseite',
        keywords: ['neon murer', 'lichtwerbung', 'beschriftungen', 'digital signage', 'leuchtwerbung', 'werbetechnik', 'rapperswil', 'jona', 'startseite', 'home', 'hauptseite', 'unternehmen', 'firma', 'ag', '75 jahre', 'erfahrung', 'tradition', 'qualität', 'swiss made', 'schweiz', 'zürich', 'ostschweiz']
      },
      
      // LICHTWERBUNG HAUPTSEITE
      { 
        title: 'Lichtwerbung', 
        url: 'lichtwerbung.html',
        description: 'Professionelle Lichtwerbung für maximale Sichtbarkeit Ihres Unternehmens',
        category: 'Lichtwerbung',
        keywords: ['lichtwerbung', 'leuchtwerbung', 'aussenwerbung', 'neon', 'led', 'beleuchtung', 'werbetechnik', 'fassadenwerbung', 'leuchtend', 'schriften', 'transparente', 'pylonen', 'neon technik', 'led technik', 'halbrelief', 'plattenschriften', 'overview', 'übersicht']
      },
      
      // LICHTWERBUNG UNTERSEITEN
      { 
        title: 'Leuchtschriften', 
        url: 'lichtwerbung/leuchtschriften.html',
        description: 'Individuelle LED- und Neon-Leuchtschriften aus eigener Glasbläserei',
        category: 'Lichtwerbung',
        keywords: ['leuchtschriften', 'led buchstaben', 'neon schriften', 'aluminium', 'plexi', 'acrylglas', 'neon systeme', 'led module', 'glasbläserei', 'vollplexi', 'buchstaben', 'schriften', 'beleuchtung', 'leuchten', 'light', 'letters', 'signage', 'fassade', 'außenwerbung', 'corporate design', 'logo', 'firmenname', 'beschriftung', 'individuell', 'maßgeschneidert']
      },
      { 
        title: 'Leuchttransparente',
        url: 'lichtwerbung/leuchttransparente.html', 
        description: 'Moderne Leuchttransparente für effektvolle Werbebotschaften',
        category: 'Lichtwerbung',
        keywords: ['leuchttransparente', 'transparente', 'leuchtkasten', 'lightbox', 'led panel', 'acrylglas', 'plexiglas', 'beleuchtung', 'werbung', 'fassade', 'schaufenster', 'display', 'transparent', 'durchleuchtet', 'hinterleuchtet', 'modern', 'elegant']
      },
      { 
        title: 'Halbrelief-/Plattenschriften',
        url: 'lichtwerbung/halbrelief-plattenschriften.html',
        description: 'Hochwertige Halbrelief- und Plattenschriften für edle Erscheinungsbilder',
        category: 'Lichtwerbung', 
        keywords: ['halbrelief', 'plattenschriften', 'relief', 'aluminium', 'edelstahl', 'bronze', 'messing', 'geschliffen', 'gebürstet', 'eloxiert', 'lackiert', 'eingefräst', 'erhaben', 'dimensional', 'plastisch', 'hochwertig', 'edel', 'corporate', 'repräsentativ']
      },
      { 
        title: 'Neon / LED-Technik',
        url: 'lichtwerbung/neon-led-technik.html',
        description: 'Modernste LED-Technik und traditionelle Neon-Röhren aus eigener Fertigung',
        category: 'Lichtwerbung',
        keywords: ['neon', 'led', 'technik', 'röhren', 'strips', 'pixel', 'digital', 'rgb', 'programmierbar', 'steuerung', 'dmx', 'fernbedienung', 'app', 'bluetooth', 'wifi', 'energiesparend', 'langlebig', 'wartungsarm', 'flexible', 'biegbar', 'wasserdicht']
      },
      { 
        title: 'Pylonen',
        url: 'lichtwerbung/pylonen.html',
        description: 'Imposante Pylonen und Werbesäulen für maximale Fernwirkung',
        category: 'Lichtwerbung',
        keywords: ['pylonen', 'werbesäulen', 'mast', 'stele', 'totem', 'wegweiser', 'orientierung', 'leitsystem', 'außenwerbung', 'fernwirkung', 'sichtbarkeit', 'standort', 'eingang', 'parkplatz', 'gelände', 'firma', 'unternehmen', 'auffällig', 'imposant']
      },
      
      // BESCHRIFTUNGEN HAUPTSEITE
      { 
        title: 'Beschriftungen',
        url: 'beschriftungen.html',
        description: 'Professionelle Beschriftungen für Fahrzeuge, Gebäude und mehr',
        category: 'Beschriftungen',
        keywords: ['beschriftungen', 'beschriftung', 'folierung', 'beklebung', 'digitaldruck', 'plotterdruck', 'aufkleber', 'sticker', 'vinyl', 'folie', 'outdoor', 'wetterfest', 'langlebig', 'individuell']
      },
      
      // BESCHRIFTUNGEN UNTERSEITEN
      { 
        title: 'Signaletik',
        url: 'beschriftungen/signaletik.html',
        description: 'Durchdachte Leitsysteme und Signaletik für optimale Orientierung',
        category: 'Beschriftungen',
        keywords: ['signaletik', 'leitsystem', 'orientierung', 'wegweiser', 'beschilderung', 'hinweisschilder', 'piktogramme', 'symbole', 'barrierefreiheit', 'braille', 'tastbar', 'kontrast', 'lesbarkeit', 'verständlich', 'intuitiv', 'navigation']
      },
      { 
        title: 'Tafelbeschriftung',
        url: 'beschriftungen/tafelbeschriftung.html',
        description: 'Klassische und moderne Tafelbeschriftungen für jeden Anspruch',
        category: 'Beschriftungen',
        keywords: ['tafelbeschriftung', 'schilder', 'tafeln', 'hinweistafeln', 'warntafeln', 'infotafeln', 'aluminium', 'kunststoff', 'alu dibond', 'pvc', 'forex', 'gravur', 'fräsung', 'druck', 'laminierung', 'wetterfest', 'uv-beständig']
      },
      { 
        title: 'Fahrzeugbeschriftung',
        url: 'beschriftungen/fahrzeugbeschriftung.html',
        description: 'Ihre Fahrzeuge als fahrende Werbung mit professioneller Beschriftung',
        category: 'Beschriftungen',
        keywords: ['fahrzeugbeschriftung', 'fahrzeugfolierung', 'autowerbung', 'transporter', 'lkw', 'anhänger', 'fleet', 'fuhrpark', 'mobile werbung', 'car wrapping', 'vollfolierung', 'teilfolierung', 'logo', 'kontaktdaten', 'website', 'telefon', 'auffällig', 'professionell']
      },
      { 
        title: 'Fensterbeschriftung',
        url: 'beschriftungen/fensterbeschriftung.html',
        description: 'Attraktive Schaufenster- und Fensterbeschriftungen für Ihren Auftritt',
        category: 'Beschriftungen',
        keywords: ['fensterbeschriftung', 'schaufenster', 'glasdekor', 'fensterfolie', 'milchglas', 'sichtschutz', 'privacy', 'sonnenschutz', 'uv-schutz', 'werbung', 'öffnungszeiten', 'kontakt', 'logo', 'dekoration', 'design', 'modern', 'elegant']
      },
      { 
        title: 'Blachen und Fahnen',
        url: 'beschriftungen/blachen-fahnen.html',
        description: 'Wetterbeständige Blachen und Fahnen für temporäre und dauerhafte Werbung',
        category: 'Beschriftungen',
        keywords: ['blachen', 'fahnen', 'banner', 'plane', 'mesh', 'netz', 'gerüst', 'baustelle', 'event', 'messe', 'festival', 'outdoor', 'wind', 'wetter', 'uv', 'reißfest', 'ösen', 'keder', 'hängung', 'befestigung']
      },
      { 
        title: 'Grossformatdruck',
        url: 'beschriftungen/grossformatdruck.html',
        description: 'Hochauflösender Grossformatdruck für beeindruckende Werbebotschaften',
        category: 'Beschriftungen',
        keywords: ['grossformatdruck', 'digitaldruck', 'plakat', 'poster', 'roll up', 'display', 'exhibition', 'messe', 'präsentation', 'hochauflösend', 'fotorealistisch', 'farbecht', 'laminierung', 'kaschierung', 'aufziehen', 'montage']
      },
      
      // DIGITAL SIGNAGE
      { 
        title: 'Digital Signage',
        url: 'digital-signage.html',
        description: 'Moderne Digital Signage Lösungen für zeitgemäße Kommunikation',
        category: 'Digital Signage',
        keywords: ['digital signage', 'led display', 'bildschirm', 'monitor', 'touchscreen', 'interaktiv', 'multimedia', 'content management', 'cms', 'fernsteuerung', 'cloud', 'programmierung', 'automation', 'schedule', 'playlist', 'werbung', 'information', 'real time', 'live']
      },
      
      // DIENSTLEISTUNGEN
      { 
        title: 'Dienstleistungen',
        url: 'dienstleistungen.html',
        description: 'Umfassende Dienstleistungen rund um Werbetechnik und Montage',
        category: 'Service',
        keywords: ['dienstleistungen', 'service', 'beratung', 'planung', 'konzept', 'design', 'montage', 'installation', 'wartung', 'reparatur', 'bewilligung', 'behörde', 'genehmigung', 'projekt', 'abwicklung', 'komplettlösung', 'full service', 'unterhalt']
      },
      
      // UNTERNEHMEN
      { 
        title: 'Firmengeschichte',
        url: 'neon-murer/firmengeschichte.html',
        description: '75 Jahre Tradition und Innovation in der Werbetechnik',
        category: 'Unternehmen',
        keywords: ['firmengeschichte', 'geschichte', 'tradition', '75 jahre', 'erfahrung', 'familienunternehmen', 'murer', 'gründung', 'entwicklung', 'meilensteine', 'generationen', 'kompetenz', 'know how', 'qualität', 'zuverlässigkeit', 'partnerschaft']
      },
      { 
        title: 'Fachkompetenzen',
        url: 'neon-murer/fachkompetenzen.html',
        description: 'Unsere vielfältigen Fachkompetenzen in der Werbetechnik',
        category: 'Unternehmen',
        keywords: ['fachkompetenzen', 'kompetenzen', 'expertise', 'fachwissen', 'spezialisierung', 'glasbläserei', 'spenglerei', 'elektrik', 'montage', 'design', 'beratung', 'qualifikation', 'ausbildung', 'zertifizierung', 'können', 'wissen']
      },
      { 
        title: 'Kontaktpersonen',
        url: 'neon-murer/kontaktpersonen.html',
        description: 'Ihre Ansprechpartner für alle Bereiche der Werbetechnik',
        category: 'Unternehmen',
        keywords: ['kontaktpersonen', 'team', 'ansprechpartner', 'mitarbeiter', 'personal', 'beratung', 'verkauf', 'montage', 'service', 'leitung', 'geschäftsführung', 'verantwortlich', 'zuständig', 'erreichbar', 'kompetent']
      },
      { 
        title: 'Stellenangebote',
        url: 'neon-murer/stellenangebote.html',
        description: 'Karrieremöglichkeiten bei Neon Murer - Werden Sie Teil unseres Teams',
        category: 'Unternehmen',
        keywords: ['stellenangebote', 'jobs', 'karriere', 'arbeitsplatz', 'stelle', 'bewerbung', 'lehrstelle', 'praktikum', 'ausbildung', 'anstellung', 'vollzeit', 'teilzeit', 'fachkraft', 'spezialist', 'monteur', 'elektriker', 'designer', 'verkäufer']
      },
      { 
        title: 'News & Informationen',
        url: 'neon-murer/news.html',
        description: 'Aktuelle Neuigkeiten und Informationen von Neon Murer',
        category: 'Unternehmen',
        keywords: ['news', 'neuigkeiten', 'informationen', 'aktuell', 'medien', 'presse', 'artikel', 'berichte', 'projekte', 'referenzen', 'erfolge', 'auszeichnungen', 'events', 'messen', 'termine', 'ankündigungen']
      }
    ];



    
    this.init();
  }

  init() {
    this.createModernSearchModal();
    this.bindSearchEvents();
  }

  // ===== PATH MANAGEMENT =====
  getPathPrefix() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment.length > 0);
    
    // Check if we're in a subfolder
    const subfolders = ['lichtwerbung', 'beschriftungen', 'neon-murer'];
    const currentFolder = segments[segments.length - 2]; // Second to last segment (folder name)
    
    if (subfolders.includes(currentFolder)) {
      return '../';
    }
    
    return '';
  }

  adjustUrl(url) {
    // Don't adjust URLs that are already absolute or have path prefixes
    if (url.startsWith('http') || url.startsWith('../') || url.startsWith('/')) {
      return url;
    }
    
    return this.pathPrefix + url;
  }

  createModernSearchModal() {
    // Prüfen ob Modal bereits existiert
    if (document.getElementById('modern-search-modal')) return;

    const modalHTML = `
      <div id="modern-search-modal" class="modern-search-modal">
        <div class="search-backdrop" onclick="modernNeonSearch.closeSearch()"></div>
        <div class="modern-search-container">
          <!-- Header -->
          <div class="search-header">
            <div class="search-brand">
              <i class="fas fa-search search-brand-icon"></i>
              <span class="search-brand-text">Suche</span>
            </div>
            <button class="search-close-btn" onclick="modernNeonSearch.closeSearch()" aria-label="Suche schließen">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Modern Search Input -->
          <div class="search-input-section">
            <div class="search-input-container">
              <div class="search-input-wrapper">
                <i class="fas fa-search search-input-icon"></i>
                <input type="text" 
                       id="modern-search-input" 
                       placeholder="Wonach suchen Sie heute?" 
                       autocomplete="off"
                       spellcheck="false"
                       aria-label="Suchbegriff eingeben">
                <div class="search-input-actions">

                  <button class="search-clear-btn" onclick="modernNeonSearch.clearSearch()" style="display: none;" aria-label="Eingabe löschen">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="search-suggestions-dropdown" id="search-suggestions-dropdown" style="display: none;"></div>
            </div>
          </div>



          <!-- Search Results -->
          <div class="search-results-container">
            <div id="search-results" class="search-results"></div>
            <div id="search-initial-state" class="search-initial-state">
              <!-- Schnellzugriff -->
              <div class="quick-access-section">
                <div class="quick-access-grid">
                  <a href="${this.adjustUrl('lichtwerbung.html')}" class="quick-access-item">Lichtwerbung</a>
                  <a href="${this.adjustUrl('beschriftungen.html')}" class="quick-access-item">Beschriftungen</a>
                  <a href="${this.adjustUrl('digital-signage.html')}" class="quick-access-item">Digital Signage</a>
                  <a href="${this.adjustUrl('dienstleistungen.html')}" class="quick-access-item">Dienstleistungen</a>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.addModernSearchStyles();
  }

  addModernSearchStyles() {
    if (document.getElementById('modern-search-styles')) return;

    const styles = `
      <style id="modern-search-styles">
        /* Schlichtes Search Modal - Minimalistisch */
        .modern-search-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: none;
        }

        .modern-search-modal.active {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .search-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }

        .modern-search-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        /* Einfacher Header */
        .search-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: #09226c;
          color: white;
        }

        .search-brand {
          font-weight: 600;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
        }

        .search-close-btn {
          background: none;
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.8;
        }

        .search-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          opacity: 1;
        }

        /* Einfaches Search Input */
        .search-input-section {
          padding: 1.5rem;
          background: white;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 0.75rem;
        }

        .search-input-wrapper:focus-within {
          border-color: #09226c;
          background: white;
        }

        .search-input-icon {
          color: #6c757d;
          margin-right: 0.75rem;
          font-size: 0.9rem;
        }

        #modern-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: #333;
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }

        #modern-search-input::placeholder {
          color: #adb5bd;
        }

        .search-clear-btn {
          background: none;
          border: none;
          color: #6c757d;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .search-clear-btn:hover {
          background: #e9ecef;
          color: #09226c;
        }

        /* Suggestions Dropdown - Schlicht */
        .search-suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-top: none;
          border-radius: 0 0 6px 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          border-bottom: 1px solid #f8f9fa;
          font-size: 0.9rem;
        }

        .suggestion-item:hover,
        .suggestion-item.selected {
          background: #f8f9fa;
        }

        /* Results Container - Minimalistisch */
        .search-results-container {
          flex: 1;
          overflow-y: auto;
          background: white;
        }

        .search-results {
          padding: 1rem 1.5rem;
          min-height: 200px;
        }

        .search-result-item {
          background: white;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          border: 1px solid #e9ecef;
          cursor: pointer;
        }

        .search-result-item:hover {
          border-color: #09226c;
          background: #f8f9fa;
        }

        .result-title {
          font-size: 1rem;
          font-weight: 600;
          color: #09226c;
          margin-bottom: 0.25rem;
          font-family: 'DM Sans', sans-serif;
        }

        .result-description {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .result-category {
          display: inline-block;
          background: #09226c;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        /* Initial State - Schlicht */
        .search-initial-state {
          padding: 1.5rem;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .quick-access-item {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
          text-decoration: none;
          color: #495057;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
        }

        .quick-access-item:hover {
          background: #09226c;
          color: white;
          text-decoration: none;
        }

        /* Empty State */
        .search-empty-state {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-search-modal.active {
            padding: 1rem;
          }
          
          .modern-search-container {
            max-width: 100%;
          }
          
          .quick-access-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  bindSearchEvents() {
    document.addEventListener('keydown', (e) => {
      // CMD/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        this.closeSearch();
      }
      
      // Handle navigation in search
      if (this.isSearchOpen()) {
        this.handleKeyNavigation(e);
      }
    });

    // Bind input events after modal creation
    setTimeout(() => {
      const searchInput = document.getElementById('modern-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        searchInput.addEventListener('focus', () => this.showSuggestions());
        searchInput.addEventListener('blur', () => {
          // Delay hiding suggestions to allow clicking
          setTimeout(() => this.hideSuggestions(), 150);
        });
      }
    }, 100);
  }

  openSearch() {
    const modal = document.getElementById('modern-search-modal');
    const input = document.getElementById('modern-search-input');
    
    if (modal && input) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus input after animation
      setTimeout(() => {
        input.focus();
        this.showInitialState();
      }, 100);
    }
  }

  closeSearch() {
    const modal = document.getElementById('modern-search-modal');
    
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      this.clearSearch();
      this.hideSuggestions();
    }
  }

  isSearchOpen() {
    const modal = document.getElementById('modern-search-modal');
    return modal && modal.classList.contains('active');
  }

  clearSearch() {
    const input = document.getElementById('modern-search-input');
    const clearBtn = document.querySelector('.search-clear-btn');
    
    if (input) {
      input.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      this.showInitialState();
      this.hideSuggestions();
    }
  }

  async handleSearchInput(e) {
    const query = e.target.value.trim();
    const clearBtn = document.querySelector('.search-clear-btn');
    
    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = query ? 'flex' : 'none';
    }
    
    if (query.length === 0) {
      this.showInitialState();
      this.hideSuggestions();
      return;
    }
    
    if (query.length >= 2) {
      await this.performSearch(query);
      this.showSuggestions(query);
    }
  }

  async performSearch(query) {
    // Combine static and dynamic search results
    const staticResults = this.searchPages(query);
    const dynamicResults = await this.searchDynamicContent(query);
    
    // Merge and sort results by score
    const allResults = [...staticResults, ...dynamicResults];
    allResults.sort((a, b) => b.score - a.score);
    
    this.displayResults(allResults, query);
    
    // Hide initial state
    const initialState = document.getElementById('search-initial-state');
    if (initialState) {
      initialState.style.display = 'none';
    }
  }

  async searchDynamicContent(query) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) {
        console.warn('Dynamic search failed:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.warn('Dynamic search error:', error);
      return [];
    }
  }

  searchPages(query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let results = [];

    this.searchablePages.forEach(page => {
      let score = 0;
      let matches = [];

      // Search in title (highest weight)
      const titleMatches = this.findMatches(page.title.toLowerCase(), searchTerms);
      score += titleMatches.length * 10;
      matches.push(...titleMatches);

      // Search in description
      const descMatches = this.findMatches(page.description.toLowerCase(), searchTerms);
      score += descMatches.length * 5;
      matches.push(...descMatches);

      // Search in keywords
      const keywordMatches = this.findMatches(page.keywords.join(' ').toLowerCase(), searchTerms);
      score += keywordMatches.length * 3;
      matches.push(...keywordMatches);

      // Fuzzy matching for typos
      searchTerms.forEach(term => {
        page.keywords.forEach(keyword => {
          if (this.fuzzyMatch(term, keyword.toLowerCase())) {
            score += 2;
            matches.push(keyword);
          }
        });
      });

      if (score > 0) {
        results.push({
          ...page,
          score,
          matches: [...new Set(matches)]
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  findMatches(text, searchTerms) {
    const matches = [];
    searchTerms.forEach(term => {
      if (text.includes(term)) {
        matches.push(term);
      }
    });
    return matches;
  }

  fuzzyMatch(pattern, text) {
    if (pattern.length > text.length) return false;
    if (pattern.length === text.length) return pattern === text;

    let patternIdx = 0;
    let textIdx = 0;
    
    while (patternIdx < pattern.length && textIdx < text.length) {
      if (pattern[patternIdx] === text[textIdx]) {
        patternIdx++;
      }
      textIdx++;
    }
    
    return patternIdx === pattern.length;
  }

  displayResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <p>Keine Ergebnisse gefunden</p>
        </div>
      `;
      return;
    }

    const html = results.map(result => {
      // Add category badge for dynamic results
      const categoryBadge = result.category ? `<span class="result-category">${result.category}</span>` : '';
      
      return `
        <div class="search-result-item" onclick="modernNeonSearch.openResult('${result.url}', '${result.title}')">
          ${categoryBadge}
          <div class="result-title">
            ${this.highlightText(result.title, query)}
          </div>
          <div class="result-description">
            ${this.highlightText(result.description, query)}
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = html;
  }

  highlightText(text, query) {
    if (!query) return text;
    
    const terms = query.split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<strong>$1</strong>');
    });
    
    return highlightedText;
  }

  getCategoryIcon(category) {
    const icons = {
      'Lichtwerbung': 'fa-lightbulb',
      'Beschriftungen': 'fa-pen-fancy',
      'Digital Signage': 'fa-tv',
      'Service': 'fa-tools',
      'Unternehmen': 'fa-building',
      'Hauptseite': 'fa-home'
    };
    return icons[category] || 'fa-file';
  }

  showSuggestions(query = '') {
    if (!query || query.length < 2) return;
    
    const dropdown = document.getElementById('search-suggestions-dropdown');
    const suggestions = this.generateSuggestions(query);
    
    if (suggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }
    
    const html = suggestions.map(suggestion => `
      <div class="suggestion-item" onclick="modernNeonSearch.selectSuggestion('${suggestion.text}')">
        ${this.highlightText(suggestion.text, query)}
      </div>
    `).join('');
    
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  }

  hideSuggestions() {
    const dropdown = document.getElementById('search-suggestions-dropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }

  generateSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    // Search in page titles
    this.searchablePages.forEach(page => {
      if (page.title.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: page.title,
          score: 10
        });
      }
    });
    
    // Remove duplicates and sort by score
    const uniqueSuggestions = suggestions.filter((item, index, self) => 
      index === self.findIndex(t => t.text === item.text)
    );
    
    return uniqueSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  selectSuggestion(text) {
    const input = document.getElementById('modern-search-input');
    if (input) {
      input.value = text;
      this.handleSearchInput({ target: input });
      this.hideSuggestions();
    }
  }

  async searchFor(term) {
    const input = document.getElementById('modern-search-input');
    if (input) {
      input.value = term;
      await this.handleSearchInput({ target: input });
    }
  }

  openResult(url, title) {
    this.closeSearch();
    
    // Adjust URL if needed and navigate
    const adjustedUrl = this.adjustUrl(url);
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      window.location.href = adjustedUrl;
    }, 100);
  }



  showInitialState() {
    const initialState = document.getElementById('search-initial-state');
    const resultsContainer = document.getElementById('search-results');
    
    if (initialState && resultsContainer) {
      initialState.style.display = 'block';
      resultsContainer.innerHTML = '';
    }
  }

  handleKeyNavigation(e) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    const results = document.querySelectorAll('.search-result-item');
    const items = [...suggestions, ...results];
    
    if (items.length === 0) return;
    
    let currentIndex = -1;
    items.forEach((item, index) => {
      if (item.classList.contains('selected')) {
        currentIndex = index;
      }
    });
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        this.updateSelection(items, currentIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, -1);
        this.updateSelection(items, currentIndex);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && items[currentIndex]) {
          items[currentIndex].click();
        }
        break;
    }
  }

  updateSelection(items, selectedIndex) {
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedIndex);
    });
    
    // Scroll into view
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }




}

// Initialization is now handled by simple-template-loader.js
// This ensures consistent behavior across all pages

// Global function for opening search (backwards compatibility)
function openSearchModal() {
  if (window.modernNeonSearch) {
    window.modernNeonSearch.openSearch();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernNeonSearch;
}
