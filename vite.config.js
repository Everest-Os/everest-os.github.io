import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Custom Vite Plugin to provide a Native Host Filesystem API
 * for the VirtualFileSystem frontend class.
 *
 * Works in both `vite dev` and `vite preview` modes.
 * For truly static deployments, a vfs-seed.json is generated at build time.
 */
function LocalFSMiddleware() {
  const FS_ROOT = path.resolve('fs');

  // Ensure root exists
  if (!fs.existsSync(FS_ROOT)) {
    fs.mkdirSync(FS_ROOT, { recursive: true });
  }

  const resolvePath = (reqPath) => {
    const safePath = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const cleanPath = safePath.startsWith('/') ? safePath.slice(1) : safePath;
    
    if (cleanPath.startsWith('system/')) {
      return path.join(path.resolve('public'), cleanPath);
    }
    
    return path.join(FS_ROOT, cleanPath);
  };

  /**
   * Shared middleware setup — used by both configureServer and configurePreviewServer
   */
  const setupMiddleware = (middlewares) => {
    // Body parser for JSON
    middlewares.use(async (req, res, next) => {
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          if (body) {
            try { req.body = JSON.parse(body); } catch (e) { req.body = {}; }
          } else {
            req.body = {};
          }
          next();
        });
      } else {
        next();
      }
    });

    // Serve static files directly from VFS
    middlewares.use('/fs', (req, res, next) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        let p = decodeURIComponent(url.pathname);
        if (p.startsWith('/fs')) p = p.slice(3);
        const fullPath = resolvePath(p);
        if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
          const stat = fs.statSync(fullPath);
          const ext = path.extname(fullPath).toLowerCase();
          const mimes = {
            '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.txt': 'text/plain',
            '.json': 'application/json', '.js': 'application/javascript', '.css': 'text/css',
            '.pdf': 'application/pdf', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webm': 'video/webm'
          };
          const contentType = mimes[ext] || 'application/octet-stream';

          // Handle Range requests for media streaming
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(fullPath, { start, end });
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
            });
            return file.pipe(res);
          } else {
            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Type': contentType,
            });
            return fs.createReadStream(fullPath).pipe(res);
          }
        }
      } catch (e) { }
      next();
    });

    // API Endpoints
    middlewares.use('/api/fs/info', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ root: FS_ROOT }));
    });

    middlewares.use('/api/fs/stat', (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const p = url.searchParams.get('path');
      if (!p) return res.statusCode = 400, res.end('Missing path');

      try {
        const fullPath = resolvePath(p);
        if (!fs.existsSync(fullPath)) {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(null));
        }
        const stat = fs.statSync(fullPath);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          type: stat.isDirectory() ? 'dir' : 'file',
          size: stat.size,
          ctime: stat.ctimeMs,
          mtime: stat.mtimeMs
        }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/readdir', (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const p = url.searchParams.get('path');
      if (!p) return res.statusCode = 400, res.end('Missing path');

      try {
        const fullPath = resolvePath(p);
        if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
          return res.statusCode = 404, res.end('Not found');
        }
        const items = fs.readdirSync(fullPath).map(name => {
          const itemPath = path.join(fullPath, name);
          const stat = fs.statSync(itemPath);
          return {
            name,
            path: p === '/' ? '/' + name : p + '/' + name,
            type: stat.isDirectory() ? 'dir' : 'file',
            size: stat.isDirectory() ? 0 : stat.size,
            ctime: stat.ctimeMs,
            mtime: stat.mtimeMs
          };
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(items));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/read', (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const p = url.searchParams.get('path');
      if (!p) return res.statusCode = 400, res.end('Missing path');

      try {
        const fullPath = resolvePath(p);
        if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
          return res.statusCode = 404, res.end('Not found');
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.end(content);
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/mkdir', (req, res) => {
      if (req.method !== 'POST') return res.statusCode = 405, res.end();
      try {
        const fullPath = resolvePath(req.body.path);
        fs.mkdirSync(fullPath, { recursive: true });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/write', (req, res) => {
      if (req.method !== 'POST') return res.statusCode = 405, res.end();
      try {
        const fullPath = resolvePath(req.body.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, req.body.content || '', 'utf8');
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/copy', (req, res) => {
      if (req.method !== 'POST') return res.statusCode = 405, res.end();
      try {
        const src = resolvePath(req.body.src);
        const dest = resolvePath(req.body.dest);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/rm', (req, res) => {
      if (req.method !== 'POST') return res.statusCode = 405, res.end();
      try {
        const fullPath = resolvePath(req.body.path);
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/rename', (req, res) => {
      if (req.method !== 'POST') return res.statusCode = 405, res.end();
      try {
        const oldPath = resolvePath(req.body.oldPath);
        const newPath = resolvePath(req.body.newPath);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });

    middlewares.use('/api/fs/import', (req, res) => {
      if (req.method !== 'POST') return res.statusCode = 405, res.end();
      try {
        const files = req.body.files || [];

        // Import dirs
        const dirs = files.filter(f => f.type === 'dir');
        for (const dir of dirs) {
          fs.mkdirSync(resolvePath(dir.path), { recursive: true });
        }

        // Import files
        const regularFiles = files.filter(f => f.type === 'file');
        for (const file of regularFiles) {
          const fullPath = resolvePath(file.path);
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          fs.writeFileSync(fullPath, file.content || '', 'utf8');
        }

        res.end(JSON.stringify({ success: true, count: files.length }));
      } catch (e) {
        res.statusCode = 500; res.end(e.message);
      }
    });
  };

  /**
   * Generate vfs-seed.json from the fs/ directory for static deployments.
   */
  const generateSeed = () => {
    const files = [];
    const walk = (dir, vfsPrefix) => {
      const items = fs.readdirSync(dir);
      for (const name of items) {
        const fullPath = path.join(dir, name);
        const vfsPath = vfsPrefix + '/' + name;
        const stat = fs.statSync(fullPath);

        // Ignore runtime artifacts (cache, trash)
        if (vfsPath.includes('/.cache/') || vfsPath.includes('/Trash/')) {
          if (!stat.isDirectory()) continue;
        }

        if (stat.isDirectory()) {
          files.push({ path: vfsPath, type: 'dir' });
          walk(fullPath, vfsPath);
        } else {
          try {
            const buffer = fs.readFileSync(fullPath);
            const ext = path.extname(fullPath).toLowerCase();
            const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.mp3', '.ogg', '.wav', '.mp4', '.webm', '.pdf', '.zip'];
            const isBinary = binaryExts.includes(ext) || buffer.includes(0);

            if (isBinary) {
              files.push({ path: vfsPath, type: 'file', isBinary: true, size: stat.size });
            } else {
              files.push({ path: vfsPath, type: 'file', content: buffer.toString('utf8'), size: buffer.length });
            }
          } catch {
            // Ignore unreadable files
          }
        }
      }
    };

    if (fs.existsSync(FS_ROOT)) {
      // The fs/ directory maps to / in VFS, but the structure is fs/home/user/... → /home/user/...
      walk(FS_ROOT, '');
    }

    // Fix paths: remove leading empty string from join
    for (const f of files) {
      if (f.path.startsWith('/')) f.path = f.path; // already good
      else f.path = '/' + f.path;
    }

    const seed = { version: '1.0', os: 'EverestOS', timestamp: new Date().toISOString(), fileCount: files.length, files };
    const outPath = path.resolve('public', 'vfs-seed.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(seed));
    console.log(`[VFS] Generated vfs-seed.json: ${files.length} files`);
  };

  /**
   * Copy fs/ directory into dist/fs/ after build for static file references.
   */
  const copyFsToDist = (distDir) => {
    const srcDir = FS_ROOT;
    const destDir = path.join(distDir, 'fs');
    if (fs.existsSync(srcDir)) {
      fs.cpSync(srcDir, destDir, { 
        recursive: true, 
        force: true,
        filter: (src) => {
          const rel = path.relative(srcDir, src);
          if (rel.includes('.cache') || rel.includes('Trash')) return false;
          return true;
        }
      });
      console.log(`[VFS] Copied fs/ → dist/fs/`);
    }
  };

  return {
    name: 'local-fs-middleware',

    // Dev server
    configureServer(server) {
      setupMiddleware(server.middlewares);
    },

    // Preview server (vite preview) — same FS API!
    configurePreviewServer(server) {
      setupMiddleware(server.middlewares);
    },

    // Generate seed JSON before build
    buildStart() {
      // generateSeed(); // Disabled: Using scripts/pack-vfs.js instead
    },

    // Copy fs/ to dist/ after build
    writeBundle(options) {
      const outDir = options.dir || path.resolve('dist');
      copyFsToDist(outDir);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [LocalFSMiddleware()],
  define: {
    __STORAGE_LIMIT_SERVER__: 2048 * 1024 * 1024,
    __STORAGE_LIMIT_LOCAL__: 100 * 1024 * 1024
  },
  server: {
    port: 5173,
    host: true
  },
});
