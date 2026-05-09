/**
 * File Picker App
 * A reusable windowed application for selecting files from the VFS.
 */

import { IconHelper } from './iconHelper.js';

export class FilePickerApp {
  constructor(windowManager, vfs) {
    this.windowManager = windowManager;
    this.vfs = vfs;
  }

  /**
   * Opens a file picker dialog.
   * @param {Object} options
   * @param {string} [options.initialPath] - Starting directory
   * @param {string} [options.title] - Window title
   * @param {Function} [options.filter] - Predicate to filter files (e.g. (item) => item.name.endsWith('.png'))
   * @returns {Promise<string|null>} Path to the selected file, or null if cancelled.
   */
  pickFile(options = {}) {
    return new Promise((resolve) => {
      const title = options.title || 'Select a File';
      let currentPath = options.initialPath || '/home/user';
      const filter = options.filter || (() => true);

      const content = document.createElement('div');
      content.style.padding = '20px';
      content.style.height = '100%';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';

      content.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:15px; align-items:center;">
          <button id="fp-up" class="btn-secondary" style="padding:6px 12px; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('up', { size: 14 })} Up</button>
          <input type="text" id="fp-path" style="flex:1; padding:8px; border-radius:4px; border:1px solid var(--border); background:rgba(0,0,0,0.2); color:white;" readonly>
        </div>
        <div id="fp-list" style="flex:1; overflow-y:auto; display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px; align-content:start;">
          <div class="loading-spinner">Loading...</div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px; border-top:1px solid var(--border); padding-top:15px;">
          <button id="fp-cancel" class="btn-secondary" style="padding:8px 16px;">Cancel</button>
        </div>
      `;

      // Create window
      const winId = `file-picker-${Date.now()}`;
      const win = this.windowManager.createWindow({
        id: winId,
        title: title,
        icon: 'folder',
        width: 600,
        height: 450,
        content: content
      });

      const listEl = content.querySelector('#fp-list');
      const pathEl = content.querySelector('#fp-path');
      const btnUp = content.querySelector('#fp-up');
      const btnCancel = content.querySelector('#fp-cancel');

      let resolved = false;
      const closeAndResolve = (value) => {
        if (resolved) return;
        resolved = true;
        resolve(value);
        this.windowManager.closeWindow(winId);
      };

      btnCancel.addEventListener('click', () => {
        closeAndResolve(null);
      });

      btnUp.addEventListener('click', () => {
        if (currentPath === '/') return;
        currentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        render();
      });

      const render = async () => {
        const log = window.__everestConsole;
        log?.log(`[FilePicker] render() for path: ${currentPath}`);
        if (!listEl) return;
        listEl.innerHTML = '<div class="loading-spinner" style="grid-column: 1/-1; text-align:center; padding:20px;">Loading...</div>';
        if (pathEl) pathEl.value = currentPath;

        try {
          const items = await this.vfs.readdir(currentPath);
          log?.log(`[FilePicker] found ${items.length} items`);
          listEl.innerHTML = '';

          let fileCount = 0;

          // Add items
          for (const item of items) {
            // Check filters for files safely
            if (item.type !== 'dir') {
              try {
                if (!filter(item)) continue;
              } catch (e) {
                console.error('Filter error on item', item, e);
                continue;
              }
            }

            fileCount++;

            const el = document.createElement('div');
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.padding = '10px';
            el.style.borderRadius = '6px';
            el.style.cursor = 'pointer';
            el.style.transition = 'background 0.1s';

            el.onmouseover = () => el.style.background = 'rgba(255,255,255,0.1)';
            el.onmouseout = () => el.style.background = 'transparent';

            const icon = item.type === 'dir' ? 'folder' : 'file';

            let isImage = false;
            try {
              if (item.type !== 'dir' && item.name && item.name.match(/\.(png|jpg|jpeg|gif)$/i)) {
                isImage = true;
              }
            } catch (e) { }

            let imgHtml = icon;
            if (isImage && item.path) {
              imgHtml = `<img src="${this.vfs.getFsPath(item.path)}" style="max-width:36px; max-height:36px; object-fit:contain;">`;
            }

            el.innerHTML = `
              <div style="font-size:32px; margin-bottom:5px; height:36px; display:flex; align-items:center; justify-content:center;">
                ${isImage && item.path ? imgHtml : IconHelper.getIcon(icon, { size: 32 })}
              </div>
              <div style="font-size:12px; text-align:center; word-break:break-all;">${item.name || 'Unknown'}</div>
            `;

            el.addEventListener('dblclick', () => {
              if (item.type === 'dir') {
                currentPath = item.path;
                render();
              } else {
                closeAndResolve(item.path);
              }
            });

            el.addEventListener('click', () => {
              if (item.type !== 'dir') {
                closeAndResolve(item.path);
              }
            });

            listEl.appendChild(el);
          }

          if (fileCount === 0) {
            listEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:var(--text-tertiary); padding-top:20px;">Folder is empty.</div>';
            log?.log(`[FilePicker] Folder is empty`);
          }

        } catch (e) {
          log?.logError(`[FilePicker] Error: ${e.message}`);
          listEl.innerHTML = `<div style="grid-column: 1/-1; color:var(--danger); padding:20px;">Error: ${e.message}</div>`;
        }
      };

      render();
    });
  }

  /**
   * Opens a folder picker dialog.
   * @param {Object} options
   * @param {string} [options.initialPath] - Starting directory
   * @param {string} [options.title] - Window title
   * @returns {Promise<string|null>} Path to the selected folder, or null if cancelled.
   */
  pickFolder(options = {}) {
    return new Promise((resolve) => {
      const title = options.title || 'Select a Folder';
      let currentPath = options.initialPath || '/home/user';

      const content = document.createElement('div');
      content.style.padding = '20px';
      content.style.height = '100%';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';

      content.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:15px; align-items:center;">
          <button id="fp-up" class="btn-secondary" style="padding:6px 12px; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('up', { size: 14 })} Up</button>
          <input type="text" id="fp-path" style="flex:1; padding:8px; border-radius:4px; border:1px solid var(--border); background:rgba(0,0,0,0.2); color:white;" readonly>
        </div>
        <div id="fp-list" style="flex:1; overflow-y:auto; display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px; align-content:start;">
          <div class="loading-spinner">Loading...</div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px; border-top:1px solid var(--border); padding-top:15px;">
          <button id="fp-select" class="btn-primary" style="padding:8px 16px;">Select This Folder</button>
          <button id="fp-cancel" class="btn-secondary" style="padding:8px 16px;">Cancel</button>
        </div>
      `;

      const winId = `folder-picker-${Date.now()}`;
      this.windowManager.createWindow({
        id: winId,
        title: title,
        icon: 'folder',
        width: 600,
        height: 450,
        content: content
      });

      const listEl = content.querySelector('#fp-list');
      const pathEl = content.querySelector('#fp-path');
      const btnUp = content.querySelector('#fp-up');
      const btnCancel = content.querySelector('#fp-cancel');
      const btnSelect = content.querySelector('#fp-select');

      let resolved = false;
      const closeAndResolve = (value) => {
        if (resolved) return;
        resolved = true;
        resolve(value);
        this.windowManager.closeWindow(winId);
      };

      btnCancel.addEventListener('click', () => closeAndResolve(null));
      btnSelect.addEventListener('click', () => closeAndResolve(currentPath));

      btnUp.addEventListener('click', () => {
        if (currentPath === '/') return;
        currentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        render();
      });

      const render = async () => {
        if (!listEl) return;
        listEl.innerHTML = '<div class="loading-spinner" style="grid-column: 1/-1; text-align:center; padding:20px;">Loading...</div>';
        if (pathEl) pathEl.value = currentPath;

        try {
          const items = await this.vfs.readdir(currentPath);
          listEl.innerHTML = '';
          let count = 0;

          for (const item of items) {
            if (item.type !== 'dir') continue;
            count++;
            const el = document.createElement('div');
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.padding = '10px';
            el.style.borderRadius = '6px';
            el.style.cursor = 'pointer';
            el.style.transition = 'background 0.1s';
            el.onmouseover = () => el.style.background = 'rgba(255,255,255,0.1)';
            el.onmouseout = () => el.style.background = 'transparent';

            el.innerHTML = `
              <div style="font-size:32px; margin-bottom:5px;">${IconHelper.getIcon('folder', { size: 32 })}</div>
              <div style="font-size:12px; text-align:center; word-break:break-all;">${item.name}</div>
            `;

            el.addEventListener('dblclick', () => {
              currentPath = item.path;
              render();
            });

            listEl.appendChild(el);
          }

          if (count === 0) {
            listEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:var(--text-tertiary); padding-top:20px;">No subfolders.</div>';
          }
        } catch (e) {
          listEl.innerHTML = `<div style="grid-column: 1/-1; color:var(--danger); padding:20px;">Error: ${e.message}</div>`;
        }
      };

      render();
    });
  }
}
