// Mini local server for testing - mimics Vercel's routing
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Inline config handler (same logic as api/config.js)
function handleConfig(req, res) {
  const pin = req.headers['x-app-pin'] || '';
  const validPin = '123456'; // default from config.js

  if (pin === validPin) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      supabaseUrl: 'https://nbxcvigngtzeymoleuvc.supabase.co',
      supabaseKey: 'sb_publishable_C8ce4W1sC4VoDiRKnwkbhw_faMXX5lT',
      defaultGasUrl: 'https://script.google.com/macros/s/AKfycbxrSqP9kCSNpfNmU4uVjuMtEFxLAImLz4NMUqoUZDSktXzfnL1CBPFocEdgtzBPWM-5/exec'
    }));
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'PIN Tidak Valid' }));
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // API route: /api/config
  if (url.pathname === '/api/config') {
    handleConfig(req, res);
    return;
  }
  
  // Clean URLs (like Vercel): /unik -> /unik.html
  let filePath = url.pathname;
  if (filePath === '/') filePath = '/index.html';
  else if (!path.extname(filePath)) filePath += '.html';
  
  const fullPath = path.join(ROOT, filePath);
  
  if (!fs.existsSync(fullPath)) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }
  
  const ext = path.extname(fullPath);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  fs.createReadStream(fullPath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n  Local server running at: http://localhost:${PORT}`);
  console.log(`  UNIK page: http://localhost:${PORT}/unik`);
  console.log(`  PIN: 123456\n`);
});
