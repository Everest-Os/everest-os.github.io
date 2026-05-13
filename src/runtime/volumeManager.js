/**
 * Volume Manager
 * Tracks system-wide master volume and provides a central point for audio control.
 */
export class VolumeManager {
  constructor() {
    this._volume = parseInt(localStorage.getItem('system-volume') || '75');
    this._muted = localStorage.getItem('system-muted') === 'true';
  }

  get volume() {
    return this._muted ? 0 : this._volume;
  }

  get masterVolume() {
    return this._volume;
  }

  get muted() {
    return this._muted;
  }

  setVolume(val) {
    this._volume = Math.max(0, Math.min(100, val));
    localStorage.setItem('system-volume', this._volume);
    this._notify();
  }

  setMuted(val) {
    this._muted = !!val;
    localStorage.setItem('system-muted', this._muted);
    this._notify();
  }

  toggleMute() {
    this.setMuted(!this._muted);
  }

  _notify() {
    window.dispatchEvent(new CustomEvent('system-volume-changed', {
      detail: { 
        volume: this._volume, 
        muted: this._muted,
        effectiveVolume: this.volume
      }
    }));
  }

  /**
   * Helper to calculate actual volume for an element
   * @param {number} localVolume 0-100
   * @returns {number} 0.0-1.0
   */
  calculateActualVolume(localVolume) {
    const master = this.volume / 100;
    const local = localVolume / 100;
    return master * local;
  }
}
