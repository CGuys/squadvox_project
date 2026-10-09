const fs = require('fs');
let content = fs.readFileSync('vite.config.js', 'utf8');

// Remove the entire css: { postcss: ... } block
content = content.replace(/css:\s*\{\s*postcss:\s*\{\s*plugins:\s*\[[\s\S]*?\]\s*\}\s*\},/, '');
// Also remove tailwindcss and autoprefixer imports
content = content.replace(/import tailwindcss from 'tailwindcss'\n/, '');
content = content.replace(/import autoprefixer from 'autoprefixer'\n/, '');

fs.writeFileSync('vite.config.js', content);
