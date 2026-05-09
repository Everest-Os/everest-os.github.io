/**
 * Mock St (Shell Toolkit) — Maps Cinnamon St widgets to DOM elements.
 *
 * Key design: Every St widget creates a real DOM element. Layout properties
 * like x_align, y_align, x_expand map to CSS flexbox properties.
 * Inline `style` from Cinnamon code (e.g., "width: 35px; color: red;")
 * is applied directly to the element.
 *
 * IMPORTANT: set_style() / style= merges with layout-critical CSS properties
 * (display, flex-direction) rather than replacing them, because Cinnamon's
 * St toolkit keeps layout properties separate from user styles.
 */
import { SignalMixin } from './signals.js';

const ICON_MAP = {
  'system-run': '⚡', 'system-shutdown': '⏻', 'system-lock-screen': '🔒',
  'preferences-system': '⚙️', 'utilities-terminal': '💻', 'folder': '📁',
  'document-save': '💾', 'dialog-warning': '⚠️', 'dialog-error': '❌',
  'network-wireless': '📶', 'audio-volume-high': '🔊', 'audio-volume-muted': '🔇',
  'battery-full': '🔋', 'weather-clear': '☀️', 'user-home': '🏠',
  'view-refresh': '🗘', 'list-add': '➕', 'list-remove': '➖',
  'applets-screenshooter-symbolic': '📷', 'camera-photo': '📷',
  'appointment-soon': '⏰', 'x-office-calendar': '📅', 'go-previous': '◀️',
  'go-next': '▶️', 'media-playback-start': '▶️', 'emblem-favorite': '⭐',
  'process-stop': '🛑', 'edit-copy': '📋', 'edit-delete': '🗑️',
};

const ALIGN_MAP = { 0: 'flex-start', 2: 'center', 3: 'flex-end' };

class StActor {
  constructor(params = {}) {
    this.actor = this;
    this._element = document.createElement('div');
    this._element.classList.add('st-actor');
    this._element.__stWidget = this;
    this._children = [];
    this._parent = null;
    this.reactive = params.reactive || false;
    this._visible = true;
    this.name = params.name || '';
    this.can_focus = params.can_focus || false;
    this._x_align = params.x_align;
    this._y_align = params.y_align;
    this._x_expand = params.x_expand || false;
    this._y_expand = params.y_expand || false;

    // Layout-critical CSS that must survive set_style() calls
    this._layoutCSS = {};

    if (params.style_class) params.style_class.split(' ').forEach(c => c.trim() && this._element.classList.add(c.trim()));
    if (params.style) this._applyUserStyle(params.style);
    if (this.reactive) this._element.style.cursor = 'pointer';
    if (this.name) this._element.dataset.name = this.name;
    if (params.visible === false) { this._visible = false; this._element.style.display = 'none'; }

    if (this._x_expand) this._layoutCSS.flex = '1';
    this._flushLayout();

    this._element.addEventListener('click', (e) => {
      if (this.reactive) {
        // Prevent bubbling so parent actors don't also fire 'clicked'
        e.stopPropagation();

        // Emulate Clutter event sequence
        const fakeEvent = { get_button: () => e.button + 1, get_coords: () => [e.clientX, e.clientY], get_state: () => 0, get_time: () => Date.now() };
        this.emit('button-press-event', this, fakeEvent);
        this.emit('button-release-event', this, fakeEvent);
        this.emit('clicked', this);
      }
    });
    this._element.addEventListener('mouseenter', () => this.emit('enter-event', this));
    this._element.addEventListener('mouseleave', () => this.emit('leave-event', this));
  }

  // Apply layout-critical CSS properties that persist across set_style() calls
  _flushLayout() {
    for (const [k, v] of Object.entries(this._layoutCSS)) {
      this._element.style[k] = v;
    }
    // Re-apply visibility
    if (!this._visible) this._element.style.display = 'none';
  }

