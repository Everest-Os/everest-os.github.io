/**
 * EverestOs Bootloader
 * Handles the initial boot sequence UI and progress.
 */
export class BootLoader {
  constructor() {
    this.container = null;
    this.statusEl = null;
    this.progressEl = null;
    this.startTime = Date.now();
    this.minBootTime = 4000; // Minimum 4 seconds of boot screen for "premium" feel
    this._init();
  }

  _init() {
    this.container = document.createElement('div');
    this.container.className = 'everest-bootloader';
    this.container.id = 'bootloader';

    this.container.innerHTML = `
      <div class="boot-logo-container">
        <div class="boot-logo-text">EverestOs</div>
        <div class="boot-logo-subtext">Web Operating System</div>
      </div>
      <div class="boot-progress-container">
        <div class="boot-status-text" id="boot-status">Initializing...</div>
        <div class="boot-progress-bar">
          <div class="boot-progress-fill" id="boot-progress"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.statusEl = this.container.querySelector('#boot-status');
    this.progressEl = this.container.querySelector('#boot-progress');
  }

  /**
   * Update the bootloader status
   * @param {string} message
   * @param {number} progress (0-100)
   */
  async updateStatus(message, progress) {
    if (this.statusEl) {
      // Simulate some variability in processing
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
      this.statusEl.textContent = message;
    }
    if (this.progressEl && progress !== undefined) {
      this.progressEl.style.width = `${progress}%`;
    }
  }

  /**
   * Finalize the boot process and fade out
   */
  async finish() {
    await this.updateStatus('done', 100);

    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.minBootTime - elapsed);

    // Ensure minimum display time
    await new Promise(r => setTimeout(r, remaining + 500));

    this.container.classList.add('fade-out');

    // Remove from DOM after transition
    setTimeout(() => {
      this.container.remove();
    }, 1000);
  }
}
