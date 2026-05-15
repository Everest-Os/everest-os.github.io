/**
 * EverestOs — Main entry point
 * Orchestrates the desktop mock, extension loader, console, editor, and panel.
 */
import { ExtensionLoader } from './loader/extensionLoader.js';
import { AppLoader } from './loader/appLoader.js';
import { LookingGlass } from './console/lookingGlass.js';
import { CodeEditor } from './editor/codeEditor.js';
import { PanelManager } from './runtime/panelManager.js';
import { WindowManager } from './runtime/windowManager.js';
import { AppMenu } from './runtime/appMenu.js';
import { DesktopSettings } from './runtime/desktopSettings.js';
import { VirtualFileSystem, BASE_URL } from './runtime/vfs.js';
import { DesktopIcons } from './runtime/desktopIcons.js';
import { FilePickerApp } from './runtime/filePickerApp.js';
import { ThemeManager } from './runtime/themeManager.js';
import { BootLoader } from './loader/bootLoader.js';

import { IconHelper } from './runtime/iconHelper.js';

import { showContextMenu } from './runtime/contextMenu.js';
import { showSystemDialog } from './runtime/dialog.js';
import { ZipHelper } from './runtime/zipHelper.js';
import { showNotification } from './runtime/notification.js';
import { VolumeManager } from './runtime/volumeManager.js';
import { Sandbox } from './runtime/sandbox.js';
import { PackageManager } from './runtime/packageManager.js';

window.osAPI = {
  IconHelper,
  showContextMenu,
  showSystemDialog,
  ZipHelper,
  showNotification,
  VolumeManager: new VolumeManager(),
  Sandbox,
  PackageManager: null // initialized in main
};

// Make IconHelper globally available for applets that don't use window.osAPI
window.IconHelper = IconHelper;

class EverestSandbox {
  constructor() {
    this.loader = null;
    this.console = null;
    this.editor = null;
    this.panelManager = null;
    this.windowManager = null;
    this.appMenu = null;
    this.desktopSettings = null;
    this.desktopIcons = null;
    this.appLoader = null;
    this.vfs = null;
    this.themeManager = null;
    this.packageManager = null;
  }

