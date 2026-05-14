/**
 * Appearance Utilities — Loaded on startup to restore visual settings
 */

function hexToRgba(hex, opacity) {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export async function loadAppearance(vfs) {
  try {
    const configStr = await vfs.readFile('~/.config/appearance.json');
    if (configStr) {
      const settings = JSON.parse(configStr);
      const root = document.documentElement;

      const panelColor = settings.panelColor || '#1e1e1e';
      const panelOpacity = settings.panelOpacity !== undefined ? settings.panelOpacity : 0.92;
      root.style.setProperty('--bg-panel-rgba', hexToRgba(panelColor, panelOpacity));

      if (settings.panelBlur !== undefined) root.style.setProperty('--panel-blur', `${settings.panelBlur}px`);
      if (settings.panelMarginY !== undefined) root.style.setProperty('--panel-margin-y', `${settings.panelMarginY}px`);
      if (settings.panelMarginX !== undefined) root.style.setProperty('--panel-margin-x', `${settings.panelMarginX}px`);
      if (settings.panelRadius !== undefined) root.style.setProperty('--panel-radius', `${settings.panelRadius}px`);
      if (settings.windowRadius !== undefined) root.style.setProperty('--window-radius', `${settings.windowRadius}px`);

      const panelBorderColor = settings.panelBorderColor || '#6496ff';
      const panelBorderOpacity = settings.panelBorderOpacity !== undefined ? settings.panelBorderOpacity : 0.3;
      root.style.setProperty('--panel-border-rgba', hexToRgba(panelBorderColor, panelBorderOpacity));

      // Update .is-dock class on panel
      const panelEl = document.getElementById('everest-panel');
      if (panelEl) {
        const mx = settings.panelMarginX !== undefined ? settings.panelMarginX : 60;
        const my = settings.panelMarginY !== undefined ? settings.panelMarginY : 12;
        if (mx === 0 && my === 0) {
          panelEl.classList.remove('is-dock');
        } else {
          panelEl.classList.add('is-dock');
        }
      }

      const panelHeight = settings.panelHeight !== undefined ? settings.panelHeight : 48;
      root.style.setProperty('--panel-height', `${panelHeight}px`);
      if (panelEl) panelEl.style.height = `${panelHeight}px`;

      const menuColor = settings.menuColor || '#1e1e1e';
      const menuOpacity = settings.menuOpacity !== undefined ? settings.menuOpacity : 0.95;
      root.style.setProperty('--bg-menu-rgba', hexToRgba(menuColor, menuOpacity));

      if (settings.menuBlur !== undefined) root.style.setProperty('--menu-blur', `${settings.menuBlur}px`);

      const menuIconEl = document.getElementById('panel-menu-icon');
      if (menuIconEl) {
        menuIconEl.textContent = settings.menuIcon !== undefined ? settings.menuIcon : '🌿';
      }

      // Apply Themes
      if (settings.shellTheme === 'light') {
        document.documentElement.classList.add('light-panel-theme');
        document.body.classList.add('light-panel-theme');
        document.documentElement.style.removeProperty('--bg-panel-rgba');
        document.documentElement.style.removeProperty('--bg-menu-rgba');
      } else {
        document.documentElement.classList.remove('light-panel-theme');
        document.body.classList.remove('light-panel-theme');
      }

      if (settings.appTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.body.classList.add('light-theme');
        document.documentElement.style.removeProperty('--bg-context-menu-rgba');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
      }
    }
  } catch {
    // No config, stick to CSS defaults
  }
}
