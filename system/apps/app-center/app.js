/**
 * Hub for managing applications and extensions.
 */
const { IconHelper } = window.osAPI;
const { showSystemDialog } = window.osAPI;
const { ZipHelper } = window.osAPI;

export async function launch(ctx, options = {}) {
  const { windowManager, vfs, appLoader, loader } = ctx;
  const extensionLoader = loader;

  const existingWin = windowManager.windows.get('app-center');
  if (existingWin) {
    windowManager.focusWindow('app-center');
    return;
  }

  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `;

  content.innerHTML = `
    <div id="app-center-sidebar" style="
      width: 220px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 16px 0;
      flex-shrink: 0;
    ">
      <div style="padding: 0 20px 20px; font-weight: 800; font-size: 16px; color: var(--accent);">
        App Center
      </div>
      
      <div style="padding: 0 20px 8px; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">
        Local
      </div>
      <div class="nav-item active" data-view="installed-apps">${IconHelper.getIcon('archive', { size: 14 })} Installed Apps</div>
      <div class="nav-item" data-view="installed-exts">${IconHelper.getIcon('plugin', { size: 14 })} Installed Extensions</div>
      
      <div style="padding: 24px 20px 8px; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">
        Explore
      </div>
      <div class="nav-item" data-view="get-apps">${IconHelper.getIcon('app-center', { size: 14 })} Get Apps</div>
      <div class="nav-item" data-view="get-exts">${IconHelper.getIcon('bolt', { size: 14 })} Get Extensions</div>
    </div>
    
    <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
      <div style="height: 60px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 16px;">
        <div style="flex: 1; position: relative;">
          <input type="text" id="app-search" placeholder="Search applications..." style="
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border);
            color: var(--text-primary);
            padding: 8px 12px 8px 36px;
            border-radius: 20px;
            font-size: 13px;
            outline: none;
          " />
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.4;">${IconHelper.getIcon('search', { size: 14 })}</span>
        </div>
      </div>
      
      <div id="app-center-body" style="flex: 1; overflow-y: auto; padding: 24px;">
      </div>
    </div>

    <style>
      .nav-item {
        padding: 10px 20px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      .nav-item:hover {
        background: var(--bg-card-hover);
      }
      .nav-item.active {
        background: rgba(var(--accent-rgb), 0.1);
        border-left-color: var(--accent);
        color: var(--accent);
        font-weight: 600;
      }
      .app-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        gap: 16px;
        align-items: center;
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }
      .app-card:hover {
        transform: translateY(-2px);
        background: var(--bg-card-hover);
        box-shadow: var(--shadow-md);
      }
    </style>
  `;

  const win = windowManager.createWindow({
    id: 'app-center',
    title: 'App Center',
    icon: 'app-center',
    width: 850,
    height: 600,
    content
  });

  const sidebar = content.querySelector('#app-center-sidebar');
  const body = content.querySelector('#app-center-body');
  const searchInput = content.querySelector('#app-search');

  let currentView = 'installed-apps';

  const setView = (viewId) => {
    currentView = viewId;
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });
    searchInput.placeholder = viewId.includes('ext') ? 'Search extensions...' : 'Search applications...';
    render();
  };

  const performAction = async (item, type, isLoaded) => {
    const isApp = type === 'app' || type === 'online-app';
    if (isApp) {
      document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: item.id } }));
    } else {
      if (isLoaded) {
        extensionLoader.markAsRemoved(item.uuid);
        extensionLoader.unload(item.uuid);
      } else {
        const discovered = await extensionLoader.discover();
        const installed = discovered.find(e => e.uuid === item.uuid);
        if (installed) {
          if (extensionLoader.unmarkAsRemoved) extensionLoader.unmarkAsRemoved(item.uuid);
          await extensionLoader.loadFromVfs(item.uuid, installed.path, item.type);
        }
      }
      render();
    }
  };

  const performUninstall = async (item, type) => {
    const isApp = type === 'app' || type === 'online-app';
    showSystemDialog({
      title: isApp ? 'Uninstall Application' : 'Uninstall Extension',
      message: `Are you sure you want to uninstall "${item.name || item.uuid}"? This will delete all its source files.`,
      type: 'confirm',
      confirmText: 'Uninstall',
      onConfirm: async () => {
        try {
          if (isApp) {
            const appPath = appLoader.getAppPath(item.id);
            if (appPath) {
              await vfs.rm(appPath);
              try { await vfs.rm(`~/Desktop/${item.name}.desktop`); } catch(e) {}
              await appLoader.init();
            }
          } else {
            const discovered = await extensionLoader.discover();
            const installed = discovered.find(e => e.uuid === item.uuid);
            if (installed) {
              await extensionLoader.unload(item.uuid);
              await vfs.rm(installed.path);
            }
          }
          render();
        } catch (e) {
          showSystemDialog({ title: 'Error', message: 'Failed to uninstall: ' + e.message, type: 'alert' });
        }
      }
    });
  };

  const performInstall = async (item, isApp, btn) => {
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Installing...';
    
    try {
      const downloadUrl = item.downloadUrl || 
        `https://raw.githubusercontent.com/Everest-Os/repo/main/${item.type === 'applets' || item.type === 'desklets' || item.type === 'extensions' ? `plugins/${item.type}` : 'apps'}/${item.id || item.uuid}/bundle.zip`;
        
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Failed to download package');
      
      const blob = await res.blob();
      const targetId = isApp ? (item.id || item.name) : item.uuid;
      const targetDir = isApp 
        ? `~/.local/share/applications/${targetId}` 
        : `~/.local/share/plugins/${item.type}/${targetId}`;
        
      await vfs.mkdir(targetDir);
      await ZipHelper.extractToVfs(blob, targetDir, vfs);
      
      try {
        const JSZip = await ZipHelper.getJSZip();
        const zip = await JSZip.loadAsync(blob);
        let iconExt = zip.files['icon.svg'] ? 'svg' : zip.files['icon.png'] ? 'png' : null;
        if (iconExt) {
           const iconBlob = await zip.file(`icon.${iconExt}`).async('blob');
           await vfs.mkdir('~/.local/share/icons');
           await vfs.writeFile(`~/.local/share/icons/${item.icon || targetId}.${iconExt}`, iconBlob);
        }
      } catch(e) { }
      
      btn.textContent = 'Installed';
      if (isApp) await appLoader.init();
      
      setTimeout(() => {
        render();
      }, 1000);
      
    } catch (err) {
      btn.disabled = false;
      btn.textContent = originalText;
      showSystemDialog({ title: 'Installation Failed', message: err.message, type: 'alert' });
    }
  };

  const render = async () => {
    body.innerHTML = '';
    const query = searchInput.value.toLowerCase();
    const discoveredExts = await extensionLoader.discover();
    const loadedExts = extensionLoader.getLoaded();

    const createGrid = () => {
      const g = document.createElement('div');
      g.style.display = 'grid';
      g.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      g.style.gap = '16px';
      return g;
    };

    if (currentView === 'installed-apps') {
      const apps = appLoader.getApps().filter(a =>
        a.name.toLowerCase().includes(query) || a.id.toLowerCase().includes(query)
      );

      const grid = createGrid();
      apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center;">
            ${IconHelper.getIcon(app.icon || 'archive', { size: 32 })}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 14px;">${app.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${app.description || app.id}
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="btn-primary btn-sm btn-launch" style="flex: 1; height: 26px; padding: 0;">Launch</button>
              <button class="btn-secondary btn-sm btn-details" style="height: 26px; width: 26px; padding: 0; display: flex; align-items: center; justify-content: center;" title="Details">${IconHelper.getIcon('info', { size: 14 })}</button>
              ${app.source !== 'builtin' ? '<button class="btn-secondary btn-sm btn-uninstall" style="height: 26px; width: 26px; padding: 0; background: rgba(255,0,0,0.1); color: var(--danger); display: flex; align-items: center; justify-content: center;" title="Uninstall">${IconHelper.getIcon("trash", { size: 14 })}</button>' : ''}
            </div>
          </div>
        `;
        
        card.onclick = () => showDetails(app, 'app');
        card.querySelector('.btn-launch').onclick = (e) => { e.stopPropagation(); performAction(app, 'app'); };
        card.querySelector('.btn-details').onclick = (e) => { e.stopPropagation(); showDetails(app, 'app'); };
        const uBtn = card.querySelector('.btn-uninstall');
        if (uBtn) uBtn.onclick = (e) => { e.stopPropagation(); performUninstall(app, 'app'); };

        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    else if (currentView === 'installed-exts') {
      const exts = discoveredExts.filter(e =>
        (e.metadata.name || e.uuid).toLowerCase().includes(query)
      );

      const grid = createGrid();
      exts.forEach(ext => {
        const isLoaded = loadedExts.has(ext.uuid);
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center;">
            ${IconHelper.getIcon(ext.metadata.icon || 'plugin', { size: 32 })}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 14px;">${ext.metadata.name || ext.uuid}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">${ext.type.slice(0, -1).toUpperCase()} • v${ext.metadata.version || '1.0'}</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="btn-primary btn-sm btn-toggle" style="flex: 1; height: 26px; padding: 0;">${isLoaded ? 'Unload' : 'Load'}</button>
              <button class="btn-secondary btn-sm btn-details" style="height: 26px; width: 26px; padding: 0; display: flex; align-items: center; justify-content: center;" title="Details">${IconHelper.getIcon('info', { size: 14 })}</button>
              ${ext.source !== 'system' ? '<button class="btn-secondary btn-sm btn-uninstall" style="height: 26px; width: 26px; padding: 0; background: rgba(255,0,0,0.1); color: var(--danger); display: flex; align-items: center; justify-content: center;" title="Uninstall">${IconHelper.getIcon("trash", { size: 14 })}</button>' : ''}
            </div>
          </div>
        `;
        
        card.onclick = () => showDetails(ext, 'extension');
        card.querySelector('.btn-toggle').onclick = (e) => { e.stopPropagation(); performAction(ext, 'extension', isLoaded); };
        card.querySelector('.btn-details').onclick = (e) => { e.stopPropagation(); showDetails(ext, 'extension'); };
        const uBtn = card.querySelector('.btn-uninstall');
        if (uBtn) uBtn.onclick = (e) => { e.stopPropagation(); performUninstall(ext, 'extension'); };

        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    else if (currentView === 'get-apps' || currentView === 'get-exts') {
      const isExt = currentView === 'get-exts';
      let onlineItems = [];
      try {
        const res = await fetch('https://raw.githubusercontent.com/Everest-Os/repo/main/registry.json');
        if (res.ok) {
          const registry = await res.json();
          onlineItems = isExt ? registry.extensions || [] : registry.apps || [];
        }
      } catch (err) {}

      const filtered = onlineItems.filter(i => (i.name || i.uuid).toLowerCase().includes(query));
      const section = document.createElement('div');
      section.innerHTML = `
        <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, var(--accent) 0%, #1a2a3a 100%); border-radius: 16px; color: #fff;">
          <h2 style="margin-bottom: 8px;">Featured ${isExt ? 'Extension' : 'Application'}</h2>
          <p style="opacity: 0.8; margin-bottom: 16px; font-size: 13px;">Discover the best ${isExt ? 'extensions' : 'apps'} curated for EverestOS.</p>
          <button class="btn-primary" id="btn-learn-more" style="background: #fff; color: var(--accent);">Learn More</button>
        </div>
        <h3 style="margin-bottom: 16px; font-size: 15px;">Trending Now</h3>
      `;
      section.querySelector('#btn-learn-more').onclick = () => {
        document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'web-browser', args: ['~/Documents/app-center-details.html'] } }));
      };

      const grid = createGrid();
      filtered.forEach(item => {
        const isInstalled = isExt 
          ? discoveredExts.some(e => e.uuid === item.uuid)
          : appLoader.getApps().some(a => a.id === item.id);
        const isLoaded = isExt && loadedExts.has(item.uuid);

        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-input); border-radius: 12px;">
            ${IconHelper.getIcon(item.icon || (isExt ? 'plugin' : 'archive'), { size: 32 })}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="font-weight: 700; font-size: 14px;">${item.name || item.uuid}</div>
              <div style="font-size: 10px; color: var(--warning); display:flex; align-items:center; gap:2px;">${IconHelper.getIcon('star', { size: 10 })} ${item.rating}</div>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${item.author} • ${isExt ? item.type.slice(0, -1).toUpperCase() : item.category}</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              ${isInstalled ? `
                <button class="btn-primary btn-sm btn-action" style="flex: 1; height: 26px; padding: 0;">${isExt ? (isLoaded ? 'Unload' : 'Load') : 'Launch'}</button>
                <button class="btn-secondary btn-sm btn-details" style="height: 26px; width: 26px; padding: 0; display: flex; align-items: center; justify-content: center;" title="Details">${IconHelper.getIcon('info', { size: 14 })}</button>
                <button class="btn-secondary btn-sm btn-uninstall" style="height: 26px; width: 26px; padding: 0; background: rgba(255,0,0,0.1); color: var(--danger); display: flex; align-items: center; justify-content: center;" title="Uninstall">${IconHelper.getIcon("trash", { size: 14 })}</button>
              ` : `
                <button class="btn-primary btn-sm btn-install" style="flex: 1; height: 26px; padding: 0;">Install</button>
                <button class="btn-secondary btn-sm btn-details" style="height: 26px; width: 26px; padding: 0; display: flex; align-items: center; justify-content: center;" title="Details">${IconHelper.getIcon('info', { size: 14 })}</button>
              `}
            </div>
          </div>
        `;
        
        card.onclick = () => showDetails(item, isExt ? 'online-extension' : 'online-app');
        const aBtn = card.querySelector('.btn-action');
        if (aBtn) aBtn.onclick = (e) => { e.stopPropagation(); performAction(item, isExt ? 'extension' : 'app', isLoaded); };
        const iBtn = card.querySelector('.btn-install');
        if (iBtn) iBtn.onclick = (e) => { e.stopPropagation(); performInstall(item, !isExt, iBtn); };
        card.querySelector('.btn-details').onclick = (e) => { e.stopPropagation(); showDetails(item, isExt ? 'online-extension' : 'online-app'); };
        const uBtn = card.querySelector('.btn-uninstall');
        if (uBtn) uBtn.onclick = (e) => { e.stopPropagation(); performUninstall(item, isExt ? 'extension' : 'app'); };

        grid.appendChild(card);
      });
      body.appendChild(section);
      body.appendChild(grid);
    }
  };

  const showDetails = async (item, type) => {
    const isOnline = type.startsWith('online-');
    const isApp = type === 'app' || type === 'online-app';
    const name = isApp ? item.name : (item.metadata?.name || item.uuid);
    const desc = isApp ? item.description : (item.metadata?.description || 'No description available.');
    const icon = isApp ? item.icon : (item.metadata?.icon || 'plugin');

    const discoveredExts = await extensionLoader.discover();
    const loadedExts = extensionLoader.getLoaded();
    const isInstalled = isApp 
      ? appLoader.getApps().some(a => a.id === item.id)
      : discoveredExts.some(e => e.uuid === item.uuid);
    const isLoaded = !isApp && loadedExts.has(item.uuid);

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute; inset: 0; background: var(--bg-surface); z-index: 10;
      padding: 40px; display: flex; flex-direction: column;
      animation: details-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    overlay.innerHTML = `
      <div style="margin-bottom: 32px;">
        <button id="btn-back" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('back', { size: 12 })} Back to List</button>
      </div>
      <div style="display: flex; gap: 32px; align-items: start;">
        <div style="width: 120px; height: 120px; background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 64px;">
          ${IconHelper.getIcon(icon, { size: 64 })}
        </div>
        <div style="flex: 1;">
          <h1 style="margin-bottom: 8px; font-size: 28px;">${name}</h1>
          <p style="color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">${desc}</p>
          <div style="display: flex; gap: 12px;">
            ${isInstalled ? `
              <button class="btn-primary" id="btn-action-main">${isApp ? 'Launch Application' : (isLoaded ? 'Unload Extension' : 'Load Extension')}</button>
              ${item.source !== 'builtin' && item.source !== 'system' ? `<button class="btn-danger" id="btn-uninstall" style="background:var(--danger); border-color:var(--danger); color:white; padding: 8px 16px; border-radius:var(--radius-sm); cursor:pointer; font-size:13px; font-weight:600;">Uninstall</button>` : ''}
            ` : `
              <button class="btn-primary" id="btn-install-online">Install</button>
            `}
          </div>
        </div>
      </div>
      <div style="margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px;">
        <h3 style="margin-bottom: 16px;">Details</h3>
        <div style="display: grid; grid-template-columns: 150px 1fr; gap: 12px; font-size: 13px;">
          <div style="color: var(--text-tertiary);">Identifier</div>
          <div style="font-family: var(--font-mono);">${isApp ? item.id : item.uuid}</div>
          <div style="color: var(--text-tertiary);">Version</div>
          <div>${isApp ? (item.version || '1.0.0') : (item.metadata?.version || item.version || '1.0.0')}</div>
          <div style="color: var(--text-tertiary);">Category</div>
          <div>${isApp ? (item.category || 'Utility') : (item.type || item.metadata?.type)}</div>
          <div style="color: var(--text-tertiary);">Source</div>
          <div>${isApp ? (item.source === 'builtin' ? 'System' : (item.source || 'Online')) : (item.source || 'VFS (Plugins)')}</div>
        </div>
      </div>
      <style>
        @keyframes details-in { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      </style>
    `;

    overlay.querySelector('#btn-back').onclick = () => overlay.remove();
    const actionBtn = overlay.querySelector('#btn-action-main');
    if (actionBtn) {
      actionBtn.onclick = async () => {
        await performAction(item, isApp ? 'app' : 'extension', isLoaded);
        overlay.remove();
      };
    }

    const uBtn = overlay.querySelector('#btn-uninstall');
    if (uBtn) {
      uBtn.onclick = async () => {
        await performUninstall(item, isApp ? 'app' : 'extension');
        overlay.remove();
      };
    }

    const iBtn = overlay.querySelector('#btn-install-online');
    if (iBtn) {
      iBtn.onclick = async () => {
        await performInstall(item, isApp, iBtn);
        setTimeout(() => overlay.remove(), 1000);
      };
    }

    content.appendChild(overlay);
  };

  sidebar.onclick = (e) => {
    const item = e.target.closest('.nav-item');
    if (item) setView(item.dataset.view);
  };

  searchInput.oninput = () => render();
  render();
}
