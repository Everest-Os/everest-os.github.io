// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/')
  ? import.meta.env.BASE_URL
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

export class ThemeManager {
  constructor(vfs) {
    this.vfs = vfs;
    this.currentTheme = 'mint-dark';
    this.currentIconTheme = 'bloom-dark';
    this.preferredMode = 'dark';
    this.themes = new Map();
    this.iconThemes = new Map();
  }

  async init() {
    let themeIds = [];
    let iconThemeIds = [];

    // Dynamic Asset Discovery via System Manifest
    try {
      const manifestRes = await fetch(BASE_URL + 'system-manifest.json');
      if (manifestRes.ok) {
        const manifest = await manifestRes.json();
        if (Array.isArray(manifest)) {
          // Auto-discover Desktop Themes (*.json inside /system/themes)
          themeIds = manifest
            .filter(i => i.type === 'file' && i.path.startsWith('/system/themes/') && i.path.endsWith('.json'))
            .map(i => {
              const filename = i.path.substring(i.path.lastIndexOf('/') + 1);
              return filename.substring(0, filename.lastIndexOf('.'));
            });

          // Auto-discover Icon Themes (index.json inside subfolders of /system/icons)
          iconThemeIds = manifest
            .filter(i => i.type === 'file' && i.path.startsWith('/system/icons/') && i.path.endsWith('/index.json'))
            .map(i => {
              const sub = i.path.substring('/system/icons/'.length);
              return sub.substring(0, sub.indexOf('/'));
            })
            .filter(id => id);
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic assets from system manifest:', err);
    }

    // Fetch and Load System Themes
    for (const id of themeIds) {
      try {
        const res = await fetch(BASE_URL + `system/themes/${id}.json`);
        if (res.ok) {
          const theme = await res.json();
          theme.id = id;
          this.themes.set(id, theme);
        }
      } catch (e) { }
    }

    // Load User Custom Themes from ~/themes
    try {
      const userThemesDir = '~/themes';
      const files = await this.vfs.readdir(userThemesDir).catch(() => []);
      for (const item of files) {
        if (item.type !== 'dir' && item.name.endsWith('.json')) {
          try {
            const content = await this.vfs.readFile(item.path);
            const theme = JSON.parse(content);
            if (theme && theme.id) {
              // Allow user-saved themes to integrate seamlessly
              this.themes.set(theme.id, theme);
            }
          } catch (err) { }
        }
      }
    } catch (e) { }

    // Fetch and Load Icon Themes
    for (const id of iconThemeIds) {
      try {
        const res = await fetch(BASE_URL + `system/icons/${id}/index.json`);
        if (res.ok) {
          const theme = await res.json();
          theme.id = id;
          this.iconThemes.set(id, theme);
        }
      } catch (e) { }
    }

    // Check for saved config
    try {
      const savedStr = await this.vfs.readFile('~/.config/theme.json');
      if (savedStr) {
        const config = JSON.parse(savedStr);
        if (config.current && this.themes.has(config.current)) {
          this.currentTheme = config.current;
        }
        if (config.icons && this.iconThemes.has(config.icons)) {
          this.currentIconTheme = config.icons;
        }
        if (config.preferredMode) {
          this.preferredMode = config.preferredMode;
        }
      } else {
        const legacy = await this.vfs.readFile('~/.config/theme.txt');
        if (legacy && this.themes.has(legacy)) this.currentTheme = legacy;
      }
    } catch (e) { }

    await this.applyTheme(this.currentTheme);
    await this.applyIconTheme(this.currentIconTheme);
  }

  async applyTheme(id, options = {}) {
    let targetId = id;

    // Auto-switch based on preferred mode if not explicitly disabled
    if (!options.ignoreMode) {
      const isDark = this.preferredMode === 'dark';
      const base = id.endsWith('-dark') ? id.replace('-dark', '') : id;
      const variant = isDark ? `${base}-dark` : base;
      if (this.themes.has(variant)) {
        targetId = variant;
      }
    }

    const theme = this.themes.get(targetId);
    if (!theme) return;

    this.currentTheme = targetId;
    const root = document.documentElement;

    // ───── Clean Baseline Initialization ─────
    // Revert physical dimensions to system defaults before applying theme profiles.
    root.style.setProperty('--panel-margin-x', '60px');
    root.style.setProperty('--panel-margin-y', '12px');
    root.style.setProperty('--panel-radius', '12px');
    root.style.setProperty('--window-radius', '12px');
    root.style.setProperty('--panel-height', '48px');
    root.style.setProperty('--panel-justify', 'center');
    root.style.setProperty('--menu-categories-display', 'flex');
    root.style.setProperty('--menu-width', '420px');

    root.style.removeProperty('--menu-radius');
    root.style.removeProperty('--menu-height');
    root.style.removeProperty('--wm-btn-size');
    root.style.removeProperty('--wm-btn-color');
    root.style.removeProperty('--wm-titlebar-bg');
    root.style.removeProperty('--panel-icon-size');
    root.style.removeProperty('--bg-panel-rgba');
    root.style.removeProperty('--panel-border-rgba');
    root.style.removeProperty('--panel-opacity');
    root.style.removeProperty('--panel-blur');
    root.style.removeProperty('--menu-opacity');
    root.style.removeProperty('--menu-blur');
    root.style.removeProperty('--window-opacity');
    root.style.removeProperty('--window-blur');
    root.style.removeProperty('--wm-bg');
    root.style.removeProperty('--wm-border');

    const panelEl = document.getElementById('everest-panel');
    if (panelEl) {
      panelEl.style.height = '48px';
    }
    // ───────────────────────────────────────────

    // ───── 1. Layer: Theme Variables ─────
    if (theme.variables) {
      for (const [key, value] of Object.entries(theme.variables)) {
        root.style.setProperty(key, value);
      }
    }

    // ───── 2. Layer: User Configuration Override ─────
    // If theme permits overrides (default: true), apply local settings ON TOP of theme vars.
    const allowOverride = theme.allowConfigOverride !== false;
    if (allowOverride) {
      try {
        const appConfigStr = await this.vfs.readFile('~/.config/appearance.json');
        if (appConfigStr) {
          const cfg = JSON.parse(appConfigStr);
          if (cfg.panelMarginX !== undefined) root.style.setProperty('--panel-margin-x', cfg.panelMarginX + 'px');
          if (cfg.panelMarginY !== undefined) root.style.setProperty('--panel-margin-y', cfg.panelMarginY + 'px');
          if (cfg.panelRadius !== undefined) root.style.setProperty('--panel-radius', cfg.panelRadius + 'px');
          if (cfg.windowRadius !== undefined) root.style.setProperty('--window-radius', cfg.windowRadius + 'px');
          if (cfg.panelHeight !== undefined) {
            root.style.setProperty('--panel-height', cfg.panelHeight + 'px');
            if (panelEl) panelEl.style.height = cfg.panelHeight + 'px';
          }
          if (cfg.wmBtnSize !== undefined) root.style.setProperty('--wm-btn-size', cfg.wmBtnSize + 'px');
          if (cfg.panelBlur !== undefined) root.style.setProperty('--panel-blur', cfg.panelBlur + 'px');
          if (cfg.panelColor && cfg.panelOpacity !== undefined) {
            const hex = cfg.panelColor;
            const r = parseInt(hex.slice(1, 3), 16) || 0;
            const g = parseInt(hex.slice(3, 5), 16) || 0;
            const b = parseInt(hex.slice(5, 7), 16) || 0;
            root.style.setProperty('--bg-panel-rgba', `rgba(${r}, ${g}, ${b}, ${cfg.panelOpacity})`);
          }
          if (cfg.panelBorderColor) {
            const hex = cfg.panelBorderColor;
            const r = parseInt(hex.slice(1, 3), 16) || 0;
            const g = parseInt(hex.slice(3, 5), 16) || 0;
            const b = parseInt(hex.slice(5, 7), 16) || 0;
            const opacity = cfg.panelBorderOpacity !== undefined ? cfg.panelBorderOpacity : 0.3;
            root.style.setProperty('--panel-border-rgba', `rgba(${r}, ${g}, ${b}, ${opacity})`);
          }
        }
        const menuConfigStr = await this.vfs.readFile('~/.config/menu.json');
        if (menuConfigStr) {
          const cfg = JSON.parse(menuConfigStr);
          if (cfg.showCategoryIcons === false) root.style.setProperty('--menu-categories-display', 'none');
          if (cfg.menuWidth !== undefined) root.style.setProperty('--menu-width', cfg.menuWidth + 'px');
          if (cfg.menuRadius !== undefined && cfg.menuRadius !== null) root.style.setProperty('--menu-radius', cfg.menuRadius + 'px');
        }
      } catch (e) { /* Ignore parsing error fallback */ }
    }
    // ───────────────────────────────────────────

    if (theme.mode === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      if (!options.ignoreMode) this.preferredMode = 'light';
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      if (!options.ignoreMode) this.preferredMode = 'dark';
    }

    if (!options.ignoreMode) {
      this._updateAutoIconTheme(this.preferredMode);
      this._save();
    }

    if (theme.panelMode === 'light') {
      root.classList.add('light-panel-theme');
    } else {
      root.classList.remove('light-panel-theme');
    }

    // Synchronize panel layout bounds (.is-dock) with final applied values
    if (panelEl) {
      const mxStr = root.style.getPropertyValue('--panel-margin-x') || '60px';
      const myStr = root.style.getPropertyValue('--panel-margin-y') || '12px';
      const mxVal = parseFloat(mxStr);
      const myVal = parseFloat(myStr);

      if (mxVal === 0 && myVal === 0) {
        panelEl.classList.remove('is-dock');
      } else {
        panelEl.classList.add('is-dock');
      }
    }

    await this._updateAutoIconTheme(theme.mode || 'dark');
    await this._save();
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  }

  async _updateAutoIconTheme(mode) {
    let current = this.currentIconTheme;
    let base = current.endsWith('-dark') ? current.replace('-dark', '') : current;
    let target = mode === 'dark' ? `${base}-dark` : base;

    if (target !== current && this.iconThemes.has(target)) {
      await this.applyIconTheme(target);
    }
  }

  async applyIconTheme(id) {
    const theme = this.iconThemes.get(id);
    if (!theme) return;

    this.currentIconTheme = id;
    window.currentThemeIcons = theme.icons || {};
    window.currentThemeSymbolic = theme.symbolic === true;
    window.currentThemeColors = theme.colors || {};

    // Load helper if defined
    if (theme.helper) {
      try {
        const helperPath = theme.helper.startsWith('/') ? theme.helper : `/system/icons/${id}/${theme.helper}`;
        const res = await fetch(BASE_URL + helperPath.substring(1));
        if (res.ok) {
          const code = await res.text();
          // Evaluate to get the helper object
          const helperFunc = new Function('return ' + code)();
          window.currentThemeIconHelper = helperFunc;
        } else {
          window.currentThemeIconHelper = null;
        }
      } catch (e) {
        console.error('Failed to load icon theme helper:', e);
        window.currentThemeIconHelper = null;
      }
    } else {
      window.currentThemeIconHelper = null;
    }

    this._save();
    window.dispatchEvent(new CustomEvent('icon-theme-changed', { detail: { theme } }));
  }

  async setMode(mode) {
    this.preferredMode = mode;
    await this.applyTheme(this.currentTheme);
    await this._updateAutoIconTheme(mode);
    await this._save();
  }

  async _save() {
    const config = {
      current: this.currentTheme,
      icons: this.currentIconTheme,
      preferredMode: this.preferredMode,
      lastUpdated: Date.now()
    };
    await this.vfs.writeFile('~/.config/theme.json', JSON.stringify(config, null, 2));
  }

  async _applyOverrides() {
    // legacy
  }

  getThemes() {
    return Array.from(this.themes.values());
  }

  getIconThemes() {
    return Array.from(this.iconThemes.values());
  }
}
