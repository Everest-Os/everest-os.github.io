/**
 * Desktop Settings
 * Manages desktop customization like wallpaper, theme, and context menu.
 */
import { showContextMenu } from './contextMenu.js';
import { showSystemDialog } from './dialog.js';
import { IconHelper } from './iconHelper.js';

// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/')
  ? import.meta.env.BASE_URL
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

const CONFIG_PATH = '~/.config/desktop.json';

export class DesktopSettings {
  constructor(desktopArea, vfs, filePicker, loader, panelManager) {
    this.desktopArea = desktopArea;
    this.vfs = vfs;
    this.filePicker = filePicker;
    this.loader = loader;
    this.panelManager = panelManager;
    this.settings = {
      background: 'url("/system/backgrounds/bg_mountain_sunset_1777608248335.png")', // Default to system background
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      gridSize: 90,
      iconSize: 32,
      labelSize: 12,
      labelColor: '#ffffff',
      labelShadow: true,
      autoArrange: false,
      showComputer: true
    };
  }

  async init() {
    // Load persisted settings
    try {
      const savedStr = await this.vfs.readFile(CONFIG_PATH);
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        this.settings = { ...this.settings, ...saved };
      }
    } catch { /* fresh */ }

    this._applyBackground();

  }

  _applyBackground() {
    // We apply background to the #desktop-area div so the panel sits on top of it
    const desktop = document.getElementById('desktop-area');
    if (!desktop) return;

    let bg = this.settings.background;
    if (bg && bg.startsWith('url(')) {
      // Extract the path from url(...)
      const match = bg.match(/url\(['"]?([^'"]+?)['"]?\)/);
      if (match) {
        const path = match[1];
        // If it's a VFS path (~ or /home/user), load it as a DataURL
        if (path.startsWith('~') || path.startsWith('/home/user')) {
          this.vfs.readFile(path).then(dataUrl => {
            desktop.style.background = `url("${dataUrl}")`;
            desktop.style.backgroundSize = this.settings.backgroundSize;
            desktop.style.backgroundPosition = this.settings.backgroundPosition;
          }).catch(e => {
            console.warn("Failed to load wallpaper from VFS path, trying system fallback:", path);
            const filename = path.split('/').pop();
            const systemPath = `/system/backgrounds/${filename}`;
            const systemUrl = this.vfs.getFsPath(systemPath);
            
            // Just set it directly since /system is always direct HTTP
            desktop.style.background = `url("${systemUrl}")`;
            desktop.style.backgroundSize = this.settings.backgroundSize;
            desktop.style.backgroundPosition = this.settings.backgroundPosition;
          });
          return; // The async call will handle setting the background
        } else if (path.startsWith('/system/')) {
          const systemUrl = this.vfs.getFsPath(path);
          desktop.style.background = `url("${systemUrl}")`;
          desktop.style.backgroundSize = this.settings.backgroundSize;
          desktop.style.backgroundPosition = this.settings.backgroundPosition;
          return;
        }
      }
    }

    desktop.style.background = bg;
    desktop.style.backgroundSize = this.settings.backgroundSize;
    desktop.style.backgroundPosition = this.settings.backgroundPosition;
    desktop.style.backgroundRepeat = 'no-repeat';
  }

  async _save() {
    try {
      await this.vfs.writeFile(CONFIG_PATH, JSON.stringify(this.settings, null, 2));
    } catch (e) {
      console.error("Failed to save desktop settings", e);
    }
  }

  _showDesktopContextMenu(x, y) {
    const items = [
      {
        icon: 'folder',
        label: 'Create New Folder',
        action: async () => {
          const name = prompt('Folder name:', 'New Folder');
          if (name) {
            try { await this.vfs.mkdir(`~/Desktop/${name}`); }
            catch (e) { alert(e.message); }
          }
        },
      },
      { separator: true },
      {
        icon: 'paste',
        label: window.desktopClipboard && window.desktopClipboard.path ? `Paste (${window.desktopClipboard.name})` : 'Paste',
        disabled: !window.desktopClipboard || !window.desktopClipboard.path,
        action: async () => {
          const clip = window.desktopClipboard;
          if (clip && clip.path) {
            try {
              const targetPath = `~/Desktop/${clip.name}`;
              const exists = await this.vfs.stat(targetPath);
              if (exists) {
                showSystemDialog({
                  title: 'Duplicate Item',
                  message: `An item named "${clip.name}" already exists on the Desktop. Do you want to create a duplicate?`,
                  type: 'confirm',
                  confirmText: 'Make Duplicate',
                  cancelText: 'Cancel',
                  onConfirm: async () => {
                    try {
                      const extIdx = clip.name.lastIndexOf('.');
                      let baseName = clip.name;
                      let ext = '';
                      if (extIdx !== -1 && !clip.name.endsWith('.')) {
                        baseName = clip.name.substring(0, extIdx);
                        ext = clip.name.substring(extIdx);
                      }
                      const dupPath = `~/Desktop/${baseName} - Copy${ext}`;
                      if (clip.type === 'copy') {
                        await this.vfs.copy(clip.path, dupPath);
                        window.desktopClipboard = { type: null, path: null, name: null };
                      } else if (clip.type === 'cut') {
                        await this.vfs.rename(clip.path, dupPath);
                        window.desktopClipboard = { type: null, path: null, name: null };
                      }
                    } catch (err) { alert('Paste failed: ' + err.message); }
                  }
                });
                return;
              }

              if (clip.type === 'copy') {
                await this.vfs.copy(clip.path, targetPath);
                window.desktopClipboard = { type: null, path: null, name: null };
              } else if (clip.type === 'cut') {
                await this.vfs.rename(clip.path, targetPath);
                window.desktopClipboard = { type: null, path: null, name: null };
              }
            } catch (err) { alert('Paste failed: ' + err.message); }
          }
        },
      },
      { separator: true },
      {
        icon: 'settings-color',
        label: 'Desktop Settings',
        action: () => {
          document.dispatchEvent(new CustomEvent('launch-app', {
            detail: { id: 'system-settings', args: ['desktop'] }
          }));
        },
      }
    ];

    if (this.loader) {
      const loaded = this.loader.getLoaded();
      const desklets = [...loaded.entries()].filter(([, ext]) => ext.type === 'desklets');

      items.push({ separator: true });

      items.push({
        icon: 'plugin-color',
        label: 'Add Desklets',
        action: () => document.dispatchEvent(new CustomEvent('open-extension-manager', { detail: { type: 'desklets' } })),
      });


      items.push({
        icon: 'refresh',
        label: 'Reload All Desklets',
        disabled: desklets.length === 0,
        action: () => {
          for (const [uuid] of desklets) {
            try { this.loader.reload(uuid); } catch (e) { }
          }
        },
      });
    }

    const avoidPanel = this.panelManager ? this.panelManager._panel : null;
    showContextMenu(items, x, y, false, avoidPanel);
  }

  _openDesktopSettings() {
    const title = document.getElementById('settings-title');
    const body = document.getElementById('settings-body');
    const overlay = document.getElementById('settings-overlay');

    if (!title || !body || !overlay) return;

    title.textContent = 'Desktop Settings';
    body.innerHTML = '';

    // Create Tabs bar
    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.gap = '8px';
    tabContainer.style.padding = '8px 12px';
    tabContainer.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    tabContainer.style.marginBottom = '12px';

    const createTab = (lbl, active = false) => {
      const btn = document.createElement('div');
      btn.textContent = lbl;
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '500';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.color = active ? '#fff' : 'rgba(255, 255, 255, 0.6)';
      btn.style.background = active ? 'rgba(255, 255, 255, 0.12)' : 'transparent';
      btn.style.transition = 'all 0.15s';
      return btn;
    };

    const tabBg = createTab('Background', true);
    const tabIcons = createTab('Icons & Layout', false);

    tabContainer.appendChild(tabBg);
    tabContainer.appendChild(tabIcons);
    body.appendChild(tabContainer);

    const mainContent = document.createElement('div');
    mainContent.style.padding = '12px';
    body.appendChild(mainContent);

    // BACKGROUND TAB CONTENTS
    const renderBackgroundTab = () => {
      mainContent.innerHTML = '';

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '15px';

      // Gradients
      const gradientsTitle = document.createElement('h4');
      gradientsTitle.textContent = 'Solid & Gradients';
      gradientsTitle.style.marginBottom = '5px';
      container.appendChild(gradientsTitle);

      const gradGrid = document.createElement('div');
      gradGrid.style.display = 'grid';
      gradGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      gradGrid.style.gap = '10px';

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
        const btn = document.createElement('div');
        btn.style.height = '60px';
        btn.style.borderRadius = '6px';
        btn.style.background = grad;
        btn.style.cursor = 'pointer';
        btn.style.border = '2px solid transparent';
        if (this.settings.background === grad) btn.style.borderColor = 'white';

        btn.addEventListener('click', () => {
          const urlInput = container.querySelector('input[type="text"]');
          if (urlInput) urlInput.value = '';

          this.settings.background = grad;
          this._applyBackground();
          this._save();
          gradGrid.querySelectorAll('div').forEach(d => d.style.borderColor = 'transparent');
          const imgGrid = container.querySelector('#bg-images-grid');
          if (imgGrid) imgGrid.querySelectorAll('div').forEach(d => d.style.borderColor = 'transparent');
          btn.style.borderColor = 'white';
        });
        gradGrid.appendChild(btn);
      });
      container.appendChild(gradGrid);

      // Images
      const imagesTitle = document.createElement('h4');
      imagesTitle.textContent = 'Images';
      imagesTitle.style.marginTop = '10px';
      imagesTitle.style.marginBottom = '5px';
      container.appendChild(imagesTitle);

      const imgGrid = document.createElement('div');
      imgGrid.id = 'bg-images-grid';
      imgGrid.style.display = 'grid';
      imgGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      imgGrid.style.gap = '10px';
      container.appendChild(imgGrid);

      this.vfs.readdir('~/images/backgrounds').then(items => {
        items.forEach(item => {
          if (item.type === 'dir' || !item.name.match(/\.(png|jpg|jpeg)$/i)) return;

          const btn = document.createElement('div');
          btn.style.height = '80px';
          btn.style.borderRadius = '6px';
          const fsPath = this.vfs.getFsPath(`~/images/backgrounds/${item.name}`);
          btn.style.background = `url(${fsPath})`;
          btn.style.backgroundSize = 'cover';
          btn.style.backgroundPosition = 'center';
          btn.style.cursor = 'pointer';
          btn.style.border = '2px solid transparent';
          if (this.settings.background === btn.style.background) btn.style.borderColor = 'white';

          btn.addEventListener('click', () => {
            const urlInput = container.querySelector('input[type="text"]');
            if (urlInput) urlInput.value = '';

            const fsPath = this.vfs.getFsPath(`~/images/backgrounds/${item.name}`);
            this.settings.background = `url(${fsPath})`;
            this._applyBackground();
            this._save();
            imgGrid.querySelectorAll('div').forEach(d => d.style.borderColor = 'transparent');
            gradGrid.querySelectorAll('div').forEach(d => d.style.borderColor = 'transparent');
            btn.style.borderColor = 'white';
          });
          imgGrid.appendChild(btn);
        });
      }).catch(() => {
        imgGrid.innerHTML = '<div style="grid-column: 1/-1; color:var(--text-tertiary);">No backgrounds found.</div>';
      });

      // Custom URL or Path
      const urlTitle = document.createElement('h4');
      urlTitle.textContent = 'Custom Image URL';
      urlTitle.style.marginTop = '10px';
      urlTitle.style.marginBottom = '5px';
      container.appendChild(urlTitle);

      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.placeholder = 'https://...';
      urlInput.style.padding = '8px';
      urlInput.style.borderRadius = '4px';
      urlInput.style.border = '1px solid rgba(255,255,255,0.2)';
      urlInput.style.background = 'rgba(0,0,0,0.3)';
      urlInput.style.color = 'white';

      if (this.settings.background.startsWith('url(')) {
        urlInput.value = this.settings.background.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      }

      const applyBtn = document.createElement('button');
      applyBtn.textContent = 'Apply';
      applyBtn.style.padding = '8px 12px';
      applyBtn.style.borderRadius = '4px';
      applyBtn.style.border = 'none';
      applyBtn.style.background = 'rgba(53,132,228,0.8)';
      applyBtn.style.color = 'white';
      applyBtn.style.cursor = 'pointer';

      applyBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
          this.settings.background = `url(${url})`;
          this._applyBackground();
          this._save();
        }
      });

      const browseBtn = document.createElement('button');
      browseBtn.textContent = 'Browse...';
      browseBtn.style.padding = '8px 12px';
      browseBtn.style.borderRadius = '4px';
      browseBtn.style.border = '1px solid rgba(255,255,255,0.2)';
      browseBtn.style.background = 'rgba(255,255,255,0.1)';
      browseBtn.style.color = 'white';
      browseBtn.style.cursor = 'pointer';

      browseBtn.addEventListener('click', async () => {
        if (!this.filePicker) return alert('File picker not initialized');
        overlay.classList.remove('open');
        const path = await this.filePicker.pickFile({
          title: 'Select Background Image',
          initialPath: '~/images/backgrounds',
          filter: (item) => item.name.match(/\.(png|jpg|jpeg|gif)$/i)
        });
        overlay.classList.add('open');
        if (path) {
          urlInput.value = path;
          applyBtn.click();
        }
      });

      const urlRow = document.createElement('div');
      urlRow.style.display = 'flex';
      urlRow.style.gap = '10px';
      urlInput.style.flex = '1';
      urlRow.appendChild(urlInput);
      urlRow.appendChild(browseBtn);
      urlRow.appendChild(applyBtn);

      container.appendChild(urlRow);
      mainContent.appendChild(container);
    };

    // ICONS & LAYOUT TAB CONTENTS
    const renderIconsTab = () => {
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
        lbl.style.color = 'rgba(255,255,255,0.85)';

        row.appendChild(lbl);
        row.appendChild(el);
        return row;
      };

      // Grid Size
      const gridSizeInput = document.createElement('input');
      gridSizeInput.type = 'range';
      gridSizeInput.min = '60';
      gridSizeInput.max = '140';
      gridSizeInput.value = this.settings.gridSize || 90;
      gridSizeInput.style.accentColor = '#3584e4';
      gridSizeInput.addEventListener('input', () => {
        this.settings.gridSize = parseInt(gridSizeInput.value, 10);
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Grid Cell Size (px)', gridSizeInput));

      // Icon Size
      const iconSizeInput = document.createElement('input');
      iconSizeInput.type = 'range';
      iconSizeInput.min = '20';
      iconSizeInput.max = '64';
      iconSizeInput.value = this.settings.iconSize || 32;
      iconSizeInput.style.accentColor = '#3584e4';
      iconSizeInput.addEventListener('input', () => {
        this.settings.iconSize = parseInt(iconSizeInput.value, 10);
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Icon Dimension (px)', iconSizeInput));

      // Label Size
      const labelSizeInput = document.createElement('input');
      labelSizeInput.type = 'range';
      labelSizeInput.min = '10';
      labelSizeInput.max = '20';
      labelSizeInput.value = this.settings.labelSize || 12;
      labelSizeInput.style.accentColor = '#3584e4';
      labelSizeInput.addEventListener('input', () => {
        this.settings.labelSize = parseInt(labelSizeInput.value, 10);
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Label Size (px)', labelSizeInput));

      // Label Color
      const labelColorInput = document.createElement('input');
      labelColorInput.type = 'color';
      labelColorInput.value = this.settings.labelColor || '#ffffff';
      labelColorInput.style.border = 'none';
      labelColorInput.style.background = 'none';
      labelColorInput.style.cursor = 'pointer';
      labelColorInput.addEventListener('input', () => {
        this.settings.labelColor = labelColorInput.value;
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Label Color', labelColorInput));

      // Background Shadow (Toggle)
      const labelShadowInput = document.createElement('input');
      labelShadowInput.type = 'checkbox';
      labelShadowInput.checked = this.settings.labelShadow !== false;
      labelShadowInput.addEventListener('change', () => {
        this.settings.labelShadow = labelShadowInput.checked;
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Label Drop Shadow', labelShadowInput));

      // Auto Arrange (Toggle)
      const autoArrangeInput = document.createElement('input');
      autoArrangeInput.type = 'checkbox';
      autoArrangeInput.checked = this.settings.autoArrange === true;
      autoArrangeInput.addEventListener('change', () => {
        this.settings.autoArrange = autoArrangeInput.checked;
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Auto Arrange to Grid', autoArrangeInput));

      // Show Computer (Toggle)
      const computerInput = document.createElement('input');
      computerInput.type = 'checkbox';
      computerInput.checked = this.settings.showComputer !== false;
      computerInput.addEventListener('change', () => {
        this.settings.showComputer = computerInput.checked;
        this._save();
        this.vfs._emit('/home/user/Desktop');
      });
      container.appendChild(createOption('Show "Computer" Icon', computerInput));

      mainContent.appendChild(container);
    };

    tabBg.addEventListener('click', () => {
      tabBg.style.color = '#fff';
      tabBg.style.background = 'rgba(255,255,255,0.12)';
      tabIcons.style.color = 'rgba(255,255,255,0.6)';
      tabIcons.style.background = 'transparent';
      renderBackgroundTab();
    });

    tabIcons.addEventListener('click', () => {
      tabIcons.style.color = '#fff';
      tabIcons.style.background = 'rgba(255,255,255,0.12)';
      tabBg.style.color = 'rgba(255,255,255,0.6)';
      tabBg.style.background = 'transparent';
      renderIconsTab();
    });

    renderBackgroundTab();
    overlay.classList.add('open');
  }
}