  async init() {
    const bootloader = new BootLoader();
    await bootloader.updateStatus('starting kernel', 5);
    await bootloader.updateStatus('getting ready assets', 12);

    // Initialize Looking Glass first (so logs are captured)
    this.console = new LookingGlass(document.getElementById('looking-glass'));
    const logo = `    WELCOME TO EVEREST OS    
        --------------        
     --------------------     
   ------------------------   
  --------------------------  
 ---------------------------- 
--------------...-------------
------------...#..--..----.---
----.------...###+..+##...-+--
--..+#.-...+#################.
..#####..####################+
.############################.
 -##########################- 
  -########################-  
   -+####################+.   
     .-################-.     
        .-+++####+++--        `;
    console.log("%c" + logo, "color: #06b6d4; font-weight: bold; line-height: 1.2; font-family: monospace;");
    this.console.log(logo);
    this.console.log('🏔️  Welcome to Everest OS v1.0.0');
    this.console.log('🫛  Starting system services...');

    // Global Error Catcher (pipes errors to System Monitor/Console)
    window.addEventListener('error', (e) => {
      this.console.logError(`[Global Error] ${e.message} at ${e.filename}:${e.lineno}`);
    });
    window.addEventListener('unhandledrejection', (e) => {
      this.console.logError(`[Unhandled Rejection] ${e.reason?.message || e.reason}`);
    });

    await bootloader.updateStatus('scanning hardware', 18);
    await bootloader.updateStatus('configuring filesystem', 25);
    // Initialize VFS and Seed default extensions
    this.vfs = new VirtualFileSystem();

    const seedUrl = (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'vfs-seed.json?v=' + Date.now();
    await this.vfs.seed(seedUrl);
    await this.ensureSystemPaths();

    await bootloader.updateStatus('verifying system integrity', 32);

    if (this.vfs.serverAvailable) {
      await bootloader.updateStatus('server side writable found', 40);
      await bootloader.updateStatus('configuring vfs for server writable api', 48);
    } else if (this.vfs.db) {
      await bootloader.updateStatus('no writable filesystem found', 40);
      await bootloader.updateStatus('configuring vfs for indexdb', 48);
    } else {
      await bootloader.updateStatus('no writable filesystem found', 40);
      await bootloader.updateStatus('configuring vfs for in memory filesystem', 48);
    }

    await bootloader.updateStatus('initialising plugins', 60);
    //  Initialize Theme Manager
    this.themeManager = new ThemeManager(this.vfs);
    await this.themeManager.init();

    // Expose core system APIs globally for extension and plugin sandboxes
    window.osAPI.vfs = this.vfs;
    window.osAPI.themeManager = this.themeManager;

    // Initialize Panel Manager
    this.panelManager = new PanelManager(this.vfs);
    await this.panelManager.init();

    // Initialize Window Manager
    const desktopArea = document.getElementById('everest-desktop');
    this.windowManager = new WindowManager(desktopArea, this.panelManager);
    window.osAPI.windowManager = this.windowManager;

    // Initialize Extension Loader
    this.loader = new ExtensionLoader(this, this.vfs);
    await this.loader.init();

    // Initialize Code Editor
    this.editor = new CodeEditor(document.getElementById('code-editor'), this.loader);

    // Initialize File Picker
    this.filePicker = new FilePickerApp(this.windowManager, this.vfs);

    // Initialize Desktop Settings (system component — stays in runtime)
    this.desktopSettings = new DesktopSettings(desktopArea, this.vfs, this.filePicker, this.loader, this.panelManager);
    this.desktopSettings.init();

    await bootloader.updateStatus('configuring desktop environment', 75);

    // Initialize App Loader — discovers built-in + VFS apps
    this.appLoader = new AppLoader({
      windowManager: this.windowManager,
      vfs: this.vfs,
      loader: this.loader,
      filePicker: this.filePicker,
      panelManager: this.panelManager,
      console: this.console,
      desktopSettings: this.desktopSettings,
      themeManager: this.themeManager,
      Sandbox: Sandbox,
      appLoader: null, // will be set below
    });
    // Self-reference so apps can launch other apps via ctx.appLoader
    this.appLoader._ctx.appLoader = this.appLoader;
    await this.appLoader.init();

    // Initialize Package Manager
    this.packageManager = new PackageManager({
      vfs: this.vfs,
      appLoader: this.appLoader,
      loader: this.loader
    });
    window.osAPI.PackageManager = this.packageManager;

    // Background pre-fetch & update check
    this.packageManager.init().then(() => {
      this._checkSystemUpdates();
    });

    this.console.log(`📦 Discovered ${this.appLoader.getApps().length} apps`);

    document.addEventListener('launch-app', (e) => {
      this.appLoader.launchApp(e.detail.id, e.detail);
    });

    document.addEventListener('toggle-looking-glass', () => {
      this.console.toggle();
    });

    window.addEventListener('contextmenu', (e) => {
      // Allow browser context menu only on inputs and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      e.preventDefault();
    });

    // Initialize App Menu (uses AppLoader for dynamic discovery)
    this.appMenu = new AppMenu(this.panelManager, this.windowManager, this.loader, this.vfs, this.appLoader, this.filePicker);
    this.appMenu.init();

    // Initialize Desktop Icons (uses AppLoader to open files/folders)
    this.desktopIcons = new DesktopIcons(desktopArea, this.vfs, this.appLoader, this.loader);
    this.desktopIcons.init();

    // Launch Startup Apps
    this.vfs.readFile('~/.config/startup.json').then(startupStr => {
      if (startupStr) {
        const startupIds = JSON.parse(startupStr);
        startupIds.forEach(id => {
          this.appLoader.launchApp(id);
        });
      }
    }).catch(() => { });

    // Restore Display Settings
    await bootloader.updateStatus('loading config', 85);
    this.vfs.readFile('~/.config/display.json').then(savedStr => {
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (saved.scaling) {
          const scale = parseInt(saved.scaling) / 100;
          document.documentElement.style.setProperty('--system-scale', scale);
        }
        if (saved.nightLight) {
          document.body.classList.add('night-light');
        }
      }
    }).catch(() => { });

    await bootloader.finish();

    // Setup panel clock
    this._startClock();

    // Setup Fullscreen
    this._setupFullscreen();

    // Bind settings dialog & extension events
    this._bindSettingsDialog();

    // Bind keyboard shortcuts
    this._bindKeyboard();

    // Done
    const fsInfo = await this.vfs.getInfo();
    const pluginsPath = `${fsInfo.root}/home/user/Plugins`;

    this.console.log('✅ Sandbox ready. Right-click desktop or panel to add extensions.');
    this.console.log(`📍 Extension path: ~/Plugins (mapped to ${pluginsPath})`);
    this.console.log(`${IconHelper.getIcon('computer,🖥️', { size: 14 })} Viewport: ${window.innerWidth}×${window.innerHeight}`);
    this.console.log(`📐 Panel Location: ${this.panelManager.position}`);
    this.console.log(`💡 Night Light: ${document.body.classList.contains('night-light') ? 'ON' : 'OFF'}`);
    this.console.log(`💡 Right-click panel for settings. Ctrl+/ or Ctrl+? for Looking Glass.`);
  }

