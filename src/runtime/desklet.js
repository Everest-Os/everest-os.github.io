/**
 * Mock Desklet base class — Creates draggable desktop widgets
 * with context menu support for settings, visibility, and removal.
 */
import { SignalMixin } from './signals.js';
import { showContextMenu } from './contextMenu.js';

// ── DeskletBase ───────────────────────────────────────────────────────
class DeskletBase {
  constructor(metadata, deskletId) {
    this._init(metadata, deskletId);
  }

  _init(metadata, deskletId) {
    this.DeskletDecoration = {
      NONE: 0,
      BORDER: 1,
      CAPTION: 2
    };
    this.metadata = metadata || {};
    this._deskletId = deskletId || 'sandbox-desklet';
    this._uuid = metadata?.uuid || '';
    this._contextMenuItems = [];

    // Create the desklet frame
    this._frame = document.createElement('div');
    this._frame.classList.add('desklet-frame');
    this._frame.dataset.uuid = this._uuid;

    // Decorations (title bar)
    this._titleBar = document.createElement('div');
    this._titleBar.classList.add('desklet-title-bar');
    const title = document.createElement('span');
    title.textContent = metadata?.name || 'Desklet';
    title.classList.add('desklet-title-text');
    this._titleBar.appendChild(title);

    const preventDeco = metadata?.['prevent-decorations'] || false;
    this._decorationsEnabled = !preventDeco;

    const savedShowTitle = localStorage.getItem(`desklet-show-title-${this._uuid}`);
    if (savedShowTitle !== null) {
      this._decorationsEnabled = savedShowTitle === 'true';
    }

    if (this._titleBar) {
      this._frame.appendChild(this._titleBar);
    }

    if (!this._decorationsEnabled && this._titleBar) {
      this._titleBar.style.display = 'none';
      this._frame.classList.add('no-decorations');
    }

    // Content area
    this._contentArea = document.createElement('div');
    this._contentArea.classList.add('desklet-content');
    this._frame.appendChild(this._contentArea);

    // Actor reference for CJS compatibility
    // The frame has position: absolute with left/top set by _renderDesklet.
    // set_style must NOT wipe those positioning properties.
    const self = this;
    this.actor = {
      _element: this._frame,
      reactive: true,
      connect: (sig, cb) => {
        if (sig === 'button-release-event' || sig === 'button-press-event') {
          this._frame.addEventListener(sig === 'button-release-event' ? 'mouseup' : 'mousedown', (domEvent) => {
            if (sig === 'button-release-event' && this._hasDragged) return; // Block click after drag
            const fakeEvent = {
              get_button: () => domEvent.button + 1,
              get_coords: () => [domEvent.clientX, domEvent.clientY],
              get_state: () => 0,
              get_time: () => Date.now(),
            };
            try { cb(self.actor, fakeEvent); } catch (e) {
              window.__everestConsole?.logError(`Signal handler error [${sig}]: ${e.message}`);
            }
          });
          return 0;
        }
        return self.connect(sig, cb);
      },
      add_style_class_name: (c) => this._frame.classList.add(c),
      remove_style_class_name: (c) => this._frame.classList.remove(c),
      show: () => this._frame.style.display = '',
      hide: () => this._frame.style.display = 'none',
      set_style: (s) => {
        // Preserve position and animation-critical properties
        const preserve = {};
        for (const key of ['left', 'top', 'right', 'bottom', 'position', 'z-index']) {
          const val = this._frame.style.getPropertyValue(key);
          if (val) preserve[key] = val;
        }
        // Apply new styles by merging, not replacing
        if (s) {
          const props = s.split(';').filter(Boolean);
          for (const prop of props) {
            const colonIdx = prop.indexOf(':');
            if (colonIdx === -1) continue;
            const key = prop.slice(0, colonIdx).trim();
            let val = prop.slice(colonIdx + 1).trim();
            let priority = '';
            if (val.toLowerCase().includes('!important')) {
              priority = 'important';
              val = val.replace(/!important/i, '').trim();
            }
            if (key) {
              this._frame.style.setProperty(key, val, priority);
              if (key === 'background' || key === 'background-color' || key === 'background-image') {
                this._frame.classList.add('has-custom-background');
              }
            }
          }
        }
        // Restore preserved
        for (const [key, val] of Object.entries(preserve)) {
          this._frame.style.setProperty(key, val);
        }
      },
      get_style: () => this._frame.getAttribute('style') || '',
      set_size: (w, h) => { if (w >= 0) this._frame.style.width = w + 'px'; if (h >= 0) this._frame.style.height = h + 'px'; },
      set_position: (x, y) => { this._frame.style.left = x + 'px'; this._frame.style.top = y + 'px'; },
      get_parent: () => null,
      destroy: () => self.destroy(),
    };



    // Make draggable
    this._makeDraggable();
    window.addEventListener('resize', () => this._relayout());
    
    // Check for saved scale
    this._restoreSizeAndScale();

    this._relayout();
  }

