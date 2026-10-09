const fs = require('fs');
let content = fs.readFileSync('src/App.vue', 'utf8');

// Replace the empty line after <style> with tailwind imports
content = content.replace(/<style>/, '<style>\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');

fs.writeFileSync('src/App.vue', content);
