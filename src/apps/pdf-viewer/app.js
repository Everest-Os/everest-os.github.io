import { IconHelper } from '../../runtime/iconHelper.js';

export function launch(ctx, options = {}) {
  const { windowManager, vfs, filePicker } = ctx;
  const initialPath = options.path || '';

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
    <div style="height: 44px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
      <button id="pv-open" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('pdf,📕', { size: 14 })} Open PDF</button>
      <div style="flex: 1; text-align: center; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="pv-status-path">No PDF loaded</div>
      <div style="width: 80px;"></div>
    </div>

    <div style="flex: 1; position: relative; background: var(--bg-desktop);" id="pv-container">
      <embed id="pv-frame" style="width: 100%; height: 100%; border: none; display: none;" type="application/pdf">
      <div id="pv-no-pdf" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; font-size: 13px; color: var(--text-tertiary); gap: 16px;">
        <div style="font-size: 48px; opacity: 0.3;">${IconHelper.getIcon('pdf,📕', { size: 64 })}</div>
        <div>No PDF document open</div>
      </div>
    </div>
  `;

  const win = windowManager.createWindow({
    id: `pdf-viewer-${Date.now()}`,
    title: 'PDF Reader',
    icon: 'pdf,📕',
    width: 850,
    height: 600,
    content: content
  });

  const iframe = content.querySelector('#pv-frame');
  const noPdf = content.querySelector('#pv-no-pdf');
  const statusPath = content.querySelector('#pv-status-path');

  const loadPdf = (pdfPath) => {
    let resolved = vfs.resolvePath(pdfPath).replace(/^~/, '/home/user');
    const url = `/fs${encodeURI(resolved)}#toolbar=0&navpanes=0&scrollbar=1`;
    
    // We use a fresh clone/replace to force the browser to re-render the embed object
    const oldFrame = content.querySelector('#pv-frame');
    const newFrame = oldFrame.cloneNode(true);
    newFrame.src = url;
    newFrame.style.display = 'block';
    oldFrame.parentNode.replaceChild(newFrame, oldFrame);
    
    noPdf.style.display = 'none';
    statusPath.textContent = pdfPath;
    windowManager.setTitle(win.id, `PDF Reader - ${pdfPath.split('/').pop()}`);
  };

  content.querySelector('#pv-open').onclick = async () => {
    const p = await filePicker.pickFile({
      title: 'Open PDF Document',
      filter: ['.pdf']
    });
    if (p) loadPdf(p);
  };

  if (initialPath) loadPdf(initialPath);
}