  // Apply user style string (from Cinnamon code), then re-apply layout overrides
  _applyUserStyle(s) {
    if (s) {
      // Parse and apply each CSS property
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
        if (key) this._element.style.setProperty(key, val, priority);
      }
    }
    this._flushLayout();
  }

  get element() { return this._element; }

  // ── Child management ────────────────────────────────────────────────
  add_actor(c) { this.add_child(c); }
  add_child(c) {
    if (!c) return;
    if (c._parent) c._parent.remove_child(c);
    this._children.push(c);
    c._parent = this;
    const el = c._element || c.element;
    if (el) this._element.appendChild(el);
  }
  add(c, opts) { this.add_child(c); }
  remove_actor(c) { this.remove_child(c); }
  remove_child(c) {
    const i = this._children.indexOf(c);
    if (i !== -1) {
      this._children.splice(i, 1);
      c._parent = null;
      const el = c._element || c.element;
      if (el && el.parentNode === this._element) this._element.removeChild(el);
    }
  }
  remove_all_children() { [...this._children].forEach(c => this.remove_child(c)); }
  destroy_all_children() { this.remove_all_children(); }
  destroy() {
    this.remove_all_children();
    if (this._parent) this._parent.remove_child(this);
    if (this._element.parentNode) this._element.parentNode.removeChild(this._element);
    this.disconnectAll();
  }

  // ── Style — merges with layout CSS ──────────────────────────────────
  get style() { return this._element.getAttribute('style') || ''; }
  set style(s) {
    // Clear inline styles but keep class-based styles
    this._element.removeAttribute('style');
    if (s) this._applyUserStyle(s);
    else this._flushLayout();
  }
  set_style(s) { this.style = s; }
  get_style() { return this._element.getAttribute('style') || ''; }
  add_style_class_name(n) { n.split(' ').forEach(c => c.trim() && this._element.classList.add(c.trim())); }
  remove_style_class_name(n) { n.split(' ').forEach(c => c.trim() && this._element.classList.remove(c.trim())); }
  has_style_class_name(n) { return this._element.classList.contains(n); }
  add_style_pseudo_class(n) { this._element.classList.add('pseudo-' + n); }
  remove_style_pseudo_class(n) { this._element.classList.remove('pseudo-' + n); }
  change_style_pseudo_class(n, add) { add ? this.add_style_pseudo_class(n) : this.remove_style_pseudo_class(n); }

  // ── Visibility (tracked independently from style attribute) ─────────
  get visible() { return this._visible; }
  set visible(v) {
    this._visible = !!v;
    if (v) {
      // Restore display to layout default
      this._element.style.display = this._layoutCSS.display || '';
    } else {
      this._element.style.display = 'none';
    }
  }
  show() { this.visible = true; }
  hide() { this.visible = false; }

  // ── Size ────────────────────────────────────────────────────────────
  set_size(w, h) {
    if (w >= 0) this._element.style.width = w + 'px';
    if (h >= 0) this._element.style.height = h + 'px';
  }
  get_parent() { return this._parent; }
  get_children() { return [...this._children]; }
  get_n_children() { return this._children.length; }
  set_width(w) { this._element.style.width = w + 'px'; }
  set_height(h) { this._element.style.height = h + 'px'; }
  get_width() { return this._element.offsetWidth; }
  get_height() { return this._element.offsetHeight; }
  set_opacity(o) { this._element.style.opacity = o / 255; }
  get_opacity() { return Math.round(parseFloat(this._element.style.opacity || 1) * 255); }
  set_position(x, y) { this._element.style.left = x + 'px'; this._element.style.top = y + 'px'; }

  // ── Alignment properties ────────────────────────────────────────────
  get x_align() { return this._x_align; }
  set x_align(v) { this._x_align = v; }
  get y_align() { return this._y_align; }
  set y_align(v) { this._y_align = v; }
  get x_expand() { return this._x_expand; }
  set x_expand(v) { this._x_expand = v; if (v) { this._layoutCSS.flex = '1'; } else { delete this._layoutCSS.flex; } this._flushLayout(); }
  get y_expand() { return this._y_expand; }
  set y_expand(v) { this._y_expand = v; }

  // ── No-ops ──────────────────────────────────────────────────────────
  queue_relayout() { }
  queue_redraw() { }
  grab_key_focus() { }
  set_clip() { }
  remove_clip() { }
  set_reactive(v) { this.reactive = v; }
  get_reactive() { return this.reactive; }
  get_stage() { return null; }
  raise_top() { }
  lower_bottom() { }
}
Object.assign(StActor.prototype, SignalMixin);

