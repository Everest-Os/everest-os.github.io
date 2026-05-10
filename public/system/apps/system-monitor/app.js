const { IconHelper } = window.osAPI;

export async function launch(ctx) {
  const { windowManager, vfs, loader } = ctx;
  const consoleLog = ctx.console; // This is the Looking Glass console implementation

  const content = document.createElement('div');
  content.style.height = '100%';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.background = 'var(--bg-surface)';
  content.style.color = 'var(--text-primary)';
  content.style.fontFamily = 'var(--font-main)';

  content.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated);">
      <div style="display: flex; gap: 16px;">
        <button class="nav-tab active" data-tab="overview">Overview</button>
        <button class="nav-tab" data-tab="processes">Processes</button>
        <button class="nav-tab" data-tab="logs">System Logs</button>
      </div>
      <button id="sm-refresh" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('refresh', { size: 14 })} Refresh</button>
    </div>

    <style>
      .nav-tab {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        padding: 4px 8px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }
      .nav-tab:hover { color: var(--text-primary); }
      .nav-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
      .tab-content { display: none; padding: 20px; flex: 1; overflow-y: auto; }
      .tab-content.active { display: block; }
      
      .sm-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
        box-shadow: var(--shadow-sm);
      }
      
      .sm-bar-bg { width: 100%; height: 8px; background: var(--bg-input); border-radius: 4px; overflow: hidden; margin-top: 8px; }
      .sm-bar-fill { height: 100%; background: var(--accent); transition: width 0.3s; }
      .sm-bar-fill.warning { background: var(--warning); }
      .sm-bar-fill.danger { background: var(--danger); }
      
      .log-entry { font-family: var(--font-mono); font-size: 12px; padding: 4px 8px; border-bottom: 1px solid var(--border); }
      .log-entry.error { color: var(--danger); background: rgba(var(--danger-rgb), 0.1); }
      .log-entry.warn { color: var(--warning); background: rgba(var(--warning-rgb), 0.1); }
      
      .process-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 8px; border-bottom: 1px solid var(--border); align-items: center; font-size: 13px; }
      .process-header { font-weight: bold; color: var(--text-secondary); border-bottom: 2px solid var(--border); }
    </style>

    <div id="tab-overview" class="tab-content active">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;">CPU Usage (Simulated)</span>
            <span id="cpu-val">0%</span>
          </div>
          <div class="sm-bar-bg"><div id="cpu-bar" class="sm-bar-fill" style="width: 0%;"></div></div>
        </div>
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;">Memory Usage (Simulated)</span>
            <span id="mem-val">0 MB</span>
          </div>
          <div class="sm-bar-bg"><div id="mem-bar" class="sm-bar-fill" style="width: 0%;"></div></div>
        </div>
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;">VFS Storage Objects</span>
            <span id="vfs-val">0 Nodes</span>
          </div>
          <div class="sm-bar-bg"><div id="vfs-bar" class="sm-bar-fill" style="width: 0%;"></div></div>
        </div>
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;">System Health</span>
            <span id="health-val" style="color: var(--success);">Healthy</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
            Logs: <span id="log-count">0</span> | Errors: <span id="error-count" style="color: var(--danger);">0</span>
          </div>
        </div>
      </div>
    </div>

    <div id="tab-processes" class="tab-content">
      <div class="sm-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 100%;">
        <div class="process-row process-header">
          <div>Task Name</div>
          <div>Type</div>
          <div>Status</div>
          <div style="text-align: right;">Action</div>
        </div>
        <div id="process-list" style="overflow-y: auto; flex: 1;">
          <!-- Processes go here -->
        </div>
      </div>
    </div>

    <div id="tab-logs" class="tab-content" style="padding: 0;">
      <div style="padding: 12px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); display: flex; gap: 8px;">
        <button class="btn-secondary btn-sm" id="btn-clear-logs">Clear Logs</button>
      </div>
      <div id="log-container" style="padding: 8px; overflow-y: auto; height: calc(100% - 50px); background: #000; color: #fff;">
        <!-- Logs go here -->
      </div>
    </div>
  `;

  windowManager.createWindow({
    id: 'system-monitor',
    title: 'System Monitor',
    icon: 'system-monitor',
    width: 650,
    height: 500,
    content: content
  });

  // Tab switching
  content.querySelectorAll('.nav-tab').forEach(tab => {
    tab.onclick = () => {
      content.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      content.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      content.querySelector('#tab-' + tab.dataset.tab).classList.add('active');
    };
  });

  const render = async () => {
    // 1. Overview Tab Data (Simulated CPU/RAM based on active items)
    const activeWindows = windowManager.windows.size;
    const activePlugins = loader.getLoaded().size;
    
    // CPU: Base 2% + 5% per window + 3% per plugin
    let cpu = Math.min(100, 2 + (activeWindows * 5) + (activePlugins * 3) + Math.floor(Math.random() * 5));
    // RAM: Base 250MB + 50MB per window + 15MB per plugin
    let ram = 250 + (activeWindows * 50) + (activePlugins * 15);
    let ramPercent = Math.min(100, (ram / 4096) * 100);

    const cpuBar = content.querySelector('#cpu-bar');
    cpuBar.style.width = cpu + '%';
    cpuBar.className = 'sm-bar-fill' + (cpu > 80 ? ' danger' : cpu > 50 ? ' warning' : '');
    content.querySelector('#cpu-val').textContent = cpu + '%';

    const memBar = content.querySelector('#mem-bar');
    memBar.style.width = ramPercent + '%';
    memBar.className = 'sm-bar-fill' + (ramPercent > 80 ? ' danger' : ramPercent > 50 ? ' warning' : '');
    content.querySelector('#mem-val').textContent = ram + ' MB';

    // VFS Stats
    let totalNodes = 0;
    const scanDir = async (path) => {
      try {
        const items = await vfs.readdir(path);
        totalNodes += items.length;
        for (const item of items) {
          if (item.type === 'dir') await scanDir(item.path);
        }
      } catch (e) { }
    };
    await scanDir('/');
    let vfsPercent = Math.min(100, (totalNodes / 1000) * 100); // arbitrary max
    content.querySelector('#vfs-bar').style.width = vfsPercent + '%';
    content.querySelector('#vfs-val').textContent = totalNodes + ' Nodes';

    // Logs & Health
    let logs = [];
    if (consoleLog && consoleLog._logs) {
      logs = consoleLog._logs;
    }
    const errors = logs.filter(l => l.type === 'error');
    content.querySelector('#log-count').textContent = logs.length;
    content.querySelector('#error-count').textContent = errors.length;
    
    const healthEl = content.querySelector('#health-val');
    if (errors.length > 5) {
      healthEl.textContent = 'Critical Errors';
      healthEl.style.color = 'var(--danger)';
    } else if (errors.length > 0) {
      healthEl.textContent = 'Warning';
      healthEl.style.color = 'var(--warning)';
    } else {
      healthEl.textContent = 'Healthy';
      healthEl.style.color = 'var(--success)';
    }

    // 2. Processes Tab
    const processList = content.querySelector('#process-list');
    processList.innerHTML = '';
    
    // Add EverestOS Core
    processList.innerHTML += `
      <div class="process-row">
        <div><strong>EverestOS Core</strong></div>
        <div style="color:var(--text-secondary)">System</div>
        <div style="color:var(--success)">Running</div>
        <div style="text-align:right; opacity:0.5;">Protected</div>
      </div>
    `;

    // Add Windows
    windowManager.windows.forEach(win => {
      const row = document.createElement('div');
      row.className = 'process-row';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          ${IconHelper.getIcon(win.icon || 'window', { size: 14 })}
          <span>${win.title || win.id}</span>
        </div>
        <div style="color:var(--text-secondary)">Application</div>
        <div style="color:var(--success)">Running</div>
        <div style="text-align:right;">
          <button class="btn-danger btn-sm" style="padding: 2px 8px; font-size:11px;">Kill</button>
        </div>
      `;
      row.querySelector('.btn-danger').onclick = () => {
        windowManager.closeWindow(win.id);
        render();
      };
      processList.appendChild(row);
    });

    // Add Plugins
    loader.getLoaded().forEach((ext, uuid) => {
      const row = document.createElement('div');
      row.className = 'process-row';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          ${IconHelper.getIcon('plugin', { size: 14 })}
          <span>${uuid}</span>
        </div>
        <div style="color:var(--text-secondary)">Extension (${ext.type})</div>
        <div style="color:var(--success)">Loaded</div>
        <div style="text-align:right;">
          <button class="btn-danger btn-sm" style="padding: 2px 8px; font-size:11px;">Unload</button>
        </div>
      `;
      row.querySelector('.btn-danger').onclick = async () => {
        await loader.unload(uuid);
        render();
      };
      processList.appendChild(row);
    });

    // 3. Logs Tab
    const logContainer = content.querySelector('#log-container');
    if (logs.length === 0) {
      logContainer.innerHTML = '<div style="opacity:0.5; padding:20px; text-align:center;">No system logs available.</div>';
    } else {
      logContainer.innerHTML = logs.map(l => `
        <div class="log-entry ${l.type}">
          <span style="opacity:0.5">[${new Date(l.timestamp).toLocaleTimeString()}]</span> 
          ${l.type.toUpperCase()}: ${l.message}
        </div>
      `).join('');
      // Auto-scroll
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  };

  content.querySelector('#sm-refresh').onclick = render;
  content.querySelector('#btn-clear-logs').onclick = () => {
    if (consoleLog && consoleLog._logs) {
      consoleLog._logs = [];
      render();
    }
  };

  render();
  
  // Auto-refresh interval
  const interval = setInterval(() => {
    if (document.body.contains(content)) render();
    else clearInterval(interval);
  }, 2000);
}
