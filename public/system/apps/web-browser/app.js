const { IconHelper } = window.osAPI;
const { showContextMenu } = window.osAPI;
const { showSystemDialog } = window.osAPI;

export function launch(ctx, options = {}) {
  const { windowManager, vfs, appLoader } = ctx;
  let initialUrl = options.url || options.args?.[0] || 'https://example.com';

  if (initialUrl.startsWith('/') || initialUrl.startsWith('~')) {
    initialUrl = vfs.getFsPath(initialUrl);
  }

  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    position: relative;
    overflow: hidden;
  `;

  content.innerHTML = `
    <!-- Progress Bar -->
    <div id="br-progress-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0,0,0,0.1); z-index: 100; display: none;">
      <div id="br-progress-bar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);"></div>
    </div>

    <!-- Toolbar -->
    <div style="display:flex; gap:8px; padding:8px 12px; background:var(--bg-elevated); border-bottom:1px solid var(--border); align-items:center; z-index: 10;">
      <div style="display:flex; gap:4px;">
        <button id="br-back" class="br-tool-btn" title="Back">${IconHelper.getIcon('back', { size: 18 })}</button>
        <button id="br-fwd" class="br-tool-btn" title="Forward">${IconHelper.getIcon('next', { size: 18 })}</button>
        <button id="br-reload" class="br-tool-btn" title="Reload">${IconHelper.getIcon('restart', { size: 18 })}</button>
      </div>

      <div style="flex:1; display:flex; align-items:center; background:var(--bg-input); border:1px solid var(--border); border-radius:16px; padding:2px 12px; gap:8px;">
        <div style="opacity:0.5; display:flex;">${IconHelper.getIcon('internet', { size: 12 })}</div>
        <input type="text" id="br-url" value="${initialUrl}" style="flex:1; border:none; background:transparent; color:var(--text-primary); font-size:12px; outline:none; height:24px;">
        <button id="br-go" style="border:none; background:transparent; color:var(--accent); cursor:pointer; font-size:11px; font-weight:600; padding:0 4px;">GO</button>
      </div>

      <button id="br-download-mgr" class="br-tool-btn" title="VFS Downloads">${IconHelper.getIcon('download,📥', { size: 18 })}</button>
    </div>

    <div style="flex:1; position:relative; background:white;">
      <iframe id="br-frame" src="${initialUrl}" style="width:100%; height:100%; border:none; position:absolute; top:0; left:0; z-index:1;"></iframe>

      <!-- Error Page Layer -->
      <div id="br-error-page" style="position:absolute; top:0; left:0; width:100%; height:100%; background:var(--bg-surface); z-index:5; display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px;">
        <div id="br-error-icon" style="font-size:64px; margin-bottom:20px; opacity:0.5;">${IconHelper.getIcon('info', { size: 64 })}</div>
        <h2 id="br-error-title" style="margin:0 0 12px 0;">Network Not Available</h2>
        <p id="br-error-desc" style="color:var(--text-secondary); max-width:400px; line-height:1.5;">This website might be blocking framed access or your internet connection is unavailable.</p>
        <button id="br-error-retry" class="btn-primary" style="margin-top:20px; padding:8px 24px;">Try Again</button>
      </div>
    </div>

    <style>
      .br-tool-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.2s;
      }
      .br-tool-btn:hover { background: var(--bg-surface-hover); }
      .br-tool-btn:active { transform: scale(0.95); }
    </style>
  `;

  const win = windowManager.createWindow({
    id: `browser-${Date.now()}`,
    title: 'Web Browser',
    icon: 'browser',
    width: 1000,
    height: 700,
    content: content
  });

  const urlInput = content.querySelector('#br-url');
  const frame = content.querySelector('#br-frame');
  const btnGo = content.querySelector('#br-go');
  const btnReload = content.querySelector('#br-reload');
  const btnBack = content.querySelector('#br-back');
  const btnFwd = content.querySelector('#br-fwd');
  const progressBar = content.querySelector('#br-progress-bar');
  const progressContainer = content.querySelector('#br-progress-container');
  const errorPage = content.querySelector('#br-error-page');
  const errorTitle = content.querySelector('#br-error-title');
  const errorDesc = content.querySelector('#br-error-desc');

  let loadingTimeout = null;

  const showProgress = (start = true) => {
    if (start) {
      progressContainer.style.display = 'block';
      progressBar.style.width = '10%';
      setTimeout(() => { if (progressBar.style.width === '10%') progressBar.style.width = '60%'; }, 500);
      setTimeout(() => { if (progressBar.style.width === '60%') progressBar.style.width = '85%'; }, 2000);
    } else {
      progressBar.style.width = '100%';
      setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
      }, 300);
    }
  };

  const loadUrl = async () => {
    let url = urlInput.value.trim();
    if (!url) return;

    // Convert VFS paths to proper URLs
    if (url.startsWith('~') || (url.startsWith('/') && !url.startsWith('//'))) {
      url = vfs.getFsPath(url);
    } else if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      url = 'https://' + url;
    }

    urlInput.value = url;
    errorPage.style.display = 'none';
    showProgress(true);

    frame.src = url;

    // Safety timeout for network/compatibility errors
    // Since we can't detect X-Frame-Options from JS without a proxy,
    // we show the error if the page takes too long or fails to signal "load"
    if (loadingTimeout) clearTimeout(loadingTimeout);
    loadingTimeout = setTimeout(() => {
      // If the progress bar is still active after 8 seconds, something is likely blocked or down
      if (progressContainer.style.display !== 'none') {
        showProgress(false);
        errorTitle.textContent = "Website Not Loading";
        errorDesc.textContent = "This website is either offline or it does not support being viewed inside EverestOS (security block).";
        errorPage.style.display = 'flex';
      }
    }, 8000);
  };

  frame.onload = () => {
    showProgress(false);
    if (loadingTimeout) clearTimeout(loadingTimeout);
  };

  // UI Events
  btnGo.onclick = loadUrl;
  urlInput.onkeydown = (e) => { if (e.key === 'Enter') loadUrl(); };
  btnReload.onclick = () => { frame.src = frame.src; showProgress(true); };
  btnBack.onclick = () => { try { frame.contentWindow.history.back(); } catch (e) { } };
  btnFwd.onclick = () => { try { frame.contentWindow.history.forward(); } catch (e) { } };
  content.querySelector('#br-error-retry').onclick = loadUrl;

  // VFS Download Manager (CORS-dependent)
  content.querySelector('#br-download-mgr').onclick = () => {
    const downloadMenu = [
      {
        icon: 'download,📥',
        label: 'Download URL to VFS',
        action: () => {
          showSystemDialog({
            title: 'Download to VFS',
            message: 'Enter a direct URL. Note: Only works for CORS-enabled links.',
            type: 'prompt',
            onConfirm: async (fileUrl) => {
              if (!fileUrl) return;
              const name = fileUrl.split('/').pop() || 'download';
              const target = `/home/user/Downloads/${name}`;

              showSystemDialog({ title: 'Downloading...', message: `Fetching ${name} to VFS...`, type: 'alert' });

              try {
                const res = await fetch(fileUrl, { mode: 'cors' });
                const blob = await res.blob();

                // Convert blob to DataURL/Base64 to store in VFS
                const reader = new FileReader();
                reader.onload = async () => {
                  await vfs.writeFile(target, reader.result);
                  showSystemDialog({ title: 'Download Complete', message: `Saved to ${target}`, type: 'alert' });
                };
                reader.readAsDataURL(blob);
              } catch (e) {
                showSystemDialog({
                  title: 'Download Failed',
                  message: `CORS Blocked: This file cannot be saved to VFS directly because the source server forbids it. System download triggered.`,
                  type: 'alert'
                });
                window.open(fileUrl, '_blank'); // Fallback to system download
              }
            }
          });
        }
      },
      { separator: true },
      { icon: 'folder,📁', label: 'Open Downloads Folder', action: () => appLoader.launchApp('files', { path: '/home/user/Downloads' }) }
    ];

    const rect = content.querySelector('#br-download-mgr').getBoundingClientRect();
    showContextMenu(downloadMenu, rect.left, rect.bottom);
  };

  // Internal Context Menu (Custom)
  content.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const menu = [
      { icon: 'refresh', label: 'Reload Page', action: () => btnReload.click() },
      { separator: true },
      { icon: 'copy', label: 'Copy Page URL', action: () => navigator.clipboard.writeText(urlInput.value) },
      { icon: 'internet', label: 'Open in System Browser', action: () => window.open(urlInput.value, '_blank') },
      { separator: true },
      { icon: 'info', label: 'Inspect Everest Browser', action: () => console.log("Everest Browser Instance", win.id) }
    ];
    showContextMenu(menu, e.clientX, e.clientY);
  });
}
