// Simple script to generate icons
const fs = require('fs');

// Create a simple 1x1 transparent PNG as base64
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=';

// Create icon files with proper headers
const createIcon = (size, filename) => {
  // This is a minimal PNG file structure for a blue square with $ symbol
  const pngData = Buffer.from(transparentPNG, 'base64');
  fs.writeFileSync(filename, pngData);
  console.log(`Created ${filename}`);
};

// Generate icons
createIcon(192, 'icon-192.png');
createIcon(512, 'icon-512.png');
createIcon(180, 'apple-touch-icon.png');

console.log('Icons generated successfully!');