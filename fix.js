const fs = require('fs');
let content = fs.readFileSync('unik.html', 'utf-8');
content = content.replace(/\\`/g, '`').replace(/\\\${/g, '${');
fs.writeFileSync('unik.html', content);
console.log('Fixed syntax errors');