// ── StLabel ───────────────────────────────────────────────────────────
class StLabel extends StActor {
  constructor(params = {}) {
    super(params);
    const span = document.createElement('span');
    for (const cls of this._element.classList) span.classList.add(cls);
    span.classList.add('st-label');
    if (params.style) span.setAttribute('style', params.style);
    span.__stWidget = this;
    this._element = span;
    this._text = params.text || '';
    this._element.textContent = this._text;
  }
  set_text(t) { this._text = String(t); this._element.textContent = this._text; }
  get_text() { return this._text; }
  get text() { return this._text; }
  set text(v) { this.set_text(v); }
  get clutter_text() {
    const self = this;
    return {
      set_markup: (m) => { self._element.innerHTML = m.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>').replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>'); },
      get_text: () => self._text,
      set line_wrap(v) { self._element.style.whiteSpace = v ? 'pre-wrap' : ''; },
      get line_wrap() { return self._element.style.whiteSpace === 'pre-wrap'; },
      set ellipsize(v) { if (v === 3) { self._element.style.overflow = 'hidden'; self._element.style.textOverflow = 'ellipsis'; self._element.style.whiteSpace = 'nowrap'; } },
      get ellipsize() { return 0; },
    };
  }
}

// ── StBoxLayout ───────────────────────────────────────────────────────
class StBoxLayout extends StActor {
  constructor(params = {}) {
    super(params);
    this._element.classList.add('st-box-layout');
    this._vertical = params.vertical || false;

    // These are LAYOUT properties — they persist across set_style() calls
    this._layoutCSS.display = 'flex';
    this._layoutCSS.flexDirection = this._vertical ? 'column' : 'row';
    if (params.x_expand || params.y_expand) this._layoutCSS.flex = '1';
    if (params.x_align !== undefined) {
      this._layoutCSS.justifyContent = ALIGN_MAP[params.x_align] || 'flex-start';
    }
    if (params.y_align !== undefined) {
      this._layoutCSS.alignItems = ALIGN_MAP[params.y_align] || 'stretch';
    }

    this._flushLayout();
  }
  get vertical() { return this._vertical; }
  set vertical(v) {
    this._vertical = v;
    this._layoutCSS.flexDirection = v ? 'column' : 'row';
    this._flushLayout();
  }
}

// ── StBin ─────────────────────────────────────────────────────────────
class StBin extends StActor {
  constructor(params = {}) {
    super(params);
    this._element.classList.add('st-bin');
    this._child = null;
    this._layoutCSS.display = 'flex';
    this._layoutCSS.justifyContent = ALIGN_MAP[params.x_align] ?? 'center';
    this._layoutCSS.alignItems = ALIGN_MAP[params.y_align] ?? 'center';
    this._flushLayout();
    if (params.child) this.set_child(params.child);
  }
  set_child(c) {
    if (this._child) this.remove_child(this._child);
    this._child = c;
    if (c) this.add_child(c);
  }
  get_child() { return this._child; }
  get child() { return this._child; }
  set x_fill(v) { if (v) { this._layoutCSS.justifyContent = 'stretch'; this._flushLayout(); } }
  set y_fill(v) { if (v) { this._layoutCSS.alignItems = 'stretch'; this._flushLayout(); } }
}

// ── StButton ──────────────────────────────────────────────────────────
class StButton extends StActor {
  constructor(params = {}) {
    super({ ...params, reactive: true });
    this._element.classList.add('st-button');
    this._element.style.cursor = 'pointer';
    this._layoutCSS.display = 'inline-flex';
    this._layoutCSS.alignItems = 'center';
    this._layoutCSS.justifyContent = 'center';
    this._flushLayout();

    // Stop mousedown/mouseup from bubbling so we don't accidentally drag the desklet or trigger its button-release-event
    this._element.addEventListener('mousedown', (e) => e.stopPropagation());
    this._element.addEventListener('mouseup', (e) => e.stopPropagation());

    if (params.label) this._element.textContent = params.label;
    if (params.child) this.add_child(params.child);
    if (params.can_focus !== false) this._element.tabIndex = 0;
    if (params.x_expand) { this._layoutCSS.flex = '1'; this._flushLayout(); }
  }
  set_child(c) { this._element.innerHTML = ''; this._children = []; if (c) this.add_child(c); }
  set_label(t) { this._element.textContent = t; }
  get_label() { return this._element.textContent; }
  get label() { return this._element.textContent; }
  set label(v) { this._element.textContent = v; }
}

