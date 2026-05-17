const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = __dirname;
const HISTORY_DIR = path.join(ROOT, '.editor-history');
const PORT = 8081;

// Ensure history dir
if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function getMime(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function safePath(p) {
  const resolved = path.resolve(ROOT, p);
  if (!resolved.startsWith(ROOT)) return null;
  if (resolved.startsWith(HISTORY_DIR)) return null;
  return resolved;
}

// History helpers
function historyDir(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/[\\/]/g, '__');
  const dir = path.join(HISTORY_DIR, rel);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveHistory(filePath) {
  if (!fs.existsSync(filePath)) return;
  const dir = historyDir(filePath);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = path.extname(filePath);
  const dest = path.join(dir, ts + ext);
  fs.copyFileSync(filePath, dest);

  // Keep max 50 versions
  const files = fs.readdirSync(dir).sort();
  while (files.length > 50) {
    fs.unlinkSync(path.join(dir, files.shift()));
  }
}

function getHistory(filePath) {
  const dir = historyDir(filePath);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).sort().reverse().map(f => {
    const timeMatch = f.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
    const timeStr = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}:${timeMatch[3]}:${timeMatch[4]}` : f;
    return {
      name: f,
      time: timeStr,
      path: path.join(dir, f),
    };
  });
}

// List HTML/CSS files
function listFiles(dir, base = '') {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const rel = base ? base + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      result.push(...listFiles(path.join(dir, entry.name), rel));
    } else if (/\.(html|css)$/i.test(entry.name)) {
      result.push(rel);
    }
  }
  return result;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsed.pathname);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API routes
  if (pathname === '/api/files') {
    return json(res, listFiles(ROOT));
  }

  if (pathname === '/api/file' && req.method === 'GET') {
    const p = parsed.query.path;
    if (!p) return json(res, { error: 'path required' }, 400);
    const fp = safePath(p);
    if (!fp || !fs.existsSync(fp)) return json(res, { error: 'not found' }, 404);
    const content = fs.readFileSync(fp, 'utf8');
    return json(res, { path: p, content });
  }

  if (pathname === '/api/file' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req));
    const fp = safePath(body.path);
    if (!fp) return json(res, { error: 'invalid path' }, 400);
    saveHistory(fp);
    fs.writeFileSync(fp, body.content, 'utf8');
    return json(res, { ok: true, path: body.path });
  }

  if (pathname === '/api/history') {
    const p = parsed.query.path;
    if (!p) return json(res, { error: 'path required' }, 400);
    const fp = safePath(p);
    if (!fp) return json(res, { error: 'invalid path' }, 400);
    return json(res, getHistory(fp));
  }

  if (pathname === '/api/restore' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req));
    const fp = safePath(body.path);
    if (!fp) return json(res, { error: 'invalid path' }, 400);
    const histFile = body.historyFile;
    if (!histFile || !fs.existsSync(histFile)) return json(res, { error: 'history file not found' }, 404);
    saveHistory(fp); // save current before restore
    fs.copyFileSync(histFile, fp);
    return json(res, { ok: true });
  }

  // Static files
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const mime = getMime(filePath);
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mime });
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`\n  ⚡ Editor server running at http://localhost:${PORT}/editor.html\n`);
  console.log(`  Static files: ${ROOT}`);
  console.log(`  History: ${HISTORY_DIR}\n`);
});
