/*!
 * Embedded Templates - Header/Footer als JavaScript Strings
 * Funktioniert ohne HTTP-Server und CORS-Probleme
 * Version: 1.0.0
 */

// ========== NEON DEBUG SYSTEM ==========
// Global Debug Flag - nur bei explizitem ?debug=true Parameter aktiviert
window.NEON_DEBUG = window.location.search.includes('debug=true');

// Debug-freundliche Console-Funktion
window.neonLog = function(...args) {
    if (window.NEON_DEBUG) {
        console.log(...args);
    }
};

// Weitere Debug-Funktionen für Konsistenz
window.neonWarn = function(...args) {
    if (window.NEON_DEBUG) {
        console.warn(...args);
    }
};

window.neonError = function(...args) {
    if (window.NEON_DEBUG) {
        console.error(...args);
    }
};

window.EmbeddedTemplates = {
    header: `<!-- ========== HEADER TEMPLATE ========== -->
<!-- Diese Datei wird automatisch in alle Seiten geladen -->

<!-- Top Section -->
<section id="top" class="bg-dark py-2 text-light">
  <div class="container-fluid maxwidth">
    <div class="row">
      <div class="col-auto small">
        <a href="tel:+41552255025">+41 55 225 50 25</a>
        <span class="mx-2">|</span>
        <a href="#" onclick="mailtoLink('neon','neonmurer.ch');return false;" title="Email: neon at neonmurer.ch">
          neon@neonmurer.ch
        </a>
      </div>
      <div class="col text-end small social d-none">
        <a href="#" target="blank" class="mx-2" title="instagram"><i class="fab fa-instagram"></i></a>
        <a href="#" target="blank" class="mx-2" title="facebook"><i class="fab fa-facebook-f"></i></a>
      </div>
    </div>
  </div>
</section>

<!-- Main Navigation -->
<header class="sticky-top bg-dark shadow-lg">
  <nav id="navbar_top" class="navbar navbar-expand-lg navbar-light bg-dark shadow-lg py-0">
    <div class="container-fluid maxwidth navshadow">
      <a class="navbar-brand me-auto" href="index.html">
        <img id="logo" class="logo" src="template/assets/images/neonmurer.svg" height="45">
      </a>
      <button id="navbar_btn" class="navbar-toggler hamburger hamburger--squeeze collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#main_nav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
      <div id="main_nav" class="collapse navbar-collapse row">
        
        <ul class="navbar-nav my-3 my-lg-0 col d-flex justify-content-end">
          <li class="sub_ul dropdown">
            <a href="lichtwerbung.html" class="nav-link" title="Lichtwerbung">
              Lichtwerbung <b class="caret"></b>
            </a>
            <ul class="dropdown-menu mt-2 shadow-sm">
              <li class="asub_no asub_first"><a href="lichtwerbung/leuchtschriften.html" class="dropdown-item">Leuchtschriften</a></li>
              <li class="asub_no"><a href="lichtwerbung/leuchttransparente.html" class="dropdown-item">Leuchttransparente</a></li>
              <li class="asub_no"><a href="lichtwerbung/halbrelief-plattenschriften.html" class="dropdown-item">Halbrelief-/Plattenschriften</a></li>
              <li class="asub_no"><a href="lichtwerbung/neon-led-technik.html" class="dropdown-item">Neon / LED-Technik</a></li>
              <li class="asub_no asub_last"><a href="lichtwerbung/pylonen.html" class="dropdown-item">Pylonen</a></li>
            </ul>
          </li>
          <li class="sub_ul dropdown">
            <a href="beschriftungen.html" class="nav-link" title="Beschriftungen">
              Beschriftungen <b class="caret"></b>
            </a>
            <ul class="dropdown-menu mt-2 shadow-sm">
              <li class="asub_no asub_first"><a href="beschriftungen/signaletik.html" class="dropdown-item">Signaletik</a></li>
              <li class="asub_no"><a href="beschriftungen/tafelbeschriftung.html" class="dropdown-item">Tafelbeschriftung</a></li>
              <li class="asub_no"><a href="beschriftungen/fahrzeugbeschriftung.html" class="dropdown-item">Fahrzeugbeschriftung</a></li>
              <li class="asub_no"><a href="beschriftungen/fensterbeschriftung.html" class="dropdown-item">Fensterbeschriftung</a></li>
              <li class="asub_no"><a href="beschriftungen/blachen-fahnen.html" class="dropdown-item">Blachen und Fahnen</a></li>
              <li class="asub_no asub_last"><a href="beschriftungen/grossformatdruck.html" class="dropdown-item">Grossformatdruck</a></li>
            </ul>
          </li>
          <li class="nav-item"><a href="digital-signage.html" class="dropdown-item nav-link" title="Digital Signage">Digital Signage</a></li>
          <li class="nav-item"><a href="dienstleistungen.html" class="dropdown-item nav-link" title="Dienstleistungen">Dienstleistungen</a></li>
          <li class="sub_ul dropdown">
            <a href="#" class="dropdown-item dropdown-toggle nav-link" title="Neon Murer" data-bs-toggle="dropdown">
              Neon Murer <b class="caret"></b>
            </a>
            <ul class="dropdown-menu mt-2 shadow-sm">
              <li class="asub_no asub_first"><a href="neon-murer/firmengeschichte.html" class="dropdown-item">Firmengeschichte</a></li>
              <li class="asub_no"><a href="neon-murer/fachkompetenzen.html" class="dropdown-item">Fachkompetenzen</a></li>
              <li class="asub_no"><a href="neon-murer/kontaktpersonen.html" class="dropdown-item">Kontaktpersonen</a></li>
              <li class="asub_no"><a href="neon-murer/stellenangebote.html" class="dropdown-item">Stellenangebote</a></li>
              <li class="asub_no asub_last"><a href="neon-murer/news.html" class="dropdown-item">News &amp; Informationen</a></li>
            </ul>
          </li>
          <li class="nav-item d-none d-lg-block ms-3 nav-item-search">
            <a class="nav-link pe-0" href="#" onclick="modernNeonSearch.openSearch(); return false;" role="button" aria-expanded="false">
              <i class="fas fa-magnifying-glass"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</header>

<style>
/* Pfeil-Animation für Dropdowns */
.navbar .dropdown:hover .caret,
.navbar .dropdown.mobile-open .caret {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.navbar .caret {
  transition: transform 0.3s ease;
  display: inline-block;
  margin-left: 0.5rem;
}

.nav-item-search {
    display: flex;
    align-items: center;
}

/* Mobile: Klick zeigt Dropdown */
@media (max-width: 991px) {
  .navbar .dropdown.mobile-open .dropdown-menu {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) !important;
    pointer-events: auto !important;
    position: static;
    margin-top: 0.5rem;
  }
}
</style>

<script>
// Dropdown-Verhalten wird jetzt komplett von simple-template-loader.js verwaltet
neonLog('📝 Dropdown-Script in templates.js deaktiviert - wird von Template Loader übernommen');
</script>`,

    footer: `<!-- ========== PRIVACY MANAGER ========== -->
<!-- Privacy Manager wird automatisch geladen - Ad-Blocker-sicher -->
<script src="template/assets/js/neon-privacy-manager.js"></script>

<!-- ========== CLEAN FOOTER TEMPLATE ========== -->
<style>
  .clean-footer {
    background: #112357;
    color: rgba(255, 255, 255, 0.9);
    padding: 2rem 0 1rem;
  }
  
  .footer-section {
    margin-bottom: 1.5rem;
  }
  
  .footer-logo {
    margin-bottom: 1rem;
  }
  
  .footer-title {
    color: #ffd401;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    min-height: 50px;
    display: flex;
    align-items: center;
  }
  
  .footer-text {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    margin-bottom: 0.75rem;
    transition: color 0.3s ease;
  }
  
  .contact-item:hover {
    color: #ffd401;
  }
  
  .clean-footer .contact-item i.fas {
    width: 20px !important;
    margin-right: 12px !important;
    color: #ffd401 !important;
    font-size: 1rem !important;
    font-family: "Font Awesome 6 Free" !important;
    font-weight: 900 !important;
    font-style: normal !important;
    display: inline-block !important;
    text-rendering: auto !important;
    line-height: 1 !important;
    vertical-align: baseline !important;
  }
  
    /* Entfernt - nicht mehr nötig */
  
  .quick-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .quick-links li {
    margin-bottom: 0.5rem;
    list-style: none;
    position: relative;
  }
  
  .quick-links li::before {
    display: none;
  }
  
  .quick-links a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
  }
  
  .quick-links a:hover {
    color: #ffd401;
  }
  
  .clean-footer .quick-links a i.fas {
    color: #ffd401 !important;
    font-size: 1rem !important;
    font-family: "Font Awesome 6 Free" !important;
    font-weight: 900 !important;
    font-style: normal !important;
    display: inline-block !important;
    text-rendering: auto !important;
    line-height: 1 !important;
  }
  
  /* Newsletter Button - Dezent aber erkennbar */
  .quick-links .newsletter-trigger {
    color: rgba(255, 255, 255, 0.8) !important;
    text-decoration: none;
    transition: all 0.3s ease;
    display: flex !important;
    align-items: center;
    padding: 4px 0;
    border-radius: 4px;
  }
  
  .quick-links .newsletter-trigger:hover {
    color: #ffd401 !important;
    background-color: rgba(255, 212, 1, 0.1);
    padding-left: 8px;
    transform: translateX(4px);
  }
  
  .quick-links .newsletter-trigger i.fas {
    color: #ffd401 !important;
    margin-right: 8px;
    transition: transform 0.3s ease;
  }
  
  .quick-links .newsletter-trigger:hover i.fas {
    transform: scale(1.1);
  }
  

  
  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 1.5rem;
    text-align: center;
  }
  
  .footer-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .footer-links a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .footer-links a:hover {
    color: #ffd401;
  }
  
  .copyright {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .clean-footer {
      padding: 1.5rem 0 1rem;
    }
    
    .footer-links {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>

<footer class="clean-footer">
  <div class="container-fluid maxwidth">
    
    <!-- Main Footer Content -->
    <div class="row align-items-stretch">
      
      <!-- Unternehmen -->
      <div class="col-12 col-md-6 col-lg-3 footer-section">
        <div class="footer-logo text-center text-md-start">
          <img src="template/assets/images/neonmurer.svg" height="50" alt="Neon Murer AG">
        </div>
        <p class="footer-text">
          Seit über 75 Jahren Ihr vertrauensvoller Partner für Lichtwerbung, Beschriftungen und Digital Signage in der ganzen Schweiz.
        </p>
      </div>

             <!-- Standort Uznach -->
       <div class="col-12 col-md-6 col-lg-3 footer-section">
         <h5 class="footer-title">Standort Uznach</h5>
         <div itemscope="" itemtype="https://schema.org/LocalBusiness">
           <a href="https://www.google.com/maps/place/Neon+Murer+AG/@47.2196062,8.9794103,17z/data=!3m1!4b1!4m6!3m5!1s0x479acfca32db7515:0x83741a5e4c17653c!8m2!3d47.2196027!4d8.9842758!16s%2Fg%2F11hds5m928?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" class="contact-item" style="text-decoration: none; align-items: flex-start;">
             <i class="fas fa-map-marker-alt me-2" style="color: #ffd401; margin-top: 5px;"></i>
             <div itemprop="address" itemscope="" itemtype="https://schema.org/PostalAddress" style="color: rgba(255,255,255,0.8); line-height: 1.6; transition: color 0.3s ease;">
               <span itemprop="streetAddress">Burgerrietstrasse 30</span><br>
               <span><span itemprop="postalCode">8730</span> <span itemprop="addressLocality">Uznach</span></span>
             </div>
           </a>
                      <a href="tel:+41552255025" class="contact-item" itemprop="telephone">
             <i class="fas fa-phone me-2"></i>
             +41 55 225 50 25
           </a>
           <a href="#" onclick="mailtoLink('neon','neonmurer.ch');return false;" class="contact-item"> 
             <i class="fas fa-envelope me-2"></i>
             neon@neonmurer.ch
           </a>
         </div>
       </div>

       <!-- Standort Jona -->
       <div class="col-12 col-md-6 col-lg-3 footer-section">
         <h5 class="footer-title">Standort Jona</h5>
         <div itemscope="" itemtype="https://schema.org/LocalBusiness">
           <a href="https://www.google.com/maps/place/Neon+Murer+AG/@47.2343778,8.8395899,18z/data=!3m1!4b1!4m6!3m5!1s0x479ab7a81ec30173:0x5808b57b63ae874d!8m2!3d47.234376!4d8.84088!16s%2Fg%2F1td7y1gg?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" class="contact-item" style="text-decoration: none; align-items: flex-start;">
             <i class="fas fa-map-marker-alt me-2" style="color: #ffd401; margin-top: 5px;"></i>
             <div itemprop="address" itemscope="" itemtype="https://schema.org/PostalAddress" style="color: rgba(255,255,255,0.8); line-height: 1.6; transition: color 0.3s ease;">
               <span itemprop="streetAddress">Tägernaustrasse 21</span><br>
               <span><span itemprop="postalCode">8640</span> <span itemprop="addressLocality">Rapperswil-Jona</span></span>
             </div>
           </a>
           <a href="tel:+41552126367" class="contact-item" itemprop="telephone">
             <i class="fas fa-phone me-2"></i>
             +41 55 212 63 67
           </a>
           <a href="#" onclick="mailtoLink('neon','neonmurer.ch');return false;" class="contact-item">
             <i class="fas fa-envelope me-2"></i>
             neon@neonmurer.ch
           </a>
         </div>
       </div>

             <!-- Quick Links -->
       <div class="col-12 col-md-6 col-lg-3 footer-section">
         <h5 class="footer-title">Services</h5>
         <ul class="quick-links">
           <li><a href="lichtwerbung/leuchtschriften.html"><i class="fas fa-lightbulb me-2"></i>Leuchtschriften</a></li>
           <li><a href="beschriftungen/signaletik.html"><i class="fas fa-pen-nib me-2"></i>Beschriftungen</a></li>
           <li><a href="digital-signage.html"><i class="fas fa-tv me-2"></i>Digital Signage</a></li>
           <li><a href="neon-murer/stellenangebote.html"><i class="fas fa-briefcase me-2"></i>Karriere</a></li>
           <li><a href="newsletter-anmeldung.html"><i class="fas fa-envelope me-2"></i>Newsletter</a></li>
         </ul>
       </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="footer-links">
                        <a href="impressum.html">Impressum</a>
                <a href="datenschutz.html">Datenschutz</a>
                <a href="geschaeftsbedingungen.html">AGB</a>
                <a href="javascript:void(0)" onclick="resetCookieConsent(); return false;" style="color: #ffd401;" title="Cookie-Banner öffnen">
                  <i class="fas fa-cookie-bite"></i>
                </a>
      </div>
      <p class="copyright">
        © 2025 Neon Murer AG. Alle Rechte vorbehalten.
      </p>
    </div>
    
  </div>
</footer>


</script>`
}; 

