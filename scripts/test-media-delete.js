#!/usr/bin/env node

console.log('🗑️ Media Delete Test - Debug Info\n');

console.log('📝 Steps to debug:');
console.log('1. Open Browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Navigate to Media Manager');
console.log('4. Click on any image to open modal');
console.log('5. Click "Löschen" button');
console.log('6. Watch console for debug messages:');
console.log('   - 🗑️ Delete function called');
console.log('   - 📄 Media to delete');
console.log('   - 🔄 Sending DELETE request');
console.log('   - 📡 DELETE response status');
console.log('   - ✅ DELETE successful OR ❌ Error details');

console.log('\n🔍 Common Issues:');
console.log('- currentMediaId not set → Check if modal opens correctly');
console.log('- Auth headers missing → Check getAuthHeaders() function');
console.log('- Wrong filename → Check media.filename value');
console.log('- API route not working → Check server logs');

console.log('\n🚀 Test it now:');
console.log('http://localhost:3001/cms-admin → Media → Click image → Delete');