/**
 * Desktop Icons Manager
 * Mounts the Virtual File System ~/Desktop to the visual desktop area.
 */

import { showContextMenu } from './contextMenu.js';
import { showSystemDialog } from './dialog.js';
import { IconHelper } from './iconHelper.js';

// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/')
  ? import.meta.env.BASE_URL
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

export class DesktopIcons {
  constructor(desktopArea, vfs, appLoader, loader) {
    this.desktopArea = desktopArea;
    this.vfs = vfs;
    this.appLoader = appLoader;
    this.loader = loader;
    this.DESKTOP_PATH = '/home/user/Desktop';
    this._renameTarget = null;
  }

  init() {
    this.container = document.createElement('div');
    this.container.classList.add('desktop-icons-container');

    // Insert behind everything but in front of background
    this.desktopArea.appendChild(this.container);

    this.vfs.onChange((path) => {
      // If the desktop directory or its direct children changed, re-render
      if (path === this.DESKTOP_PATH || path.startsWith(this.DESKTOP_PATH + '/')) {
        this.render();
      }
    });

    // Re-render when icon theme or system theme changes
    window.addEventListener('icon-theme-changed', () => this.render());
    window.addEventListener('theme-changed', () => this.render());

    // Clear selection on desktop click
    this.desktopArea.addEventListener('click', () => {
      window.lastFocusedScope = { type: 'desktop', container: this.container, render: () => this.render(), vfs: this.vfs };
      this.container.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
    });

    // MASTER CONTEXT MENU CONTROLLER
    // Handles all context menus on the desktop layer, ensuring icons and desklets
    // are correctly identified even in mobile simulation modes.
    document.addEventListener('contextmenu', async (e) => {
      // Prevent infinite loops from injected events
      if (e._synthetic) return;

      const path = e.composedPath();
      const x = e.clientX || window._lastPointerPos?.x || 0;
      const y = e.clientY || window._lastPointerPos?.y || 0;
      
      // Find the target item using both path and elementFromPoint
      let itemEl = path.find(el => el.classList && (el.classList.contains('desktop-icon') || el.classList.contains('desklet-frame')));
      
      if (!itemEl) {
        const elAtPoint = document.elementFromPoint(x, y);
        itemEl = elAtPoint?.closest('.desktop-icon, .desklet-frame');
      }

      // If we found an icon/desklet, inject the event back into it
      if (itemEl) {
        e.preventDefault();
        e.stopPropagation();
        
        const injectedEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 2
        });
        injectedEvent._synthetic = true;
        itemEl.dispatchEvent(injectedEvent);
        return;
      }

      // Yield to system windows and panel
      if (path.some(el => el.classList && (
        el.classList.contains('app-window') || 
        el.classList.contains('everest-panel') ||
        el.classList.contains('applet-container')
      ))) return;

      // If we're on the desktop area, show background menu
      const isDesktop = path.some(el => el === this.desktopArea || el === this.container);
      if (isDesktop) {
        e.preventDefault();
        e.stopPropagation();
        
        window.lastFocusedScope = { type: 'desktop', container: this.container, render: () => this.render(), vfs: this.vfs };
        this.container.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));

        const clip = window.desktopClipboard;
        const canPaste = !!(clip && clip.path && clip.items);

