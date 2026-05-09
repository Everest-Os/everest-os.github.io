/**
 * Code Editor — Built-in editor for viewing/editing extension code with syntax highlighting
 */
import { IconHelper } from '../runtime/iconHelper.js';

export class CodeEditor {
  constructor(container, loader) {
    this.container = container;
    this.loader = loader;
    this._currentFile = null;
    this._currentUuid = null;
    this._isOpen = false;
    this._build();
  }

  _build() {
    this.container.innerHTML = `
      <div class="editor-header">
        <div class="editor-title">
          <span>${IconHelper.getIcon('edit,📝', { size: 18 })}</span>
          <span id="editor-filename">No file open</span>
        </div>
        <div class="editor-controls">
          <select id="editor-file-select" class="editor-select">
            <option value="">Select file...</option>
          </select>
          <button class="btn-primary btn-sm" id="editor-apply" disabled>${IconHelper.getIcon('refresh,🔄', { size: 14 })} Apply & Reload</button>
          <button class="btn-secondary btn-sm" id="editor-close">${IconHelper.getIcon('close,✕', { size: 14 })}</button>
        </div>
      </div>
      <div class="editor-body">
        <div class="editor-line-numbers" id="editor-lines"></div>
        <textarea id="editor-textarea" class="editor-code" spellcheck="false" placeholder="Load an extension and click ⚙️ to edit its code..."></textarea>
      </div>
    `;

    const textarea = document.getElementById('editor-textarea');
    textarea?.addEventListener('input', () => this._updateLineNumbers());
    textarea?.addEventListener('scroll', () => {
      const lines = document.getElementById('editor-lines');
      if (lines) lines.scrollTop = textarea.scrollTop;
    });
    textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }
    });

    document.getElementById('editor-apply')?.addEventListener('click', () => this._applyAndReload());
    document.getElementById('editor-close')?.addEventListener('click', () => this.toggle());

    document.getElementById('editor-file-select')?.addEventListener('change', (e) => {
      if (e.target.value) this._loadFile(e.target.value);
    });
  }

  open(uuid) {
    this._currentUuid = uuid;
    this._isOpen = true;
    this.container.classList.add('editor-open');

    // Load files for this extension
    const ext = this.loader.getLoaded().get(uuid);
    if (!ext) return;

    const select = document.getElementById('editor-file-select');
    if (select) {
      select.innerHTML = '<option value="">Select file...</option>';
      const data = ext.data;
      if (data?.files) {
        for (const fileName of Object.keys(data.files)) {
          const opt = document.createElement('option');
          opt.value = fileName;
          opt.textContent = fileName;
          select.appendChild(opt);
        }
      }
      if (data?.settingsSchema) {
        const opt = document.createElement('option');
        opt.value = '__settings_schema__';
        opt.textContent = 'settings-schema.json';
        select.appendChild(opt);
      }
    }

    // Auto-load main file
    const mainFile = ext.type === 'applets' ? 'applet.js' : ext.type === 'desklets' ? 'desklet.js' : 'extension.js';
    if (ext.data?.files?.[mainFile]) {
      this._loadFile(mainFile);
      if (select) select.value = mainFile;
    }
  }

  _loadFile(fileName) {
    const ext = this.loader.getLoaded().get(this._currentUuid);
    if (!ext) return;

    let content;
    if (fileName === '__settings_schema__') {
      content = JSON.stringify(ext.data.settingsSchema, null, 2);
    } else {
      content = ext.data?.files?.[fileName] || '';
    }

    this._currentFile = fileName;
    const textarea = document.getElementById('editor-textarea');
    const fnLabel = document.getElementById('editor-filename');
    const applyBtn = document.getElementById('editor-apply');

    if (textarea) textarea.value = content;
    if (fnLabel) fnLabel.textContent = `${ext.metadata?.name || this._currentUuid} / ${fileName}`;
    if (applyBtn) applyBtn.disabled = false;

    this._updateLineNumbers();
  }

  _updateLineNumbers() {
    const textarea = document.getElementById('editor-textarea');
    const linesEl = document.getElementById('editor-lines');
    if (!textarea || !linesEl) return;

    const lineCount = textarea.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      html += `<div class="line-num">${i}</div>`;
    }
    linesEl.innerHTML = html;
  }

  _applyAndReload() {
    if (!this._currentUuid || !this._currentFile) return;

    const ext = this.loader.getLoaded().get(this._currentUuid);
    if (!ext) return;

    const textarea = document.getElementById('editor-textarea');
    if (!textarea) return;

    // Update the file in the cached data
    if (this._currentFile === '__settings_schema__') {
      try {
        ext.data.settingsSchema = JSON.parse(textarea.value);
        ext.settingsSchema = ext.data.settingsSchema;
      } catch (e) {
        window.__everestConsole?.logError(`Invalid JSON in settings-schema: ${e.message}`);
        return;
      }
    } else {
      ext.data.files[this._currentFile] = textarea.value;
    }

    // Reload
    window.__everestConsole?.log(`🗘 Reloading ${this._currentUuid} with updated code...`);
    try {
      this.loader.reload(this._currentUuid);
      window.__everestConsole?.log(`✅ Reload successful`);
    } catch (err) {
      window.__everestConsole?.logError(`Reload failed: ${err.message}`);
    }
  }

  toggle() {
    this._isOpen = !this._isOpen;
    this.container.classList.toggle('editor-open', this._isOpen);
  }
}
