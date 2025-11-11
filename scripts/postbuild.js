const fs = require('fs');
const path = require('path');

console.log('Build completed. Copying redirect files...');

try {
  // Copy _redirects file to build directory
  const sourceFile = path.join(__dirname, '..', 'public', '_redirects');
  const destFile = path.join(__dirname, '..', 'build', '_redirects');
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    console.log('✅ _redirects file copied successfully');
  } else {
    console.log('⚠️  _redirects file not found, skipping...');
  }
  
  // Also ensure build directory structure is correct
  const buildDir = path.join(__dirname, '..', 'build');
  if (fs.existsSync(buildDir)) {
    console.log('✅ Build directory ready for deployment');
  }
  
} catch (error) {
  console.error('❌ Error during postbuild:', error.message);
  // Don't exit with error - this shouldn't break the build
}