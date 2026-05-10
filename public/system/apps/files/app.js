/**
 * Files App — File Manager
 */
const { showContextMenu } = window.osAPI;
const { showSystemDialog } = window.osAPI;
const { IconHelper } = window.osAPI;


window.desktopClipboard = window.desktopClipboard || { type: null, path: null, name: null, items: [] };
const getClipboard = () => window.desktopClipboard;
const setClipboard = (v) => { window.desktopClipboard = v; };

export function launch(ctx, options = {}) {
  const { windowManager, vfs, appLoader } = ctx;
  const initialPath = options.path || 'computer://';

  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `;

  content.innerHTML = `
    <!-- Sidebar -->
    <div style="width: 200px; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0; background: var(--bg-card);">
      <div class="sidebar-item" data-path="computer://">${IconHelper.getIcon('computer,🖥️', { size: 16, className: 'sidebar-icon' })} Computer</div>
      <div class="sidebar-item active" data-path="/home/user">${IconHelper.getIcon('home,🏠', { size: 16, className: 'sidebar-icon' })} Home</div>
      <div class="sidebar-item" data-path="/home/user/Desktop">${IconHelper.getIcon('desktop,🖥️', { size: 16, className: 'sidebar-icon' })} Desktop</div>
      <div class="sidebar-item" data-path="/home/user/Documents">${IconHelper.getIcon('folder,📁', { size: 16, className: 'sidebar-icon' })} Documents</div>
      <div class="sidebar-item" data-path="/home/user/Downloads">${IconHelper.getIcon('download,📥', { size: 16, className: 'sidebar-icon' })} Downloads</div>
      <div class="sidebar-item" data-path="/home/user/Music">${IconHelper.getIcon('music,🎵', { size: 16, className: 'sidebar-icon' })} Music</div>
      <div class="sidebar-item" data-path="/home/user/Videos">${IconHelper.getIcon('video,🎬', { size: 16, className: 'sidebar-icon' })} Videos</div>
      <div class="sidebar-item" data-path="/home/user/Pictures">${IconHelper.getIcon('image,🖼️', { size: 16, className: 'sidebar-icon' })} Pictures</div>
      <div class="sidebar-item" data-path="/system">${IconHelper.getIcon('system,⚙️', { size: 16, className: 'sidebar-icon' })} System</div>
      <div style="flex: 1;"></div>
      <div class="sidebar-item" data-path="/home/user/.local/share/Trash/files">${IconHelper.getIcon('trash,🗑️', { size: 16, className: 'sidebar-icon' })} Trash</div>
    </div>

    <!-- Main Content -->
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- Toolbar -->
      <div style="height: 50px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
        <button id="fm-up" class="btn-secondary btn-sm" title="Up One Level">${IconHelper.getIcon('up,⬆️', { size: 14 })}</button>
        <div style="flex: 1; position: relative; display: flex; align-items: center;">
          <input type="text" id="fm-path" style="width: 100%; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-primary); font-size: 12px; outline: none; font-family: var(--font-mono);">
        </div>
        <div id="fm-actions" style="display: flex; gap: 8px;">
          <button id="fm-mkdir" class="btn-secondary btn-sm">${IconHelper.getIcon('folder,📁', { size: 14 })} New Folder</button>
          <button id="fm-upload" class="btn-primary btn-sm">${IconHelper.getIcon('upload,📤', { size: 14 })} Upload</button>
          <button id="fm-empty-trash" class="btn-danger btn-sm" style="display: none;">${IconHelper.getIcon('trash,🗑️', { size: 14 })} Empty Trash</button>
        </div>
      </div>

      <!-- File List -->
      <div id="fm-list" style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px; padding: 20px; align-content: start;">
      </div>
      
      <!-- Status Bar -->
      <div id="fm-status" style="height: 24px; padding: 0 16px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-tertiary); display: flex; align-items: center; background: var(--bg-card);">
        0 items
      </div>
    </div>

    <style>
      .sidebar-item {
        padding: 8px 20px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
        border-left: 3px solid transparent;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .sidebar-icon {
        flex-shrink: 0;
      }
      .sidebar-item:hover { background: var(--bg-surface-hover); }
      .sidebar-item.active {
        background: rgba(var(--accent-rgb), 0.1);
        border-left-color: var(--accent);
        color: var(--accent);
        font-weight: 600;
      }
      .fm-file-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.1s, background 0.2s;
        text-align: center;
        user-select: none;
      }
      .fm-file-item:hover { background: var(--bg-surface-hover); }
      .fm-file-item.selected { background: rgba(var(--accent-rgb), 0.15) !important; box-shadow: inset 0 0 0 1px var(--accent); }
      .fm-file-item:active { transform: scale(0.95); }
    </style>
    <input type="file" id="fm-file-input" style="display:none" multiple>
  `;

  const win = windowManager.createWindow({
    id: `file-manager-${Date.now()}`,
    title: 'Files',
    icon: 'folder,📁',
    width: 850,
    height: 550,
    content: content
  });

  const fmList = content.querySelector('#fm-list');
  const pathInput = content.querySelector('#fm-path');
  const statusEl = content.querySelector('#fm-status');
  const emptyTrashBtn = content.querySelector('#fm-empty-trash');
  const fmActions = content.querySelector('#fm-actions');
  let currentPath = initialPath;

  const renderComputerPage = async () => {
    const fsInfo = await vfs.getInfo();
    const isServer = fsInfo.root !== 'browser-storage';
    const SYSTEM_CONFIG = {
      storageLimitServer: 2048 * 1024 * 1024,
      storageLimitLocal: 100 * 1024 * 1024,
    };

    let storageInfo;
    try {
      const info = await vfs.getInfo();
      if (info && info.root !== 'browser-storage') {
        storageInfo = { label: 'Server File System', color: '#44ff44', persistent: true };
      } else {
        throw new Error();
      }
    } catch {
      if (vfs.db) storageInfo = { label: 'IndexedDB (Browser Storage)', color: '#ffaa00', persistent: false };
      else if (vfs.useLocalStorage) storageInfo = { label: 'LocalStorage', color: '#ff6644', persistent: false };
      else storageInfo = { label: 'In-Memory (Volatile)', color: '#ff4444', persistent: false };
    }

    fmList.innerHTML = `
      <div style="grid-column: 1/-1; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h2 style="margin-top: 0; display: flex; align-items: center; gap: 12px; font-weight: 700; color: #fff;">
          ${IconHelper.getIcon('computer,💻', { size: 48 })} Everest OS
        </h2>
        
        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Virtual File System</div>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-weight: 600;">Disk Usage</span>
            <span id="fm-storage-val" style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 13px;">Calculating...</span>
          </div>
          <div style="height: 10px; background: var(--bg-elevated); border-radius: 5px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);">
            <div id="fm-storage-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), ${storageInfo.color}); transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
          </div>
          <div style="margin-top:16px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
              <div style="width:10px; height:10px; border-radius:50%; background:${storageInfo.color}; box-shadow:0 0 8px ${storageInfo.color};"></div>
              <div>
                <div style="font-size:13px; font-weight:600;">Active Backend: ${storageInfo.label}</div>
                <div style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">
                  ${storageInfo.persistent
                    ? '✅ Files persist on disk — safe across reloads and browser clears'
                    : '⚠️ Files stored in browser — survive reload, but may be lost if browser data is cleared'}
                </div>
              </div>
            </div>
            <div id="fm-file-count" style="font-size:11px; color:var(--text-secondary); padding:0 4px;">Counting files...</div>
          </div>
        </div>

        ${!isServer ? `
        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Storage Quota</div>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; font-weight:600;">Browser Quota</span>
            <span id="fm-quota-val" style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);">Checking...</span>
          </div>
          <div style="height:8px; background:var(--bg-elevated); border-radius:4px; overflow:hidden;">
            <div id="fm-quota-bar" style="height:100%; width:0%; background:linear-gradient(90deg, #22c55e, #3b82f6); transition:width 0.8s;"></div>
          </div>
          <div id="fm-quota-detail" style="font-size:11px; color:var(--text-tertiary);"></div>
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
            <div>
              <div style="font-size:12px; font-weight:600;">Persistent Storage</div>
              <div style="font-size:10px; color:var(--text-tertiary); margin-top:2px;">Prevents browser from auto-clearing your files</div>
            </div>
            <button id="fm-btn-persist" class="btn-secondary btn-sm" style="padding:6px 14px; font-size:11px;">Enable</button>
          </div>
        </div>
        ` : ''}

        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Drives & Partitions</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;" id="fm-drives-list">
          <div class="fm-drive-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 14px;" data-path="/">
            <div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${IconHelper.getIcon('disk,💽', { size: 32 })}</div>
            <div>
              <div style="font-weight: 600; font-size: 13px;">Root Partition</div>
              <div style="font-size: 11px; color: var(--text-secondary);">/ (Primary)</div>
            </div>
          </div>
        </div>

        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Backup & Recovery</div>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">Export a portable backup that works across all storage modes. A backup from IndexedDB can restore to Server FS and vice versa.</p>
          <div style="display: flex; gap: 12px;">
            <button id="fm-btn-export" class="btn-secondary" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">${IconHelper.getIcon('upload,📤', { size: 14 })} Export Backup</button>
            <button id="fm-btn-import" class="btn-secondary" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">${IconHelper.getIcon('download,📥', { size: 14 })} Import Backup</button>
          </div>
          <div id="fm-backup-status" style="font-size:11px; color:var(--text-tertiary); display:none; padding:8px 12px; background:rgba(0,0,0,0.1); border-radius:6px;"></div>
          <input type="file" id="fm-import-file" style="display: none;" accept=".json">
        </div>

        ${!isServer ? `
        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ff4444; margin-bottom: 12px;">Reset & Recovery</div>
        <div style="background: var(--bg-card); border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
            Accidentally deleted an important system file? Reset will restore the original system image. All your custom files, settings, and modifications will be removed.
          </p>
          <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">⚠️</span>
            <span style="font-size: 11px; color: var(--text-secondary);">We recommend exporting a backup before resetting. Use the <strong>Export Backup</strong> button above to save your files first.</span>
          </div>
          <button id="fm-btn-reset" class="btn-danger" style="width: 100%; padding: 10px; font-weight: 600;">
            ${IconHelper.getIcon('restart,🔄', { size: 14 })} Reset System & Fetch Fresh
          </button>
        </div>
        ` : ''}
      </div>

      <style>
        .fm-drive-card:hover { 
          background: var(--bg-surface-hover); 
          transform: translateY(-2px); 
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      </style>
    `;


    const storageVal = fmList.querySelector('#fm-storage-val');
    const storageBar = fmList.querySelector('#fm-storage-bar');
    const fileCountEl = fmList.querySelector('#fm-file-count');
    const backupStatusEl = fmList.querySelector('#fm-backup-status');

    const showFmStatus = (msg) => {
      backupStatusEl.style.display = 'block';
      backupStatusEl.textContent = msg;
    };
    
    const formatBytes = (bytes) => {
      if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
      if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(0) + ' MB';
      if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
      return bytes + ' B';
    };

    // Storage calculation
    let total = 0;
    let fileCount = 0;
    const scan = async (path) => {
      try {
        const items = await vfs.readdir(path);
        for (const item of items) {
          if (item.type === 'dir') await scan(item.path);
          else { total += item.size || 0; fileCount++; }
        }
      } catch(e) {}
    };
    await scan('/');
    
    let max = isServer ? SYSTEM_CONFIG.storageLimitServer : SYSTEM_CONFIG.storageLimitLocal;
    if (!isServer && navigator.storage?.estimate) {
      try { const est = await navigator.storage.estimate(); if (est.quota) max = est.quota; } catch {}
    }
    const percent = Math.min(100, (total / max) * 100);
    storageVal.textContent = `${(total / 1024 / 1024).toFixed(2)} MB of ${formatBytes(max)} used`;
    storageBar.style.width = percent + '%';
    fileCountEl.textContent = `${fileCount} files indexed`;

    // ── Storage Quota & Persistence (IndexedDB mode only) ──────────
    const fmQuotaVal = fmList.querySelector('#fm-quota-val');
    const fmQuotaBar = fmList.querySelector('#fm-quota-bar');
    const fmQuotaDetail = fmList.querySelector('#fm-quota-detail');
    const fmPersistBtn = fmList.querySelector('#fm-btn-persist');

    if (fmQuotaVal && navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const used = est.usage || 0;
        const quota = est.quota || 0;
        const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;
        fmQuotaVal.textContent = `${formatBytes(used)} / ${formatBytes(quota)}`;
        fmQuotaBar.style.width = pct.toFixed(1) + '%';
        fmQuotaDetail.textContent = `${formatBytes(quota - used)} available · Browser allocates quota based on your free disk space`;
      } catch { fmQuotaVal.textContent = 'Not available'; }
    }

    if (fmPersistBtn) {
      try {
        const persisted = await navigator.storage.persisted();
        if (persisted) { fmPersistBtn.textContent = '✅ Enabled'; fmPersistBtn.disabled = true; fmPersistBtn.style.opacity = '0.7'; }
      } catch {}

      fmPersistBtn.onclick = async () => {
        try {
          const granted = await navigator.storage.persist();
          if (granted) { 
            fmPersistBtn.textContent = '✅ Enabled'; fmPersistBtn.disabled = true; fmPersistBtn.style.opacity = '0.7'; 
          } else { 
            fmPersistBtn.textContent = '❌ Denied'; 
            setTimeout(() => { fmPersistBtn.textContent = 'Try Again'; }, 2000); 
            showSystemDialog({
              title: 'Storage Persistence Denied',
              message: 'Your browser denied the request to make storage persistent.\\n\\nBrowsers usually require you to bookmark the page, install it as a Web App (PWA), or interact with it more before granting this permission.\\n\\nTry bookmarking the page and trying again!',
              type: 'alert'
            });
          }
        } catch { fmPersistBtn.textContent = '❌ Not supported'; }
      };
    }

    // Cross-mode Backup
    fmList.querySelector('#fm-btn-export').onclick = async () => {
      try {
        showFmStatus('⏳ Collecting files...');
        const files = [];
        const walk = async (dir) => {
          try {
            const items = await vfs.readdir(dir);
            for (const item of items) {
              if (item.type === 'dir') {
                files.push({ path: item.path, type: 'dir' });
                await walk(item.path);
              } else {
                try {
                  const content = await vfs.readFile(item.path);
                  files.push({ path: item.path, type: 'file', content, size: content.length });
                } catch { }
              }
            }
          } catch { }
        };
        await walk('/');
        const backup = { version: '1.0', os: 'EverestOS', timestamp: new Date().toISOString(), fileCount: files.length, files };
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `everest-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showFmStatus(`✅ Backup downloaded — ${files.length} files, ${(blob.size / 1024).toFixed(1)} KB`);
      } catch (e) { showFmStatus(`❌ Export failed: ${e.message}`); }
    };

    // Cross-mode Restore
    const importInput = fmList.querySelector('#fm-import-file');
    fmList.querySelector('#fm-btn-import').onclick = () => importInput.click();
    importInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const raw = JSON.parse(ev.target.result);
          let backupData;
          if (Array.isArray(raw)) {
            backupData = { files: raw, timestamp: 'legacy', os: 'unknown' };
          } else if (raw.files) {
            backupData = raw;
          } else {
            throw new Error('Invalid backup format');
          }

          showSystemDialog({
            title: 'Import Backup',
            message: `Restore ${backupData.files.length} items from ${backupData.os || 'unknown'} (${backupData.timestamp || 'unknown'})? Files will be written to the active storage backend (${storageInfo.label}).`,
            type: 'confirm',
            onConfirm: async () => {
              showFmStatus('⏳ Restoring files...');
              try {
                const { restored, errors } = await vfs.importBackup(backupData);
                showFmStatus(`✅ Restored ${restored} items${errors > 0 ? `, ${errors} errors` : ''}. Reloading...`);
                setTimeout(() => location.reload(), 1500);
              } catch (err) {
                showFmStatus(`❌ Import failed: ${err.message}`);
              }
            }
          });
        } catch (err) { showFmStatus(`❌ Import failed: ${err.message}`); }
      };
      reader.readAsText(file);
    };

    // Reset & Fetch Fresh (only present in static/IndexedDB mode)
    const resetBtn = fmList.querySelector('#fm-btn-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        showSystemDialog({
          title: 'Reset System & Fetch Fresh',
          message: 'This will erase ALL local data (files, settings, plugins) and re-download the original system image.\n\n⚠️ Have you exported a backup? This cannot be undone.',
          type: 'confirm',
          onConfirm: async () => {
            resetBtn.disabled = true;
            resetBtn.textContent = '⏳ Clearing & re-fetching...';
            try {
              await vfs.wipe();
              location.reload();
            } catch (e) {
              resetBtn.disabled = false;
              resetBtn.textContent = '❌ Failed — try again';
            }
          }
        });
      };
    }

    fmList.querySelector('.fm-drive-card').onclick = () => {
      currentPath = '/';
      renderFilesV2();
    };
  };

  const renderFilesV2 = async () => {
    if (!content.isConnected) return;
    
    if (currentPath === 'computer://') {
      pathInput.value = 'computer://';
      renderComputerPage();
      content.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.path === 'computer://');
      });
      statusEl.textContent = 'System Status';
      emptyTrashBtn.style.display = 'none';
      content.querySelector('#fm-mkdir').style.display = 'none';
      content.querySelector('#fm-upload').style.display = 'none';
      return;
    }

    pathInput.value = currentPath;
    const isTrash = currentPath.includes('/Trash/files');
    
    content.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.path === currentPath);
    });

    emptyTrashBtn.style.display = isTrash ? 'block' : 'none';
    content.querySelector('#fm-mkdir').style.display = isTrash ? 'none' : 'block';
    content.querySelector('#fm-upload').style.display = isTrash ? 'none' : 'block';

    try {
      const items = await vfs.readdir(currentPath);
      fmList.innerHTML = '';
      statusEl.textContent = `${items.length} item(s)`;
      
      if (items.length === 0) {
        fmList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; margin-top: 100px; color: var(--text-tertiary); font-size: 13px;">This folder is empty.</div>`;
      }

      items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'fm-file-item';
        el.dataset.path = item.path;
        el.dataset.name = item.name;
        
        let icon = '';
        const ext = item.name.split('.').pop().toLowerCase();
        
        if (item.type === 'dir') {
          icon = IconHelper.getIcon('folder,📁', { size: 40 });
        } else {
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            const imgId = `fm-img-${Math.random().toString(36).substr(2, 9)}`;
            icon = `<img id="${imgId}" src="${IconHelper.getRaw('image')}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; box-shadow: var(--shadow-sm);" />`;
            vfs.readFile(item.path).then(dataUrl => {
              const img = document.getElementById(imgId);
              if (img) img.src = dataUrl;
            }).catch(() => {});
          } else {
            icon = IconHelper.getIcon(ext, { size: 40 });
          }
        }

        el.innerHTML = `
          <div style="font-size:36px; margin-bottom:8px; height:40px; display:flex; align-items:center; justify-content:center;">${icon}</div>
          <div style="font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:center;">${item.name}</div>
        `;

        el.onclick = (e) => {
          e.stopPropagation();
          if (!e.ctrlKey) fmList.querySelectorAll('.fm-file-item').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
          window.lastFocusedScope = { type: 'files', currentPath, renderFiles: renderFilesV2, fmList, vfs };
        };

        el.ondblclick = () => {
          if (item.type === 'dir') {
            currentPath = item.path;
            renderFilesV2();
          } else {
            if (['mp3', 'ogg', 'wav', 'm4a', 'aac'].includes(ext)) appLoader.launchApp('music-player', { path: item.path });
            else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) appLoader.launchApp('video-player', { path: item.path });
            else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) appLoader.launchApp('image-viewer', { path: item.path });
            else if (ext === 'pdf') appLoader.launchApp('pdf-viewer', { path: item.path });
            else if (ext === 'html') appLoader.launchApp('web-browser', { url: item.path });
            else if (ext === 'zip') appLoader.launchApp('zip-manager', { path: item.path });
            else if (['doc', 'docx', 'odt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) appLoader.launchApp('office', { path: item.path });
            else appLoader.launchApp('text-editor', { path: item.path });
          }
        };

        el.oncontextmenu = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!el.classList.contains('selected')) {
            fmList.querySelectorAll('.fm-file-item').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
          }
          
          const selectedItems = Array.from(fmList.querySelectorAll('.fm-file-item.selected')).map(x => ({ path: x.dataset.path, name: x.dataset.name }));

          const menuItems = [
            { icon: 'folder,📁', label: 'Open', action: () => el.ondblclick() },
            { separator: true }
          ];

          if (isTrash) {
            menuItems.push(
              { icon: 'undo,↩️', label: 'Restore', action: async () => {
                for (const si of selectedItems) await vfs.restore(si.path);
                renderFilesV2();
              }},
              { icon: 'trash,🗑️', label: 'Delete Permanently', danger: true, action: () => {
                showSystemDialog({
                  title: 'Delete Permanently',
                  message: `Delete ${selectedItems.length} item(s) permanently?`,
                  type: 'confirm',
                  onConfirm: async () => {
                    for (const si of selectedItems) await vfs.rm(si.path);
                    renderFilesV2();
                  }
                });
              }}
            );
          } else {
            menuItems.push(
              { icon: 'edit,📝', label: 'Rename', action: () => {
                showSystemDialog({ title: 'Rename', type: 'prompt', value: item.name, onConfirm: async (val) => {
                  if (val) {
                    const parent = item.path.substring(0, item.path.lastIndexOf('/'));
                    await vfs.rename(item.path, `${parent}/${val}`);
                    renderFilesV2();
                  }
                }});
              }},
              { icon: 'copy,📄', label: 'Copy', action: () => setClipboard({ type: 'copy', items: selectedItems, name: selectedItems[0].name, path: selectedItems[0].path }) },
              { icon: 'cut,✂️', label: 'Cut', action: () => setClipboard({ type: 'cut', items: selectedItems, name: selectedItems[0].name, path: selectedItems[0].path }) },
              { separator: true },
              { icon: 'trash,🗑️', label: 'Move to Trash', danger: true, action: async () => {
                for (const si of selectedItems) await vfs.trash(si.path);
                renderFilesV2();
              }}
            );
          }
          showContextMenu(menuItems, e.clientX, e.clientY);
        };

        fmList.appendChild(el);
      });
    } catch (e) { console.error(e); }
  };

  // VFS Change Listener
  vfs.onChange((path) => {
    if (path === currentPath || path.startsWith(currentPath + '/')) {
      renderFilesV2();
    }
  });

  window.addEventListener('icon-theme-changed', () => {
    renderFilesV2();
  });

  // Background context menu
  fmList.oncontextmenu = (e) => {
    if (e.target !== fmList) return;
    e.preventDefault();
    
    const menuItems = [
      {
        icon: 'folder,📁',
        label: 'New Folder',
        action: () => {
          showSystemDialog({
            title: 'New Folder',
            type: 'prompt',
            onConfirm: async (val) => {
              if (val) {
                await vfs.mkdir(`${currentPath}/${val}`);
                renderFilesV2();
              }
            }
          });
        }
      },
      {
        icon: 'file,📄',
        label: 'New Text File',
        action: () => {
          showSystemDialog({
            title: 'New File',
            type: 'prompt',
            onConfirm: async (val) => {
              if (val) {
                await vfs.writeFile(`${currentPath}/${val}.txt`, '');
                renderFilesV2();
              }
            }
          });
        }
      },
      { separator: true },
      {
        icon: 'paste,📋',
        label: 'Paste',
        disabled: !window.desktopClipboard?.path,
        action: async () => {
          const clip = window.desktopClipboard;
          if (clip) {
            try {
              const targetPath = `${currentPath}/${clip.name}`;
              if (clip.type === 'copy') {
                const content = await vfs.readFile(clip.path);
                await vfs.writeFile(targetPath, content);
              } else {
                await vfs.rename(clip.path, targetPath);
                window.desktopClipboard = null;
              }
              renderFilesV2();
            } catch(e) { console.error(e); }
          }
        }
      }
    ];
    showContextMenu(menuItems, e.clientX, e.clientY);
  };

  // Event Listeners
  content.querySelectorAll('.sidebar-item').forEach(item => {
    item.onclick = () => {
      currentPath = item.dataset.path;
      renderFilesV2();
    };
  });

  content.querySelector('#fm-up').onclick = () => {
    if (currentPath === 'computer://') return;
    if (currentPath !== '/') {
      currentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      renderFilesV2();
    }
  };

  pathInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      currentPath = vfs.resolvePath(pathInput.value);
      renderFilesV2();
    }
  };

  content.querySelector('#fm-mkdir').onclick = () => {
    showSystemDialog({ title: 'New Folder', type: 'prompt', onConfirm: async (val) => {
      if (val) {
        await vfs.mkdir(`${currentPath}/${val}`);
        renderFilesV2();
      }
    }});
  };

  emptyTrashBtn.onclick = () => {
    showSystemDialog({ title: 'Empty Trash', message: 'Are you sure you want to delete everything in the Trash?', type: 'confirm', onConfirm: async () => {
      await vfs.emptyTrash();
      renderFilesV2();
    }});
  };

  content.querySelector('#fm-upload').onclick = () => content.querySelector('#fm-file-input').click();
  content.querySelector('#fm-file-input').onchange = async (e) => {
    for (const file of e.target.files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await vfs.writeFile(`${currentPath}/${file.name}`, ev.target.result);
        renderFilesV2();
      };
      reader.readAsDataURL(file);
    }
  };

  renderFilesV2();
}
