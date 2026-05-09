#!/usr/bin/env node

/**
 * EverestOS — Standalone Static Server
 * Serves the dist/ folder with full FS API support.
 * No Vite required at runtime.
 *
 * Usage: node scripts/serve.js [--port 4000]
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist');
const FS_ROOT = path.resolve(__dirname, '..', 'fs');

// Parse CLI args
const args = process.argv.slice(2);
const portIdx = args.indexOf('--port');
const PORT = portIdx !== -1 && args[portIdx + 1] ? parseInt(args[portIdx + 1], 10) : 4000;
const STATIC_MODE = args.includes('--static');

// Ensure directories exist
if (!fs.existsSync(ROOT)) {
  console.error('Error: dist/ not found. Run "bun run build" first.');
  process.exit(1);
}
if (!fs.existsSync(FS_ROOT)) {
  fs.mkdirSync(FS_ROOT, { recursive: true });
}

// MIME types
const MIMES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const resolveFsPath = (reqPath) => {
  const safePath = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const cleanPath = safePath.startsWith('/') ? safePath.slice(1) : safePath;
  return path.join(FS_ROOT, cleanPath);
};

const readBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try { resolve(JSON.parse(body)); } catch { resolve({}); }
  });
});

const json = (res, data, status = 200) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  // ── FS API (disabled in --static mode) ────────────────────
  if (!STATIC_MODE) {
  if (pathname === '/api/fs/info') {
    return json(res, { root: FS_ROOT });
  }

  if (pathname === '/api/fs/stat') {
    const p = url.searchParams.get('path');
    if (!p) return json(res, { error: 'Missing path' }, 400);
    try {
      const fullPath = resolveFsPath(p);
      if (!fs.existsSync(fullPath)) return json(res, null);
      const stat = fs.statSync(fullPath);
      return json(res, { type: stat.isDirectory() ? 'dir' : 'file', size: stat.size, ctime: stat.ctimeMs, mtime: stat.mtimeMs });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/readdir') {
    const p = url.searchParams.get('path');
    if (!p) return json(res, { error: 'Missing path' }, 400);
    try {
      const fullPath = resolveFsPath(p);
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return json(res, { error: 'Not a directory' }, 400);
      const items = fs.readdirSync(fullPath).map(name => {
        const itemPath = path.join(fullPath, name);
        const stat = fs.statSync(itemPath);
        return { name, path: p === '/' ? '/' + name : p + '/' + name, type: stat.isDirectory() ? 'dir' : 'file', size: stat.isDirectory() ? 0 : stat.size, ctime: stat.ctimeMs, mtime: stat.mtimeMs };
      });
      return json(res, items);
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/read') {
    const p = url.searchParams.get('path');
    if (!p) return json(res, { error: 'Missing path' }, 400);
    try {
      const fullPath = resolveFsPath(p);
      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return json(res, { error: 'File not found' }, 400);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end(fs.readFileSync(fullPath, 'utf8'));
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/mkdir' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      fs.mkdirSync(resolveFsPath(body.path), { recursive: true });
      return json(res, { success: true });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/write' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const fullPath = resolveFsPath(body.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, body.content || '', 'utf8');
      return json(res, { success: true });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/copy' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      fs.cpSync(resolveFsPath(body.src), resolveFsPath(body.dest), { recursive: true, force: true });
      return json(res, { success: true });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/rm' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const fullPath = resolveFsPath(body.path);
      if (fs.existsSync(fullPath)) fs.rmSync(fullPath, { recursive: true, force: true });
      return json(res, { success: true });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (pathname === '/api/fs/rename' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const oldP = resolveFsPath(body.oldPath);
      const newP = resolveFsPath(body.newPath);
      if (fs.existsSync(oldP)) fs.renameSync(oldP, newP);
      return json(res, { success: true });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Serve /fs/ static files ──────────────────────────────
  if (!STATIC_MODE && pathname.startsWith('/fs/')) {
    const fsPath = resolveFsPath(pathname.slice(3));
    if (fs.existsSync(fsPath) && !fs.statSync(fsPath).isDirectory()) {
      const ext = path.extname(fsPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
      return res.end(fs.readFileSync(fsPath));
    }
  }
  } // end !STATIC_MODE

  // ── Serve dist/ static files (SPA) ──────────────────────
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback
    filePath = path.join(ROOT, 'index.html');
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

const tryListen = (port) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n  \x1b[36m⛰  EverestOS Server\x1b[0m${STATIC_MODE ? ' \x1b[33m(Static Mode — no FS API)\x1b[0m' : ''}`);
    console.log(`  ➜  Local:   \x1b[1mhttp://localhost:${port}/\x1b[0m`);
    console.log(`  ➜  Network: \x1b[1mhttp://0.0.0.0:${port}/\x1b[0m`);
    if (!STATIC_MODE) console.log(`  ➜  FS Root: \x1b[2m${FS_ROOT}\x1b[0m`);
    console.log(`  ➜  Static:  \x1b[2m${ROOT}\x1b[0m`);
    if (STATIC_MODE) console.log(`  ➜  VFS:     \x1b[2mIndexedDB (seeded from vfs-seed.json)\x1b[0m`);
    console.log();
  });
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`  Port ${port} is in use, trying ${port + 1}...`);
      server.close();
      tryListen(port + 1);
    } else {
      throw e;
    }
  });
};

tryListen(PORT);
