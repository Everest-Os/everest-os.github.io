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
    // 1. Load Desktop Themes
    const themeIds = ['mint', 'mint-dark', 'minimal', 'win95'];
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

    // 2. Load Icon Themes
    const iconThemeIds = ['emoji', 'modern', 'bloom', 'bloom-dark'];
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

    // 3. Check for saved config
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

    this.applyTheme(this.currentTheme);
    this.applyIconTheme(this.currentIconTheme);
  }

  applyTheme(id, options = {}) {
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

    if (theme.variables) {
      for (const [key, value] of Object.entries(theme.variables)) {
        root.style.setProperty(key, value);
      }
    }

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

    this._updateAutoIconTheme(theme.mode || 'dark');
    this._save();
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  }

  _updateAutoIconTheme(mode) {
    let current = this.currentIconTheme;
    let base = current.endsWith('-dark') ? current.replace('-dark', '') : current;
    let target = mode === 'dark' ? `${base}-dark` : base;

    if (target !== current && this.iconThemes.has(target)) {
      this.applyIconTheme(target);
    }
  }

  applyIconTheme(id) {
    const theme = this.iconThemes.get(id);
    if (!theme) return;

    this.currentIconTheme = id;
    window.currentThemeIcons = theme.icons || {};

    this._save();
    window.dispatchEvent(new CustomEvent('icon-theme-changed', { detail: { theme } }));
  }

  setMode(mode) {
    this.preferredMode = mode;
    this.applyTheme(this.currentTheme);
    this._updateAutoIconTheme(mode);
    this._save();
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
