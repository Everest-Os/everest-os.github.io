/**
 * Lightweight signal/event system matching GObject signal pattern.
 * Used by all mock Cinnamon objects for event handling.
 */

let _handlerIdCounter = 0;

export class SignalManager {
  constructor() {
    this._handlers = new Map();
  }

  connect(signalName, callback) {
    const id = ++_handlerIdCounter;
    if (!this._handlers.has(signalName)) {
      this._handlers.set(signalName, []);
    }
    this._handlers.get(signalName).push({ id, callback });
    return id;
  }

  disconnect(handlerId) {
    for (const [signal, handlers] of this._handlers) {
      const idx = handlers.findIndex(h => h.id === handlerId);
      if (idx !== -1) {
        handlers.splice(idx, 1);
        if (handlers.length === 0) this._handlers.delete(signal);
        return true;
      }
    }
    return false;
  }

  emit(signalName, ...args) {
    const handlers = this._handlers.get(signalName);
    if (!handlers) return;
    for (const { callback } of handlers) {
      try {
        callback(...args);
      } catch (e) {
        console.error(`Signal '${signalName}' handler error:`, e);
        if (window.__everestConsole) {
          window.__everestConsole.logError(`Signal handler error [${signalName}]: ${e.message}`);
        }
      }
    }
  }

  disconnectAll() {
    this._handlers.clear();
  }
}

/**
 * Mixin to add signal support to any class.
 * Usage: Object.assign(MyClass.prototype, SignalMixin);
 */
export const SignalMixin = {
  _ensureSignals() {
    if (!this._signalManager) {
      this._signalManager = new SignalManager();
    }
  },
  connect(signalName, callback) {
    this._ensureSignals();
    return this._signalManager.connect(signalName, callback);
  },
  disconnect(handlerId) {
    this._ensureSignals();
    return this._signalManager.disconnect(handlerId);
  },
  emit(signalName, ...args) {
    this._ensureSignals();
    this._signalManager.emit(signalName, ...args);
  },
  disconnectAll() {
    if (this._signalManager) this._signalManager.disconnectAll();
  },
};
