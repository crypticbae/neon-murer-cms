/**
 * Intelligente Suchfunktion für Neon Murer Website
 * Durchsucht alle HTML-Seiten nach Suchbegriffen
 */

class NeonMurerSearch {
  constructor() {
    this.searchablePages = [
      // HAUPTSEITEN
      { 
        title: 'Startseite', 
        url: 'index.html',
        keywords: ['neon murer', 'lichtwerbung', 'beschriftungen', 'digital signage', 'leuchtwerbung', 'werbetechnik', 'rapperswil', 'jona', 'startseite', 'home', 'hauptseite', 'unternehmen', 'firma', 'ag', '75 jahre', 'erfahrung', 'tradition', 'qualität', 'swiss made', 'schweiz', 'zürich', 'ostschweiz']
      },
      
      // LICHTWERBUNG HAUPTSEITE
      { 
        title: 'Lichtwerbung', 
        url: 'lichtwerbung.html',
        keywords: ['lichtwerbung', 'leuchtwerbung', 'aussenwerbung', 'neon', 'led', 'beleuchtung', 'werbetechnik', 'fassadenwerbung', 'leuchtend', 'schriften', 'transparente', 'pylonen', 'neon technik', 'led technik', 'halbrelief', 'plattenschriften', 'overview', 'übersicht']
      },
      
      // LICHTWERBUNG UNTERSEITEN
      { 
        title: 'Leuchtschriften', 
        url: 'lichtwerbung/leuchtschriften.html',
        keywords: ['leuchtschriften', 'led buchstaben', 'neon schriften', 'aluminium', 'plexi', 'acrylglas', 'neon systeme', 'led module', 'glasbläserei', 'vollplexi', 'buchstaben', 'schriften', 'beleuchtung', 'leuchten', 'light', 'letters', 'signage', 'fassade', 'außenwerbung', 'corporate design', 'logo', 'firmenname', 'beschriftung', 'individuell', 'maßgeschneidert']
      },
      { 
        title: 'Leuchttransparente', 
        url: 'lichtwerbung/leuchttransparente.html',
        keywords: ['leuchttransparente', 'aluminium', 'acrylglas', 'beleuchtung', 'neon systeme', 'led module', 'vollplexi', 'belisama', 'spanntuch', 'transparente', 'leuchtkasten', 'lightbox', 'werbetafel', 'reklametafel', 'außenwerbung', 'fassadenwerbung', 'geschäftswerbung', 'leuchtende', 'werbung', 'corporate', 'branding']
      },
      { 
        title: 'Halbrelief-/Plattenschriften', 
        url: 'lichtwerbung/halbrelief-plattenschriften.html',
        keywords: ['halbrelief', 'plattenschriften', 'aluminium schriften', 'fassade', 'innenbereich', 'scheinwerfer', 'beleuchtung', 'relief', 'platten', 'buchstaben', 'erhaben', '3d', 'dimensional', 'elegant', 'hochwertig', 'premium', 'außenbeleuchtung', 'anstrahlung', 'spots', 'firmenbeschilderung']
      },
      { 
        title: 'Neon / LED-Technik', 
        url: 'lichtwerbung/neon-led-technik.html',
        keywords: ['neon', 'led technik', 'energieeffizienz', 'offenes neon', 'glasbläserei', 'kunstobjekte', 'umrüstung', 'led leuchtschriften', 'neon style', 'klassisch', 'modern', 'energiesparend', 'wartungsarm', 'langlebig', 'farbig', 'rgb', 'steuerung', 'programmierbar', 'kunst', 'design']
      },
      { 
        title: 'Pylonen', 
        url: 'lichtwerbung/pylonen.html',
        keywords: ['pylonen', 'led displays', 'temperatur anzeigen', 'datum', 'uhrzeit', 'led laufschriften', 'programmierbar', 'leuchtpylonen', 'aussenwerbung', 'stelen', 'monolithen', 'wegweiser', 'orientierung', 'information', 'digital', 'anzeige', 'display', 'outdoor', 'wetterfest', 'tankstelle', 'einkaufszentrum', 'parkplatz']
      },
      
      // BESCHRIFTUNGEN HAUPTSEITE
      { 
        title: 'Beschriftungen', 
        url: 'beschriftungen.html',
        keywords: ['beschriftungen', 'beschilderung', 'werbetechnik', 'fahrzeugbeschriftung', 'fensterbeschriftung', 'tafelbeschriftung', 'signaletik', 'blachen', 'fahnen', 'grossformatdruck', 'folierung', 'digitaldruck', 'schilder', 'overview', 'übersicht']
      },
      
      // BESCHRIFTUNGEN UNTERSEITEN
      { 
        title: 'Signaletik', 
        url: 'beschriftungen/signaletik.html',
        keywords: ['signaletik', 'orientierung', 'wegweiser', 'leitsystem', 'beschilderung', 'navigation', 'hinweisschilder', 'türschilder', 'raumnummer', 'bürogebäude', 'hospital', 'schule', 'hotel', 'einkaufszentrum', 'öffentlich', 'gebäude', 'barrierefrei', 'accessibilty', 'blindenschrift', 'braille', 'piktogramme', 'icons', 'corporate design', 'orientierungssystem', 'indoor', 'innenbereich']
      },
      { 
        title: 'Tafelbeschriftung', 
        url: 'beschriftungen/tafelbeschriftung.html',
        keywords: ['tafelbeschriftung', 'schilder', 'tafeln', 'geschäftsschilder', 'werbetafeln', 'hinweistafeln', 'werbeschilder', 'sicherheitsschilder', 'aluminium', 'acrylglas', 'dibond', 'kunststoff', 'holz', 'außenschilder', 'firmenschilder', 'praxisschilder', 'büroschilder', 'restaurant', 'laden', 'geschäft', 'wetterfest', 'uv-beständig', 'langlebig']
      },
      { 
        title: 'Fahrzeugbeschriftung', 
        url: 'beschriftungen/fahrzeugbeschriftung.html',
        keywords: ['fahrzeugbeschriftung', 'auto', 'lkw', 'bus', 'folierung', 'fahrzeugwerbung', 'mobil', 'werbung', 'vollfolierung', 'firmenbeschriftung', 'folie', 'autofolierung', 'car wrapping', 'vehicle graphics', 'transporter', 'lieferwagen', 'lastwagen', 'anhänger', 'trailer', 'motorrad', 'boot', 'reflektierend', 'digitaldruck', 'plotterfolie', 'teilfolierung', 'spots', 'logo', 'firmenfahrzeug']
      },
      { 
        title: 'Fensterbeschriftung', 
        url: 'beschriftungen/fensterbeschriftung.html',
        keywords: ['fensterbeschriftung', 'fenster', 'glas', 'scheiben', 'schaufenster', 'glasfolie', 'milchglas', 'sichtschutz', 'privacy', 'öffnungszeiten', 'geschäftszeiten', 'opening hours', 'kontaktdaten', 'telefon', 'website', 'social media', 'plotterfolie', 'digitaldruck', 'frosting', 'etching', 'sandstrahlen', 'satiniert', 'restaurant', 'laden', 'büro', 'praxis', 'klinik']
      },
      { 
        title: 'Blachen und Fahnen', 
        url: 'beschriftungen/blachen-fahnen.html',
        keywords: ['blachen', 'fahnen', 'flaggen', 'banner', 'mesh', 'gerüstplane', 'bauzaun', 'windschutz', 'sichtschutz', 'outdoor', 'wetterfest', 'uv-beständig', 'digitaldruck', 'grossformat', 'event', 'messe', 'festival', 'werbebanner', 'promotion', 'temporär', 'saison', 'baustellenwerbung', 'gerüstwerbung', 'bauplanen']
      },
      { 
        title: 'Grossformatdruck', 
        url: 'beschriftungen/grossformatdruck.html',
        keywords: ['grossformatdruck', 'großformat', 'large format', 'digitaldruck', 'plotter', 'vinyl', 'banner', 'poster', 'aufkleber', 'sticker', 'folie', 'plane', 'mesh', 'canvas', 'papier', 'outdoor', 'indoor', 'wetterfest', 'uv-beständig', 'laminiert', 'messe', 'event', 'promotion', 'werbemittel', 'display', 'roll up', 'pop up', 'exhibition']
      },
      
      // DIGITAL SIGNAGE
      { 
        title: 'Digital Signage', 
        url: 'digital-signage.html',
        keywords: ['digital signage', 'digitale werbung', 'displays', 'screens', 'monitore', 'led walls', 'video walls', 'interaktiv', 'touchscreen', 'content management', 'cms', 'player', 'media player', 'advertising', 'werbung', 'information', 'kommunikation', 'indoor', 'outdoor', 'retail', 'einzelhandel', 'restaurant', 'hotel', 'büro', 'empfang', 'lobby', 'smart signage', 'iot', 'vernetzt', 'cloud', 'fernsteuerung', 'programmierung', 'playlist', 'scheduling']
      },
      
      // LEISTUNGEN
      { 
        title: 'Dienstleistungen', 
        url: 'dienstleistungen.html',
        keywords: ['dienstleistungen', 'services', 'beratung', 'consultation', 'planung', 'design', 'bewilligung', 'genehmigung', 'permits', 'montage', 'installation', 'reparatur', 'repair', 'service', 'wartung', 'maintenance', 'reinigung', 'cleaning', 'weihnachtsbeleuchtung', 'christmas', 'festbeleuchtung', 'seasonal', 'saisonal', 'vollservice', 'rundum', 'komplettlösung', 'betreuung', 'support', 'umbau', 'renovation']
      },
      
      // UNTERNEHMEN / NEON MURER
      { 
        title: 'Firmengeschichte', 
        url: 'neon-murer/firmengeschichte.html',
        keywords: ['firmengeschichte', 'geschichte', 'history', 'tradition', '1949', '75 jahre', 'josef murer', 'gründung', 'entwicklung', 'generationen', 'familienbetrieb', 'erfahrung', 'kompetenz', 'evolution', 'vergangenheit', 'zukunft', 'meilensteine', 'erfolg', 'wachstum', 'rapperswil', 'jona', 'ostschweiz']
      },
      { 
        title: 'Fachkompetenzen', 
        url: 'neon-murer/fachkompetenzen.html',
        keywords: ['fachkompetenzen', 'kompetenzen', 'expertise', 'fertigkeiten', 'knowhow', 'fähigkeiten', 'spezialisierung', 'qualifikation', 'zertifizierung', 'esti', 'ausbildung', 'weiterbildung', 'innovation', 'technologie', 'qualitätsstandards', 'swiss quality', 'professionalität', 'können', 'skills', 'capabilities']
      },
      { 
        title: 'Kontaktpersonen', 
        url: 'neon-murer/kontaktpersonen.html',
        keywords: ['kontakt', 'team', 'mitarbeiter', 'ansprechpartner', 'telefon', 'email', 'adresse', 'contact', 'staff', 'employees', 'personnel', 'geschäftsleitung', 'management', 'verkauf', 'sales', 'beratung', 'montage', 'techniker', 'administration', 'büro', 'office', 'standort', 'location', 'öffnungszeiten', 'erreichbarkeit', 'benno murer', 'benno', 'murer', 'andreas zybach', 'andreas', 'zybach', 'roman janser', 'roman', 'janser', 'sandy jucker', 'sandy', 'jucker', 'beatrice murer', 'beatrice', 'bea', 'jan vetter', 'jan', 'vetter', 'produktionsleiter', 'geschäftsführung', 'graphik', 'werbung', 'schriftenmalerei', 'werk uznach', 'werk jona', 'uznach', 'jona']
      },
      { 
        title: 'Stellenangebote', 
        url: 'neon-murer/stellenangebote.html',
        keywords: ['stellenangebote', 'jobs', 'karriere', 'career', 'bewerbung', 'arbeit', 'employment', 'arbeitsplätze', 'team', 'mitarbeiter', 'stelle', 'position', 'vollzeit', 'teilzeit', 'lehrstelle', 'praktikum', 'ausbildung', 'techniker', 'montage', 'verkauf', 'administration', 'benefits', 'arbeitsklima', 'familiär', 'entwicklung']
      },
      { 
        title: 'News & Informationen', 
        url: 'neon-murer/news.html',
        keywords: ['news', 'neuigkeiten', 'informationen', 'aktuelles', 'events', 'messen', 'projekte', 'referenzen', 'updates', 'pressemitteilungen', 'blog', 'artikel', 'trends', 'innovationen', 'branchen news', 'unternehmen news', 'entwicklungen', 'success stories', 'case studies']
      },
      
      // RECHTLICHE SEITEN
      { 
        title: 'Impressum', 
        url: 'impressum.html',
        keywords: ['impressum', 'kontakt', 'adresse', 'telefon', 'email', 'geschäftsführung', 'handelsregister', 'uid', 'mwst', 'rechtliches', 'firmensitz', 'anschrift', 'postadresse', 'verantwortlich', 'inhaltlich', 'redaktion', 'webseite', 'website', 'haftung', 'disclaimer']
      },
      { 
        title: 'Datenschutzerklärung', 
        url: 'datenschutz.html',
        keywords: ['datenschutz', 'datenschutzerklärung', 'privacy', 'dsgvo', 'revdsg', 'cookies', 'analytics', 'google analytics', 'personendaten', 'datenverarbeitung', 'datenerfassung', 'auskunftsrecht', 'löschung', 'berichtigung', 'widerspruch', 'einwilligung', 'newsletter', 'kontaktformular', 'bewerbungen', 'tracking', 'statistiken']
      },
      { 
        title: 'Geschäftsbedingungen', 
        url: 'geschaeftsbedingungen.html',
        keywords: ['geschäftsbedingungen', 'agb', 'allgemeine geschäftsbedingungen', 'terms', 'conditions', 'vertrag', 'vertragsabschluss', 'lieferung', 'zahlung', 'preise', 'gewährleistung', 'garantie', 'haftung', 'rücktritt', 'kündigung', 'gerichtsstand', 'anwendbares recht', 'schweizer recht', 'montage', 'abnahme']
      }
    ];
    
    this.init();
  }

