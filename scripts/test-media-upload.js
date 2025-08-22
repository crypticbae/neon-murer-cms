#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📸 Media Upload System - Quick Test\n');

// Test file paths
const testImagePath = path.join(__dirname, '..', 'content', 'images');
const uploadsPath = path.join(__dirname, '..', 'uploads');

console.log('🔍 Testing Directories:');
console.log(`📁 Content Images: ${testImagePath}`);
console.log(`📁 Uploads: ${uploadsPath}`);

// Check if directories exist
if (fs.existsSync(testImagePath)) {
    const files = fs.readdirSync(testImagePath);
    console.log(`✅ Content Images Directory exists (${files.length} files)`);
} else {
    console.log('❌ Content Images Directory missing');
}

if (fs.existsSync(uploadsPath)) {
    const files = fs.readdirSync(uploadsPath);
    console.log(`✅ Uploads Directory exists (${files.length} files)`);
} else {
    console.log('❌ Uploads Directory missing');
}

console.log('\n🚀 Test the new Media Manager:');
console.log('1. Open http://localhost:3001/cms-admin');
console.log('2. Navigate to "Medien verwalten"');
console.log('3. Click "Bilder hochladen"');
console.log('4. Upload a test image');
console.log('5. Click on uploaded image to see new modal');
console.log('\n✨ Features to test:');
console.log('- Drag & Drop Upload');
console.log('- Progress Indicator');
console.log('- Automatic Image Optimization');
console.log('- New Modern Modal Design');
console.log('- Copy URL functionality');
console.log('- Delete functionality');