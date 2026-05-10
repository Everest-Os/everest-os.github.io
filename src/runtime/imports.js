/**
 * Global `imports` tree — The core CJS compatibility layer.
 * Provides imports.ui.*, imports.gi.*, imports.misc.*, imports.gettext
 *
 * This is the most critical file in the sandbox. Every API that real
 * Cinnamon extensions use via `imports.*` must be shimmed here, or
 * the extension will crash at load time.
 *
 * Strategy:
 * - For GIR (C-backed) objects: provide JS-only functional mocks
 * - For pure-JS modules: replicate enough of the real Cinnamon JS interface
 * - Unsafe operations (spawn, file I/O): log & no-op
 */
import { St } from './st.js';
import { Applet } from './applet.js';
import { Desklet } from './desklet.js';
import { Settings, BindingDirection } from './settings.js';
import { PopupMenu_NS } from './popupMenu.js';
import { SignalMixin } from './signals.js';
import { showSystemDialog } from './dialog.js';

// ── Global Shims ──────────────────────────────────────────────────────
if (!Date.prototype.toLocaleFormat) {
  Date.prototype.toLocaleFormat = function (fmt) {
    const d = this;
    return fmt.replace(/%[a-zA-Z]/g, (m) => {
      switch (m) {
        case '%Y': return d.getFullYear();
        case '%y': return String(d.getFullYear()).slice(-2);
        case '%m': return String(d.getMonth() + 1).padStart(2, '0');
        case '%d': return String(d.getDate()).padStart(2, '0');
        case '%e': return String(d.getDate()).padStart(2, ' ');
        case '%H': return String(d.getHours()).padStart(2, '0');
        case '%M': return String(d.getMinutes()).padStart(2, '0');
        case '%S': return String(d.getSeconds()).padStart(2, '0');
        case '%A': return d.toLocaleDateString(undefined, { weekday: 'long' });
        case '%B': return d.toLocaleDateString(undefined, { month: 'long' });
        case '%b': return d.toLocaleDateString(undefined, { month: 'short' });
        default: return m;
      }
    });
  };
}

// ── Mock GLib.DateTime ────────────────────────────────────────────────
class MockDateTime {
  constructor(date) {
    this._d = date || new Date();
  }
  static new_now_local() { return new MockDateTime(); }
  static new_now(tz) {
    if (tz && tz._offset !== undefined) {
      const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
      return new MockDateTime(new Date(utc + tz._offset));
    }
    return new MockDateTime();
  }
  get_year() { return this._d.getFullYear(); }
  get_month() { return this._d.getMonth() + 1; }
  get_day_of_month() { return this._d.getDate(); }
  get_hour() { return this._d.getHours(); }
  get_minute() { return this._d.getMinutes(); }
  get_second() { return this._d.getSeconds(); }
  get_day_of_week() { return this._d.getDay() === 0 ? 7 : this._d.getDay(); }
  get_day_of_year() {
    const start = new Date(this._d.getFullYear(), 0, 0);
    return Math.floor((this._d - start) / 86400000);
  }
  to_unix() { return Math.floor(this._d.getTime() / 1000); }
  format(fmt) {
    let s = fmt;
    s = s.replace(/%Y/g, String(this.get_year()));
    s = s.replace(/%m/g, String(this.get_month()).padStart(2, '0'));
    s = s.replace(/%d/g, String(this.get_day_of_month()).padStart(2, '0'));
    s = s.replace(/%H/g, String(this.get_hour()).padStart(2, '0'));
    s = s.replace(/%M/g, String(this.get_minute()).padStart(2, '0'));
    s = s.replace(/%S/g, String(this.get_second()).padStart(2, '0'));
    s = s.replace(/%A/g, this._d.toLocaleDateString(undefined, { weekday: 'long' }));
    s = s.replace(/%B/g, this._d.toLocaleDateString(undefined, { month: 'long' }));
    s = s.replace(/%p/g, this.get_hour() >= 12 ? 'PM' : 'AM');
    s = s.replace(/%P/g, this.get_hour() >= 12 ? 'pm' : 'am');
    s = s.replace(/%I/g, String(this.get_hour() % 12 || 12).padStart(2, '0'));
    s = s.replace(/%l/g, String(this.get_hour() % 12 || 12));
    s = s.replace(/%k/g, String(this.get_hour()));
    return s;
  }
}

