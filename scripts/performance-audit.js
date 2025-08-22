#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Neon Murer Performance-Audit\n');

// 1. Analysiere alle Bilder in content/images/
function analyzeImages() {
    console.log('📸 Bild-Analyse:');
    const imagesDir = path.join(__dirname, '../content/images');
    
    if (!fs.existsSync(imagesDir)) {
        console.log('❌ Images directory not found');
        return;
    }
    
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp|svg)$/i.test(file)
    );
    
    let totalSize = 0;
    const largeImages = [];
    
    imageFiles.forEach(file => {
        const filePath = path.join(imagesDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += stats.size;
        
        if (sizeKB > 100) { // Größer als 100KB
            largeImages.push({
                file,
                size: sizeKB,
                type: path.extname(file).toLowerCase()
            });
        }
    });
    
    console.log(`📊 Gesamt: ${imageFiles.length} Bilder, ${Math.round(totalSize / 1024 / 1024 * 100) / 100} MB`);
    console.log(`⚠️  Große Bilder (>100KB): ${largeImages.length}`);
    
    if (largeImages.length > 0) {
        console.log('\n🔴 Optimierungsbedarf:');
        largeImages
            .sort((a, b) => b.size - a.size)
            .slice(0, 10)
            .forEach(img => {
                console.log(`   ${img.file}: ${img.size}KB ${img.type}`);
            });
    }
    
    return {
        total: imageFiles.length,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        largeImages: largeImages.length,
        needsOptimization: largeImages.filter(img => img.type !== '.webp')
    };
}

// 2. Analysiere CSS/JS Bundle-Größen
function analyzeBundles() {
    console.log('\n📦 Bundle-Analyse:');
    
    const checkFile = (filePath, name) => {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`   ${name}: ${sizeKB}KB`);
            return sizeKB;
        } else {
            console.log(`   ${name}: ❌ Not found`);
            return 0;
        }
    };
    
    let totalSize = 0;
    
    // CMS Assets
    totalSize += checkFile(path.join(__dirname, '../cms-admin/assets/js/admin.js'), 'admin.js');
    totalSize += checkFile(path.join(__dirname, '../cms-admin/assets/css/admin.css'), 'admin.css');
    
    // Template Assets
    totalSize += checkFile(path.join(__dirname, '../template/assets/js/custom.js'), 'custom.js');
    totalSize += checkFile(path.join(__dirname, '../template/assets/css/style.css'), 'style.css');
    
    console.log(`📊 Gesamt-Bundle: ~${totalSize}KB`);
    
    return { totalSizeKB: totalSize };
}

// 3. Prüfe fehlende Assets (404-Fehler)
function checkMissingAssets() {
    console.log('\n🔍 Fehlende Assets prüfen:');
    
    const checkAsset = (filePath, description) => {
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${description}`);
            return true;
        } else {
            console.log(`   ❌ ${description} - MISSING`);
            return false;
        }
    };
    
    const issues = [];
    
    // Font-Dateien prüfen
    const fontDir = path.join(__dirname, '../template/assets/webfonts');
    if (!checkAsset(path.join(fontDir, 'dm-sans-v15-latin-900.woff2'), 'DM Sans Bold Font')) {
        issues.push('Missing: dm-sans-v15-latin-900.woff2');
    }
    
    // Source Maps prüfen  
    const cssDir = path.join(__dirname, '../template/assets/css');
    if (!checkAsset(path.join(cssDir, 'bootstrap.min.css.map'), 'Bootstrap Source Map')) {
        issues.push('Missing: bootstrap.min.css.map');
    }
    
    return issues;
}

// 4. CDN-Optimierungsmöglichkeiten
function analyzeThirdPartyLibs() {
    console.log('\n🌐 Third-Party Libraries:');
    
    const libs = [
        'Bootstrap 5.3.0',
        'Font Awesome 6.4.0', 
        'jQuery 3.7.1',
        'Chart.js 3.9.1',
        'xlsx 0.18.5'
    ];
    
    libs.forEach(lib => {
        console.log(`   📚 ${lib} - CDN optimierbar`);
    });
    
    return libs;
}

// Main Audit
async function runAudit() {
    console.time('⏱️  Audit Duration');
    
    const results = {
        images: analyzeImages(),
        bundles: analyzeBundles(), 
        missingAssets: checkMissingAssets(),
        thirdPartyLibs: analyzeThirdPartyLibs()
    };
    
    console.log('\n📋 PERFORMANCE-AUDIT ZUSAMMENFASSUNG:');
    console.log('=====================================');
    console.log(`🖼️  Bilder: ${results.images.total} files (${results.images.totalSizeMB}MB)`);
    console.log(`📦 Bundles: ${results.bundles.totalSizeKB}KB total`);
    console.log(`❌ Fehlende Assets: ${results.missingAssets.length}`);
    console.log(`📚 CDN-optimierbar: ${results.thirdPartyLibs.length} Libraries`);
    
    console.log('\n🎯 EMPFOHLENE ACTIONS:');
    console.log('=====================');
    
    if (results.images.largeImages > 0) {
        console.log(`1. 📸 ${results.images.largeImages} große Bilder komprimieren`);
    }
    
    if (results.missingAssets.length > 0) {
        console.log(`2. 🔧 ${results.missingAssets.length} fehlende Assets beheben`);
    }
    
    if (results.thirdPartyLibs.length > 0) {
        console.log(`3. 🌐 ${results.thirdPartyLibs.length} Libraries zu CDN migrieren`);
    }
    
    if (results.bundles.totalSizeKB > 500) {
        console.log('4. 📦 Bundle-Größe reduzieren (Minification)');
    }
    
    console.log('5. ⚡ Lazy Loading implementieren');
    console.log('6. 💾 Browser-Caching optimieren');
    
    console.timeEnd('⏱️  Audit Duration');
    
    return results;
}

if (require.main === module) {
    runAudit().catch(console.error);
}

module.exports = { runAudit };