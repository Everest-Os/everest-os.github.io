/**
 * App Loader — Discovers and launches modular applications.
 *
 * Built-in apps are discovered at build time via Vite's import.meta.glob.
 * User apps can be loaded from VFS ~/Apps/ at runtime.
 */

export class AppLoader {
  constructor(ctx) {
    // Shared context passed to every app's launch() function
    this._ctx = ctx;
    this._registry = new Map(); // id -> { manifest, loader }
    this._vfsApps = new Map();  // id -> { manifest, code }
  }

  /**
   * Discover built-in apps from src/apps/  (called once at startup)
   */
  async init() {
    this._registry.clear();
    // Vite glob import: eagerly load all app.json manifests
    const manifests = import.meta.glob('/src/apps/*/app.json', { eager: true });
    // Lazy import app.js modules
    const modules = import.meta.glob('/src/apps/*/app.js');

    for (const [jsonPath, manifestModule] of Object.entries(manifests)) {
      const manifest = manifestModule.default || manifestModule;
      const dir = jsonPath.replace('/app.json', '');
      const jsPath = dir + '/app.js';

      if (modules[jsPath]) {
        this._registry.set(manifest.id, {
          manifest,
          loader: modules[jsPath], // () => Promise<module>
          source: 'builtin'
        });
      }
    }

    // 1. System apps (Protected)
    try {
      await this._scanPath('~/Apps', 'system');
    } catch (e) {}

    // 2. User apps (Deletable)
    try {
      await this._scanPath('~/.local/share/applications', 'user');
    } catch (e) {}
  }

  async _scanPath(basePath, source) {
    const vfs = this._ctx.vfs;
    const dirs = await vfs.readdir(basePath);
    for (const dir of dirs) {
      if (dir.type !== 'dir') continue;
      try {
        const manifestStr = await vfs.readFile(`${dir.path}/app.json`);
        const manifest = JSON.parse(manifestStr);
        const id = manifest.id || dir.name;
        this._registry.set(id, {
          manifest: { ...manifest, id },
          vfsPath: dir.path,
          source
        });
      } catch (e) {}
    }
  }

  /**
   * Get all registered apps (both built-in and VFS)
   */
  getApps() {
    return Array.from(this._registry.values()).map(e => ({
      ...e.manifest,
      source: e.source
    }));
  }

  /**
   * Get apps filtered by category
   */
  getAppsByCategory(category) {
    return this.getApps().filter(a =>
      category === 'All Applications' || a.category === category
    );
  }

  /**
   * Get unique categories
   */
  getCategories() {
    const cats = new Set();
    for (const entry of this._registry.values()) {
      if (entry.manifest.category) cats.add(entry.manifest.category);
    }
    return ['All Applications', ...Array.from(cats).sort()];
  }

  /**
   * Launch an app by id
   */
  async launchApp(id, options = {}) {
    const entry = this._registry.get(id);
    if (!entry) {
      console.error(`App "${id}" not found in registry`);
      return;
    }

    if (entry.source === 'builtin') {
      // Dynamic import the module
      try {
        const mod = await entry.loader();
        if (mod.launch) {
          await mod.launch(this._ctx, options);
        } else {
          console.error(`App "${id}" has no launch() export`);
        }
      } catch (e) {
        console.error(`Failed to launch app "${id}":`, e);
        alert(`Failed to launch ${entry.manifest.name}: ${e.message}`);
      }
    } else if (entry.source === 'system' || entry.source === 'user') {
      // Load from VFS — read the app.js and eval it
      try {
        const code = await this._ctx.vfs.readFile(`${entry.vfsPath}/app.js`);
        // Create a blob URL and dynamically import it
        const blob = new Blob([code], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        try {
          const mod = await import(/* @vite-ignore */ url);
          if (mod.launch) {
            await mod.launch(this._ctx, options);
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.error(`Failed to launch VFS app "${id}":`, e);
        alert(`Failed to launch ${entry.manifest.name}: ${e.message}`);
      }
    }
  }

  /**
   * Load a custom app from a VFS folder (used by extension manager or folder picker)
   */
  async loadFromFolder(folderPath) {
    const vfs = this._ctx.vfs;
    try {
      const manifestStr = await vfs.readFile(`${folderPath}/app.json`);
      const manifest = JSON.parse(manifestStr);
      const id = manifest.id || folderPath.split('/').pop();
      manifest.id = id;

      this._registry.set(id, {
        manifest,
        vfsPath: folderPath,
        source: 'vfs'
      });

      // Launch it immediately
      await this.launchApp(id);
      return manifest;
    } catch (e) {
      throw new Error(`Invalid app folder: ${e.message}`);
    }
  }

  /**
   * Get the source path of an app
   */
  getAppPath(id) {
    const entry = this._registry.get(id);
    return entry ? entry.vfsPath : null;
  }
}