        const menuItems = [
          {
            icon: 'folder-new,📁', label: 'New Folder', action: async () => {
              const tmpName = '.new_folder_' + Date.now();
              const tmpPath = `${this.DESKTOP_PATH}/${tmpName}`;
              try { 
                await this.vfs.mkdir(tmpPath);
                this._renameTarget = tmpPath;
                this.render();
              } catch (err) {
                console.error('Failed to create new folder', err);
              }
            }
          },
          {
            icon: 'document-new,📄', label: 'New Text File', action: async () => {
              const tmpName = '.new_file_' + Date.now() + '.txt';
              const tmpPath = `${this.DESKTOP_PATH}/${tmpName}`;
              try { 
                await this.vfs.writeFile(tmpPath, '');
                this._renameTarget = tmpPath;
                this.render();
              } catch (err) {
                console.error('Failed to create new file', err);
              }
            }
          },
          { separator: true },
          {
            icon: 'paste,📋', label: 'Paste', disabled: !canPaste, action: async () => {
              if (!canPaste) return;
              try {
                for (const si of clip.items) {
                  const targetPath = `${this.DESKTOP_PATH}/${si.name}`;
                  if (clip.type === 'copy') await this.vfs.copy(si.path, targetPath);
                  else if (clip.type === 'cut') await this.vfs.rename(si.path, targetPath);
                }
                window.desktopClipboard = { type: null, path: null, name: null, items: null };
              } catch (e) { showSystemDialog({ title: 'Paste Failed', message: e.message, type: 'alert' }); }
            }
          },
          { separator: true },
          {
            icon: '🧩',
            label: 'Add Desklets',
            action: () => {
              document.dispatchEvent(new CustomEvent('open-extension-manager', { detail: { type: 'desklets' } }));
            }
          },
          {
            icon: 'desktop,🖥️', label: 'Desktop Settings', action: () => {
              document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'system-settings', args: ['desktop', 'icons'] } }));
            }
          },
          {
            icon: 'appearance,🎨', label: 'Change Background', action: () => {
              document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'system-settings', args: ['desktop'] } }));
            }
          }
        ];
        showContextMenu(menuItems, e.clientX || window._lastPointerPos?.x || 0, e.clientY || window._lastPointerPos?.y || 0);
      }
    });

    this.render();
  }

  async render() {
    this.container.innerHTML = '';
    try {
      let settings = {
        gridSize: 90,
        iconSize: 32,
        labelSize: 12,
        labelColor: '#ffffff',
        labelShadow: true,
        autoArrange: false,
        showComputer: true
      };
      try {
        const savedStr = await this.vfs.readFile('~/.config/desktop.json');
        if (savedStr) {
          settings = { ...settings, ...JSON.parse(savedStr) };
        }
      } catch (e) { }

      let items = await this.vfs.readdir(this.DESKTOP_PATH);

      // Fetch content for .desktop files so we can show their icons
      items = (await Promise.all(items.map(async item => {
        if (item.name.endsWith('.desktop') && item.type !== 'dir') {
          try {
            item.content = await this.vfs.readFile(item.path);
          } catch (e) { }
        }
        return item;
      }))).filter(i => i !== null);

      let savedPositions = {};
      try { savedPositions = JSON.parse(await this.vfs.readFile('~/.config/desktop-positions.json')); } catch (e) { }

      // Clean up stale positions (items that are no longer on the desktop)
      let positionsChanged = false;
      const currentNames = new Set(items.map(i => i.name));
      // Also include "Computer" in current names if it's virtual
      if (settings.showComputer) currentNames.add('Computer');

      for (const name in savedPositions) {
        if (!currentNames.has(name)) {
          delete savedPositions[name];
          positionsChanged = true;
        }
      }

      if (positionsChanged) {
        await this.vfs.writeFile('~/.config/desktop-positions.json', JSON.stringify(savedPositions, null, 2));
      }

      if (settings.autoArrange) {
        let col = 0, row = 0;
        const step = settings.gridSize || 90;
        const maxRows = Math.max(1, Math.floor((window.innerHeight - step) / step));
        items.forEach(item => {
          let x = col * step + 10;
          let y = row * step + 10;
          savedPositions[item.name] = { x, y };
          row++;
          if (row >= maxRows) {
            row = 0;
            col++;
          }
        });
        positionsChanged = true; // Ensure auto-arranged positions are saved
      }

      // Add Virtual Icons
      if (settings.showHome !== false) {
        items.unshift({
          name: 'Home',
          path: '/home/user',
          type: 'dir',
          _isVirtual: true,
          _icon: 'home,🏠'
        });
      }

      if (settings.showComputer !== false) {
        items.unshift({
          name: 'Computer',
          path: 'computer://',
          type: 'dir',
          _isVirtual: true,
          _icon: 'computer,💻'
        });
      }

      if (settings.showTrash !== false) {
        items.push({
          name: 'Trash',
          path: '/home/user/.local/share/Trash/files',
          type: 'dir',
          _isVirtual: true,
          _icon: 'trash,🗑️'
        });
      }

      // Calculate all missing positions first (without creating elements)
      let positionsDirty = positionsChanged; // From auto-arrange or cleanup
      items.forEach(item => {
        if (!savedPositions[item.name]) {
          const step = settings.gridSize || 90;
          let found = false;
          let col = 0, row = 0;
          const maxCols = Math.max(1, Math.floor((window.innerWidth - step) / step));
          const maxRows = Math.max(1, Math.floor((window.innerHeight - step) / step));

          while (!found && col < maxCols + 50) {
            let x = col * step + 10;
            let y = row * step + 10;
            const isOccupied = Object.values(savedPositions).some(p => p && p.x === x && p.y === y);
            if (!isOccupied) {
              savedPositions[item.name] = { x, y };
              found = true;
              positionsDirty = true;
            } else {
              row++;
              if (row >= maxRows) { row = 0; col++; }
            }
          }
        }
      });

      // Batch save if anything changed
      if (positionsDirty) {
        await this.vfs.writeFile('~/.config/desktop-positions.json', JSON.stringify(savedPositions, null, 2));
      }

      // Now render elements using the guaranteed positions
      items.forEach(item => {
        const pos = savedPositions[item.name];
        const iconEl = document.createElement('div');
        iconEl.classList.add('desktop-icon');
        iconEl.style.width = settings.gridSize + 'px';
        iconEl.style.height = settings.gridSize + 'px';
        iconEl.style.padding = '5px';
        iconEl.style.display = 'flex';
        iconEl.style.flexDirection = 'column';
        iconEl.style.alignItems = 'center';
        iconEl.style.justifyContent = 'flex-start';
        iconEl.style.textAlign = 'center';

        let iconSymbol = '';
        const ext = item.name.split('.').pop().toLowerCase();

        if (item._icon) {
          iconSymbol = IconHelper.getIcon(item._icon, { size: settings.iconSize });
        } else if (item.type === 'dir') {
          iconSymbol = IconHelper.getIcon('folder-open,📁', { size: settings.iconSize });
        } else {
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            const fsPath = this.vfs.getFsPath(item.path);
            iconSymbol = `<img src="${fsPath}" style="width:${settings.iconSize}px; height:${settings.iconSize}px; object-fit:cover; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.3);" />`;
          } else if (ext === 'desktop') {
            try {
              const data = JSON.parse(item.content || '');
              if (data.type === 'app') {
                iconSymbol = IconHelper.getIcon(data.icon || 'plugin,📦', { size: settings.iconSize });
              }
            } catch (e) { }
          } else {
            iconSymbol = IconHelper.getIcon(ext, { size: settings.iconSize });
          }
        }

        if (!iconSymbol) iconSymbol = IconHelper.getIcon('file,📄', { size: settings.iconSize });

        const shadowStyle = settings.labelShadow !== false ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5);' : 'text-shadow: none;';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'desktop-icon-label';
        labelEl.style.fontSize = settings.labelSize + 'px';
        labelEl.style.color = settings.labelColor;
        labelEl.style.cssText += shadowStyle;
        labelEl.textContent = item.name;

        iconEl.innerHTML = `
          <div class="desktop-icon-img" style="font-size:${Math.floor(settings.iconSize * 0.8)}px; height:${settings.iconSize + 4}px; display:flex; align-items:center; justify-content:center;">${iconSymbol}</div>
        `;
        iconEl.appendChild(labelEl);

        if (this._renameTarget === item.path) {
          labelEl.textContent = '';
          const input = document.createElement('input');
          input.type = 'text';
          input.value = item.name.startsWith('.') ? (item.type === 'dir' ? 'New Folder' : 'New Text File.txt') : item.name;
          input.classList.add('desktop-icon-rename-input');
          labelEl.appendChild(input);
          
          setTimeout(() => {
            input.focus();
            const dotIdx = input.value.lastIndexOf('.');
            if (dotIdx > 0) input.setSelectionRange(0, dotIdx);
            else input.select();
          }, 50);

          const finishRename = async () => {
            if (this._renameTarget !== item.path) return;
            const newName = input.value.trim() || (item.type === 'dir' ? 'New Folder' : 'New Text File.txt');
            this._renameTarget = null;
            
            try {
              const uniqueName = await this._generateUniqueName(item.path, newName);
              if (uniqueName !== newName) {
                showSystemDialog({
                  title: 'Name Conflict',
                  message: `"${newName}" already exists in this folder.\n\nTo avoid conflicts, the item has been renamed to "${uniqueName}".`,
                  type: 'alert'
                });
              }
              await this.vfs.rename(item.path, `${this.DESKTOP_PATH}/${uniqueName}`);
            } catch (e) {
              console.error('Rename failed', e);
            }
            this.render();
          };

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finishRename();
            if (e.key === 'Escape') {
              this._renameTarget = null;
              this.render();
            }
          });
          input.addEventListener('blur', finishRename);
        }

        const openFile = () => {
          if (item.type === 'dir') {
            this.appLoader.launchApp('files', { path: item.path });
          } else {
            if (['mp3', 'ogg', 'wav', 'm4a', 'aac'].includes(ext)) {
              this.appLoader.launchApp('music-player', { path: item.path });
            } else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
              this.appLoader.launchApp('video-player', { path: item.path });
            } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
              this.appLoader.launchApp('image-viewer', { path: item.path });
            } else if (ext === 'pdf') {
              this.appLoader.launchApp('pdf-viewer', { path: item.path });
            } else if (ext === 'html') {
              this.appLoader.launchApp('web-browser', { url: item.path });
            } else if (ext === 'desktop') {
              try {
                const data = JSON.parse(item.content || '');
                if (data.type === 'app') {
                  this.appLoader.launchApp(data.id);
                }
              } catch (e) { }
            } else {
              this.appLoader.launchApp('text-editor', { path: item.path });
            }
          }
        };

        // Selection logic
        iconEl.dataset.path = item.path;
        iconEl.dataset.name = item.name;
        if (item._isVirtual) iconEl.dataset.virtual = 'true';

        iconEl.addEventListener('click', (e) => {
          e.stopPropagation();
          window.lastFocusedScope = { type: 'desktop', container: this.container, render: () => this.render(), vfs: this.vfs };
          if (e.ctrlKey) {
            iconEl.classList.toggle('selected');
          } else {
            this.container.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
            iconEl.classList.add('selected');
          }
        });

        if (pos) {
          iconEl.style.position = 'absolute';
          iconEl.style.left = pos.x + 'px';
          iconEl.style.top = pos.y + 'px';
        }

        // Draggable & Touch Logic
        let isDragging = false, startX, startY, startLeft, startTop;
        let lastTapTime = 0, longPressTimeout, ctxTimeout;
        this._hasDragged = false;

        const onPointerMove = (moveEvent) => {
          const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--system-scale')) || 1;
          const dx = (moveEvent.clientX - startX) / scale;
          const dy = (moveEvent.clientY - startY) / scale;
          if (Math.abs(dx * scale) > 5 || Math.abs(dy * scale) > 5) {
            isDragging = true;
            clearTimeout(longPressTimeout);
            clearTimeout(ctxTimeout);
            this._hasDragged = true;
          }
          if (!isDragging) return;
          iconEl.style.left = (startLeft + dx) + 'px';
          iconEl.style.top = (startTop + dy) + 'px';
        };

        const onPointerUp = async (e) => {
          clearTimeout(longPressTimeout);
          clearTimeout(ctxTimeout);
          iconEl.removeEventListener('pointermove', onPointerMove);
          iconEl.removeEventListener('pointerup', onPointerUp);
          iconEl.removeEventListener('pointercancel', onPointerUp);

          if (isDragging) {
            isDragging = false;
            iconEl.releasePointerCapture(e.pointerId);

            // Snap to grid
            const gSize = settings.gridSize || 90;
            const offset = 10;
            let x = parseInt(iconEl.style.left, 10);
            let y = parseInt(iconEl.style.top, 10);
            x = Math.round((x - offset) / gSize) * gSize + offset;
            y = Math.round((y - offset) / gSize) * gSize + offset;

            const desktop = document.getElementById('everest-desktop');
            const desktopWidth = desktop?.clientWidth || window.innerWidth;
            const desktopHeight = desktop?.clientHeight || window.innerHeight;

            // Bounds check
            x = Math.max(10, Math.min(x, desktopWidth - gSize));
            y = Math.max(10, Math.min(y, desktopHeight - gSize));

            iconEl.style.left = x + 'px';
            iconEl.style.top = y + 'px';

            // Save positions
            try {
              const currentPos = JSON.parse(await this.vfs.readFile('~/.config/desktop-positions.json') || '{}');
              currentPos[item.name] = { x, y };
              await this.vfs.writeFile('~/.config/desktop-positions.json', JSON.stringify(currentPos, null, 2));
            } catch (e) { }
          }
        };

        const onPointerDown = (e) => {
          const isRightClick = e.button === 2 || (e.ctrlKey && e.button === 0);
          
          if (isRightClick) {
            e.preventDefault();
            e.stopPropagation();
            this._showContextMenu(item, e.clientX, e.clientY);
            return;
          }

          if (e.button !== 0 && e.pointerType === 'mouse') return;
          
          const now = Date.now();
          const tapDelay = e.pointerType === 'mouse' ? 300 : 400;
          if (now - lastTapTime < tapDelay) {
            clearTimeout(longPressTimeout);
            clearTimeout(ctxTimeout);
            openFile();
            lastTapTime = 0;
            return;
          }
          lastTapTime = now;

          isDragging = false; 
          this._hasDragged = false;
          startX = e.clientX;
          startY = e.clientY;
          startLeft = parseInt(iconEl.style.left, 10) || 0;
          startTop = parseInt(iconEl.style.top, 10) || 0;

          const startDrag = () => {
            isDragging = true;
            this._hasDragged = false;
            iconEl.setPointerCapture(e.pointerId);
          };

          if (e.pointerType !== 'mouse') {
            longPressTimeout = setTimeout(() => {
              if (!this._hasDragged) {
                startDrag();
                if (navigator.vibrate) navigator.vibrate(20);
              }
            }, 250);

            ctxTimeout = setTimeout(() => {
              if (!this._hasDragged && !isDragging) {
                e.stopPropagation();
                const rect = iconEl.getBoundingClientRect();
                this._showContextMenu(item, rect.left + rect.width / 2, rect.top + rect.height / 2);
              }
            }, 600);
          } else {
            startDrag();
          }

          iconEl.addEventListener('pointermove', onPointerMove);
          iconEl.addEventListener('pointerup', onPointerUp);
          iconEl.addEventListener('pointercancel', onPointerUp);
        };

        iconEl.style.touchAction = 'none';
        iconEl.addEventListener('pointerdown', onPointerDown);

        // Context Menu
        iconEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          window.lastFocusedScope = { type: 'desktop', container: this.container, render: () => this.render(), vfs: this.vfs };
          if (!iconEl.classList.contains('selected')) {
            this.container.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
            iconEl.classList.add('selected');
          }

          const selectedItems = Array.from(this.container.querySelectorAll('.desktop-icon.selected')).map(el => ({
            path: el.dataset.path,
            name: el.dataset.name,
            isVirtual: el.dataset.virtual === 'true'
          }));

          const menuItems = [
            { icon: 'folder-open,📂', label: 'Open', action: () => openFile() },
            { separator: true },
            {
              icon: 'rename,📝', label: 'Rename', disabled: item._isVirtual, action: () => {
                this._renameTarget = item.path;
                this.render();
              }
            },
            { icon: 'copy,📄', label: 'Copy', action: () => { window.desktopClipboard = { type: 'copy', items: selectedItems, path: selectedItems[0].path, name: selectedItems[0].name }; } },
            { icon: 'cut,✂️', label: 'Cut', disabled: item._isVirtual, action: () => { window.desktopClipboard = { type: 'cut', items: selectedItems, path: selectedItems[0].path, name: selectedItems[0].name }; } },
            { separator: true },
            {
              icon: 'trash,🗑️', label: 'Move to Trash', danger: true, disabled: item._isVirtual, action: async () => {
                for (const si of selectedItems) {
                  if (!si.isVirtual) await this.vfs.trash(si.path);
                }
                this.render();
              }
            }
          ];
          showContextMenu(menuItems, e.clientX, e.clientY);
        });

        this.container.appendChild(iconEl);
      });
    } catch (e) {
      console.error('DesktopIcons: Render failed', e);
    }
  }


  _showContextMenu(item, x, y) {
    // Legacy method - mostly replaced by inline listener but kept for safety
  }

  async _generateUniqueName(path, baseName) {
    const parentDir = path.split('/').slice(0, -1).join('/');
    const items = await this.vfs.readdir(parentDir).catch(() => []);
    const existingNames = new Set(items.map(i => i.name));
    
    let name = baseName;
    if (!existingNames.has(name)) return name;
    
    let base = name;
    let ext = '';
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx > 0 && !name.startsWith('.')) {
        base = name.slice(0, dotIdx);
        ext = name.slice(dotIdx);
    }
    
    let numMatch = base.match(/^(.*?)\s+(\d+)$/);
    let pureBase = numMatch ? numMatch[1].trim() : base.trim();
    let num = numMatch ? parseInt(numMatch[2], 10) : 1;
    
    while (existingNames.has(name)) {
        num++;
        name = `${pureBase} ${num}${ext}`;
    }
    
    return name;
  }
}