  async _checkSystemUpdates() {
    setTimeout(async () => {
      try {
        const updates = await this.packageManager.checkForUpdates();
        if (updates.length > 0) {
          showNotification({
            title: 'System Updates Available',
            message: `${updates.length} package${updates.length > 1 ? 's have' : ' has'} updates available.`,
            icon: 'software-update-available,📥',
            duration: 8000,
            actionText: 'View in App Center',
            action: () => {
              this.appLoader.launchApp('app-center');
            }
          });
        }
      } catch (e) { }
    }, 3000); // Run shortly after boot completion
  }

  async ensureSystemPaths() {
    // Ensure Directories
    const dirs = [
      '~/.config',
      '~/.cache',
      '~/.local/share/applications',
      '~/.local/share/plugins/applets',
      '~/.local/share/plugins/desklets',
      '~/.local/share/plugins/extensions',
      '~/Desktop',
      '~/Documents',
      '~/Downloads',
      '~/Pictures',
      '~/Music',
      '~/Videos'
    ];
    for (const d of dirs) {
      try { await this.vfs.mkdir(d); } catch (e) { }
    }

    // Ensure Files
    const configs = [
      { path: '~/.config/startup.json', default: '[]' },
      { path: '~/.config/display.json', default: '{}' },
      { path: '~/.config/menu.json', default: '{}' },
      { path: '~/.config/desktop.json', default: '{}' }
    ];
    for (const cfg of configs) {
      try {
        const exists = await this.vfs.stat(cfg.path);
        if (!exists) await this.vfs.writeFile(cfg.path, cfg.default);
      } catch {
        await this.vfs.writeFile(cfg.path, cfg.default);
      }
    }

    // Ensure System Paths and Restore Legacy Folders
    const systemDirs = [
      '~/Apps',
      '~/Plugins/applets',
      '~/Plugins/desklets',
      '~/Plugins/extensions'
    ];
    for (const d of systemDirs) {
      try { await this.vfs.mkdir(d); } catch (e) { }
    }

    // Reverse Migration Recovery Procedure
    const restores = [
      { from: '~/.local/share/applications', to: '~/Apps' },
      { from: '~/.local/share/plugins/applets', to: '~/Plugins/applets' },
      { from: '~/.local/share/plugins/desklets', to: '~/Plugins/desklets' },
      { from: '~/.local/share/plugins/extensions', to: '~/Plugins/extensions' }
    ];
    for (const r of restores) {
      try {
        const items = await this.vfs.readdir(r.from);
        for (const item of items) {
          if (item.type === 'dir') {
            try {
              await this.vfs.copy(item.path, `${r.to}/${item.name}`);
              await this.vfs.rm(item.path);
            } catch (e) { }
          }
        }
      } catch (e) { }
    }
  }

  _setupFullscreen() {
    const fsBtn = document.getElementById('fullscreen-btn');
    if (!fsBtn) return;

    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Update icon based on state
    document.addEventListener('fullscreenchange', () => {
      const icon = fsBtn.querySelector('.fs-icon');
      if (document.fullscreenElement) {
        icon.textContent = '⛶'; // Or a "collapse" icon
        fsBtn.title = 'Exit Fullscreen';
      } else {
        icon.textContent = '⛶';
        fsBtn.title = 'Enter Fullscreen';
      }
    });
  }

