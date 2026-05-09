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
            if (key) this._frame.style.setProperty(key, val, priority);
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

    // Context menu on right-click
    this._frame.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._showContextMenu(e.clientX, e.clientY);
    });

    // Make draggable
    this._makeDraggable();
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
        }
      },
    });

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

    // Remove
    items.push({
      icon: 'trash,🗑️',
      label: 'Remove from Desktop',
      danger: true,
      action: () => this._removeDesklet(),
    });

    return items;
  }

  _showContextMenu(x, y) {
    const items = this._buildContextMenuItems();
    showContextMenu(items, x, y);
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

          if (this._titleBar) {
            if (styles['background-color']) {
              this._titleBar.style.backgroundColor = styles['background-color'];
            }
            if (styles['background']) {
              this._titleBar.style.background = styles['background'];
            }
            if (styles['border-radius']) {
              this._titleBar.style.borderTopLeftRadius = styles['border-radius'];
              this._titleBar.style.borderTopRightRadius = styles['border-radius'];
              el.style.borderTopLeftRadius = '0px';
              el.style.borderTopRightRadius = '0px';
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

    const onMouseDown = (e) => {
      if (e.target.closest('button, input, select, a')) return;
      if (e.button !== 0) return; // Only left-click drags
      isDragging = true;
      this._hasDragged = false;
      this._frame.style.cursor = 'grabbing';
      if (this._titleBar) this._titleBar.style.cursor = 'grabbing';
      startX = e.clientX;
      startY = e.clientY;
      startLeft = this._frame.offsetLeft;
      startTop = this._frame.offsetTop;
      e.preventDefault();
    };

    if (this._titleBar) {
      this._titleBar.style.cursor = 'grab';
      this._titleBar.addEventListener('mousedown', onMouseDown);
    }

    this._frame.style.cursor = 'grab';
    this._frame.addEventListener('mousedown', onMouseDown);

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._hasDragged = true;
      this._frame.style.left = (startLeft + dx) + 'px';
      this._frame.style.top = (startTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this._frame.style.cursor = 'grab';
        if (this._titleBar) this._titleBar.style.cursor = 'grab';
        setTimeout(() => this._hasDragged = false, 50);
      }
    });

    this._frame.addEventListener('click', (e) => {
      if (this._hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, { capture: true });
  }

  destroy() {
    if (this._frame.parentNode) this._frame.parentNode.removeChild(this._frame);
    this.disconnectAll();
  }
}
Object.assign(DeskletBase.prototype, SignalMixin);

export const Desklet = {
  Desklet: DeskletBase,
};
export default Desklet;
