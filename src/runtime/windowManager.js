/**
 * Window Manager
 * Handles the creation, dragging, resizing, maximizing, and Z-indexing
 * of desktop application windows.
 */

import { IconHelper } from './iconHelper.js';

export class WindowManager {
  constructor(desktopArea, panelManager) {
    this.desktopArea = desktopArea;
    this.panelManager = panelManager;
    this.windows = new Map();
    this.activeWindow = null;
    this.zIndexCounter = 100;

    window.addEventListener('icon-theme-changed', () => {
      this.windows.forEach(win => {
        this.setIcon(win.id, win.options.icon || 'archive,📦');
      });
    });

    window.addEventListener('theme-changed', (e) => {
      const mode = e.detail?.theme?.mode || 'dark';
      this.windows.forEach(win => {
        win.frame.classList.toggle('light-window', mode === 'light');
      });
    });

    this._initSnapGhost();
  }

  _initSnapGhost() {
    this.snapGhost = document.createElement('div');
    this.snapGhost.classList.add('window-snap-ghost');
    this.snapGhost.style.display = 'none';
    this.snapGhost.style.position = 'absolute';
    this.snapGhost.style.pointerEvents = 'none';
    this.snapGhost.style.zIndex = '999999';
    this.snapGhost.style.transition = 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
    this.snapGhost.style.background = 'rgba(var(--accent-rgb), 0.2)';
    this.snapGhost.style.border = '2px solid var(--accent)';
    this.snapGhost.style.backdropFilter = 'blur(4px)';
    this.snapGhost.style.borderRadius = 'var(--radius-main)';
    this.desktopArea.appendChild(this.snapGhost);
  }

