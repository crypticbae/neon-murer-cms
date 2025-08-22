// Funktion zur Berechnung und Setzen der Header- und Top-Höhen
function setCarouselHeight() {
  const topElement = document.getElementById('top');
  const headerElement = document.querySelector('header');
  
  // Prüfe ob Elemente existieren (könnten noch nicht geladen sein)
  if (!topElement || !headerElement) {
    neonLog('⏳ Header-Elemente noch nicht geladen - warte...');
    return;
  }
  
  const topHeight = topElement.offsetHeight;
  const headerHeight = headerElement.offsetHeight;

  // Setzt die Höhe als CSS-Variablen
  document.documentElement.style.setProperty('--top-height', `${topHeight}px`);
  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  
          // Carousel-Höhen gesetzt
}

// Ruft die Funktion auf und aktualisiert die Höhe beim Ändern der Fenstergröße
if (window && typeof window.addEventListener === 'function') {
    window.addEventListener('load', setCarouselHeight);
    window.addEventListener('resize', setCarouselHeight);
}

// Event-Listener für Template-Loading
document.addEventListener('templatesLoaded', setCarouselHeight);


var headerScrollTop = 0;

document.addEventListener("DOMContentLoaded", function(){
  initializeNavigation();
});

// Auch nach Template-Loading initialisieren
document.addEventListener('templatesLoaded', function(){
  initializeNavigation();
});

function initializeNavigation() {
  var mobileMenuBg = document.getElementById('main_nav');
  var navBarTop = document.getElementById('navbar_top');
  var navBarLogo = document.getElementById('logo');

  // Prüfe ob Elemente existieren
  if (!mobileMenuBg || !navBarTop || !navBarLogo) {
    neonLog('⏳ Navigation-Elemente noch nicht geladen - warte...');
    return;
  }

  mobileMenuBg.addEventListener('show.bs.collapse', function () {
    document.getElementById('navbar_top').classList.add('bg_active');
  });
  mobileMenuBg.addEventListener('hide.bs.collapse', function () {
    document.getElementById('navbar_top').classList.remove('bg_active');
  });
  
      // Navigation initialisiert

  window.addEventListener('scroll', function() {
    if (window.scrollY > headerScrollTop) {
      if (navBarTop){
        navBarTop.classList.add('shadow-sm');
      };
      if (navBarLogo){
        navBarLogo.height ='55';
        navBarLogo.classList.add('small');
      };
    } else {
      if (navBarTop){
        navBarTop.classList.remove('shadow-sm');
      };
      if (navBarLogo){
        navBarLogo.height ='65';
        navBarLogo.classList.remove('small');
      };
    }
  });
}

$(function () {
  'use strict';
  $('[data-toggle="collapse"]').on('click', function () {
    $('.collapse').toggleClass('show');
    $('.navbar-toggler').toggleClass('is-active');
  });

  $('a[href*="#"]:not([href="#"])').on('click', function () {
      var target = $(this.hash);
        $('html,body').stop().animate({
            scrollTop: target.offset().top - (headerScrollTop + 65)
        }); // , 400, 'swing' OR {easing: 'swing'}
  });
});


var breakpoint = {
  // Small screen / phone
  sm: 576,
  // Medium screen / tablet
  md: 768,
  // Large screen / desktop
  lg: 992,
  // Extra large screen / wide desktop
  xl: 1200
};

// slick slider - warte auf Template Load
$(document).ready(function(){
  // Warte auf Template System
  function initSlick() {
    const slickElement = $('#slick');
    if (slickElement.length && !slickElement.hasClass('slick-initialized')) {
      try {
        slickElement.slick({
    autoplay: true,
    autoplaySpeed: 3000,
    draggable: true,
    infinite: true,
    dots: false,
    arrows: false,
    speed: 1000,
    mobileFirst: true,
    slidesToShow: 2,
    slidesToScroll: 2,
    responsive: [{
        breakpoint: breakpoint.sm,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: breakpoint.md,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4
        }
      },
      {
        breakpoint: breakpoint.lg,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5
        }
      },
      {
        breakpoint: breakpoint.xl,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6
        }
      }
    ]
        });
      } catch (error) {
        console.warn('Slick Carousel konnte nicht initialisiert werden:', error);
      }
    }
  }
  
  // Sofort versuchen
  initSlick();
  
  // Falls Template-System später lädt
  document.addEventListener('templates-loaded', initSlick);
  
  // Fallback nach Timeout
  setTimeout(initSlick, 1000);
});

document.addEventListener('DOMContentLoaded', () => {
    const phoneLinks = document.querySelectorAll('a.text-dark[href^="tel:"]');
    phoneLinks.forEach(link => {
        let phoneNumber = link.getAttribute('href').replace('tel:', '').trim();
        if (phoneNumber.startsWith('0')) {
            phoneNumber = '+41' + phoneNumber.slice(1).replace(/\s+/g, '');
        }
        link.setAttribute('href', `tel:${phoneNumber}`);
    });
});