// ── StIcon ────────────────────────────────────────────────────────────
class StIcon extends StActor {
  constructor(params = {}) {
    super(params);
    this._element.classList.add('st-icon');
    this._iconName = params.icon_name || '';
    this._iconSize = params.icon_size || 22;
    this._layoutCSS.display = 'flex';
    this._layoutCSS.alignItems = 'center';
    this._layoutCSS.justifyContent = 'center';
    this._layoutCSS.flexShrink = '0';
    this._element.style.fontSize = this._iconSize + 'px';
    this._element.style.width = this._iconSize + 'px';
    this._element.style.height = this._iconSize + 'px';
    this._flushLayout();
    this._updateIcon();
  }
  _updateIcon() {
    this._element.innerHTML = IconHelper.getIcon(this._iconName, { size: this._iconSize });
    this._element.title = this._iconName;
  }
  set icon_name(n) { this._iconName = n; this._updateIcon(); }
  get icon_name() { return this._iconName; }
  set_icon_name(n) { this.icon_name = n; }
  set icon_size(s) { this._iconSize = s; this._element.style.fontSize = s + 'px'; this._element.style.width = s + 'px'; this._element.style.height = s + 'px'; }
  get icon_size() { return this._iconSize; }
  set_icon_size(s) { this.icon_size = s; }
}

// ── StEntry ───────────────────────────────────────────────────────────
class StEntry extends StActor {
  constructor(params = {}) {
    super(params);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'st-entry';
    if (params.style_class) params.style_class.split(' ').forEach(c => c.trim() && input.classList.add(c.trim()));
    if (params.hint_text) input.placeholder = params.hint_text;
    if (params.text) input.value = params.text;
    if (params.style) input.setAttribute('style', params.style);
    if (params.can_focus !== false) input.tabIndex = 0;
    input.__stWidget = this;
    this._element = input;
    input.addEventListener('input', () => this.emit('text-changed', this));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.emit('key-press-event', this, e);
    });
  }
  set_text(t) { this._element.value = t; }
  get_text() { return this._element.value; }
  get text() { return this._element.value; }
  set text(v) { this._element.value = v; }
  get clutter_text() {
    return { set_max_length: () => { }, get_text: () => this._element.value };
  }
}

// ── StScrollView ──────────────────────────────────────────────────────
class StScrollView extends StActor {
  constructor(params = {}) { super(params); this._element.classList.add('st-scroll-view'); this._element.style.overflow = 'auto'; }
}

// ── StWidget ──────────────────────────────────────────────────────────
class StWidget extends StActor {
  constructor(params = {}) { super(params); this._element.classList.add('st-widget'); }
}

// ── StTable ───────────────────────────────────────────────────────────
class StTable extends StActor {
  constructor(params = {}) {
    super(params);
    this._element.classList.add('st-table');
    this._layoutCSS.display = 'grid';
    this._flushLayout();
  }
  add(child, opts = {}) {
    const el = child._element;
    el.style.gridRow = `${(opts.row || 0) + 1}/span ${opts.row_span || 1}`;
    el.style.gridColumn = `${(opts.col || 0) + 1}/span ${opts.col_span || 1}`;
    this.add_child(child);
  }
}

// ── StDrawingArea ─────────────────────────────────────────────────────
class StDrawingArea extends StActor {
  constructor(params = {}) {
    super(params);
    this._canvas = document.createElement('canvas');
    this._canvas.width = params.width || 100;
    this._canvas.height = params.height || 100;
    this._element.appendChild(this._canvas);
  }
  get_context() { return this._canvas.getContext('2d'); }
  queue_repaint() { this.emit('repaint', this); }
}

export const St = {
  Actor: StActor,
  Label: StLabel,
  BoxLayout: StBoxLayout,
  Bin: StBin,
  Button: StButton,
  Icon: StIcon,
  Entry: StEntry,
  ScrollView: StScrollView,
  Widget: StWidget,
  Table: StTable,
  DrawingArea: StDrawingArea,
  Align: { START: 0, FILL: 0, MIDDLE: 2, CENTER: 2, END: 3 },
  Side: { TOP: 0, RIGHT: 1, BOTTOM: 2, LEFT: 3 },
  IconType: { SYMBOLIC: 0, FULLCOLOR: 1 },
  TextDirection: { LTR: 0, RTL: 1 },
  PolicyType: { ALWAYS: 0, AUTOMATIC: 1, NEVER: 2, EXTERNAL: 3 },
  Corner: { TOPLEFT: 0, TOPRIGHT: 1, BOTTOMRIGHT: 2, BOTTOMLEFT: 3 },
};
export default St;
