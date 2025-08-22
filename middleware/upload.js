const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

// Helper function to convert size strings to bytes
function parseSize(sizeStr) {
    if (typeof sizeStr === 'number') return sizeStr;
    if (!sizeStr) return 10 * 1024 * 1024; // 10MB default
    
    const match = sizeStr.toString().toLowerCase().match(/^(\d+)([kmg]?b?)$/);
    if (!match) return 10 * 1024 * 1024; // 10MB default
    
    const size = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'kb': return size * 1024;
        case 'mb': return size * 1024 * 1024;
        case 'gb': return size * 1024 * 1024 * 1024;
        case 'b':
        default: return size;
    }
}

// Ensure upload directory exists
const uploadDir = './content/images'; // Upload directly to content/images
const contentDir = './content/images';

[uploadDir, contentDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
    try {
        // Allowed image types
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ];
        
        // Check MIME type
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}. Nur JPG, PNG, GIF, WebP und SVG sind erlaubt.`), false);
        }
        
        // Check file extension
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        if (!allowedExts.includes(ext)) {
            return cb(new Error(`Dateiendung nicht erlaubt: ${ext}`), false);
        }
        
        // Verify MIME type matches extension
        const expectedMime = mime.lookup(file.originalname);
        if (expectedMime && expectedMime !== file.mimetype) {
            return cb(new Error('MIME-Type stimmt nicht mit Dateiendung überein'), false);
        }
        
        // Security: Check filename for malicious patterns
        if (file.originalname.match(/[<>:"/\\|?*\x00-\x1f]/)) {
            return cb(new Error('Dateiname enthält ungültige Zeichen'), false);
        }
        
        cb(null, true);
        
    } catch (error) {
        cb(new Error('Fehler bei Dateivalidierung: ' + error.message), false);
    }
};

// Dynamic storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    
    filename: (req, file, cb) => {
        try {
            // Sanitize filename
            const sanitizedName = file.originalname
                .replace(/[^a-zA-Z0-9.-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            
            // Create unique filename with timestamp
            const timestamp = Date.now();
            const ext = path.extname(sanitizedName);
            const name = path.basename(sanitizedName, ext);
            
            const filename = `${name}-${timestamp}${ext}`;
            
            // Store original filename in request for later use
            req.uploadOriginalName = file.originalname;
            req.uploadSanitizedName = filename;
            
            cb(null, filename);
            
        } catch (error) {
            cb(new Error('Fehler beim Generieren des Dateinamens: ' + error.message));
        }
    }
});

// Multer configuration with enhanced security
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseSize(process.env.MAX_FILE_SIZE), // Correctly parse "10mb" to bytes
        files: 10, // Max 10 files at once
        fields: 20, // Max 20 form fields
    }
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }
    
    try {
        for (const file of req.files) {
            // Skip SVG files (vector graphics don't need optimization)
            if (file.mimetype === 'image/svg+xml') {
                continue;
            }
            
            const inputPath = file.path;
            const outputPath = path.join(contentDir, file.filename);
            const ext = path.extname(file.filename).toLowerCase();
            
            console.log(`🔄 Optimizing image: ${file.filename}`);
            console.log(`📁 Input path: ${inputPath}`);
            console.log(`📁 Output path: ${outputPath}`);
            console.log(`🔍 Input file exists: ${fs.existsSync(inputPath)}`);
            
            if (!fs.existsSync(inputPath)) {
                throw new Error(`Input file not found: ${inputPath}`);
            }
            
            let optimizedBuffer;
            
            // Optimize based on file type
            if (ext === '.png') {
                optimizedBuffer = await sharp(inputPath)
                    .png({ 
                        quality: 90,
                        compressionLevel: 8,
                        progressive: true
                    })
                    .resize(2000, 2000, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .toBuffer();
                    
            } else if (['.jpg', '.jpeg'].includes(ext)) {
                optimizedBuffer = await sharp(inputPath)
                    .jpeg({ 
                        quality: 85,
                        progressive: true,
                        mozjpeg: true
                    })
                    .resize(2000, 2000, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .toBuffer();
                    
            } else if (ext === '.webp') {
                optimizedBuffer = await sharp(inputPath)
                    .webp({ 
                        quality: 85,
                        effort: 6
                    })
                    .resize(2000, 2000, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .toBuffer();
                    
            } else if (ext === '.gif') {
                // For GIFs, just copy without optimization (to preserve animation)
                optimizedBuffer = fs.readFileSync(inputPath);
            }
            
            // Write optimized image to content directory
            try {
                fs.writeFileSync(outputPath, optimizedBuffer);
                console.log(`💾 File written to: ${outputPath}`);
                console.log(`🔍 File exists check: ${fs.existsSync(outputPath)}`);
            } catch (writeError) {
                console.error(`❌ Write error: ${writeError.message}`);
                throw writeError;
            }
            
            // Get file stats for metadata
            if (!fs.existsSync(outputPath)) {
                throw new Error(`Output file was not created: ${outputPath}`);
            }
            
            const stats = fs.statSync(outputPath);
            const originalStats = fs.statSync(inputPath);
            
            console.log(`📊 Final file size: ${stats.size} bytes`);
            
            // IMMEDIATE verification after stat
            const immediateCheck = fs.existsSync(outputPath);
            console.log(`🔍 IMMEDIATE file check after stat: ${immediateCheck}`);
            
            // Update file object with optimization info
            file.optimizedPath = outputPath;
            file.optimizedSize = stats.size;
            file.originalSize = originalStats.size;
            file.compressionRatio = ((originalStats.size - stats.size) / originalStats.size * 100).toFixed(1);
            
            console.log(`✅ Optimized ${file.filename}: ${(originalStats.size / 1024).toFixed(1)}KB → ${(stats.size / 1024).toFixed(1)}KB (${file.compressionRatio}% savings)`);
        }
        
        // FINAL verification before leaving middleware
        for (const file of req.files) {
            if (file.optimizedPath) {
                const finalCheck = fs.existsSync(file.optimizedPath);
                console.log(`🔍 FINAL CHECK before leaving middleware: ${file.filename} exists: ${finalCheck}`);
                if (finalCheck) {
                    console.log(`📁 Full absolute path: ${path.resolve(file.optimizedPath)}`);
                }
            }
        }
        
        next();
        
    } catch (error) {
        console.error('❌ Image optimization error:', error);
        // Continue even if optimization fails
        next();
    }
};

// Cleanup middleware (removes temp files)
const cleanup = (req, res, next) => {
    console.log(`🧹 CLEANUP MIDDLEWARE CALLED`);
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            console.log(`🧹 Cleanup checking file.path: ${file.path}`);
            console.log(`🧹 file.optimizedPath: ${file.optimizedPath || 'undefined'}`);
            try {
                // Skip cleanup if file has been optimized in-place 
                if (file.optimizedPath && file.path === file.optimizedPath) {
                    console.log(`🧹 SKIPPING cleanup for optimized file: ${file.path}`);
                    return;
                }
                
                if (fs.existsSync(file.path)) {
                    console.log(`🧹 DELETING temp file: ${file.path}`);
                    fs.unlinkSync(file.path);
                }
            } catch (error) {
                console.warn(`⚠️ Could not clean up temp file: ${file.path}`, error);
            }
        });
    }
    next();
};

module.exports = {
    upload,
    optimizeImage,
    cleanup,
    fileFilter,
    
    // Utility functions
    validateFileType: (mimetype) => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ];
        return allowedTypes.includes(mimetype);
    },
    
    sanitizeFilename: (filename) => {
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
};