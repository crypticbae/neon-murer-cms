const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { upload, optimizeImage, cleanup } = require('../middleware/upload');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all media files from content/images directory
router.get('/', (req, res) => {
  try {
    const contentImagesPath = path.join(__dirname, '..', 'content', 'images');
    
    // Check if directory exists
    if (!fs.existsSync(contentImagesPath)) {
      return res.status(404).json({ error: 'Content images directory not found' });
    }
    
    // Read all files from directory
    const files = fs.readdirSync(contentImagesPath);
    
    // Filter for image files (jpg, jpeg, png, gif, webp, svg)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // Create media items array
    const mediaItems = imageFiles.map((file, index) => {
      const ext = path.extname(file).toLowerCase();
      const nameWithoutExt = path.basename(file, ext);
      
      // Determine category based on filename
      let category = 'general';
      if (file.includes('fahrzeugbeschriftung')) category = 'fahrzeugbeschriftung';
      else if (file.includes('fensterbeschriftung')) category = 'fensterbeschriftung';
      else if (file.includes('grossformatdruck')) category = 'grossformatdruck';
      else if (file.includes('blachen-fahnen')) category = 'blachen-fahnen';
      else if (file.includes('signaletik')) category = 'signaletik';
      else if (file.includes('tafelbeschriftung')) category = 'tafelbeschriftung';
      else if (file.includes('pylonen')) category = 'pylonen';
      else if (file.includes('neon-led-technik')) category = 'neon-led-technik';
      else if (file.includes('halbrelief-plattenschriften')) category = 'halbrelief-plattenschriften';
      else if (file.includes('leuchttransparente')) category = 'leuchttransparente';
      else if (file.includes('person') || file.includes('mitarbeiter') || file.includes('team') || file.includes('_cut')) category = 'team';
      else if (file.includes('fachkompetenzen')) category = 'fachkompetenzen';
      else if (file.includes('leistungen')) category = 'leistungen';
      else if (file.includes('digital-signage')) category = 'digital-signage';
      else if (ext === '.svg') category = 'logos';
      
      return {
        id: index + 1,
        name: nameWithoutExt.replace(/[-_]/g, ' '),
        filename: file,
        path: `/content/images/${file}`,
        category: category,
        type: 'image',
        extension: ext,
        size: fs.statSync(path.join(contentImagesPath, file)).size
      };
    });
    
    // Sort by category and name
    mediaItems.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    res.json({
      success: true,
      count: mediaItems.length,
      media: mediaItems
    });
    
  } catch (error) {
    console.error('Error loading media files:', error);
    res.status(500).json({ error: 'Failed to load media files: ' + error.message });
  }
});

// Get media by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const contentImagesPath = path.join(__dirname, '..', 'content', 'images');
    
    if (!fs.existsSync(contentImagesPath)) {
      return res.status(404).json({ error: 'Content images directory not found' });
    }
    
    const files = fs.readdirSync(contentImagesPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    const filteredFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      if (!imageExtensions.includes(ext)) return false;
      
      // Filter by category
      if (category === 'all') return true;
      if (category === 'team' && (file.includes('person') || file.includes('mitarbeiter') || file.includes('team') || file.includes('_cut'))) return true;
      if (category === 'logos' && ext === '.svg') return true;
      return file.includes(category);
    });
    
    const mediaItems = filteredFiles.map((file, index) => {
      const ext = path.extname(file).toLowerCase();
      const nameWithoutExt = path.basename(file, ext);
      
      return {
        id: index + 1,
        name: nameWithoutExt.replace(/[-_]/g, ' '),
        filename: file,
        path: `/content/images/${file}`,
        category: category,
        type: 'image',
        extension: ext
      };
    });
    
    res.json({
      success: true,
      category: category,
      count: mediaItems.length,
      media: mediaItems
    });
    
  } catch (error) {
    console.error('Error loading media by category:', error);
    res.status(500).json({ error: 'Failed to load media by category: ' + error.message });
  }
});