  _restoreSizeAndScale() {
      const w = this._frame.style.width;
      const h = this._frame.style.height;
      const s = this._frame.dataset.scale;
      
      if (s && w && h) {
          const scale = parseFloat(s);
          this._contentArea.style.transform = `scale(${scale})`;
          this._contentArea.style.transformOrigin = 'top left';
          // Calculate the original width that would result in this width at this scale
          const logicalW = parseFloat(w) / scale;
          this._contentArea.style.width = logicalW + 'px';
      }
  }

  // ── Context Menu ──────────────────────────────────────────────────
  _buildContextMenuItems() {
    const items = [];
    const uuid = this._uuid;

    // Extension-specific context menu items (added by subclasses)
    if (this._contextMenuItems.length > 0) {
      for (const item of this._contextMenuItems) {
        items.push(item);
      }
      items.push({ separator: true });
    }

    // Settings
    items.push({
      icon: 'settings,⚙️',
      label: 'Configure...',
      action: () => {
        window.dispatchEvent(new CustomEvent('open-desklet-settings', {
          detail: { uuid }
        }));
      },
    });

    items.push({
      icon: 'info-circle,ℹ️',
      label: 'About...',
      action: () => {
        window.dispatchEvent(new CustomEvent('open-extension-about', {
          detail: { uuid }
        }));
      }
    });

    // Decorations toggle
    items.push({
      icon: 'view-fullscreen,🖼️',
      label: this._decorationsEnabled ? 'Hide Title Bar' : 'Show Title Bar',
      action: () => {
        if (this._titleBar) {
          if (this._decorationsEnabled) {
            this._titleBar.style.display = 'none';
            this._frame.classList.add('no-decorations');
            this._decorationsEnabled = false;
          } else {
            this._titleBar.style.display = '';
            this._frame.classList.remove('no-decorations');
            this._decorationsEnabled = true;
          }
          localStorage.setItem(`desklet-show-title-${this._uuid}`, this._decorationsEnabled);
          // Re-sync content styles to handle border-radius changes
          const contentEl = this._contentArea.firstChild;
          if (contentEl && contentEl.getAttribute) {
            const styleStr = contentEl.getAttribute('style') || '';
            const styles = {};
            styleStr.split(';').forEach(rule => {
                const idx = rule.indexOf(':');
                if (idx !== -1) styles[rule.slice(0, idx).trim().toLowerCase()] = rule.slice(idx + 1).trim();
            });
            if (styles['border-radius']) {
                if (this._decorationsEnabled) {
                    contentEl.style.borderTopLeftRadius = '0px';
                    contentEl.style.borderTopRightRadius = '0px';
                } else {
                    contentEl.style.borderTopLeftRadius = styles['border-radius'];
                    contentEl.style.borderTopRightRadius = styles['border-radius'];
                }
            }
          }
        }
      },
    });

    const isResizing = this._frame.classList.contains('desklet-resizing-mode');
    items.push({
      icon: 'transform,↔️',
      label: isResizing ? 'Finish Resizing' : 'Resize...',
      action: () => this._toggleResizeMode(),
    });

    if (this._frame.style.width || this._frame.style.height) {
        items.push({
            icon: 'undo,↩️',
            label: 'Reset Size',
            action: () => {
                this._frame.style.width = '';
                this._frame.style.height = '';
                this._contentArea.style.transform = '';
                this._contentArea.style.width = '';
                delete this._frame.dataset.scale;
                if (this.on_resize) this.on_resize();
                this._savePosition();
            }
        });
    }

    items.push({ separator: true });

    // Reload
    items.push({
      icon: 'view-refresh,🔄',
      label: 'Reload Desklet',
      action: () => {
        window.dispatchEvent(new CustomEvent('reload-extension', {
          detail: { uuid }
        }));
      },
    });

    items.push({ separator: true });

    // Remove
    items.push({
      icon: 'trash,🗑️',
      label: 'Remove from Desktop',
      danger: true,
      action: () => this._removeDesklet(),
    });

    return items.filter(Boolean);
  }

