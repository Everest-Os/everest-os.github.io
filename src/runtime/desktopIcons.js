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
  constructor(desktopArea, vfs, appLoader) {
    this.desktopArea = desktopArea;
    this.vfs = vfs;
    this.appLoader = appLoader; // Needed to launch file manager / text editor
    this.DESKTOP_PATH = '/home/user/Desktop';
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

    // Context menu for the blank desktop area
    this.desktopArea.addEventListener('contextmenu', async (e) => {
      // Don't show if we right-clicked an icon (handled by icon's own contextmenu)
      if (e.target.closest('.desktop-icon')) return;

      e.preventDefault();
      window.lastFocusedScope = { type: 'desktop', container: this.container, render: () => this.render(), vfs: this.vfs };
      this.container.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));

      const clip = window.desktopClipboard;
      const canPaste = !!(clip && clip.path && clip.items);

      const menuItems = [
        {
          icon: 'folder-new,📁', label: 'New Folder', action: async () => {
            let name = 'New Folder';
            try { await this.vfs.mkdir(`${this.DESKTOP_PATH}/${name}`); } catch (err) {
              let i = 1;
              while (i < 100) {
                try { await this.vfs.mkdir(`${this.DESKTOP_PATH}/${name} ${i}`); break; } catch (e) { i++; }
              }
            }
          }
        },
        {
          icon: 'document-new,📄', label: 'New Text File', action: async () => {
            let name = 'New Text File.txt';
            try { await this.vfs.writeFile(`${this.DESKTOP_PATH}/${name}`, ''); } catch (err) {
              let i = 1;
              while (i < 100) {
                try { await this.vfs.writeFile(`${this.DESKTOP_PATH}/New Text File ${i}.txt`, ''); break; } catch (e) { i++; }
              }
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

      showContextMenu(menuItems, e.clientX, e.clientY);
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
      items = await Promise.all(items.map(async item => {
        if (item.name.endsWith('.desktop') && item.type !== 'dir') {
          try {
            item.content = await this.vfs.readFile(item.path);
          } catch (e) { }
        }
        return item;
      }));

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

      // 1. Calculate all missing positions first (without creating elements)
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

      // 2. Batch save if anything changed
      if (positionsDirty) {
        await this.vfs.writeFile('~/.config/desktop-positions.json', JSON.stringify(savedPositions, null, 2));
      }

      // 3. Now render elements using the guaranteed positions
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

        iconEl.innerHTML = `
          <div class="desktop-icon-img" style="font-size:${Math.floor(settings.iconSize * 0.8)}px; height:${settings.iconSize + 4}px; display:flex; align-items:center; justify-content:center;">${iconSymbol}</div>
          <div class="desktop-icon-label" style="font-size:${settings.labelSize}px; color:${settings.labelColor}; ${shadowStyle}">${item.name}</div>
        `;

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

        iconEl.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          openFile();
        });

        // Make selectable
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

        // Draggable
        let isDragging = false, startX, startY, startLeft, startTop;
        iconEl.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;

          if (iconEl.style.position !== 'absolute') {
            startLeft = iconEl.offsetLeft;
            startTop = iconEl.offsetTop;
            iconEl.style.position = 'absolute';
            iconEl.style.left = startLeft + 'px';
            iconEl.style.top = startTop + 'px';
          } else {
            startLeft = parseInt(iconEl.style.left, 10) || 0;
            startTop = parseInt(iconEl.style.top, 10) || 0;
          }

          const onMouseMove = (moveEvent) => {
            if (!isDragging) return;
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            iconEl.style.left = (startLeft + dx) + 'px';
            iconEl.style.top = (startTop + dy) + 'px';
          };

          const onMouseUp = async () => {
            if (isDragging) {
              isDragging = false;
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              // Snap to grid (grid size from settings)
              const gSize = settings.gridSize || 90;
              const offset = 10;
              let x = parseInt(iconEl.style.left, 10);
              let y = parseInt(iconEl.style.top, 10);

              // Snap to grid with offset
              x = Math.round((x - offset) / gSize) * gSize + offset;
              y = Math.round((y - offset) / gSize) * gSize + offset;

              // Bounds check
              x = Math.max(10, Math.min(x, window.innerWidth - gSize));
              y = Math.max(10, Math.min(y, window.innerHeight - gSize));

              // Load current positions to check for overlapping
              let pos = {};
              try { pos = JSON.parse(await this.vfs.readFile('~/.config/desktop-positions.json')); } catch (e) { }

              // Check if cell is taken by another icon
              let nx = x, ny = y;
              let found = false, radius = 0;
              while (!found && radius < 30) {
                for (let dx = -radius; dx <= radius; dx++) {
                  for (let dy = -radius; dy <= radius; dy++) {
                    let cx = x + dx * gSize;
                    let cy = y + dy * gSize;
                    // Ensure we stay within bounds but respect the offset
                    cx = Math.max(offset, Math.min(cx, window.innerWidth - gSize));
                    cy = Math.max(offset, Math.min(cy, window.innerHeight - gSize));

                    const isOccupied = Object.entries(pos).some(([name, p]) => name !== item.name && p && p.x === cx && p.y === cy);
                    if (!isOccupied) {
                      nx = cx;
                      ny = cy;
                      found = true;
                      break;
                    }
                  }
                  if (found) break;
                }
                radius++;
              }
              x = nx;
              y = ny;

              iconEl.style.left = x + 'px';
              iconEl.style.top = y + 'px';

              // Save position
              try {
                pos[item.name] = { x, y };
                // Use VFS to save (handles static mode automatically)
                await this.vfs.writeFile('~/.config/desktop-positions.json', JSON.stringify(pos, null, 2));
              } catch (e) { console.warn("Failed to save desktop icon position"); }
            }
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });

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
                showSystemDialog({
                  title: 'Rename', type: 'prompt', value: item.name, onConfirm: async (val) => {
                    if (val) {
                      await this.vfs.rename(item.path, `${this.DESKTOP_PATH}/${val}`);
                      this.render();
                    }
                  }
                });
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
      console.warn("Failed to render desktop icons", e);
    }
  }
}
