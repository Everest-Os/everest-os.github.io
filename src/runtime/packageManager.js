/**
 * Package Manager Runtime Utilities
 * Manages fetching online registry and performing installs.
 */
import { ZipHelper } from './zipHelper.js';

const REGISTRY_URL = 'https://raw.githubusercontent.com/Everest-Os/repo/main/registry.json';
const CACHE_PATH = '~/.cache/registry.json';

export class PackageManager {
  constructor(ctx) {
    this.vfs = ctx.vfs;
    this.appLoader = ctx.appLoader;
    this.loader = ctx.loader; // extensionLoader
    this.cachedRegistry = null;
  }

  async init() {
    // Pre-fetch registry so it's cached for fast start
    try {
      await this.update(true); // silent update
    } catch (e) { }
  }

  async update(silent = false) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        console.log('[PackageManager] Network is offline. Loading from cache.');
        if (!this.cachedRegistry) {
          try {
            const content = await this.vfs.readFile(CACHE_PATH);
            this.cachedRegistry = JSON.parse(content);
          } catch (e) { }
        }
        if (!silent) {
          throw new Error('Network is offline. Cannot reach remote repository.');
        }
        return this.cachedRegistry;
      }

      const res = await fetch(`${REGISTRY_URL}?t=${Date.now()}`);
      if (!res.ok) console.info(`HTTP ${res.status}`);

      const json = await res.json();
      this.cachedRegistry = json;

      try { await this.vfs.mkdir('~/.cache'); } catch (e) { }
      await this.vfs.writeFile(CACHE_PATH, JSON.stringify(json));

      return json;
    } catch (err) {
      if (!silent) throw err;
      // Failed silently, fallback to load from existing cache if possible
      if (!this.cachedRegistry) {
        try {
          const content = await this.vfs.readFile(CACHE_PATH);
          this.cachedRegistry = JSON.parse(content);
        } catch (e) { }
      }
    }
  }

  async getRegistry() {
    if (this.cachedRegistry) return this.cachedRegistry;

    try {
      const content = await this.vfs.readFile(CACHE_PATH);
      this.cachedRegistry = JSON.parse(content);
      return this.cachedRegistry;
    } catch (err) {
      // Not cached, do live fetch
      return await this.update();
    }
  }

  async installApp(appId) {
    const reg = await this.getRegistry();
    const item = reg.apps?.find(a => a.id === appId);
    if (!item) throw new Error(`Application "${appId}" not found in online registry.`);

    const downloadUrl = item.downloadUrl ||
      `https://raw.githubusercontent.com/Everest-Os/repo/main/apps/${appId}/bundle.zip`;

    return await this._performInstall(downloadUrl, `~/.local/share/applications/${appId}`, item.icon || appId, true);
  }

  async installPlugin(uuid, type) {
    const reg = await this.getRegistry();
    const item = reg.extensions?.find(e => e.uuid === uuid);

    // Support either registry type or explicit type
    const realType = type || item?.type || 'applets';
    if (!['applets', 'desklets', 'extensions'].includes(realType)) {
      throw new Error('Invalid plugin type.');
    }

    const downloadUrl = item?.downloadUrl ||
      `https://raw.githubusercontent.com/Everest-Os/repo/main/plugins/${realType}/${uuid}/bundle.zip`;

    return await this._performInstall(downloadUrl, `~/.local/share/plugins/${realType}/${uuid}`, uuid, false);
  }

  async _performInstall(url, targetDir, idForIcon, isApp) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('Installation requires an active internet connection. Device is currently offline.');
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch package bundle from ${url}`);

    const blob = await res.blob();

    // Create target directory
    await this.vfs.mkdir(targetDir);

    // Extract
    await ZipHelper.extractToVfs(blob, targetDir, this.vfs);

    // Cache icon if present inside zip
    try {
      const JSZip = await ZipHelper.getJSZip();
      const zip = await JSZip.loadAsync(blob);
      const iconExt = zip.files['icon.svg'] ? 'svg' : zip.files['icon.png'] ? 'png' : null;

      if (iconExt) {
        const iconBlob = await zip.file(`icon.${iconExt}`).async('blob');
        await this.vfs.mkdir('~/.local/share/icons');
        await this.vfs.writeFile(`~/.local/share/icons/${idForIcon}.${iconExt}`, iconBlob);
      }
    } catch (e) { }

    if (isApp && this.appLoader) {
      await this.appLoader.init(); // Refresh apps index
    }

    return true;
  }

  /**
   * Compares currently installed package versions against the cached registry.
   * Returns list of items that have updates available.
   */
  async checkForUpdates() {
    let reg;
    try {
      reg = await this.getRegistry();
    } catch (err) {
      console.info('Skipping update check: could not retrieve package registry.');
      return [];
    }
    if (!reg) return [];

    const updates = [];

    // 1. Check installed Apps
    const installedApps = this.appLoader?.getApps().filter(a => a.source !== 'builtin') || [];
    for (const app of installedApps) {
      const regApp = reg.apps?.find(a => a.id === app.id);
      if (regApp && this._compareVersions(app.version || '1.0.0', regApp.version) < 0) {
        updates.push({ name: app.name, id: app.id, type: 'app', current: app.version, latest: regApp.version });
      }
    }

    // 2. Check installed extensions
    const discoveredExts = this.loader ? await this.loader.discover() : [];
    const installedExts = discoveredExts.filter(e => e.source !== 'system');
    for (const ext of installedExts) {
      const regExt = reg.extensions?.find(r => r.uuid === ext.uuid);
      const currentVer = ext.metadata?.version || '1.0.0';
      if (regExt && this._compareVersions(currentVer, regExt.version) < 0) {
        updates.push({ name: ext.metadata?.name || ext.uuid, id: ext.uuid, type: 'plugin', current: currentVer, latest: regExt.version });
      }
    }

    return updates;
  }

  _compareVersions(v1, v2) {
    if (!v2) return 0;
    const a = String(v1).split('.').map(n => parseInt(n, 10) || 0);
    const b = String(v2).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const ai = a[i] || 0;
      const bi = b[i] || 0;
      if (ai > bi) return 1;
      if (ai < bi) return -1;
    }
    return 0;
  }
}
