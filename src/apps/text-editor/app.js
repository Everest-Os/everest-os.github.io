import { IconHelper } from '../../runtime/iconHelper.js';

export async function launch(ctx, options = {}) {
  const { windowManager, vfs, filePicker } = ctx;
  let currentPath = options.path || null;
  let isModified = false;

  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `;

  content.innerHTML = `
    <div style="height: 40px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 12px; gap: 8px; background: var(--bg-elevated);">
      <button class="btn-secondary btn-sm" id="btn-open" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('folder,📁', { size: 14 })} Open</button>
      <button class="btn-primary btn-sm" id="btn-save" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('disk,💽', { size: 14 })} Save</button>
      <div style="flex: 1; text-align: center; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="status-path">Untitled.txt</div>
      <div id="md-tools" style="display: none; gap: 8px;">
        <button class="btn-secondary btn-sm" id="btn-preview" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('view,👁️', { size: 14 })} Preview</button>
        <button class="btn-secondary btn-sm" id="btn-split" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('monitor,🖥️', { size: 14 })} Split View</button>
      </div>
    </div>
    
    <div style="flex: 1; position: relative; display: flex; overflow: hidden;">
      <div id="editor-container" style="flex: 1; display: flex; transition: flex 0.2s;">
        <textarea id="editor-textarea" spellcheck="false" style="
          flex: 1;
          background: transparent;
          border: none;
          color: inherit;
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 16px;
          resize: none;
          outline: none;
          line-height: 1.5;
        "></textarea>
      </div>
      
      <div id="preview-container" style="
        display: none;
        flex: 1;
        background: var(--bg-surface);
        padding: 24px;
        overflow-y: auto;
        border-left: 1px solid var(--border);
        line-height: 1.6;
        transition: flex 0.2s;
        position: relative;
      " class="markdown-body">
        <button id="btn-edit-md" class="btn-secondary btn-sm" style="position: sticky; top: 0; float: right; z-index: 10; display: none; margin-bottom: 8px; align-items:center; gap:6px;">${IconHelper.getIcon('edit,📝', { size: 14 })} Edit</button>
        <div id="preview-content"></div>
      </div>
    </div>

    <style>
      .markdown-body { color: var(--text-primary); font-size: 14px; }
      .markdown-body h1 { font-size: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 16px; margin-top: 0; }
      .markdown-body h2 { font-size: 20px; border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-bottom: 14px; margin-top: 24px; }
      .markdown-body h3 { font-size: 18px; margin-bottom: 12px; margin-top: 20px; }
      .markdown-body p { margin-bottom: 16px; }
      .markdown-body code { background: var(--bg-input); padding: 2px 4px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; color: var(--accent); }
      .markdown-body pre { background: var(--bg-input); padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; border: 1px solid var(--border); }
      .markdown-body pre code { background: transparent; padding: 0; color: inherit; }
      .markdown-body ul, .markdown-body ol { margin-bottom: 16px; padding-left: 24px; }
      .markdown-body li { margin-bottom: 6px; }
      .markdown-body blockquote { border-left: 4px solid var(--accent); padding-left: 16px; color: var(--text-secondary); font-style: italic; margin-bottom: 16px; background: var(--bg-input); padding: 8px 16px; }
      .markdown-body a { color: var(--accent); text-decoration: none; }
      .markdown-body a:hover { text-decoration: underline; }
      .markdown-body img { max-width: 100%; border-radius: 8px; box-shadow: var(--shadow-sm); }
      .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
      .markdown-body th, .markdown-body td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
      .markdown-body th { background: var(--bg-elevated); font-weight: 600; }
      .markdown-body hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
    </style>
  `;

  const win = windowManager.createWindow({
    id: 'text-editor-' + Math.random().toString(36).substr(2, 9),
    title: 'Text Editor',
    icon: 'text,📝',
    width: 850,
    height: 600,
    content
  });

  const textarea = content.querySelector('#editor-textarea');
  const editorContainer = content.querySelector('#editor-container');
  const preview = content.querySelector('#preview-container');
  const mdTools = content.querySelector('#md-tools');
  const btnPreview = content.querySelector('#btn-preview');
  const btnSplit = content.querySelector('#btn-split');
  const statusPath = content.querySelector('#status-path');

  const parseMarkdown = (text) => {
    let html = text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
      .replace(/^---$/gm, '<hr />');

    // Tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        if (!inTable) {
          inTable = true;
          tableHtml = '<table><thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
        } else if (cells.every(c => c.match(/^:?-+:?$/))) {
          // Skip separator row
          continue;
        } else {
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table>';
          processedLines.push(tableHtml);
          inTable = false;
          tableHtml = '';
        }
        processedLines.push(line);
      }
    }
    if (inTable) processedLines.push(tableHtml + '</tbody></table>');

    html = processedLines.join('\n');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, '');

    // Code
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

    // Paragraphs
    return html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<br/>';
      if (trimmed.startsWith('<')) return trimmed;
      return `<p>${trimmed}</p>`;
    }).join('\n');
  };

  let isSplitView = false;
  let isPreviewing = false;

  const previewContent = content.querySelector('#preview-content');
  const btnEditMd = content.querySelector('#btn-edit-md');

  const updateView = () => {
    const isMd = currentPath?.toLowerCase().endsWith('.md');
    mdTools.style.display = isMd ? 'flex' : 'none';
    
    if (isMd && (isPreviewing || isSplitView)) {
      preview.style.display = 'block';
      previewContent.innerHTML = parseMarkdown(textarea.value);
      editorContainer.style.display = isPreviewing ? 'none' : 'flex';
      btnEditMd.style.display = isPreviewing ? 'block' : 'none';
    } else {
      preview.style.display = 'none';
      editorContainer.style.display = 'flex';
      btnEditMd.style.display = 'none';
    }
  };

  btnEditMd.onclick = () => {
    isPreviewing = false;
    isSplitView = true;
    btnPreview.classList.remove('btn-primary');
    btnSplit.classList.add('btn-primary');
    updateView();
  };

  const loadFile = async (path) => {
    try {
      const text = await vfs.readFile(path);
      
      if (text instanceof Blob) {
        textarea.value = "Unsupported Binary File\n\nThis file is a binary archive or media file and cannot be viewed or edited as plain text.\nIf this is an archive like .7z or .rar, the EverestOS Zip Manager currently only supports .zip formats.";
        textarea.readOnly = true;
        textarea.style.opacity = '0.7';
        content.querySelector('#btn-save').disabled = true;
      } else {
        textarea.value = text;
        textarea.readOnly = false;
        textarea.style.opacity = '1';
        content.querySelector('#btn-save').disabled = false;
      }

      currentPath = path;
      statusPath.textContent = path;
      isModified = false;

      // Auto-preview markdown
      if (path.toLowerCase().endsWith('.md')) {
        isPreviewing = true;
        isSplitView = false;
        btnPreview.classList.add('btn-primary');
        btnSplit.classList.remove('btn-primary');
      }

      updateView();
      windowManager.setTitle(win.id, `Text Editor - ${path.split('/').pop()}`);
    } catch (e) {
      alert('Failed to load file: ' + e.message);
    }
  };

  const saveFile = async () => {
    if (textarea.readOnly) return; // Prevent saving binary placeholders
    if (!currentPath) {
      const newPath = await ctx.filePicker.pickFile({ title: 'Save As', mode: 'save' });
      if (!newPath) return;
      currentPath = newPath;
    }
    try {
      await vfs.writeFile(currentPath, textarea.value);
      isModified = false;
      statusPath.textContent = currentPath;
      windowManager.setTitle(win.id, `Text Editor - ${currentPath.split('/').pop()}`);
    } catch (e) {
      alert('Failed to save file: ' + e.message);
    }
  };

  btnPreview.onclick = () => {
    isPreviewing = !isPreviewing;
    isSplitView = false;
    btnPreview.classList.toggle('btn-primary', isPreviewing);
    btnSplit.classList.remove('btn-primary');
    updateView();
  };

  btnSplit.onclick = () => {
    isSplitView = !isSplitView;
    isPreviewing = false;
    btnSplit.classList.toggle('btn-primary', isSplitView);
    btnPreview.classList.remove('btn-primary');
    updateView();
  };

  textarea.oninput = () => {
    if (isSplitView) {
      previewContent.innerHTML = parseMarkdown(textarea.value);
    }
    if (!isModified) {
      isModified = true;
      windowManager.setTitle(win.id, `Text Editor - ${currentPath ? currentPath.split('/').pop() : 'Untitled'}*`);
    }
  };

  content.querySelector('#btn-open').onclick = async () => {
    const path = await filePicker.pickFile({ title: 'Open File' });
    if (path) loadFile(path);
  };

  content.querySelector('#btn-save').onclick = saveFile;

  if (currentPath) loadFile(currentPath);
}