  _showContextMenu(x, y) {
    try {
      const items = this._buildContextMenuItems();
      if (!items || items.length === 0) return;
      showContextMenu(items, x, y);
    } catch (e) {
      console.error('Desklet context menu error:', e);
      window.__everestConsole?.logError(`Desklet menu error: ${e.message}`);
    }
  }

  // Allow extensions to add custom context menu items
  addContextMenuItem(item) {
    this._contextMenuItems.push(item);
  }

  // ── Content ─────────────────────────────────────────────────────────
  setContent(actor) {
    this._contentArea.innerHTML = '';
    if (actor) {
      const el = actor._element || actor.element;
      if (el) {
        this._contentArea.appendChild(el);
        if (this._titleBar) {
          this._frame.insertBefore(this._titleBar, this._contentArea);
        }

        const syncStyles = () => {
          const styleStr = el.getAttribute('style') || '';
          const styles = {};
          styleStr.split(';').forEach(rule => {
            const idx = rule.indexOf(':');
            if (idx === -1) return;
            const k = rule.slice(0, idx).trim().toLowerCase();
            const v = rule.slice(idx + 1).trim();
            if (k) styles[k] = v;
          });

          if (styles['background'] || styles['background-color'] || styles['background-image']) {
            this._frame.classList.add('has-custom-background');
          } else {
            this._frame.classList.remove('has-custom-background');
          }

          if (this._titleBar) {
            if (styles['background-color']) {
              this._titleBar.style.backgroundColor = styles['background-color'];
            }
            if (styles['background']) {
              this._titleBar.style.background = styles['background'];
            }
            if (styles['border-radius']) {
              if (this._decorationsEnabled) {
                this._titleBar.style.borderTopLeftRadius = styles['border-radius'];
                this._titleBar.style.borderTopRightRadius = styles['border-radius'];
                el.style.borderTopLeftRadius = '0px';
                el.style.borderTopRightRadius = '0px';
              } else {
                el.style.borderTopLeftRadius = styles['border-radius'];
                el.style.borderTopRightRadius = styles['border-radius'];
              }
            }
            if (styles['color']) {
              this._titleBar.style.color = styles['color'];
            }
          }
        };

        syncStyles();

        const observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'style') {
              observer.disconnect();
              syncStyles();
              observer.observe(el, { attributes: true, attributeFilter: ['style'] });
            }
          }
        });

        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
      }
    }
  }

  setHeader(text) {
    if (this._titleBar) {
      const titleEl = this._titleBar.querySelector('.desklet-title-text');
      if (titleEl) titleEl.textContent = text;
    }
  }

  set_decorations(decorations) {
    if (decorations === 0) { // NONE
      this._decorationsEnabled = false;
      this._frame.classList.add('no-decorations');
      if (this._titleBar) this._titleBar.style.display = 'none';
    } else {
      this._decorationsEnabled = true;
      this._frame.classList.remove('no-decorations');
      if (this._titleBar) this._titleBar.style.display = '';
    }
  }

  _removeDesklet() {
    this._frame.classList.add('desklet-removing');
    setTimeout(() => {
      if (this._frame.parentNode) this._frame.parentNode.removeChild(this._frame);
      try { this.on_desklet_removed(); } catch (e) { }
      // Notify the loader
      window.dispatchEvent(new CustomEvent('desklet-removed', {
        detail: { uuid: this._uuid }
      }));
    }, 300);
  }

  on_desklet_removed() { }
  on_desklet_added_to_desktop() { }
  on_desklet_clicked(event) { }

  _makeDraggable() {
    let isDragging = false, startX, startY, startLeft, startTop;
    this._hasDragged = false;
    let longPressTimeout;

    const startDrag = (pointerId) => {
      isDragging = true;
      this._hasDragged = false;
      this._frame.style.cursor = 'grabbing';
      if (this._titleBar) this._titleBar.style.cursor = 'grabbing';
      this._frame.classList.add('desklet-moving-mode');
      this._frame.setPointerCapture(pointerId);
    };

    const onPointerMove = (e) => {
      const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--system-scale')) || 1;
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;

      if (!isDragging && (Math.abs(dx * scale) > 5 || Math.abs(dy * scale) > 5)) {
        this._hasDragged = true;
        clearTimeout(longPressTimeout);
        clearTimeout(this._ctxTimeout);
        startDrag(e.pointerId);
      }

      if (!isDragging) return;
      this._frame.style.left = (startLeft + dx) + 'px';
      this._frame.style.top = (startTop + dy) + 'px';
    };

    const onPointerUp = (e) => {
      clearTimeout(longPressTimeout);
      clearTimeout(this._ctxTimeout);
      this._frame.removeEventListener('pointermove', onPointerMove);
      this._frame.removeEventListener('pointerup', onPointerUp);
      this._frame.removeEventListener('pointercancel', onPointerUp);

      if (isDragging) {
        isDragging = false;
        this._frame.releasePointerCapture(e.pointerId);
        this._frame.style.cursor = 'grab';
        if (this._titleBar) this._titleBar.style.cursor = 'grab';
        this._frame.classList.remove('desklet-moving-mode');
        setTimeout(() => this._hasDragged = false, 50);
        
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) {
          this._desktopPos = { 
            x: parseFloat(this._frame.style.left), 
            y: parseFloat(this._frame.style.top) 
          };
        }
        this._savePosition();
      }
    };

    const onPointerDown = (e) => {
      if (e.target.closest('button, input, select, a')) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return; // Only left-click or touch drags

      const isMobile = window.innerWidth <= 768;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = this._frame.offsetLeft;
      startTop = this._frame.offsetTop;



      if (isMobile) {
        // Second timeout for context menu remains for mobile long-press
        this._ctxTimeout = setTimeout(() => {
          if (!this._hasDragged && !isDragging) {
            e.stopPropagation();
            this._showContextMenu(e.clientX, e.clientY);
          }
        }, 600);
      } else {
        // Desktop starts drag immediately on pointerdown
        // Store desktop position before any mobile relocation
        if (!this._desktopPos) {
          this._desktopPos = { x: startLeft, y: startTop };
        }
        startDrag(e.pointerId);
      }

      this._frame.addEventListener('pointermove', onPointerMove);
      this._frame.addEventListener('pointerup', onPointerUp);
      this._frame.addEventListener('pointercancel', onPointerUp);
    };

    if (this._titleBar) {
      this._titleBar.style.cursor = 'grab';
    }

    this._frame.style.cursor = 'grab';
    this._frame.style.touchAction = 'none';
    this._frame.addEventListener('pointerdown', onPointerDown);



    this._frame.addEventListener('click', (e) => {
      if (this._hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, { capture: true });

    // Listen for setting changes that might affect size
    window.addEventListener('settings-changed', (e) => {
      if (e.detail.uuid === this._uuid || e.detail.instanceId === this._deskletId) {
        const key = e.detail.key.toLowerCase();
        // If the setting looks like it controls size or scale, reset manual override
        if (key.includes('height') || key.includes('width') || key.includes('scale') || key.includes('size')) {
          this._frame.style.width = '';
          this._frame.style.height = '';
          if (this.on_resize) this.on_resize();
          this._savePosition();
        }
      }
    });

    // Context menu on right-click
    this._frame.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._showContextMenu(e.clientX, e.clientY);
    });
  }


  _relayout() {
    if (this._frame.classList.contains('desklet-moving-mode') || this._frame.classList.contains('desklet-resizing-mode')) return;
    const isMobile = window.innerWidth <= 768;
    const desktop = document.getElementById('everest-desktop');
    const dw = desktop?.clientWidth || document.body.clientWidth;
    const dh = desktop?.clientHeight || document.body.clientHeight;
    
    let x = parseFloat(this._frame.style.left);
    let y = parseFloat(this._frame.style.top);
    const ww = this._frame.offsetWidth;
    const wh = this._frame.offsetHeight;

    if (isMobile) {
        // On transition to mobile, if we haven't stored desktop pos, do it now
        if (!this._desktopPos) {
            this._desktopPos = { x, y };
        }
        // Center on mobile or scale down
        this._frame.style.maxWidth = 'calc(100vw - 20px)';
        if (x + ww > dw) x = Math.max(10, dw - ww - 10);
        if (y + wh > dh) y = Math.max(10, dh - wh - 10);
    } else {
        this._frame.style.maxWidth = '';
        // Restore from desktop pos if it exists
        if (this._desktopPos) {
            x = this._desktopPos.x;
            y = this._desktopPos.y;
        }
    }

    x = Math.max(0, Math.min(dw - ww, x));
    y = Math.max(0, Math.min(dh - wh, y));

    this._frame.style.left = x + 'px';
    this._frame.style.top = y + 'px';
  }

  _toggleResizeMode() {
    if (this._frame.classList.contains('desklet-resizing-mode')) {
      this._frame.classList.remove('desklet-resizing-mode');
      const handle = this._frame.querySelector('.desklet-resize-handle');
      if (handle) handle.remove();
      
      const overlay = document.querySelector('.desklet-resize-overlay');
      if (overlay) overlay.remove();
      
      const doneBtn = document.querySelector('.resize-done-btn');
      if (doneBtn) doneBtn.remove();

      this._savePosition();
    } else {
      this._frame.classList.add('desklet-resizing-mode');
      
      const overlay = document.createElement('div');
      overlay.className = 'desklet-resize-overlay';
      
      const doneBtn = document.createElement('div');
      doneBtn.className = 'resize-done-btn';
      doneBtn.textContent = 'Finish Resizing';
      
      const deskletLayer = document.querySelector('.desklet-layer') || document.getElementById('everest-desktop') || document.body;
      deskletLayer.appendChild(overlay);
      deskletLayer.appendChild(doneBtn);
      
      doneBtn.onclick = (e) => {
          e.stopPropagation();
          this._toggleResizeMode();
      };

      const handle = document.createElement('div');
      handle.className = 'desklet-resize-handle';
      handle.innerHTML = '⤡';
      this._frame.appendChild(handle);

      let startW, startH, startX, startY;
      let initialContentW = this._contentArea.scrollWidth;
      let initialContentH = this._contentArea.scrollHeight;

      const onMove = (e) => {
        const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--system-scale')) || 1;
        const dw = (e.clientX - startX) / scale;
        const dh = (e.clientY - startY) / scale;
        const scaleX = (startW + dw) / startW;
        const scaleY = (startH + dh) / startH;
        
        // Ensure we don't scale below minimum dimensions (100x40)
        const minScale = Math.max(100 / startW, 40 / startH);
        const uniformScale = Math.max(minScale, Math.min(scaleX, scaleY));
        
        this._contentArea.style.transform = `scale(${uniformScale})`;
        this._contentArea.style.transformOrigin = 'top left';
        this._contentArea.style.width = startW + 'px'; 
        this._contentArea.style.height = startH + 'px';
        
        // Sync frame size exactly with scaled content to eliminate gaps
        this._frame.style.width = (startW * uniformScale) + 'px';
        this._frame.style.height = (startH * uniformScale) + 'px';
        
        this._frame.dataset.scale = uniformScale;
        
        if (this.on_resize) this.on_resize();
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        this._savePosition();
      };

      handle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        startW = this._frame.offsetWidth;
        startH = this._frame.offsetHeight;
        startX = e.clientX;
        startY = e.clientY;
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      });
    }
  }

  _savePosition() {
    const x = parseFloat(this._frame.style.left);
    const y = parseFloat(this._frame.style.top);
    const w = this._frame.style.width ? parseFloat(this._frame.style.width) : null;
    const h = this._frame.style.height ? parseFloat(this._frame.style.height) : null;
    const s = this._frame.dataset.scale ? parseFloat(this._frame.dataset.scale) : null;
    
    window.dispatchEvent(new CustomEvent('save-desklet-position', {
      detail: { uuid: this._uuid, x, y, w, h, s }
    }));
  }
}
Object.assign(DeskletBase.prototype, SignalMixin);

export const Desklet = {
  Desklet: DeskletBase,
};
export default Desklet;