  _startClock() {
    const clockEl = document.getElementById('panel-clock');
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      if (clockEl) clockEl.textContent = `${time}  ${date}`;
    };
    update();
    setInterval(update, 10000);
  }

  _bindSettingsDialog() {
    // Listen for spawned programs (Python, etc.) to register in window list
    window.addEventListener('sandbox-program-opened', (e) => {
      const { id, title, icon, onClose } = e.detail;
      this.panelManager.addWindow({ id, title, icon, onClose, _active: true });
    });
    window.addEventListener('sandbox-program-closed', (e) => {
      this.panelManager.removeWindow(e.detail.id);
    });

    const dialog = document.querySelector('.settings-dialog');
    const dragHeader = document.querySelector('.settings-header');
    if (dialog && dragHeader) {
      dialog.style.position = 'absolute';
      dragHeader.style.cursor = 'move';
      dragHeader.style.userSelect = 'none';

      let isDragging = false, startX, startY, initialLeft, initialTop;
      const onPointerDown = (e) => {
        if (e.target.closest('button, input, select, a')) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        dialog.style.left = initialLeft + 'px';
        dialog.style.top = initialTop + 'px';

        dragHeader.setPointerCapture(e.pointerId);
        e.preventDefault();
      };

      dragHeader.addEventListener('pointerdown', onPointerDown);
      dragHeader.style.touchAction = 'none';

      dragHeader.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Bounds checking
        const rect = dialog.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));

        dialog.style.left = newLeft + 'px';
        dialog.style.top = newTop + 'px';
      });

      const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        dragHeader.releasePointerCapture(e.pointerId);
      };

      dragHeader.addEventListener('pointerup', onPointerUp);
      dragHeader.addEventListener('pointercancel', onPointerUp);
    }

    // Listen for open-extension-settings event from extension manager
    window.addEventListener('open-extension-settings', (e) => {
      const { uuid } = e.detail;
      const settingsData = this.loader.getSettingsForExtension(uuid);
      if (settingsData?.schema) {
        this._showSettingsDialog(uuid, settingsData.schema, settingsData.instance);
      } else {
        this.console.log(`${IconHelper.getIcon('warning,⚠️', { size: 14 })} No settings schema found for ${uuid}`);
      }
    });

    // Listen for open-extension-manager from desktop/panel context menus
    document.addEventListener('open-extension-manager', (e) => {
      if (this.appLoader) {
        this.appLoader.launchApp('extension-manager', { type: e.detail.type });
      }
    });

    // Listen for open-desklet-settings from desklet context menu
    window.addEventListener('open-desklet-settings', (e) => {
      const { uuid } = e.detail;
      const settingsData = this.loader.getSettingsForExtension(uuid);
      if (settingsData?.schema) {
        this._showSettingsDialog(uuid, settingsData.schema, settingsData.instance);
      } else {
        this.console.log(`${IconHelper.getIcon('warning,⚠️', { size: 14 })} No settings schema found for ${uuid}`);
      }
    });

    // Listen for open-applet-settings from applet context menu
    window.addEventListener('open-applet-settings', (e) => {
      const { uuid } = e.detail;

      if (uuid === 'menu@playground') {
        document.dispatchEvent(new CustomEvent('launch-app', {
          detail: { id: 'system-settings', args: ['menu'] }
        }));
        return;
      }

      const settingsData = this.loader.getSettingsForExtension(uuid);
      if (settingsData?.schema) {
        this._showSettingsDialog(uuid, settingsData.schema, settingsData.instance);
      } else {
        this.console.log(`${IconHelper.getIcon('warning,⚠️', { size: 14 })} No settings schema found for ${uuid}`);
      }
    });

    // Listen for reload-extension from context menu
    window.addEventListener('reload-extension', async (e) => {
      const { uuid } = e.detail;
      this.console.log(`${IconHelper.getIcon('refresh,🔄', { size: 14 })} Reloading ${uuid}...`);
      try {
        await this.loader.reload(uuid);
        this.console.log(`✅ Reloaded ${uuid}`);
      } catch (err) {
        this.console.logError(`❌ Reload failed: ${err.message}`);
      }
    });

    // Listen for desklet-removed
    window.addEventListener('desklet-removed', (e) => {
      const { uuid } = e.detail;
      this.loader.clearDeskletConfig(uuid); // Purge desklet layout memory
      this.loader.markAsRemoved(uuid);      // Conditionally mark system desklets as removed
      this.loader.unload(uuid);
      this.panelManager.unregisterExtensionWindow(uuid);
      this.console.log(`${IconHelper.getIcon('trash,🗑️', { size: 14 })} Desklet removed: ${uuid}`);
      const card = document.querySelector(`.extension-card[data-uuid="${uuid}"]`);
      if (card) card.classList.remove('extension-loaded');
    });

    // Listen for applet-removed
    window.addEventListener('applet-removed', (e) => {
      const { uuid } = e.detail;
      this.loader.markAsRemoved(uuid); // Persistently mark as removed
      this.loader.unload(uuid);
      this.panelManager.unregisterExtensionWindow(uuid);
      this.console.log(`${IconHelper.getIcon('trash,🗑️', { size: 14 })} Applet removed: ${uuid}`);
      const card = document.querySelector(`.extension-card[data-uuid="${uuid}"]`);
      if (card) card.classList.remove('extension-loaded');
    });

    // Listen for open-extension-about to show about window
    window.addEventListener('open-extension-about', (e) => {
      const { uuid } = e.detail;
      const ext = this.loader.getLoaded().get(uuid);
      if (!ext || !ext.metadata) return;

      const meta = ext.metadata;

      const content = document.createElement('div');
      content.style.padding = '20px';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.gap = '14px';
      content.style.color = 'var(--text-primary)';
      content.style.fontSize = '13px';

      content.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 42px; background: var(--bg-surface-hover); border-radius: 8px; padding: 10px; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 1px solid var(--border);">
            ${IconHelper.getIcon(meta.icon || 'plugin,🧩', { size: 64 })}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <h2 style="font-size: 18px; font-weight: 700; margin: 0; color: #fff; background: linear-gradient(135deg, var(--mint-green), var(--text-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              ${meta.name || uuid}
            </h2>
            <span style="font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono);">${uuid}</span>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.15); padding: 12px; border-radius: 6px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px;">
          ${meta.description ? `<p style="margin: 0; line-height: 1.5; color: var(--text-secondary);">${meta.description}</p>` : ''}
          ${meta.version ? `<div style="display:flex; justify-content:space-between; font-size: 12px;"><strong style="color:var(--text-secondary);">Version:</strong> <span>${meta.version}</span></div>` : ''}
          ${meta.author ? `<div style="display:flex; justify-content:space-between; font-size: 12px;"><strong style="color:var(--text-secondary);">Author:</strong> <span>${meta.author}</span></div>` : ''}
          ${meta.website ? `<div style="display:flex; justify-content:space-between; font-size: 12px; align-items: center;"><strong style="color:var(--text-secondary);">Website:</strong> <a href="${meta.website}" target="_blank" title="${meta.website}" style="color: var(--text-accent); text-decoration: none; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 180px; text-align: right;">${meta.website}</a></div>` : ''}
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
          <button class="btn-primary" id="btn-about-close" style="padding: 6px 16px;">Close</button>
        </div>
      `;

      const winId = `about-${uuid}`;
      const win = this.windowManager.createWindow({
        id: winId,
        title: `About ${meta.name || 'Extension'}`,
        icon: 'info,ℹ️',
        width: 360,
        height: meta.description && meta.description.length > 100 ? 340 : 280,
        content: content
      });

      content.querySelector('#btn-about-close').addEventListener('click', () => {
        this.windowManager.closeWindow(winId);
      });
    });

    // Close settings
    document.getElementById('settings-close')?.addEventListener('click', () => {
      document.getElementById('settings-overlay')?.classList.remove('open');
    });

    // Close on backdrop click
    document.getElementById('settings-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'settings-overlay') {
        e.target.classList.remove('open');
      }
    });

  }

  _showSettingsDialog(uuid, schema, settingsInstance) {
    const overlay = document.getElementById('settings-overlay');
    const title = document.getElementById('settings-title');
    const body = document.getElementById('settings-body');
    if (!overlay || !body) return;

    const ext = this.loader.getLoaded().get(uuid);
    if (title) title.textContent = `${ext?.metadata?.name || uuid} — Settings`;

    body.innerHTML = '';

    // Component to render structural headers
    const renderSectionHeader = (def, key) => {
      const sectionWrap = document.createElement('div');
      sectionWrap.style.marginTop = '20px';
      sectionWrap.style.marginBottom = '10px';
      sectionWrap.style.borderBottom = '1px solid var(--border)';
      sectionWrap.style.paddingBottom = '6px';

      const titleEl = document.createElement('div');
      titleEl.style.fontSize = '11px';
      titleEl.style.fontWeight = '800';
      titleEl.style.color = 'var(--accent)';
      titleEl.style.textTransform = 'uppercase';
      titleEl.style.letterSpacing = '1px';
      titleEl.textContent = def.title || def.description || key;

      sectionWrap.appendChild(titleEl);
      body.appendChild(sectionWrap);
    };

    // Component to render interactive control rows
    const renderFieldRow = (key, def) => {
      if (def.type === 'header') {
        const header = document.createElement('div');
        header.classList.add('settings-header-row');
        header.textContent = def.description || key;
        body.appendChild(header);
        return;
      }
      if (def.type === 'separator') {
        const sep = document.createElement('hr');
        sep.style.border = 'none';
        sep.style.borderTop = '1px solid var(--border)';
        sep.style.margin = '8px 0';
        body.appendChild(sep);
        return;
      }

      const row = document.createElement('div');
      row.classList.add('setting-row');

      const label = document.createElement('div');
      label.classList.add('setting-label');
      label.textContent = def.description || key;

      const control = document.createElement('div');
      control.classList.add('setting-control');

      const currentVal = settingsInstance?.getValue?.(key) ?? def.default;

      if (def.type === 'checkbox' || def.type === 'switch') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!currentVal;
        cb.addEventListener('change', () => settingsInstance?.setValue(key, cb.checked));
        control.appendChild(cb);
      } else if (def.type === 'spinbutton') {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = currentVal ?? def.default ?? 0;
        if (def.min !== undefined) input.min = def.min;
        if (def.max !== undefined) input.max = def.max;
        if (def.step !== undefined) input.step = def.step;
        input.addEventListener('change', () => settingsInstance?.setValue(key, Number(input.value)));
        control.appendChild(input);
      } else if (def.type === 'entry') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentVal ?? '';
        input.addEventListener('change', () => settingsInstance?.setValue(key, input.value));
        control.appendChild(input);
      } else if (def.type === 'combobox') {
        const select = document.createElement('select');
        if (def.options) {
          for (const [optLabel, optVal] of Object.entries(def.options)) {
            const opt = document.createElement('option');
            opt.value = optVal;
            opt.textContent = optLabel;
            if (optVal === currentVal) opt.selected = true;
            select.appendChild(opt);
          }
        }
        select.addEventListener('change', () => settingsInstance?.setValue(key, select.value));
        control.appendChild(select);
      } else if (def.type === 'colorchooser') {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentVal || '#ffffff';
        input.addEventListener('change', () => settingsInstance?.setValue(key, input.value));
        control.appendChild(input);
      } else if (def.type === 'scale') {
        const input = document.createElement('input');
        input.type = 'range';
        input.value = currentVal ?? def.default ?? 50;
        if (def.min !== undefined) input.min = def.min;
        if (def.max !== undefined) input.max = def.max;
        if (def.step !== undefined) input.step = def.step;
        input.addEventListener('input', () => settingsInstance?.setValue(key, Number(input.value)));
        control.appendChild(input);
      } else if (def.type === 'filechooser') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentVal ?? '';
        input.placeholder = 'File path...';
        input.addEventListener('change', () => settingsInstance?.setValue(key, input.value));
        control.appendChild(input);
      } else if (def.type === 'format_builder') {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '8px';
        wrapper.style.width = '100%';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentVal ?? '';
        input.style.width = '100%';
        input.addEventListener('input', () => settingsInstance?.setValue(key, input.value));
        wrapper.appendChild(input);

        const tagsWrap = document.createElement('div');
        tagsWrap.style.display = 'flex';
        tagsWrap.style.flexWrap = 'wrap';
        tagsWrap.style.gap = '4px';

        const tags = [
          { label: 'Hr(24)', val: '%H' }, { label: 'Hr(12)', val: '%I' }, { label: 'Min', val: '%M' },
          { label: 'Sec', val: '%S' }, { label: 'AM/PM', val: '%p' }, { label: 'Day', val: '%a' },
          { label: 'Date', val: '%d' }, { label: 'Month', val: '%b' }, { label: 'Year', val: '%Y' }
        ];

        for (const tag of tags) {
          const btn = document.createElement('button');
          btn.textContent = tag.label;
          btn.title = `Insert ${tag.val}`;
          btn.style.fontSize = '10px';
          btn.style.padding = '2px 6px';
          btn.style.borderRadius = '4px';
          btn.style.border = '1px solid var(--border)';
          btn.style.background = 'var(--bg-surface-hover)';
          btn.style.color = 'var(--text-secondary)';
          btn.style.cursor = 'pointer';

          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const start = input.selectionStart || input.value.length;
            const end = input.selectionEnd || input.value.length;
            input.value = input.value.substring(0, start) + tag.val + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start + tag.val.length;
            input.focus();
            settingsInstance?.setValue(key, input.value);
          });
          tagsWrap.appendChild(btn);
        }

        wrapper.appendChild(tagsWrap);
        control.appendChild(wrapper);
      } else {
        const span = document.createElement('span');
        span.style.color = 'var(--text-tertiary)';
        span.style.fontSize = '11px';
        span.textContent = `[${def.type}]`;
        control.appendChild(span);
      }

      row.appendChild(label);
      row.appendChild(control);
      body.appendChild(row);
    };

    // Map structures and determine final display sequences
    const keysHandled = new Set();
    const sectionsToRender = [];

    const layout = schema.layout;

    // Scan pages for section ordering
    if (layout && layout.pages) {
      for (const pageId of layout.pages) {
        const page = schema[pageId] || layout[pageId];
        if (page && page.sections) {
          for (const secId of page.sections) {
            const sec = schema[secId] || layout[secId];
            if (sec) sectionsToRender.push({ id: secId, def: sec, keys: sec.keys || [] });
          }
        }
      }
    }

    // Flat section fallback
    if (sectionsToRender.length === 0 && layout && layout.sections) {
      for (const secId of layout.sections) {
        const sec = schema[secId] || layout[secId];
        if (sec) sectionsToRender.push({ id: secId, def: sec, keys: sec.keys || [] });
      }
    }

    // Scrape raw sections if layout directives are fully absent
    if (sectionsToRender.length === 0) {
      for (const [key, def] of Object.entries(schema)) {
        if (def.type === 'section') {
          sectionsToRender.push({ id: key, def: def, keys: def.keys || [] });
        }
      }
    }

    //  Aggregate settings field keys to render
    const fieldsMap = {};
    for (const [key, def] of Object.entries(schema)) {
      if (key !== 'layout' && def.type !== 'layout' && def.type !== 'page' && def.type !== 'section') {
        fieldsMap[key] = def;
      }
    }

    // Re-assemble form by nesting elements inside sections
    for (const section of sectionsToRender) {
      renderSectionHeader(section.def, section.id);

      // Match explicit arrays declared inside the section layout schema
      for (const key of section.keys) {
        if (fieldsMap[key] && !keysHandled.has(key)) {
          renderFieldRow(key, fieldsMap[key]);
          keysHandled.add(key);
        }
      }

      // Match field descriptors declaring dynamic section links
      for (const [key, def] of Object.entries(fieldsMap)) {
        if (def.section === section.id && !keysHandled.has(key)) {
          renderFieldRow(key, def);
          keysHandled.add(key);
        }
      }
    }

    //  Empty orphan queue (keys not associated with any valid section)
    for (const [key, def] of Object.entries(fieldsMap)) {
      if (!keysHandled.has(key)) {
        renderFieldRow(key, def);
        keysHandled.add(key);
      }
    }

    overlay.classList.add('open');

    // Ensure dialog is visible on screen
    const dialog = document.querySelector('.settings-dialog');
    if (dialog && dialog.style.left) {
      const rect = dialog.getBoundingClientRect();
      if (rect.left < 0 || rect.top < 0 || rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
        dialog.style.left = '';
        dialog.style.top = '';
      }
    }
  }

  _bindKeyboard() {
    document.addEventListener('keydown', async (e) => {
      // Ctrl+/ or Ctrl+? — Toggle Looking Glass
      if (e.ctrlKey && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        this.console.log('⌨️ Looking Glass toggled via Ctrl+/');
        this.console.toggle();
        document.getElementById('btn-toggle-lg')?.classList.toggle('active', this.console._isOpen);
      }
      // Escape — close overlays
      if (e.key === 'Escape') {
        document.getElementById('settings-overlay')?.classList.remove('open');
        if (this.editor._isOpen) this.editor.toggle();
      }

      // Ignore if targeting an interactive input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const scope = window.lastFocusedScope;
      if (!scope) return;

      // Ctrl + A (Select All)
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (scope.type === 'desktop') {
          scope.container.querySelectorAll('.desktop-icon').forEach(el => el.classList.add('selected'));
        } else if (scope.type === 'files') {
          scope.fmList.querySelectorAll('.fm-file-item').forEach(el => {
            el.classList.add('selected');
            el.style.background = 'rgba(53,132,228,0.25)';
          });
        }
        return;
      }

      // Helper function to extract selected items
      const getSelectedItems = () => {
        if (scope.type === 'desktop') {
          return Array.from(scope.container.querySelectorAll('.desktop-icon.selected')).map(el => ({
            path: el.dataset.path,
            name: el.dataset.name,
            isVirtual: el.dataset.virtual === 'true'
          }));
        } else if (scope.type === 'files') {
          return Array.from(scope.fmList.querySelectorAll('.fm-file-item.selected')).map(el => ({
            path: el.dataset.path,
            name: el.dataset.name,
            isVirtual: false
          }));
        }
        return [];
      };

      // Ctrl + C (Copy)
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const selected = getSelectedItems();
        if (selected.length > 0) {
          window.desktopClipboard = {
            type: 'copy',
            items: selected,
            path: selected[0].path,
            name: selected[0].name
          };
        }
        return;
      }

      // Ctrl + X (Cut)
      if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        const selected = getSelectedItems();
        if (selected.length > 0) {
          if (selected.some(i => i.isVirtual)) {
            showSystemDialog({
              title: 'System Application',
              message: 'You cannot move or delete system shortcuts from the desktop. If you want to hide them, you can do so from the Desktop Settings.',
              type: 'confirm',
              confirmText: 'Open Settings',
              cancelText: 'OK',
              onConfirm: () => {
                document.dispatchEvent(new CustomEvent('launch-app', {
                  detail: { id: 'system-settings', args: ['desktop'] }
                }));
              }
            });
            return;
          }
          window.desktopClipboard = {
            type: 'cut',
            items: selected,
            path: selected[0].path,
            name: selected[0].name
          };
        }
        return;
      }

      // Ctrl + V (Paste)
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const clip = window.desktopClipboard;
        if (!clip || !clip.items || clip.items.length === 0) return;

        let targetDir = scope.type === 'desktop' ? '/home/user/Desktop' : scope.currentPath;

        for (const item of clip.items) {
          try {
            let targetPath = `${targetDir}/${item.name}`;
            const exists = await this.vfs.stat(targetPath);
            if (exists) {
              const extIdx = item.name.lastIndexOf('.');
              let baseName = item.name;
              let ext = '';
              if (extIdx !== -1 && !item.name.endsWith('.')) {
                baseName = item.name.substring(0, extIdx);
                ext = item.name.substring(extIdx);
              }
              targetPath = `${targetDir}/${baseName} - Copy${ext}`;
            }

            if (clip.type === 'copy') {
              await this.vfs.copy(item.path, targetPath);
            } else if (clip.type === 'cut') {
              await this.vfs.rename(item.path, targetPath);
            }
          } catch (err) {
            console.error('Keyboard paste failed:', err);
          }
        }

        if (clip.type === 'cut') {
          window.desktopClipboard = { type: null, items: [] };
        }

        if (scope.render) scope.render();
        if (scope.renderFiles) scope.renderFiles();
        return;
      }

      // Delete button
      if (e.key === 'Delete') {
        e.preventDefault();
        const selected = getSelectedItems();
        if (selected.length === 0) return;

        if (selected.some(i => i.isVirtual)) {
          showSystemDialog({
            title: 'System Application',
            message: 'You cannot delete system shortcuts from the desktop. If you want to hide them, you can do so from the Desktop Settings.',
            type: 'confirm',
            confirmText: 'Open Settings',
            cancelText: 'OK',
            onConfirm: () => {
              document.dispatchEvent(new CustomEvent('launch-app', {
                detail: { id: 'system-settings', args: ['desktop'] }
              }));
            }
          });
          return;
        }

        showSystemDialog({
          title: 'Move to Trash',
          message: `Are you sure you want to move the ${selected.length} selected item(s) to Trash?`,
          type: 'confirm',
          confirmText: 'Move to Trash',
          onConfirm: async () => {
            for (const item of selected) {
              try {
                await this.vfs.trash(item.path);
              } catch (err) {
                console.error('Move to Trash failed:', err);
              }
            }
            if (scope.render) scope.render();
            if (scope.renderFiles) scope.renderFiles();
          }
        });
      }
    });
  }
}

// ── Boot ────────────────────────────────────────────────────────────
const app = new EverestSandbox();
app.init().catch(err => {
  console.error('EverestOS failed to start:', err);
});
