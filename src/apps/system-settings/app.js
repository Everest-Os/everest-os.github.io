/**
 * System Settings App
 * Centralized configuration for Appearance, Desktop, and Extensions.
 */

export async function launch(ctx, options = {}) {
  const { windowManager, vfs, themeManager, appLoader, loader, panelManager } = ctx;
  const { IconHelper } = await import('../../runtime/iconHelper.js');


  let appearanceSettings = {};
  const loadAppearanceSettings = async () => {
    try {
      const saved = await vfs.readFile('~/.config/appearance.json');
      if (saved) appearanceSettings = JSON.parse(saved);
    } catch (e) { }
  };
  const saveAppearanceSettings = async () => {
    await vfs.writeFile('~/.config/appearance.json', JSON.stringify(appearanceSettings, null, 2));
    document.dispatchEvent(new CustomEvent('reload-appearance'));
  };
  await loadAppearanceSettings();

  let initialSection = 'appearance';
  if (options.args && options.args.length > 0) initialSection = options.args[0];
  if (options.section) initialSection = options.section;

  const existingWin = windowManager.windows.get('system-settings');
  if (existingWin) {
    windowManager.focusWindow('system-settings');
    // Ensure we switch to the requested section
    setTimeout(() => {
      const navItem = existingWin.frame.querySelector(`.settings-nav-item[data-section="${initialSection}"]`);
      if (navItem) {
        navItem.click();
        navItem.dispatchEvent(new Event('click', { bubbles: true }));
      }
    }, 50);
    return;
  }

  const content = document.createElement('div');
  content.style.height = '100%';
  content.style.display = 'flex';
  content.style.background = 'var(--bg-surface)';
  content.style.color = 'var(--text-primary)';
  content.style.fontFamily = 'var(--font-main)';

  content.innerHTML = `
    <div id="settings-sidebar" style="
      width: 180px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 12px 0;
      flex-shrink: 0;
    ">
      <div class="settings-nav-item" data-section="appearance">${IconHelper.getIcon('appearance,🎨', { size: 16 })} Appearance</div>
      <div class="settings-nav-item" data-section="panel">${IconHelper.getIcon('panel-color,🚥', { size: 16 })} Panel</div>
      <div class="settings-nav-item" data-section="menu">${IconHelper.getIcon('menu-color,🌿', { size: 16 })} Menu</div>
      <div class="settings-nav-item" data-section="desktop">${IconHelper.getIcon('desktop,🖥️', { size: 16 })} Desktop</div>
      <div class="settings-nav-item" data-section="display">${IconHelper.getIcon('monitor-color,🖥️', { size: 16 })} Display</div>
      <div class="settings-nav-item" data-section="extensions">${IconHelper.getIcon('plugin-color,🧩', { size: 16 })} Extensions</div>
      <div class="settings-nav-item" data-section="startup">${IconHelper.getIcon('startup,🚀', { size: 16 })} Startup</div>
      <div class="settings-nav-item" data-section="storage">${IconHelper.getIcon('storage,💽', { size: 16 })} Storage</div>
      <div class="settings-nav-item" data-section="users">${IconHelper.getIcon('user-color,👥', { size: 16 })} Users</div>
      <div style="flex: 1;"></div>
      <div class="settings-nav-item" data-section="about">${IconHelper.getIcon('system-color,ℹ️', { size: 16 })} About</div>
    </div>
    <div id="settings-main" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
      <div id="settings-header" style="
        padding: 16px 24px;
        border-bottom: 1px solid var(--border);
        font-size: 18px;
        font-weight: 700;
        background: var(--bg-card);
      ">
        Settings
      </div>
      <div id="settings-body" style="flex: 1; overflow-y: auto; padding: 24px;">
        <!-- Dynamic content here -->
      </div>
    </div>
    <style>
      .settings-nav-item {
        padding: 10px 20px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      .settings-nav-item:hover {
        background: var(--bg-card-hover);
        color: var(--text-primary);
      }
      .settings-nav-item.active {
        background: rgba(var(--accent-rgb), 0.15);
        color: var(--text-primary);
        border-left-color: var(--accent);
      }
      .settings-section-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .settings-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-main);
        padding: 16px;
        margin-bottom: 20px;
      }
      .settings-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .settings-row:last-child { margin-bottom: 0; }

      .btn-secondary.active {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
      }
    </style>
  `;

  const win = windowManager.createWindow({
    id: 'system-settings',
    title: 'System Settings',
    icon: 'settings,⚙️',
    width: 800,
    height: 600,
    content: content,
    onClose: () => {
      if (currentSection === 'menu') {
        window.dispatchEvent(new CustomEvent('everest:close-menu'));
      }
    }
  });

  const sidebar = content.querySelector('#settings-sidebar');
  const header = content.querySelector('#settings-header');
  const body = content.querySelector('#settings-body');
  const navItems = content.querySelectorAll('.settings-nav-item');

  const refreshSidebarIcons = () => {
    sidebar.querySelector('[data-section="appearance"]').innerHTML = `${IconHelper.getIcon('appearance,🎨', { size: 16 })} Appearance`;
    sidebar.querySelector('[data-section="panel"]').innerHTML = `${IconHelper.getIcon('panel-color,🚥', { size: 16 })} Panel`;
    sidebar.querySelector('[data-section="menu"]').innerHTML = `${IconHelper.getIcon('menu-color,🌿', { size: 16 })} Menu`;
    sidebar.querySelector('[data-section="desktop"]').innerHTML = `${IconHelper.getIcon('desktop,🖥️', { size: 16 })} Desktop`;
    sidebar.querySelector('[data-section="display"]').innerHTML = `${IconHelper.getIcon('monitor-color,🖥️', { size: 16 })} Display`;
    sidebar.querySelector('[data-section="extensions"]').innerHTML = `${IconHelper.getIcon('plugin-color,🧩', { size: 16 })} Extensions`;
    sidebar.querySelector('[data-section="startup"]').innerHTML = `${IconHelper.getIcon('startup,🚀', { size: 16 })} Startup`;
    sidebar.querySelector('[data-section="storage"]').innerHTML = `${IconHelper.getIcon('storage,💽', { size: 16 })} Storage`;
    sidebar.querySelector('[data-section="users"]').innerHTML = `${IconHelper.getIcon('user-color,👥', { size: 16 })} Users`;
    sidebar.querySelector('[data-section="about"]').innerHTML = `${IconHelper.getIcon('system-color,ℹ️', { size: 16 })} About`;
  };

  window.addEventListener('icon-theme-changed', () => {
    refreshSidebarIcons();
    renderSection(currentSection);
  });

  window.addEventListener('theme-changed', () => {
    renderSection(currentSection);
  });

  let currentSection = initialSection;
  let originalPos = null;

  const setSection = async (id) => {
    // Live preview for menu settings
    if (id === 'menu') {
      window.dispatchEvent(new CustomEvent('everest:open-menu'));

      // Move window so it doesn't overlap the menu
      if (!originalPos) {
        originalPos = {
          left: win.frame.style.left,
          top: win.frame.style.top
        };
      }

      try {
        const savedStr = await vfs.readFile('~/.config/menu.json');
        const menuSettings = savedStr ? JSON.parse(savedStr) : { menuWidth: 420 };
        const menuWidth = menuSettings.menuWidth || 420;
        // Shift window to the right of the menu with some margin
        win.frame.style.left = (menuWidth + 60) + 'px';
        // Ensure it doesn't go off screen
        const maxLeft = window.innerWidth - win.frame.offsetWidth - 20;
        if (parseFloat(win.frame.style.left) > maxLeft) {
          win.frame.style.left = maxLeft + 'px';
        }
      } catch (e) {
        win.frame.style.left = '450px';
      }

    } else if (currentSection === 'menu') {
      window.dispatchEvent(new CustomEvent('everest:close-menu'));
      // Restore original position
      if (originalPos) {
        win.frame.style.left = originalPos.left;
        win.frame.style.top = originalPos.top;
        originalPos = null;
      }
    }

    currentSection = id;
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.section === id);
    });
    header.textContent = id.charAt(0).toUpperCase() + id.slice(1);
    renderSection(id);
  };

  const renderPanel = () => {
    const root = document.documentElement;
    const s = {
      height: appearanceSettings.panelHeight !== undefined ? appearanceSettings.panelHeight : 48,
      blur: appearanceSettings.panelBlur !== undefined ? appearanceSettings.panelBlur : 20,
      opacity: appearanceSettings.panelOpacity !== undefined ? appearanceSettings.panelOpacity : 0.92,
      marginY: appearanceSettings.panelMarginY !== undefined ? appearanceSettings.panelMarginY : 12,
      marginX: appearanceSettings.panelMarginX !== undefined ? appearanceSettings.panelMarginX : 60,
      radius: appearanceSettings.panelRadius !== undefined ? appearanceSettings.panelRadius : 12,
      color: appearanceSettings.panelColor || '#1e1e1e',
      borderColor: appearanceSettings.panelBorderColor || '#6496ff',
      borderOpacity: appearanceSettings.panelBorderOpacity !== undefined ? appearanceSettings.panelBorderOpacity : 0.3
    };

    body.innerHTML = `
      <div class="settings-section-title">Behavior</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Panel Position</label>
          <select id="panel-position" style="background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px 10px; border-radius:6px; outline:none; width:120px;">
            <option value="bottom" ${!ctx.panelManager || ctx.panelManager.position === 'bottom' ? 'selected' : ''}>Bottom</option>
            <option value="top" ${ctx.panelManager && ctx.panelManager.position === 'top' ? 'selected' : ''}>Top</option>
          </select>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row">
          <label>Auto-hide Panel</label>
          <input type="checkbox" id="panel-autohide" ${ctx.panelManager && ctx.panelManager.autoHide ? 'checked' : ''}>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row">
          <label>Show App Name in Window List</label>
          <input type="checkbox" id="panel-show-app-name" ${ctx.panelManager && ctx.panelManager.showAppName ? 'checked' : ''}>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="align-items:center;">
          <label style="flex:1;">App Icon Size <span style="font-size:12px; color:var(--text-tertiary); margin-left:8px;" id="val-panel-icon-size">${ctx.panelManager ? ctx.panelManager.iconSize : 16}px</span></label>
          <input type="range" id="panel-icon-size" min="12" max="32" step="2" value="${ctx.panelManager ? ctx.panelManager.iconSize : 16}" style="width:120px;">
        </div>
      </div>

      <div class="settings-section-title">Panel Mode</div>
      <div class="settings-card">
        <div style="display:flex; gap:10px;" id="panel-mode-group">
          <button class="btn-secondary btn-sm" style="flex:1;" data-mode="full">Traditional</button>
          <button class="btn-secondary btn-sm" style="flex:1;" data-mode="dock">Modern Dock</button>
        </div>
      </div>

      <div class="settings-section-title">Visuals</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Background Color</label>
            <input type="color" id="panel-color" value="${s.color}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Opacity</label>
            <span id="opacity-val">${Math.round(s.opacity * 100)}%</span>
          </div>
          <input type="range" id="opacity-range" min="0" max="100" value="${Math.round(s.opacity * 100)}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Transparency Blur</label>
            <span id="blur-val">${s.blur}px</span>
          </div>
          <input type="range" id="blur-range" min="0" max="64" value="${s.blur}" style="width:100%;">
        </div>
        <div style="height:12px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Border Color</label>
            <input type="color" id="border-color" value="${s.borderColor}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Border Opacity</label>
            <span id="border-opacity-val">${Math.round(s.borderOpacity * 100)}%</span>
          </div>
          <input type="range" id="border-opacity" min="0" max="100" value="${Math.round(s.borderOpacity * 100)}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Layout & Spacing</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Height</label>
            <span id="height-val">${s.height}px</span>
          </div>
          <input type="range" id="height-range" min="24" max="64" value="${s.height}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Edge Spacing (Elevate)</label>
            <span id="margin-y-val">${s.marginY}px</span>
          </div>
          <input type="range" id="margin-y-range" min="0" max="40" value="${s.marginY}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Side Spacing (Width)</label>
            <span id="margin-x-val">${s.marginX}px</span>
          </div>
          <input type="range" id="margin-x-range" min="0" max="300" step="10" value="${s.marginX}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Corner Rounding</label>
            <span id="radius-val">${s.radius}px</span>
          </div>
          <input type="range" id="radius-range" min="0" max="32" value="${s.radius}" style="width:100%;">
        </div>
      </div>
    `;

    const hexToRgba = (hex, opacity) => {
      if (!hex || !hex.startsWith('#')) return hex;
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const updateAppearance = async (key, val) => {
      appearanceSettings[key] = val;
      await saveAppearanceSettings();
      // Apply immediately
      if (key === 'panelRadius') {
        root.style.setProperty('--panel-radius', val + 'px');
      } else if (key === 'panelBlur') {
        root.style.setProperty('--panel-blur', val + 'px');
      } else if (key === 'panelOpacity' || key === 'panelColor') {
        root.style.setProperty('--bg-panel-rgba', hexToRgba(appearanceSettings.panelColor || '#1e1e1e', appearanceSettings.panelOpacity !== undefined ? appearanceSettings.panelOpacity : 0.92));
      } else if (key === 'panelHeight') {
        root.style.setProperty('--panel-height', val + 'px');
        if (ctx.panelManager) ctx.panelManager.height = parseInt(val);
      } else if (key === 'panelMarginY') {
        root.style.setProperty('--panel-margin-y', val + 'px');
      } else if (key === 'panelMarginX') {
        root.style.setProperty('--panel-margin-x', val + 'px');
      } else if (key === 'panelBorderColor' || key === 'panelBorderOpacity') {
        root.style.setProperty('--panel-border-rgba', hexToRgba(appearanceSettings.panelBorderColor || '#6496ff', appearanceSettings.panelBorderOpacity !== undefined ? appearanceSettings.panelBorderOpacity : 0.3));
      }
    };

    const positionSelect = body.querySelector('#panel-position');
    if (positionSelect) {
      positionSelect.addEventListener('change', e => {
        if (ctx.panelManager) ctx.panelManager.position = e.target.value;
      });
    }

    const autohideCheck = body.querySelector('#panel-autohide');
    if (autohideCheck) {
      autohideCheck.addEventListener('change', e => {
        if (ctx.panelManager) ctx.panelManager.autoHide = e.target.checked;
      });
    }

    const showAppNameCheck = body.querySelector('#panel-show-app-name');
    if (showAppNameCheck) {
      showAppNameCheck.addEventListener('change', e => {
        if (ctx.panelManager) ctx.panelManager.showAppName = e.target.checked;
      });
    }

    const iconSizeRange = body.querySelector('#panel-icon-size');
    if (iconSizeRange) {
      iconSizeRange.addEventListener('input', e => {
        const val = parseInt(e.target.value);
        body.querySelector('#val-panel-icon-size').textContent = val + 'px';
        if (ctx.panelManager) ctx.panelManager.iconSize = val;
      });
    }

    body.querySelector('#panel-color').addEventListener('input', (e) => updateAppearance('panelColor', e.target.value));

    body.querySelector('#opacity-range').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#opacity-val').textContent = val + '%';
      updateAppearance('panelOpacity', val / 100);
    });

    body.querySelector('#blur-range').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#blur-val').textContent = val + 'px';
      updateAppearance('panelBlur', val);
    });

    body.querySelector('#border-color').addEventListener('input', (e) => updateAppearance('panelBorderColor', e.target.value));

    body.querySelector('#border-opacity').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#border-opacity-val').textContent = val + '%';
      updateAppearance('panelBorderOpacity', val / 100);
    });

    body.querySelector('#height-range').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#height-val').textContent = val + 'px';
      updateAppearance('panelHeight', val);
    });

    const mY = body.querySelector('#margin-y-range');
    const mX = body.querySelector('#margin-x-range');

    const updateDockMode = () => {
      const panel = document.getElementById('everest-panel');
      if (panel) panel.classList.toggle('is-dock', parseInt(mY.value) > 0 || parseInt(mX.value) > 0);
    };

    mY.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#margin-y-val').textContent = val + 'px';
      updateAppearance('panelMarginY', val);
      updateDockMode();
    });

    mX.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#margin-x-val').textContent = val + 'px';
      updateAppearance('panelMarginX', val);
      updateDockMode();
    });

    body.querySelector('#radius-range').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      body.querySelector('#radius-val').textContent = val + 'px';
      updateAppearance('panelRadius', val);
    });

    const modeGroup = body.querySelector('#panel-mode-group');
    const updateModeButtons = () => {
      const isDock = parseInt(mY.value) > 0 || parseInt(mX.value) > 0;
      modeGroup.querySelectorAll('button').forEach(btn => {
        const isActive = (btn.dataset.mode === 'dock' && isDock) || (btn.dataset.mode === 'full' && !isDock);
        btn.className = isActive ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
      });
    };
    updateModeButtons();

    modeGroup.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const heightSlider = body.querySelector('#height-range');
        const radiusSlider = body.querySelector('#radius-range');
        if (btn.dataset.mode === 'full') {
          mY.value = 0;
          mX.value = 0;
          heightSlider.value = 42;
          radiusSlider.value = 0;
        } else {
          mY.value = 12;
          mX.value = 60;
          heightSlider.value = 48;
          radiusSlider.value = 12;
        }
        mY.dispatchEvent(new Event('input'));
        mX.dispatchEvent(new Event('input'));
        heightSlider.dispatchEvent(new Event('input'));
        radiusSlider.dispatchEvent(new Event('input'));
        updateModeButtons();
      };
    });
  };

  const renderSection = async (id) => {
    body.innerHTML = '';

    if (id === 'appearance') {
      renderAppearance();
    } else if (id === 'panel') {
      renderPanel();
    } else if (id === 'menu') {
      await renderMenu();
    } else if (id === 'desktop') {
      await renderDesktop();
    } else if (id === 'display') {
      renderDisplay();
    } else if (id === 'extensions') {
      renderExtensions();
    } else if (id === 'startup') {
      await renderStartup();
    } else if (id === 'storage') {
      await renderStorage();
    } else if (id === 'users') {
      renderUsers();
    } else if (id === 'about') {
      renderAbout();
    }
  };
  const renderStartup = async () => {
    body.innerHTML = `
      <div class="settings-section-title">Startup Applications</div>
      <div id="startup-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;

    const list = body.querySelector('#startup-list');
    let startupApps = [];
    try {
      const saved = await vfs.readFile('~/.config/startup.json');
      if (saved) startupApps = JSON.parse(saved);
    } catch (e) { }

    const apps = appLoader.getApps();

    const renderList = () => {
      list.innerHTML = '';
      apps.forEach(app => {
        const isEnabled = startupApps.includes(app.id);
        const card = document.createElement('div');
        card.className = 'settings-card';
        card.style.margin = '0';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="font-size:24px;">${IconHelper.getIcon((app.icon || 'archive') + ',📦', { size: 24 })}</div>
              <div>
                <div style="font-weight:600;">${app.name}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${app.id}</div>
              </div>
            </div>
            <input type="checkbox" ${isEnabled ? 'checked' : ''} id="toggle-${app.id}">
          </div>
        `;
        card.querySelector('input').onchange = async (e) => {
          if (e.target.checked) {
            if (!startupApps.includes(app.id)) startupApps.push(app.id);
          } else {
            startupApps = startupApps.filter(id => id !== app.id);
          }
          await vfs.writeFile('~/.config/startup.json', JSON.stringify(startupApps));
        };
        list.appendChild(card);
      });
    };
    renderList();
  };

  const SYSTEM_CONFIG = {
    storageLimitServer: typeof __STORAGE_LIMIT_SERVER__ !== 'undefined' ? __STORAGE_LIMIT_SERVER__ : 2048 * 1024 * 1024,
    storageLimitLocal: typeof __STORAGE_LIMIT_LOCAL__ !== 'undefined' ? __STORAGE_LIMIT_LOCAL__ : 100 * 1024 * 1024,
  };

  // ── Cross-mode VFS backup helper ────────────────────────────────────
  const performVfsBackup = async () => {
    const files = [];
    const walk = async (dir) => {
      try {
        const items = await vfs.readdir(dir);
        for (const item of items) {
          if (item.type === 'dir') {
            files.push({ path: item.path, type: 'dir' });
            await walk(item.path);
          } else {
            try {
              const content = await vfs.readFile(item.path);
              files.push({ path: item.path, type: 'file', content, size: content.length });
            } catch { }
          }
        }
      } catch { }
    };
    await walk('/');
    return { version: '1.0', os: 'EverestOS', timestamp: new Date().toISOString(), fileCount: files.length, files };
  };

  const performVfsRestore = async (backupData) => {
    return await vfs.importBackup(backupData);
  };

  const detectStorageMode = async () => {
    try {
      const info = await vfs.getInfo();
      if (info && info.root !== 'browser-storage') return { mode: 'server', label: 'Server File System', color: '#44ff44', persistent: true };
    } catch { }
    if (vfs.db) return { mode: 'indexeddb', label: 'IndexedDB (Browser Storage)', color: '#ffaa00', persistent: false };
    if (vfs.useLocalStorage) return { mode: 'localstorage', label: 'LocalStorage', color: '#ff6644', persistent: false };
    return { mode: 'memory', label: 'In-Memory (Volatile)', color: '#ff4444', persistent: false };
  };

  const renderStorage = async () => {
    const fsInfo = await vfs.getInfo();
    const isServer = fsInfo.root !== 'browser-storage';
    const storageInfo = await detectStorageMode();

    body.innerHTML = `
      <div class="settings-section-title">Virtual File System</div>
      <div class="settings-card">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Disk Usage</span>
          <span id="storage-val" style="font-family:var(--font-mono); font-size:12px;">Calculating...</span>
        </div>
        <div style="height:10px; background:var(--bg-active); border-radius:5px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.3);">
          <div id="storage-bar" style="height:100%; width:0%; background:linear-gradient(90deg, var(--accent), ${storageInfo.color}); transition:width 0.8s cubic-bezier(0.4,0,0.2,1);"></div>
        </div>

        <div style="margin-top:16px; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
            <div style="width:10px; height:10px; border-radius:50%; background:${storageInfo.color}; box-shadow:0 0 8px ${storageInfo.color};"></div>
            <div>
              <div style="font-size:13px; font-weight:600;">Active Backend: ${storageInfo.label}</div>
              <div style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">
                ${storageInfo.persistent
        ? '✅ Files persist on disk — safe across reloads and browser clears'
        : '⚠️ Files stored in browser — survive reload, but may be lost if browser data is cleared'}
              </div>
            </div>
          </div>
          <div id="storage-file-count" style="font-size:11px; color:var(--text-secondary); padding:0 4px;">Counting files...</div>
        </div>
      </div>

      <div class="settings-section-title">Backup & Recovery</div>
      <div class="settings-card" style="display:flex; flex-direction:column; gap:12px;">
        <p style="font-size:12px; color:var(--text-secondary); margin:0;">
          Export a portable backup that works across all storage modes. A backup from IndexedDB can be restored to Server FS and vice versa.
        </p>
        <div style="display:flex; gap:12px;">
          <button id="btn-export-vfs" class="btn-secondary" style="flex:1; padding:10px; display:flex; align-items:center; justify-content:center; gap:8px;">📤 Export Backup</button>
          <button id="btn-import-vfs" class="btn-secondary" style="flex:1; padding:10px; display:flex; align-items:center; justify-content:center; gap:8px;">📥 Import Backup</button>
        </div>
        <div id="backup-status" style="font-size:11px; color:var(--text-tertiary); display:none; padding:8px 12px; background:rgba(0,0,0,0.1); border-radius:6px;"></div>
        <input type="file" id="import-vfs-file" style="display:none;" accept=".json">
      </div>

      <div class="settings-section-title" style="color:#ff4444;">Danger Zone</div>
      <div class="settings-card" style="border:1px solid rgba(255,68,68,0.3);">
        <p style="font-size:13px; margin-bottom:16px;">Resetting the system will clear all virtual files, settings, and installed plugins. This action cannot be undone.</p>
        <button id="btn-reset-system" class="btn-danger" style="width:100%;">Reset System & Reload</button>
      </div>
    `;

    const storageVal = body.querySelector('#storage-val');
    const storageBar = body.querySelector('#storage-bar');
    const fileCountEl = body.querySelector('#storage-file-count');
    const backupStatus = body.querySelector('#backup-status');

    const showStatus = (msg) => {
      backupStatus.style.display = 'block';
      backupStatus.textContent = msg;
    };

    const calculateSize = async () => {
      let total = 0;
      let fileCount = 0;
      const scan = async (path) => {
        try {
          const items = await vfs.readdir(path);
          for (const item of items) {
            if (item.type === 'dir') await scan(item.path);
            else { total += item.size || 0; fileCount++; }
          }
        } catch (e) { }
      };
      await scan('/');

      const max = isServer ? SYSTEM_CONFIG.storageLimitServer : SYSTEM_CONFIG.storageLimitLocal;
      const percent = Math.min(100, (total / max) * 100);
      storageVal.textContent = `${(total / 1024 / 1024).toFixed(2)} MB of ${(max / 1024 / 1024).toFixed(0)} MB used`;
      storageBar.style.width = percent + '%';
      fileCountEl.textContent = `${fileCount} files indexed`;
    };
    calculateSize();

    // ── Cross-mode Export ─────────────────────────────────────────────
    body.querySelector('#btn-export-vfs').onclick = async () => {
      try {
        showStatus('⏳ Collecting files...');
        const backup = await performVfsBackup();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `everest-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showStatus(`✅ Backup downloaded — ${backup.fileCount} files, ${(blob.size / 1024).toFixed(1)} KB`);
      } catch (e) {
        showStatus(`❌ Export failed: ${e.message}`);
      }
    };

    // ── Cross-mode Import ─────────────────────────────────────────────
    const importInput = body.querySelector('#import-vfs-file');
    body.querySelector('#btn-import-vfs').onclick = () => importInput.click();

    importInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const raw = JSON.parse(ev.target.result);

          // Support both legacy (raw array) and new (object with .files) format
          let backupData;
          if (Array.isArray(raw)) {
            backupData = { files: raw, timestamp: 'legacy', os: 'unknown' };
          } else if (raw.files) {
            backupData = raw;
          } else {
            throw new Error('Invalid backup format');
          }

          if (confirm(`Restore ${backupData.files.length} items from ${backupData.os || 'unknown'} (${backupData.timestamp || 'unknown'})? This will write files to the active storage backend.`)) {
            showStatus('⏳ Restoring files...');
            const { restored, errors } = await performVfsRestore(backupData);
            showStatus(`✅ Restored ${restored} items${errors > 0 ? `, ${errors} errors` : ''}. Reloading...`);
            setTimeout(() => location.reload(), 1500);
          }
        } catch (err) {
          showStatus(`❌ Import failed: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };

    body.querySelector('#btn-reset-system').onclick = async () => {
      if (confirm('Are you absolutely sure you want to reset the system? ALL DATA WILL BE LOST.')) {
        const req = indexedDB.deleteDatabase('PlaygroundVFS');
        req.onsuccess = () => location.reload();
        req.onerror = () => alert('Failed to clear database.');
      }
    };
  };

  const renderMenu = async () => {
    // Load current menu settings
    let settings = {
      icon: 'menu',
      showLabel: true,
      menuWidth: 420,
      menuOpacity: 0.85,
      menuBlur: 20,
      showCategoryIcons: true,
      enableSearch: true,
      iconSize: 28
    };

    try {
      const savedStr = await vfs.readFile('~/.config/menu.json');
      if (savedStr) settings = { ...settings, ...JSON.parse(savedStr) };
    } catch (e) { }

    const save = async () => {
      await vfs.writeFile('~/.config/menu.json', JSON.stringify(settings, null, 2));
      // Notify AppMenu to reload
      document.dispatchEvent(new CustomEvent('reload-menu-settings'));
    };

    body.innerHTML = `
      <div class="settings-section-title">Menu Button</div>
      <div class="settings-card">
        <div class="settings-row" style="align-items:center; margin-bottom:12px;">
          <div style="flex:1;">
            <label style="display:block; margin-bottom:4px;">Menu Icon</label>
            <div style="font-size:11px; color:var(--text-secondary);">Choose an emoji or custom image</div>
          </div>
          <div id="icon-preview" style="width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:var(--bg-surface-hover); border:1px solid var(--border); border-radius:10px; cursor:pointer; font-size:24px; transition:all 0.2s;"></div>
        </div>

        <div id="icon-selector" style="display:none; border-top:1px solid var(--border); padding-top:16px; margin-top:16px;">
          <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; margin-bottom:16px;" id="emoji-grid">
            ${['🌿', '🔮', '🍉', '🍕', '🚀', '⭐', '🌈', '🔥', '⚙️', '🖥️', '🐧', '🛸', '🍎', '🍓', '🏀', '🎮', '💡', '🔔'].map(e => `<div class="emoji-item" style="font-size:20px; cursor:pointer; padding:8px; text-align:center; border-radius:8px; background:var(--bg-surface-hover); border:1px solid var(--border);">${e}</div>`).join('')}
          </div>

          <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Custom Icons (~/images/icons)</div>
          <div id="custom-icon-grid" style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; margin-bottom:16px;"></div>

          <button class="btn-secondary" style="width:100%;" id="btn-browse-custom">Browse for other image...</button>
          <div style="height:8px;"></div>
          <button class="btn-secondary" style="width:100%; color:var(--accent);" id="btn-theme-default">Use Theme Default</button>
        </div>

        <div style="height:1px; background:var(--border); margin:16px 0;"></div>

        <div class="settings-row">
          <label>Show Text Label</label>
          <input type="checkbox" id="show-label" ${settings.showLabel !== false ? 'checked' : ''}>
        </div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px; margin-top:12px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Icon Size</label>
            <span id="icon-size-val">${settings.iconSize}px</span>
          </div>
          <input type="range" id="icon-size-range" min="16" max="48" value="${settings.iconSize}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Menu Appearance</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:12px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Menu Width</label>
            <span id="width-val">${settings.menuWidth}px</span>
          </div>
          <input type="range" id="width-range" min="320" max="640" value="${settings.menuWidth}" style="width:100%;">

          <div style="height:8px;"></div>

          <div style="display:flex; justify-content:space-between;">
            <label>Background Blur</label>
            <span id="menu-blur-val">${settings.menuBlur}px</span>
          </div>
          <input type="range" id="menu-blur-range" min="0" max="64" value="${settings.menuBlur}" style="width:100%;">

          <div style="height:8px;"></div>

          <div style="display:flex; justify-content:space-between;">
            <label>Background Opacity</label>
            <span id="menu-opacity-val">${Math.round(settings.menuOpacity * 100)}%</span>
          </div>
          <input type="range" id="menu-opacity-range" min="40" max="100" value="${Math.round(settings.menuOpacity * 100)}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Features</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Enable Search</label>
          <input type="checkbox" id="enable-search" ${settings.enableSearch !== false ? 'checked' : ''}>
        </div>
        <div class="settings-row">
          <label>Show Categories</label>
          <input type="checkbox" id="show-categories" ${settings.showCategoryIcons !== false ? 'checked' : ''}>
        </div>
      </div>
    `;

    const iconPreview = body.querySelector('#icon-preview');
    const iconSelector = body.querySelector('#icon-selector');
    const customGrid = body.querySelector('#custom-icon-grid');

    const updatePreview = () => {
      const icon = settings.icon;
      iconPreview.innerHTML = IconHelper.getIcon(icon, { size: 28 });
    };
    updatePreview();

    iconPreview.onclick = () => {
      const isVisible = iconSelector.style.display === 'block';
      iconSelector.style.display = isVisible ? 'none' : 'block';
      iconPreview.style.borderColor = isVisible ? 'var(--border)' : 'var(--accent)';
      if (!isVisible) scanCustomIcons();
    };

    const scanCustomIcons = async () => {
      customGrid.innerHTML = '<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">Scanning...</div>';
      try {
        const items = await vfs.readdir('~/images/icons');
        customGrid.innerHTML = '';
        items.forEach(item => {
          if (item.type === 'dir' || !item.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return;
          const btn = document.createElement('div');
          btn.style.cssText = `
            height: 40px;
            border-radius: 6px;
            background: var(--bg-surface-hover);
            border: 1px solid var(--border);
            cursor: pointer;
            background-image: url("${vfs.getFsPath(item.path)}");
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
          `;
          btn.onclick = () => {
            settings.icon = item.path;
            updatePreview();
            save();
          };
          customGrid.appendChild(btn);
        });
        if (items.length === 0) customGrid.innerHTML = '<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">No icons in ~/images/icons</div>';
      } catch (e) {
        customGrid.innerHTML = '<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">Failed to scan icons</div>';
      }
    };

    body.querySelectorAll('.emoji-item').forEach(el => {
      el.onclick = () => {
        settings.icon = el.textContent;
        updatePreview();
        save();
      };
    });

    body.querySelector('#btn-browse-custom').onclick = async () => {
      const path = await ctx.filePicker.pickFile({
        title: 'Select Menu Icon',
        initialPath: '~/images/icons',
        filter: (item) => item.type === 'dir' || item.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
      });
      if (path) {
        settings.icon = path;
        updatePreview();
        save();
      }
    };

    body.querySelector('#btn-theme-default').onclick = () => {
      settings.icon = 'menu';
      updatePreview();
      save();
    };

    body.querySelector('#show-label').onchange = (e) => {
      settings.showLabel = e.target.checked;
      save();
    };

    body.querySelector('#icon-size-range').oninput = (e) => {
      const val = e.target.value;
      settings.iconSize = parseInt(val);
      body.querySelector('#icon-size-val').textContent = val + 'px';
      save();
    };

    body.querySelector('#width-range').oninput = (e) => {
      const val = e.target.value;
      settings.menuWidth = parseInt(val);
      body.querySelector('#width-val').textContent = val + 'px';
      save();
    };

    body.querySelector('#menu-blur-range').oninput = (e) => {
      const val = e.target.value;
      settings.menuBlur = parseInt(val);
      body.querySelector('#menu-blur-val').textContent = val + 'px';
      save();
    };

    body.querySelector('#menu-opacity-range').oninput = (e) => {
      const val = e.target.value;
      settings.menuOpacity = parseInt(val) / 100;
      body.querySelector('#menu-opacity-val').textContent = val + '%';
      save();
    };

    body.querySelector('#enable-search').onchange = (e) => {
      settings.enableSearch = e.target.checked;
      save();
    };

    body.querySelector('#show-categories').onchange = (e) => {
      settings.showCategoryIcons = e.target.checked;
      save();
    };
  };

  // --- Sections ---

  const renderAppearance = () => {
    const s = {
      shellTheme: appearanceSettings.shellTheme || 'dark',
      appTheme: appearanceSettings.appTheme || 'dark',
      ctxColor: appearanceSettings.contextMenuColor || '#19191e',
      ctxOpacity: appearanceSettings.contextMenuOpacity !== undefined ? appearanceSettings.contextMenuOpacity : 0.97,
      ctxBlur: appearanceSettings.contextMenuBlur !== undefined ? appearanceSettings.contextMenuBlur : 24,
      radius: appearanceSettings.panelRadius || 10
    };

    const currentBaseId = themeManager.currentTheme.replace('-dark', '');
    const hasVariants = themeManager.themes.has(currentBaseId) && themeManager.themes.has(`${currentBaseId}-dark`);

    body.innerHTML = `
      <div class="settings-section-title">Desktop Skin</div>
      <div id="theme-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:16px; margin-bottom:16px;"></div>

      <div class="settings-card" style="margin-bottom:24px;">
        <div class="settings-row">
          <label style="font-weight:600; font-size:12px; color:var(--text-secondary); text-transform:uppercase;">Global Appearance</label>
          <div style="display:flex; gap:10px; background:var(--bg-input); padding:4px; border-radius:8px; border:1px solid var(--border); ${!hasVariants ? 'opacity:0.5; pointer-events:none; filter:grayscale(1);' : ''}" id="master-mode-group">
            <button class="btn-sm ${themeManager.preferredMode === 'light' ? 'btn-primary' : 'btn-secondary'}" style="flex:1; border:none;" data-mode="light">Light</button>
            <button class="btn-sm ${themeManager.preferredMode === 'dark' ? 'btn-primary' : 'btn-secondary'}" style="flex:1; border:none;" data-mode="dark">Dark</button>
          </div>
        </div>
        <div style="margin-top:10px; font-size:11px; color:var(--text-tertiary); display:flex; align-items:center; gap:6px;">
          ${IconHelper.getIcon('info,ℹ️', { size: 14, symbolic: true })}
          <span>${hasVariants
        ? 'Automatically switches both desktop skin and icons to their preferred variant.'
        : 'The current theme does not support adaptive mode switching.'}</span>
        </div>
      </div>

      <div class="settings-section-title">Icon Theme</div>
      <div id="icon-theme-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:16px; margin-bottom:24px;"></div>
      <div class="settings-section-title">Context Menu Styles</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Background Color</label>
            <input type="color" id="ctx-color" value="${s.ctxColor}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Opacity</label>
            <span id="ctx-opacity-val">${Math.round(s.ctxOpacity * 100)}%</span>
          </div>
          <input type="range" id="ctx-opacity" min="0" max="100" value="${Math.round(s.ctxOpacity * 100)}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Blur</label>
            <span id="ctx-blur-val">${s.ctxBlur}px</span>
          </div>
          <input type="range" id="ctx-blur" min="0" max="64" value="${s.ctxBlur}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">General Effects</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Corner Radius</label>
            <span id="radius-val">${s.radius}px</span>
          </div>
          <input type="range" id="radius-range" min="0" max="32" value="${s.radius}" style="width:100%;">
        </div>
      </div>
    `;

    const root = document.documentElement;
    const hexToRgba = (hex, opacity) => {
      if (!hex || !hex.startsWith('#')) return hex;
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const modeGroup = body.querySelector('#master-mode-group');
    modeGroup.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.dataset.mode;
        themeManager.setMode(mode);
        renderAppearance(); // Refresh the whole view to update cards and buttons
      };
    });

    const updateSetting = async (key, val) => {
      appearanceSettings[key] = val;
      await saveAppearanceSettings();

      if (key === 'contextMenuColor' || key === 'contextMenuOpacity') {
        if (appearanceSettings.appTheme !== 'light') {
          root.style.setProperty('--bg-context-menu-rgba', hexToRgba(appearanceSettings.contextMenuColor || '#19191e', appearanceSettings.contextMenuOpacity !== undefined ? appearanceSettings.contextMenuOpacity : 0.97));
        }
      } else if (key === 'contextMenuBlur') {
        root.style.setProperty('--context-menu-blur', val + 'px');
      } else if (key === 'panelRadius') {
        root.style.setProperty('--radius-main', val + 'px');
        root.style.setProperty('--radius-md', val + 'px');
      }
    };



    body.querySelector('#ctx-color').addEventListener('input', e => updateSetting('contextMenuColor', e.target.value));
    body.querySelector('#ctx-opacity').addEventListener('input', e => {
      const val = parseInt(e.target.value);
      body.querySelector('#ctx-opacity-val').textContent = val + '%';
      updateSetting('contextMenuOpacity', val / 100);
    });
    body.querySelector('#ctx-blur').addEventListener('input', e => {
      const val = parseInt(e.target.value);
      body.querySelector('#ctx-blur-val').textContent = val + 'px';
      updateSetting('contextMenuBlur', val);
    });

    const radiusRange = body.querySelector('#radius-range');
    radiusRange.addEventListener('input', e => {
      const val = parseInt(e.target.value);
      body.querySelector('#radius-val').textContent = val + 'px';
      updateSetting('panelRadius', val);
    });

    const themeGrid = body.querySelector('#theme-grid');
    const updateThemes = () => {
      themeGrid.innerHTML = '';
      const allThemes = themeManager.getThemes();
      const baseThemes = allThemes.filter(t => {
        // If it's a -dark variant, only show it if the base version doesn't exist
        if (t.id.endsWith('-dark')) {
          const baseId = t.id.replace('-dark', '');
          return !allThemes.some(ot => ot.id === baseId);
        }
        return true;
      });

      baseThemes.forEach(theme => {
        const card = document.createElement('div');
        // A theme is active if either the base or its dark variant is active
        const isActive = themeManager.currentTheme === theme.id || themeManager.currentTheme === `${theme.id}-dark`;

        // Use the variant that matches the current preferred mode for the preview
        const isDark = themeManager.preferredMode === 'dark';
        const displayId = (isDark && themeManager.themes.has(`${theme.id}-dark`)) ? `${theme.id}-dark` : theme.id;
        const displayTheme = themeManager.themes.get(displayId) || theme;

        const bg = displayTheme.variables['--bg-surface-rgb'] ? `rgb(${displayTheme.variables['--bg-surface-rgb']})` : (displayTheme.mode === 'light' ? '#f0f0f0' : '#1e1e1e');
        const text = displayTheme.variables['--text-primary-rgb'] ? `rgb(${displayTheme.variables['--text-primary-rgb']})` : (displayTheme.mode === 'light' ? '#222' : '#eee');
        const accent = displayTheme.variables['--accent-rgb'] ? `rgb(${displayTheme.variables['--accent-rgb']})` : '#3584e4';

        card.style.cssText = `
          background: ${bg};
          color: ${text};
          border: 2px solid ${isActive ? 'var(--accent)' : 'rgba(0,0,0,0.1)'};
          border-radius: 14px;
          padding: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${isActive ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
          transform: ${isActive ? 'scale(1.05)' : 'scale(1)'};
          position: relative;
          overflow: hidden;
        `;

        card.innerHTML = `
          <div style="width:100%; height:60px; background:${accent}; border-radius:8px; position:relative; overflow:hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.1);">
            <div style="position:absolute; bottom:0; left:0; right:0; height:12px; background:rgba(0,0,0,0.2); backdrop-filter:blur(4px);"></div>
            <div style="position:absolute; top:8px; left:8px; width:24px; height:4px; background:rgba(255,255,255,0.3); border-radius:2px;"></div>
          </div>
          <span style="font-size:11px; font-weight:700; text-align:center; letter-spacing:0.3px;">${theme.name.replace('-Dark', '').replace('-Y', 'Y')}</span>
          ${isActive ? '<div style="position:absolute; top:6px; right:6px; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow: 0 0 8px var(--accent);"></div>' : ''}
        `;

        card.onmouseover = () => { if (!isActive) card.style.transform = 'translateY(-4px)'; };
        card.onmouseout = () => { if (!isActive) card.style.transform = 'scale(1)'; };

        card.addEventListener('click', () => {
          themeManager.applyTheme(theme.id, { ignoreMode: false });
          renderAppearance();
        });
        themeGrid.appendChild(card);
      });
    };

    const iconThemeGrid = body.querySelector('#icon-theme-grid');
    const updateIconThemes = () => {
      iconThemeGrid.innerHTML = '';
      themeManager.getIconThemes().forEach(theme => {
        const card = document.createElement('div');
        const isActive = themeManager.currentIconTheme === theme.id;
        card.style.cssText = `
          background: var(--bg-card);
          border: 2px solid ${isActive ? 'var(--accent)' : 'var(--border)'};
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${isActive ? '0 8px 24px rgba(0,0,0,0.15)' : 'none'};
          transform: ${isActive ? 'scale(1.05)' : 'scale(1)'};
          position: relative;
        `;

        const folderIcon = IconHelper.getIcon('folder,📁', { size: 32 });

        card.innerHTML = `
          <div style="width:100%; height:60px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg, var(--bg-elevated), var(--bg-card)); border-radius:10px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);">
            ${folderIcon}
          </div>
          <span style="font-size:11px; font-weight:700; color:var(--text-primary);">${theme.name}</span>
          ${isActive ? '<div style="position:absolute; top:8px; right:8px; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow: 0 0 8px var(--accent);"></div>' : ''}
        `;

        card.onmouseover = () => { if (!isActive) card.style.transform = 'translateY(-4px)'; };
        card.onmouseout = () => { if (!isActive) card.style.transform = 'scale(1)'; };

        card.addEventListener('click', () => {
          themeManager.applyIconTheme(theme.id);
          updateIconThemes();
          // Also broadcast to desktop and file manager if they are listening
          window.dispatchEvent(new CustomEvent('icon-theme-changed', { detail: { theme } }));
        });
        iconThemeGrid.appendChild(card);
      });
    };

    updateThemes();
    updateIconThemes();

  };

  const renderDesktop = async () => {
    body.innerHTML = `
      <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid var(--border); padding-bottom:8px;">
        <button class="btn-secondary btn-sm active" id="tab-bg">Background</button>
        <button class="btn-secondary btn-sm" id="tab-icons">Icons & Layout</button>
      </div>
      <div id="desktop-content"></div>
    `;

    const content = body.querySelector('#desktop-content');
    const tabBg = body.querySelector('#tab-bg');
    const tabIcons = body.querySelector('#tab-icons');

    const renderBackgroundTab = async () => {
      content.innerHTML = `
        <div class="settings-section-title">Solid & Gradients</div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:20px;" id="grad-grid"></div>

        <div class="settings-section-title">Wallpapers</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:20px;" id="wallpaper-grid"></div>

        <button class="btn-secondary" style="width:100%;" id="btn-browse-bg">Browse for image...</button>
      `;

      const gradGrid = content.querySelector('#grad-grid');
      const gradients = [
        'linear-gradient(135deg, #2c3e50, #3498db)',
        'linear-gradient(135deg, #1e130c, #9a8478)',
        'linear-gradient(135deg, #43cea2, #185a9d)',
        'linear-gradient(135deg, #ff4b1f, #ff9068)',
        '#242424',
        '#1a1a1a',
        '#3584e4',
        '#26a269',
      ];

      gradients.forEach(grad => {
        const item = document.createElement('div');
        item.style.height = '50px';
        item.style.borderRadius = '6px';
        item.style.background = grad;
        item.style.cursor = 'pointer';
        item.style.border = '2px solid transparent';
        item.onclick = () => {
          ctx.desktopSettings.settings.background = grad;
          ctx.desktopSettings._applyBackground();
          ctx.desktopSettings._save();
          gradGrid.querySelectorAll('div').forEach(d => d.style.borderColor = 'transparent');
          item.style.borderColor = 'var(--accent)';
        };
        gradGrid.appendChild(item);
      });

      const wpGrid = content.querySelector('#wallpaper-grid');

      const loadWallpapers = async () => {
        wpGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-tertiary);">Scanning for images...</div>';

        const scanPaths = ['~/images/backgrounds'];
        let allWallpapers = [];

        for (const path of scanPaths) {
          try {
            const items = await vfs.readdir(path);
            items.forEach(item => {
              if (item.type !== 'dir' && item.name.match(/\.(png|jpg|jpeg|webp)$/i)) {
                // Construct accessible URL
                let url = item.path || `${path}/${item.name}`;
                const finalUrl = vfs.getFsPath(url);
                allWallpapers.push({ name: item.name, path: finalUrl });
              }
            });
          } catch (e) { console.warn(`Failed to scan wallpapers in ${path}`, e); }
        }

        wpGrid.innerHTML = '';
        if (allWallpapers.length === 0) {
          wpGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-tertiary);">No backgrounds found.</div>';
          return;
        }

        allWallpapers.forEach(wp => {
          const item = document.createElement('div');
          item.className = 'wallpaper-item';
          item.style.cssText = `
            height: 100px;
            border-radius: 6px;
            background-image: url("${wp.path}");
            background-size: cover;
            background-position: center;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
          `;
          if (ctx.desktopSettings.settings.background.includes(wp.path)) {
            item.style.borderColor = 'var(--accent)';
          }
          item.onclick = () => {
            ctx.desktopSettings.settings.background = `url("${wp.path}")`;
            ctx.desktopSettings._applyBackground();
            ctx.desktopSettings._save();
            wpGrid.querySelectorAll('.wallpaper-item').forEach(i => i.style.borderColor = 'transparent');
            item.style.borderColor = 'var(--accent)';
          };
          wpGrid.appendChild(item);
        });
      };

      loadWallpapers();

      content.querySelector('#btn-browse-bg').addEventListener('click', async () => {
        const path = await ctx.filePicker.pickFile({
          title: 'Select Background Image',
          initialPath: '~/images/backgrounds',
          filter: (item) => item.type === 'dir' || item.name.match(/\.(png|jpg|jpeg|webp)$/i)
        });

        if (path) {
          ctx.desktopSettings.settings.background = `url("${path}")`;
          ctx.desktopSettings._applyBackground();
          ctx.desktopSettings._save();
          // Reload grid to show new selection if it's in the scanned folders
          loadWallpapers();
        }
      });
    };

    const renderIconsTab = () => {
      const s = ctx.desktopSettings.settings;
      content.innerHTML = `
        <div class="settings-section-title">Icon Settings</div>
        <div class="settings-card">
          <div class="settings-row">
            <label>Grid Size</label>
            <input type="range" id="grid-size" min="60" max="140" value="${s.gridSize || 90}">
          </div>
          <div class="settings-row">
            <label>Icon Size</label>
            <input type="range" id="icon-size" min="24" max="64" value="${s.iconSize || 32}">
          </div>
        </div>

        <div class="settings-section-title">Visibility</div>
        <div class="settings-card">
          <div class="settings-row">
            <label>Show Home folder</label>
            <input type="checkbox" id="show-home" ${s.showHome !== false ? 'checked' : ''}>
          </div>
          <div class="settings-row">
            <label>Show Computer</label>
            <input type="checkbox" id="show-computer" ${s.showComputer !== false ? 'checked' : ''}>
          </div>
          <div class="settings-row">
            <label>Show Trash</label>
            <input type="checkbox" id="show-trash" ${s.showTrash !== false ? 'checked' : ''}>
          </div>
        </div>
      `;

      content.querySelector('#grid-size').oninput = (e) => {
        s.gridSize = parseInt(e.target.value);
        ctx.desktopSettings._save();
        ctx.vfs._emit('/home/user/Desktop');
      };
      content.querySelector('#icon-size').oninput = (e) => {
        s.iconSize = parseInt(e.target.value);
        ctx.desktopSettings._save();
        ctx.vfs._emit('/home/user/Desktop');
      };
      content.querySelector('#show-home').onchange = (e) => {
        s.showHome = e.target.checked;
        ctx.desktopSettings._save();
        ctx.vfs._emit('/home/user/Desktop');
      };
      content.querySelector('#show-computer').onchange = (e) => {
        s.showComputer = e.target.checked;
        ctx.desktopSettings._save();
        ctx.vfs._emit('/home/user/Desktop');
      };
      content.querySelector('#show-trash').onchange = (e) => {
        s.showTrash = e.target.checked;
        ctx.desktopSettings._save();
        ctx.vfs._emit('/home/user/Desktop');
      };
    };

    tabBg.onclick = () => {
      tabBg.classList.add('active');
      tabIcons.classList.remove('active');
      renderBackgroundTab();
    };
    tabIcons.onclick = () => {
      tabIcons.classList.add('active');
      tabBg.classList.remove('active');
      renderIconsTab();
    };

    if (options.args && options.args[1] === 'icons') {
      tabIcons.onclick();
    } else {
      await renderBackgroundTab();
    }
  };

  const renderDisplay = async () => {
    let displaySettings = {
      scaling: '100%',
      nightLight: false
    };

    try {
      const saved = await vfs.readFile('~/.config/display.json');
      if (saved) displaySettings = JSON.parse(saved);
    } catch (e) { }

    const save = async () => {
      await vfs.writeFile('~/.config/display.json', JSON.stringify(displaySettings));
    };

    body.innerHTML = `
      <div class="settings-section-title">Monitor & Resolution</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Display Scaling</label>
          <select id="scaling-select" style="background:var(--bg-input); border:1px solid var(--border); color:white; padding:4px 8px; border-radius:4px;">
            <option value="100%" ${displaySettings.scaling === '100%' ? 'selected' : ''}>100% (Default)</option>
            <option value="110%" ${displaySettings.scaling === '110%' ? 'selected' : ''}>110%</option>
            <option value="125%" ${displaySettings.scaling === '125%' ? 'selected' : ''}>125%</option>
            <option value="150%" ${displaySettings.scaling === '150%' ? 'selected' : ''}>150%</option>
          </select>
        </div>
        <div class="settings-row">
          <label>Night Light</label>
          <input type="checkbox" id="night-light-toggle" ${displaySettings.nightLight ? 'checked' : ''}>
        </div>
      </div>

      <div class="settings-section-title">Panel Position</div>
      <div class="settings-card">
        <div style="display:flex; gap:10px;" id="panel-pos-group">
          <button class="btn-secondary btn-sm" style="flex:1;" data-pos="top">Top</button>
          <button class="btn-secondary btn-sm" style="flex:1;" data-pos="bottom">Bottom</button>
        </div>
      </div>
    `;

    const scalingSelect = body.querySelector('#scaling-select');
    scalingSelect.onchange = (e) => {
      displaySettings.scaling = e.target.value;
      const scale = parseInt(e.target.value) / 100;
      document.documentElement.style.setProperty('--system-scale', scale);
      save();
    };

    const nlToggle = body.querySelector('#night-light-toggle');
    nlToggle.onchange = (e) => {
      displaySettings.nightLight = e.target.checked;
      document.body.classList.toggle('night-light', displaySettings.nightLight);
      save();
    };

    const posGroup = body.querySelector('#panel-pos-group');
    const updatePosButtons = () => {
      posGroup.querySelectorAll('button').forEach(btn => {
        const isActive = btn.dataset.pos === panelManager.position;
        btn.className = isActive ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
      });
    };
    updatePosButtons();

    posGroup.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        panelManager.position = btn.dataset.pos;
        updatePosButtons();
      };
    });
  };

  const renderExtensions = () => {
    body.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div class="settings-section-title" style="margin-bottom:0;">Plugins & Extensions</div>
        <button id="btn-refresh-plugins" class="btn-secondary btn-sm">↻ Refresh</button>
      </div>
      <div id="extensions-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;

    const list = body.querySelector('#extensions-list');
    const renderList = async () => {
      list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-tertiary);">Scanning...</div>';

      const discovered = await loader.discover();
      list.innerHTML = '';

      discovered.forEach((ext) => {
        const card = document.createElement('div');
        card.className = 'settings-card';
        card.style.margin = '0';

        const typeTag = ext.type.slice(0, -1); // applets -> applet
        const tagColor = ext.type === 'applets' ? '#26a269' : ext.type === 'desklets' ? '#3584e4' : '#9141ac';

        const fallbackIconKey = ext.metadata?.icon ? ext.metadata.icon + ',🧩' : 'plugin,🧩';
        const iconHtml = ext.iconPath ? IconHelper.getIcon(ext.iconPath, { size: 24, symbolic: false }) : IconHelper.getIcon(fallbackIconKey, { size: 24 });

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="font-size:24px;">${iconHtml}</div>
              <div>
                <div style="font-weight:600; display:flex; align-items:center; gap:8px;">
                  ${ext.metadata.name || ext.uuid}
                  <span style="font-size:10px; padding:2px 6px; border-radius:10px; background:${tagColor}33; color:${tagColor}; border:1px solid ${tagColor}66; text-transform:uppercase;">${typeTag}</span>
                </div>
                <div style="font-size:11px; color:var(--text-secondary);">${ext.uuid}</div>
              </div>
            </div>
            <button class="${ext.isLoaded ? 'btn-danger' : 'btn-primary'} btn-sm" id="btn-toggle-${ext.uuid.replace(/@/g, '_')}">
              ${ext.isLoaded ? 'Unload' : 'Load'}
            </button>
          </div>
        `;

        const btnId = `#btn-toggle-${ext.uuid.replace(/@/g, '_')}`;
        const btn = card.querySelector(btnId);
        btn.onclick = async () => {
          btn.disabled = true;
          try {
            if (ext.isLoaded) {
              loader.markAsRemoved(ext.uuid);
              loader.unload(ext.uuid);
            } else {
              if (loader.unmarkAsRemoved) loader.unmarkAsRemoved(ext.uuid);
              await loader.loadFromVfs(ext.uuid, ext.path, ext.type);
            }
            renderList();
          } catch (e) {
            alert(`Failed to ${ext.isLoaded ? 'unload' : 'load'} extension: ${e.message}`);
            btn.disabled = false;
          }
        };

        list.appendChild(card);
      });

      if (discovered.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-tertiary);">No extensions found in ~/Plugins</div>';
      }
    };

    body.querySelector('#btn-refresh-plugins').onclick = renderList;
    renderList();
  };

  const renderUsers = () => {
    body.innerHTML = `
      <div class="settings-section-title">User Accounts</div>
      <div class="settings-card" style="display:flex; align-items:center; gap:16px;">
        <div style="width:64px; height:64px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:32px;">👤</div>
        <div>
          <div style="font-size:18px; font-weight:700;">everest os User</div>
          <div style="font-size:12px; color:var(--text-secondary);">Administrator</div>
        </div>
      </div>
      <button class="btn-secondary">Change Password...</button>
    `;
  };

  const renderAbout = () => {
    body.innerHTML = `
      <div style="text-align:center; padding:20px 0;">
        <div style="margin-bottom:24px; display:inline-flex; align-items:center; justify-content:center; width:120px; height:120px; background:var(--bg-card); border-radius:50%; border:1px solid var(--border); box-shadow:0 4px 15px rgba(0,0,0,0.2); overflow:hidden;">
          ${IconHelper.getIcon('/icons/everest-logo.svg', { size: 180 })}
        </div>
        <h2 style="margin-bottom:4px;">EverestOS</h2>
        <p style="color:var(--text-tertiary); font-size:14px; margin-bottom:24px;">Version 1.2.5</p>

        <div class="settings-card" style="text-align:left; max-width:500px; margin:0 auto 20px auto; line-height:1.5;">
          <div style="font-size:13px; margin-bottom:12px;">
            EverestOS is a modular web-based desktop environment inspired by the <strong>Cinnamon Desktop Environment</strong>.
            It features a robust extension system supporting JS-based <strong>desklets</strong> and <strong>applets</strong> using a custom-ported CJS loader and mock <strong>St</strong> libraries.
          </div>
          <div style="display:flex; justify-content:center; margin-top:16px;">
            <button id="btn-dev-docs" class="btn-primary btn-sm" style="display:flex; align-items:center; gap:6px;">
              ${IconHelper.getIcon('internet', { size: 14 })} Developer Documentation
            </button>
          </div>
        </div>

        <div class="settings-card" style="text-align:left; max-width:500px; margin:0 auto;">
          <div class="settings-row">
            <span style="color:var(--text-secondary);">Kernel</span>
            <span style="font-family:var(--font-mono);">Everest Core (VFS + Event Bus)</span>
          </div>
          <div class="settings-row">
            <span style="color:var(--text-secondary);">Storage</span>
            <span style="font-family:var(--font-mono);">IndexedDB (Browser-Native)</span>
          </div>
          <div class="settings-row">
            <span style="color:var(--text-secondary);">Compatibility</span>
            <span style="font-family:var(--font-mono);">CommonJS (CJS) + Mock GI/St</span>
          </div>
          <div class="settings-row">
            <span style="color:var(--text-secondary);">License</span>
            <span style="font-family:var(--font-mono);">GPL-3.0-or-later</span>
          </div>
        </div>
      </div>
    `;

    body.querySelector('#btn-dev-docs').onclick = () => {
      document.dispatchEvent(new CustomEvent('launch-app', {
        detail: {
          id: 'web-browser',
          args: ['/home/user/Documents/developer-guides.html']
        }
      }));
    };
  };

  sidebar.addEventListener('click', (e) => {
    const item = e.target.closest('.settings-nav-item');
    if (item) setSection(item.dataset.section);
  });

  setSection(initialSection);
}