// ========== MOBILE NAVBAR ENHANCEMENTS ==========
// Wird nach dem Laden des Header Templates ausgeführt

// Mobile Navbar JavaScript - wird automatisch geladen
document.addEventListener('DOMContentLoaded', function() {
  // Warte kurz, damit das Template geladen wird
  setTimeout(initMobileNavbar, 100);
});

function initMobileNavbar() {
  const navbarToggler = document.getElementById('navbar_btn');
  const navbarCollapse = document.getElementById('main_nav');
  const body = document.body;
  
  if (!navbarToggler || !navbarCollapse) {
    neonLog('Navbar elements not found, retrying...');
    setTimeout(initMobileNavbar, 200);
    return;
  }

  // Enhanced Hamburger Animation
  navbarToggler.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    
    // Toggle hamburger animation
    this.classList.toggle('is-active');
    
    // Toggle body scroll lock
    if (!isExpanded) {
      body.classList.add('mobile-menu-open');
    } else {
      body.classList.remove('mobile-menu-open');
    }
    
    // Smooth animation timing
    setTimeout(() => {
      this.setAttribute('aria-expanded', !isExpanded);
    }, 50);
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    const isClickInside = navbarCollapse.contains(event.target) || 
                         navbarToggler.contains(event.target);
    
    if (!isClickInside && navbarCollapse.classList.contains('show')) {
      navbarToggler.click();
    }
  });

  // Enhanced Dropdown Behavior on Mobile - DEAKTIVIERT
  // Diese Funktionalität wurde in simple-template-loader.js verschoben
  neonLog('📝 Mobile Dropdown-Verhalten in templates.js deaktiviert - wird von Template Loader übernommen');

  // Smooth scrolling for anchor links
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Close mobile menu first
        if (navbarCollapse.classList.contains('show')) {
          navbarToggler.click();
        }
        
        // Smooth scroll to target
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      }
    });
  });

  // Touch gesture support for mobile menu
  let touchStartY = 0;
  let touchEndY = 0;
  
  navbarCollapse.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
  });
  
  navbarCollapse.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
  });
  
  function handleSwipeGesture() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    // Swipe up to close menu
    if (diff > swipeThreshold && navbarCollapse.classList.contains('show')) {
      navbarToggler.click();
    }
  }

  // Resize handler to close mobile menu on orientation change
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 991.98 && navbarCollapse.classList.contains('show')) {
        navbarToggler.click();
      }
    }, 250);
  });

  // Enhanced focus management for accessibility
  const menuItems = navbarCollapse.querySelectorAll('.nav-link, .dropdown-item');
  
  menuItems.forEach((item, index) => {
    item.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        menuItems[nextIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
        menuItems[prevIndex].focus();
      } else if (e.key === 'Escape') {
        if (navbarCollapse.classList.contains('show')) {
          navbarToggler.click();
          navbarToggler.focus();
        }
      }
    });
  });

  // Add visual feedback for touch devices
  if ('ontouchstart' in window) {
    menuItems.forEach(item => {
      item.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
      });
      
      item.addEventListener('touchend', function() {
        this.style.transform = '';
      });
    });
  }

  neonLog('✅ Mobile navbar initialized successfully!');
}

// Initialize Analytics Tracker for all pages
function initAnalyticsTracker() {
  if (typeof NeonAnalyticsTracker !== 'undefined') {
    window.neonAnalyticsTracker = new NeonAnalyticsTracker();
    console.error('📊 Analytics Tracker initialized on', window.location.pathname);
  } else {
    console.error('❌ NeonAnalyticsTracker not found - script may not be loaded');
  }
}

// Auto-close mobile menu on page navigation
window.addEventListener('beforeunload', function() {
  document.body.classList.remove('mobile-menu-open');
});

// ========== END MOBILE NAVBAR ENHANCEMENTS ========== 