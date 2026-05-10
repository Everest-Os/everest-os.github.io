/**
 * Virtual File System (VFS)
 * Hybrid engine: uses Vite backend for dev, falls back to IndexedDB for persistence.
 */

// Robust base URL detection for subfolder deployment
export const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/') 
  ? import.meta.env.BASE_URL 
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

const API_BASE = (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'api/fs/';

export class VirtualFileSystem {
  constructor() {
    this.HOME = '/home/user';
    this.listeners = [];
    this.db = null;
    this.useLocalStorage = false;
    this.serverAvailable = false;
    // Production builds are always static (no Vite middleware).
    // Dev mode starts as non-static; seed() will probe and confirm.
    this.staticMode = import.meta.env.PROD;
    console.log(`[VFS] Init: ${this.staticMode ? 'Static Mode (production build)' : 'Probing for server API...'}`);
    
    this.systemManifest = [];
    this._loadSystemManifest();
    
    this.dbReady = this._initDB();
  }

  async _loadSystemManifest() {
    try {
      const res = await fetch((BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'system-manifest.json');
      if (res.ok) {
        this.systemManifest = await res.json();
      }
    } catch (e) {
      console.warn('[VFS] Failed to load system manifest', e);
    }
  }

  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EverestOS_VFS', 5);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = (e) => {
        console.warn('VFS: IndexedDB failed, falling back to in-memory only');
        this.useLocalStorage = true;
        resolve();
      };
    });
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  _emit(path) {
    this.listeners.forEach(cb => cb(path));
  }

  async seed(url) {
    if (!url) { this._emit('/'); return; }

    // Wait for DB to be ready
    await this.dbReady;

    // Probe the server API only in dev mode (production is always static)
    if (!this.staticMode) {
      let serverAvailable = false;
      try {
        const infoRes = await fetch(API_BASE + 'info', { signal: AbortSignal.timeout(2000) });
        if (infoRes.ok) {
          const data = await infoRes.json();
          if (data && data.root) {
            serverAvailable = true;
          }
        }
      } catch { }

      if (serverAvailable) {
        this.serverAvailable = true;
        console.log('[VFS] Server FS available — skipping IndexedDB seed');
        this._emit('/');
        return;
      } else {
        // Dev server API not found — switch to static mode
        this.staticMode = true;
        console.log('[VFS] No server API detected — entering Static Mode (IndexedDB)');
      }
    } else {
      console.log('[VFS] Static Mode (production build) — seeding from IndexedDB');
    }

    // Check IndexedDB state and determine if seeding/merging is needed
    if (!this.db) { this._emit('/'); return; }

    // Read the stored seed metadata (version + manifest of known paths)
    const seedMeta = await new Promise(r => {
      const req = this.db.transaction('files').objectStore('files').get('__seed_version__');
      req.onsuccess = () => r(req.result || { version: 0, manifest: [] });
      req.onerror = () => r({ version: 0, manifest: [] });
    });
    const storedVersion = seedMeta.version || 0;

    let seedData;
    try {
      console.log(`[VFS] Fetching seed: ${url}`);
      const res = await fetch(url, { 
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate', 
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!res.ok) throw new Error('Fetch failed');
      seedData = await res.json();
    } catch (e) {
      console.warn('[VFS] Seed fetch failed:', e.message);
      this._emit('/');
      return;
    }

    const files = seedData.files || (Array.isArray(seedData) ? seedData : []);
    const seedVersion = seedData.seedVersion || 0;

    // Case 1: IndexedDB is empty — full seed
    const existingCount = await new Promise(r => {
      const req = this.db.transaction('files').objectStore('files').count();
      req.onsuccess = () => r(req.result);
      req.onerror = () => r(0);
    });

    if (existingCount <= 1) {
      // Fresh install — seed everything
      await this._seedAll(files, seedVersion, url);
      this._emit('/');
      return;
    }

    // Case 2: Seed version unchanged — user data is current, nothing to do
    if (seedVersion && storedVersion >= seedVersion) {
      console.log(`[VFS] Seed v${storedVersion} is current — skipping`);
      this._emit('/');
      return;
    }

    // Case 3: New seed version — merge only NEW files (don't overwrite user changes)
    if (seedVersion && seedVersion > storedVersion) {
      console.log(`[VFS] New seed detected (v${storedVersion} → v${seedVersion}) — merging new files...`);
      await this._mergeSeed(files, seedVersion, url);
      this._emit('/');
      return;
    }

    // Fallback: no version info, use old count-based check
    if (existingCount > 100) {
      console.log(`[VFS] IndexedDB has ${existingCount} items, no version info — skipping seed`);
    } else {
      await this._seedAll(files, seedVersion, url);
    }
    this._emit('/');
  }

  /**
   * Full seed — writes ALL files to IndexedDB (first-time install)
   */
  async _seedAll(files, seedVersion) {
    if (files.length === 0 || !this.db) return;
    console.log(`[VFS] Seeding IndexedDB with ${files.length} items...`);

    const dirs = files.filter(f => f.type === 'dir');
    const regularFiles = files.filter(f => f.type === 'file');

    // Download binaries
    await this._downloadBinaries(regularFiles);

    const tx = this.db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');

    for (const dir of dirs) {
      store.put({ path: dir.path, type: 'dir', name: dir.path.split('/').pop(), mtime: Date.now() });
    }
    for (const file of regularFiles) {
      store.put({
        path: file.path, type: 'file', name: file.path.split('/').pop(),
        content: file.content || '', size: file.size || (file.content instanceof Blob ? file.content.size : (file.content || '').length),
        mtime: file.mtime || Date.now()
      });
    }

    // Store seed version + manifest of all seed paths
    const manifest = files.map(f => f.path);
    store.put({ path: '__seed_version__', type: 'meta', version: seedVersion, manifest });

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(new Error('Seed transaction failed'));
    });
    console.log(`[VFS] Seed complete: ${dirs.length} dirs, ${regularFiles.length} files (v${seedVersion})`);
  }

  /**
   * Merge seed — only add GENUINELY NEW paths.
   * Uses the old seed manifest to distinguish:
   *   - New file: in new seed, NOT in old manifest → add it
   *   - User-deleted file: in new seed, WAS in old manifest, missing from IDB → skip it
   *   - User-modified file: exists in IDB → skip (never overwrite)
   */
  async _mergeSeed(files, seedVersion) {
    if (files.length === 0 || !this.db) return;

    // Read old manifest from stored metadata
    const oldMeta = await new Promise(r => {
      const req = this.db.transaction('files').objectStore('files').get('__seed_version__');
      req.onsuccess = () => r(req.result || { manifest: [] });
      req.onerror = () => r({ manifest: [] });
    });
    const oldManifest = new Set(oldMeta.manifest || []);

    // Get all existing paths in IndexedDB
    const existingPaths = new Set();
    const all = await this._idbGetAll();
    all.forEach(item => existingPaths.add(item.path));

    // Filter: only add files that are genuinely NEW (not in old manifest)
    // If a file was in the old manifest but is missing from IDB, the user deleted it → skip
    const newFiles = files.filter(f => {
      if (existingPaths.has(f.path)) return false;   // already exists → skip (preserve user version)
      if (oldManifest.has(f.path)) return false;      // was in old seed, user deleted it → respect deletion
      return true;                                    // genuinely new → add it
    });

    const skippedDeletions = files.filter(f => !existingPaths.has(f.path) && oldManifest.has(f.path)).length;
    if (newFiles.length === 0) {
      console.log(`[VFS] No new files to merge${skippedDeletions > 0 ? ` (${skippedDeletions} user-deleted files respected)` : ''} — updating version only`);
    } else {
      console.log(`[VFS] Merging ${newFiles.length} new files (${files.length - newFiles.length - newFiles.length} preserved, ${skippedDeletions} user deletions respected)`);
    }

    const newDirs = newFiles.filter(f => f.type === 'dir');
    const newRegularFiles = newFiles.filter(f => f.type === 'file');

    // Download binaries for new files only
    await this._downloadBinaries(newRegularFiles);

    const tx = this.db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');

    for (const dir of newDirs) {
      store.put({ path: dir.path, type: 'dir', name: dir.path.split('/').pop(), mtime: Date.now() });
    }
    for (const file of newRegularFiles) {
      store.put({
        path: file.path, type: 'file', name: file.path.split('/').pop(),
        content: file.content || '', size: file.size || (file.content instanceof Blob ? file.content.size : (file.content || '').length),
        mtime: file.mtime || Date.now()
      });
    }

    // Update seed version + full manifest
    const manifest = files.map(f => f.path);
    store.put({ path: '__seed_version__', type: 'meta', version: seedVersion, manifest });

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(new Error('Merge transaction failed'));
    });
    if (newFiles.length > 0) {
      console.log(`[VFS] Merge complete: ${newDirs.length} new dirs, ${newRegularFiles.length} new files`);
    }
  }

  /**
   * Download binary file contents in parallel
   */
  async _downloadBinaries(regularFiles) {
    const totalFiles = regularFiles.length;
    let downloaded = 0;
    await Promise.all(regularFiles.map(async (file) => {
      if (file.isBinary) {
        try {
          const fsPath = this.getFsPath(file.path);
          const res = await fetch(fsPath);
          if (res.ok) {
            file.content = await res.blob();
          } else {
            file.content = '';
          }
        } catch (e) {
          console.warn(`[VFS] Failed to pre-fetch binary: ${file.path}`, e);
          file.content = '';
        }
      }
      downloaded++;
      if (downloaded % 10 === 0) console.log(`[VFS] Downloading assets: ${downloaded}/${totalFiles}`);
    }));
  }

  async getInfo() {
    if (this.staticMode) return { root: 'browser-storage', persistent: true };
    try {
      const res = await fetch(API_BASE + 'info');
      if (res.ok) {
        const data = await res.json();
        if (data && data.root) return data;
      }
    } catch (e) { }
    return { root: 'browser-storage', persistent: true };
  }

  resolvePath(path) {
    if (!path) return '/';
    let resolved = path;
    if (resolved.startsWith('~')) {
      resolved = this.HOME + resolved.substring(1);
    }
    resolved = resolved.replace(/\/+/g, '/');
    if (resolved.length > 1 && resolved.endsWith('/')) {
      resolved = resolved.slice(0, -1);
    }
    return resolved;
  }

  _isSystemPath(path) {
    return path.startsWith('/system/') || path === '/system';
  }

  async stat(path) {
    const p = this.resolvePath(path);
    
    if (this._isSystemPath(p)) {
      const entry = this.systemManifest.find(e => e.path === p);
      return entry || null;
    }
    if (!this.staticMode) {
      try {
        const res = await fetch(`${API_BASE}stat?path=${encodeURIComponent(p)}`);
        if (res.ok) return await res.json();
      } catch (e) { }
    }

    // Fallback to IDB
    return await this._idbGet(p);
  }

  async exists(path) {
    try {
      const info = await this.stat(path);
      return !!info;
    } catch {
      return false;
    }
  }

  async mkdir(path) {
    const p = this.resolvePath(path);
    if (this._isSystemPath(p)) throw new Error('Read-only file system');
    if (!this.staticMode) {
      try {
        const res = await fetch(API_BASE + 'mkdir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: p })
        });
        if (res.ok) {
          await res.json();
          this._emit(p.substring(0, p.lastIndexOf('/')) || '/');
          return;
        }
      } catch (e) { }
    }

    await this._idbPut({ path: p, type: 'dir', name: p.split('/').pop(), mtime: Date.now() });
    this._emit(p.substring(0, p.lastIndexOf('/')) || '/');
  }

  async writeFile(path, content) {
    const p = this.resolvePath(path);
    if (this._isSystemPath(p)) throw new Error('Read-only file system');
    if (!this.staticMode) {
      try {
        const res = await fetch(API_BASE + 'write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: p, content })
        });
        if (res.ok) {
          await res.json();
          this._emit(p.substring(0, p.lastIndexOf('/')) || '/');
          return;
        }
      } catch (e) { }
    }

    await this._idbPut({
      path: p,
      type: 'file',
      name: p.split('/').pop(),
      content,
      size: content instanceof Blob ? content.size : (content.length || 0),
      mtime: Date.now()
    });
    this._emit(p.substring(0, p.lastIndexOf('/')) || '/');
  }

  /**
   * Centralized method to get the correct URL for a binary file (images, videos, etc.)
   * Handles subfolder deployment (e.g. GitHub Pages) automatically.
   */
  getFsPath(path) {
    const p = this.resolvePath(path);
    const base = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
    const cleanPath = p.startsWith('/') ? p.slice(1) : p;
    if (this._isSystemPath(p)) return base + cleanPath;
    return base + 'fs/' + cleanPath;
  }

  async readFile(path) {
    const p = this.resolvePath(path);
    
    if (this._isSystemPath(p)) {
      const entry = this.systemManifest.find(e => e.path === p);
      if (!entry || entry.type !== 'file') throw new Error('File not found in /system');
      const base = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
      const res = await fetch(base + p.slice(1));
      if (!res.ok) throw new Error('Failed to read system file');
      
      const contentType = res.headers.get('content-type') || '';
      // Only auto-convert to DataURL for strictly visual/audio media
      if (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('audio/')) {
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      return await res.text();
    }
    if (!this.staticMode) {
      try {
        const res = await fetch(`${API_BASE}read?path=${encodeURIComponent(p)}`);
        if (res.ok) {
          const ext = p.split('.').pop().toLowerCase();
          const isBinary = ['zip', 'odt', 'ods', 'odp', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp3', 'ogg', 'mp4', 'webm'].includes(ext);
          
          if (isBinary) {
            const blob = await res.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }
          return await res.text();
        }
      } catch (e) { }
    }

    const item = await this._idbGet(p);
    if (item && item.type === 'file') {
      if (item.content instanceof Blob) {
        const ext = p.split('.').pop().toLowerCase();
        const isMedia = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp3', 'ogg', 'mp4', 'webm'].includes(ext);
        const isBinaryDoc = ['zip', 'odt', 'ods', 'odp', 'pdf', 'tar', 'gz', '7z', 'rar'].includes(ext);

        if (isMedia) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(item.content);
          });
        } else if (isBinaryDoc) {
          // Return raw binary blob for archive/document parsers
          return item.content;
        } else {
          return await item.content.text();
        }
      }
      return item.content;
    }
    throw new Error('File not found');
  }

  async readdir(path) {
    const p = this.resolvePath(path);
    
    if (this._isSystemPath(p)) {
      const targetPath = p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p;
      return this.systemManifest
        .filter(f => {
          const parent = f.path.substring(0, f.path.lastIndexOf('/')) || '/';
          const cleanParent = parent.endsWith('/') && parent !== '/' ? parent.slice(0, -1) : parent;
          return cleanParent === (targetPath || '/') && f.path !== targetPath;
        })
        .map(f => ({
          name: f.name || f.path.split('/').pop(),
          path: f.path,
          type: f.type,
          size: f.size || 0,
          mtime: f.mtime || Date.now()
        })).sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
    }
    if (!this.staticMode) {
      try {
        const res = await fetch(`${API_BASE}readdir?path=${encodeURIComponent(p)}`);
        if (res.ok) return await res.json();
      } catch (e) { }
    }

    const all = await this._idbGetAll();
    const targetPath = p.endsWith('/') ? p.slice(0, -1) : p;
    
    let results = all
      .filter(f => {
        if (f.path.startsWith('__')) return false; // skip internal metadata
        const parent = f.path.substring(0, f.path.lastIndexOf('/')) || '/';
        const cleanParent = parent.endsWith('/') && parent !== '/' ? parent.slice(0, -1) : parent;
        return cleanParent === (targetPath || '/') && f.path !== targetPath;
      })
      .map(f => ({
        name: f.name || f.path.split('/').pop(),
        path: f.path,
        type: f.type,
        size: f.size || 0,
        mtime: f.mtime || Date.now()
      }));

    // Inject /system into root view
    if ((targetPath || '/') === '/') {
      if (!results.find(f => f.path === '/system')) {
        results.push({
          name: 'system',
          path: '/system',
          type: 'dir',
          size: 0,
          mtime: Date.now()
        });
      }
    }

    return results.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  async rm(path) {
    const p = this.resolvePath(path);
    if (this._isSystemPath(p)) throw new Error('Read-only file system');
    if (!this.staticMode) {
      try {
        const res = await fetch(API_BASE + 'rm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: p })
        });
        if (res.ok) {
          await res.json();
          this._emit(p.substring(0, p.lastIndexOf('/')) || '/');
          return;
        }
      } catch (e) { }
    }

    await this._idbDelete(p);
    this._emit(p.substring(0, p.lastIndexOf('/')) || '/');
  }

  async rename(oldPath, newPath) {
    const op = this.resolvePath(oldPath);
    const np = this.resolvePath(newPath);
    if (this._isSystemPath(op) || this._isSystemPath(np)) throw new Error('Read-only file system');
    if (!this.staticMode) {
      try {
        const res = await fetch(API_BASE + 'rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPath: op, newPath: np })
        });
        if (res.ok) {
          await res.json();
          this._emit(op.substring(0, op.lastIndexOf('/')) || '/');
          this._emit(np.substring(0, np.lastIndexOf('/')) || '/');
          return;
        }
      } catch (e) { }
    }

    // IDB Rename (Move)
    const item = await this._idbGet(op);
    if (item) {
      await this._idbDelete(op);
      item.path = np;
      item.name = np.split('/').pop();
      await this._idbPut(item);

      // If it's a directory, move children too (simplified for now)
      if (item.type === 'dir') {
        const all = await this._idbGetAll();
        for (const child of all) {
          if (child.path.startsWith(op + '/')) {
            const relative = child.path.substring(op.length);
            await this._idbDelete(child.path);
            child.path = np + relative;
            await this._idbPut(child);
          }
        }
      }
    }
    this._emit(op.substring(0, op.lastIndexOf('/')) || '/');
    this._emit(np.substring(0, np.lastIndexOf('/')) || '/');
  }

  async copy(src, dest) {
    const sp = this.resolvePath(src);
    const dp = this.resolvePath(dest);
    if (!this.staticMode) {
      try {
        const res = await fetch(API_BASE + 'copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ src: sp, dest: dp })
        });
        if (res.ok) {
          await res.json();
          this._emit(dp.substring(0, dp.lastIndexOf('/')) || '/');
          return;
        }
      } catch (e) { }
    }

    // IDB Copy
    const item = await this._idbGet(sp);
    if (item) {
      const newItem = JSON.parse(JSON.stringify(item));
      newItem.path = dp;
      newItem.name = dp.split('/').pop();
      await this._idbPut(newItem);

      if (item.type === 'dir') {
        const all = await this._idbGetAll();
        for (const child of all) {
          if (child.path.startsWith(sp + '/')) {
            const relative = child.path.substring(sp.length);
            const newChild = JSON.parse(JSON.stringify(child));
            newChild.path = dp + relative;
            await this._idbPut(newChild);
          }
        }
      }
    }
    this._emit(dp.substring(0, dp.lastIndexOf('/')) || '/');
  }

  // --- Trash System ---
  async trash(path) {
    const p = this.resolvePath(path);
    const trashDir = '~/.local/share/Trash/files';
    const infoDir = '~/.local/share/Trash/info';

    await this.mkdir(trashDir);
    await this.mkdir(infoDir);

    const id = Date.now().toString();
    const fileName = p.split('/').pop();
    const trashPath = `${trashDir}/${id}_${fileName}`;
    const infoPath = `${infoDir}/${id}_${fileName}.trashinfo`;

    const info = `[Trash Info]\nPath=${p}\nDeletionDate=${new Date().toISOString()}`;

    await this.writeFile(infoPath, info);
    await this.rename(p, trashPath);
  }

  async restore(trashPath) {
    const tp = this.resolvePath(trashPath);
    const fileName = tp.split('/').pop();
    const infoPath = `~/.local/share/Trash/info/${fileName}.trashinfo`;

    try {
      const info = await this.readFile(infoPath);
      const originalPathMatch = info.match(/Path=(.*)/);
      if (originalPathMatch) {
        const originalPath = originalPathMatch[1];
        await this.rename(tp, originalPath);
        await this.rm(infoPath);
      }
    } catch (e) {
      throw new Error('Could not restore file: Metadata missing');
    }
  }

  async emptyTrash() {
    const files = await this.readdir('~/.local/share/Trash/files');
    const infos = await this.readdir('~/.local/share/Trash/info');

    for (const f of files) await this.rm(f.path);
    for (const i of infos) await this.rm(i.path);
  }

  // --- IDB Helpers ---
  async _idbGet(path) {
    if (!this.db) return null;
    return new Promise(r => {
      const req = this.db.transaction('files').objectStore('files').get(path);
      req.onsuccess = () => r(req.result);
      req.onerror = () => r(null);
    });
  }

  async _idbPut(data) {
    if (!this.db) return;
    return new Promise(r => {
      const req = this.db.transaction('files', 'readwrite').objectStore('files').put(data);
      req.onsuccess = () => r();
    });
  }

  async _idbDelete(path) {
    if (!this.db) return;
    return new Promise(r => {
      const req = this.db.transaction('files', 'readwrite').objectStore('files').delete(path);
      req.onsuccess = () => r();
    });
  }

  async _idbGetAll() {
    if (!this.db) return [];
    return new Promise(r => {
      const req = this.db.transaction('files').objectStore('files').getAll();
      req.onsuccess = () => r(req.result);
      req.onerror = () => r([]);
    });
  }

  /**
   * Export all VFS files from IndexedDB
   */
  async exportAll() {
    return await this._idbGetAll();
  }

  /**
   * Import files into VFS (clears existing IndexedDB data)
   */
  async importAll(files) {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.clear();
      files.forEach(f => store.add(f));
      tx.oncomplete = () => {
        this._emit('/');
        resolve();
      };
      tx.onerror = () => reject(new Error('Failed to import files'));
    });
  }

  /**
   * Atomic import of a backup dataset across IDB or Server FS
   */
  async importBackup(backupData) {
    try {
      const res = await fetch(API_BASE + 'import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });
      if (res.ok) {
        await res.json();
        this._emit('/');
        return { restored: backupData.files.length, errors: 0 };
      }
    } catch (e) { }

    if (!this.db) throw new Error('No persistent storage available');

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      
      const dirs = backupData.files.filter(f => f.type === 'dir');
      const files = backupData.files.filter(f => f.type === 'file');

      for (const dir of dirs) {
        store.put({ path: dir.path, type: 'dir', name: dir.path.split('/').pop(), mtime: Date.now() });
      }
      for (const file of files) {
        store.put({
          path: file.path,
          type: 'file',
          name: file.path.split('/').pop(),
          content: file.isBinary ? '__BINARY_REF__' : (file.content || ''),
          size: file.size || (file.content || '').length,
          mtime: Date.now()
        });
      }

      tx.oncomplete = () => {
        this._emit('/');
        resolve({ restored: backupData.files.length, errors: 0 });
      };
      tx.onerror = () => reject(new Error('Import transaction failed'));
    });
  }
  /**
   * Complete system wipe: Closes DB, deletes it, and clears localStorage.
   * Returns a promise that resolves when done.
   */
  async wipe() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    // Clear everything from localStorage
    localStorage.clear();

    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('EverestOS_VFS');
      req.onsuccess = () => {
        console.log('[VFS] System wiped successfully');
        resolve();
      };
      req.onerror = () => reject(new Error('Failed to delete database'));
      req.onblocked = () => {
        console.warn('[VFS] Wipe blocked by other connections. Please close other tabs.');
        // We can't do much here except wait or alert
        alert('System reset is blocked by another open tab of EverestOS. Please close all other tabs and try again.');
        reject(new Error('Wipe blocked'));
      };
    });
  }
}
