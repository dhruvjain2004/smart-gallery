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

// Copy CSS files (if any)
const cssFiles = fs.readdirSync('.').filter(file => file.endsWith('.css'));
if (cssFiles.length > 0) {
  cssFiles.forEach(file => {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`Copied ${file} to public/`);
  });
}

// Copy image files (if any)
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
const imageFiles = fs.readdirSync('.').filter(file => {
  const ext = path.extname(file).toLowerCase();
  return imageExtensions.includes(ext);
});

if (imageFiles.length > 0) {
  imageFiles.forEach(file => {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`Copied ${file} to public/`);
  });
}

// Copy images directory if it exists
if (fs.existsSync('images')) {
  // Create images directory in public
  if (!fs.existsSync(path.join('public', 'images'))) {
    fs.mkdirSync(path.join('public', 'images'), { recursive: true });
    console.log('Created public/images directory');
  }
  
  // Copy all files from images directory
  const imagesDir = fs.readdirSync('images');
  imagesDir.forEach(file => {
    const sourcePath = path.join('images', file);
    const destPath = path.join('public', 'images', file);
    
    // Skip directories
    if (fs.statSync(sourcePath).isDirectory()) return;
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied images/${file} to public/images/`);
  });
}

// Create a verification file to confirm build process
fs.writeFileSync(
  path.join('public', 'build-info.json'),
  JSON.stringify({
    buildTime: new Date().toISOString(),
    files: {
      html: htmlFiles.length,
      js: jsFiles.length,
      css: cssFiles.length,
      images: imageFiles.length
    }
  }, null, 2)
);

console.log('Build completed successfully!');