/**
 * Mock Applet base classes — Applet, IconApplet, TextApplet, TextIconApplet
 * With right-click context menu support for settings, reload, and removal.
 */
import { SignalMixin } from './signals.js';
import { showContextMenu } from './contextMenu.js';
import { IconHelper } from './iconHelper.js';

class AppletBase {
  constructor(metadata, orientation, panelHeight, instanceId) {
    this._init(metadata, orientation, panelHeight, instanceId);
  }

  _init(metadata, orientation, panelHeight, instanceId) {
    this.metadata = metadata || {};
    this._orientation = orientation || 0;
    this._panelHeight = panelHeight || 40;
    this._instanceId = instanceId || 'sandbox-instance';
    this._uuid = metadata?.uuid || '';
    this._tooltip = '';
    this._element = document.createElement('div');
    this._element.classList.add('applet-box');
    this._element.__applet = this;
    this.actor = {
      _element: this._element,
      add_style_class_name: (c) => this._element.classList.add(c),
      remove_style_class_name: (c) => this._element.classList.remove(c),
      show: () => this._element.style.display = '',
      hide: () => this._element.style.display = 'none',
      set_style: (s) => this._element.setAttribute('style', s),
      connect: (sig, cb) => this.connect(sig, cb),
    };
    this._applet_context_menu = new MockContextMenu(this);
    this._panelLocation = null;

    // Tooltip on hover
    this._element.addEventListener('mouseenter', () => {
      if (this._tooltip) {
        this._showTooltip(this._tooltip);
      }
    });
    this._element.addEventListener('mouseleave', () => this._hideTooltip());

    // Left-click: applet action
    this._element.addEventListener('click', (e) => {
      if (e.button !== 0) return;
      try { this.on_applet_clicked(e); } catch (err) {
        console.error('Applet click error:', err);
        window.__everestConsole?.logError('Applet click error: ' + err.message);
      }
    });

    // Right-click: context menu
    this._element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._showContextMenu(e.clientX, e.clientY);
    });
  }

  set_applet_tooltip(text) {
    this._tooltip = text;
  }

  on_applet_clicked(event) {
    // Override in subclass
  }

  on_applet_added_to_panel() { }
  on_applet_removed_from_panel() { }
  on_orientation_changed(orientation) { }
  on_panel_height_changed() { }

  // ── Context Menu ──────────────────────────────────────────────────
  _showContextMenu(x, y) {
    const uuid = this.metadata?.uuid || this._uuid;
    const items = [];

    // Extension-registered items from _applet_context_menu
    if (this._applet_context_menu._items.length > 0) {
      for (const item of this._applet_context_menu._items) {
        items.push({
          icon: 'pin,📍',
          label: item.label || 'Custom Action',
          action: () => { try { item.callback?.(); } catch (e) { } },
        });
      }
      items.push({ separator: true });
    }

    // Configure
    items.push({
      icon: 'settings,⚙️',
      label: 'Configure...',
      action: () => {
        window.__everestConsole?.log(`⚙️ Opening settings for ${uuid}...`);
        window.dispatchEvent(new CustomEvent('open-applet-settings', {
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

    items.push({ separator: true });

    // Panel zone placement
    const currentZone = this._element.closest('.panel-left') ? 'left' :
      this._element.closest('.panel-center') ? 'center' : 'right';

    const SYSTEM_ORDER = [
      'calendar@playground',
      'network@playground',
      'battery@playground',
      'volume@playground'
    ];
    const isSystemApplet = SYSTEM_ORDER.includes(uuid);

    if (!isSystemApplet) {
      const zones = [
        { id: 'left', label: 'Move to Left Panel', icon: 'back,⬅️' },
        { id: 'center', label: 'Move to Center Panel', icon: 'up,⬆️' },
        { id: 'right', label: 'Move to Right Panel', icon: 'next,➡️' },
      ];
      for (const zone of zones) {
        items.push({
          icon: zone.icon,
          label: zone.label,
          toggle: currentZone === zone.id,
          action: () => {
            const target = document.querySelector(`.panel-${zone.id}`);
            if (target && this._element.parentNode !== target) {
              this._element.parentNode?.removeChild(this._element);
              if (zone.id === 'right') {
                // Find first system applet or system tray to insert before it
                const firstSystemApplet = Array.from(target.children).find(child => {
                  const childUuid = child.dataset?.uuid;
                  return (childUuid && SYSTEM_ORDER.includes(childUuid)) || child.classList.contains('system-tray-group');
                });
                if (firstSystemApplet) target.insertBefore(this._element, firstSystemApplet);
                else target.appendChild(this._element);
              } else {
                target.appendChild(this._element);
              }
              window.__everestConsole?.log(`📍 Moved applet to ${zone.id} panel`);
            }
          },
        });
      }
      items.push({ separator: true });
    }

    // Reload
    items.push({
      icon: 'refresh,🔄',
      label: 'Reload Applet',
      action: () => {
        window.dispatchEvent(new CustomEvent('reload-extension', {
          detail: { uuid }
        }));
      },
    });

    // Remove
    items.push({
      icon: 'trash,🗑️',
      label: 'Remove from Panel',
      danger: true,
      action: () => {
        this._element.classList.add('applet-removing');
        setTimeout(() => {
          this._element.remove();
          try { this.on_applet_removed_from_panel(); } catch (e) { }
          window.dispatchEvent(new CustomEvent('applet-removed', {
            detail: { uuid }
          }));
        }, 250);
      },
    });

    showContextMenu(items, x, y, false, this._element);
  }

  // ── Tooltip ─────────────────────────────────────────────────────────
  _showTooltip(text) {
    if (document.body.classList.contains('menu-open')) return;

    let tip = document.getElementById('everest-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'everest-tooltip';
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    tip.style.display = 'block';
    const rect = this._element.getBoundingClientRect();
    tip.style.left = rect.left + 'px';
    tip.style.top = (rect.top - 32) + 'px';
  }

  _hideTooltip() {
    const tip = document.getElementById('everest-tooltip');
    if (tip) tip.style.display = 'none';
  }

  get _panelZone() {
    return document.querySelector('.panel-right') || document.querySelector('.everest-panel');
  }
}
Object.assign(AppletBase.prototype, SignalMixin);

class IconApplet extends AppletBase {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(metadata, orientation, panelHeight, instanceId);
  }

  _init(metadata, orientation, panelHeight, instanceId) {
    super._init(metadata, orientation, panelHeight, instanceId);
    this._iconEl = document.createElement('span');
    this._iconEl.classList.add('applet-icon');
    this._element.appendChild(this._iconEl);

    window.addEventListener('icon-theme-changed', () => {
      if (this._iconName) this.set_applet_icon_name(this._iconName);
    });
  }

  set_applet_icon_name(iconName) {
    this._iconName = iconName;

    // Modern mapping for Everest symbolic names
    const typeMap = {
      'preferences-system': 'settings,⚙️',
      'utilities-terminal': 'terminal,💻',
      'network-wireless': 'network,🌐',
      'network-wired': 'network-online-symbolic,🌐',
      'audio-volume-high': 'audio-volume-high-symbolic,🔊',
      'audio-volume-medium': 'audio-volume-medium-symbolic,🔊',
      'audio-volume-low': 'audio-volume-low-symbolic,🔉',
      'audio-volume-muted': 'audio-volume-muted-symbolic,🔇',
      'battery-full': 'battery,🔋',
      'battery-good': 'battery-good-symbolic,🔋',
      'battery-low': 'battery-low-symbolic,🪫',
      'battery-caution': 'battery-caution-symbolic,🪫',
      'x-office-calendar': 'calendar,📅',
      'appointment-soon': 'clock,⏰',
      'system-run': 'terminal,💻',
      'folder': 'folder,📁',
      'user-home': 'home,🏠'
    };

    const type = typeMap[iconName] || iconName;
    this._iconEl.innerHTML = IconHelper.getIcon(type, { size: 18, symbolic: true });
  }

  set_applet_icon_symbolic_name(iconName) {
    this.set_applet_icon_name(iconName);
    this._iconEl.classList.add('symbolic');
  }

  set_applet_icon_path(path) {
    this._iconEl.innerHTML = `<img src="${path}" style="width:16px; height:16px; object-fit:contain;">`;
  }
}

class TextApplet extends AppletBase {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(metadata, orientation, panelHeight, instanceId);
  }

  _init(metadata, orientation, panelHeight, instanceId) {
    super._init(metadata, orientation, panelHeight, instanceId);
    this._labelEl = document.createElement('span');
    this._labelEl.classList.add('applet-label');
    this._element.appendChild(this._labelEl);
  }

  set_applet_label(text) {
    if (text.includes('<br') || text.includes('<div') || text.includes('<span')) {
      this._labelEl.innerHTML = text;
    } else {
      this._labelEl.textContent = text;
    }
  }
}

class TextIconApplet extends AppletBase {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(metadata, orientation, panelHeight, instanceId);
  }

  _init(metadata, orientation, panelHeight, instanceId) {
    super._init(metadata, orientation, panelHeight, instanceId);
    this._iconEl = document.createElement('span');
    this._iconEl.classList.add('applet-icon');
    this._labelEl = document.createElement('span');
    this._labelEl.classList.add('applet-label');
    this._element.appendChild(this._iconEl);
    this._element.appendChild(this._labelEl);

    window.addEventListener('icon-theme-changed', () => {
      if (this._iconName) this.set_applet_icon_name(this._iconName);
    });
  }

  set_applet_icon_name(iconName) {
    this._iconName = iconName;
    const map = {
      'system-run': 'launcher,🚀',
      'applets-screenshooter-symbolic': 'screenshot,📸',
      'preferences-system': 'settings,⚙️',
      'x-office-calendar': 'calendar,📅',
      'network-wireless': 'wifi,📶',
      'audio-volume-high': 'volume,🔊'
    };
    const key = map[iconName] || (iconName + ',🧩');
    this._iconEl.innerHTML = IconHelper.getIcon(key, { size: 20, symbolic: true });
  }

  set_applet_icon_symbolic_name(iconName) {
    this.set_applet_icon_name(iconName);
  }

  set_applet_icon_path(path) {
    this._iconEl.textContent = '🖼️';
  }

  set_applet_label(text) {
    this._labelEl.textContent = text;
  }

  hide_applet_icon() {
    this._iconEl.style.display = 'none';
  }

  hide_applet_label(hide) {
    this._labelEl.style.display = hide ? 'none' : '';
  }
}

class MockContextMenu {
  constructor(applet) {
    this._applet = applet;
    this._items = [];
  }
  addMenuItem(item) { this._items.push(item); }
  addAction(label, cb) { this._items.push({ label, callback: cb }); }
  removeAll() { this._items = []; }
}

class AppletPopupMenu {
  constructor(applet, orientation) {
    this._applet = applet;
    this._orientation = orientation;
    this._items = [];
    this._isOpen = false;
    this._element = document.createElement('div');
    this._element.classList.add('popup-menu', 'applet-popup-menu');
    this.actor = { _element: this._element, show: () => this._element.style.display = 'block', hide: () => this._element.style.display = 'none', add_style_class_name: (c) => this._element.classList.add(c) };
    this.box = { _element: this._element, add_actor: (c) => { const el = c._element || c.element; if (el) this._element.appendChild(el); }, add_child: function (c) { this.add_actor(c); } };
  }

  addMenuItem(item) {
    this._items.push(item);
    if (item._element) this._element.appendChild(item._element);
  }

  addAction(label, cb) {
    const item = document.createElement('div');
    item.classList.add('popup-menu-item');
    item.textContent = label;
    item.addEventListener('click', (e) => {
      const res = cb();
      // Only close if it's not a "persistent" click (e.g. settings toggle)
      if (res !== true) this.close();
    });
    this._element.appendChild(item);
  }

  toggle() { this._isOpen ? this.close() : this.open(); }
  open() {
    this._isOpen = true;
    this._element.style.display = 'block';
    document.body.classList.add('menu-open');
    this._applet._hideTooltip();

    // Position near the applet
    if (this._applet._element) {
      const rect = this._applet._element.getBoundingClientRect();
      this._element.style.position = 'fixed';
      this._element.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      this._element.style.left = rect.left + 'px';
    }
    document.body.appendChild(this._element);

    this._outsideCloser = (e) => {
      if (this._element && !this._element.contains(e.target) && !this._applet._element.contains(e.target)) {
        this.close();
      }
    };

    setTimeout(() => {
      document.addEventListener('click', this._outsideCloser);
      document.addEventListener('contextmenu', this._outsideCloser);
    }, 10);
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._element.style.display = 'none';
    if (this._outsideCloser) {
      document.removeEventListener('click', this._outsideCloser);
      document.removeEventListener('contextmenu', this._outsideCloser);
      this._outsideCloser = null;
    }
    document.body.classList.remove('menu-open');
  }
  removeAll() { this._items = []; this._element.innerHTML = ''; }
}

export const Applet = {
  Applet: AppletBase,
  IconApplet,
  TextApplet,
  TextIconApplet,
  AppletPopupMenu,
  AppletContextMenu: MockContextMenu,
};
export default Applet;