  init() {
    this.createSearchModal();
    this.bindSearchEvents();
  }

  createSearchModal() {
    // Prüfen ob Modal bereits existiert
    if (document.getElementById('search-modal')) return;

    const modalHTML = `
      <div id="search-modal" class="search-modal">
        <div class="search-modal-content">
          <div class="search-modal-header">
            <h3><i class="fas fa-search me-2"></i>Website durchsuchen</h3>
            <button class="search-close" onclick="neonMurerSearch.closeSearch()">&times;</button>
          </div>
          <div class="search-modal-body">
            <div class="search-input-wrapper">
              <i class="fa-solid fa-search search-icon"></i>
              <input type="text" id="search-input" placeholder="Nach Produkten, Dienstleistungen oder Inhalten suchen..." autocomplete="off">
              <button class="search-clear" onclick="neonMurerSearch.clearSearch()" style="display: none;">
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
            <div class="search-suggestions">
              <div class="search-suggestions-title">Beliebte Suchbegriffe:</div>
              <div class="search-suggestion-tags">
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Leuchtschriften')">Leuchtschriften</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('LED')">LED</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Neon')">Neon</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Digital Signage')">Digital Signage</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Fahrzeugbeschriftung')">Fahrzeugbeschriftung</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Pylonen')">Pylonen</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Beratung')">Beratung</span>
                <span class="search-tag" onclick="neonMurerSearch.searchFor('Montage')">Montage</span>
              </div>
            </div>
            <div id="search-results" class="search-results"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.addSearchStyles();
  }

  addSearchStyles() {
    if (document.getElementById('search-styles')) return;

    const styles = `
      <style id="search-styles">
        .search-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(17, 35, 87, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        .search-modal.active {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 80px;
        }

        .search-modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.4s ease;
        }

        .search-modal-header {
          background: linear-gradient(135deg, #112357 0%, #1a3066 100%);
          color: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px 20px 0 0;
        }

        .search-modal-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .search-close {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .search-close:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(90deg);
        }

        .search-modal-body {
          padding: 30px;
          max-height: calc(80vh - 120px);
          overflow-y: auto;
        }

        .search-input-wrapper {
          position: relative;
          margin-bottom: 30px;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #112357;
          font-size: 1.2rem;
          z-index: 2;
        }

        #search-input {
          width: 100%;
          padding: 18px 20px 18px 55px;
          border: 3px solid #e0e7ff;
          border-radius: 15px;
          font-size: 1.1rem;
          outline: none;
          transition: all 0.3s ease;
          background: #f8faff;
        }

        #search-input:focus {
          border-color: #ffd401;
          background: white;
          box-shadow: 0 0 0 5px rgba(255, 212, 1, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: #ffd401;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #112357;
        }

        .search-clear:hover {
          background: #112357;
          color: white;
          transform: translateY(-50%) scale(1.1);
        }

        .search-suggestions {
          margin-bottom: 30px;
        }

        .search-suggestions-title {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 15px;
          font-weight: 500;
        }

        .search-suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .search-tag {
          background: linear-gradient(45deg, #112357, #1a3066);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .search-tag:hover {
          background: #ffd401;
          color: #112357;
          border-color: #112357;
          transform: translateY(-2px);
        }

        .search-results {
          min-height: 200px;
        }

        .search-result-item {
          background: #f8faff;
          border: 2px solid #e0e7ff;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .search-result-item:hover {
          background: white;
          border-color: #ffd401;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .search-result-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #112357;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }

        .search-result-title::before {
          content: '🔍';
          margin-right: 10px;
          font-size: 1.1rem;
        }

        .search-result-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 15px;
          font-size: 1rem;
        }

        .search-result-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .search-keyword {
          background: rgba(255, 212, 1, 0.2);
          color: #112357;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid rgba(255, 212, 1, 0.4);
        }

        .no-results {
          text-align: center;
          padding: 50px 20px;
          color: #666;
        }

        .no-results i {
          font-size: 4rem;
          color: #ddd;
          margin-bottom: 20px;
          display: block;
        }

        .no-results p {
          font-size: 1.1rem;
          margin-bottom: 10px;
        }

        .no-results small {
          color: #999;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .search-modal-content {
            width: 95%;
            margin: 10px;
          }

          .search-modal-header {
            padding: 15px 20px;
          }

          .search-modal-body {
            padding: 20px;
          }
          
          .search-suggestion-tags {
            gap: 8px;
          }
          
          .search-tag {
            padding: 6px 12px;
            font-size: 0.85rem;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  bindSearchEvents() {
    // Event Listener für Escape-Taste
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('search-modal').classList.contains('active')) {
        this.closeSearch();
      }
    });

    // Event Listener für Klick außerhalb des Modals
    document.addEventListener('click', (e) => {
      if (e.target.id === 'search-modal') {
        this.closeSearch();
      }
    });
  }

  openSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    
    modal.classList.add('active');
    
    // Focus mit Verzögerung für bessere Animation
    setTimeout(() => {
      input.focus();
    }, 300);

    // Live Search
    input.oninput = (e) => this.handleSearch(e.target.value);
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        this.handleSearch(e.target.value);
      }
    };

    // Clear Button anzeigen/verstecken
    input.oninput = (e) => {
      const clearBtn = document.querySelector('.search-clear');
      if (e.target.value.length > 0) {
        clearBtn.style.display = 'flex';
      } else {
        clearBtn.style.display = 'none';
      }
      this.handleSearch(e.target.value);
    };

    // Suggestions verstecken wenn getippt wird
    input.onfocus = () => {
      if (input.value.length === 0) {
        document.querySelector('.search-suggestions').style.display = 'block';
      }
    };
  }

  closeSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.remove('active');
    
    // Reset
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
    document.querySelector('.search-clear').style.display = 'none';
    document.querySelector('.search-suggestions').style.display = 'block';
  }

  clearSearch() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-input').focus();
    document.getElementById('search-results').innerHTML = '';
    document.querySelector('.search-clear').style.display = 'none';
    document.querySelector('.search-suggestions').style.display = 'block';
  }

  searchFor(term) {
    const input = document.getElementById('search-input');
    input.value = term;
    this.handleSearch(term);
    document.querySelector('.search-suggestions').style.display = 'none';
  }

  handleSearch(query) {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (trimmedQuery.length === 0) {
      document.getElementById('search-results').innerHTML = '';
      document.querySelector('.search-suggestions').style.display = 'block';
      return;
    }

    document.querySelector('.search-suggestions').style.display = 'none';

    // Minimum 2 Zeichen für Suche
    if (trimmedQuery.length < 2) {
      document.getElementById('search-results').innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-search"></i>
          <p>Bitte geben Sie mindestens 2 Zeichen ein.</p>
        </div>
      `;
      return;
    }

    const results = this.searchPages(trimmedQuery);
    this.displayResults(results, trimmedQuery);
  }

  searchPages(query) {
    const queryWords = query.split(' ').filter(word => word.length > 1);
    const results = [];
    
    this.searchablePages.forEach(page => {
      let totalScore = 0;
      const matchedKeywords = [];

      queryWords.forEach(word => {
        // Titel Match (höchste Priorität)
        if (page.title.toLowerCase().includes(word)) {
          totalScore += 15;
        }

        // Keywords durchsuchen
        page.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(word)) {
            if (keyword.toLowerCase() === word) {
              totalScore += 10; // Exakter Match
            } else if (keyword.toLowerCase().startsWith(word)) {
              totalScore += 7; // Beginnt mit Suchwort
            } else {
              totalScore += 4; // Enthält Suchwort
            }
            
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
          }
        });
      });

      if (totalScore > 0) {
        results.push({
          ...page,
          score: totalScore,
          matchedKeywords: matchedKeywords.slice(0, 6) // Max 6 Keywords
        });
      }
    });

    // Nach Relevanz sortieren
    return results.sort((a, b) => b.score - a.score);
  }

  displayResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-search"></i>
          <p>Keine Ergebnisse für "<strong>${this.escapeHtml(query)}</strong>" gefunden.</p>
          <p><small>Versuchen Sie es mit Begriffen wie "Leuchtschriften", "LED", "Digital Signage", "Beschriftung", "Montage" oder "Beratung".</small></p>
        </div>
      `;
      return;
    }

    const resultsHTML = results.map(result => `
      <div class="search-result-item" onclick="neonMurerSearch.navigateToPage('${result.url}')">
        <div class="search-result-title">${this.highlightMatch(result.title, query)}</div>
        <div class="search-result-description">${this.getPageDescription(result)}</div>
        ${result.matchedKeywords.length > 0 ? `
          <div class="search-result-keywords">
            ${result.matchedKeywords.map(keyword => `
              <span class="search-keyword">${this.highlightMatch(keyword, query)}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    resultsContainer.innerHTML = `
      <div style="margin-bottom: 20px; color: #666; font-size: 0.95rem;">
        <strong>${results.length}</strong> Ergebnis${results.length !== 1 ? 'se' : ''} für "<strong>${this.escapeHtml(query)}</strong>"
      </div>
      ${resultsHTML}
    `;
  }

  highlightMatch(text, query) {
    const queryWords = query.split(' ').filter(word => word.length > 1);
    let highlightedText = text;
    
    queryWords.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark style="background: #ffd401; color: #112357; padding: 2px 4px; border-radius: 3px; font-weight: 600;">$1</mark>');
    });
    
    return highlightedText;
  }

  getPageDescription(page) {
    const descriptions = {
      'index.html': 'Willkommen bei Neon Murer AG - Ihr kompetenter Partner für Leuchtwerbung, Beschriftungen und Digital Signage seit über 75 Jahren in Rapperswil-Jona.',
      
      // LICHTWERBUNG
      'lichtwerbung.html': 'Übersicht unserer Lichtwerbung-Lösungen: Von klassischen Neon-Schriften bis zu modernen LED-Systemen für maximale Aufmerksamkeit.',
      'lichtwerbung/leuchtschriften.html': 'Individuelle LED-Buchstaben und Neon-Schriften aus Aluminium oder Vollplexi mit modernen LED-Modulen. Hochwertige Leuchtschriften für Fassaden und Innenräume.',
      'lichtwerbung/leuchttransparente.html': 'Massgeschneiderte Leuchttransparente aus Aluminium oder Acrylglas mit verschiedenen Beleuchtungsoptionen für maximale Werbewirkung.',
      'lichtwerbung/halbrelief-plattenschriften.html': 'Elegante Halbrelief- und Plattenschriften aus Aluminium für repräsentative Fassaden. Hochwertige Außenbeleuchtung mit Scheinwerfern.',
      'lichtwerbung/neon-led-technik.html': 'Moderne LED-Leuchtschriften im klassischen Neon-Style und traditionelles offenes Neon aus eigener Glasbläserei. Energieeffizient und wartungsarm.',
      'lichtwerbung/pylonen.html': 'Repräsentative Leuchtpylonen mit programmierbaren LED-Displays für Temperatur, Datum und Laufschriften. Perfekt für Tankstellen und Einkaufszentren.',
      
      // BESCHRIFTUNGEN
      'beschriftungen.html': 'Komplette Übersicht unserer Beschriftungs-Services: Fahrzeuge, Fenster, Tafeln, Signaletik, Blachen und Grossformatdruck.',
      'beschriftungen/signaletik.html': 'Professionelle Orientierungssysteme und Leitsysteme für Gebäude. Barrierefreie Beschilderung mit Piktogrammen und Braille-Schrift.',
      'beschriftungen/tafelbeschriftung.html': 'Individuelle Geschäfts- und Werbetafeln aus hochwertigen Materialien. Wetterfeste Außenschilder für Restaurants, Läden und Büros.',
      'beschriftungen/fahrzeugbeschriftung.html': 'Professionelle Fahrzeugbeschriftungen und Vollfolierungen für PKW, LKW und Busse. Mobile Werbung mit höchster Qualität und Langlebigkeit.',
      'beschriftungen/fensterbeschriftung.html': 'Schaufensterbeschriftung mit Öffnungszeiten, Kontaktdaten und Logos. Sichtschutzfolien und Milchglaseffekte für Büros und Praxen.',
      'beschriftungen/blachen-fahnen.html': 'Wetterfeste Werbebanner, Bauzaunblachen und Fahnen im Digitaldruck. Perfekt für Events, Messen und Baustellenwerbung.',
      'beschriftungen/grossformatdruck.html': 'Digitaldruck in allen Formaten für Indoor und Outdoor. Von Postern bis zu Messewänden - wetterfest und UV-beständig.',
      
      // WEITERE SEITEN
      'digital-signage.html': 'Moderne Digital Signage Lösungen mit interaktiven Displays und Content Management. Für Retail, Hotels, Restaurants und Büros.',
      'dienstleistungen.html': 'Umfassende Dienstleistungen: Beratung, Planung, Bewilligung, Montage, Wartung und Reparatur. Vollservice rund um Ihre Leuchtreklame.',
      
      // UNTERNEHMEN
      'neon-murer/firmengeschichte.html': 'Die Geschichte der Neon Murer AG seit 1949. Von der Gründung durch Josef Murer bis zum heutigen Familienunternehmen mit 75 Jahren Tradition.',
      'neon-murer/fachkompetenzen.html': 'Unsere Kernkompetenzen und Spezialisierungen: ESTI-Zertifizierung, Swiss Quality Standards und kontinuierliche Weiterbildung.',
      'neon-murer/kontaktpersonen.html': 'Unser erfahrenes Team steht Ihnen zur Verfügung. Kompetente Ansprechpartner für Beratung, Verkauf, Montage und Service.',
      'neon-murer/stellenangebote.html': 'Karrieremöglichkeiten bei Neon Murer AG: Offene Stellen, Ausbildungsplätze und Praktika in einem familiären Arbeitsumfeld.',
      'neon-murer/news.html': 'Aktuelle News, Projekte und Innovationen von Neon Murer AG. Bleiben Sie auf dem Laufenden über unsere neuesten Entwicklungen.',
      
      // RECHTLICHE SEITEN
      'impressum.html': 'Rechtliche Angaben zur Neon Murer AG: Firmensitz, Geschäftsführung, Handelsregister und Kontaktdaten.',
      'datenschutz.html': 'Datenschutzerklärung gemäss revDSG: Informationen zur Datenverarbeitung, Cookies, Google Analytics und Ihren Rechten.',
      'geschaeftsbedingungen.html': 'Allgemeine Geschäftsbedingungen für Aufträge, Lieferung, Montage und Garantieleistungen der Neon Murer AG.'
    };

    return descriptions[page.url] || 'Weitere Informationen zu unseren Produkten und Dienstleistungen.';
  }

  navigateToPage(url) {
    this.closeSearch();
    
    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Globale Instanz erstellen wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
  window.neonMurerSearch = new NeonMurerSearch();
});

// Globale Funktion für den Aufruf aus HTML
function openSearchModal() {
  if (window.neonMurerSearch) {
    window.neonMurerSearch.openSearch();
  }
} 