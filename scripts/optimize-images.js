#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('📸 Neon Murer Bildoptimierung\n');

const IMAGES_DIR = path.join(__dirname, '../content/images');
const OPTIMIZED_DIR = path.join(__dirname, '../content/images-optimized');

// Stelle sicher dass Optimized-Ordner existiert
if (!fs.existsSync(OPTIMIZED_DIR)) {
    fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputDir, filename) {
    try {
        const originalStats = fs.statSync(inputPath);
        const originalSizeKB = Math.round(originalStats.size / 1024);
        
        console.log(`🔄 Optimiere: ${filename} (${originalSizeKB}KB)`);
        
        const ext = path.extname(filename).toLowerCase();
        const nameWithoutExt = path.basename(filename, ext);
        
        let optimized = sharp(inputPath);
        
        // Größe reduzieren wenn sehr groß
        const metadata = await optimized.metadata();
        const maxWidth = 1920; // Max Breite für Web
        
        if (metadata.width > maxWidth) {
            optimized = optimized.resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }
        
        // Verschiedene Formate erstellen
        const outputs = [];
        
        // 1. WebP (modernste Komprimierung)
        const webpPath = path.join(outputDir, `${nameWithoutExt}.webp`);
        await optimized
            .clone()
            .webp({ 
                quality: 85,
                effort: 6
            })
            .toFile(webpPath);
        
        const webpStats = fs.statSync(webpPath);
        const webpSizeKB = Math.round(webpStats.size / 1024);
        outputs.push({
            format: 'WebP',
            path: webpPath,
            size: webpSizeKB,
            reduction: Math.round((1 - webpStats.size / originalStats.size) * 100)
        });
        
        // 2. Optimiertes JPEG (Fallback)
        if (ext === '.jpg' || ext === '.jpeg') {
            const jpegPath = path.join(outputDir, `${nameWithoutExt}-optimized.jpg`);
            await optimized
                .clone()
                .jpeg({ 
                    quality: 85,
                    progressive: true,
                    mozjpeg: true
                })
                .toFile(jpegPath);
            
            const jpegStats = fs.statSync(jpegPath);
            const jpegSizeKB = Math.round(jpegStats.size / 1024);
            outputs.push({
                format: 'JPEG',
                path: jpegPath,
                size: jpegSizeKB,
                reduction: Math.round((1 - jpegStats.size / originalStats.size) * 100)
            });
        }
        
        // 3. Optimiertes PNG (für PNGs)
        if (ext === '.png') {
            const pngPath = path.join(outputDir, `${nameWithoutExt}-optimized.png`);
            await optimized
                .clone()
                .png({ 
                    quality: 85,
                    compressionLevel: 9,
                    adaptiveFiltering: true
                })
                .toFile(pngPath);
            
            const pngStats = fs.statSync(pngPath);
            const pngSizeKB = Math.round(pngStats.size / 1024);
            outputs.push({
                format: 'PNG',
                path: pngPath,
                size: pngSizeKB,
                reduction: Math.round((1 - pngStats.size / originalStats.size) * 100)
            });
        }
        
        console.log(`✅ ${filename}:`);
        outputs.forEach(output => {
            console.log(`   ${output.format}: ${output.size}KB (-${output.reduction}%)`);
        });
        
        return {
            original: {
                filename,
                size: originalSizeKB
            },
            optimized: outputs
        };
        
    } catch (error) {
        console.error(`❌ Fehler bei ${filename}:`, error.message);
        return null;
    }
}

async function optimizeAllImages() {
    console.time('⏱️  Gesamtzeit');
    
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('❌ Images directory not found');
        return;
    }
    
    const files = fs.readdirSync(IMAGES_DIR);
    const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png)$/i.test(file) && 
        !file.includes('-optimized') // Skip bereits optimierte
    );
    
    console.log(`🎯 ${imageFiles.length} Bilder zu optimieren...\n`);
    
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    const results = [];
    
    // Nur die größten Bilder zuerst (>500KB)
    const largeFiles = [];
    for (const file of imageFiles) {
        const filePath = path.join(IMAGES_DIR, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (sizeKB > 500) {
            largeFiles.push({ file, size: sizeKB });
        }
    }
    
    largeFiles.sort((a, b) => b.size - a.size);
    
    console.log(`🔥 Optimiere ${largeFiles.length} große Bilder (>500KB):\n`);
    
    for (const {file} of largeFiles.slice(0, 10)) { // Nur die ersten 10
        const inputPath = path.join(IMAGES_DIR, file);
        const result = await optimizeImage(inputPath, OPTIMIZED_DIR, file);
        
        if (result) {
            results.push(result);
            totalOriginalSize += result.original.size;
            
            // Beste Komprimierung verwenden
            const bestOptimized = result.optimized.reduce((best, current) => 
                current.size < best.size ? current : best
            );
            totalOptimizedSize += bestOptimized.size;
        }
        
        console.log(); // Leerzeile
    }
    
    console.log('\n📊 OPTIMIERUNG ABGESCHLOSSEN:');
    console.log('==============================');
    console.log(`🖼️  Bilder optimiert: ${results.length}`);
    console.log(`📉 Original: ${totalOriginalSize}KB`);
    console.log(`📈 Optimiert: ${totalOptimizedSize}KB`);
    console.log(`💾 Ersparnis: ${totalOriginalSize - totalOptimizedSize}KB (-${Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100)}%)`);
    
    console.timeEnd('⏱️  Gesamtzeit');
    
    return results;
}

// HTML-Update Helper
function generatePictureElement(imageName) {
    const nameWithoutExt = path.basename(imageName, path.extname(imageName));
    
    return `<picture>
  <source srcset="content/images-optimized/${nameWithoutExt}.webp" type="image/webp">
  <source srcset="content/images-optimized/${nameWithoutExt}-optimized.jpg" type="image/jpeg">
  <img src="content/images/${imageName}" alt="${nameWithoutExt}" loading="lazy">
</picture>`;
}

if (require.main === module) {
    optimizeAllImages().catch(console.error);
}

module.exports = { optimizeAllImages, generatePictureElement };