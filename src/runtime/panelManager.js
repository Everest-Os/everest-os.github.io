/**
 * PanelManager — Manages Everest panel behavior, position, window list,
 * and panel settings. Mimics the real Cinnamon panel manager.
 */
import { showContextMenu } from './contextMenu.js';
import { IconHelper } from './iconHelper.js';

const PANEL_POSITIONS = { TOP: 'top', BOTTOM: 'bottom' };
const CONFIG_PATH = '~/.config/panel.json';

export class PanelManager {
  constructor(vfs) {
    this.vfs = vfs;
    this._panel = null;
    this._desktopArea = null;
    this._lookingGlass = null;
    this._windowList = [];
    this._windowListEl = null;
    this._position = PANEL_POSITIONS.BOTTOM;
    this._height = 48;
    this._autoHide = false;
    this._autoHideTimer = null;
    this._isHidden = false;
  }

  async init() {
    // Load persisted settings
    try {
      const savedStr = await this.vfs.readFile(CONFIG_PATH);
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        this._position = saved.position || PANEL_POSITIONS.BOTTOM;
        this._autoHide = saved.autoHide || false;
        this._height = saved.height || 48;
        this._iconSize = saved.iconSize || 16;
        this._showAppName = saved.showAppName !== undefined ? saved.showAppName : true;
      } else {
        this._iconSize = 16;
        this._showAppName = window.innerWidth > 768;
      }
    } catch {
      this._iconSize = 16;
      this._showAppName = window.innerWidth > 768;
    }
    this._panel = document.getElementById('everest-panel');
    this._desktopArea = document.getElementById('desktop-area');
    this._lookingGlass = document.getElementById('looking-glass');
    if (!this._panel || !this._desktopArea) return;

    // Create window list container in panel-center
    const panelCenter = document.getElementById('panel-center');
    if (panelCenter) {
      this._windowListEl = document.createElement('div');
      this._windowListEl.classList.add('window-list');
      this._windowListEl.id = 'window-list';
      panelCenter.appendChild(this._windowListEl);
    }

    // Apply saved settings
    this._applyPosition();
    document.documentElement.style.setProperty('--panel-height', `${this._height}px`);
    if (this._panel) this._panel.style.height = `${this._height}px`;

