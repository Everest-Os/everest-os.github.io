/**
 * Extension Loader — Fetches, parses, and evaluates Cinnamon extensions
 * for everest os in the sandboxed browser runtime.
 *
 * Key challenges:
 * - CJS module system: `imports.moduleName` makes all top-level `var` and
 *   `function` declarations available as properties. `const`/`let` are NOT
 *   module-exported in CJS. We replicate this with eval-in-scope.
 * - Extensions use `global.log()`, DOM events need GObject method shims.
 * - Some extensions use `require()` (Node.js style) for sub-modules.
 */
import { createImportsTree } from '../runtime/imports.js';
import { registerSchema } from '../runtime/settings.js';
import { IconHelper } from '../runtime/iconHelper.js';
import { Sandbox } from '../runtime/sandbox.js';

// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/')
  ? import.meta.env.BASE_URL
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

export class ExtensionLoader {
  constructor(desktopManager, vfs) {
    this.desktop = desktopManager;
    this.vfs = vfs;
    this._loadedExtensions = new Map();
    this._explicitlyRemoved = new Set();
    this.CONFIG_PATH = '~/.config/extensions.json';
    this._styleSheet = null;

    window.addEventListener('resize', () => this._onWindowResize());
    window.addEventListener('sandbox-critical-failure', (e) => {
      this.unload(e.detail.uuid);
    });
  }

  _onWindowResize() {
    const desktop = document.querySelector('.desklet-layer');
    if (!desktop) return;

    const desklets = desktop.querySelectorAll('.sandbox-desklet');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    desklets.forEach(frame => {
      const rx = parseFloat(frame.dataset.rx);
      const ry = parseFloat(frame.dataset.ry);

      if (!isNaN(rx) && !isNaN(ry)) {
        frame.style.left = (rx * vw) + 'px';
        frame.style.top = (ry * vh) + 'px';
      }
    });
  }

  async init() {
    if (window.__extensionLoaderInitializing) return;
    window.__extensionLoaderInitializing = true;

    try {
      const savedStr = await this.vfs.readFile(this.CONFIG_PATH).catch(() => '[]');
      let userExtensions = [];
      try {
        const parsed = JSON.parse(savedStr);
        userExtensions = Array.isArray(parsed) ? parsed : (parsed.enabled || []);
        if (parsed.removed) parsed.removed.forEach(uuid => this._explicitlyRemoved.add(uuid));
      } catch (e) { }

      let configChanged = false;

      // Restore User Extensions
      for (let i = 0; i < userExtensions.length; i++) {
        const ext = userExtensions[i];
        if (ext) {
          try {
            if (this._explicitlyRemoved.has(ext.uuid)) continue;

            const instance = await this.loadFromVfs(ext.uuid, ext.vfsPath || `~/Plugins/${ext.type}/${ext.uuid}`, ext.type);

            // Self-heal: If the path used is different from the saved path, update config
            if (instance && instance._vfsPath && instance._vfsPath !== ext.vfsPath) {
              userExtensions[i].vfsPath = instance._vfsPath;
              configChanged = true;
            }
          } catch (e) {
            console.error(`Failed to restore extension ${ext.uuid}`, e);
          }
        }
      }

      if (configChanged) {
        const newConfig = {
          enabled: userExtensions,
          removed: Array.from(this._explicitlyRemoved)
        };
        await this.vfs.writeFile(this.CONFIG_PATH, JSON.stringify(newConfig, null, 2));
        console.log('✅ Extension paths updated in configuration (Self-Healed)');
      }

      // Auto-load Statusbar Applets (unless removed)
      try {
        const statusbarDir = '/system/plugins/applets/statusbar';
        const items = await this.vfs.readdir(statusbarDir).catch(() => []);
        for (const item of items) {
          const uuid = typeof item === 'string' ? item : item.name;
          if (!uuid || uuid === '.' || uuid === '..') continue;

          if (this._explicitlyRemoved.has(uuid)) continue;
          if (this._loadedExtensions.has(uuid)) continue;

          await this.loadFromVfs(uuid, `${statusbarDir}/${uuid}`, 'applets').catch(e => {
            console.error(`Failed to auto-load statusbar applet ${uuid}:`, e);
          });
        }
      } catch (e) { }

      // Auto-load System Desklets (unless removed)
      try {
        const systemDeskletsDir = '/system/plugins/desklets/system';
        const deskItems = await this.vfs.readdir(systemDeskletsDir).catch(() => []);
        for (const item of deskItems) {
          const uuid = typeof item === 'string' ? item : item.name;
          if (!uuid || uuid === '.' || uuid === '..') continue;

          if (this._explicitlyRemoved.has(uuid)) continue;
          if (this._loadedExtensions.has(uuid)) continue;

          await this.loadFromVfs(uuid, `${systemDeskletsDir}/${uuid}`, 'desklets').catch(e => {
            console.error(`Failed to auto-load system desklet ${uuid}:`, e);
          });
        }
      } catch (e) { }

      // Fallback for Essential Applets
      const defaults = ['menu@playground'];
      for (const uuid of defaults) {
        if (!this._loadedExtensions.has(uuid) && !this._explicitlyRemoved.has(uuid)) {
          await this.loadFromVfs(uuid, `/system/plugins/applets/${uuid}`, 'applets').catch(() => { });
        }
      }

      // Final Save (ensures defaults are persisted)
      await this._save();
    } catch (err) {
      console.error('ExtensionLoader init failed:', err);
    } finally {
      window.__extensionLoaderInitializing = false;
    }
  }

