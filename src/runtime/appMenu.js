/**
 * App Menu (Start Menu)
 * Manages the application launcher menu that opens from the panel.
 * Dynamically discovers apps from AppLoader.
 */

import { showContextMenu } from './contextMenu.js';
import { showSystemDialog } from './dialog.js';
import { IconHelper } from './iconHelper.js';

export class AppMenu {
  constructor(panelManager, windowManager, extensionLoader, vfs, appLoader, filePicker) {
    this.panelManager = panelManager;
    this.windowManager = windowManager;
    this.extensionLoader = extensionLoader;
    this.vfs = vfs;
    this.appLoader = appLoader;
    this.filePicker = filePicker;
    this.isOpen = false;
    this.overlay = null;
    this.menuElement = null;
    this.settings = {
      icon: 'menu',
      showLabel: true,
      menuWidth: 420,
      menuOpacity: 0.85,
      showCategoryIcons: true,
      enableSearch: true,
      iconSize: 28
    };

  }

  async init() {
    const menuBtn = document.getElementById('panel-menu-button');
    // We no longer abort here if menuBtn is missing, because the modular 
    // menu applet will trigger the menu instead.

    // Make sure icons folder exists
    try {
      await this.vfs.mkdir('~/images/icons');
    } catch (e) { }

    // Load custom menu settings if any
    try {
      const savedStr = await this.vfs.readFile('~/.config/menu.json');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        this.settings = { ...this.settings, ...saved };
        if (this.settings.icon) this._applyMenuIcon(this.settings.icon);
      }
    } catch (e) { }

    document.addEventListener('open-menu-settings', () => {
      this._openMenuSettings();
    });

    document.addEventListener('reload-menu-settings', async () => {
      try {
        const savedStr = await this.vfs.readFile('~/.config/menu.json');
        if (savedStr) {
          const saved = JSON.parse(savedStr);
          this.settings = { ...this.settings, ...saved };
          if (this.settings.icon) this._applyMenuIcon(this.settings.icon);
          this._applyMenuSettings();
        }
      } catch (e) { }
    });

    window.addEventListener('icon-theme-changed', () => {
      if (this.settings.icon) this._applyMenuIcon(this.settings.icon);
    });

    if (menuBtn) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      menuBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.close();

