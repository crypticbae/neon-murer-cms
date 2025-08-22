/**
 * 🚀 Neon Murer Lazy Loading System
 * Optimiert Ladezeiten durch intelligentes Nachladen von Inhalten
 */

class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        this.init();
    }
    
    init() {
        // Prüfe Browser-Support
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback für ältere Browser
            this.loadAllImages();
        }
        
        this.setupLazyImages();
        this.setupLazyAssets();
    }
    
    setupIntersectionObserver() {
        this.imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.options);
    }
    
    setupLazyImages() {
        const images = document.querySelectorAll('img[data-src], picture source[data-srcset]');
        
        images.forEach(img => {
            // Füge Placeholder hinzu
            this.addPlaceholder(img);
            
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            }
        });
        
        neonLog(`⚡ Lazy Loading: ${images.length} Bilder vorbereitet`);
    }
    
    addPlaceholder(img) {
        if (img.tagName === 'IMG' && !img.src) {
            // Erstelle SVG-Placeholder
            const placeholder = this.generatePlaceholder(
                img.getAttribute('width') || 300,
                img.getAttribute('height') || 200
            );
            img.src = placeholder;
            img.classList.add('lazy-loading');
        }
    }
    
    generatePlaceholder(width, height) {
        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#888" font-family="Arial" font-size="14">
                Lädt...
            </text>
        </svg>`;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    loadImage(img) {
        // Erstelle ein neues Image-Element zum Vorladen
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Bild erfolgreich geladen
            if (img.tagName === 'IMG') {
                img.src = img.dataset.src;
            } else if (img.tagName === 'SOURCE') {
                img.srcset = img.dataset.srcset;
            }
            
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            
            // Entferne data-Attribute
            delete img.dataset.src;
            delete img.dataset.srcset;
            
            // Fade-in Animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in-out';
            
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        };
        
        imageLoader.onerror = () => {
            console.warn('⚠️ Fehler beim Laden:', img.dataset.src || img.dataset.srcset);
            img.classList.add('lazy-error');
        };
        
        // Starte das Laden
        if (img.dataset.src) {
            imageLoader.src = img.dataset.src;
        }
    }
    
    setupLazyAssets() {
        // Lazy Loading für schwere Assets (Charts, Videos, etc.)
        this.setupLazyCharts();
        this.setupLazyCarousels();
    }
    
    setupLazyCharts() {
        const charts = document.querySelectorAll('[data-lazy-chart]');
        
        charts.forEach(chart => {
            if (this.imageObserver) {
                this.imageObserver.observe(chart);
            }
        });
    }
    
    setupLazyCarousels() {
        const carousels = document.querySelectorAll('.slick:not(.slick-initialized)');
        
        carousels.forEach(carousel => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.initializeCarousel(carousel);
                        observer.unobserve(carousel);
                    }
                });
            }, this.options);
            
            observer.observe(carousel);
        });
    }
    
    initializeCarousel(carousel) {
        // Initialisiere Slick-Carousel erst wenn sichtbar
        if (typeof $(carousel).slick === 'function') {
            $(carousel).slick({
                infinite: true,
                slidesToShow: 6,
                slidesToScroll: 2,
                autoplay: true,
                autoplaySpeed: 3000,
                responsive: [
                    {
                        breakpoint: 1200,
                        settings: { slidesToShow: 4 }
                    },
                    {
                        breakpoint: 768,
                        settings: { slidesToShow: 2 }
                    },
                    {
                        breakpoint: 480,
                        settings: { slidesToShow: 1 }
                    }
                ]
            });
            
            neonLog('⚡ Carousel lazy-initialisiert');
        }
    }
    
    loadAllImages() {
        // Fallback: Lade alle Bilder sofort
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
    
    // Öffentliche Methode zum manuellen Laden
    forceLoad(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (this.imageObserver) {
                this.imageObserver.unobserve(el);
            }
            this.loadImage(el);
        });
    }
}

// CSS für Lazy Loading Animationen
const lazyStyles = `
<style id="lazy-loading-styles">
.lazy-loading {
    filter: blur(5px);
    transition: filter 0.3s ease-in-out;
}

.lazy-loaded {
    filter: none;
}

.lazy-error {
    background: #f0f0f0;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
}

.lazy-error::before {
    content: "Bild konnte nicht geladen werden";
    font-size: 14px;
}

/* Placeholder Animation */
.lazy-loading::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* Responsive Bilder */
.lazy-image {
    max-width: 100%;
    height: auto;
    display: block;
}
</style>
`;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    // Füge CSS hinzu
    document.head.insertAdjacentHTML('beforeend', lazyStyles);
    
    // Starte Lazy Loading
    const lazyLoader = new LazyLoader();
    
    // Mache global verfügbar
    window.lazyLoader = lazyLoader;
    
    neonLog('⚡ Lazy Loading System initialisiert');
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}