// Upload multiple files endpoint
router.post('/upload', 
  authenticateToken,
  requireAdmin,
  upload.array('files', 10), // Max 10 files
  optimizeImage,
  cleanup,
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Keine Dateien zum Upload erhalten'
        });
      }
      
      const uploadedFiles = req.files.map(file => ({
        originalName: req.uploadOriginalName || file.originalname,
        filename: file.filename,
        path: `/content/images/${file.filename}`,
        size: file.optimizedSize || file.size,
        originalSize: file.originalSize || file.size,
        compressionRatio: file.compressionRatio || '0',
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      }));
      
      console.log(`✅ Successfully uploaded ${uploadedFiles.length} files:`, 
        uploadedFiles.map(f => f.filename).join(', '));
      
      // VERIFY files exist RIGHT BEFORE response
      uploadedFiles.forEach(file => {
        const fullPath = path.join(__dirname, '..', 'content', 'images', file.filename);
        const existsNow = fs.existsSync(fullPath);
        console.log(`🔍 PRE-RESPONSE CHECK: ${file.filename} exists: ${existsNow}`);
        if (existsNow) {
          console.log(`📁 Absolute path: ${path.resolve(fullPath)}`);
        }
      });
      
      res.json({
        success: true,
        message: `${uploadedFiles.length} Datei(en) erfolgreich hochgeladen und optimiert`,
        files: uploadedFiles,
        totalSavings: uploadedFiles.reduce((sum, file) => {
          return sum + (parseFloat(file.compressionRatio) || 0);
        }, 0).toFixed(1) + '%'
      });
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Upload fehlgeschlagen: ' + error.message
      });
    }
  }
);

// Delete media file endpoint
router.delete('/:filename', 
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '..', 'content', 'images', filename);
      
      console.log(`🗑️ DELETE request for filename: "${filename}"`);
      console.log(`📁 Full file path: "${filePath}"`);
      
      // Security check: ensure filename doesn't contain path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        console.log(`❌ Security check failed: invalid filename`);
        return res.status(400).json({
          success: false,
          error: 'Ungültiger Dateiname'
        });
      }
      
      // Check if file exists
      const fileExists = fs.existsSync(filePath);
      console.log(`📄 File exists check: ${fileExists}`);
      
      if (!fileExists) {
        console.log(`❌ File not found: ${filePath}`);
        return res.status(404).json({
          success: false,
          error: 'Datei nicht gefunden'
        });
      }
      
      // Get file stats before deletion
      const stats = fs.statSync(filePath);
      console.log(`📊 File stats before deletion: ${stats.size} bytes, modified: ${stats.mtime}`);
      
      // Delete file
      console.log(`🔄 Attempting to delete file: ${filePath}`);
      fs.unlinkSync(filePath);
      
      // Verify deletion
      const stillExists = fs.existsSync(filePath);
      console.log(`🔍 File still exists after deletion: ${stillExists}`);
      
      if (stillExists) {
        console.error(`❌ File deletion failed - file still exists: ${filePath}`);
        return res.status(500).json({
          success: false,
          error: 'Datei konnte nicht gelöscht werden'
        });
      }
      
      console.log(`✅ Successfully deleted media file: ${filename}`);
      
      res.json({
        success: true,
        message: `Datei ${filename} erfolgreich gelöscht`
      });
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Löschen fehlgeschlagen: ' + error.message
      });
    }
  }
);

// Get upload statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const contentImagesPath = path.join(__dirname, '..', 'content', 'images');
    
    if (!fs.existsSync(contentImagesPath)) {
      return res.json({
        success: true,
        stats: { totalFiles: 0, totalSize: 0, categories: {} }
      });
    }
    
    const files = fs.readdirSync(contentImagesPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    let totalSize = 0;
    const categories = {};
    
    imageFiles.forEach(file => {
      const filePath = path.join(contentImagesPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      // Determine category
      let category = 'general';
      if (file.includes('fahrzeugbeschriftung')) category = 'fahrzeugbeschriftung';
      else if (file.includes('fensterbeschriftung')) category = 'fensterbeschriftung';
      else if (file.includes('grossformatdruck')) category = 'grossformatdruck';
      else if (file.includes('blachen-fahnen')) category = 'blachen-fahnen';
      else if (file.includes('signaletik')) category = 'signaletik';
      else if (file.includes('tafelbeschriftung')) category = 'tafelbeschriftung';
      else if (file.includes('team') || file.includes('person') || file.includes('_cut')) category = 'team';
      else if (path.extname(file).toLowerCase() === '.svg') category = 'logos';
      
      if (!categories[category]) {
        categories[category] = { count: 0, size: 0 };
      }
      categories[category].count++;
      categories[category].size += stats.size;
    });
    
    res.json({
      success: true,
      stats: {
        totalFiles: imageFiles.length,
        totalSize: totalSize,
        totalSizeFormatted: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
        categories: categories
      }
    });
    
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Statistiken konnten nicht geladen werden: ' + error.message
    });
  }
});

module.exports = router; 