        showContextMenu([
          {
            icon: 'settings,⚙️',
            label: 'Menu Settings',
            action: () => {
              document.dispatchEvent(new CustomEvent('launch-app', {
                detail: { id: 'system-settings', args: ['menu'] }
              }));
            }
          },
          {
            icon: 'info,ℹ️',
            label: 'About Playground OS',
            action: () => {
              document.dispatchEvent(new CustomEvent('launch-app', {
                detail: { id: 'system-settings', args: ['about'] }
              }));
            }
          }
        ], e.clientX, e.clientY, false, menuBtn);
      });
    }

    // Global listener for modular menu applet
    window.addEventListener('everest:toggle-menu', () => {
      this.toggle();
    });
    window.addEventListener('everest:open-menu', () => {
      this.open();
    });
    window.addEventListener('everest:close-menu', () => {
      this.close();
    });

    this._buildMenuUI();
    this._applyMenuSettings();
  }

  _buildMenuUI() {
    this.menuElement = document.createElement('div');
    this.menuElement.classList.add('app-menu');
    this.menuElement.style.display = 'none';
    this.menuElement.style.position = 'fixed';
    this.menuElement.style.left = '0';
    this.menuElement.style.width = '420px';
    this.menuElement.style.maxHeight = '80vh';
    this.menuElement.style.background = 'var(--bg-menu-rgba)';
    this.menuElement.style.backdropFilter = 'blur(var(--menu-blur)) saturate(180%)';
    this.menuElement.style.WebkitBackdropFilter = 'blur(var(--menu-blur)) saturate(180%)';
    this.menuElement.style.borderRight = '1px solid var(--border)';
    this.menuElement.style.zIndex = '10000';
    this.menuElement.style.display = 'none';
    this.menuElement.style.flexDirection = 'column';
    this.menuElement.style.boxShadow = '2px 0 20px rgba(0,0,0,0.5)';

    this.menuElement.innerHTML = `
      <div style="padding:8px 15px; display:flex; flex-direction:column; align-items:center; border-bottom:1px solid var(--border); background:rgba(var(--accent-rgb), 0.05);">
        <div style="display:flex; gap:10px; justify-content:center; width:100%;">
          <button class="menu-quick-icon" data-action="files" title="Files">${IconHelper.getIcon('folder,📂', { size: 18 })}</button>
          <button class="menu-quick-icon" data-action="terminal" title="Terminal">${IconHelper.getIcon('terminal,🐚', { size: 18 })}</button>
          <button class="menu-quick-icon" data-action="settings" title="Settings">${IconHelper.getIcon('settings,⚙️', { size: 18 })}</button>
          <button class="menu-quick-icon" data-action="about" title="About System">${IconHelper.getIcon('info,ℹ️', { size: 18 })}</button>
        </div>
      </div>
      <div style="padding:15px 20px; border-bottom:1px solid var(--border); background:rgba(0,0,0,0.08);">
        <input type="text" placeholder="Search applications..." style="width:100%; padding:12px 18px; border-radius:10px; border:1px solid var(--border); background:var(--bg-input); color:var(--text-primary); font-size:14px; outline:none; transition: all 0.2s; box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);" id="app-search">
      </div>
      <div style="display:flex; flex:1; min-height:0;">
        <div id="app-categories" style="width:160px; border-right:1px solid var(--border); padding:12px; overflow-y:auto; display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.05);"></div>
        <div id="app-grid" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;"></div>
      </div>
      <style>
        .menu-quick-icon {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          width: 36px;
          height: 36px;
        }
        .menu-quick-icon:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent);
          transform: scale(1.1);
        }
        .menu-quick-icon:active {
          transform: translateY(0);
        }
      </style>
    `;

    document.body.appendChild(this.menuElement);

    // Close on outside click
    const closer = (e) => {
      const isMenuBtn = e.target.closest('#panel-menu-button') || e.target.closest('[data-uuid="menu@playground"]');
      const isInsideMenu = this.menuElement.contains(e.target);
      const isInsideSettings = e.target.closest('#settings-overlay') || e.target.closest('#system-settings');
      
      if (this.isOpen && !isInsideMenu && !isInsideSettings) {
        // If it's a right-click, always close the menu
        if (e.type === 'contextmenu') {
          this.close();
        } 
        // If it's a left-click, only close if NOT clicking the menu button (let the button handle toggle)
        else if (!isMenuBtn) {
          this.close();
        }
      }
    };
    document.addEventListener('click', closer, { capture: true });
    document.addEventListener('mousedown', closer, { capture: true });
    document.addEventListener('contextmenu', closer, { capture: true });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Search filter
    this.menuElement.querySelector('#app-search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const gridItems = this.menuElement.querySelectorAll('.app-grid-item');
      gridItems.forEach(item => {
        const title = item.dataset.title?.toLowerCase() || '';
        item.style.display = title.includes(query) ? 'flex' : 'none';
      });
    });

    this.menuElement.querySelectorAll('.menu-quick-icon').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        this.close();

        if (action === 'settings') {
          document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'system-settings' } }));
        } else if (action === 'about') {
          document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'system-settings', args: ['about'] } }));
        } else if (action === 'files') {
          document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'files', args: ['computer://'] } }));
        } else if (action === 'terminal') {
          document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'terminal' } }));
        }
      };
    });
  }

  _renderCategories() {
    const container = this.menuElement.querySelector('#app-categories');
    container.innerHTML = '';

    const categories = this.appLoader.getCategories();
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.classList.add('category-btn');
      btn.style.padding = '10px 14px';
      btn.style.border = 'none';
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-secondary)';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '8px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '500';
      btn.style.textAlign = 'left';
      btn.style.transition = 'all 0.15s';
      btn.onmouseover = () => btn.style.background = 'var(--bg-hover)';
      btn.onmouseout = () => {
        if (!btn.classList.contains('active')) btn.style.background = 'transparent';
      };
      btn.addEventListener('click', () => {
        container.querySelectorAll('.category-btn').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(53, 132, 228, 0.15)';
        btn.style.color = 'var(--text-primary)';
        this._renderAppGrid(cat);
      });
      container.appendChild(btn);
    });

    // Activate first category
    const first = container.querySelector('.category-btn');
    if (first) {
      first.classList.add('active');
      first.style.background = 'rgba(53, 132, 228, 0.15)';
      first.style.color = 'var(--text-primary)';
    }
  }

  _renderAppGrid(category) {
    const grid = this.menuElement.querySelector('#app-grid');
    grid.innerHTML = '';

    const apps = this.appLoader.getAppsByCategory(category);

    apps.forEach(app => {
      const item = document.createElement('div');
      item.classList.add('app-grid-item');
      item.dataset.title = app.name;

      const sourceTag = app.source !== 'builtin'
        ? '<span style="font-size:9px; background:rgba(53,132,228,0.3); padding:1px 5px; border-radius:3px; margin-left:5px; vertical-align:middle;">User</span>'
        : '';

      item.innerHTML = `
        <div class="app-grid-icon">${IconHelper.getIcon((app.icon || 'archive') + ',📦', { size: 36 })}</div>
        <div style="min-width:0;">
          <div class="app-grid-title">${app.name}${sourceTag}</div>
          ${app.description ? `<div class="app-grid-desc">${app.description}</div>` : ''}
        </div>
      `;

      item.addEventListener('click', () => {
        this.close();
        this.appLoader.launchApp(app.id);
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const menuItems = [
          {
            icon: 'shortcut,🔗',
            label: 'Create Desktop Shortcut',
            action: async () => {
              this.close();
              try {
                const shortcut = {
                  type: 'app',
                  id: app.id,
                  name: app.name,
                  icon: app.icon || 'archive,📦'
                };
                await this.vfs.writeFile(`~/Desktop/${app.name}.desktop`, JSON.stringify(shortcut, null, 2));
              } catch (err) {
                showSystemDialog({ title: 'Error', message: 'Failed to create shortcut: ' + err.message, type: 'alert' });
              }
            }
          }
        ];

        if (app.source !== 'builtin') {
          menuItems.push({ separator: true });
          menuItems.push({
            icon: 'trash,🗑️',
            label: 'Uninstall',
            danger: true,
            action: () => {
              showSystemDialog({
                title: 'Uninstall Application',
                message: `Are you sure you want to uninstall "${app.name}"? This will delete the application and all its source files.`,
                type: 'confirm',
                confirmText: 'Uninstall',
                onConfirm: async () => {
                  try {
                    const appPath = this.appLoader.getAppPath(app.id);
                    if (appPath) {
                      await this.vfs.rm(appPath);
                      try { await this.vfs.rm(`~/Desktop/${app.name}.desktop`); } catch (e) { }
                      await this.appLoader.init();
                      this._renderAppGrid(category);
                    }
                  } catch (err) {
                    showSystemDialog({ title: 'Error', message: 'Failed to remove app: ' + err.message, type: 'alert' });
                  }
                }
              });
            }
          });
        }

        showContextMenu(menuItems, e.clientX, e.clientY);
      });

      grid.appendChild(item);
    });

    if (apps.length === 0) {
      grid.innerHTML = '<div style="text-align:center; color:var(--text-tertiary); padding:20px;">No apps in this category.</div>';
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menuElement.style.display = 'flex';
    document.body.classList.add('menu-open');

    // Hide any existing tooltip
    const tip = document.getElementById('everest-tooltip');
    if (tip) tip.style.display = 'none';

    const isTop = this.panelManager.position === 'top';
    this.menuElement.style.left = 'var(--panel-margin-x)';

    if (isTop) {
      this.menuElement.style.top = 'calc(var(--panel-height) + var(--panel-margin-y) * 2)';
      this.menuElement.style.bottom = 'auto';
      this.menuElement.style.borderRadius = 'var(--radius-md)';
    } else {
      this.menuElement.style.bottom = 'calc(var(--panel-height) + var(--panel-margin-y) * 2)';
      this.menuElement.style.top = 'auto';
      this.menuElement.style.borderRadius = 'var(--radius-md)';
    }

    const searchInput = this.menuElement.querySelector('input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }

    this._renderCategories();
    this._renderAppGrid('All Applications');
  }

  close() {
    this.isOpen = false;
    this.menuElement.style.display = 'none';
    document.body.classList.remove('menu-open');
  }

  _applyMenuIcon(icon) {
    // If icon is exactly 'menu' or empty, use the theme-aware 'menu' with a fallback
    const iconKey = (!icon || icon === 'menu') ? 'menu,🌿' : icon;
    const size = this.settings.iconSize || 28;

    // Check if it's a theme icon vs a custom path/emoji
    const isThemeIcon = !iconKey.includes('/') && !iconKey.includes('.');

    // Default panel button
    const panelBtnIcon = document.getElementById('panel-menu-icon');
    if (panelBtnIcon) {
      panelBtnIcon.innerHTML = IconHelper.getIcon(iconKey, { size });
    }

    // Modular menu applets (possibly multiple)
    const modularMenus = document.querySelectorAll('[data-uuid="menu@playground"]');
    modularMenus.forEach(menu => {
      const iconEl = menu.querySelector('.applet-icon');
      if (iconEl) {
        iconEl.innerHTML = IconHelper.getIcon(iconKey, { size });
      }
      const labelEl = menu.querySelector('.applet-label');
      if (labelEl) {
        labelEl.textContent = this.settings.label !== undefined ? this.settings.label : 'Menu';
      }
    });
  }

  _saveSettings() {
    this.vfs.writeFile('~/.config/menu.json', JSON.stringify(this.settings, null, 2));
    this._applyMenuSettings();
    if (this.settings.icon) this._applyMenuIcon(this.settings.icon);
    else this._applyMenuIcon('menu,🌿');
  }

  _applyMenuSettings() {
    if (!this.menuElement) return;

    // Ensure icon is updated if it was changed
    if (this.settings.icon) this._applyMenuIcon(this.settings.icon);
    else this._applyMenuIcon('menu,🌿');

    // Icon & Label
    const showLabel = this.settings.showLabel !== false;
    const labelEl = document.querySelector('#panel-menu-button .panel-menu-label');
    if (labelEl) {
      labelEl.style.display = showLabel ? 'inline' : 'none';
    }

    // Icon Size (for non-image icons)
    const iconEl = document.getElementById('panel-menu-icon');
    if (iconEl && !iconEl.querySelector('img')) {
      const size = this.settings.iconSize || 28;
      iconEl.style.fontSize = Math.floor(size * 0.7) + 'px';
      iconEl.style.width = size + 'px';
      iconEl.style.height = size + 'px';
    } else if (iconEl && iconEl.querySelector('img')) {
      const size = this.settings.iconSize || 28;
      const img = iconEl.querySelector('img');
      img.style.width = size + 'px';
      img.style.height = size + 'px';
    }

    // Width & Blur
    this.menuElement.style.width = (this.settings.menuWidth || 420) + 'px';
    const blur = this.settings.menuBlur !== undefined ? this.settings.menuBlur : 20;
    this.menuElement.style.backdropFilter = `blur(${blur}px) saturate(180%)`;
    this.menuElement.style.WebkitBackdropFilter = `blur(${blur}px) saturate(180%)`;

    // Background color using theme variable + custom opacity
    const opacity = this.settings.menuOpacity !== undefined ? this.settings.menuOpacity : 0.85;
    this.menuElement.style.background = `rgba(var(--bg-menu-rgb), ${opacity})`;

    // Category visibility
    const showCats = this.settings.showCategoryIcons !== false;
    const catContainer = this.menuElement.querySelector('#app-categories');
    if (catContainer) {
      catContainer.style.display = showCats ? 'flex' : 'none';
    }

    // Search visibility
    const enableSearch = this.settings.enableSearch !== false;
    const searchHeader = this.menuElement.querySelector('div[style*="border-bottom"]');
    if (searchHeader) {
      searchHeader.style.display = enableSearch ? 'block' : 'none';
    }
  }

  _openMenuSettings() {
    const title = document.getElementById('settings-title');
    const body = document.getElementById('settings-body');
    const overlay = document.getElementById('settings-overlay');

    if (!title || !body || !overlay) return;

    title.textContent = 'Menu Settings';
    body.innerHTML = '';

    // Tabs Container
    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.gap = '8px';
    tabContainer.style.padding = '8px 12px';
    tabContainer.style.borderBottom = '1px solid var(--border)';
    tabContainer.style.marginBottom = '12px';

    const createTab = (lbl, active = false) => {
      const btn = document.createElement('div');
      btn.textContent = lbl;
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '500';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.color = active ? 'var(--accent)' : 'var(--text-secondary)';
      btn.style.background = active ? 'var(--bg-active)' : 'transparent';
      btn.style.fontWeight = active ? '700' : '500';
      btn.style.transition = 'all 0.15s';
      return btn;
    };

    const tabBtn = createTab('Button', true);
    const tabGeneral = createTab('Menu (General)', false);

    tabContainer.appendChild(tabBtn);
    tabContainer.appendChild(tabGeneral);
    body.appendChild(tabContainer);

    const mainContent = document.createElement('div');
    mainContent.style.padding = '12px';
    body.appendChild(mainContent);

    // BUTTON TAB
    const renderButtonTab = () => {
      mainContent.innerHTML = '';

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '15px';

      // Label Option
      const lblOption = document.createElement('div');
      lblOption.style.display = 'flex';
      lblOption.style.alignItems = 'center';
      lblOption.style.justifyContent = 'space-between';

      const lblTitle = document.createElement('span');
      lblTitle.textContent = 'Show Menu Label';
      lblTitle.style.fontSize = '13.5px';
      lblOption.appendChild(lblTitle);

      const lblToggle = document.createElement('input');
      lblToggle.type = 'checkbox';
      lblToggle.checked = this.settings.showLabel !== false;
      lblToggle.addEventListener('change', () => {
        this.settings.showLabel = lblToggle.checked;
        this._saveSettings();
      });
      lblOption.appendChild(lblToggle);
      container.appendChild(lblOption);

      // Icon Size
      const sizeOption = document.createElement('div');
      sizeOption.style.display = 'flex';
      sizeOption.style.flexDirection = 'column';
      sizeOption.style.gap = '5px';

      const sizeHeader = document.createElement('div');
      sizeHeader.style.display = 'flex';
      sizeHeader.style.justifyContent = 'space-between';

      const sizeTitle = document.createElement('span');
      sizeTitle.textContent = 'Menu Icon Size';
      sizeTitle.style.fontSize = '13.5px';

      const sizeVal = document.createElement('span');
      sizeVal.textContent = (this.settings.iconSize || 28) + 'px';
      sizeVal.style.fontSize = '12px';
      sizeVal.style.color = 'var(--text-secondary)';

      sizeHeader.appendChild(sizeTitle);
      sizeHeader.appendChild(sizeVal);
      sizeOption.appendChild(sizeHeader);

      const sizeSlider = document.createElement('input');
      sizeSlider.type = 'range';
      sizeSlider.min = '16';
      sizeSlider.max = '48';
      sizeSlider.value = this.settings.iconSize || 28;
      sizeSlider.addEventListener('input', () => {
        const val = parseInt(sizeSlider.value);
        sizeVal.textContent = val + 'px';
        this.settings.iconSize = val;
        this._saveSettings();
      });
      sizeOption.appendChild(sizeSlider);
      container.appendChild(sizeOption);

      // Emoji Preset Title
      const emojisTitle = document.createElement('h4');
      emojisTitle.textContent = 'Select Preset Icon (Emoji)';
      emojisTitle.style.marginBottom = '5px';
      container.appendChild(emojisTitle);

      const emojiGrid = document.createElement('div');
      emojiGrid.style.display = 'grid';
      emojiGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
      emojiGrid.style.gap = '8px';

      const presets = [
        'menu,🌿', 'home,🏠', 'star,⭐', 'settings,⚙️',
        'terminal,💻', 'computer,🖥️', 'search,🔍', 'user,👤',
        'network,🌐', 'bolt,⚡', 'info,ℹ️', 'calendar,📅'
      ];
      presets.forEach(preset => {
        const btn = document.createElement('div');
        btn.innerHTML = IconHelper.getIcon(preset, { size: 24 });
        btn.style.fontSize = '20px';
        btn.style.padding = '8px';
        btn.style.borderRadius = '6px';
        btn.style.textAlign = 'center';
        btn.style.cursor = 'pointer';
        btn.style.background = 'var(--bg-hover)';
        btn.style.border = '1px solid var(--border)';
        btn.style.transition = 'all 0.15s';

        btn.addEventListener('click', () => {
          this.settings.icon = preset;
          this._applyMenuIcon(preset);
          this._saveSettings();
        });
        emojiGrid.appendChild(btn);
      });
      container.appendChild(emojiGrid);

      // Custom Icon
      const customTitle = document.createElement('h4');
      customTitle.textContent = 'Custom Icon Image';
      customTitle.style.marginTop = '10px';
      customTitle.style.marginBottom = '5px';
      container.appendChild(customTitle);

      const iconsGrid = document.createElement('div');
      iconsGrid.style.display = 'grid';
      iconsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      iconsGrid.style.gap = '8px';
      container.appendChild(iconsGrid);

      this.vfs.readdir('~/images/icons').then(items => {
        items.forEach(item => {
          if (item.type === 'dir' || !item.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return;

          const btn = document.createElement('div');
          btn.style.height = '48px';
          btn.style.borderRadius = '6px';
          const imgPath = this.vfs.getFsPath(item.path);
          btn.style.backgroundImage = `url(${imgPath})`;
          btn.style.backgroundSize = 'contain';
          btn.style.backgroundPosition = 'center';
          btn.style.backgroundRepeat = 'no-repeat';
          btn.style.cursor = 'pointer';
          btn.style.border = '1px solid var(--border)';
          btn.style.backgroundColor = 'var(--bg-hover)';

          btn.addEventListener('click', () => {
            this.settings.icon = imgPath;
            this._applyMenuIcon(imgPath);
            this._saveSettings();
          });
          iconsGrid.appendChild(btn);
        });
      }).catch(() => { });

      const pickBtn = document.createElement('button');
      pickBtn.textContent = 'Pick Icon File...';
      pickBtn.style.padding = '8px 12px';
      pickBtn.style.borderRadius = '4px';
      pickBtn.style.border = 'none';
      pickBtn.style.background = 'rgba(53,132,228,0.8)';
      pickBtn.style.color = 'white';
      pickBtn.style.cursor = 'pointer';

      pickBtn.addEventListener('click', async () => {
        if (!this.filePicker) return alert('File picker not initialized');
        overlay.classList.remove('open');
        const path = await this.filePicker.pickFile({
          title: 'Select Menu Icon',
          initialPath: '~/images/icons',
          filter: (item) => item.type === 'dir' || item.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
        });
        overlay.classList.add('open');
        if (path) {
          this.settings.icon = path;
          this._applyMenuIcon(path);
          this._saveSettings();
        }
      });

      container.appendChild(pickBtn);
      mainContent.appendChild(container);
    };

    // GENERAL TAB
    const renderGeneralTab = () => {
      mainContent.innerHTML = '';

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '15px';

      const createOption = (label, el) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';

        const lbl = document.createElement('span');
        lbl.textContent = label;
        lbl.style.fontSize = '13.5px';
        lbl.style.color = 'var(--text-primary)';

        row.appendChild(lbl);
        row.appendChild(el);
        return row;
      };

      // Menu Width
      const widthInput = document.createElement('input');
      widthInput.type = 'range';
      widthInput.min = '320';
      widthInput.max = '640';
      widthInput.value = this.settings.menuWidth || 420;
      widthInput.style.accentColor = '#3584e4';
      widthInput.addEventListener('input', () => {
        this.settings.menuWidth = parseInt(widthInput.value, 10);
        this._saveSettings();
      });
      container.appendChild(createOption('Menu Width (px)', widthInput));

      // Menu Opacity
      const opacityInput = document.createElement('input');
      opacityInput.type = 'range';
      opacityInput.min = '0.4';
      opacityInput.max = '1.0';
      opacityInput.step = '0.05';
      opacityInput.value = this.settings.menuOpacity !== undefined ? this.settings.menuOpacity : 0.85;
      opacityInput.style.accentColor = '#3584e4';
      opacityInput.addEventListener('input', () => {
        this.settings.menuOpacity = parseFloat(opacityInput.value);
        this._saveSettings();
      });
      container.appendChild(createOption('Background Opacity', opacityInput));

      // Show Categories
      const categoriesInput = document.createElement('input');
      categoriesInput.type = 'checkbox';
      categoriesInput.checked = this.settings.showCategoryIcons !== false;
      categoriesInput.addEventListener('change', () => {
        this.settings.showCategoryIcons = categoriesInput.checked;
        this._saveSettings();
      });
      container.appendChild(createOption('Show Category Filter', categoriesInput));

      // Enable Search
      const searchInput = document.createElement('input');
      searchInput.type = 'checkbox';
      searchInput.checked = this.settings.enableSearch !== false;
      searchInput.addEventListener('change', () => {
        this.settings.enableSearch = searchInput.checked;
        this._saveSettings();
      });
      container.appendChild(createOption('Enable Search / Search Box', searchInput));

      mainContent.appendChild(container);
    };

    tabBtn.addEventListener('click', () => {
      tabBtn.style.color = 'var(--accent)';
      tabBtn.style.background = 'var(--bg-active)';
      tabBtn.style.fontWeight = '700';
      tabGeneral.style.color = 'var(--text-secondary)';
      tabGeneral.style.background = 'transparent';
      tabGeneral.style.fontWeight = '500';
      renderButtonTab();
    });

    tabGeneral.addEventListener('click', () => {
      tabGeneral.style.color = 'var(--accent)';
      tabGeneral.style.background = 'var(--bg-active)';
      tabGeneral.style.fontWeight = '700';
      tabBtn.style.color = 'var(--text-secondary)';
      tabBtn.style.background = 'transparent';
      tabBtn.style.fontWeight = '500';
      renderGeneralTab();
    });

    renderButtonTab();
    overlay.classList.add('open');

    // Live preview: Open the menu automatically
    this.open();

    // Close menu when settings are closed
    const onSettingsClose = () => {
      if (!overlay.classList.contains('open')) {
        this.close();
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(onSettingsClose);
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }
}
