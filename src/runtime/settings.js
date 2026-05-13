/**
 * Mock Settings API — AppletSettings, DeskletSettings
 * Reads settings-schema.json and binds values to extension properties.
 */

export const BindingDirection = { IN: 1, OUT: 2, BIDIRECTIONAL: 3 };

/**
 * Global schema registry. The extension loader pre-registers schemas here
 * BEFORE extension code is evaluated. This way, when the extension constructor
 * calls `new Settings.AppletSettings(this, uuid, id)`, the schema is
 * already available and bind() can immediately resolve default values.
 */
const _schemaRegistry = {};

class SettingsBase {
  constructor(xlet, uuid, instanceId) {
    this._xlet = xlet;
    this._uuid = uuid;
    this._instanceId = instanceId;
    this._bindings = new Map();
    this._values = {};
    this._schema = null;
    this._storageKey = `everest-settings-${uuid}-${instanceId}`;
    this._vfsPath = `~/.config/extensions/${uuid}/${instanceId}.json`;

    // Initial defaults from schema (if already registered)
    if (_schemaRegistry[uuid]) {
      this._loadSchema(_schemaRegistry[uuid]);
    }

    // Load persisted values (Async from VFS, sync fallback from localStorage)
    this._loadPersisted();
  }

  async _loadPersisted() {
    const vfs = window.__vfs;
    let loadedValues = null;

    // Try VFS first
    if (vfs) {
      try {
        const content = await vfs.readFile(this._vfsPath);
        if (content) loadedValues = JSON.parse(content);
      } catch (e) { }
    }

    // Fallback to localStorage for legacy migration
    if (!loadedValues) {
      try {
        const saved = localStorage.getItem(this._storageKey);
        if (saved) {
          loadedValues = JSON.parse(saved);
          console.log(`[Settings] Migrated settings for ${this._uuid} from localStorage to VFS`);
        }
      } catch (e) { }
    }

    if (loadedValues) {
      this._values = { ...this._values, ...loadedValues };
      this._applyValuesToXlet();
      
      // If we migrated from localStorage, save to VFS now
      if (!vfs?.existsSync?.(this._vfsPath)) {
        this._persist();
      }
    }
  }

  _applyValuesToXlet() {
    for (const [key, binding] of this._bindings) {
      if (key in this._values) {
        this._xlet[binding.prop] = this._values[key];
        if (binding.callback) {
          try { binding.callback.call(this._xlet); } catch (e) { }
        }
      }
    }
  }

  _loadSchema(schema) {
    this._schema = schema;
    if (!schema) return;
    for (const [key, def] of Object.entries(schema)) {
      if (def.type === 'header' || def.type === 'separator') continue;
      if (!(key in this._values)) {
        this._values[key] = def.default !== undefined ? def.default : null;
      }
    }
    this._applyValuesToXlet();
  }

  bind(key, property, callback, direction) {
    this._bindings.set(key, { prop: property, callback, direction: direction || BindingDirection.BIDIRECTIONAL });
    if (key in this._values) {
      this._xlet[property] = this._values[key];
    }
    return true;
  }

  bindProperty(direction, key, property, callback, user_data) {
    return this.bind(key, property, callback, direction);
  }

  getValue(key) {
    return this._values[key];
  }

  setValue(key, value) {
    if (this._values[key] === value) return;
    this._values[key] = value;
    this._persist();
    const binding = this._bindings.get(key);
    if (binding) {
      this._xlet[binding.prop] = value;
      if (binding.callback) {
        try { binding.callback.call(this._xlet); } catch (e) {
          console.error('Settings callback error:', e);
        }
      }
    }
    
    window.dispatchEvent(new CustomEvent('settings-changed', {
      detail: { uuid: this._uuid, instanceId: this._instanceId, key, value }
    }));
  }

  _persist() {
    const vfs = window.__vfs;
    if (vfs) {
      vfs.writeFile(this._vfsPath, JSON.stringify(this._values, null, 2)).catch(() => { });
    }
    // Still keep localStorage as a backup for extreme robustness
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._values));
    } catch { }
  }

  finalize() {
    this._bindings.clear();
  }

  getSchema() {
    return this._schema;
  }

  getValues() {
    return { ...this._values };
  }
}

class AppletSettings extends SettingsBase {
  constructor(xlet, uuid, instanceId) {
    super(xlet, uuid, instanceId);
  }
}

class DeskletSettings extends SettingsBase {
  constructor(xlet, uuid, instanceId) {
    super(xlet, uuid, instanceId);
  }
}

export function registerSchema(uuid, schema) {
  if (uuid && schema) _schemaRegistry[uuid] = schema;
}

export const Settings = {
  AppletSettings,
  DeskletSettings,
  BindingDirection,
  registerSchema,
};
export default Settings;
