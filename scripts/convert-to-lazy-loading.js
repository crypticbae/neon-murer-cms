#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('⚡ Konvertiere HTML zu Lazy Loading\n');

// Alle HTML-Dateien finden
const htmlFiles = glob.sync('**/*.html', {
    ignore: ['node_modules/**', 'cms-admin/**', 'content/**']
});

console.log(`📄 ${htmlFiles.length} HTML-Dateien gefunden`);

function convertImagesInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Konvertiere <img src="content/images/..." zu Lazy Loading
        content = content.replace(
            /<img([^>]*)\s+src=["']([^"']*content\/images\/[^"']*)["']([^>]*?)>/gi,
            (match, beforeSrc, src, afterSrc = '') => {
                // Prüfe ob bereits lazy loading aktiv ist
                if (match.includes('data-src')) {
                    return match;
                }
                
                changed = true;
                
                // Füge loading="lazy" und data-src hinzu
                let lazyImg = `<img${beforeSrc || ''} data-src="${src}" loading="lazy"${afterSrc || ''}>`;
                
                // Entferne originales src
                lazyImg = lazyImg.replace(/\s+src=["'][^"']*["']/gi, '');
                
                return lazyImg;
            }
        );
        
        // Konvertiere zu <picture> für optimierte Bilder
        content = content.replace(
            /<img([^>]*)\s+data-src=["']([^"']*content\/images\/([^"'\/]+\.(jpg|jpeg|png)))["']([^>]*?)>/gi,
            (match, beforeSrc, src, filename, ext, afterSrc = '') => {
                const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png)$/i, '');
                
                changed = true;
                
                return `<picture>
  <source data-srcset="content/images-optimized/${nameWithoutExt}.webp" type="image/webp">
  <source data-srcset="content/images-optimized/${nameWithoutExt}-optimized.${ext}" type="image/${ext === 'jpg' ? 'jpeg' : ext}">
  <img${beforeSrc || ''} data-src="${src}" loading="lazy" class="lazy-image"${afterSrc || ''}>
</picture>`;
            }
        );
        
        // Füge Lazy Loading Script hinzu (wenn noch nicht vorhanden)
        if (!content.includes('lazy-loading.js') && content.includes('</body>')) {
            content = content.replace(
                '</body>',
                '  <script src="template/assets/js/lazy-loading.js"></script>\n</body>'
            );
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${filePath} - Lazy Loading hinzugefügt`);
            return true;
        } else {
            console.log(`⚪ ${filePath} - Keine Änderungen nötig`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Fehler bei ${filePath}:`, error.message);
        return false;
    }
}

async function convertAllFiles() {
    console.time('⏱️  Konvertierung');
    
    let changedFiles = 0;
    
    for (const file of htmlFiles) {
        if (convertImagesInFile(file)) {
            changedFiles++;
        }
    }
    
    console.log(`\n📊 LAZY LOADING KONVERTIERUNG:`);
    console.log('================================');
    console.log(`📄 Dateien geprüft: ${htmlFiles.length}`);
    console.log(`✅ Dateien geändert: ${changedFiles}`);
    console.log(`⚡ Lazy Loading aktiviert für alle Bilder`);
    
    console.timeEnd('⏱️  Konvertierung');
    
    return changedFiles;
}

if (require.main === module) {
    convertAllFiles().catch(console.error);
}

module.exports = { convertAllFiles };