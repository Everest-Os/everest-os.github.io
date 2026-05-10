const { showSystemDialog } = window.osAPI;
const { IconHelper } = window.osAPI;

export async function launch(ctx, options = {}) {
  const { windowManager, vfs, loader, appLoader, filePicker } = ctx;

  const templates = {
    app: {
      name: "Full Application",
      icon: "archive",
      files: {
        "app.js": `/**
 * Full Application Template with Settings & About
 */

export async function launch(ctx, options = {}) {
  const { windowManager } = ctx;

  const content = document.createElement('div');
  content.style.cssText = 'height:100%; display:flex; flex-direction:column; background:var(--bg-surface); color:var(--text-primary);';
  
  content.innerHTML = \`
    <div style="height:38px; border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 12px; gap:8px;">
      <button id="btn-settings" class="btn-secondary btn-sm">\${IconHelper.getIcon('settings', { size: 14 })} Settings</button>
      <button id="btn-about" class="btn-secondary btn-sm">\${IconHelper.getIcon('info', { size: 14 })} About</button>
    </div>
    <div style="flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px;">
      <h1>Hello from My App!</h1>
      <button id="btn-click-me" class="btn-primary">Click Me</button>
    </div>
  \`;

  const win = windowManager.createWindow({
    id: 'my-full-app-' + Math.random().toString(36).substr(2, 5),
    title: 'My Full App',
    icon: 'archive',
    width: 500,
    height: 400,
    content
  });

  content.querySelector('#btn-settings').onclick = () => {
    ctx.showSystemDialog({
      title: 'Settings',
      message: 'Settings for this app can be configured in the System Settings.',
      type: 'alert'
    });
  };

  content.querySelector('#btn-about').onclick = () => {
    ctx.showSystemDialog({
      title: 'About',
      message: 'This is a sample application template.\\n\\nYou can edit it in the Developer Center.',
      type: 'alert'
    });
  };

  content.querySelector('#btn-click-me').onclick = () => {
    if (ctx.log) ctx.log('Action triggered!');
    else console.log('Action triggered!');
  };
}
`,
        "app.json": `{
  "id": "my-full-app",
  "name": "My Full App",
  "description": "A comprehensive app template",
  "icon": "archive",
  "category": "Development",
  "version": "1.0.0"
}`
      }
    },
    desklet: {
      name: "Pro Desklet",
      icon: "computer",
      files: {
        "desklet.js": `/**
 * Professional Desklet Template
 */
const Desklet = imports.ui.desklet;
const St = imports.gi.St;

class MyDesklet extends Desklet.Desklet {
  constructor(metadata, deskletId) {
    super(metadata, deskletId);
    this.setHeader("Pro Desklet");

    this._label = new St.Label({
      text: "Hello, Desktop!",
      style: "font-size: 16px; padding: 24px; color: #fff; background: linear-gradient(135deg, var(--accent), #2e5cb8); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
    });

    this.setContent(this._label);
    
    // Add custom context menu items
    this.addContextMenuItem({
      icon: 'star',
      label: 'Special Action',
      action: () => global.log("Special action triggered in desklet!")
    });
  }

  // Lifecycle hooks
  on_desklet_added_to_desktop() {
    global.log("Desklet placed on desktop");
  }

  on_desklet_clicked(event) {
    global.log("Desklet clicked!");
  }
}

function main(metadata, deskletId) {
  return new MyDesklet(metadata, deskletId);
}
`,
        "metadata.json": `{
  "uuid": "pro-desklet@playground",
  "name": "Pro Desklet",
  "description": "A feature-rich desklet template",
  "prevent-decorations": false
}`,
        "settings-schema.json": `{
  "color": {
    "type": "color",
    "default": "#3584e4",
    "description": "Background color"
  }
}`
      }
    },
    applet: {
      name: "Active Applet",
      icon: "plugin",
      files: {
        "applet.js": `/**
 * Active Applet Template
 */
const Applet = imports.ui.applet;
const Settings = imports.ui.settings;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;

class MyApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.set_applet_icon_symbolic_name("system-run");
    this.set_applet_tooltip("Active Applet Example");
    
    // Bind settings
    this.settings = new Settings.AppletSettings(this, metadata.uuid, instance_id);
    this.settings.bind("color", "accentColor", this.on_settings_changed);
    this.settings.bind("showLabel", "showLabel", this.on_settings_changed);

    // Initial state
    this.on_settings_changed();

    // Create a popup menu
    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);

    this.menu.addMenuItem(new PopupMenu.PopupMenuItem("Settings", "emblem-system"));
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    
    let item = new PopupMenu.PopupMenuItem("Quit", "application-exit");
    item.connect('activate', () => {
      global.log("Quitting applet...");
      this.confirm_remove();
    });
    this.menu.addMenuItem(item);
  }

  on_settings_changed() {
    this.actor.set_style(\`background: \${this.accentColor || 'var(--accent)'}; color: white; border-radius: 4px; padding: 0 8px;\`);
    global.log("Settings updated: color=" + this.accentColor);
  }

  on_applet_clicked(event) {
    this.menu.toggle();
    global.log("Applet menu toggled");
  }

  on_applet_removed_from_panel() {
    global.log("Applet cleaned up");
  }
}

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}
`,
        "metadata.json": `{
  "uuid": "active-applet@playground",
  "name": "Active Applet",
  "description": "A complex applet with menus"
}`,
        "settings-schema.json": `{
  "header": {
    "type": "header",
    "description": "Appearance Settings"
  },
  "color": {
    "type": "colorchooser",
    "default": "#3584e4",
    "description": "Accent Color"
  },
  "showLabel": {
    "type": "switch",
    "default": true,
    "description": "Show Status Label"
  }
}`
      }
    }
  };

  let currentTemplate = null;
  let currentFiles = {};
  let activeFileName = null;
  let isDirty = false;

  const showWelcomeGuide = () => {
    activeFileName = null;
    currentFiles = {};
    editor.value = `/**
 * 💻 Developer Center Guide
 * 
 * Welcome to the Playground OS Developer Center!
 * Use the sidebar on the left to load a sample project or create something new.
 * 
 * 🚀 Getting Started:
 * 1. Click on a sample in the "Samples & Templates" section.
 * 2. Edit the code in this editor.
 * 3. Click "▶️ Run Sandbox" to test your creation instantly.
 * 4. Use the "📟 Console" to debug and see logs.
 * 
 * 🧩 Available Templates:
 * - Full App: A standalone window with its own logic.
 * - Desklet: A draggable widget for the desktop.
 * - Applet: A system component for the bottom panel.
 * 
 * 💾 Exporting:
 * Once you're happy with your work, click "💾 Export to FS" to save it
 * to your persistent filesystem (~/Apps or ~/Plugins).
 */`;
    editor.readOnly = true;
    editor.style.opacity = '0.7';
    filePathEl.textContent = "Welcome Guide";
    statusText.textContent = "Select a template to begin";
    updateFileList();
  };

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
      <div style="flex: 1;"></div>
      <button class="btn-secondary btn-sm" id="btn-console">${IconHelper.getIcon('terminal', { size: 14 })} Console</button>
      <button class="btn-primary btn-sm" id="btn-run" style="display:none;">${IconHelper.getIcon('play', { size: 14 })} Run Sandbox</button>
      <button class="btn-secondary btn-sm" id="btn-export" style="display:none;">${IconHelper.getIcon('disk', { size: 14 })} Export to FS</button>
    </div>
    
    <div style="flex: 1; display: flex; overflow: hidden; flex-direction: column;">
      <div style="flex: 1; display: flex; overflow: hidden;">
        <!-- Sidebar -->
        <div style="width: 200px; border-right: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column;">
          <div style="padding: 12px; font-size: 11px; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700;">Project Files</div>
          <div id="file-list" style="flex: 1; min-height: 100px;"></div>
          
          <div style="padding: 12px; font-size: 11px; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700; border-top: 1px solid var(--border);">Samples & Templates</div>
          <div id="samples-list" style="padding-bottom: 12px;">
            <div class="file-item sample-item" data-type="app"><span>${IconHelper.getIcon('archive', { size: 14 })}</span> Full Application</div>
            <div class="file-item sample-item" data-type="desklet"><span>${IconHelper.getIcon('computer', { size: 14 })}</span> Pro Desklet</div>
            <div class="file-item sample-item" data-type="applet"><span>${IconHelper.getIcon('plugin', { size: 14 })}</span> Active Applet</div>
          </div>
        </div>
        
        <!-- Editor -->
        <div style="flex: 1; display: flex; flex-direction: column; background: var(--bg-surface);">
          <textarea id="dev-editor" spellcheck="false" style="
            flex: 1;
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-size: 13px;
            padding: 20px;
            resize: none;
            outline: none;
            line-height: 1.6;
          "></textarea>
        </div>
      </div>

      <!-- Dev Console -->
      <div id="dev-console" style="height: 150px; border-top: 1px solid var(--border); background: var(--bg-desktop); color: var(--success); font-family: var(--font-mono); font-size: 11px; display: none; flex-direction: column;">
        <div style="height: 24px; background: var(--bg-elevated); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 10px;">
          <span style="flex: 1;">CONSOLE OUTPUT</span>
          <div style="display: flex; gap: 10px;">
            <button id="btn-copy-console" style="background:transparent; border:none; color:#888; cursor:pointer; font-size:10px;">Copy</button>
            <button id="btn-clear-console" style="background:transparent; border:none; color:#888; cursor:pointer; font-size:10px;">Clear</button>
          </div>
        </div>
        <div id="console-output" style="flex: 1; overflow-y: auto; padding: 10px; line-height: 1.4; user-select: text; cursor: text;"></div>
      </div>
    </div>
    
    <div style="height: 32px; border-top: 1px solid var(--border); display: flex; align-items: center; padding: 0 12px; font-size: 11px; color: var(--text-tertiary); background: var(--bg-elevated);">
      <div id="status-text">Ready</div>
      <div style="flex: 1;"></div>
      <div id="file-path">Welcome Guide</div>
    </div>

    <style>
      .file-item { padding: 8px 16px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
      .file-item:hover { background: var(--bg-card-hover); }
      .file-item.active { background: var(--bg-active); color: var(--accent); font-weight: 600; }
      .sample-item { color: var(--text-secondary); }
      .sample-item:hover { color: var(--accent); }
    </style>
  `;

  const win = windowManager.createWindow({
    id: 'developer-center',
    title: 'Developer Center',
    icon: 'terminal,💻',
    width: 1000,
    height: 700,
    content
  });

  const editor = content.querySelector('#dev-editor');
  const fileList = content.querySelector('#file-list');
  const samplesList = content.querySelectorAll('.sample-item');
  const runBtn = content.querySelector('#btn-run');
  const consoleBtn = content.querySelector('#btn-console');
  const exportBtn = content.querySelector('#btn-export');
  const statusText = content.querySelector('#status-text');
  const filePathEl = content.querySelector('#file-path');
  const devConsole = content.querySelector('#dev-console');
  const consoleOutput = content.querySelector('#console-output');
  const clearConsoleBtn = content.querySelector('#btn-clear-console');
  const copyConsoleBtn = content.querySelector('#btn-copy-console');

  const logToConsole = (msg, type = 'info') => {
    const entry = document.createElement('div');
    entry.style.color = type === 'error' ? '#f44' : type === 'warn' ? '#fb0' : '#0f0';
    entry.style.marginBottom = '4px';
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleOutput.appendChild(entry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    devConsole.style.display = 'flex';
  };

  clearConsoleBtn.onclick = () => consoleOutput.innerHTML = '';

  copyConsoleBtn.onclick = () => {
    const text = consoleOutput.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyConsoleBtn.textContent;
      copyConsoleBtn.textContent = 'Copied!';
      setTimeout(() => copyConsoleBtn.textContent = originalText, 2000);
    });
  };

  consoleBtn.onclick = () => {
    devConsole.style.display = devConsole.style.display === 'none' ? 'flex' : 'none';
  };

  const updateFileList = () => {
    fileList.innerHTML = '';
    const fileNames = Object.keys(currentFiles);
    if (fileNames.length === 0) {
      fileList.innerHTML = '<div style="padding:12px; font-size:12px; color:var(--text-tertiary); font-style:italic;">No files loaded</div>';
      return;
    }

    fileNames.forEach(name => {
      const el = document.createElement('div');
      el.className = 'file-item' + (name === activeFileName ? ' active' : '');
      el.innerHTML = `<span>\${name.endsWith('.json') ? IconHelper.getIcon('settings', { size: 14 }) : IconHelper.getIcon('file', { size: 14 })}</span> \${name}`;
      el.onclick = () => {
        if (activeFileName) currentFiles[activeFileName] = editor.value;
        activeFileName = name;
        editor.value = currentFiles[name];
        filePathEl.textContent = `/dev/project/${name}`;
        updateFileList();
      };
      fileList.appendChild(el);
    });
  };

  const switchTemplate = (type) => {
    if (currentTemplate === type && !isDirty) return; // Already loaded

    const load = () => {
      currentTemplate = type;
      currentFiles = JSON.parse(JSON.stringify(templates[type].files));
      activeFileName = Object.keys(currentFiles)[0];
      editor.value = currentFiles[activeFileName];
      editor.readOnly = false;
      editor.style.opacity = '1';
      filePathEl.textContent = `/dev/project/${activeFileName}`;
      runBtn.style.display = 'block';
      exportBtn.style.display = 'block';
      isDirty = false;
      updateFileList();
      statusText.textContent = `Loaded ${templates[type].name}`;
    };

    if (currentTemplate) {
      showSystemDialog({
        title: 'Switch Template',
        message: 'Are you sure you want to switch to a different template? Any unsaved changes in your current project will be lost.',
        type: 'confirm',
        onConfirm: load
      });
    } else {
      load();
    }
  };

  samplesList.forEach(item => {
    item.onclick = () => switchTemplate(item.dataset.type);
  });

  editor.addEventListener('input', () => {
    isDirty = true;
  });

  runBtn.onclick = async () => {
    currentFiles[activeFileName] = editor.value;
    statusText.textContent = "Running sandbox...";
    logToConsole("--- Starting Sandbox ---");

    // Create a custom context for the sandbox
    const sandboxCtx = {
      ...ctx,
      showSystemDialog: (args) => showSystemDialog(args),
      log: (msg) => logToConsole(msg),
    };

    try {
      if (currentTemplate === 'app') {
        const jsCode = currentFiles['app.js'];
        const jsonCode = currentFiles['app.json'];
        const manifest = JSON.parse(jsonCode);

        // Create a data URL module that defines 'global'
        const wrappedCode = `
          const global = {
            log: (msg) => window.dispatchEvent(new CustomEvent('dev-center-log', { detail: msg })),
            showSystemDialog: (args) => window.dispatchEvent(new CustomEvent('dev-center-dialog', { detail: args }))
          };
          ${jsCode}
        `;
        const blob = new Blob([wrappedCode], { type: 'application/javascript' });

        const logHandler = (e) => logToConsole(e.detail);
        const dialogHandler = (e) => showSystemDialog(e.detail);

        window.addEventListener('dev-center-log', logHandler);
        window.addEventListener('dev-center-dialog', dialogHandler);

        const url = URL.createObjectURL(blob);
        try {
          const mod = await import(/* @vite-ignore */ url);
          if (mod.launch) {
            await mod.launch(sandboxCtx);
            statusText.textContent = "App launched.";
          } else {
            throw new Error("No launch() export found.");
          }
        } finally {
          URL.revokeObjectURL(url);
          // Note: we don't remove the listener immediately because the app might still be running
        }
      } else {
        // Desklet or Applet
        const type = currentTemplate === 'desklet' ? 'desklets' : 'applets';
        const uuid = 'sandbox-tester-' + Math.random().toString(36).substr(2, 5);
        const metadata = JSON.parse(currentFiles['metadata.json']);
        metadata.uuid = uuid;

        let schema = null;
        if (currentFiles['settings-schema.json']) {
          try { schema = JSON.parse(currentFiles['settings-schema.json']); } catch (e) { }
        }

        const files = {};
        Object.keys(currentFiles).forEach(k => files[k] = currentFiles[k]);

        // Intercept logs for this plugin
        const originalLog = window.__everestConsole.log;
        const originalError = window.__everestConsole.logError;
        window.__everestConsole.log = (msg) => {
          originalLog.call(window.__everestConsole, msg);
          logToConsole(msg);
        };
        window.__everestConsole.logError = (msg) => {
          originalError.call(window.__everestConsole, msg);
          logToConsole(msg, 'error');
        };

        try {
          await loader._evaluate({
            metadata, type, uuid, files, settingsSchema: schema, path: `/dev/sandbox/${uuid}`
          });
          statusText.textContent = `${currentTemplate} loaded.`;
        } finally {
          // Restore logs after a short delay
          setTimeout(() => {
            window.__everestConsole.log = originalLog;
            window.__everestConsole.logError = originalError;
          }, 1000);
        }
      }
    } catch (err) {
      logToConsole(err.message, 'error');
      statusText.textContent = "Error occurred.";
    }
  };

  exportBtn.onclick = async () => {
    currentFiles[activeFileName] = editor.value;

    try {
      let exportPath = "";
      let id = "";

      if (currentTemplate === 'app') {
        const manifest = JSON.parse(currentFiles['app.json']);
        id = manifest.id || 'my-app';
        exportPath = `~/.local/share/applications/${id}`;
      } else {
        const type = currentTemplate === 'desklet' ? 'desklets' : 'applets';
        const metadata = JSON.parse(currentFiles['metadata.json']);
        id = metadata.uuid || 'my-plugin';
        exportPath = `~/.local/share/plugins/${type}/${id}`;
      }

      // Check for conflicts by reading the parent directory (avoids 404 logs)
      try {
        const parent = exportPath.substring(0, exportPath.lastIndexOf('/'));
        const name = exportPath.substring(exportPath.lastIndexOf('/') + 1);
        const siblings = await vfs.readdir(parent).catch(() => []);
        const exists = siblings.some(s => s.name === name);

        if (exists) {
          showSystemDialog({
            title: 'Conflict Detected',
            message: `A project with the identifier "${id}" already exists at ${exportPath}.\n\nPlease change the ID in ${currentTemplate === 'app' ? 'app.json' : 'metadata.json'} before exporting.`,
            type: 'alert'
          });
          return;
        }
      } catch (e) {
        // Parent doesn't exist yet or other error, which means no conflict
      }

      statusText.textContent = "Exporting...";
      await vfs.mkdir(exportPath);
      for (const [name, content] of Object.entries(currentFiles)) {
        await vfs.writeFile(`${exportPath}/${name}`, content);
      }

      statusText.textContent = "Exported to " + exportPath;
      showSystemDialog({
        title: 'Export Successful',
        message: `Project exported to ${exportPath}.\n\nYou can now see it in the File Manager or Extension Manager.`,
        type: 'alert'
      });

      // If it's an app, refresh the app loader
      if (currentTemplate === 'app') {
        await appLoader.init();
      }
    } catch (err) {
      showSystemDialog({
        title: 'Export Failed',
        message: err.message,
        type: 'alert'
      });
    }
  };

  // Initialize with Welcome Guide
  showWelcomeGuide();
}
