import { IconHelper } from '../../runtime/iconHelper.js';

export async function launch(ctx, options = {}) {
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
    <div style="height: 48px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
      <button class="btn-secondary btn-sm" id="zip-open" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('folder', { size: 14 })} Open Archive</button>
      <div style="flex: 1; font-size: 11px; color: var(--text-secondary); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="zip-path">No archive loaded</div>
      <button class="btn-primary btn-sm" id="zip-extract" disabled style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('archive', { size: 14 })} Extract All</button>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 16px;" id="zip-content">
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.4;">
        <div style="font-size: 56px; margin-bottom: 16px;">${IconHelper.getIcon('archive', { size: 64 })}</div>
        <div style="font-size: 14px;">Open an archive to view contents</div>
        <div style="font-size: 11px; margin-top: 8px;">Supports .zip, .tar, .gz</div>
      </div>
    </div>

    <div style="height: 28px; padding: 0 16px; font-size: 10px; color: var(--text-tertiary); border-top: 1px solid var(--border); background: var(--bg-card); display: flex; align-items: center;" id="zip-status">
      Ready
    </div>
  `;

  const win = windowManager.createWindow({
    id: `zip-manager-${Date.now()}`,
    title: 'Archive Manager',
    icon: 'archive',
    width: 600,
    height: 450,
    content: content
  });

  const pathEl = content.querySelector('#zip-path');
  const listEl = content.querySelector('#zip-content');
  const extractBtn = content.querySelector('#zip-extract');
  const openBtn = content.querySelector('#zip-open');
  const statusEl = content.querySelector('#zip-status');

  let currentArchivePath = '';

  const loadArchive = async (path) => {
    if (!path) return;
    currentArchivePath = path;
    pathEl.textContent = path;
    extractBtn.disabled = false;
    statusEl.textContent = `Reading ${path}...`;
    windowManager.setTitle(win.id, `Archive Manager - ${path.split('/').pop()}`);

    listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Scanning archive...</div>';
    
    setTimeout(() => {
      const fileName = path.split('/').pop();
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      
      const mockFiles = [
        { name: `${baseName}/`, size: '—', type: 'dir' },
        { name: `${baseName}/README.txt`, size: '1.2 KB', type: 'file' },
        { name: `${baseName}/data.json`, size: '45 KB', type: 'file' },
        { name: `${baseName}/assets/`, size: '—', type: 'dir' },
        { name: `${baseName}/assets/logo.png`, size: '128 KB', type: 'file' }
      ];

      listEl.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="text-align: left; color: var(--text-tertiary); border-bottom: 1px solid var(--border);">
              <th style="padding: 10px 8px; font-weight: 600;">Name</th>
              <th style="padding: 10px 8px; font-weight: 600; text-align: right;">Size</th>
            </tr>
          </thead>
          <tbody>
            ${mockFiles.map(f => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px 8px; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 16px;">${IconHelper.getIcon(f.type === 'dir' ? 'folder' : 'file', { size: 16 })}</span>
                  <span>${f.name}</span>
                </td>
                <td style="padding: 10px 8px; text-align: right; color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px;">${f.size}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      statusEl.textContent = `Archive loaded: ${mockFiles.length} items`;
    }, 600);
  };

  openBtn.onclick = async () => {
    const path = await filePicker.pickFile({
      title: 'Open Archive',
      filter: ['.zip', '.tar', '.gz', '.7z', '.rar']
    });
    if (path) loadArchive(path);
  };

  extractBtn.onclick = async () => {
    const target = await filePicker.pickFolder({
      title: 'Extract to Folder',
      initialPath: '~/Documents'
    });
    if (target) {
      statusEl.textContent = `Extracting to ${target}...`;
      extractBtn.disabled = true;
      
      setTimeout(async () => {
        const folderName = currentArchivePath.split('/').pop().replace(/\.[^/.]+$/, "");
        const extractPath = `${target}/${folderName}`;
        try {
          await vfs.mkdir(extractPath);
          await vfs.writeFile(`${extractPath}/README.txt`, "Extracted content placeholder");
          statusEl.textContent = `Successfully extracted to ${extractPath}`;
        } catch (e) {
          statusEl.textContent = `Extraction error: ${e.message}`;
        }
        extractBtn.disabled = false;
      }, 1500);
    }
  };

  if (initialPath) loadArchive(initialPath);
}
