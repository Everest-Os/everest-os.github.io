/**
 * Plugin Settings App — Unified Applets & Desklets manager with tabbed UI
 */

const { showSystemDialog } = window.osAPI;
const { IconHelper } = window.osAPI;

export async function launch(ctx, options = {}) {
  const { windowManager, vfs, loader, filePicker } = ctx;
  const initialTab = options.type || 'applets';

  const content = document.createElement('div');
  content.style.height = '100%';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';

  content.innerHTML = `
    <div style="display:flex; border-bottom:1px solid var(--border); background:var(--bg-surface-hover);">
      <button class="plugin-tab" data-tab="applets" style="
        flex:1; padding:12px 16px; border:none; background:transparent; color:var(--text-primary);
        cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s;
        border-bottom:2px solid transparent; margin-bottom:-1px;
        display:flex; align-items:center; justify-content:center; gap:8px;
      ">${IconHelper.getIcon('plugin', { size: 16 })} Applets</button>
      <button class="plugin-tab" data-tab="desklets" style="
        flex:1; padding:12px 16px; border:none; background:transparent; color:var(--text-secondary);
        cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s;
        border-bottom:2px solid transparent; margin-bottom:-1px;
        display:flex; align-items:center; justify-content:center; gap:8px;
      ">${IconHelper.getIcon('monitor', { size: 16 })} Desklets</button>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border);">
      <button id="em-browse" class="btn-primary" style="padding:6px 14px; font-size:12px; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('folder', { size: 14 })} Load from folder...</button>
      <button id="em-refresh" class="btn-secondary" style="padding:6px 14px; font-size:12px; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('refresh', { size: 14 })} Refresh</button>
    </div>
    <div id="em-list" style="flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:10px;">
      <div class="loading-spinner">Loading...</div>
    </div>
  `;

  windowManager.createWindow({
    id: 'plugin-settings',
    title: 'Plugin Settings',
    icon: 'plugin',
    width: 680,
    height: 540,
    content: content
  });

  const listEl = content.querySelector('#em-list');
  const refreshBtn = content.querySelector('#em-refresh');
  const browseBtn = content.querySelector('#em-browse');
  const tabs = content.querySelectorAll('.plugin-tab');

  let activeTab = initialTab;

  // Tab switching
  const setActiveTab = (tab) => {
    activeTab = tab;
    tabs.forEach(t => {
      const isActive = t.dataset.tab === tab;
      t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
      t.style.borderBottomColor = isActive ? 'var(--accent)' : 'transparent';
      t.style.background = isActive ? 'var(--bg-active)' : 'transparent';
    });
    render();
  };

  tabs.forEach(t => {
    t.addEventListener('click', () => setActiveTab(t.dataset.tab));
  });

  // Scan plugins for a given type (System + User)
  const scanPlugins = async (type) => {
    const plugins = [];

    const scanPath = async (basePath, source) => {
      try {
        const items = await vfs.readdir(basePath);
        for (const item of items) {
          if (item.type === 'dir') {
            if (item.name === 'statusbar' || item.name === 'system') {
              try {
                const subItems = await vfs.readdir(item.path);
                for (const subItem of subItems) {
                  if (subItem.type === 'dir') {
                    try {
                      const metaStr = await vfs.readFile(`${subItem.path}/metadata.json`);
                      const meta = JSON.parse(metaStr);
                      let iconPath = null;
                      try {
                        const files = await vfs.readdir(subItem.path);
                        if (files.find(f => f.name === 'icon.svg')) iconPath = `${subItem.path}/icon.svg`;
                        else if (files.find(f => f.name === 'icon.png')) iconPath = `${subItem.path}/icon.png`;
                      } catch (e) {}

                      plugins.push({
                        ...meta,
                        uuid: meta.uuid || subItem.name,
                        vfsPath: subItem.path,
                        pluginType: type,
                        source: source,
                        iconPath
                      });
                    } catch { /* skip */ }
                  }
                }
              } catch { /* skip */ }
              continue;
            }

            try {
              const metaStr = await vfs.readFile(`${item.path}/metadata.json`);
              const meta = JSON.parse(metaStr);
              let iconPath = null;
              try {
                const files = await vfs.readdir(item.path);
                if (files.find(f => f.name === 'icon.svg')) iconPath = `${item.path}/icon.svg`;
                else if (files.find(f => f.name === 'icon.png')) iconPath = `${item.path}/icon.png`;
              } catch (e) {}

              plugins.push({
                ...meta,
                uuid: meta.uuid || item.name,
                vfsPath: item.path,
                pluginType: type,
                source: source,
                iconPath
              });
            } catch { /* skip */ }
          }
        }
      } catch (e) { /* path doesn't exist, skip */ }
    };

    // 1. System Plugins (VFS Protected)
    await scanPath(`/system/plugins/${type}`, 'system');

    // 2. Legacy System Plugins (Migration support)
    await scanPath(`~/Plugins/${type}`, 'system');

    // 3. User Plugins (VFS Deletable)
    await scanPath(`~/.local/share/plugins/${type}`, 'user');

    return plugins;
  };

  const render = async () => {
    listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-tertiary);">Loading...</div>';

    // Remove old event delegation listeners by replacing innerHTML
    const plugins = await scanPlugins(activeTab);
    const typeIconKey = activeTab === 'applets' ? 'plugin' : 'monitor';
    const typeLabel = activeTab === 'applets' ? 'Applets' : 'Desklets';

    if (plugins.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--text-tertiary);">
          <div style="font-size:48px; margin-bottom:12px;">${IconHelper.getIcon(typeIconKey, { size: 64 })}</div>
          <div style="font-size:14px; margin-bottom:8px;">No ${typeLabel.toLowerCase()} found</div>
          <div style="font-size:12px;">Place plugins in <code style="background:var(--bg-input); padding:2px 6px; border-radius:3px;">~/.local/share/plugins/${activeTab}/</code></div>
          <div style="font-size:12px; margin-top:6px;">or use <strong>Load from folder</strong> to load from any location.</div>
        </div>`;
      return;
    }

    listEl.innerHTML = '';
    for (const ext of plugins) {
      const loaded = loader.getLoaded().has(ext.uuid);

      const card = document.createElement('div');
      card.style.cssText = `
        display:flex; background:var(--bg-card); border:1px solid var(--border);
        border-radius:10px; padding:14px; align-items:center; gap:14px;
        transition:border-color 0.15s, box-shadow 0.15s;
      `;
      card.onmouseover = () => { card.style.borderColor = 'var(--border-accent)'; card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; };
      card.onmouseout = () => { card.style.borderColor = 'var(--border)'; card.style.boxShadow = 'none'; };

      const statusDot = loaded
        ? '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--success); margin-right:6px;" title="Loaded"></span>'
        : '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--text-tertiary); margin-right:6px;" title="Not loaded"></span>';

      // Path-based protection: only delete if in .local/share
      const canDelete = ext.vfsPath && (ext.vfsPath.includes('/.local/share/') || ext.vfsPath.startsWith('~/.local/share/'));

      const sourceTag = canDelete
        ? '<span style="font-size:10px; color:var(--mint-green); background:var(--mint-green-dim); padding:1px 6px; border-radius:4px; margin-left:auto;">User</span>'
        : '<span style="font-size:10px; color:var(--text-tertiary); background:var(--bg-input); padding:1px 6px; border-radius:4px; margin-left:auto;">System</span>';

      const fallbackIconKey = ext.metadata?.icon ? ext.metadata.icon + ',🧩' : typeIconKey;
      const iconHtml = ext.iconPath ? IconHelper.getIcon(ext.iconPath, { size: 32, symbolic: false }) : IconHelper.getIcon(fallbackIconKey, { size: 32 });

      card.innerHTML = `
        <div style="font-size:32px; width:40px; text-align:center;">${iconHtml}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; font-size:14px; margin-bottom:3px; display:flex; align-items:center; gap:4px;">
            ${statusDot}
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${ext.name || ext.uuid}</span>
            <span style="font-size:10px; color:var(--text-tertiary); font-weight:normal; background:var(--bg-input); padding:1px 6px; border-radius:4px; flex-shrink:0;">v${ext.version || '1.0'}</span>
            ${sourceTag}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin-bottom:2px;">${ext.description || 'No description available.'}</div>
          <div style="font-size:10px; color:var(--text-tertiary); font-family:monospace; overflow:hidden; text-overflow:ellipsis;">${ext.uuid}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px; flex-shrink:0;">
          ${loaded
          ? `<button class="btn-danger btn-sm" data-action="unload" data-uuid="${ext.uuid}" data-type="${activeTab}">Unload</button>
               <button class="btn-secondary btn-sm" data-action="reload" data-uuid="${ext.uuid}" data-type="${activeTab}" style="display:flex; align-items:center; justify-content:center; gap:6px;">${IconHelper.getIcon('refresh', { size: 12 })} Reload</button>`
          : `<button class="btn-primary btn-sm" data-action="load" data-uuid="${ext.uuid}" data-vfs="${ext.vfsPath}" data-type="${activeTab}">Load</button>`
        }
          <div style="display:flex; gap:5px;">
            <button class="btn-secondary btn-sm" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;" data-action="settings" data-uuid="${ext.uuid}" ${!loaded ? 'disabled style="opacity:0.4; cursor:default;"' : ''}>${IconHelper.getIcon('settings', { size: 12 })} Settings</button>
            ${canDelete
          ? `<button class="btn-danger btn-sm" style="padding:4px 8px; display:flex; align-items:center; justify-content:center;" data-action="delete" data-uuid="${ext.uuid}" data-vfs="${ext.vfsPath}" title="Delete Plugin">${IconHelper.getIcon('trash', { size: 12 })}</button>`
          : ''
        }
          </div>
        </div>
      `;

      listEl.appendChild(card);
    }

    // Event delegation for this render cycle
    const handler = async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const uuid = btn.dataset.uuid;
      const type = btn.dataset.type;

      if (action === 'load') {
        try {
          btn.disabled = true;
          btn.textContent = 'Loading...';
          if (loader.unmarkAsRemoved) loader.unmarkAsRemoved(uuid);
          await loader.loadFromVfs(uuid, btn.dataset.vfs, type);
          render();
        } catch (err) {
          alert('Failed to load: ' + err.message);
          render();
        }
      } else if (action === 'unload') {
        if (loader.markAsRemoved) loader.markAsRemoved(uuid);
        loader.unload(uuid);
        render();
      } else if (action === 'reload') {
        loader.reload(uuid);
        setTimeout(render, 500);
      } else if (action === 'settings') {
        window.dispatchEvent(new CustomEvent('open-extension-settings', { detail: { uuid } }));
      } else if (action === 'delete') {
        const vfsPath = btn.dataset.vfs;
        showSystemDialog({
          title: 'Delete Plugin',
          message: `Are you sure you want to permanently delete the plugin "${uuid}"?\n\nThis will remove all its files from ${vfsPath}.`,
          type: 'confirm',
          confirmText: 'Delete',
          onConfirm: async () => {
            try {
              loader.unload(uuid);
              await vfs.rm(vfsPath);
              render();
            } catch (err) {
              alert('Failed to delete: ' + err.message);
            }
          }
        });
      }
    };

    listEl.addEventListener('click', handler);
  };

  // Browse folder button
  browseBtn.addEventListener('click', async () => {
    if (!filePicker) {
      alert('File picker not available');
      return;
    }
    const folder = await filePicker.pickFolder({
      title: `Select ${activeTab === 'applets' ? 'Applet' : 'Desklet'} Folder`,
      initialPath: '/system/plugins'
    });
    if (!folder) return;

    try {
      const metaStr = await vfs.readFile(`${folder}/metadata.json`);
      const meta = JSON.parse(metaStr);
      const uuid = meta.uuid || folder.split('/').pop();
      await loader.loadFromVfs(uuid, folder, activeTab);
      render();
    } catch (err) {
      alert(`Could not load plugin from "${folder}".\n\nMake sure it contains a valid metadata.json.\n\nError: ${err.message}`);
    }
  });

  refreshBtn.addEventListener('click', render);

  // Activate initial tab
  setActiveTab(initialTab);
}
