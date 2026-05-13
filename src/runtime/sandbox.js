/**
 * Sandbox Utility
 * Provides safe execution wrappers for apps and plugins.
 * Tracks health and manages automatic recovery.
 */

export class Sandbox {
  static CRASH_THRESHOLD = 3;
  static _crashMap = new Map(); // uuid -> count

  /**
   * Run a function safely, logging errors to Looking Glass
   * @param {string} uuid Unique identifier of the component
   * @param {string} label Label for the action (e.g. 'on_applet_clicked')
   * @param {Function} fn The function to execute
   * @param {Array} args Arguments for the function
   * @returns {*} Result of the function or null
   */
  static run(uuid, label, fn, ...args) {
    if (!fn) return null;
    
    try {
      return fn.apply(null, args);
    } catch (err) {
      this.handleError(uuid, label, err);
      return null;
    }
  }

  /**
   * Run an async function safely
   */
  static async runAsync(uuid, label, fn, ...args) {
    if (!fn) return null;

    try {
      return await fn.apply(null, args);
    } catch (err) {
      this.handleError(uuid, label, err);
      return null;
    }
  }

  static handleError(uuid, label, err) {
    const log = window.__everestConsole;
    const msg = `[Sandbox Error] ${uuid} in ${label}: ${err.message}`;
    
    console.error(msg, err);
    log?.logError(msg);

    // Track crashes
    const count = (this._crashMap.get(uuid) || 0) + 1;
    this._crashMap.set(uuid, count);

    if (count >= this.CRASH_THRESHOLD) {
      this.handleMisbehavior(uuid);
    }
  }

  static handleMisbehavior(uuid) {
    const log = window.__everestConsole;
    const msg = `⚠️ System: Plugin "${uuid}" has misbehaved too many times and was automatically unloaded for stability.`;
    
    log?.logError(msg);
    window.osAPI.showNotification?.({
      title: 'System Stability',
      message: `"${uuid}" was disabled due to multiple errors.`,
      type: 'warning'
    });

    // Notify the loaders to remove it
    window.dispatchEvent(new CustomEvent('sandbox-critical-failure', { detail: { uuid } }));
  }

  static resetHealth(uuid) {
    this._crashMap.delete(uuid);
  }
}
