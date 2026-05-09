/**
 * Virtual File System (VFS)
 * Hybrid engine: uses Vite backend for dev, falls back to IndexedDB for persistence.
 */

// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/') 
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
    // Detect static hosting (GitHub Pages)
    this.staticMode = window.location.hostname.includes('github.io') || window.location.hostname.includes('github.com');
    console.log(`[VFS] Mode: ${this.staticMode ? 'Static (GitHub Pages)' : 'Full (Local API)'}`);
    this._initDB();
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

    // Check if the server FS API is available
    let serverAvailable = false;
    if (!this.staticMode) {
      try {
        const infoRes = await fetch(API_BASE + 'info');
        if (infoRes.ok) {
          const data = await infoRes.json();
          if (data && data.root) {
            serverAvailable = true;
          }
        }
      } catch { }
    }

    // If server FS is available, no need to seed — the server IS the filesystem
    if (serverAvailable) {
      this.serverAvailable = true;
      console.log('[VFS] Server FS available — skipping IndexedDB seed');
      this._emit('/');
      return;
    }

    // Server not available — check if IndexedDB already has data
    if (this.db) {
      const existingCount = await new Promise(r => {
        const req = this.db.transaction('files').objectStore('files').count();
        req.onsuccess = () => r(req.result);
        req.onerror = () => r(0);
      });

      if (existingCount > 100) {
        console.log(`[VFS] IndexedDB already has ${existingCount} items — skipping seed`);
        this._emit('/');
        return;
      }
    }

    // IndexedDB is empty — seed from vfs-seed.json
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const files = data.files || (Array.isArray(data) ? data : []);

        if (files.length > 0 && this.db) {
          console.log(`[VFS] Seeding IndexedDB with ${files.length} items from ${url}`);

          // Import directories first, then files
          const dirs = files.filter(f => f.type === 'dir');
          const regularFiles = files.filter(f => f.type === 'file');

          // Download binary files in parallel before saving to DB
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
                  // Silent skip for missing remote files (e.g. local-only paths)
                  file.content = '';
                }
              } catch (e) {
                console.warn(`[VFS] Failed to pre-fetch binary: ${file.path}`, e);
                file.content = ''; // Fallback
              }
            }
            downloaded++;
            if (downloaded % 10 === 0) console.log(`[VFS] Downloading assets: ${downloaded}/${totalFiles}`);
          }));

          const tx = this.db.transaction('files', 'readwrite');
          const store = tx.objectStore('files');

          for (const dir of dirs) {
            store.put({ path: dir.path, type: 'dir', name: dir.path.split('/').pop(), mtime: Date.now() });
          }
          for (const file of regularFiles) {
            store.put({
              path: file.path,
              type: 'file',
              name: file.path.split('/').pop(),
              content: file.content || '',
              size: file.size || (file.content instanceof Blob ? file.content.size : (file.content || '').length),
              mtime: Date.now()
            });
          }

          await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(new Error('Seed transaction failed'));
          });

          console.log(`[VFS] Seed complete: ${dirs.length} dirs, ${regularFiles.length} files`);
        }
      }
    } catch (e) {
      console.warn('[VFS] Seed failed:', e.message);
    }
    this._emit('/');
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

  async stat(path) {
    const p = this.resolvePath(path);
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
      size: content.length,
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
    // Ensure we don't have double slashes
    const base = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
    const cleanPath = p.startsWith('/') ? p.slice(1) : p;
    return base + 'fs/' + cleanPath;
  }

  async readFile(path) {
    const p = this.resolvePath(path);
    if (!this.staticMode) {
      try {
        const res = await fetch(`${API_BASE}read?path=${encodeURIComponent(p)}`);
        if (res.ok && !res.headers.get('content-type')?.includes('text/html')) {
          return await res.text();
        }
      } catch (e) { }
    }

    const item = await this._idbGet(p);
    if (item && item.type === 'file') {
      if (item.content instanceof Blob) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(item.content);
        });
      }
      return item.content;
    }
    throw new Error('File not found');
  }

  async readdir(path) {
    const p = this.resolvePath(path);
    if (!this.staticMode) {
      try {
        const res = await fetch(`${API_BASE}readdir?path=${encodeURIComponent(p)}`);
        if (res.ok) return await res.json();
      } catch (e) { }
    }

    const all = await this._idbGetAll();
    const targetPath = p.endsWith('/') ? p.slice(0, -1) : p;
    
    return all
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

  async rm(path) {
    const p = this.resolvePath(path);
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
}
