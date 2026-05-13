import { IconHelper } from '../runtime/iconHelper.js';

/**
 * Looking Glass Console — Slide-up debug console mimicking Cinnamon's Looking Glass
 * for everest os
 */

export class LookingGlass {
  constructor(container) {
    this.container = container;
    this._logs = [];
    this._errors = [];
    this._isOpen = false;
    this._activeTab = 'log';
    this._height = 200; // Default height
    this._build();
    this._hookGlobals();
  }

  _build() {
    this.container.innerHTML = `
      <div class="lg-resize-handle"></div>
      <div class="lg-header">
        <div class="lg-tabs">
          <button class="lg-tab active" data-tab="log">${IconHelper.getIcon('copy', { size: 14 })} Log</button>
          <button class="lg-tab" data-tab="errors">${IconHelper.getIcon('error', { size: 14 })} Errors</button>
          <button class="lg-tab" data-tab="inspector">${IconHelper.getIcon('search', { size: 14 })} Inspector</button>
          <button class="lg-tab" data-tab="repl">${IconHelper.getIcon('terminal', { size: 14 })} REPL</button>
        </div>
        <div class="lg-controls">
          <button class="lg-btn" id="lg-clear" title="Clear">${IconHelper.getIcon('trash', { size: 16 })}</button>
          <button class="lg-btn" id="lg-copy" title="Copy to Clipboard">${IconHelper.getIcon('copy', { size: 16 })}</button>
          <button class="lg-btn" id="lg-close" title="Close">✕</button>
        </div>
      </div>
      <div class="lg-body">
        <div class="lg-panel active" id="lg-panel-log">
          <div class="lg-output" id="lg-log-output"></div>
        </div>
        <div class="lg-panel" id="lg-panel-errors">
          <div class="lg-output" id="lg-error-output"></div>
        </div>
        <div class="lg-panel" id="lg-panel-inspector">
          <div class="lg-output" id="lg-inspector-output">
            <div class="inspector-hint">Actor tree of loaded extensions</div>
          </div>
        </div>
        <div class="lg-panel" id="lg-panel-repl">
          <div class="lg-output" id="lg-repl-output"></div>
          <div class="lg-repl-input-row">
            <span class="repl-prompt">»</span>
            <input type="text" class="lg-repl-input" id="lg-repl-input" placeholder="Type JavaScript..." />
          </div>
        </div>
      </div>
    `;

    // Tab switching
    this.container.querySelectorAll('.lg-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('.lg-tab').forEach(t => t.classList.remove('active'));
        this.container.querySelectorAll('.lg-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById(`lg-panel-${tab.dataset.tab}`);
        if (panel) panel.classList.add('active');
        this._activeTab = tab.dataset.tab;
      });
    });

    // Clear
    document.getElementById('lg-clear')?.addEventListener('click', () => {
      this._logs = [];
      this._errors = [];
      const logOut = document.getElementById('lg-log-output');
      const errOut = document.getElementById('lg-error-output');
      if (logOut) logOut.innerHTML = '';
      if (errOut) errOut.innerHTML = '';
    });

    // Copy
    document.getElementById('lg-copy')?.addEventListener('click', () => {
      const output = document.getElementById(`lg-${this._activeTab}-output`);
      if (output) {
        const text = output.innerText;
        navigator.clipboard.writeText(text).then(() => {
          window.__everestConsole?.log(`[System] Copied ${this._activeTab} logs to clipboard`);
        });
      }
    });

    // Close
    document.getElementById('lg-close')?.addEventListener('click', () => this.toggle());

    // REPL
    document.getElementById('lg-repl-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._evalRepl(e.target.value);
        e.target.value = '';
      }
    });

    // Resizing
    const handle = this.container.querySelector('.lg-resize-handle');
    if (handle) {
      handle.style.touchAction = 'none';
      handle.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const startY = e.clientY;
        const startHeight = this._height;
        
        handle.setPointerCapture(e.pointerId);

        const onPointerMove = (moveEvent) => {
          const dy = startY - moveEvent.clientY;
          this._height = Math.max(100, Math.min(window.innerHeight * 0.8, startHeight + dy));
          if (this._isOpen) {
            this.container.style.height = `${this._height}px`;
          }
        };

        const onPointerUp = (e) => {
          handle.releasePointerCapture(e.pointerId);
          handle.removeEventListener('pointermove', onPointerMove);
          handle.removeEventListener('pointerup', onPointerUp);
          handle.removeEventListener('pointercancel', onPointerUp);
        };

        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
        e.preventDefault();
      });
    }
  }

  _hookGlobals() {
    // Make this accessible globally for the runtime
    window.__everestConsole = this;

    // Override console for extension code
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;

    console.log = (...args) => {
      origLog.apply(console, args);
      // Don't double-log CJS messages
      if (args[0]?.toString?.().startsWith?.('[CJS]')) return;
    };

    console.error = (...args) => {
      origError.apply(console, args);
      if (args[0]?.toString?.().startsWith?.('[CJS')) return;
    };
  }

  log(message) {
    const time = new Date().toLocaleTimeString();
    const entry = { time, message: String(message), type: 'info' };
    this._logs.push(entry);
    this._appendToOutput('lg-log-output', entry);
  }

  logError(message) {
    const time = new Date().toLocaleTimeString();
    const entry = { time, message: String(message), type: 'error' };
    this._errors.push(entry);
    this._logs.push(entry);
    this._appendToOutput('lg-log-output', entry);
    this._appendToOutput('lg-error-output', entry);

    // Flash the error tab
    const errorTab = this.container.querySelector('[data-tab="errors"]');
    if (errorTab && this._activeTab !== 'errors') {
      errorTab.classList.add('lg-tab-flash');
      setTimeout(() => errorTab.classList.remove('lg-tab-flash'), 2000);
    }
  }

  _appendToOutput(outputId, entry) {
    const output = document.getElementById(outputId);
    if (!output) return;

    const line = document.createElement('div');
    line.classList.add('lg-line', `lg-line-${entry.type}`);
    line.innerHTML = `<span class="lg-time">${entry.time}</span> <span class="lg-msg">${this._escapeHtml(entry.message)}</span>`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  _evalRepl(code) {
    const output = document.getElementById('lg-repl-output');
    if (!output) return;

    // Show input
    const inputLine = document.createElement('div');
    inputLine.classList.add('lg-line', 'lg-line-input');
    inputLine.innerHTML = `<span class="repl-prompt">»</span> ${this._escapeHtml(code)}`;
    output.appendChild(inputLine);

    try {
      const result = eval(code);
      const resultLine = document.createElement('div');
      resultLine.classList.add('lg-line', 'lg-line-result');
      resultLine.textContent = `← ${this._formatResult(result)}`;
      output.appendChild(resultLine);
    } catch (err) {
      const errLine = document.createElement('div');
      errLine.classList.add('lg-line', 'lg-line-error');
      errLine.innerHTML = `${IconHelper.getIcon('error', { size: 12 })} ${this._escapeHtml(err.message)}`;
      output.appendChild(errLine);
    }

    output.scrollTop = output.scrollHeight;
  }

  _formatResult(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'object') {
      try { return JSON.stringify(val, null, 2).slice(0, 500); } catch { return String(val); }
    }
    return String(val);
  }

  updateInspector(loader) {
    const output = document.getElementById('lg-inspector-output');
    if (!output) return;

    output.innerHTML = '';
    const loaded = loader.getLoaded();

    if (loaded.size === 0) {
      output.innerHTML = '<div class="inspector-hint">No extensions loaded. Load one from the sidebar to inspect its actor tree.</div>';
      return;
    }

    for (const [uuid, ext] of loaded) {
      const tree = document.createElement('div');
      tree.classList.add('inspector-tree');
      tree.innerHTML = `<div class="inspector-root">
        <span class="inspector-icon">${IconHelper.getIcon(ext.type === 'applets' ? 'plugin' : ext.type === 'desklets' ? 'monitor' : 'settings-cog', { size: 14 })}</span>
        <strong>${this._escapeHtml(ext.metadata?.name || uuid)}</strong>
        <span class="inspector-type">[${ext.type}]</span>
      </div>`;

      // List DOM children
      const actorEl = ext.type === 'applets'
        ? document.querySelector(`.sandbox-applet[data-uuid="${uuid}"]`)
        : ext.type === 'desklets'
          ? document.querySelector(`.desklet-frame[data-uuid="${uuid}"]`)
          : null;

      if (actorEl) {
        const domTree = this._buildDOMTree(actorEl, 1);
        tree.appendChild(domTree);
      }

      output.appendChild(tree);
    }
  }

  _buildDOMTree(el, depth) {
    const container = document.createElement('div');
    container.classList.add('inspector-node');
    container.style.paddingLeft = (depth * 16) + 'px';

    const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
    const tag = el.tagName.toLowerCase();
    const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
      ? ` "${el.textContent.slice(0, 30)}"` : '';

    container.innerHTML = `<span class="inspector-tag">&lt;${tag}${classes}&gt;</span>${text ? `<span class="inspector-text">${this._escapeHtml(text)}</span>` : ''}`;

    // Highlight on hover
    container.addEventListener('mouseenter', () => {
      el.style.outline = '2px solid #3584e4';
      el.style.outlineOffset = '2px';
    });
    container.addEventListener('mouseleave', () => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });

    if (depth < 5) {
      for (const child of el.children) {
        container.appendChild(this._buildDOMTree(child, depth + 1));
      }
    }

    return container;
  }

  toggle() {
    this._isOpen = !this._isOpen;
    this.container.classList.toggle('lg-open', this._isOpen);

    if (this._isOpen) {
      this.container.style.height = `${this._height}px`;
    } else {
      this.container.style.height = '0';
    }
  }

  _escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
}