// ── Mock GLib.TimeZone ────────────────────────────────────────────────
class MockTimeZone {
  constructor(identifier) {
    this._id = identifier || 'local';
    // Parse common timezone offsets
    const tzMap = {
      'Asia/Kathmandu': 5.75 * 3600000,
      'Asia/Kolkata': 5.5 * 3600000,
      'UTC': 0,
      'Europe/London': 0,
      'America/New_York': -5 * 3600000,
      'America/Los_Angeles': -8 * 3600000,
      'Asia/Tokyo': 9 * 3600000,
      'Europe/Berlin': 1 * 3600000,
    };
    this._offset = tzMap[identifier] !== undefined ? tzMap[identifier] : -(new Date().getTimezoneOffset() * 60000);
  }
  static new(identifier) { return new MockTimeZone(identifier); }
  static new_local() { return new MockTimeZone('local'); }
  static new_utc() { return new MockTimeZone('UTC'); }
  get_identifier() { return this._id; }
}

// ── Mock Clutter ──────────────────────────────────────────────────────
class ClutterActor {
  constructor(props) {
    this._element = document.createElement('div');
    if (props?.width) this._element.style.width = props.width + 'px';
    if (props?.height) this._element.style.height = props.height + 'px';
  }
  show() { } hide() { } destroy() { this._element.remove(); } connect() { return 0; }
  add_child(c) { if (c._element) this._element.appendChild(c._element); }
  remove_child(c) { if (c._element) this._element.removeChild(c._element); }
  set_style(s) { this._element.setAttribute('style', s); }
  set_size(w, h) {
    if (w >= 0) this._element.style.width = w + 'px';
    if (h >= 0) this._element.style.height = h + 'px';
  }
  set_content_scaling_filters(min, mag) { }
  set_content(content) {
    if (content instanceof ClutterImage && content._svgData) {
      const blob = new Blob([content._svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      this._element.style.backgroundImage = `url(${url})`;
      this._element.style.backgroundSize = '100% 100%';
      this._element.style.backgroundRepeat = 'no-repeat';
    }
  }
}

class ClutterClone extends ClutterActor {
  constructor(props) {
    super(props);
    if (props?.source) this.set_source(props.source);
  }
  set_source(source) {
    this._source = source;
    if (source && source._element) {
      this._element.style.backgroundImage = source._element.style.backgroundImage;
      this._element.style.backgroundSize = source._element.style.backgroundSize;
      this._element.style.backgroundRepeat = source._element.style.backgroundRepeat;
    } else {
      this._element.style.backgroundImage = 'none';
    }
  }
}

class ClutterImage {
  constructor() { this._svgData = null; }
  set_data(data) { this._svgData = data; }
}

const Clutter = {
  ActorAlign: { CENTER: 2, START: 0, END: 3, FILL: 4 },
  Orientation: { HORIZONTAL: 0, VERTICAL: 1 },
  PickMode: { ALL: 0, REACTIVE: 1 },
  EventType: { BUTTON_PRESS: 4, BUTTON_RELEASE: 5, KEY_PRESS: 8, KEY_RELEASE: 9 },
  ScalingFilter: { NEAREST: 0, LINEAR: 1, TRILINEAR: 2 },
  TextureQuality: { LOW: 0, MEDIUM: 1, HIGH: 2 },
  Actor: ClutterActor,
  Clone: ClutterClone,
  Image: ClutterImage,
  Color: class {
    constructor() { this.red = 0; this.green = 0; this.blue = 0; this.alpha = 255; }
    static from_string(s) { const c = new Clutter.Color(); return [true, c]; }
  },
  Text: class {
    constructor() { this.text = ''; }
    set_text(t) { this.text = t; }
    get_text() { return this.text; }
  },
  KEY_Return: 65293,
  KEY_Escape: 65307,
};

// ── Mock GLib (comprehensive) ─────────────────────────────────────────
const GLib = {
  get_home_dir: () => '/home/user',
  get_user_data_dir: () => '/home/user/.local/share',
  get_user_config_dir: () => '/home/user/.config',
  get_user_cache_dir: () => '/home/user/.cache',
  get_user_special_dir: (dir) => {
    const dirs = { 0: '/home/user/Desktop', 1: '/home/user/Documents', 2: '/home/user/Downloads', 3: '/home/user/Music', 4: '/home/user/Pictures', 5: '/home/user/Public', 6: '/home/user/Templates', 7: '/home/user/Videos' };
    return dirs[dir] || '/home/user';
  },
  get_tmp_dir: () => '/tmp',
  get_user_name: () => 'user',
  get_real_name: () => 'User',
  get_host_name: () => 'sandbox',
  UserDirectory: { DIRECTORY_DESKTOP: 0, DIRECTORY_DOCUMENTS: 1, DIRECTORY_DOWNLOAD: 2, DIRECTORY_MUSIC: 3, DIRECTORY_PICTURES: 4, DIRECTORY_PUBLIC_SHARE: 5, DIRECTORY_TEMPLATES: 6, DIRECTORY_VIDEOS: 7 },
  build_filenamev: (parts) => parts.join('/'),
  build_pathv: (parts) => parts.join('/'),
  path_is_absolute: (p) => p.startsWith('/'),
  file_test: () => true,
  file_get_contents: (path) => [true, '', ''],
  FileTest: { EXISTS: 1, IS_DIR: 2, IS_REGULAR: 4 },
  getenv: (name) => null,
  setenv: () => { },
  get_current_time: () => Date.now(),
  get_monotonic_time: () => performance.now() * 1000,
  get_real_time: () => Date.now() * 1000,

  // DateTime & TimeZone
  DateTime: MockDateTime,
  TimeZone: MockTimeZone,

  // Bytes
  Bytes: {
    new: (data) => ({ _data: data }),
  },

  // Markup
  markup_escape_text: (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),

  // Timers
  timeout_add: (priority, interval, callback) => setInterval(() => { try { callback(); } catch (e) { } }, interval),
  timeout_add_seconds: (priority, interval, callback) => setInterval(() => { try { callback(); } catch (e) { } }, interval * 1000),
  idle_add: (priority, callback) => requestAnimationFrame(() => { try { callback(); } catch (e) { } }),
  source_remove: (id) => { clearInterval(id); clearTimeout(id); },

  PRIORITY_DEFAULT: 0,
  PRIORITY_HIGH: -100,
  PRIORITY_LOW: 300,
  PRIORITY_DEFAULT_IDLE: 200,

  // Variants / types
  Variant: class { constructor(type, value) { this._type = type; this._value = value; } unpack() { return this._value; } },
  VariantType: class { constructor(s) { this._s = s; } },

  // Misc
  uri_parse_scheme: (uri) => uri.split('://')[0] || '',
  filename_from_uri: (uri) => [uri.replace(/^file:\/\//, ''), ''],
  filename_to_uri: (path) => 'file://' + path,
  shell_quote: (s) => `'${s}'`,
  spawn_command_line_async: (cmd) => { window.__everestConsole?.log(`[Sandbox] GLib.spawn blocked: ${cmd}`); },
};

// ── Mock Gio ──────────────────────────────────────────────────────────
const Gio = {
  File: {
    new_for_path: (p) => ({
      get_path: () => p,
      get_basename: () => p.split('/').pop(),
      get_parent: () => Gio.File.new_for_path(p.split('/').slice(0, -1).join('/')),
      query_exists: () => true,
      get_child: (n) => Gio.File.new_for_path(p + '/' + n),
      load_contents: () => [true, new Uint8Array(0), ''],
      enumerate_children: () => ({ next_file: () => null }),
      make_directory_with_parents: () => true,
    }),
    new_for_uri: (u) => Gio.File.new_for_path(u.replace(/^file:\/\//, '')),
  },
  Settings: class {
    constructor(opts) { this._schema = opts?.schema_id; this._values = {}; this._handlers = {}; this._nextId = 1; }
    get_boolean(k) { return !!this._values[k]; }
    set_boolean(k, v) { this._values[k] = v; }
    get_string(k) { return this._values[k] || ''; }
    set_string(k, v) { this._values[k] = v; }
    get_int(k) { return this._values[k] || 0; }
    set_int(k, v) { this._values[k] = v; }
    get_strv(k) { return this._values[k] || []; }
    set_strv(k, v) { this._values[k] = v; }
    get_value(k) { return new GLib.Variant('s', this._values[k]); }
    connect(sig, cb) { const id = this._nextId++; this._handlers[id] = cb; return id; }
    disconnect(id) { delete this._handlers[id]; }
    list_keys() { return Object.keys(this._values); }
  },
  MemoryInputStream: {
    new_from_bytes: (bytes) => ({ _data: bytes?._data || '' }),
  },
  app_info_get_default_for_type: () => null,
  FileIcon: class { constructor() { } },
  ThemedIcon: class { constructor(name) { this.name = name; } },
  Subprocess: class { constructor() { } },
  DataInputStream: class { constructor() { } },
  UnixInputStream: class { constructor() { } },
  FileEnumerator: class { next_file() { return null; } },
};

// ── Mock Mainloop ─────────────────────────────────────────────────────
const Mainloop = {
  timeout_add: (interval, callback) => setTimeout(() => { try { if (callback()) Mainloop.timeout_add(interval, callback); } catch (e) { } }, interval),
  timeout_add_seconds: (interval, callback) => setTimeout(() => { try { if (callback()) Mainloop.timeout_add_seconds(interval, callback); } catch (e) { } }, interval * 1000),
  idle_add: (callback) => requestAnimationFrame(() => { try { callback(); } catch (e) { } }),
  source_remove: (id) => { clearTimeout(id); clearInterval(id); },
};

// ── Mock Main ─────────────────────────────────────────────────────────
const Main = {
  notify: (msg, details) => {
    window.__everestConsole?.log(`[Notification] ${msg}: ${details || ''}`);
  },
  notifyError: (msg, details) => {
    window.__everestConsole?.logError(`[Error Notification] ${msg}: ${details || ''}`);
  },
  criticalNotify: (msg, details) => {
    window.__everestConsole?.logError(`[CRITICAL] ${msg}: ${details || ''}`);
  },
  warningNotify: (msg, details) => {
    window.__everestConsole?.log(`⚠️ ${msg}: ${details || ''}`);
  },
  uiGroup: {
    add_actor: () => { },
    remove_actor: () => { },
    add_child: () => { },
    remove_child: () => { },
  },
  layoutManager: {
    monitors: [{ x: 0, y: 0, width: 1920, height: 1080 }],
    primaryMonitor: { x: 0, y: 0, width: 1920, height: 1080 },
    currentMonitor: { x: 0, y: 0, width: 1920, height: 1080 },
    primaryIndex: 0,
  },
  panelManager: {
    panels: [],
    getPanelZone: () => document.querySelector('.panel-right'),
  },
  themeManager: { _theme: 'Mint-Y-Dark' },
  overview: { connect: () => 0, visible: false },
  expo: { connect: () => 0, visible: false },
  keybindingManager: { addHotKey: () => { }, removeHotKey: () => { } },
  systrayManager: {},
  xdndHandler: {},
  statusIconDispatcher: {},
  virtualKeyboard: { connect: () => 0 },
  osdWindowManager: { show: () => { } },
};

// ── Mock Util — Native execution disabled in Serverless Web OS ───────────
const Util = {
  spawn: (argv) => {
    const cmd = argv.join(' ');
    window.__everestConsole?.log(`[Sandbox] Native execution blocked in Web OS mode: ${cmd}`);
  },
  spawnCommandLine: (cmd) => {
    window.__everestConsole?.log(`[Sandbox] Native execution blocked in Web OS mode: ${cmd}`);
  },
  spawn_async: (argv, callback) => {
    window.__everestConsole?.log(`[Sandbox] Native execution blocked in Web OS mode: ${argv.join(' ')}`);
    if (callback) setTimeout(callback, 100);
  },
  spawnCommandLineAsync: (cmd) => {
    window.__everestConsole?.log(`[Sandbox] Native execution blocked in Web OS mode: ${cmd}`);
  },
  trySpawnCommandLine: (cmd) => {
    window.__everestConsole?.log(`[Sandbox] Native execution blocked in Web OS mode: ${cmd}`);
  },
  trySpawn: (argv) => {
    window.__everestConsole?.log(`[Sandbox] Native execution blocked in Web OS mode: ${argv.join(' ')}`);
  },
  killall: (name) => {
    window.__everestConsole?.log(`[Sandbox] killall blocked: ${name}`);
  },
  queryCollection: (collection, query) => collection.filter(item => {
    for (const [k, v] of Object.entries(query)) {
      if (item[k] !== v) return false;
    }
    return true;
  }),
  unref: () => { },
  runPython: () => {
    window.__everestConsole?.logError(`[Sandbox] Python execution blocked in Web OS mode`);
  },
  runPythonFile: async () => {
    window.__everestConsole?.logError(`[Sandbox] Python execution blocked in Web OS mode`);
    return { exitCode: 1, stdout: '', stderr: 'Python not supported in Web OS mode' };
  },
};

// ── Mock Gettext ──────────────────────────────────────────────────────
const MockGettext = {
  dgettext: (domain, str) => str,
  gettext: (str) => str,
  ngettext: (singular, plural, n) => n === 1 ? singular : plural,
  bindtextdomain: () => { },
  textdomain: () => { },
  domain: () => ({ gettext: (s) => s }),
};

// ── gi Modules ────────────────────────────────────────────────────────
const Pango = {
  EllipsizeMode: { NONE: 0, START: 1, MIDDLE: 2, END: 3 },
  Alignment: { LEFT: 0, CENTER: 1, RIGHT: 2 },
  WrapMode: { WORD: 0, CHAR: 1, WORD_CHAR: 2 },
  AttrList: class { constructor() { } insert() { } },
  attr_weight_new: () => ({}),
  Weight: { BOLD: 700, NORMAL: 400 },
};

const GObject = {
  Object: class { },
  registerClass: (cls) => cls,
  TYPE_STRING: 'string',
  TYPE_INT: 'int',
  TYPE_BOOLEAN: 'boolean',
  TYPE_DOUBLE: 'double',
  ParamFlags: { READABLE: 1, WRITABLE: 2, READWRITE: 3 },
};

const Gtk = {
  IconTheme: {
    get_default: () => ({
      lookup_icon: () => ({ get_filename: () => '' }),
      has_icon: () => true,
      list_icons: () => [],
    }),
  },
};

const GdkPixbuf = {
  Pixbuf: class {
    static new_from_stream(stream, cancellable) {
      const pb = new GdkPixbuf.Pixbuf();
      pb._data = stream?._data || '';
      return pb;
    }
    get_pixels() { return this._data; }
    get_rowstride() { return 0; }
  }
};

const Soup = {
  Session: class { constructor() { } queue_message() { } send_message() { } },
  Message: class { constructor(method, uri) { this.method = method; this.uri = uri; this.response_body = { data: '' }; } },
  SessionAsync: class { constructor() { } queue_message(msg, cb) { if (cb) setTimeout(() => cb(null, msg), 100); } },
};

const Cinnamon = {
  AppSystem: { get_default: () => ({ lookup_app: () => null, get_all: () => [], connect: () => 0 }) },
  GenericContainer: class { constructor() { } },
};

const NM = {
  Client: { new: (cancellable, cb) => { if (cb) setTimeout(() => cb(null, {}), 10); } },
};

const Meta = {
  WindowType: { NORMAL: 0, DIALOG: 1 },
};

const Cogl = {
  PixelFormat: {
    ANY: 0, A_8: 1, RGB_565: 4, RGBA_4444: 5, RGBA_5551: 6, YUV: 7, G_8: 8, RG_88: 9,
    RGB_888: 2, BGR_888: 34, RGBA_8888: 3, BGRA_8888: 35, ARGB_8888: 37, ABGR_8888: 39,
    RGBA_8888_PRE: 19, BGRA_8888_PRE: 51, ARGB_8888_PRE: 53, ABGR_8888_PRE: 55,
    RGBA_4444_PRE: 21, RGBA_5551_PRE: 22, RGBA_1010102: 25, BGRA_1010102: 57,
    ARGB_1010102: 59, ABGR_1010102: 61, RGBA_1010102_PRE: 41, BGRA_1010102_PRE: 73,
    ARGB_1010102_PRE: 75, ABGR_1010102_PRE: 77,
  }
};

// ── Mock Signals (GObject-compatible) ─────────────────────────────────
const MockSignals = {
  addSignalMethods: (proto) => {
    Object.assign(proto, SignalMixin);
  },
};

// ── Global object (replaces CJS `global`) ─────────────────────────────
const globalObj = {
  log: (...args) => {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    console.log('[CJS]', msg);
    window.__everestConsole?.log(msg);
  },
  logError: (...args) => {
    const msg = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
    console.error('[CJS Error]', msg);
    window.__everestConsole?.logError(msg);
  },
  logWarning: (...args) => {
    const msg = args.join(' ');
    console.warn('[CJS Warning]', msg);
    window.__everestConsole?.log(`⚠️ ${msg}`);
  },
  display: {
    get_current_monitor: () => 0,
    get_monitor_geometry: () => ({ x: 0, y: 0, width: 1920, height: 1080 }),
    get_n_monitors: () => 1,
    get_focus_window: () => null,
  },
  screen: {
    get_current_monitor: () => 0,
    get_monitor_geometry: () => ({ x: 0, y: 0, width: 1920, height: 1080 }),
    get_n_monitors: () => 1,
  },
  settings: new Gio.Settings({ schema_id: 'org.cinnamon' }),
  stage: { connect: () => 0 },
  get_current_time: () => Date.now(),
  reparentActor: () => { },
  create_app_launch_context: () => ({}),
};

// ── Build the imports tree ────────────────────────────────────────────
export function createImportsTree() {
  // Metadata registries for appletManager / deskletManager
  // These get populated per-extension in the loader
  const appletMeta = {};
  const deskletMeta = {};

  const tree = {
    ui: {
      applet: { ...Applet, AllowedLayout: { VERTICAL: 'vertical', HORIZONTAL: 'horizontal', BOTH: 'both' } },
      desklet: Desklet,
      settings: { ...Settings, BindingDirection },
      popupMenu: PopupMenu_NS,
      main: Main,
      appletManager: {
        appletMeta,
        applets: {},
        appletObj: [],
        get_role_provider: () => null,
        get_role_provider_exists: () => false,
      },
      deskletManager: {
        deskletMeta,
        desklets: {},
        deskletObj: [],
      },
      extension: {
        Type: { APPLET: 1, DESKLET: 2, EXTENSION: 3 },
        loadExtension: () => Promise.resolve(),
        unloadExtension: () => { },
      },
      tooltips: {
        Tooltip: class {
          constructor(actor, text) { this._text = text || ''; this.actor = actor; }
          set_text(t) { this._text = t; }
          show() { }
          hide() { }
          destroy() { }
        },
        PanelItemTooltip: class {
          constructor(applet, text) { this._text = text || ''; }
          set_text(t) { this._text = t; }
          show() { }
          hide() { }
          destroy() { }
        },
      },
      messageTray: {
        Source: class { constructor(name) { this.name = name; } },
        SystemNotificationSource: class { constructor() { this.title = ''; } },
        Urgency: { LOW: 0, NORMAL: 1, HIGH: 2, CRITICAL: 3 },
      },
      modalDialog: {
        ModalDialog: class {
          constructor() {
            this.contentLayout = { add_actor: () => { }, add_child: () => { }, remove_all_children: () => { } };
            this._actionKeys = {};
          }
          open() { }
          close() { }
          destroy() { }
          setButtons(b) { }
        },
      },
      dialog: {
        Dialog: class { constructor() { } },
        MessageDialogContent: class { constructor() { } },
        showSystemDialog,
      },
      signalManager: {
        SignalManager: class {
          constructor(owner) { this._owner = owner; this._connections = []; }
          connect(obj, sig, cb) {
            if (obj && obj.connect) {
              const id = obj.connect(sig, cb.bind(this._owner));
              this._connections.push({ obj, id });
            }
          }
          disconnectAllSignals() {
            for (const c of this._connections) {
              try { c.obj.disconnect?.(c.id); } catch (e) { }
            }
            this._connections = [];
          }
        },
      },
      panel: {
        PANEL_HEIGHT: 40,
      },
      panelMenu: {},
      flashspot: { Flashspot: class { constructor(area) { } fire() { } } },
      dnd: {
        makeDraggable: (actor) => ({ connect: () => 0 }),
        DragMotionResult: { NO_DROP: 0, COPY_DROP: 1, MOVE_DROP: 2, CONTINUE: 3 },
      },
    },
    gi: {
      St,
      Clutter,
      GLib,
      Gio,
      Pango,
      GObject,
      Gtk,
      GdkPixbuf,
      Soup,
      Cinnamon,
      NM,
      Meta,
      Cogl,
    },
    misc: {
      util: Util,
      params: { parse: (defaults, provided) => ({ ...defaults, ...provided }) },
      fileUtils: {
        readFileSync: () => '',
        listDir: () => [],
        getModuleByIndex: () => ({}),
      },
      interfaces: {},
      // provide cinnamon version
      config: { PACKAGE_VERSION: '6.0.0', CINNAMON_VERSION: '6.0' },
      signalManager: {
        SignalManager: class {
          constructor(owner) { this._owner = owner; this._connections = []; }
          connect(obj, sig, cb) { if (obj?.connect) this._connections.push({ obj, id: obj.connect(sig, cb.bind(this._owner)) }); }
          disconnectAllSignals() { for (const c of this._connections) { try { c.obj.disconnect?.(c.id); } catch (e) { } } this._connections = []; }
        },
      },
      modemManager: { ModemGsm: class { } },
    },
    gettext: MockGettext,
    dialog: { showSystemDialog },
    mainloop: Mainloop,
    lang: {
      bind: (scope, fn) => fn.bind(scope),
      Class: function (classDef) { return classDef; },
    },
    signals: MockSignals,
    searchPath: [],
  };

  return { tree, globalObj, appletMeta, deskletMeta };
}

export { St, Applet, Desklet, Settings, PopupMenu_NS, Clutter, GLib, Gio, Mainloop, Main, Util, globalObj };