  /**
   * Create a new window
   * @param {Object} options - { id, title, icon, content, width, height, x, y }
   * @returns {HTMLElement} The window frame
   */
  createWindow(options) {
    const id = options.id || `win-${Date.now()}`;
    if (this.windows.has(id)) {
      this.focusWindow(id);
      return this.windows.get(id).frame;
    }

    const frame = document.createElement('div');
    frame.classList.add('app-window');
    frame.id = id;
    frame.style.width = (options.width || 600) + 'px';
    frame.style.height = (options.height || 400) + 'px';
    frame.style.zIndex = ++this.zIndexCounter;

    if (document.documentElement.classList.contains('light-theme')) {
      frame.classList.add('light-window');
    }

    // Center window by default if no position provided
    if (options.x === undefined || options.y === undefined) {
      const dw = this.desktopArea.clientWidth;
      const dh = this.desktopArea.clientHeight;
      const w = options.width || 600;
      const h = options.height || 400;
      frame.style.left = Math.max(10, (dw - w) / 2) + 'px';
      frame.style.top = Math.max(10, (dh - h) / 2) + 'px';
    } else {
      frame.style.left = options.x + 'px';
      frame.style.top = options.y + 'px';
    }

    // Title Bar
    const titleBar = document.createElement('div');
    titleBar.classList.add('app-titlebar');

    const titleGroup = document.createElement('div');
    titleGroup.classList.add('app-title-group');

    const icon = document.createElement('span');
    icon.classList.add('app-icon');
    icon.innerHTML = IconHelper.getIcon(options.icon || 'archive,📦', { size: 16 });

    const title = document.createElement('span');
    title.classList.add('app-title');
    title.textContent = options.title || 'Application';

    titleGroup.appendChild(icon);
    titleGroup.appendChild(title);

    const controls = document.createElement('div');
    controls.classList.add('app-controls');

    const btnMin = document.createElement('button');
    btnMin.classList.add('app-btn', 'btn-min');
    btnMin.innerHTML = '&#8722;'; // Minus

    const btnMax = document.createElement('button');
    btnMax.classList.add('app-btn', 'btn-max');
    btnMax.innerHTML = '&#9723;'; // Square

    const btnClose = document.createElement('button');
    btnClose.classList.add('app-btn', 'btn-close');
    btnClose.innerHTML = '&#10005;'; // X

    controls.appendChild(btnMin);
    controls.appendChild(btnMax);
    controls.appendChild(btnClose);

    titleBar.appendChild(titleGroup);
    titleBar.appendChild(controls);

    // Content Area
    const contentArea = document.createElement('div');
    contentArea.classList.add('app-content');
    if (options.content) {
      if (typeof options.content === 'string') {
        contentArea.innerHTML = options.content;
      } else {
        contentArea.appendChild(options.content);
      }
    }

    // Resize Handles
    const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', `resize-${dir}`);
      handle.dataset.dir = dir;
      return handle;
    });

    frame.appendChild(titleBar);
    frame.appendChild(contentArea);
    resizeHandles.forEach(h => frame.appendChild(h));

    this.desktopArea.appendChild(frame);

    const winObj = {
      id, frame, titleBar, contentArea,
      isMaximized: false,
      isMinimized: false,
      restoreRect: null,
      options,
    };
    this.windows.set(id, winObj);

    // Event Listeners
    frame.addEventListener('mousedown', () => this.focusWindow(id));

    // Prevent context menu from bubbling up to the desktop, and prevent default browser context menu
    frame.addEventListener('contextmenu', (e) => {
      e.stopPropagation();
      // Allow default context menu only on inputs/textareas
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
      if (!isInput) {
        e.preventDefault();
      }
    });

    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });

    btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    });

    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    titleBar.addEventListener('dblclick', () => this.toggleMaximize(id));

    this._makeDraggable(winObj);
    this._makeResizable(winObj);

    this.focusWindow(id);

    // Register with PanelManager taskbar
    if (this.panelManager) {
      this.panelManager.addWindow({
        id: `app-${id}`,
        title: options.title || 'App',
        icon: options.icon || 'archive,📦',
        type: 'webapp',
        onActivate: () => {
          if (winObj.isMinimized) {
            this.restoreWindow(id);
          } else if (this.activeWindow === id) {
            this.minimizeWindow(id);
          } else {
            this.focusWindow(id);
          }
        },
        onClose: () => this.closeWindow(id),
        _active: true
      });
    }

    return winObj;
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (this.activeWindow && this.activeWindow !== id) {
      const prev = this.windows.get(this.activeWindow);
      if (prev) prev.frame.classList.remove('active');
    }

    win.frame.style.zIndex = ++this.zIndexCounter;
    win.frame.classList.add('active');
    this.activeWindow = id;

    if (win.isMinimized) {
      this.restoreWindow(id);
    }

    // Update panel taskbar
    if (this.panelManager) {
      this.panelManager._windowList.forEach(w => w._active = (w.id === `app-${id}`));
      this.panelManager._renderWindowList();
    }
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // Trigger onClose callback if exists
    if (win.options.onClose) win.options.onClose();

    win.frame.style.animation = 'window-close 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => {
      win.frame.remove();
      this.windows.delete(id);

      if (this.activeWindow === id) {
        this.activeWindow = null;
        // Focus top-most window
        let topWin = null;
        let maxZ = -1;
        for (const w of this.windows.values()) {
          if (!w.isMinimized && parseInt(w.frame.style.zIndex) > maxZ) {
            maxZ = parseInt(w.frame.style.zIndex);
            topWin = w;
          }
        }
        if (topWin) this.focusWindow(topWin.id);
      }

      // Remove from taskbar
      if (this.panelManager) {
        this.panelManager.removeWindow(`app-${id}`);
      }
    }, 200);
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.isMaximized) {
      // Restore
      win.frame.style.width = win.restoreRect.width;
      win.frame.style.height = win.restoreRect.height;
      win.frame.style.left = win.restoreRect.left;
      win.frame.style.top = win.restoreRect.top;
      win.frame.classList.remove('maximized');
      win.isMaximized = false;
    } else {
      // Maximize
      win.restoreRect = {
        width: win.frame.style.width,
        height: win.frame.style.height,
        left: win.frame.style.left,
        top: win.frame.style.top,
      };

      // Full screen within desktop area, but expanding into the panel margin leaving a 1px gap
      const isTop = this.panelManager && this.panelManager.position === 'top';

      win.frame.style.left = '0px';
      win.frame.style.width = '100%';

      if (isTop) {
        win.frame.style.top = 'calc((var(--panel-margin-y) * -1) + 1px)';
        win.frame.style.height = 'calc(100% + var(--panel-margin-y) - 1px)';
      } else {
        win.frame.style.top = '0px';
        win.frame.style.height = 'calc(100% + var(--panel-margin-y) - 1px)';
      }

      win.frame.classList.add('maximized');
      win.isMaximized = true;
    }
    this._updateFsButtonPosition();
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.frame.style.display = 'none';
    win.isMinimized = true;

    if (this.activeWindow === id) {
      this.activeWindow = null;
      // Focus another window
      let topWin = null;
      let maxZ = -1;
      for (const w of this.windows.values()) {
        if (!w.isMinimized && parseInt(w.frame.style.zIndex) > maxZ) {
          maxZ = parseInt(w.frame.style.zIndex);
          topWin = w;
        }
      }
      if (topWin) this.focusWindow(topWin.id);
    }

    if (this.panelManager) {
      const task = this.panelManager._windowList.find(w => w.id === `app-${id}`);
      if (task) {
        task._active = false;
        this.panelManager._renderWindowList();
      }
    }
  }

  restoreWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.frame.style.display = '';
    win.isMinimized = false;
    this.focusWindow(id);
  }

  _makeDraggable(win) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    const onMouseDown = (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('.app-btn')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(win.frame.style.left || 0);
      startTop = parseFloat(win.frame.style.top || 0);

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Prevent text selection while dragging
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // If maximized or snapped, restore/unsnap on drag
      if ((win.isMaximized || win.snapState) && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        if (win.isMaximized) {
          this.toggleMaximize(win.id);
        } else {
          this.unsnapWindow(win.id, e.clientX);
        }

        // Recalculate start positions after restore to keep window under cursor
        startLeft = parseFloat(win.frame.style.left);
        startTop = parseFloat(win.frame.style.top);
        startX = e.clientX;
        startY = e.clientY;
        return;
      }

      const newLeft = startLeft + dx;
      const newTop = startTop + dy;
      win.frame.style.left = `${newLeft}px`;
      win.frame.style.top = `${Math.max(0, newTop)}px`; // Prevent dragging above top edge

      // Edge detection for snapping
      this._handleSnapDetection(e.clientX, e.clientY);
    };

    const onMouseUp = (e) => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      this._applySnap(win.id, e.clientX, e.clientY);
    };

    win.titleBar.addEventListener('mousedown', onMouseDown);
  }

  _makeResizable(win) {
    const minWidth = 200;
    const minHeight = 100;

    const handles = win.frame.querySelectorAll('.resize-handle');

    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        if (win.isMaximized) return;

        e.preventDefault();
        e.stopPropagation();
        this.focusWindow(win.id);

        const dir = handle.dataset.dir;
        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = win.frame.getBoundingClientRect();
        // Get desktop bounds for relative positioning
        const desktopRect = this.desktopArea.getBoundingClientRect();

        const onMouseMove = (e) => {
          let newWidth = startRect.width;
          let newHeight = startRect.height;
          let newLeft = startRect.left - desktopRect.left;
          let newTop = startRect.top - desktopRect.top;

          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          // East
          if (dir.includes('e')) newWidth = Math.max(minWidth, startRect.width + dx);
          // South
          if (dir.includes('s')) newHeight = Math.max(minHeight, startRect.height + dy);
          // West
          if (dir.includes('w')) {
            const possibleWidth = startRect.width - dx;
            if (possibleWidth >= minWidth) {
              newWidth = possibleWidth;
              newLeft = startRect.left - desktopRect.left + dx;
            }
          }
          // North
          if (dir.includes('n')) {
            const possibleHeight = startRect.height - dy;
            if (possibleHeight >= minHeight) {
              newHeight = possibleHeight;
              newTop = Math.max(0, startRect.top - desktopRect.top + dy);
            }
          }

          win.frame.style.width = `${newWidth}px`;
          win.frame.style.height = `${newHeight}px`;
          win.frame.style.left = `${newLeft}px`;
          win.frame.style.top = `${newTop}px`;
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  /**
   * Update window title
   */
  setTitle(id, title) {
    const win = this.windows.get(id);
    if (!win) return;
    const titleEl = win.frame.querySelector('.app-title');
    if (titleEl) titleEl.textContent = title;

    // Update panel taskbar
    if (this.panelManager) {
      const task = this.panelManager._windowList.find(w => w.id === `app-${id}`);
      if (task) {
        task.title = title;
        this.panelManager._renderWindowList();
      }
    }
  }

  /**
   * Update window icon
   */
  _handleSnapDetection(x, y) {
    const threshold = 10;
    const dw = this.desktopArea.clientWidth;
    const dh = this.desktopArea.clientHeight;

    if (x < threshold) {
      this._showSnapGhost(0, 0, dw / 2, dh);
    } else if (x > dw - threshold) {
      this._showSnapGhost(dw / 2, 0, dw / 2, dh);
    } else if (y < threshold) {
      this._showSnapGhost(0, 0, dw, dh);
    } else {
      this.snapGhost.style.display = 'none';
    }
  }

  _showSnapGhost(x, y, w, h) {
    this.snapGhost.style.display = 'block';
    this.snapGhost.style.left = x + 'px';
    this.snapGhost.style.top = y + 'px';
    this.snapGhost.style.width = w + 'px';
    this.snapGhost.style.height = h + 'px';
    this.snapGhost.style.opacity = '1';
  }

  _applySnap(id, x, y) {
    const threshold = 10;
    const dw = this.desktopArea.clientWidth;
    const dh = this.desktopArea.clientHeight;
    const win = this.windows.get(id);
    if (!win) return;

    this.snapGhost.style.display = 'none';

    if (x < threshold) {
      this.snapWindow(id, 'left');
    } else if (x > dw - threshold) {
      this.snapWindow(id, 'right');
    } else if (y < threshold) {
      this.toggleMaximize(id);
    }
  }

  snapWindow(id, type) {
    const win = this.windows.get(id);
    if (!win) return;

    if (!win.snapState) {
      win.restoreRect = {
        width: win.frame.style.width,
        height: win.frame.style.height,
        left: win.frame.style.left,
        top: win.frame.style.top,
      };
    }

    const dw = this.desktopArea.clientWidth;
    const dh = this.desktopArea.clientHeight;

    win.frame.classList.add('maximized');
    win.snapState = type;

    if (type === 'left') {
      win.frame.style.left = '0px';
      win.frame.style.top = '0px';
      win.frame.style.width = '50%';
      win.frame.style.height = '100%';
    } else if (type === 'right') {
      win.frame.style.left = '50%';
      win.frame.style.top = '0px';
      win.frame.style.width = '50%';
      win.frame.style.height = '100%';
    }

    this._updateFsButtonPosition();
  }

  unsnapWindow(id, mouseX) {
    const win = this.windows.get(id);
    if (!win || !win.snapState) return;

    const rect = win.restoreRect;
    win.frame.classList.remove('maximized');
    win.snapState = null;

    if (rect) {
      win.frame.style.width = rect.width;
      win.frame.style.height = rect.height;
      // Position window so it's centered under the mouse
      const w = parseFloat(rect.width);
      win.frame.style.left = (mouseX - w / 2) + 'px';
      win.frame.style.top = '10px';
    }

    this._updateFsButtonPosition();
  }
  // fullscreen button position to down if window is snapped or maximized
  _updateFsButtonPosition() {
    const fsBtn = document.getElementById('fullscreen-btn');
    if (!fsBtn) return;

    // Check if any window is currently snapped to the right or maximized
    let needsShift = false;
    for (const win of this.windows.values()) {
      if (win.snapState === 'right' || win.isMaximized) {
        needsShift = true;
        break;
      }
    }

    if (needsShift) {
      fsBtn.style.transform = 'translateY(100px)';
    } else {
      fsBtn.style.transform = 'translateY(0)';
    }
  }

  setIcon(id, icon) {
    const win = this.windows.get(id);
    if (!win) return;
    const iconEl = win.frame.querySelector('.app-icon');
    if (iconEl) iconEl.innerHTML = IconHelper.getIcon(icon, { size: 16 });

    // Update panel taskbar
    if (this.panelManager) {
      const task = this.panelManager._windowList.find(w => w.id === `app-${id}`);
      if (task) {
        task.icon = icon;
        this.panelManager._renderWindowList();
      }
    }
  }
}
