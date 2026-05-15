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
    this.mobileSplitRatio = 0.5;
    this.desktopSplitRatio = 0.5;
    this.splitDivider = null;
    this._lastIsMobile = window.innerWidth <= 768;
    this._createSplitDivider();

    window.addEventListener('resize', () => {
      this._relayout();
    });

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
    if (window.innerWidth <= 768) frame.classList.add('mobile-window');
    if (options.customClass) frame.classList.add(options.customClass);
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

    // Default to maximized on small screens
    const isMobile = window.innerWidth <= 768;

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
    btnMin.innerHTML = '–';

    const btnMax = document.createElement('button');
    if (isMobile) {
      btnMax.classList.add('app-btn', 'btn-split');
      btnMax.title = 'Split Screen';
      btnMax.innerHTML = IconHelper.getIcon('view-dual,🔳', { size: 16 });
    } else {
      btnMax.classList.add('app-btn', 'btn-max');
      btnMax.innerHTML = '◻';
    }

    const btnClose = document.createElement('button');
    btnClose.classList.add('app-btn', 'btn-close');
    btnClose.innerHTML = '×';

    if (options.customControls) {
      options.customControls.forEach(ctrl => controls.appendChild(ctrl));
    }
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
      if (isMobile) {
        const rect = btnMax.getBoundingClientRect();
        this._showSplitMenu(winObj, rect.left, rect.bottom);
      } else {
        this.toggleMaximize(id);
      }
    });


    // mobile gesture helpers
    let lastTap = 0;
    titleBar.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const now = Date.now();
      if (now - lastTap < 300) {
        this.toggleMaximize(id);
      }
      lastTap = now;
    });

    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    this._makeDraggable(winObj);
    this._makeResizable(winObj);

    if (isMobile) {
      // Find occupied slots
      let topOccupied = null;
      let bottomOccupied = null;
      for (const w of this.windows.values()) {
        if (w.id === id) continue;
        if (w.snapState === 'top') topOccupied = w.id;
        if (w.snapState === 'bottom') bottomOccupied = w.id;
      }

      if (!topOccupied && !bottomOccupied) {
        this.toggleMaximize(id);
      } else if (!topOccupied) {
        this.snapWindow(id, 'top');
      } else if (!bottomOccupied) {
        this.snapWindow(id, 'bottom');
      } else {
        // Both occupied, launch fullscreen
        this.toggleMaximize(id);
      }
    } else {
      this.focusWindow(id);
    }

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

    this._updateFsButtonPosition();
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

      // On mobile, if only one snapped window remains, maximize it
      if (window.innerWidth <= 768) {
        const remaining = Array.from(this.windows.values());
        if (remaining.length === 1) {
          const lastWin = remaining[0];
          if (lastWin.snapState) {
            this.toggleMaximize(lastWin.id);
          }
        }
      }
      this._updateSplitDivider();
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
      win.snapState = null; // Clear snap state
    }
    
    // Update Maximize button icon
    const maxBtn = win.frame.querySelector('.btn-max');
    if (maxBtn) {
      maxBtn.innerHTML = win.isMaximized ? '▣' : '◻';
    }

    this._updateFsButtonPosition();
    this._updateSplitDivider();
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
    let longPressTimeout;
    let lastTapTime = 0;

    const onPointerDown = (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('.app-btn')) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      const isMobile = window.innerWidth <= 768;
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;
      
      // Custom double-tap detection for mobile (more reliable than dblclick)
      if (timeSinceLastTap < 300) {
        clearTimeout(longPressTimeout);
        
        if (win.isMaximized) {
          if (isMobile) {
            const windows = Array.from(this.windows.values());
            const isTopOccupied = windows.some(w => w.id !== win.id && w.snapState === 'top');
            this.snapWindow(win.id, isTopOccupied ? 'bottom' : 'top');
          } else {
            this.snapWindow(win.id, 'left');
          }
        } else {
          this.toggleMaximize(win.id);
        }
        
        lastTapTime = 0; // Reset
        return;
      }
      lastTapTime = now;
      
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(win.frame.style.left || 0);
      startTop = parseFloat(win.frame.style.top || 0);

      const startDrag = () => {
        isDragging = true;
        win.frame.classList.add('dragging');
        win.titleBar.setPointerCapture(e.pointerId);
        
        // Visual/Haptic feedback for mobile
        if (isMobile && navigator.vibrate) {
          navigator.vibrate(20);
        }
      };

      if (isMobile) {
        // Require long press on mobile
        longPressTimeout = setTimeout(() => {
          startDrag();
        }, 250);
      } else {
        startDrag();
      }

      win.titleBar.addEventListener('pointermove', onPointerMove);
      win.titleBar.addEventListener('pointerup', onPointerUp);
      win.titleBar.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e) => {
      const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--system-scale')) || 1;
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;
      const isMobile = window.innerWidth <= 768;

      if (isMobile && !isDragging) {
        // Cancel long press if moved too much before activation
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(longPressTimeout);
        }
      }

      if (!isDragging) return;

      if (isMobile) {
        if (win.isMaximized || win.snapState) {
          // Follow cursor 1:1 for immediate feel with hardware acceleration
          // Even snapped windows now follow the cursor to allow 'picking and dropping'
          win.frame.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.98)`;
          
          if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
            this._handleSnapDetection(e.clientX, e.clientY);
          }
        }
      } else {
        // Desktop move
        const dragThreshold = 10;
        if ((win.isMaximized || win.snapState) && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
          if (win.isMaximized) {
            this.toggleMaximize(win.id);
          } else {
            this.unsnapWindow(win.id, e.clientX);
          }
          // Reset start positions to current to avoid jumping after unsnap
          startX = e.clientX;
          startY = e.clientY;
          startLeft = parseFloat(win.frame.style.left || 0);
          startTop = parseFloat(win.frame.style.top || 0);
        }

        const dw = this.desktopArea.clientWidth;
        const dh = this.desktopArea.clientHeight;
        const ww = win.frame.offsetWidth;
        const wh = win.frame.offsetHeight;

        let newLeft = startLeft + dx;
        let newTop = startTop + dy;
        
        // Desktop bounds enforcement
        newLeft = Math.max(0, Math.min(dw - ww, newLeft));
        newTop = Math.max(0, Math.min(dh - wh, newTop));
        
        win.frame.style.left = `${newLeft}px`;
        win.frame.style.top = `${newTop}px`;

        this._handleSnapDetection(e.clientX, e.clientY);
      }
      
      this._updateFsButtonPosition();
    };

    const onPointerUp = (e) => {
      clearTimeout(longPressTimeout);
      if (!isDragging) return;
      isDragging = false;
      win.titleBar.releasePointerCapture(e.pointerId);
      win.titleBar.removeEventListener('pointermove', onPointerMove);
      win.titleBar.removeEventListener('pointerup', onPointerUp);
      win.titleBar.removeEventListener('pointercancel', onPointerUp);

      win.frame.classList.remove('dragging');

      // Clear mobile feedback transform
      if (window.innerWidth <= 768) {
        win.frame.style.transform = '';
      }

      this._applySnap(win.id, e.clientX, e.clientY);
    };

    win.titleBar.addEventListener('pointerdown', onPointerDown);
    // Ensure touch-action is none to prevent browser handling touch gestures
    win.titleBar.style.touchAction = 'none';
  }

  _makeResizable(win) {
    const minWidth = 200;
    const minHeight = 100;

    const handles = win.frame.querySelectorAll('.resize-handle');

    handles.forEach(handle => {
      handle.style.touchAction = 'none';
      handle.addEventListener('pointerdown', (e) => {
        if (win.isMaximized) return;
        // On mobile, snapped windows are resizable
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        e.preventDefault();
        e.stopPropagation();
        this.focusWindow(win.id);

        const dir = handle.dataset.dir;
        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = win.frame.getBoundingClientRect();
        // Get desktop bounds for relative positioning
        const desktopRect = this.desktopArea.getBoundingClientRect();

        handle.setPointerCapture(e.pointerId);

        const onPointerMove = (e) => {
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
          this._updateFsButtonPosition();
        };

        const onPointerUp = (e) => {
          handle.releasePointerCapture(e.pointerId);
          handle.removeEventListener('pointermove', onPointerMove);
          handle.removeEventListener('pointerup', onPointerUp);
          handle.removeEventListener('pointercancel', onPointerUp);
        };

        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
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
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 40 : 10;
    const dw = this.desktopArea.clientWidth;
    const dh = this.desktopArea.clientHeight;

    if (isMobile) {
      if (y < threshold) {
        this._showSnapGhost(0, 0, dw, dh / 2); // Top half on mobile
      } else if (y > dh - threshold) {
        this._showSnapGhost(0, dh / 2, dw, dh / 2); // Bottom half on mobile
      } else {
        this.snapGhost.style.display = 'none';
      }
    } else {
      if (y < threshold || y > dh - threshold) {
        this._showSnapGhost(0, 0, dw, dh); // Maximize on desktop (top or bottom edge)
      } else if (x < threshold) {
        this._showSnapGhost(0, 0, dw / 2, dh); // Left half
      } else if (x > dw - threshold) {
        this._showSnapGhost(dw / 2, 0, dw / 2, dh); // Right half
      } else {
        this.snapGhost.style.display = 'none';
      }
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
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 40 : 10;
    const dw = this.desktopArea.clientWidth;
    const dh = this.desktopArea.clientHeight;
    const win = this.windows.get(id);
    if (!win) return;

    this.snapGhost.style.display = 'none';

    if (isMobile) {
      if (y < threshold) {
        this.snapWindow(id, 'top');
      } else if (y > dh - threshold) {
        this.snapWindow(id, 'bottom');
      }
    } else {
      if (y < threshold || y > dh - threshold) {
        if (!win.isMaximized) {
          this.toggleMaximize(id);
        }
      } else if (x < threshold) {
        this.snapWindow(id, 'left');
      } else if (x > dw - threshold) {
        this.snapWindow(id, 'right');
      }
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
    const isMobile = window.innerWidth <= 768;

    win.frame.classList.add('maximized');
    win.snapState = type;
    win.isMaximized = false; // Tiled is not Fullscreen

    if (type === 'left') {
      win.frame.style.left = '0px';
      win.frame.style.top = '0px';
      const width = isMobile ? (dw / 2) : (dw * this.desktopSplitRatio);
      win.frame.style.width = width + 'px';
      win.frame.style.height = '100%';
    } else if (type === 'right') {
      const left = isMobile ? (dw / 2) : (dw * this.desktopSplitRatio);
      win.frame.style.left = left + 'px';
      win.frame.style.top = '0px';
      win.frame.style.width = (dw - left) + 'px';
      win.frame.style.height = '100%';
    } else if (type === 'top') {
      win.frame.style.left = '0px';
      win.frame.style.top = '0px';
      win.frame.style.width = '100%';
      const height = isMobile ? (dh * this.mobileSplitRatio) : (dh / 2);
      win.frame.style.height = height + 'px';
    } else if (type === 'bottom') {
      win.frame.style.left = '0px';
      const top = isMobile ? (dh * this.mobileSplitRatio) : (dh / 2);
      win.frame.style.top = top + 'px';
      win.frame.style.width = '100%';
      win.frame.style.height = (dh - top) + 'px';
    }

    this._updateFsButtonPosition();
    this._updateSplitDivider();
  }

  _createSplitDivider() {
    const divider = document.createElement('div');
    divider.className = 'mobile-split-divider';
    divider.style.display = 'none';
    this.desktopArea.appendChild(divider);
    this.splitDivider = divider;

    let isDragging = false;

    divider.addEventListener('pointerdown', (e) => {
      isDragging = true;
      divider.setPointerCapture(e.pointerId);
      divider.classList.add('dragging');
      e.preventDefault();
    });

    divider.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      if (this._resizeAnimationFrame) cancelAnimationFrame(this._resizeAnimationFrame);
      
      this._resizeAnimationFrame = requestAnimationFrame(() => {
        const dw = this.desktopArea.clientWidth;
        const dh = this.desktopArea.clientHeight;
        const isMobile = window.innerWidth <= 768;
        
        // Detect current orientation from active split
        let isVertical = isMobile;
        this.windows.forEach(w => {
            if (w.snapState === 'left' || w.snapState === 'right') isVertical = false;
            if (w.snapState === 'top' || w.snapState === 'bottom') isVertical = true;
        });

        if (isVertical) {
            const newRatio = Math.max(0.1, Math.min(0.9, e.clientY / dh));
            this.mobileSplitRatio = newRatio;
            const topHeight = dh * newRatio;
            this.windows.forEach(w => {
                if (w.snapState === 'top') {
                    w.frame.style.height = `${topHeight}px`;
                } else if (w.snapState === 'bottom') {
                    w.frame.style.top = `${topHeight}px`;
                    w.frame.style.height = `${dh - topHeight}px`;
                }
            });
        } else {
            const newRatio = Math.max(0.1, Math.min(0.9, e.clientX / dw));
            this.desktopSplitRatio = newRatio;
            const leftWidth = dw * newRatio;
            this.windows.forEach(w => {
                if (w.snapState === 'left') {
                    w.frame.style.width = `${leftWidth}px`;
                } else if (w.snapState === 'right') {
                    w.frame.style.left = `${leftWidth}px`;
                    w.frame.style.width = `${dw - leftWidth}px`;
                }
            });
        }
        this._updateSplitDivider();
      });
    });

    divider.addEventListener('pointerup', () => {
      isDragging = false;
      divider.classList.remove('dragging');
    });
  }

  _updateSplitDivider() {
    if (!this.splitDivider) return;

    const dw = this.desktopArea.clientWidth;
    const dh = this.desktopArea.clientHeight;
    
    let topWin = null, bottomWin = null;
    let leftWin = null, rightWin = null;

    this.windows.forEach(w => {
        if (w.snapState === 'top') topWin = w;
        if (w.snapState === 'bottom') bottomWin = w;
        if (w.snapState === 'left') leftWin = w;
        if (w.snapState === 'right') rightWin = w;
    });

    if (topWin && bottomWin) {
      const y = dh * this.mobileSplitRatio;
      this.splitDivider.style.display = 'flex';
      this.splitDivider.classList.remove('horizontal');
      this.splitDivider.classList.add('vertical');
      this.splitDivider.style.top = (y - 4) + 'px';
      this.splitDivider.style.left = '0';
      this.splitDivider.style.width = '100%';
      this.splitDivider.style.height = '8px';
      this.splitDivider.style.zIndex = '9999';
    } else if (leftWin && rightWin) {
      const x = dw * this.desktopSplitRatio;
      this.splitDivider.style.display = 'flex';
      this.splitDivider.classList.remove('vertical');
      this.splitDivider.classList.add('horizontal');
      this.splitDivider.style.left = (x - 4) + 'px';
      this.splitDivider.style.top = '0';
      this.splitDivider.style.width = '8px';
      this.splitDivider.style.height = '100%';
      this.splitDivider.style.zIndex = '9999';
    } else {
      this.splitDivider.style.display = 'none';
    }
  }

  _showSplitMenu(win, x, y) {
    const isMobile = window.innerWidth <= 768;
    
    // Check occupied slots on mobile
    let topWin = null;
    let bottomWin = null;
    if (isMobile) {
      this.windows.forEach(w => {
        if (w.id === win.id) return;
        if (w.snapState === 'top') topWin = w;
        if (w.snapState === 'bottom') bottomWin = w;
      });
    }

    const items = isMobile ? [
      {
        icon: 'view-split-top,🔼',
        label: topWin ? `Split with ${topWin.options.title || 'App'}` : 'Split Top',
        action: () => {
          if (topWin && bottomWin) {
             // If both occupied, we need to choose which one to replace
             this._showWindowSelection(win.id, 'top');
          } else {
             this.snapWindow(win.id, 'top');
          }
        },
      },
      {
        icon: 'view-split-bottom,🔽',
        label: bottomWin ? `Split with ${bottomWin.options.title || 'App'}` : 'Split Bottom',
        action: () => {
          if (topWin && bottomWin) {
             this._showWindowSelection(win.id, 'bottom');
          } else {
             this.snapWindow(win.id, 'bottom');
          }
        },
      },
    ] : [
      {
        icon: 'view-split-left,🌓',
        label: 'Split Left',
        action: () => this.snapWindow(win.id, 'left'),
      },
      {
        icon: 'view-split-right,🌗',
        label: 'Split Right',
        action: () => this.snapWindow(win.id, 'right'),
      },
    ];

    items.push({
      icon: 'view-fullscreen,⬜',
      label: 'Full Screen',
      action: () => {
        if (!win.isMaximized) {
          this.toggleMaximize(win.id);
        }
      },
    });

    import('./contextMenu.js').then(({ showContextMenu }) => {
      showContextMenu(items, x, y, false, win.frame.querySelector('.btn-split'));
    });
  }

  _showWindowSelection(id, targetSlot) {
    const items = [];
    this.windows.forEach(w => {
      if (w.id === id) return;
      if (w.snapState === 'top' || w.snapState === 'bottom') {
        items.push({
          icon: w.options.icon || 'archive,📦',
          label: `Replace ${w.options.title || 'App'}`,
          action: () => {
            // Unsnap the old window
            this.toggleMaximize(w.id);
            // Snap the new one to its slot
            this.snapWindow(id, w.snapState);
          }
        });
      }
    });

    // Show selection menu
    import('./contextMenu.js').then(({ showContextMenu }) => {
      const win = this.windows.get(id);
      const btn = win.frame.querySelector('.btn-split');
      const rect = btn.getBoundingClientRect();
      showContextMenu(items, rect.left, rect.bottom, false, btn);
    });
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

    let needsShift = false;
    const dw = window.innerWidth;

    for (const win of this.windows.values()) {
      if (win.isMinimized) continue;
      
      // Check if maximized or specifically snapped to corners that collide
      if (win.isMaximized || win.snapState === 'right' || win.snapState === 'top') {
        needsShift = true;
        break;
      }

      // Proximity check: if window top-right corner is near screen top-right
      const winRect = win.frame.getBoundingClientRect();
      if (winRect.right > dw - 120 && winRect.top < 120) {
        needsShift = true;
        break;
      }
    }

    if (needsShift) {
      fsBtn.style.transform = 'translateY(80px)';
      fsBtn.style.opacity = '0.7';
    } else {
      fsBtn.style.transform = 'translateY(0)';
      fsBtn.style.opacity = '1';
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

  _relayout() {
    const isMobile = window.innerWidth <= 768;
    const transitioningToMobile = isMobile && !this._lastIsMobile;
    const transitioningToDesktop = !isMobile && this._lastIsMobile;
    
    this.windows.forEach(win => {
      if (transitioningToMobile) {
        if (win.id === this.activeWindow && !win.snapState && !win.isMaximized) {
          this.toggleMaximize(win.id);
        } else if (win.snapState) {
          let newState = win.snapState;
          if (win.snapState === 'left') newState = 'top';
          if (win.snapState === 'right') newState = 'bottom';
          this.snapWindow(win.id, newState);
        }
      } else if (transitioningToDesktop) {
        if (win.isMaximized) {
          this.toggleMaximize(win.id);
        } else if (win.snapState) {
          this.unsnapWindow(win.id);
        }
      } else {
        // Continuous resizing logic
        if (win.isMaximized) {
          // Re-maximize to update bounds
          this.toggleMaximize(win.id);
          this.toggleMaximize(win.id);
        } else if (win.snapState) {
          this.snapWindow(win.id, win.snapState);
        } else {
          // Contain within bounds
          const dw = this.desktopArea.clientWidth;
          const dh = this.desktopArea.clientHeight;
          const ww = win.frame.offsetWidth;
          const wh = win.frame.offsetHeight;
          let left = parseFloat(win.frame.style.left);
          let top = parseFloat(win.frame.style.top);
          left = Math.max(10, Math.min(dw - ww - 10, left));
          top = Math.max(10, Math.min(dh - wh - 10, top));
          win.frame.style.left = left + 'px';
          win.frame.style.top = top + 'px';
        }
      }
    });
    
    this._lastIsMobile = isMobile;
    this._updateFsButtonPosition();
    this._updateSplitDivider();
  }
}
