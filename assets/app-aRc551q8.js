import{I as m,s as y}from"./index-DY9sEeDM.js";async function B(M,q={}){const{windowManager:D,vfs:w,loader:T,appLoader:$,filePicker:F}=M,j={app:{name:"Full Application",icon:"archive",files:{"app.js":`/**
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
`,"app.json":`{
  "id": "my-full-app",
  "name": "My Full App",
  "description": "A comprehensive app template",
  "icon": "archive",
  "category": "Development",
  "version": "1.0.0"
}`}},desklet:{name:"Pro Desklet",icon:"computer",files:{"desklet.js":`/**
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
`,"metadata.json":`{
  "uuid": "pro-desklet@playground",
  "name": "Pro Desklet",
  "description": "A feature-rich desklet template",
  "prevent-decorations": false
}`,"settings-schema.json":`{
  "color": {
    "type": "color",
    "default": "#3584e4",
    "description": "Background color"
  }
}`}},applet:{name:"Active Applet",icon:"plugin",files:{"applet.js":`/**
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
`,"metadata.json":`{
  "uuid": "active-applet@playground",
  "name": "Active Applet",
  "description": "A complex applet with menus"
}`,"settings-schema.json":`{
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
}`}}};let l=null,o={},r=null,k=!1;const L=()=>{r=null,o={},a.value=`/**
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
 */`,a.readOnly=!0,a.style.opacity="0.7",C.textContent="Welcome Guide",c.textContent="Select a template to begin",A()},i=document.createElement("div");i.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,i.innerHTML=`
    <div style="height: 44px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
      <div style="flex: 1;"></div>
      <button class="btn-secondary btn-sm" id="btn-console">${m.getIcon("terminal",{size:14})} Console</button>
      <button class="btn-primary btn-sm" id="btn-run" style="display:none;">${m.getIcon("play",{size:14})} Run Sandbox</button>
      <button class="btn-secondary btn-sm" id="btn-export" style="display:none;">${m.getIcon("disk",{size:14})} Export to FS</button>
    </div>
    
    <div style="flex: 1; display: flex; overflow: hidden; flex-direction: column;">
      <div style="flex: 1; display: flex; overflow: hidden;">
        <!-- Sidebar -->
        <div style="width: 200px; border-right: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column;">
          <div style="padding: 12px; font-size: 11px; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700;">Project Files</div>
          <div id="file-list" style="flex: 1; min-height: 100px;"></div>
          
          <div style="padding: 12px; font-size: 11px; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700; border-top: 1px solid var(--border);">Samples & Templates</div>
          <div id="samples-list" style="padding-bottom: 12px;">
            <div class="file-item sample-item" data-type="app"><span>${m.getIcon("archive",{size:14})}</span> Full Application</div>
            <div class="file-item sample-item" data-type="desklet"><span>${m.getIcon("computer",{size:14})}</span> Pro Desklet</div>
            <div class="file-item sample-item" data-type="applet"><span>${m.getIcon("plugin",{size:14})}</span> Active Applet</div>
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
  `,D.createWindow({id:"developer-center",title:"Developer Center",icon:"terminal,💻",width:1e3,height:700,content:i});const a=i.querySelector("#dev-editor"),S=i.querySelector("#file-list"),P=i.querySelectorAll(".sample-item"),E=i.querySelector("#btn-run"),O=i.querySelector("#btn-console"),I=i.querySelector("#btn-export"),c=i.querySelector("#status-text"),C=i.querySelector("#file-path"),_=i.querySelector("#dev-console"),h=i.querySelector("#console-output"),z=i.querySelector("#btn-clear-console"),b=i.querySelector("#btn-copy-console"),p=(e,t="info")=>{const n=document.createElement("div");n.style.color=t==="error"?"#f44":t==="warn"?"#fb0":"#0f0",n.style.marginBottom="4px",n.textContent=`[${new Date().toLocaleTimeString()}] ${e}`,h.appendChild(n),h.scrollTop=h.scrollHeight,_.style.display="flex"};z.onclick=()=>h.innerHTML="",b.onclick=()=>{const e=h.innerText;navigator.clipboard.writeText(e).then(()=>{const t=b.textContent;b.textContent="Copied!",setTimeout(()=>b.textContent=t,2e3)})},O.onclick=()=>{_.style.display=_.style.display==="none"?"flex":"none"};const A=()=>{S.innerHTML="";const e=Object.keys(o);if(e.length===0){S.innerHTML='<div style="padding:12px; font-size:12px; color:var(--text-tertiary); font-style:italic;">No files loaded</div>';return}e.forEach(t=>{const n=document.createElement("div");n.className="file-item"+(t===r?" active":""),n.innerHTML="<span>${name.endsWith('.json') ? IconHelper.getIcon('settings', { size: 14 }) : IconHelper.getIcon('file', { size: 14 })}</span> ${name}",n.onclick=()=>{r&&(o[r]=a.value),r=t,a.value=o[t],C.textContent=`/dev/project/${t}`,A()},S.appendChild(n)})},H=e=>{if(l===e&&!k)return;const t=()=>{l=e,o=JSON.parse(JSON.stringify(j[e].files)),r=Object.keys(o)[0],a.value=o[r],a.readOnly=!1,a.style.opacity="1",C.textContent=`/dev/project/${r}`,E.style.display="block",I.style.display="block",k=!1,A(),c.textContent=`Loaded ${j[e].name}`};l?y({title:"Switch Template",message:"Are you sure you want to switch to a different template? Any unsaved changes in your current project will be lost.",type:"confirm",onConfirm:t}):t()};P.forEach(e=>{e.onclick=()=>H(e.dataset.type)}),a.addEventListener("input",()=>{k=!0}),E.onclick=async()=>{o[r]=a.value,c.textContent="Running sandbox...",p("--- Starting Sandbox ---");const e={...M,showSystemDialog:t=>y(t),log:t=>p(t)};try{if(l==="app"){const t=o["app.js"],n=o["app.json"],d=JSON.parse(n),v=`
          const global = {
            log: (msg) => window.dispatchEvent(new CustomEvent('dev-center-log', { detail: msg })),
            showSystemDialog: (args) => window.dispatchEvent(new CustomEvent('dev-center-dialog', { detail: args }))
          };
          ${t}
        `,x=new Blob([v],{type:"application/javascript"}),u=g=>p(g.detail),f=g=>y(g.detail);window.addEventListener("dev-center-log",u),window.addEventListener("dev-center-dialog",f);const s=URL.createObjectURL(x);try{const g=await import(s);if(g.launch)await g.launch(e),c.textContent="App launched.";else throw new Error("No launch() export found.")}finally{URL.revokeObjectURL(s)}}else{const t=l==="desklet"?"desklets":"applets",n="sandbox-tester-"+Math.random().toString(36).substr(2,5),d=JSON.parse(o["metadata.json"]);d.uuid=n;let v=null;if(o["settings-schema.json"])try{v=JSON.parse(o["settings-schema.json"])}catch{}const x={};Object.keys(o).forEach(s=>x[s]=o[s]);const u=window.__everestConsole.log,f=window.__everestConsole.logError;window.__everestConsole.log=s=>{u.call(window.__everestConsole,s),p(s)},window.__everestConsole.logError=s=>{f.call(window.__everestConsole,s),p(s,"error")};try{await T._evaluate({metadata:d,type:t,uuid:n,files:x,settingsSchema:v,path:`/dev/sandbox/${n}`}),c.textContent=`${l} loaded.`}finally{setTimeout(()=>{window.__everestConsole.log=u,window.__everestConsole.logError=f},1e3)}}}catch(t){p(t.message,"error"),c.textContent="Error occurred."}},I.onclick=async()=>{o[r]=a.value;try{let e="",t="";if(l==="app")t=JSON.parse(o["app.json"]).id||"my-app",e=`~/.local/share/applications/${t}`;else{const n=l==="desklet"?"desklets":"applets";t=JSON.parse(o["metadata.json"]).uuid||"my-plugin",e=`~/.local/share/plugins/${n}/${t}`}try{const n=e.substring(0,e.lastIndexOf("/")),d=e.substring(e.lastIndexOf("/")+1);if((await w.readdir(n).catch(()=>[])).some(u=>u.name===d)){y({title:"Conflict Detected",message:`A project with the identifier "${t}" already exists at ${e}.

Please change the ID in ${l==="app"?"app.json":"metadata.json"} before exporting.`,type:"alert"});return}}catch{}c.textContent="Exporting...",await w.mkdir(e);for(const[n,d]of Object.entries(o))await w.writeFile(`${e}/${n}`,d);c.textContent="Exported to "+e,y({title:"Export Successful",message:`Project exported to ${e}.

You can now see it in the File Manager or Extension Manager.`,type:"alert"}),l==="app"&&await $.init()}catch(e){y({title:"Export Failed",message:e.message,type:"alert"})}},L()}export{B as launch};
