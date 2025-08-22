#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Behebe Bildpfade in Unterseiten\n');

function fixPathsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Prüfe ob es sich um eine Unterseite handelt (nicht im Root)
        const isSubpage = filePath.includes('/') || filePath.includes('\\');
        
        if (isSubpage) {
            // Berechne relative Tiefe
            const pathParts = filePath.replace(/\\/g, '/').split('/');
            const depth = pathParts.length - 1;
            const relativePath = '../'.repeat(depth);
            
            console.log(`🔍 ${filePath} (Tiefe: ${depth})`);
            
            // Korrigiere data-srcset Pfade
            content = content.replace(
                /data-srcset=["']content\/images-optimized\//g,
                `data-srcset="${relativePath}content/images-optimized/`
            );
            
            // Korrigiere data-src Pfade falls nötig
            content = content.replace(
                /data-src=["']content\/images\//g,
                `data-src="${relativePath}content/images/`
            );
            
            // Prüfe auf Änderungen
            const originalContent = fs.readFileSync(filePath, 'utf8');
            if (content !== originalContent) {
                changed = true;
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ ${filePath} - Pfade korrigiert`);
            } else {
                console.log(`⚪ ${filePath} - Bereits korrekt`);
            }
        }
        
        return changed;
        
    } catch (error) {
        console.error(`❌ Fehler bei ${filePath}:`, error.message);
        return false;
    }
}

async function fixAllSubpages() {
    console.time('⏱️  Pfad-Korrekturen');
    
    // Finde alle HTML-Dateien in Unterordnern
    const htmlFiles = glob.sync('**/*.html', {
        ignore: ['node_modules/**', 'cms-admin/**', 'content/**']
    });
    
    // Filtere nur Unterseiten (nicht Root-Dateien)
    const subpageFiles = htmlFiles.filter(file => 
        file.includes('/') || file.includes('\\')
    );
    
    console.log(`📄 ${subpageFiles.length} Unterseiten gefunden\n`);
    
    let fixedFiles = 0;
    
    for (const file of subpageFiles) {
        if (fixPathsInFile(file)) {
            fixedFiles++;
        }
    }
    
    console.log(`\n📊 PFAD-KORREKTUREN ABGESCHLOSSEN:`);
    console.log('==================================');
    console.log(`📄 Unterseiten geprüft: ${subpageFiles.length}`);
    console.log(`✅ Dateien korrigiert: ${fixedFiles}`);
    console.log(`🖼️  Bildpfade in Unterseiten nun korrekt`);
    
    console.timeEnd('⏱️  Pfad-Korrekturen');
    
    return fixedFiles;
}

if (require.main === module) {
    fixAllSubpages().catch(console.error);
}

module.exports = { fixAllSubpages };