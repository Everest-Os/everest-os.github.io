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

      .log-entry { display: flex; align-items: flex-start; gap: 12px; font-family: var(--font-mono); font-size: 12px; padding: 4px 8px; border-bottom: 1px solid var(--border); }
      .log-entry.error { color: var(--danger); background: rgba(var(--danger-rgb), 0.1); }
      .log-entry.warn { color: var(--warning); background: rgba(var(--warning-rgb), 0.1); }
      .log-meta { display: flex; gap: 8px; flex-shrink: 0; min-width: 150px; opacity: 0.6; }
      .log-content { white-space: pre-wrap; flex: 1; }

      .process-row { display: grid; grid-template-columns: 2.2fr 1fr 1.5fr 1fr; padding: 8px; border-bottom: 1px solid var(--border); align-items: center; font-size: 13px; }
      .process-header { font-weight: bold; color: var(--text-secondary); border-bottom: 2px solid var(--border); }
    </style>

    <div id="tab-overview" class="tab-content active">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;">CPU Load</span>
            <span id="cpu-val">0%</span>
          </div>
          <div class="sm-bar-bg"><div id="cpu-bar" class="sm-bar-fill" style="width: 0%;"></div></div>
        </div>
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;">System Memory</span>
            <span id="mem-val">0 MB</span>
          </div>
          <div class="sm-bar-bg"><div id="mem-bar" class="sm-bar-fill" style="width: 0%;"></div></div>
        </div>
        <div class="sm-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600;" id="storage-title">Disk Storage</span>
            <span id="vfs-val">0 Nodes</span>
          </div>
          <div class="sm-bar-bg"><div id="vfs-bar" class="sm-bar-fill" style="width: 0%;"></div></div>
          <div id="storage-details" style="font-size: 10px; color: var(--text-secondary); margin-top: 6px; display: flex; justify-content: space-between;">
            <span id="storage-type">Detecting...</span>
            <span id="storage-usage">0 / 0 MB</span>
          </div>
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
          <div>Status / Nodes</div>
          <div style="text-align: right;">Usage / Action</div>
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
    title: 'System Monitor(simulated)',
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

  // 1. CPU Heartbeat for Real Lag Tracking
  let lastFrameTime = performance.now();
  let lagPoints = 0;
  const heartbeat = () => {
    const now = performance.now();
    const delta = now - lastFrameTime;
    if (delta > 20) lagPoints += (delta - 16.6); // Track ms of delay
    lastFrameTime = now;
    if (document.body.contains(content)) requestAnimationFrame(heartbeat);
  };
  heartbeat();

  const render = async () => {
    // 1. Shared Telemetry Engine
    const countNodes = (el) => (el ? el.querySelectorAll('*').length + 1 : 0);
    const getAppMem = (win) => Math.round(50 + (countNodes(win.contentArea) * 0.12));
    const getPluginMem = () => 15;
    const getRuntimeMem = () => 128;

    const memoryInfo = window.performance.memory || { usedJSHeapSize: 0, jsHeapSizeLimit: 0 };
    let usedHeap = memoryInfo.usedJSHeapSize;
    let baseTotal = (navigator.deviceMemory || 8) * 1024 * 1024 * 1024;
    let totalHeap = memoryInfo.jsHeapSizeLimit || baseTotal;

    const activeWindows = windowManager.windows.size;
    const activePlugins = loader.getLoaded().size;

    // Calculate Absolute Process-Based Sum
    let estimatedMB = getRuntimeMem();
    windowManager.windows.forEach(win => estimatedMB += getAppMem(win));
    loader.getLoaded().forEach(() => estimatedMB += getPluginMem());

    // Sync Overview with Process Manager
    usedHeap = Math.max(usedHeap, estimatedMB * 1024 * 1024);

    // DYNAMIC SCALING: If we approach the browser-reported limit, expand it to match hardware reality
    let isScaled = false;
    if (usedHeap > totalHeap * 0.9) {
      isScaled = true;
      // Scale in 4GB increments
      totalHeap = Math.max(totalHeap, Math.ceil((usedHeap * 1.1) / (4 * 1024 * 1024 * 1024)) * 4 * 1024 * 1024 * 1024);
    }

    const heapPercent = (usedHeap / totalHeap) * 100;

    // CPU Logic
    const baseLoad = 0.5 + (activeWindows * 0.5) + (activePlugins * 0.2);
    const lagFactor = Math.min(90, (lagPoints / 50) * 5);
    const cpu = Math.min(100, Math.round(baseLoad + lagFactor + (Math.random() * 0.5)));
    lagPoints = 0;

    // Update Gauges
    const cpuBar = content.querySelector('#cpu-bar');
    cpuBar.style.width = cpu + '%';
    cpuBar.className = 'sm-bar-fill' + (cpu > 80 ? ' danger' : cpu > 50 ? ' warning' : '');
    content.querySelector('#cpu-val').textContent = cpu + '%';

    const memBar = content.querySelector('#mem-bar');
    memBar.style.width = heapPercent + '%';
    memBar.className = 'sm-bar-fill' + (heapPercent > 80 ? ' danger' : heapPercent > 50 ? ' warning' : '');

    const isCapped = navigator.deviceMemory === 8;
    let label = '';
    if (isScaled) label = '<span style="font-size:9px; color:var(--warning); cursor:help;" title="Exceeded browser limit; dynamically scaling to match hardware load">*Scaled</span>';
    else if (isCapped) label = '<span style="font-size:9px; opacity:0.6; cursor:help;" title="Browsers cap reported RAM at 8GB for privacy">*Capped</span>';

    content.querySelector('#mem-val').innerHTML = `
      ${Math.round(usedHeap / 1024 / 1024)} MB / ${Math.round(totalHeap / 1024 / 1024)} MB ${label}
    `;

    // VFS Stats & Storage Estimation
    let totalNodes = 0;
    let totalSize = 0;
    const isServer = (vfs.serverAvailable || !vfs.staticMode);
    content.querySelector('#storage-type').textContent = isServer ? 'Live Server FS' : 'IndexedDB (Local)';

    try {
      const allFiles = await vfs.exportAll();
      if (allFiles.length > 0) {
        totalNodes = allFiles.length;
        totalSize = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      } else if (isServer) {
        const scan = async (path, depth = 0) => {
          if (depth > 2) return;
          const items = await vfs.readdir(path);
          totalNodes += items.length;
          for (const item of items) {
            totalSize += (item.size || 0);
            if (item.type === 'dir') await scan(item.path, depth + 1);
          }
        };
        await scan('/');
      }

      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || (2 * 1024 * 1024 * 1024);
      const usage = estimate.usage || totalSize;

      content.querySelector('#vfs-bar').style.width = Math.min(100, (usage / quota) * 100) + '%';
      content.querySelector('#vfs-val').textContent = totalNodes + ' Nodes';
      content.querySelector('#storage-usage').textContent = `${Math.round(usage / 1024 / 1024)}MB / ${Math.round(quota / 1024 / 1024 / 1024)}GB`;
    } catch (e) { }

    // Hardware Info
    const cores = navigator.hardwareConcurrency || 'Unknown';
    const deviceMem = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown';

    let logs = (consoleLog && consoleLog._logs) ? consoleLog._logs : [];
    const errors = logs.filter(l => l.type === 'error');
    content.querySelector('#log-count').textContent = logs.length;
    content.querySelector('#error-count').textContent = errors.length;

    const healthEl = content.querySelector('#health-val');
    if (errors.length > 5 || heapPercent > 90) {
      healthEl.textContent = 'Critical'; healthEl.style.color = 'var(--danger)';
    } else if (errors.length > 0 || heapPercent > 70) {
      healthEl.textContent = 'Warning'; healthEl.style.color = 'var(--warning)';
    } else {
      healthEl.textContent = 'Healthy (' + cores + ' Cores, ' + deviceMem + ' RAM)'; healthEl.style.color = 'var(--success)';
    }

    // 2. Processes Tab
    const processList = content.querySelector('#process-list');
    processList.innerHTML = '';

    // Add EverestOS Runtime
    processList.innerHTML += `
      <div class="process-row">
        <div><strong>EverestOS Runtime</strong></div>
        <div style="color:var(--text-secondary)">System</div>
        <div style="color:var(--success)">Running</div>
        <div style="text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:8px;">
          <span style="font-family:var(--font-mono); font-size:11px; opacity:0.8;">${getRuntimeMem()}MB</span>
        </div>
      </div>
    `;

    // Add Windows
    windowManager.windows.forEach(win => {
      const nodes = countNodes(win.contentArea);
      const estMem = getAppMem(win);

      const row = document.createElement('div');
      row.className = 'process-row';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          ${IconHelper.getIcon(win.icon || 'window', { size: 14 })}
          <span>${win.title || win.id}</span>
        </div>
        <div style="color:var(--text-secondary)">Application</div>
        <div style="color:var(--success)">Active (${nodes} nodes)</div>
        <div style="text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:8px;">
          <span style="font-family:var(--font-mono); font-size:11px; opacity:0.8;">${estMem}MB</span>
          <button class="btn-danger btn-sm" style="padding: 2px 8px; font-size:11px;">Kill</button>
        </div>
      `;
      row.querySelector('.btn-danger').onclick = (e) => {
        e.stopPropagation(); windowManager.closeWindow(win.id); render();
      };
      processList.appendChild(row);
    });

    // Add Plugins
    loader.getLoaded().forEach((ext, uuid) => {
      const row = document.createElement('div');
      row.className = 'process-row';
      const estMem = getPluginMem();
      const crashCount = window.osAPI.Sandbox._crashMap.get(uuid) || 0;
      const isCritical = crashCount >= window.osAPI.Sandbox.CRASH_THRESHOLD;

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          ${IconHelper.getIcon('plugin', { size: 14 })}
          <span>${uuid}</span>
        </div>
        <div style="color:var(--text-secondary)">Extension (${ext.type}) ${isCritical ? '<span style="color:var(--danger); font-size:10px;">[HALTED]</span>' : ''}</div>
        <div style="color:${isCritical ? 'var(--danger)' : crashCount > 0 ? 'var(--warning)' : 'var(--success)'}">
          ${isCritical ? 'Critical Failure' : crashCount > 0 ? `Degraded (${crashCount} errors)` : 'Healthy'}
        </div>
        <div style="text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:8px;">
          <span style="font-family:var(--font-mono); font-size:11px; opacity:0.8;">${estMem}MB</span>
          <button class="btn-secondary btn-sm" style="padding: 2px 8px; font-size:11px;" id="btn-reset-${uuid.replace('@', '-')}">Reset</button>
          <button class="btn-danger btn-sm" style="padding: 2px 8px; font-size:11px;">Unload</button>
        </div>
      `;
      row.querySelector('.btn-danger').onclick = async (e) => {
        e.stopPropagation(); await loader.unload(uuid); render();
      };
      const resetBtn = row.querySelector(`#btn-reset-${uuid.replace('@', '-')}`);
      if (resetBtn) {
        resetBtn.onclick = (e) => {
          e.stopPropagation();
          window.osAPI.Sandbox.resetHealth(uuid);
          render();
        };
      }
      processList.appendChild(row);
    });

    // 3. Logs Tab
    const logContainer = content.querySelector('#log-container');
    if (logs.length === 0) {
      logContainer.innerHTML = '<div style="opacity:0.5; padding:20px; text-align:center;">No system logs available.</div>';
    } else {
      const recentLogs = logs.slice(-100); // Only show last 100 for performance
      logContainer.innerHTML = recentLogs.map(l => `
        <div class="log-entry ${l.type}">
          <div class="log-meta">
            <span>[${l.time || 'Unknown'}]</span>
            <span>${l.type.toUpperCase()}:</span>
          </div>
          <div class="log-content">${l.message}</div>
        </div>
      `).join('');
      // Auto-scroll if at bottom
      if (logContainer.scrollHeight - logContainer.scrollTop - logContainer.clientHeight < 50) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
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

  // Auto-refresh interval (Real update interval)
  const interval = setInterval(() => {
    if (document.body.contains(content)) render();
    else clearInterval(interval);
  }, 3000);
}

