/**
 * Mock PopupMenu system
 */
import { SignalMixin } from './signals.js';

class PopupMenuBase {
  constructor(sourceActor, orientation) {
    this._sourceActor = sourceActor;
    this._isOpen = false;
    this._items = [];
    this._element = document.createElement('div');
    this._element.classList.add('popup-menu');
    this.actor = { _element: this._element, show: () => this._element.style.display = 'block', hide: () => this._element.style.display = 'none', add_style_class_name: (c) => this._element.classList.add(c) };
    this.box = { _element: this._element, add_actor: (c) => { const el = c._element || c.element; if (el) this._element.appendChild(el); }, add_child: function (c) { this.add_actor(c); } };
  }

  addMenuItem(item) {
    this._items.push(item);
    if (item._element) this._element.appendChild(item._element);
  }

  addAction(label, callback, iconName) {
    const item = new PopupMenuItem(label);
    item.connect('activate', callback);
    this.addMenuItem(item);
    return item;
  }

  toggle() { this._isOpen ? this.close() : this.open(); }

  open() {
    if (this._isOpen) return;
    this._isOpen = true;
    this._element.style.display = 'block';
    document.body.appendChild(this._element);
    this.emit('open-state-changed', true);

    // Global click listener to close when clicking outside
    this._outsideCloser = (e) => {
      if (this._element && !this._element.contains(e.target) && !this._sourceActor?._element?.contains(e.target)) {
        this.close();
      }
    };
    // Use capture phase and a small delay to avoid immediate trigger from the opening click
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
    if (this._element.parentNode === document.body) document.body.removeChild(this._element);
    this.emit('open-state-changed', false);
  }

  removeAll() {
    this._items = [];
    this._element.innerHTML = '';
  }

  get isOpen() { return this._isOpen; }
  get numMenuItems() { return this._items.length; }
}
Object.assign(PopupMenuBase.prototype, SignalMixin);

class PopupMenu extends PopupMenuBase {
  constructor(sourceActor, orientation) {
    super(sourceActor, orientation);
    this._element.classList.add('popup-menu-content');
  }
}

class PopupMenuItem {
  constructor(label, params = {}) {
    this._element = document.createElement('div');
    this._element.classList.add('popup-menu-item');
    this._label = label;

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    this._element.appendChild(labelSpan);

    this._element.addEventListener('click', () => {
      this.emit('activate', this);
    });

    this.actor = { _element: this._element, add_style_class_name: (c) => this._element.classList.add(c), show: () => this._element.style.display = '', hide: () => this._element.style.display = 'none' };
    this.label = { set_text: (t) => { labelSpan.textContent = t; }, get_text: () => labelSpan.textContent };
  }

  destroy() {
    if (this._element.parentNode) this._element.parentNode.removeChild(this._element);
  }
}
Object.assign(PopupMenuItem.prototype, SignalMixin);

class PopupSeparatorMenuItem {
  constructor() {
    this._element = document.createElement('div');
    this._element.classList.add('popup-separator-menu-item');
    this.actor = { _element: this._element };
  }
}

class PopupSubMenuMenuItem {
  constructor(label) {
    this._element = document.createElement('div');
    this._element.classList.add('popup-submenu-menu-item');
    const header = document.createElement('div');
    header.classList.add('popup-submenu-header');
    header.textContent = label + ' ▸';
    this._subContent = document.createElement('div');
    this._subContent.classList.add('popup-submenu-content');
    this._subContent.style.display = 'none';
    header.addEventListener('click', () => {
      this._subContent.style.display = this._subContent.style.display === 'none' ? 'block' : 'none';
    });
    this._element.appendChild(header);
    this._element.appendChild(this._subContent);
    this.menu = {
      addMenuItem: (item) => { if (item._element) this._subContent.appendChild(item._element); },
      addAction: (label, cb) => {
        const el = document.createElement('div');
        el.classList.add('popup-menu-item');
        el.textContent = label;
        el.addEventListener('click', cb);
        this._subContent.appendChild(el);
      },
      removeAll: () => { this._subContent.innerHTML = ''; },
    };
    this.actor = { _element: this._element };
  }
}

class PopupIconMenuItem extends PopupMenuItem {
  constructor(label, iconName, iconType) {
    super(label);
    this._element.classList.add('popup-icon-menu-item');
    const icon = document.createElement('span');
    icon.classList.add('popup-menu-icon');
    icon.innerHTML = IconHelper.getIcon(iconName, { size: 16 });
    this._element.insertBefore(icon, this._element.firstChild);
  }
}

class PopupMenuManager {
  constructor(owner) { this._owner = owner; this._menus = []; }
  addMenu(menu) { this._menus.push(menu); }
  removeMenu(menu) { this._menus = this._menus.filter(m => m !== menu); }
}

export const PopupMenu_NS = {
  PopupMenu,
  PopupMenuBase,
  PopupMenuItem,
  PopupSeparatorMenuItem,
  PopupSubMenuMenuItem,
  PopupIconMenuItem,
  PopupMenuManager,
};
export default PopupMenu_NS;
