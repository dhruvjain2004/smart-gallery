const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
  console.log('Created public directory');
}

// Copy HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
  fs.copyFileSync(file, path.join('public', file));
  console.log(`Copied ${file} to public/`);
});

// Copy JS files
const jsFiles = fs.readdirSync('.').filter(file => file.endsWith('.js') && file !== 'build.js');
jsFiles.forEach(file => {
  fs.copyFileSync(file, path.join('public', file));
  console.log(`Copied ${file} to public/`);
});

console.log('Build completed successfully!');