import { IconHelper } from '../../runtime/iconHelper.js';

export async function launch(ctx) {
  const { windowManager, vfs, loader } = ctx;
  const lookingGlass = ctx.console;

  const content = document.createElement('div');
  content.style.padding = '20px';
  content.style.height = '100%';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '15px';
  content.style.overflowY = 'auto';

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0;">System Overview</h3>
      <button id="si-refresh" class="btn-secondary" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('refresh', { size: 14 })} Refresh</button>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${IconHelper.getIcon('folder', { size: 24 })}</div>
        <div style="font-size:12px; color:var(--text-secondary);">Total Folders</div>
        <div id="si-folders" style="font-size:24px; font-weight:bold;">...</div>
      </div>
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${IconHelper.getIcon('file', { size: 24 })}</div>
        <div style="font-size:12px; color:var(--text-secondary);">Total Files</div>
        <div id="si-files" style="font-size:24px; font-weight:bold;">...</div>
      </div>
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${IconHelper.getIcon('plugin', { size: 24 })}</div>
        <div style="font-size:12px; color:var(--text-secondary);">Loaded Plugins</div>
        <div id="si-plugins" style="font-size:24px; font-weight:bold;">...</div>
      </div>
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${IconHelper.getIcon('warning', { size: 24 })}</div>
        <div style="font-size:12px; color:var(--text-secondary);">System Errors</div>
        <div id="si-errors" style="font-size:24px; font-weight:bold;">...</div>
      </div>
    </div>

    <h4 style="margin-top:10px; margin-bottom:5px;">Loaded Plugins List</h4>
    <div id="si-plugin-list" style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:10px; flex:1; overflow-y:auto; min-height:100px;">
      Loading...
    </div>
  `;

  windowManager.createWindow({
    id: 'system-inspector',
    title: 'System Inspector',
    icon: 'storage',
    width: 500,
    height: 450,
    content: content
  });

  const refreshBtn = content.querySelector('#si-refresh');

  const render = async () => {
    content.querySelector('#si-folders').textContent = '...';
    content.querySelector('#si-files').textContent = '...';

    let folderCount = 0;
    let fileCount = 0;

    const scanDir = async (path) => {
      try {
        const items = await vfs.readdir(path);
        for (const item of items) {
          if (item.type === 'dir') {
            folderCount++;
            await scanDir(item.path);
          } else {
            fileCount++;
          }
        }
      } catch (e) { /* ignore */ }
    };

    await scanDir('/');

    content.querySelector('#si-folders').textContent = folderCount;
    content.querySelector('#si-files').textContent = fileCount;

    // Plugins
    const loaded = loader.getLoaded();
    content.querySelector('#si-plugins').textContent = loaded.size;

    const pluginList = content.querySelector('#si-plugin-list');
    if (loaded.size === 0) {
      pluginList.innerHTML = '<div style="color:var(--text-tertiary);">No plugins loaded.</div>';
    } else {
      pluginList.innerHTML = Array.from(loaded.keys()).map(uuid =>
        `<div style="padding:4px 0; border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:12px;">${uuid}</div>`
      ).join('');
    }

    // Errors
    let errorCount = 0;
    if (lookingGlass && lookingGlass._logs) {
      errorCount = lookingGlass._logs.filter(l => l.type === 'error').length;
    }
    const errEl = content.querySelector('#si-errors');
    errEl.textContent = errorCount;
    if (errorCount > 0) errEl.style.color = 'var(--danger)';
    else errEl.style.color = 'var(--text-primary)';
  };

  refreshBtn.addEventListener('click', render);
  render();
}
