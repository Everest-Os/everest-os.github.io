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

  const render = async () => {
    body.innerHTML = '';
    const query = searchInput.value.toLowerCase();

    if (currentView === 'installed-apps') {
      const apps = appLoader.getApps().filter(a =>
        a.name.toLowerCase().includes(query) || a.id.toLowerCase().includes(query)
      );

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      grid.style.gap = '16px';

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
            <div style="font-size: 10px; margin-top: 4px; color: var(--accent); opacity: 0.8; font-family: var(--font-mono);">
              ${app.source === 'builtin' ? 'System Application' : 'User Application'}
            </div>
          </div>
        `;
        card.onclick = () => showDetails(app, 'app');
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    else if (currentView === 'installed-exts') {
      const discovered = await extensionLoader.discover();
      const exts = discovered.filter(e =>
        (e.metadata.name || e.uuid).toLowerCase().includes(query)
      );

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      grid.style.gap = '16px';

      exts.forEach(ext => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center;">
            ${IconHelper.getIcon(ext.metadata.icon || 'plugin', { size: 32 })}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 14px;">${ext.metadata.name || ext.uuid}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">
              ${ext.type.slice(0, -1).toUpperCase()} • ${ext.metadata.version || '1.0.0'}
            </div>
            <div style="font-size: 10px; margin-top: 4px; color: var(--text-tertiary); font-family: var(--font-mono);">
              ${ext.uuid}
            </div>
          </div>
        `;
        card.onclick = () => showDetails(ext, 'extension');
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }
    else if (currentView === 'get-apps' || currentView === 'get-exts') {
      const isExt = currentView === 'get-exts';
      
      let onlineItems = [];
      try {
        const repoUrl = 'https://raw.githubusercontent.com/Everest-Os/repo/main/registry.json';
        const res = await fetch(repoUrl);
        if (res.ok) {
          const registry = await res.json();
          onlineItems = isExt ? registry.extensions || [] : registry.apps || [];
        } else {
          throw new Error('Registry not found');
        }
      } catch (err) {
        console.warn('Failed to fetch online repo, falling back to mocks:', err);
        onlineItems = isExt ? [
          { uuid: 'weather@prozilla', name: 'Weather', description: 'Real-time weather forecast on your panel.', type: 'applets', icon: 'weather', author: 'Prozilla', rating: 4.8 },
          { uuid: 'system-monitor@prozilla', name: 'System Monitor', description: 'Monitor CPU, RAM and Network usage.', type: 'applets', icon: 'system-monitor', author: 'Prozilla', rating: 4.9 },
          { uuid: 'workspace-switcher@prozilla', name: 'Workspace Switcher', description: 'Visual switcher for virtual desktops.', type: 'applets', icon: 'window-list', author: 'Prozilla', rating: 4.5 },
          { uuid: 'notes@prozilla', name: 'Desktop Notes', description: 'Sticky notes for your desktop.', type: 'desklets', icon: 'text', author: 'Prozilla', rating: 4.7 }
        ] : [
          { id: 'code-editor', name: 'ProCode', description: 'Professional code editor with syntax highlighting.', category: 'Development', icon: 'computer', author: 'Prozilla', rating: 4.9 },
          { id: 'spotify', name: 'Spotify', description: 'Music for everyone.', category: 'Multimedia', icon: 'music', author: 'Spotify AB', rating: 4.8 },
          { id: 'discord', name: 'Discord', description: 'All-in-one voice and text chat.', category: 'Communication', icon: 'chat', author: 'Discord Inc.', rating: 4.7 },
          { id: 'slack', name: 'Slack', description: 'Team communication and collaboration.', category: 'Communication', icon: 'tag', author: 'Slack Technologies', rating: 4.6 }
        ];
      }

      const filtered = onlineItems.filter(i =>
        (i.name || i.uuid).toLowerCase().includes(query)
      );

      const section = document.createElement('div');
      section.innerHTML = `
        <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, var(--accent) 0%, #1a2a3a 100%); border-radius: 16px; color: #fff;">
          <h2 style="margin-bottom: 8px;">Featured ${isExt ? 'Extension' : 'Application'}</h2>
          <p style="opacity: 0.8; margin-bottom: 16px; font-size: 13px;">Discover the best ${isExt ? 'extensions' : 'apps'} curated for ProzillaOS.</p>
          <button class="btn-primary" id="btn-learn-more" style="background: #fff; color: var(--accent);">Learn More</button>
        </div>
        <h3 style="margin-bottom: 16px; font-size: 15px;">Trending Now</h3>
      `;

      section.querySelector('#btn-learn-more').onclick = () => {
        document.dispatchEvent(new CustomEvent('launch-app', { 
          detail: { 
            id: 'web-browser', 
            args: ['/home/user/Documents/app-center-details.html'] 
          } 
        }));
      };

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      grid.style.gap = '16px';

      filtered.forEach(item => {
        const isInstalled = isExt 
          ? extensionLoader.getLoaded().has(item.uuid) // Or check discover() for more thorough check
          : appLoader.getApps().some(a => a.id === item.id);

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
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
              ${item.author} • ${isExt ? item.type.slice(0, -1).toUpperCase() : item.category}
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="${isInstalled ? 'btn-secondary' : 'btn-primary'} btn-sm" style="flex: 1; height: 26px; padding: 0;">
                ${isInstalled ? 'Installed' : 'Install'}
              </button>
              <button class="btn-secondary btn-sm" style="height: 26px; width: 26px; padding: 0; display: flex; align-items: center; justify-content: center;">...</button>
            </div>
          </div>
        `;

        const installBtn = card.querySelector('button');
        if (installBtn) {
          installBtn.onclick = (e) => {
            e.stopPropagation();
            showDetails(item, isExt ? 'online-extension' : 'online-app');
          };
        }

        card.onclick = () => showDetails(item, isExt ? 'online-extension' : 'online-app');
        grid.appendChild(card);
      });
      section.appendChild(grid);
      body.appendChild(section);
    }
    else {
      body.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; text-align: center;">
          <div style="font-size: 80px; margin-bottom: 24px;">${IconHelper.getIcon('settings-cog', { size: 80 })}</div>
          <h2 style="margin-bottom: 8px;">View Not Found</h2>
          <p style="max-width: 300px; color: var(--text-secondary);">This section is currently unavailable.</p>
        </div>
      `;
    }
  };

  const showDetails = (item, type) => {
    const isOnline = type.startsWith('online-');
    const isApp = type === 'app' || type === 'online-app';
    const name = isApp ? item.name : (item.metadata?.name || item.uuid);
    const desc = isApp ? item.description : (item.metadata?.description || 'No description available.');
    const icon = isApp ? item.icon : (item.metadata?.icon || 'plugin');

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: var(--bg-surface);
      z-index: 10;
      padding: 40px;
      display: flex;
      flex-direction: column;
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
            ${isOnline ? `
              <button class="btn-primary" id="btn-install-online" ${ (isApp ? appLoader.getApps().some(a => a.id === item.id) : extensionLoader.getLoaded().has(item.uuid)) ? 'disabled' : ''}>
                ${ (isApp ? appLoader.getApps().some(a => a.id === item.id) : extensionLoader.getLoaded().has(item.uuid)) ? 'Installed' : 'Install' }
              </button>
            ` : (isApp ? `
              <button class="btn-primary" id="btn-launch">Launch Application</button>
              ${item.source !== 'builtin' ? `<button class="btn-danger" id="btn-uninstall" style="background:var(--danger); border-color:var(--danger); color:white; padding: 8px 16px; border-radius:var(--radius-sm); cursor:pointer; font-size:13px; font-weight:600;">Uninstall</button>` : ''}
            ` : `
              <button class="btn-primary" id="btn-toggle-ext" style="margin-right:8px;">${item.isLoaded ? 'Unload' : 'Load'}</button>
              ${item.source !== 'builtin' ? `<button class="btn-danger" id="btn-uninstall" style="background:var(--danger); border-color:var(--danger); color:white; padding: 8px 16px; border-radius:var(--radius-sm); cursor:pointer; font-size:13px; font-weight:600;">Uninstall</button>` : ''}
            `)}
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
        @keyframes details-in {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    overlay.querySelector('#btn-back').onclick = () => overlay.remove();

    if (isOnline) {
      overlay.querySelector('#btn-install-online').onclick = async () => {
        const btn = overlay.querySelector('#btn-install-online');
        btn.disabled = true;
        btn.textContent = 'Installing...';
        
        try {
          // If the item doesn't have a downloadUrl, use the fallback structure
          const downloadUrl = item.downloadUrl || 
            `https://raw.githubusercontent.com/Everest-Os/repo/main/${item.type === 'applets' || item.type === 'desklets' || item.type === 'extensions' ? `plugins/${item.type}` : 'apps'}/${item.id || item.uuid}/bundle.zip`;
            
          console.log('[App Center] Downloading from:', downloadUrl);
          const res = await fetch(downloadUrl);
          if (!res.ok) throw new Error('Failed to download package');
          
          const blob = await res.blob();
          const targetId = isApp ? (item.id || item.name) : item.uuid;
          const targetDir = isApp 
            ? `~/.local/share/applications/${targetId}` 
            : `~/.local/share/plugins/${item.type}/${targetId}`;
            
          await vfs.mkdir(targetDir);
          await ZipHelper.extractToVfs(blob, targetDir, vfs);
          
          // Icon Extraction (if bundled in the zip root as icon.svg or icon.png)
          // Look for it manually using JSZip directly
          try {
            const JSZip = await ZipHelper.getJSZip();
            const zip = await JSZip.loadAsync(blob);
            let iconExt = zip.files['icon.svg'] ? 'svg' : zip.files['icon.png'] ? 'png' : null;
            if (iconExt) {
               const iconBlob = await zip.file(`icon.${iconExt}`).async('blob');
               await vfs.mkdir('~/.local/share/icons');
               await vfs.writeFile(`~/.local/share/icons/${item.icon || targetId}.${iconExt}`, iconBlob);
            }
          } catch(e) {
            console.warn('Could not extract dedicated icon from bundle', e);
          }
          
          btn.textContent = 'Installed';
          btn.classList.replace('btn-primary', 'btn-secondary');
          
          if (isApp) {
            await appLoader.init();
          } else {
            await extensionLoader.loadFromVfs(targetId, targetDir, item.type);
          }
          
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Install';
          showSystemDialog({
            title: 'Installation Failed',
            message: err.message,
            type: 'alert'
          });
        }
      };
    } else if (isApp) {
      overlay.querySelector('#btn-launch').onclick = () => {
        document.dispatchEvent(new CustomEvent('launch-app', { detail: { id: item.id } }));
        overlay.remove();
      };
      const uninstallBtn = overlay.querySelector('#btn-uninstall');
      if (uninstallBtn) {
        uninstallBtn.onclick = () => {
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
                  await extensionLoader.unload(item.uuid);
                  await vfs.rm(item.path);
                }
                overlay.remove();
                render();
              } catch (e) {
                showSystemDialog({
                  title: 'Error',
                  message: 'Failed to uninstall: ' + e.message,
                  type: 'alert'
                });
              }
            }
          });
        };
      }
    } else {
      const toggleBtn = overlay.querySelector('#btn-toggle-ext');
      toggleBtn.onclick = async () => {
        toggleBtn.disabled = true;
        try {
          if (item.isLoaded) {
            await extensionLoader.unload(item.uuid);
          } else {
            await extensionLoader.loadFromVfs(item.uuid, item.path, item.type);
          }
          overlay.remove();
          render();
        } catch (e) {
          alert(e.message);
          toggleBtn.disabled = false;
        }
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
