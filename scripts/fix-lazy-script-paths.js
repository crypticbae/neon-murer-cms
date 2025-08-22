#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

console.log('🔧 Korrigiere Lazy Loading Script-Pfade in Unterseiten\n');

// Alle HTML-Dateien in Unterordnern finden
const subpageFiles = glob.sync('**/*.html', {
    ignore: ['node_modules/**', 'cms-admin/**', 'content/**']
}).filter(file => file.includes('/') || file.includes('\\'));

let fixedFiles = 0;

subpageFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Korrigiere Lazy Loading Script-Pfad
        const oldContent = content;
        content = content.replace(
            /src=["']template\/assets\/js\/lazy-loading\.js["']/g,
            'src="../template/assets/js/lazy-loading.js"'
        );
        
        if (content !== oldContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`✅ ${file} - Lazy Loading Script-Pfad korrigiert`);
            fixedFiles++;
        }
        
    } catch (error) {
        console.error(`❌ Fehler bei ${file}:`, error.message);
    }
});

console.log(`\n📊 Script-Pfad-Korrekturen: ${fixedFiles} Dateien korrigiert`);
console.log('✅ Alle Lazy Loading Scripts haben nun korrekte Pfade');