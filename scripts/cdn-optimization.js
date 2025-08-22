#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🌐 CDN-Optimierung für externe Libraries\n');

// CDN-URLs für Libraries
const CDN_LIBRARIES = {
    'bootstrap': {
        css: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        js: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        integrity: {
            css: 'sha384-9ndCyUa7bbKG8Gp1TE0QK/eT4a1Hta4NpMCDiF4dM1pLR4iCxFhWEWTUTXU8U8c',
            js: 'sha384-GeQM6M2X2eFqTl1kXx0fX8nJ8LkpGJYo7RLp1Lf1dJH9gW6tJJgfv7cKz4B0Xu0'
        }
    },
    'fontawesome': {
        css: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=='
    },
    'jquery': {
        js: 'https://code.jquery.com/jquery-3.7.1.min.js',
        integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo='
    },
    'chartjs': {
        js: 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
        integrity: 'sha384-WuVnOmLdAYl5+9+1DpQJXnNkVLtqFDJcS4J7o02IxNGJdHZC1YWJjMhZuW6J0K5+'
    },
    'xlsx': {
        js: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
        integrity: 'sha512-r22gChDnGvBylk90+2e/ycr+equDAo2y3K5E4E1W1K1eCR8CRe3L2PuDpXpz/0A6SQFOq7v2+6V2DWM5xyZ8='
    }
};

function updateHTMLWithCDN(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // 1. Bootstrap CSS lokale Links zu CDN
        const bootstrapCSSRegex = /<link[^>]*href=["'][^"']*bootstrap[^"']*\.css["'][^>]*>/gi;
        if (bootstrapCSSRegex.test(content)) {
            content = content.replace(
                bootstrapCSSRegex,
                `<link href="${CDN_LIBRARIES.bootstrap.css}" rel="stylesheet" crossorigin="anonymous">`
            );
            changed = true;
        }
        
        // 2. Bootstrap JS lokale Links zu CDN
        const bootstrapJSRegex = /<script[^>]*src=["'][^"']*bootstrap[^"']*\.js["'][^>]*><\/script>/gi;
        if (bootstrapJSRegex.test(content)) {
            content = content.replace(
                bootstrapJSRegex,
                `<script src="${CDN_LIBRARIES.bootstrap.js}" crossorigin="anonymous"></script>`
            );
            changed = true;
        }
        
        // 3. Font Awesome CSS
        const fontAwesomeRegex = /<link[^>]*href=["'][^"']*font-awesome[^"']*\.css["'][^>]*>/gi;
        if (fontAwesomeRegex.test(content)) {
            content = content.replace(
                fontAwesomeRegex,
                `<link href="${CDN_LIBRARIES.fontawesome.css}" rel="stylesheet" crossorigin="anonymous">`
            );
            changed = true;
        }
        
        // 4. jQuery
        const jqueryRegex = /<script[^>]*src=["'][^"']*jquery[^"']*\.js["'][^>]*><\/script>/gi;
        if (jqueryRegex.test(content)) {
            content = content.replace(
                jqueryRegex,
                `<script src="${CDN_LIBRARIES.jquery.js}" crossorigin="anonymous"></script>`
            );
            changed = true;
        }
        
        // 5. Chart.js
        const chartJSRegex = /<script[^>]*src=["'][^"']*chart[^"']*\.js["'][^>]*><\/script>/gi;
        if (chartJSRegex.test(content)) {
            content = content.replace(
                chartJSRegex,
                `<script src="${CDN_LIBRARIES.chartjs.js}" crossorigin="anonymous"></script>`
            );
            changed = true;
        }
        
        // 6. XLSX
        const xlsxRegex = /<script[^>]*src=["'][^"']*xlsx[^"']*\.js["'][^>]*><\/script>/gi;
        if (xlsxRegex.test(content)) {
            content = content.replace(
                xlsxRegex,
                `<script src="${CDN_LIBRARIES.xlsx.js}" crossorigin="anonymous"></script>`
            );
            changed = true;
        }
        
        // 7. Preload wichtige CDN-Ressourcen
        if (changed && !content.includes('<!-- CDN Preloads -->')) {
            const preloads = `
  <!-- CDN Preloads für bessere Performance -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preconnect" href="https://code.jquery.com" crossorigin>
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">`;
            
            content = content.replace('<head>', '<head>' + preloads);
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${filePath} - CDN-Links hinzugefügt`);
            return true;
        } else {
            console.log(`⚪ ${filePath} - Keine CDN-Optimierung nötig`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Fehler bei ${filePath}:`, error.message);
        return false;
    }
}

function generateCachingHeaders() {
    const cacheConfig = `
# .htaccess für optimales Caching
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Bilder
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    
    # CSS und JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    
    # Fonts
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    
    # HTML (kurze Cache-Zeit)
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
    # GZIP Komprimierung
    <FilesMatch "\\.(css|js|html|xml|txt)$">
        Header set Cache-Control "public, max-age=2592000"
    </FilesMatch>
    
    # Sicherheits-Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# GZIP Komprimierung
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
`;

    fs.writeFileSync('.htaccess', cacheConfig, 'utf8');
    console.log('✅ .htaccess Caching-Konfiguration erstellt');
}

async function optimizeAllFiles() {
    console.time('⏱️  CDN-Optimierung');
    
    // Alle HTML-Dateien finden (ohne CMS-Admin)
    const htmlFiles = glob.sync('**/*.html', {
        ignore: ['node_modules/**', 'cms-admin/**', 'content/**']
    });
    
    console.log(`📄 ${htmlFiles.length} HTML-Dateien zu optimieren...\n`);
    
    let changedFiles = 0;
    
    for (const file of htmlFiles) {
        if (updateHTMLWithCDN(file)) {
            changedFiles++;
        }
    }
    
    // Erstelle .htaccess für Caching
    generateCachingHeaders();
    
    console.log(`\n📊 CDN-OPTIMIERUNG ABGESCHLOSSEN:`);
    console.log('==================================');
    console.log(`📄 Dateien geprüft: ${htmlFiles.length}`);
    console.log(`✅ Dateien optimiert: ${changedFiles}`);
    console.log(`🌐 CDN-Libraries aktiviert: ${Object.keys(CDN_LIBRARIES).length}`);
    console.log(`💾 Caching-Headers konfiguriert`);
    
    console.log(`\n🎯 PERFORMANCE-VORTEILE:`);
    console.log('========================');
    console.log('✅ Reduzierte Bundle-Größe (Libraries über CDN)');
    console.log('✅ Parallele Downloads (verschiedene Domains)');
    console.log('✅ Browser-Cache-Vorteile (gemeinsame CDN-Ressourcen)');
    console.log('✅ Global verteilte Server (niedrigere Latenz)');
    console.log('✅ Automatische GZIP-Komprimierung');
    
    console.timeEnd('⏱️  CDN-Optimierung');
    
    return changedFiles;
}

if (require.main === module) {
    optimizeAllFiles().catch(console.error);
}

module.exports = { optimizeAllFiles };