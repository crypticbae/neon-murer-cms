#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Neon Murer - Kaputte Bilder Reparatur\n');

// Finde alle HTML-Dateien mit dem defekten Pattern
const htmlFiles = glob.sync('**/*.html', {
    ignore: ['node_modules/**', 'cms/**', 'cms-admin/**']
});

let totalFixes = 0;

// Regex für defekte Image-Tags
const brokenImageRegex = /<img\s+data-src="([^"]+)"\s+loading="lazy"\s+class="lazy-image"\s+loading="lazy"\s+alt="([^"]*)"\s+class="([^"]+)">/g;

// Korrektes Replacement-Pattern
function fixImageTag(match, src, alt, className) {
    totalFixes++;
    return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy">`;
}

console.log(`📁 Durchsuche ${htmlFiles.length} HTML-Dateien...\n`);

htmlFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const originalLength = content.length;
        
        // Fix defekte Image-Tags
        const fixedContent = content.replace(brokenImageRegex, fixImageTag);
        
        if (fixedContent !== content) {
            fs.writeFileSync(file, fixedContent);
            const fixesInFile = (content.match(brokenImageRegex) || []).length;
            console.log(`✅ ${file}: ${fixesInFile} Bilder repariert`);
        }
        
    } catch (error) {
        console.error(`❌ Fehler in ${file}:`, error.message);
    }
});

console.log(`\n🎉 REPARATUR ABGESCHLOSSEN:`);
console.log(`==============================`);
console.log(`🔧 Gesamte Fixes: ${totalFixes}`);
console.log(`📄 Dateien überprüft: ${htmlFiles.length}`);

if (totalFixes > 0) {
    console.log(`\n💡 NÄCHSTE SCHRITTE:`);
    console.log(`1. Browser-Cache leeren (Ctrl+Shift+R)`);
    console.log(`2. Website testen`);
    console.log(`3. Hero-Section sollte wieder funktionieren`);
    console.log(`4. Thumbnails sollten nicht mehr abgeschnitten sein`);
}