  async _save() {
    try {
      // Final list of enabled extensions
      const enabled = Array.from(this._loadedExtensions.values()).map(e => {
        let vfsPath = e.metadata.path || '';
        if (vfsPath.startsWith(this.vfs.HOME)) {
          vfsPath = '~' + vfsPath.substring(this.vfs.HOME.length);
        }
        return {
          type: e.type,
          uuid: e.metadata.uuid || e.uuid,
          vfsPath: vfsPath
        };
      });

      const removed = Array.from(this._explicitlyRemoved);
      await this.vfs.writeFile(this.CONFIG_PATH, JSON.stringify({ enabled, removed }, null, 2));
    } catch (e) {
      console.error("Failed to save extensions config", e);
    }
  }

  async loadFromServer(type, uuid) {
    const log = window.__everestConsole;
    log?.log(`Loading ${type}/${uuid} statically...`);

    try {
      const basePath = BASE_URL + `extensions/${type}/${uuid}`;

      const metaRes = await fetch(`${basePath}/metadata.json`);
      if (!metaRes.ok) throw new Error(`Missing metadata.json`);
      const metadata = await metaRes.json();

      const mainScript = type === 'desklets' ? 'desklet.js' : type === 'applets' ? 'applet.js' : 'extension.js';
      const jsRes = await fetch(`${basePath}/${mainScript}`);
      if (!jsRes.ok) throw new Error(`Missing ${mainScript}`);
      const mainJs = await jsRes.text();

      let settingsSchema = null;
      try {
        const schemaRes = await fetch(`${basePath}/settings-schema.json`);
        if (schemaRes.ok) settingsSchema = await schemaRes.json();
      } catch (e) { }

      const modules = {};

      // Try to load stylesheet.css
      try {
        const cssRes = await fetch(`${basePath}/stylesheet.css`);
        if (cssRes.ok) modules['stylesheet.css'] = await cssRes.text();
      } catch (e) { }

      // Try to load any other modules defined in metadata (or just common ones)
      const potentialModules = ['nepaliCalendar.js'];
      for (const mod of potentialModules) {
        try {
          const modRes = await fetch(`${basePath}/${mod}`);
          if (modRes.ok) modules[mod] = await modRes.text();
        } catch (e) { }
      }

      const files = { [mainScript]: mainJs, ...modules };

      return this._evaluate({
        metadata, type, uuid, files, settingsSchema, path: basePath
      });
    } catch (err) {
      log?.logError(`Failed to load ${uuid}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Load an extension from a VFS path
   */
  async loadFromVfs(uuid, vfsPath, type) {
    if (this._loadedExtensions.has(uuid)) return this._loadedExtensions.get(uuid);

    const initialPath = vfsPath || `~/Plugins/${type}/${uuid}`;
    let finalPath = initialPath;
    let metaStr = null;

    try {
      metaStr = await this.vfs.readFile(`${finalPath}/metadata.json`);
    } catch (e) {
      // Fallback: If primary path fails, try other standard paths
      const fallbacks = [
        `~/Plugins/${type}/${uuid}`,
        `~/.local/share/plugins/${type}/${uuid}`,
        `/system/plugins/${type}/${uuid}`
      ];

      let recovered = false;
      for (const fallback of fallbacks) {
        if (fallback === initialPath) continue;
        try {
          metaStr = await this.vfs.readFile(`${fallback}/metadata.json`);
          finalPath = fallback;
          console.log(`📡 Extension ${uuid} recovered from fallback path: ${finalPath}`);
          recovered = true;
          break;
        } catch (e2) { }
      }

      if (!recovered) {
        throw new Error(`File not found at ${initialPath} or standard fallback paths`);
      }
    }

    const log = window.__everestConsole;
    log?.log(`Loading ${uuid} from VFS...`);

    if (!this.vfs) throw new Error("VFS not available");

    // Load the main script
    try {
      const metadata = JSON.parse(metaStr);
      metadata.path = finalPath; // Ensure path resolution for system plugins

      const mainScript = type === 'desklets' ? 'desklet.js' : type === 'applets' ? 'applet.js' : 'extension.js';
      const mainJs = await this.vfs.readFile(`${finalPath}/${mainScript}`);

      let settingsSchema = null;
      try {
        const schemaPath = `${finalPath}/settings-schema.json`;
        const hasSchema = await this.vfs.exists(schemaPath);
        if (hasSchema) {
          const schemaStr = await this.vfs.readFile(schemaPath);
          settingsSchema = JSON.parse(schemaStr);
        }
      } catch (e) { }

      // In VFS, we can read all .js and .css files
      const modules = {};
      const dirContents = await this.vfs.readdir(finalPath);
      for (const item of dirContents) {
        if (item.type === 'file') {
          if (item.name.endsWith('.js') && item.name !== mainScript) {
            modules[item.name] = await this.vfs.readFile(item.path);
          } else if (item.name === 'stylesheet.css') {
            modules[item.name] = await this.vfs.readFile(item.path);
          }
        }
      }

      const files = { [mainScript]: mainJs, ...modules };

      const instance = await this._evaluate({
        metadata, type, uuid, files, settingsSchema, path: finalPath
      });

      if (instance) instance._vfsPath = finalPath;
      return instance;
    } catch (err) {
      log?.logError(`Failed to load VFS plugin ${uuid}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Evaluate a CJS-style module and capture all `var` and `function`
   * declarations as properties of the returned object.
   * This mimics how GJS/CJS imports work.
   */
  _evaluateModule(code, imports, globalObj, moduleName) {
    const log = window.__everestConsole;

    // Strategy: wrap in a function that returns an object with all declarations.
    // We use indirect eval and `var` hoisting: `var` declarations in a Function
    // body become local to that function. We explicitly list them out.
    //
    // Since we can't auto-detect all declarations reliably, we use a proxy-based
    // approach: run the code with `this` set to a capture object, and also
    // try to return known patterns.

    try {
      // Build a mock `require` for extensions that use it
      const moduleExports = {};
      const mockRequire = (path) => {
        // Strip leading ./ and .js
        const name = path.replace(/^\.\//, '').replace(/\.js$/, '');
        if (imports[name]) return imports[name];
        log?.log(`  ${IconHelper.getIcon('warning', { size: 14 })} require('${path}') → module not found, returning empty`);
        return {};
      };

      // Create a Function that:
      // Makes `imports`, `global`, common vars available
      // Runs the code
      // Captures all top-level `var` and `function` declarations by
      //    wrapping in eval and extracting from local scope
      const wrapper = new Function(
        'imports', 'global', 'require', 'module', 'exports',
        `
        var __exports = {};
        ${code}

        // Collect top-level var/function declarations as module exports
        try {
          ${this._buildExportCollector(code)}
        } catch(__e) {}

        // Also merge anything put on module.exports
        if (typeof module !== 'undefined' && module.exports) {
          Object.assign(__exports, module.exports);
        }

        return __exports;
        `
      );

      const moduleObj = { exports: moduleExports };

      const result = wrapper(
        imports, globalObj, mockRequire, moduleObj, moduleExports
      );

      return result;
    } catch (e) {
      log?.logError(`  ❌ Module ${moduleName} eval error: ${e.message}`);
      return {};
    }
  }

  /**
   * Parse the code for top-level `var` and `function` declarations
   * and generate code to assign them to __exports.
   */
  _buildExportCollector(code) {
    const lines = code.split('\n');
    const exports = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Match: var name = ..., var name;
      const varMatch = trimmed.match(/^var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=;]/);
      if (varMatch) {
        exports.push(varMatch[1]);
        continue;
      }

      // Match: function name(...)
      const funcMatch = trimmed.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (funcMatch) {
        exports.push(funcMatch[1]);
        continue;
      }

      // Match: const/let (won't be hoisted but try anyway for compat)
      const constMatch = trimmed.match(/^(?:const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
      if (constMatch) {
        exports.push(constMatch[1]);
        continue;
      }

      // Match: class Name
      const classMatch = trimmed.match(/^class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (classMatch) {
        exports.push(classMatch[1]);
      }
    }

    if (exports.length === 0) return '';

    return exports
      .map(name => `try { if (typeof ${name} !== 'undefined') __exports.${name} = ${name}; } catch(e){}`)
      .join('\n');
  }

  _evaluate(data) {
    const log = window.__everestConsole;
    const { uuid, type, metadata, files, settingsSchema, path: extPath } = data;
    const mainFile = type === 'applets' ? 'applet.js' : type === 'desklets' ? 'desklet.js' : 'extension.js';
    const sourceCode = files[mainFile];

    if (!sourceCode) {
      throw new Error(`No ${mainFile} found in ${uuid}`);
    }

    log?.log(`📦 Evaluating ${mainFile} for ${metadata?.name || uuid}`);

    // Create sandboxed imports
    const { tree: imports, globalObj, appletMeta, deskletMeta } = createImportsTree();

    // Add extension path and metadata to imports
    imports.searchPath.push(extPath || `/mock/${uuid}`);
    metadata.path = extPath || `/mock/${uuid}`;
    metadata.uuid = metadata.uuid || uuid;

    // Register metadata in manager registries BEFORE code evaluation
    // Extensions access this at load-time: imports.ui.appletManager.appletMeta[uuid]
    appletMeta[uuid] = metadata;
    deskletMeta[uuid] = metadata;

    // Pre-register settings schema so bind() resolves defaults during construction
    if (settingsSchema) {
      registerSchema(uuid, settingsSchema);
    }

    // Load additional JS modules BEFORE the main file (they might be imported)
    for (const [fileName, code] of Object.entries(files)) {
      if (fileName === mainFile) continue;

      if (fileName.endsWith('.js')) {
        const moduleName = fileName.replace('.js', '');
        try {
          const moduleResult = this._evaluateModule(code, imports, globalObj, moduleName);
          imports[moduleName] = moduleResult;
          log?.log(`  ${IconHelper.getIcon('file', { size: 14 })} Loaded module: ${moduleName} (${Object.keys(moduleResult).length} exports)`);
        } catch (e) {
          log?.logError(`  ❌ Failed to load module ${moduleName}: ${e.message}`);
        }
      } else if (fileName === 'stylesheet.css') {
        // Inject plugin's specific CSS into head
        let styleTag = document.getElementById(`style-${uuid}`);
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = `style-${uuid}`;
          document.head.appendChild(styleTag);
        }
        styleTag.textContent = code;
        log?.log(`  🎨 Injected stylesheet: ${fileName}`);
      }
    }

    // Evaluate the main extension file
    try {
      // Build a mock `require` that can find sibling modules
      const mockRequire = (path) => {
        const name = path.replace(/^\.\//, '').replace(/\.js$/, '');
        if (imports[name]) return imports[name];
        log?.logError(`  require('${path}') not found`);
        return {};
      };

      const wrappedCode = `
        ${sourceCode}

        // Return entry points
        var __result = {};
        try { global.log("🧪 Collecting entry points for ${metadata?.name || uuid}..."); } catch(e){}
        try { if (typeof main !== 'undefined') __result.main = main; else if (typeof this.main !== 'undefined') __result.main = this.main; } catch(e){}
        try { if (typeof init !== 'undefined') __result.init = init; else if (typeof this.init !== 'undefined') __result.init = this.init; } catch(e){}
        try { if (typeof enable !== 'undefined') __result.enable = enable; else if (typeof this.enable !== 'undefined') __result.enable = this.enable; } catch(e){}
        try { if (typeof disable !== 'undefined') __result.disable = disable; else if (typeof this.disable !== 'undefined') __result.disable = this.disable; } catch(e){}
        try { global.log("🧪 Discovery complete for ${metadata?.name || uuid}."); } catch(e){}
        return __result;
      `;

      // Only inject names that extension code does NOT redeclare.
      // Extensions do `const Applet = imports.ui.applet` etc., so those
      // names must NOT be function parameters (would cause "already declared").
      const sandbox = new Function(
        'imports', 'global', 'require', 'module', 'exports',
        wrappedCode
      );

      const moduleObj = { exports: {} };

      const result = sandbox(
        imports, globalObj,
        mockRequire, moduleObj, moduleObj.exports
      );

      log?.log(`✅ ${mainFile} evaluated successfully`);
      log?.log(`${IconHelper.getIcon('search', { size: 14 })} Discovery: type=${type}, exports=[${Object.keys(result).join(', ')}]`);

      // Instantiate based on type
      let instance = null;

      if (type === 'applets') {
        if (!result.main) {
          log?.logError(`❌ No main() function found in ${mainFile}. Make sure you have: function main(metadata, orientation, panel_height, instance_id) { ... }`);
          return { error: 'Missing main' };
        }
        try {
          log?.log(`🚀 Calling main() for ${uuid}...`);
          instance = Sandbox.run(uuid, 'main', result.main, metadata, 0, 40, `sandbox-${uuid}`);
          if (instance) {
            log?.log(`✅ main() returned an instance`);
            instance.metadata = metadata;
            if (settingsSchema && instance.settings) {
              instance.settings._loadSchema(settingsSchema);
            }
            this._renderApplet(instance, metadata);
            log?.log(`🎯 Applet "${metadata.name}" rendered to panel`);
          }
        } catch (err) {
          log?.logError(`❌ Applet instantiation error: ${err.message}`);
          log?.logError(`   Stack: ${err.stack}`);
        }
      } else if (type === 'desklets') {
        if (!result.main) {
          log?.logError(`❌ No main() function found in ${mainFile}. Make sure you have: function main(metadata, deskletId) { ... }`);
          return { error: 'Missing main' };
        }
        try {
          instance = Sandbox.run(uuid, 'main', result.main, metadata, `sandbox-${uuid}`);
          if (instance) {
            instance.metadata = metadata;
            if (settingsSchema && instance.settings) {
              instance.settings._loadSchema(settingsSchema);
            }
            this._renderDesklet(instance, metadata);
            log?.log(`🎯 Desklet "${metadata.name}" rendered to desktop`);
          }
        } catch (err) {
          log?.logError(`❌ Desklet instantiation error: ${err.message}`);
          log?.logError(`   Stack: ${err.stack}`);
        }
      } else if (type === 'extensions') {
        instance = { init: result.init, enable: result.enable, disable: result.disable, _enabled: false };
        try {
          if (result.init) {
            Sandbox.run(uuid, 'init', result.init, metadata);
            log?.log(`🔧 Extension "${metadata.name}" initialized`);
          }
          if (result.enable) {
            Sandbox.run(uuid, 'enable', result.enable);
            instance._enabled = true;
            log?.log(`✅ Extension "${metadata.name}" enabled`);
          }
        } catch (err) {
          log?.logError(`❌ Extension lifecycle error: ${err.message}`);
          log?.logError(`   Stack: ${err.stack}`);
        }
      }

      if (instance) {
        this._loadedExtensions.set(uuid, { instance, type, metadata, data, settingsSchema, uuid });
        if (!window.__extensionLoaderInitializing) this._save();
        // Notify the panel manager to register this as a "window"
        window.dispatchEvent(new CustomEvent('sandbox-extension-loaded', {
          detail: { uuid, type, metadata }
        }));
      }

      return { instance, type, metadata, uuid };
    } catch (err) {
      log?.logError(`❌ Runtime error in ${uuid}: ${err.message}`);
      log?.logError(`   Stack: ${err.stack}`);
      throw err;
    }
  }

  _renderApplet(applet, metadata) {
    const log = window.__everestConsole;
    log?.log("🎨 Rendering applet to DOM...");

    // Compatibility: Map actor to _element if needed
    if (applet.actor && !applet._element) {
      if (applet.actor._element) applet._element = applet.actor._element;
      else applet._element = applet.actor;
    }

    if (!this.desktop.panelManager || !applet._element) {
      log?.logError("❌ Cannot render applet: PanelManager or element missing");
      return;
    }

    applet._element.dataset.uuid = metadata.uuid;
    applet._element.classList.add('sandbox-applet');

    // Create Shadow DOM for CSS Isolation
    const shadowHost = document.createElement('div');
    shadowHost.classList.add('applet-shadow-host');
    shadowHost.dataset.uuid = metadata.uuid;
    const shadow = shadowHost.attachShadow({ mode: 'open' });

    // Inject design system tokens and basic applet styles
    const style = document.createElement('style');
    style.textContent = `
      :host { display: flex; align-items: center; height: 100%; }
      * { box-sizing: border-box; }
      .applet-box { display: flex; align-items: center; gap: 8px; padding: 0 8px; height: 100%; cursor: pointer; transition: background 0.2s; border-radius: 4px; }
      .applet-box:hover { background: rgba(255,255,255,0.1); }
      .applet-icon { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; }
      .applet-label { font-size: 13px; font-weight: 500; opacity: 0.9; }
    `;
    shadow.appendChild(style);

    // Also inject the plugin's specific CSS if it was loaded in head
    const pluginStyle = document.getElementById(`style-${metadata.uuid}`);
    if (pluginStyle) {
      const clone = pluginStyle.cloneNode(true);
      shadow.appendChild(clone);
    }

    shadow.appendChild(applet._element);

    // Replace the applet element with the shadow host for the panel manager
    const originalElement = applet._element;
    applet._element = shadowHost;

    // Determine zone (Menu on left, others on right)
    const zone = metadata.uuid.includes('menu') ? 'left' : 'right';
    this.desktop.panelManager.addApplet(applet, zone);
    log?.log(`🎯 Applet "${metadata.name || metadata.uuid}" rendered to ${zone} zone (Isolated)`);
  }

  async _renderDesklet(desklet, metadata) {
    const desktop = document.querySelector('.desklet-layer');
    if (!desktop) return;

    const frame = desklet._frame;
    const uuid = metadata.uuid || metadata.name;

    // Deduplicate: remove existing desklet if any
    const existing = desktop.querySelector(`.sandbox-desklet[data-uuid="${uuid}"]`);
    if (existing) existing.remove();

    frame.dataset.uuid = uuid;

    // Load saved position
    let rx, ry, savedW = null, savedH = null;
    try {
      const posStr = await this.vfs.readFile('~/.config/desklet-positions.json');
      const positions = JSON.parse(posStr);
      // Determine initial dimensions
      if (positions[uuid]) {
        if (positions[uuid].rx !== undefined) {
          rx = positions[uuid].rx;
          ry = positions[uuid].ry;
          savedW = positions[uuid].w;
          savedH = positions[uuid].h;
          if (positions[uuid].s) frame.dataset.scale = positions[uuid].s;
        } else {
          // Legacy pixel support
          const desktop = document.getElementById('everest-desktop');
          const dw = desktop?.clientWidth || window.innerWidth;
          const dh = desktop?.clientHeight || window.innerHeight;
          rx = (positions[uuid].x || 0) / dw;
          ry = (positions[uuid].y || 0) / dh;
        }
      }
    } catch { /* fresh */ }

    if (rx === undefined || ry === undefined) {
      rx = 0.1 + Math.random() * 0.4;
      ry = 0.1 + Math.random() * 0.4;
    }

    frame.dataset.rx = rx;
    frame.dataset.ry = ry;
    frame.classList.add('sandbox-desklet');
    frame.style.visibility = 'hidden'; // Prevent flash at 0,0

    // Create Shadow DOM for CSS Isolation
    const shadowHost = document.createElement('div');
    shadowHost.className = frame.className;
    shadowHost.dataset.uuid = uuid;
    shadowHost.style.cssText = frame.style.cssText;
    if (frame.dataset.scale) {
      shadowHost.dataset.scale = frame.dataset.scale;
    }
    if (savedW) shadowHost.style.width = savedW + 'px';
    if (savedH) shadowHost.style.height = savedH + 'px';
    shadowHost.dataset.rx = rx;
    shadowHost.dataset.ry = ry;

    const shadow = shadowHost.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host { position: absolute; display: flex !important; flex-direction: column; overflow: visible; box-sizing: border-box !important; }
      * { box-sizing: border-box; }
      .desklet-frame { flex: 1; display: block; position: relative !important; width: 100% !important; height: 100% !important; }
      .desklet-resize-handle { 
        position: absolute; 
        right: -12px; 
        bottom: -12px; 
        width: 24px; 
        height: 24px; 
        background: var(--accent); 
        border-radius: 50%; 
        cursor: nwse-resize; 
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      }
      .desklet-resize-handle::after {
        content: '↘';
        color: white;
        font-size: 14px;
      }
    `;
    shadow.appendChild(style);
    shadow.appendChild(document.createElement('slot')); // Allow dynamic elements like handles to show up

    // Inject plugin's specific CSS
    const pluginStyle = document.getElementById(`style-${uuid}`);
    if (pluginStyle) {
      const clone = pluginStyle.cloneNode(true);
      shadow.appendChild(clone);
    }

    frame.style.visibility = 'visible'; // Ensure content is visible inside shadow
    frame.style.width = '100%';
    frame.style.height = '100%';
    shadow.appendChild(frame);

    // Replace the frame with the shadow host
    desklet._frame = shadowHost;

    // Leverage the runtime restoration system to configure internal content proportions
    if (desklet._restoreSizeAndScale) {
      try { desklet._restoreSizeAndScale(); } catch (e) { }
    }

    const finalFrame = shadowHost;

    desktop.appendChild(finalFrame);

    // Calculate final position after it has been added to DOM (to get real width/height)
    const applyPosition = () => {
      const currentFrame = desklet._frame; // shadowHost
      const desktopWidth = desktop.clientWidth;
      const desktopHeight = desktop.clientHeight;

      // Prioritize pre-computed saved dimensions to guarantee instant accuracy with no layout lag
      const dw = savedW !== null ? savedW : (currentFrame.offsetWidth || 0);
      const dh = savedH !== null ? savedH : (currentFrame.offsetHeight || 0);

      const finalRx = parseFloat(currentFrame.dataset.rx);
      const finalRy = parseFloat(currentFrame.dataset.ry);

      currentFrame.style.left = (finalRx * (desktopWidth - dw)) + 'px';
      currentFrame.style.top = (finalRy * (desktopHeight - dh)) + 'px';
      currentFrame.style.visibility = 'visible';
    };

    // Apply immediately and after a short delay to account for dynamic rendering
    applyPosition();
    setTimeout(applyPosition, 50);
    setTimeout(applyPosition, 300);

    // Trigger UI nudges to stabilize sizing
    setTimeout(() => {
      try { desklet._relayout?.(); } catch (e) { }
      window.dispatchEvent(new Event('resize'));
    }, 500);

    // Save position on drag end
    const savePosition = async () => {
      const currentFrame = desklet._frame; // This is the shadowHost now
      const newX = parseInt(currentFrame.style.left, 10);
      const newY = parseInt(currentFrame.style.top, 10);
      if (isNaN(newX) || isNaN(newY)) return;

      // Use the exact same lexical 'desktop' container as applyPosition to eliminate pixel desyncs
      const desktopWidth = desktop.clientWidth;
      const desktopHeight = desktop.clientHeight;
      const deskletWidth = currentFrame.offsetWidth || 0;
      const deskletHeight = currentFrame.offsetHeight || 0;

      const newRx = newX / Math.max(1, desktopWidth - deskletWidth);
      const newRy = newY / Math.max(1, desktopHeight - deskletHeight);
      currentFrame.dataset.rx = newRx;
      currentFrame.dataset.ry = newRy;

      try {
        let positions = {};
        try {
          const posStr = await this.vfs.readFile('~/.config/desklet-positions.json');
          positions = JSON.parse(posStr);
        } catch { /* fresh */ }
        const deskletData = {
          rx: newRx,
          ry: newRy,
          w: currentFrame.offsetWidth,
          h: currentFrame.offsetHeight,
          s: currentFrame.dataset.scale || null
        };

        positions[uuid] = deskletData;
        await this.vfs.writeFile('~/.config/desklet-positions.json', JSON.stringify(positions, null, 2));
      } catch { /* ok */ }
    };
    desklet._savePosition = savePosition;

    try { desklet.on_desklet_added_to_desktop(); } catch (e) { /* ok */ }
  }

  unload(uuid) {
    const ext = this._loadedExtensions.get(uuid);
    if (!ext) return;

    const log = window.__everestConsole;

    if (ext.type === 'applets') {
      const el = document.querySelector(`.applet-shadow-host[data-uuid="${uuid}"]`);
      if (el) el.remove();
      try { ext.instance.on_applet_removed_from_panel?.(); } catch (e) { }
    } else if (ext.type === 'desklets') {
      const el = document.querySelector(`.sandbox-desklet[data-uuid="${uuid}"]`);
      if (el) el.remove();
      try { ext.instance.destroy?.(); } catch (e) { }
    } else if (ext.type === 'extensions' && ext.instance._enabled && ext.instance.disable) {
      try { ext.instance.disable(); } catch (e) { }
    }

    const styleTag = document.getElementById(`style-${uuid}`);
    if (styleTag) styleTag.remove();

    this._loadedExtensions.delete(uuid);
    this._save();
    log?.log(`${IconHelper.getIcon('trash', { size: 14 })} Unloaded: ${uuid}`);
    return true;
  }

  async reload(uuid) {
    const ext = this._loadedExtensions.get(uuid);
    if (!ext) return;
    const vfsPath = ext.instance._vfsPath || ext.data?.path;
    const type = ext.type;
    this.unload(uuid);
    return this.loadFromVfs(uuid, vfsPath, type);
  }

  getLoaded() {
    return new Map(this._loadedExtensions);
  }

  markAsRemoved(uuid) {
    const ext = this._loadedExtensions.get(uuid);
    if (!ext) return;

    const vfsPath = ext.metadata?.path || '';
    // Only track explicit removal of system components to prevent their auto-load routines
    if (vfsPath.startsWith('/system')) {
      this._explicitlyRemoved.add(uuid);
      this._save();
    }
  }

  unmarkAsRemoved(uuid) {
    this._explicitlyRemoved.delete(uuid);
    this._save();
  }

  async clearDeskletConfig(uuid) {
    try {
      const posStr = await this.vfs.readFile('~/.config/desklet-positions.json').catch(() => '{}');
      let positions = {};
      try {
        positions = JSON.parse(posStr) || {};
      } catch (e) {
        positions = {};
      }

      if (positions[uuid]) {
        delete positions[uuid];
        await this.vfs.writeFile('~/.config/desklet-positions.json', JSON.stringify(positions, null, 2));
        console.log(`🧹 Cleared persistence config for desklet: ${uuid}`);
      }
    } catch (err) {
      console.error(`Failed to clear configuration for removed desklet ${uuid}:`, err);
    }
  }

  async discover() {
    const discovered = [];
    const types = ['applets', 'desklets', 'extensions'];

    for (const type of types) {
      // System Plugins (Protected, VFS intercepted)
      try { await this._discoverPath(`/system/plugins/${type}`, type, 'system', discovered); } catch (e) { }

      // Legacy System Plugins (Just in case)
      try { await this._discoverPath(`~/Plugins/${type}`, type, 'system', discovered); } catch (e) { }

      // User Plugins (Deletable)
      try { await this._discoverPath(`~/.local/share/plugins/${type}`, type, 'user', discovered); } catch (e) { }
    }
    return discovered;
  }

  async _discoverPath(path, type, source, discovered) {
    const items = await this.vfs.readdir(path);
    for (const item of items) {
      if (item.type === 'dir') {
        if (item.name === 'statusbar' || item.name === 'system') {
          try {
            const subItems = await this.vfs.readdir(item.path);
            for (const subItem of subItems) {
              if (subItem.type === 'dir') {
                try {
                  const metaStr = await this.vfs.readFile(`${subItem.path}/metadata.json`);
                  const metadata = JSON.parse(metaStr);
                  let iconPath = null;
                  try {
                    const files = await this.vfs.readdir(subItem.path);
                    if (files.find(f => f.name === 'icon.svg')) iconPath = `${subItem.path}/icon.svg`;
                    else if (files.find(f => f.name === 'icon.png')) iconPath = `${subItem.path}/icon.png`;
                  } catch (e) { }

                  discovered.push({
                    uuid: subItem.name,
                    type: type,
                    metadata: metadata,
                    path: subItem.path,
                    isLoaded: this._loadedExtensions.has(subItem.name),
                    source,
                    iconPath
                  });
                } catch { /* skip */ }
              }
            }
          } catch { /* skip */ }
          continue;
        }

        try {
          const metaStr = await this.vfs.readFile(`${item.path}/metadata.json`);
          const metadata = JSON.parse(metaStr);
          let iconPath = null;
          try {
            const files = await this.vfs.readdir(item.path);
            if (files.find(f => f.name === 'icon.svg')) iconPath = `${item.path}/icon.svg`;
            else if (files.find(f => f.name === 'icon.png')) iconPath = `${item.path}/icon.png`;
          } catch (e) { }

          discovered.push({
            uuid: item.name,
            type: type,
            metadata: metadata,
            path: item.path,
            isLoaded: this._loadedExtensions.has(item.name),
            source,
            iconPath
          });
        } catch (e) { }
      }
    }
  }

  getSettingsForExtension(uuid) {
    const ext = this._loadedExtensions.get(uuid);
    if (!ext) return null;
    return {
      schema: ext.settingsSchema,
      instance: ext.instance?.settings || null,
    };
  }
}