    // Panel right-click context menu
    this._panel.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Don't override applet context menus
      if (e.target.closest('.applet-box') || e.target.closest('.st-button')) return;
      this._showPanelContextMenu(e.clientX, e.clientY);
    });

    // Auto-hide behavior
    if (this._autoHide) this._enableAutoHide();

    // Listen for window events
    window.addEventListener('sandbox-window-opened', (e) => {
      this.addWindow(e.detail);
    });
    window.addEventListener('sandbox-window-closed', (e) => {
      this.removeWindow(e.detail.id);
    });
  }

  // ── Panel Position ────────────────────────────────────────────────
  get position() { return this._position; }
  set position(pos) {
    this._position = pos;
    this._applyPosition();
    this._save();
  }

  get height() { return this._height; }
  set height(h) {
    this._height = h;
    document.documentElement.style.setProperty('--panel-height', `${h}px`);
    if (this._panel) this._panel.style.height = `${h}px`;
    this._save();
  }

  _applyPosition() {
    if (!this._desktopArea) return;

    this._desktopArea.classList.remove('panel-top', 'panel-bottom');
    this._desktopArea.classList.add(`panel-${this._position}`);

    if (this._position === 'top') {
      // Move panel to top of desktop-area
      this._desktopArea.style.flexDirection = 'column-reverse';
    } else {
      this._desktopArea.style.flexDirection = 'column';
    }
  }

  // ── Auto-Hide ─────────────────────────────────────────────────────
  get autoHide() { return this._autoHide; }
  set autoHide(v) {
    this._autoHide = v;
    if (v) this._enableAutoHide();
    else this._disableAutoHide();
    this._save();
  }

  _enableAutoHide() {
    if (!this._panel) return;
    this._panel.classList.add('panel-autohide');

    this._panel.addEventListener('mouseenter', this._ahShow = () => {
      clearTimeout(this._autoHideTimer);
      this._panel.classList.remove('panel-hidden');
      this._isHidden = false;
    });

    this._panel.addEventListener('mouseleave', this._ahHide = () => {
      this._autoHideTimer = setTimeout(() => {
        this._panel.classList.add('panel-hidden');
        this._isHidden = true;
      }, 800);
    });

    // Initially hide after a delay
    this._autoHideTimer = setTimeout(() => {
      this._panel.classList.add('panel-hidden');
      this._isHidden = true;
    }, 2000);
  }

  _disableAutoHide() {
    if (!this._panel) return;
    this._panel.classList.remove('panel-autohide', 'panel-hidden');
    this._isHidden = false;
    clearTimeout(this._autoHideTimer);
    if (this._ahShow) this._panel.removeEventListener('mouseenter', this._ahShow);
    if (this._ahHide) this._panel.removeEventListener('mouseleave', this._ahHide);
  }

  // ── Window List ───────────────────────────────────────────────────
  /**
   * Register a "window" in the panel's window list.
   * Extensions can call this to appear in the taskbar.
   */
  addWindow(info) {
    // info: { id, title, icon, element, onActivate, onClose }
    const existing = this._windowList.find(w => w.id === info.id);
    if (existing) {
      existing.title = info.title;
      this._renderWindowList();
      return;
    }
    this._windowList.push(info);
    this._renderWindowList();
  }

  removeWindow(id) {
    this._windowList = this._windowList.filter(w => w.id !== id);
    this._renderWindowList();
  }

  /**
   * Register a loaded extension as a "window" in the taskbar.
   */
  registerExtensionWindow(uuid, metadata, type) {
    const typeIcons = { applets: '🔲', desklets: '🖼️', extensions: '🔧' };
    this.addWindow({
      id: `ext-${uuid}`,
      title: metadata?.name || uuid,
      icon: typeIcons[type] || '📦',
      type,
      uuid,
      _active: false,
    });
  }

  unregisterExtensionWindow(uuid) {
    this.removeWindow(`ext-${uuid}`);
  }

  /**
   * Add a functional applet to the panel
   */
  addApplet(applet, zone = 'right') {
    const log = window.__everestConsole;
    const container = document.getElementById(`panel-${zone}`);
    if (!container) {
      log?.logError(`❌ Panel zone container "panel-${zone}" not found in DOM!`);
      return;
    }

    log?.log(`📍 Adding applet to ${zone} zone...`);

    // Deduplication: Don't add the same applet twice
    const uuid = applet.metadata?.uuid;
    if (uuid && container.querySelector(`.applet-shadow-host[data-uuid="${uuid}"]`)) {
      log?.log(`  ⚠️ Applet ${uuid} already exists in ${zone} zone, skipping.`);
      return;
    }

    if (zone === 'right') {
      const SYSTEM_ORDER = ['system-tray', 'volume@playground', 'network@playground', 'battery@playground', 'calendar@playground'];
      const isSystemApplet = SYSTEM_ORDER.includes(uuid) || applet._element.classList.contains('system-tray-group');
      const sortId = applet._element.classList.contains('system-tray-group') ? 'system-tray' : uuid;
      applet._element.dataset.uuid = sortId;

      if (isSystemApplet) {
        // Find where this applet should go among existing system applets
        const targetIndex = SYSTEM_ORDER.indexOf(sortId);

        let inserted = false;
        const children = Array.from(container.children);
        for (let i = 0; i < children.length; i++) {
          const childUuid = children[i].dataset?.uuid;
          if (childUuid && SYSTEM_ORDER.includes(childUuid)) {
            const childIndex = SYSTEM_ORDER.indexOf(childUuid);
            if (targetIndex < childIndex) {
              container.insertBefore(applet._element, children[i]);
              inserted = true;
              break;
            }
          }
        }
        if (!inserted) {
          container.appendChild(applet._element);
        }
      } else {
        // Non-system applets go before the first system applet
        const firstSystemApplet = Array.from(container.children).find(child => {
          const childUuid = child.dataset?.uuid;
          return (childUuid && SYSTEM_ORDER.includes(childUuid));
        });

        if (firstSystemApplet) {
          container.insertBefore(applet._element, firstSystemApplet);
        } else {
          container.appendChild(applet._element);
        }
      }
    } else {
      container.appendChild(applet._element);
    }

    // Hover feedback
    applet._element.addEventListener('mouseenter', () => applet._element.classList.add('applet-hover'));
    applet._element.addEventListener('mouseleave', () => applet._element.classList.remove('applet-hover'));

    try { applet.on_applet_added_to_panel(); } catch (e) {
      log?.logError(`❌ Error in applet.on_applet_added_to_panel: ${e.message}`);
    }
  }

  _renderWindowList() {
    if (!this._windowListEl) return;
    this._windowListEl.innerHTML = '';

    for (const win of this._windowList) {
      const btn = document.createElement('div');
      btn.classList.add('window-list-item');
      if (win._active) btn.classList.add('active');
      btn.dataset.id = win.id;

      const icon = document.createElement('span');
      icon.classList.add('wl-icon');
      icon.innerHTML = IconHelper.getIcon(win.icon || 'plugin,📦', { size: this._iconSize });

      btn.appendChild(icon);

      if (this._showAppName) {
        const title = document.createElement('span');
        title.classList.add('wl-title');
        title.textContent = win.title;
        btn.appendChild(title);
      } else {
        btn.style.padding = '0 6px'; // smaller padding if icon only
        btn.style.minWidth = '0';
      }

      // Left click — activate / toggle focus
      btn.addEventListener('click', () => {
        if (win.onActivate) {
          win.onActivate();
        } else if (win.uuid && win.type === 'desklets') {
          // Toggle desklet visibility
          const frame = document.querySelector(`.desklet-frame[data-uuid="${win.uuid}"]`);
          if (frame) {
            const isVisible = frame.style.display !== 'none';
            frame.style.display = isVisible ? 'none' : '';
            win._active = !isVisible;
            this._renderWindowList();
          }
        }
      });

      // Right click — window context menu
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._showWindowContextMenu(win, e.clientX, e.clientY);
      });

      this._windowListEl.appendChild(btn);
    }
  }

  _showWindowContextMenu(win, x, y) {
    const items = [
      {
        icon: 'refresh,🗘',
        label: 'Reload',
        action: () => {
          window.dispatchEvent(new CustomEvent('reload-extension', {
            detail: { uuid: win.uuid }
          }));
        },
      },
      { separator: true },
      {
        icon: 'trash,🗑️',
        label: 'Close',
        danger: true,
        action: () => {
          if (win.onClose) {
            win.onClose();
          } else if (win.uuid) {
            // Remove the extension
            if (win.type === 'desklets') {
              const frame = document.querySelector(`.desklet-frame[data-uuid="${win.uuid}"]`);
              if (frame) frame.remove();
            } else if (win.type === 'applets') {
              const el = document.querySelector(`.applet-shadow-host[data-uuid="${win.uuid}"]`);
              if (el) el.remove();
            }
            this.removeWindow(win.id);
            window.dispatchEvent(new CustomEvent(`${win.type === 'desklets' ? 'desklet' : 'applet'}-removed`, {
              detail: { uuid: win.uuid }
            }));
          }
        },
      },
    ];
    showContextMenu(items, x, y, false, this._panel);
  }

  // ── Panel Context Menu ────────────────────────────────────────────
  _showPanelContextMenu(x, y) {
    const items = [
      {
        icon: 'settings,⚙️',
        label: 'Panel Settings',
        action: () => {
          document.dispatchEvent(new CustomEvent('launch-app', {
            detail: { id: 'system-settings', args: ['panel'] }
          }));
        }
      },
      {
        icon: 'warning,⚠️',
        label: 'Troubleshoot...',
        submenu: [
          {
            icon: 'refresh,🗘',
            label: 'Restart Everest Ui',
            action: () => window.location.reload(),
          },
          {
            icon: 'search,🔍',
            label: 'Looking Glass',
            action: () => document.dispatchEvent(new CustomEvent('toggle-looking-glass')),
          }
        ]
      },
      { separator: true },
      {
        icon: 'puzzle,🧩',
        label: 'Add Applets',
        action: () => {
          document.dispatchEvent(new CustomEvent('open-extension-manager', { detail: { type: 'applets' } }));
        },
      },
      {
        icon: 'computer,💻',
        label: 'System Settings',
        action: () => {
          document.dispatchEvent(new CustomEvent('launch-app', {
            detail: { id: 'system-settings' }
          }));
        },
      }
    ];

    showContextMenu(items, x, y, false, this._panel);
  }

  // ── Persistence ───────────────────────────────────────────────────
  get iconSize() { return this._iconSize; }
  set iconSize(s) {
    this._iconSize = s;
    this._renderWindowList();
    this._save();
  }

  get showAppName() { return this._showAppName; }
  set showAppName(b) {
    this._showAppName = b;
    this._renderWindowList();
    this._save();
  }

  async _save() {
    try {
      await this.vfs.writeFile(CONFIG_PATH, JSON.stringify({
        position: this._position,
        autoHide: this._autoHide,
        height: this._height,
        iconSize: this._iconSize,
        showAppName: this._showAppName
      }, null, 2));
    } catch { /* ignore */ }
  }
}
