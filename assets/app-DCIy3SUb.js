const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DY9sEeDM.js","assets/index-BKJI6B33.css"])))=>i.map(i=>d[i]);
import{_ as pe}from"./index-DY9sEeDM.js";async function ue(d,T={}){const{windowManager:F,vfs:x,themeManager:k,appLoader:V,loader:B,panelManager:_}=d,{IconHelper:f}=await pe(async()=>{const{IconHelper:e}=await import("./index-DY9sEeDM.js").then(n=>n.i);return{IconHelper:e}},__vite__mapDeps([0,1]));let g={};const Y=async()=>{try{const e=await x.readFile("~/.config/appearance.json");e&&(g=JSON.parse(e))}catch{}},W=async()=>{await x.writeFile("~/.config/appearance.json",JSON.stringify(g,null,2)),document.dispatchEvent(new CustomEvent("reload-appearance"))};await Y();let A="appearance";T.args&&T.args.length>0&&(A=T.args[0]),T.section&&(A=T.section);const G=F.windows.get("system-settings");if(G){F.focusWindow("system-settings"),setTimeout(()=>{const e=G.frame.querySelector(`.settings-nav-item[data-section="${A}"]`);e&&(e.click(),e.dispatchEvent(new Event("click",{bubbles:!0})))},50);return}const I=document.createElement("div");I.style.height="100%",I.style.display="flex",I.style.background="var(--bg-surface)",I.style.color="var(--text-primary)",I.style.fontFamily="var(--font-main)",I.innerHTML=`
    <div id="settings-sidebar" style="
      width: 180px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 12px 0;
      flex-shrink: 0;
    ">
      <div class="settings-nav-item" data-section="appearance">${f.getIcon("appearance,🎨",{size:16})} Appearance</div>
      <div class="settings-nav-item" data-section="panel">${f.getIcon("panel-color,🚥",{size:16})} Panel</div>
      <div class="settings-nav-item" data-section="menu">${f.getIcon("menu-color,🌿",{size:16})} Menu</div>
      <div class="settings-nav-item" data-section="desktop">${f.getIcon("desktop,🖥️",{size:16})} Desktop</div>
      <div class="settings-nav-item" data-section="display">${f.getIcon("monitor-color,🖥️",{size:16})} Display</div>
      <div class="settings-nav-item" data-section="extensions">${f.getIcon("plugin-color,🧩",{size:16})} Extensions</div>
      <div class="settings-nav-item" data-section="startup">${f.getIcon("startup,🚀",{size:16})} Startup</div>
      <div class="settings-nav-item" data-section="storage">${f.getIcon("storage,💽",{size:16})} Storage</div>
      <div class="settings-nav-item" data-section="users">${f.getIcon("user-color,👥",{size:16})} Users</div>
      <div style="flex: 1;"></div>
      <div class="settings-nav-item" data-section="about">${f.getIcon("system-color,ℹ️",{size:16})} About</div>
    </div>
    <div id="settings-main" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
      <div id="settings-header" style="
        padding: 16px 24px;
        border-bottom: 1px solid var(--border);
        font-size: 18px;
        font-weight: 700;
        background: var(--bg-card);
      ">
        Settings
      </div>
      <div id="settings-body" style="flex: 1; overflow-y: auto; padding: 24px;">
        <!-- Dynamic content here -->
      </div>
    </div>
    <style>
      .settings-nav-item {
        padding: 10px 20px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      .settings-nav-item:hover {
        background: var(--bg-card-hover);
        color: var(--text-primary);
      }
      .settings-nav-item.active {
        background: rgba(var(--accent-rgb), 0.15);
        color: var(--text-primary);
        border-left-color: var(--accent);
      }
      .settings-section-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .settings-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-main);
        padding: 16px;
        margin-bottom: 20px;
      }
      .settings-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .settings-row:last-child { margin-bottom: 0; }

      .btn-secondary.active {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
      }
    </style>
  `;const E=F.createWindow({id:"system-settings",title:"System Settings",icon:"settings,⚙️",width:800,height:600,content:I,onClose:()=>{O==="menu"&&window.dispatchEvent(new CustomEvent("everest:close-menu"))}}),z=I.querySelector("#settings-sidebar"),X=I.querySelector("#settings-header"),i=I.querySelector("#settings-body"),K=I.querySelectorAll(".settings-nav-item"),Q=()=>{z.querySelector('[data-section="appearance"]').innerHTML=`${f.getIcon("appearance,🎨",{size:16})} Appearance`,z.querySelector('[data-section="panel"]').innerHTML=`${f.getIcon("panel-color,🚥",{size:16})} Panel`,z.querySelector('[data-section="menu"]').innerHTML=`${f.getIcon("menu-color,🌿",{size:16})} Menu`,z.querySelector('[data-section="desktop"]').innerHTML=`${f.getIcon("desktop,🖥️",{size:16})} Desktop`,z.querySelector('[data-section="display"]').innerHTML=`${f.getIcon("monitor-color,🖥️",{size:16})} Display`,z.querySelector('[data-section="extensions"]').innerHTML=`${f.getIcon("plugin-color,🧩",{size:16})} Extensions`,z.querySelector('[data-section="startup"]').innerHTML=`${f.getIcon("startup,🚀",{size:16})} Startup`,z.querySelector('[data-section="storage"]').innerHTML=`${f.getIcon("storage,💽",{size:16})} Storage`,z.querySelector('[data-section="users"]').innerHTML=`${f.getIcon("user-color,👥",{size:16})} Users`,z.querySelector('[data-section="about"]').innerHTML=`${f.getIcon("system-color,ℹ️",{size:16})} About`};window.addEventListener("icon-theme-changed",()=>{Q(),D(O)}),window.addEventListener("theme-changed",()=>{D(O)});let O=A,j=null;const J=async e=>{if(e==="menu"){window.dispatchEvent(new CustomEvent("everest:open-menu")),j||(j={left:E.frame.style.left,top:E.frame.style.top});try{const n=await x.readFile("~/.config/menu.json"),s=(n?JSON.parse(n):{menuWidth:420}).menuWidth||420;E.frame.style.left=s+60+"px";const c=window.innerWidth-E.frame.offsetWidth-20;parseFloat(E.frame.style.left)>c&&(E.frame.style.left=c+"px")}catch{E.frame.style.left="450px"}}else O==="menu"&&(window.dispatchEvent(new CustomEvent("everest:close-menu")),j&&(E.frame.style.left=j.left,E.frame.style.top=j.top,j=null));O=e,K.forEach(n=>{n.classList.toggle("active",n.dataset.section===e)}),X.textContent=e.charAt(0).toUpperCase()+e.slice(1),D(e)},Z=()=>{const e=document.documentElement,n={height:g.panelHeight!==void 0?g.panelHeight:48,blur:g.panelBlur!==void 0?g.panelBlur:20,opacity:g.panelOpacity!==void 0?g.panelOpacity:.92,marginY:g.panelMarginY!==void 0?g.panelMarginY:12,marginX:g.panelMarginX!==void 0?g.panelMarginX:60,radius:g.panelRadius!==void 0?g.panelRadius:12,color:g.panelColor||"#1e1e1e",borderColor:g.panelBorderColor||"#6496ff",borderOpacity:g.panelBorderOpacity!==void 0?g.panelBorderOpacity:.3};i.innerHTML=`
      <div class="settings-section-title">Behavior</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Panel Position</label>
          <select id="panel-position" style="background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px 10px; border-radius:6px; outline:none; width:120px;">
            <option value="bottom" ${!d.panelManager||d.panelManager.position==="bottom"?"selected":""}>Bottom</option>
            <option value="top" ${d.panelManager&&d.panelManager.position==="top"?"selected":""}>Top</option>
          </select>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row">
          <label>Auto-hide Panel</label>
          <input type="checkbox" id="panel-autohide" ${d.panelManager&&d.panelManager.autoHide?"checked":""}>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row">
          <label>Show App Name in Window List</label>
          <input type="checkbox" id="panel-show-app-name" ${d.panelManager&&d.panelManager.showAppName?"checked":""}>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="align-items:center;">
          <label style="flex:1;">App Icon Size <span style="font-size:12px; color:var(--text-tertiary); margin-left:8px;" id="val-panel-icon-size">${d.panelManager?d.panelManager.iconSize:16}px</span></label>
          <input type="range" id="panel-icon-size" min="12" max="32" step="2" value="${d.panelManager?d.panelManager.iconSize:16}" style="width:120px;">
        </div>
      </div>

      <div class="settings-section-title">Panel Mode</div>
      <div class="settings-card">
        <div style="display:flex; gap:10px;" id="panel-mode-group">
          <button class="btn-secondary btn-sm" style="flex:1;" data-mode="full">Traditional</button>
          <button class="btn-secondary btn-sm" style="flex:1;" data-mode="dock">Modern Dock</button>
        </div>
      </div>

      <div class="settings-section-title">Visuals</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Background Color</label>
            <input type="color" id="panel-color" value="${n.color}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Opacity</label>
            <span id="opacity-val">${Math.round(n.opacity*100)}%</span>
          </div>
          <input type="range" id="opacity-range" min="0" max="100" value="${Math.round(n.opacity*100)}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Transparency Blur</label>
            <span id="blur-val">${n.blur}px</span>
          </div>
          <input type="range" id="blur-range" min="0" max="64" value="${n.blur}" style="width:100%;">
        </div>
        <div style="height:12px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Border Color</label>
            <input type="color" id="border-color" value="${n.borderColor}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Border Opacity</label>
            <span id="border-opacity-val">${Math.round(n.borderOpacity*100)}%</span>
          </div>
          <input type="range" id="border-opacity" min="0" max="100" value="${Math.round(n.borderOpacity*100)}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Layout & Spacing</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Height</label>
            <span id="height-val">${n.height}px</span>
          </div>
          <input type="range" id="height-range" min="24" max="64" value="${n.height}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Edge Spacing (Elevate)</label>
            <span id="margin-y-val">${n.marginY}px</span>
          </div>
          <input type="range" id="margin-y-range" min="0" max="40" value="${n.marginY}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Side Spacing (Width)</label>
            <span id="margin-x-val">${n.marginX}px</span>
          </div>
          <input type="range" id="margin-x-range" min="0" max="300" step="10" value="${n.marginX}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Corner Rounding</label>
            <span id="radius-val">${n.radius}px</span>
          </div>
          <input type="range" id="radius-range" min="0" max="32" value="${n.radius}" style="width:100%;">
        </div>
      </div>
    `;const m=(t,a)=>{if(!t||!t.startsWith("#"))return t;const y=parseInt(t.slice(1,3),16)||0,$=parseInt(t.slice(3,5),16)||0,b=parseInt(t.slice(5,7),16)||0;return`rgba(${y}, ${$}, ${b}, ${a})`},s=async(t,a)=>{g[t]=a,await W(),t==="panelRadius"?e.style.setProperty("--panel-radius",a+"px"):t==="panelBlur"?e.style.setProperty("--panel-blur",a+"px"):t==="panelOpacity"||t==="panelColor"?e.style.setProperty("--bg-panel-rgba",m(g.panelColor||"#1e1e1e",g.panelOpacity!==void 0?g.panelOpacity:.92)):t==="panelHeight"?(e.style.setProperty("--panel-height",a+"px"),d.panelManager&&(d.panelManager.height=parseInt(a))):t==="panelMarginY"?e.style.setProperty("--panel-margin-y",a+"px"):t==="panelMarginX"?e.style.setProperty("--panel-margin-x",a+"px"):(t==="panelBorderColor"||t==="panelBorderOpacity")&&e.style.setProperty("--panel-border-rgba",m(g.panelBorderColor||"#6496ff",g.panelBorderOpacity!==void 0?g.panelBorderOpacity:.3))},c=i.querySelector("#panel-position");c&&c.addEventListener("change",t=>{d.panelManager&&(d.panelManager.position=t.target.value)});const v=i.querySelector("#panel-autohide");v&&v.addEventListener("change",t=>{d.panelManager&&(d.panelManager.autoHide=t.target.checked)});const r=i.querySelector("#panel-show-app-name");r&&r.addEventListener("change",t=>{d.panelManager&&(d.panelManager.showAppName=t.target.checked)});const o=i.querySelector("#panel-icon-size");o&&o.addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#val-panel-icon-size").textContent=a+"px",d.panelManager&&(d.panelManager.iconSize=a)}),i.querySelector("#panel-color").addEventListener("input",t=>s("panelColor",t.target.value)),i.querySelector("#opacity-range").addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#opacity-val").textContent=a+"%",s("panelOpacity",a/100)}),i.querySelector("#blur-range").addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#blur-val").textContent=a+"px",s("panelBlur",a)}),i.querySelector("#border-color").addEventListener("input",t=>s("panelBorderColor",t.target.value)),i.querySelector("#border-opacity").addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#border-opacity-val").textContent=a+"%",s("panelBorderOpacity",a/100)}),i.querySelector("#height-range").addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#height-val").textContent=a+"px",s("panelHeight",a)});const p=i.querySelector("#margin-y-range"),h=i.querySelector("#margin-x-range"),u=()=>{const t=document.getElementById("everest-panel");t&&t.classList.toggle("is-dock",parseInt(p.value)>0||parseInt(h.value)>0)};p.addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#margin-y-val").textContent=a+"px",s("panelMarginY",a),u()}),h.addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#margin-x-val").textContent=a+"px",s("panelMarginX",a),u()}),i.querySelector("#radius-range").addEventListener("input",t=>{const a=parseInt(t.target.value);i.querySelector("#radius-val").textContent=a+"px",s("panelRadius",a)});const S=i.querySelector("#panel-mode-group"),l=()=>{const t=parseInt(p.value)>0||parseInt(h.value)>0;S.querySelectorAll("button").forEach(a=>{const y=a.dataset.mode==="dock"&&t||a.dataset.mode==="full"&&!t;a.className=y?"btn-primary btn-sm":"btn-secondary btn-sm"})};l(),S.querySelectorAll("button").forEach(t=>{t.onclick=()=>{const a=i.querySelector("#height-range"),y=i.querySelector("#radius-range");t.dataset.mode==="full"?(p.value=0,h.value=0,a.value=42,y.value=0):(p.value=12,h.value=60,a.value=48,y.value=12),p.dispatchEvent(new Event("input")),h.dispatchEvent(new Event("input")),a.dispatchEvent(new Event("input")),y.dispatchEvent(new Event("input")),l()}})},D=async e=>{i.innerHTML="",e==="appearance"?R():e==="panel"?Z():e==="menu"?await se():e==="desktop"?await oe():e==="display"?re():e==="extensions"?le():e==="startup"?await ee():e==="storage"?await ae():e==="users"?de():e==="about"&&ce()},ee=async()=>{i.innerHTML=`
      <div class="settings-section-title">Startup Applications</div>
      <div id="startup-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;const e=i.querySelector("#startup-list");let n=[];try{const c=await x.readFile("~/.config/startup.json");c&&(n=JSON.parse(c))}catch{}const m=V.getApps();(()=>{e.innerHTML="",m.forEach(c=>{const v=n.includes(c.id),r=document.createElement("div");r.className="settings-card",r.style.margin="0",r.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="font-size:24px;">${f.getIcon((c.icon||"archive")+",📦",{size:24})}</div>
              <div>
                <div style="font-weight:600;">${c.name}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${c.id}</div>
              </div>
            </div>
            <input type="checkbox" ${v?"checked":""} id="toggle-${c.id}">
          </div>
        `,r.querySelector("input").onchange=async o=>{o.target.checked?n.includes(c.id)||n.push(c.id):n=n.filter(p=>p!==c.id),await x.writeFile("~/.config/startup.json",JSON.stringify(n))},e.appendChild(r)})})()},U={storageLimitServer:2147483648,storageLimitLocal:104857600},te=async()=>{const e=[],n=async m=>{try{const s=await x.readdir(m);for(const c of s)if(c.type==="dir")e.push({path:c.path,type:"dir"}),await n(c.path);else try{const v=await x.readFile(c.path);e.push({path:c.path,type:"file",content:v,size:v.length})}catch{}}catch{}};return await n("/"),{version:"1.0",os:"EverestOS",timestamp:new Date().toISOString(),fileCount:e.length,files:e}},ie=async e=>await x.importBackup(e),ne=async()=>{try{const e=await x.getInfo();if(e&&e.root!=="browser-storage")return{mode:"server",label:"Server File System",color:"#44ff44",persistent:!0}}catch{}return x.db?{mode:"indexeddb",label:"IndexedDB (Browser Storage)",color:"#ffaa00",persistent:!1}:x.useLocalStorage?{mode:"localstorage",label:"LocalStorage",color:"#ff6644",persistent:!1}:{mode:"memory",label:"In-Memory (Volatile)",color:"#ff4444",persistent:!1}},ae=async()=>{var $;const n=(await x.getInfo()).root!=="browser-storage",m=await ne(),s=b=>b>=1024*1024*1024?(b/1024/1024/1024).toFixed(1)+" GB":b>=1024*1024?(b/1024/1024).toFixed(0)+" MB":b>=1024?(b/1024).toFixed(0)+" KB":b+" B";i.innerHTML=`
      <div class="settings-section-title">Virtual File System</div>
      <div class="settings-card">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Disk Usage</span>
          <span id="storage-val" style="font-family:var(--font-mono); font-size:12px;">Calculating...</span>
        </div>
        <div style="height:10px; background:var(--bg-active); border-radius:5px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.3);">
          <div id="storage-bar" style="height:100%; width:0%; background:linear-gradient(90deg, var(--accent), ${m.color}); transition:width 0.8s cubic-bezier(0.4,0,0.2,1);"></div>
        </div>

        <div style="margin-top:16px; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
            <div style="width:10px; height:10px; border-radius:50%; background:${m.color}; box-shadow:0 0 8px ${m.color};"></div>
            <div>
              <div style="font-size:13px; font-weight:600;">Active Backend: ${m.label}</div>
              <div style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">
                ${m.persistent?"✅ Files persist on disk — safe across reloads and browser clears":"⚠️ Files stored in browser — survive reload, but may be lost if browser data is cleared"}
              </div>
            </div>
          </div>
          <div id="storage-file-count" style="font-size:11px; color:var(--text-secondary); padding:0 4px;">Counting files...</div>
        </div>
      </div>

      ${n?"":`
      <div class="settings-section-title">Storage Quota</div>
      <div class="settings-card" style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; font-weight:600;">Browser Quota</span>
          <span id="quota-val" style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);">Checking...</span>
        </div>
        <div style="height:8px; background:var(--bg-active); border-radius:4px; overflow:hidden;">
          <div id="quota-bar" style="height:100%; width:0%; background:linear-gradient(90deg, #22c55e, #3b82f6); transition:width 0.8s;"></div>
        </div>
        <div id="quota-detail" style="font-size:11px; color:var(--text-tertiary);"></div>
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
          <div>
            <div style="font-size:12px; font-weight:600;">Persistent Storage</div>
            <div style="font-size:10px; color:var(--text-tertiary); margin-top:2px;">Prevents browser from auto-clearing your files</div>
          </div>
          <button id="btn-persist" class="btn-secondary btn-sm" style="padding:6px 14px; font-size:11px;">Enable</button>
        </div>
      </div>
      `}

      <div class="settings-section-title">Backup & Recovery</div>
      <div class="settings-card" style="display:flex; flex-direction:column; gap:12px;">
        <p style="font-size:12px; color:var(--text-secondary); margin:0;">
          Export a portable backup that works across all storage modes. A backup from IndexedDB can be restored to Server FS and vice versa.
        </p>
        <div style="display:flex; gap:12px;">
          <button id="btn-export-vfs" class="btn-secondary" style="flex:1; padding:10px; display:flex; align-items:center; justify-content:center; gap:8px;">📤 Export Backup</button>
          <button id="btn-import-vfs" class="btn-secondary" style="flex:1; padding:10px; display:flex; align-items:center; justify-content:center; gap:8px;">📥 Import Backup</button>
        </div>
        <div id="backup-status" style="font-size:11px; color:var(--text-tertiary); display:none; padding:8px 12px; background:rgba(0,0,0,0.1); border-radius:6px;"></div>
        <input type="file" id="import-vfs-file" style="display:none;" accept=".json">
      </div>

      ${n?"":`
      <div class="settings-section-title" style="color:#ff4444;">Reset & Recovery</div>
      <div class="settings-card" style="border:1px solid rgba(255,68,68,0.3); display:flex; flex-direction:column; gap:12px;">
        <p style="font-size:12px; color:var(--text-secondary); margin:0;">
          Accidentally deleted an important system file? Reset will restore the original system image. All your custom files, settings, and modifications will be removed.
        </p>
        <div style="background:rgba(255,170,0,0.1); border:1px solid rgba(255,170,0,0.3); border-radius:8px; padding:12px; display:flex; align-items:center; gap:10px;">
          <span style="font-size:18px;">⚠️</span>
          <span style="font-size:11px; color:var(--text-secondary);">We recommend exporting a backup before resetting. Use the <strong>Export Backup</strong> button above to save your files first.</span>
        </div>
        <button id="btn-reset-system" class="btn-danger" style="width:100%; padding:10px;">🔄 Reset System & Fetch Fresh</button>
      </div>
      `}
    `;const c=i.querySelector("#storage-val"),v=i.querySelector("#storage-bar"),r=i.querySelector("#storage-file-count"),o=i.querySelector("#backup-status"),p=b=>{o.style.display="block",o.textContent=b};(async()=>{var C;let b=0,q=0;const w=async H=>{try{const P=await x.readdir(H);for(const N of P)N.type==="dir"?await w(N.path):(b+=N.size||0,q++)}catch{}};await w("/");let L=n?U.storageLimitServer:U.storageLimitLocal;if(!n&&((C=navigator.storage)!=null&&C.estimate))try{const H=await navigator.storage.estimate();H.quota&&(L=H.quota)}catch{}const M=Math.min(100,b/L*100);c.textContent=`${(b/1024/1024).toFixed(2)} MB of ${s(L)} used`,v.style.width=M+"%",r.textContent=`${q} files indexed`})();const u=i.querySelector("#quota-val"),S=i.querySelector("#quota-bar"),l=i.querySelector("#quota-detail"),t=i.querySelector("#btn-persist");u&&(($=navigator.storage)!=null&&$.estimate)&&(async()=>{try{const b=await navigator.storage.estimate(),q=b.usage||0,w=b.quota||0,L=w>0?Math.min(100,q/w*100):0;u.textContent=`${s(q)} / ${s(w)}`,S.style.width=L.toFixed(1)+"%",l.textContent=`${s(w-q)} available · Browser allocates quota based on your free disk space`}catch{u.textContent="Not available"}})(),t&&((async()=>{try{await navigator.storage.persisted()&&(t.textContent="✅ Enabled",t.disabled=!0,t.style.opacity="0.7")}catch{}})(),t.onclick=async()=>{try{await navigator.storage.persist()?(t.textContent="✅ Enabled",t.disabled=!0,t.style.opacity="0.7"):(t.textContent="❌ Denied by browser",setTimeout(()=>{t.textContent="Try Again"},2e3),alert("Your browser denied the request to make storage persistent.\\n\\nBrowsers usually require you to bookmark the page, install it as a Web App (PWA), or interact with it more before granting this permission.\\n\\nTry bookmarking the page and trying again!"))}catch{t.textContent="❌ Not supported"}}),i.querySelector("#btn-export-vfs").onclick=async()=>{try{p("⏳ Collecting files...");const b=await te(),q=JSON.stringify(b,null,2),w=new Blob([q],{type:"application/json"}),L=URL.createObjectURL(w),M=document.createElement("a");M.href=L,M.download=`everest-backup-${new Date().toISOString().split("T")[0]}.json`,M.click(),URL.revokeObjectURL(L),p(`✅ Backup downloaded — ${b.fileCount} files, ${(w.size/1024).toFixed(1)} KB`)}catch(b){p(`❌ Export failed: ${b.message}`)}};const a=i.querySelector("#import-vfs-file");i.querySelector("#btn-import-vfs").onclick=()=>a.click(),a.onchange=async b=>{const q=b.target.files[0];if(!q)return;const w=new FileReader;w.onload=async L=>{try{const M=JSON.parse(L.target.result);let C;if(Array.isArray(M))C={files:M,timestamp:"legacy",os:"unknown"};else if(M.files)C=M;else throw new Error("Invalid backup format");if(confirm(`Restore ${C.files.length} items from ${C.os||"unknown"} (${C.timestamp||"unknown"})? This will write files to the active storage backend.`)){p("⏳ Restoring files...");const{restored:H,errors:P}=await ie(C);p(`✅ Restored ${H} items${P>0?`, ${P} errors`:""}. Reloading...`),setTimeout(()=>location.reload(),1500)}}catch(M){p(`❌ Import failed: ${M.message}`)}},w.readAsText(q)};const y=i.querySelector("#btn-reset-system");y&&(y.onclick=async()=>{if(confirm(`This will erase ALL local data (files, settings, plugins) and re-download the original system image.

⚠️ Have you exported a backup? This cannot be undone.`)){y.disabled=!0,y.textContent="⏳ Clearing & re-fetching...";try{await x.wipe(),location.reload()}catch{y.disabled=!1,y.textContent="❌ Failed — try again"}}})},se=async()=>{let e={icon:"menu",showLabel:!0,menuWidth:420,menuOpacity:.85,menuBlur:20,showCategoryIcons:!0,enableSearch:!0,iconSize:28};try{const o=await x.readFile("~/.config/menu.json");o&&(e={...e,...JSON.parse(o)})}catch{}const n=async()=>{await x.writeFile("~/.config/menu.json",JSON.stringify(e,null,2)),document.dispatchEvent(new CustomEvent("reload-menu-settings"))};i.innerHTML=`
      <div class="settings-section-title">Menu Button</div>
      <div class="settings-card">
        <div class="settings-row" style="align-items:center; margin-bottom:12px;">
          <div style="flex:1;">
            <label style="display:block; margin-bottom:4px;">Menu Icon</label>
            <div style="font-size:11px; color:var(--text-secondary);">Choose an emoji or custom image</div>
          </div>
          <div id="icon-preview" style="width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:var(--bg-surface-hover); border:1px solid var(--border); border-radius:10px; cursor:pointer; font-size:24px; transition:all 0.2s;"></div>
        </div>

        <div id="icon-selector" style="display:none; border-top:1px solid var(--border); padding-top:16px; margin-top:16px;">
          <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; margin-bottom:16px;" id="emoji-grid">
            ${["🌿","🔮","🍉","🍕","🚀","⭐","🌈","🔥","⚙️","🖥️","🐧","🛸","🍎","🍓","🏀","🎮","💡","🔔"].map(o=>`<div class="emoji-item" style="font-size:20px; cursor:pointer; padding:8px; text-align:center; border-radius:8px; background:var(--bg-surface-hover); border:1px solid var(--border);">${o}</div>`).join("")}
          </div>

          <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Custom Icons (~/images/icons)</div>
          <div id="custom-icon-grid" style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; margin-bottom:16px;"></div>

          <button class="btn-secondary" style="width:100%;" id="btn-browse-custom">Browse for other image...</button>
          <div style="height:8px;"></div>
          <button class="btn-secondary" style="width:100%; color:var(--accent);" id="btn-theme-default">Use Theme Default</button>
        </div>

        <div style="height:1px; background:var(--border); margin:16px 0;"></div>

        <div class="settings-row">
          <label>Show Text Label</label>
          <input type="checkbox" id="show-label" ${e.showLabel!==!1?"checked":""}>
        </div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px; margin-top:12px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Icon Size</label>
            <span id="icon-size-val">${e.iconSize}px</span>
          </div>
          <input type="range" id="icon-size-range" min="16" max="48" value="${e.iconSize}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Menu Appearance</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:12px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Menu Width</label>
            <span id="width-val">${e.menuWidth}px</span>
          </div>
          <input type="range" id="width-range" min="320" max="640" value="${e.menuWidth}" style="width:100%;">

          <div style="height:8px;"></div>

          <div style="display:flex; justify-content:space-between;">
            <label>Background Blur</label>
            <span id="menu-blur-val">${e.menuBlur}px</span>
          </div>
          <input type="range" id="menu-blur-range" min="0" max="64" value="${e.menuBlur}" style="width:100%;">

          <div style="height:8px;"></div>

          <div style="display:flex; justify-content:space-between;">
            <label>Background Opacity</label>
            <span id="menu-opacity-val">${Math.round(e.menuOpacity*100)}%</span>
          </div>
          <input type="range" id="menu-opacity-range" min="40" max="100" value="${Math.round(e.menuOpacity*100)}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Features</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Enable Search</label>
          <input type="checkbox" id="enable-search" ${e.enableSearch!==!1?"checked":""}>
        </div>
        <div class="settings-row">
          <label>Show Categories</label>
          <input type="checkbox" id="show-categories" ${e.showCategoryIcons!==!1?"checked":""}>
        </div>
      </div>
    `;const m=i.querySelector("#icon-preview"),s=i.querySelector("#icon-selector"),c=i.querySelector("#custom-icon-grid"),v=()=>{const o=e.icon;m.innerHTML=f.getIcon(o,{size:28})};v(),m.onclick=()=>{const o=s.style.display==="block";s.style.display=o?"none":"block",m.style.borderColor=o?"var(--border)":"var(--accent)",o||r()};const r=async()=>{c.innerHTML='<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">Scanning...</div>';try{const o=["/system/icons","~/images/icons"];let p=[];for(const h of o)try{const u=await x.readdir(h);p.push(...u)}catch{}c.innerHTML="",p.forEach(h=>{if(h.type==="dir"||!h.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))return;const u=document.createElement("div");u.style.cssText=`
            height: 40px;
            border-radius: 6px;
            background: var(--bg-surface-hover);
            border: 1px solid var(--border);
            cursor: pointer;
            background-image: url("${x.getFsPath(h.path||"/system/icons/"+h.name)}");
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
          `,u.onclick=()=>{e.icon=h.path||"/system/icons/"+h.name,v(),n()},c.appendChild(u)}),p.length===0&&(c.innerHTML='<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">No custom icons found</div>')}catch{c.innerHTML='<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">Failed to scan icons</div>'}};i.querySelectorAll(".emoji-item").forEach(o=>{o.onclick=()=>{e.icon=o.textContent,v(),n()}}),i.querySelector("#btn-browse-custom").onclick=async()=>{const o=await d.filePicker.pickFile({title:"Select Menu Icon",initialPath:"~/images/icons",filter:p=>p.type==="dir"||p.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)});o&&(e.icon=o,v(),n())},i.querySelector("#btn-theme-default").onclick=()=>{e.icon="menu",v(),n()},i.querySelector("#show-label").onchange=o=>{e.showLabel=o.target.checked,n()},i.querySelector("#icon-size-range").oninput=o=>{const p=o.target.value;e.iconSize=parseInt(p),i.querySelector("#icon-size-val").textContent=p+"px",n()},i.querySelector("#width-range").oninput=o=>{const p=o.target.value;e.menuWidth=parseInt(p),i.querySelector("#width-val").textContent=p+"px",n()},i.querySelector("#menu-blur-range").oninput=o=>{const p=o.target.value;e.menuBlur=parseInt(p),i.querySelector("#menu-blur-val").textContent=p+"px",n()},i.querySelector("#menu-opacity-range").oninput=o=>{const p=o.target.value;e.menuOpacity=parseInt(p)/100,i.querySelector("#menu-opacity-val").textContent=p+"%",n()},i.querySelector("#enable-search").onchange=o=>{e.enableSearch=o.target.checked,n()},i.querySelector("#show-categories").onchange=o=>{e.showCategoryIcons=o.target.checked,n()}},R=()=>{const e={shellTheme:g.shellTheme||"dark",appTheme:g.appTheme||"dark",ctxColor:g.contextMenuColor||"#19191e",ctxOpacity:g.contextMenuOpacity!==void 0?g.contextMenuOpacity:.97,ctxBlur:g.contextMenuBlur!==void 0?g.contextMenuBlur:24,radius:g.panelRadius||10},n=k.currentTheme.replace("-dark",""),m=k.themes.has(n)&&k.themes.has(`${n}-dark`);i.innerHTML=`
      <div class="settings-section-title">Desktop Skin</div>
      <div id="theme-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:16px; margin-bottom:16px;"></div>

      <div class="settings-card" style="margin-bottom:24px;">
        <div class="settings-row">
          <label style="font-weight:600; font-size:12px; color:var(--text-secondary); text-transform:uppercase;">Global Appearance</label>
          <div style="display:flex; gap:10px; background:var(--bg-input); padding:4px; border-radius:8px; border:1px solid var(--border); ${m?"":"opacity:0.5; pointer-events:none; filter:grayscale(1);"}" id="master-mode-group">
            <button class="btn-sm ${k.preferredMode==="light"?"btn-primary":"btn-secondary"}" style="flex:1; border:none;" data-mode="light">Light</button>
            <button class="btn-sm ${k.preferredMode==="dark"?"btn-primary":"btn-secondary"}" style="flex:1; border:none;" data-mode="dark">Dark</button>
          </div>
        </div>
        <div style="margin-top:10px; font-size:11px; color:var(--text-tertiary); display:flex; align-items:center; gap:6px;">
          ${f.getIcon("info,ℹ️",{size:14,symbolic:!0})}
          <span>${m?"Automatically switches both desktop skin and icons to their preferred variant.":"The current theme does not support adaptive mode switching."}</span>
        </div>
      </div>

      <div class="settings-section-title">Icon Theme</div>
      <div id="icon-theme-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:16px; margin-bottom:24px;"></div>
      <div class="settings-section-title">Context Menu Styles</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Background Color</label>
            <input type="color" id="ctx-color" value="${e.ctxColor}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Opacity</label>
            <span id="ctx-opacity-val">${Math.round(e.ctxOpacity*100)}%</span>
          </div>
          <input type="range" id="ctx-opacity" min="0" max="100" value="${Math.round(e.ctxOpacity*100)}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Blur</label>
            <span id="ctx-blur-val">${e.ctxBlur}px</span>
          </div>
          <input type="range" id="ctx-blur" min="0" max="64" value="${e.ctxBlur}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">General Effects</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Corner Radius</label>
            <span id="radius-val">${e.radius}px</span>
          </div>
          <input type="range" id="radius-range" min="0" max="32" value="${e.radius}" style="width:100%;">
        </div>
      </div>
    `;const s=document.documentElement,c=(l,t)=>{if(!l.startsWith("#"))return l;const a=parseInt(l.slice(1,3),16)||0,y=parseInt(l.slice(3,5),16)||0,$=parseInt(l.slice(5,7),16)||0;return`rgba(${a}, ${y}, ${$}, ${t})`};i.querySelector("#master-mode-group").querySelectorAll("button").forEach(l=>{l.onclick=()=>{const t=l.dataset.mode;k.setMode(t),R()}});const r=async(l,t)=>{g[l]=t,await W(),l==="contextMenuColor"||l==="contextMenuOpacity"?g.appTheme!=="light"&&s.style.setProperty("--bg-context-menu-rgba",c(g.contextMenuColor||"#19191e",g.contextMenuOpacity!==void 0?g.contextMenuOpacity:.97)):l==="contextMenuBlur"?s.style.setProperty("--context-menu-blur",t+"px"):l==="panelRadius"&&(s.style.setProperty("--radius-main",t+"px"),s.style.setProperty("--radius-md",t+"px"))};i.querySelector("#ctx-color").addEventListener("input",l=>r("contextMenuColor",l.target.value)),i.querySelector("#ctx-opacity").addEventListener("input",l=>{const t=parseInt(l.target.value);i.querySelector("#ctx-opacity-val").textContent=t+"%",r("contextMenuOpacity",t/100)}),i.querySelector("#ctx-blur").addEventListener("input",l=>{const t=parseInt(l.target.value);i.querySelector("#ctx-blur-val").textContent=t+"px",r("contextMenuBlur",t)}),i.querySelector("#radius-range").addEventListener("input",l=>{const t=parseInt(l.target.value);i.querySelector("#radius-val").textContent=t+"px",r("panelRadius",t)});const p=i.querySelector("#theme-grid"),h=()=>{p.innerHTML="";const l=k.getThemes();l.filter(a=>{if(a.id.endsWith("-dark")){const y=a.id.replace("-dark","");return!l.some($=>$.id===y)}return!0}).forEach(a=>{const y=document.createElement("div"),$=k.currentTheme===a.id||k.currentTheme===`${a.id}-dark`,q=k.preferredMode==="dark"&&k.themes.has(`${a.id}-dark`)?`${a.id}-dark`:a.id,w=k.themes.get(q)||a,L=w.variables["--bg-surface-rgb"]?`rgb(${w.variables["--bg-surface-rgb"]})`:w.mode==="light"?"#f0f0f0":"#1e1e1e",M=w.variables["--text-primary-rgb"]?`rgb(${w.variables["--text-primary-rgb"]})`:w.mode==="light"?"#222":"#eee",C=w.variables["--accent-rgb"]?`rgb(${w.variables["--accent-rgb"]})`:"#3584e4";y.style.cssText=`
          background: ${L};
          color: ${M};
          border: 2px solid ${$?"var(--accent)":"rgba(0,0,0,0.1)"};
          border-radius: 14px;
          padding: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${$?"0 8px 24px rgba(0,0,0,0.3)":"0 2px 8px rgba(0,0,0,0.1)"};
          transform: ${$?"scale(1.05)":"scale(1)"};
          position: relative;
          overflow: hidden;
        `,y.innerHTML=`
          <div style="width:100%; height:60px; background:${C}; border-radius:8px; position:relative; overflow:hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.1);">
            <div style="position:absolute; bottom:0; left:0; right:0; height:12px; background:rgba(0,0,0,0.2); backdrop-filter:blur(4px);"></div>
            <div style="position:absolute; top:8px; left:8px; width:24px; height:4px; background:rgba(255,255,255,0.3); border-radius:2px;"></div>
          </div>
          <span style="font-size:11px; font-weight:700; text-align:center; letter-spacing:0.3px;">${a.name.replace("-Dark","").replace("-Y","Y")}</span>
          ${$?'<div style="position:absolute; top:6px; right:6px; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow: 0 0 8px var(--accent);"></div>':""}
        `,y.onmouseover=()=>{$||(y.style.transform="translateY(-4px)")},y.onmouseout=()=>{$||(y.style.transform="scale(1)")},y.addEventListener("click",()=>{k.applyTheme(a.id,{ignoreMode:!1}),R()}),p.appendChild(y)})},u=i.querySelector("#icon-theme-grid"),S=()=>{u.innerHTML="",k.getIconThemes().forEach(l=>{const t=document.createElement("div"),a=k.currentIconTheme===l.id;t.style.cssText=`
          background: var(--bg-card);
          border: 2px solid ${a?"var(--accent)":"var(--border)"};
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${a?"0 8px 24px rgba(0,0,0,0.15)":"none"};
          transform: ${a?"scale(1.05)":"scale(1)"};
          position: relative;
        `;const y=f.getIcon("folder,📁",{size:32});t.innerHTML=`
          <div style="width:100%; height:60px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg, var(--bg-elevated), var(--bg-card)); border-radius:10px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);">
            ${y}
          </div>
          <span style="font-size:11px; font-weight:700; color:var(--text-primary);">${l.name}</span>
          ${a?'<div style="position:absolute; top:8px; right:8px; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow: 0 0 8px var(--accent);"></div>':""}
        `,t.onmouseover=()=>{a||(t.style.transform="translateY(-4px)")},t.onmouseout=()=>{a||(t.style.transform="scale(1)")},t.addEventListener("click",()=>{k.applyIconTheme(l.id),S(),window.dispatchEvent(new CustomEvent("icon-theme-changed",{detail:{theme:l}}))}),u.appendChild(t)})};h(),S()},oe=async()=>{i.innerHTML=`
      <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid var(--border); padding-bottom:8px;">
        <button class="btn-secondary btn-sm active" id="tab-bg">Background</button>
        <button class="btn-secondary btn-sm" id="tab-icons">Icons & Layout</button>
      </div>
      <div id="desktop-content"></div>
    `;const e=i.querySelector("#desktop-content"),n=i.querySelector("#tab-bg"),m=i.querySelector("#tab-icons"),s=async()=>{e.innerHTML=`
        <div class="settings-section-title">Solid & Gradients</div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:20px;" id="grad-grid"></div>

        <div class="settings-section-title">Wallpapers</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:20px;" id="wallpaper-grid"></div>

        <button class="btn-secondary" style="width:100%;" id="btn-browse-bg">Browse for image...</button>
      `;const v=e.querySelector("#grad-grid");["linear-gradient(135deg, #2c3e50, #3498db)","linear-gradient(135deg, #1e130c, #9a8478)","linear-gradient(135deg, #43cea2, #185a9d)","linear-gradient(135deg, #ff4b1f, #ff9068)","#242424","#1a1a1a","#3584e4","#26a269"].forEach(h=>{const u=document.createElement("div");u.style.height="50px",u.style.borderRadius="6px",u.style.background=h,u.style.cursor="pointer",u.style.border="2px solid transparent",u.onclick=()=>{d.desktopSettings.settings.background=h,d.desktopSettings._applyBackground(),d.desktopSettings._save(),v.querySelectorAll("div").forEach(S=>S.style.borderColor="transparent"),u.style.borderColor="var(--accent)"},v.appendChild(u)});const o=e.querySelector("#wallpaper-grid"),p=async()=>{o.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-tertiary);">Scanning for images...</div>';const h=["/system/backgrounds","~/images/backgrounds"];let u=[];for(const S of h)try{(await x.readdir(S)).forEach(t=>{if(t.type!=="dir"&&t.name.match(/\.(png|jpg|jpeg|webp)$/i)){let a=t.path||`${S}/${t.name}`;const y=x.getFsPath(a);u.push({name:t.name,path:y})}})}catch(l){console.warn(`Failed to scan wallpapers in ${S}`,l)}if(o.innerHTML="",u.length===0){o.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-tertiary);">No backgrounds found.</div>';return}u.forEach(S=>{const l=document.createElement("div");l.className="wallpaper-item",l.style.cssText=`
            height: 100px;
            border-radius: 6px;
            background-image: url("${S.path}");
            background-size: cover;
            background-position: center;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
          `,d.desktopSettings.settings.background.includes(S.path)&&(l.style.borderColor="var(--accent)"),l.onclick=()=>{d.desktopSettings.settings.background=`url("${S.path}")`,d.desktopSettings._applyBackground(),d.desktopSettings._save(),o.querySelectorAll(".wallpaper-item").forEach(t=>t.style.borderColor="transparent"),l.style.borderColor="var(--accent)"},o.appendChild(l)})};p(),e.querySelector("#btn-browse-bg").addEventListener("click",async()=>{const h=await d.filePicker.pickFile({title:"Select Background Image",initialPath:"~/images/backgrounds",filter:u=>u.type==="dir"||u.name.match(/\.(png|jpg|jpeg|webp)$/i)});h&&(d.desktopSettings.settings.background=`url("${h}")`,d.desktopSettings._applyBackground(),d.desktopSettings._save(),p())})},c=()=>{const v=d.desktopSettings.settings;e.innerHTML=`
        <div class="settings-section-title">Icon Settings</div>
        <div class="settings-card">
          <div class="settings-row">
            <label>Grid Size</label>
            <input type="range" id="grid-size" min="60" max="140" value="${v.gridSize||90}">
          </div>
          <div class="settings-row">
            <label>Icon Size</label>
            <input type="range" id="icon-size" min="24" max="64" value="${v.iconSize||32}">
          </div>
        </div>

        <div class="settings-section-title">Visibility</div>
        <div class="settings-card">
          <div class="settings-row">
            <label>Show Home folder</label>
            <input type="checkbox" id="show-home" ${v.showHome!==!1?"checked":""}>
          </div>
          <div class="settings-row">
            <label>Show Computer</label>
            <input type="checkbox" id="show-computer" ${v.showComputer!==!1?"checked":""}>
          </div>
          <div class="settings-row">
            <label>Show Trash</label>
            <input type="checkbox" id="show-trash" ${v.showTrash!==!1?"checked":""}>
          </div>
        </div>
      `,e.querySelector("#grid-size").oninput=r=>{v.gridSize=parseInt(r.target.value),d.desktopSettings._save(),d.vfs._emit("/home/user/Desktop")},e.querySelector("#icon-size").oninput=r=>{v.iconSize=parseInt(r.target.value),d.desktopSettings._save(),d.vfs._emit("/home/user/Desktop")},e.querySelector("#show-home").onchange=r=>{v.showHome=r.target.checked,d.desktopSettings._save(),d.vfs._emit("/home/user/Desktop")},e.querySelector("#show-computer").onchange=r=>{v.showComputer=r.target.checked,d.desktopSettings._save(),d.vfs._emit("/home/user/Desktop")},e.querySelector("#show-trash").onchange=r=>{v.showTrash=r.target.checked,d.desktopSettings._save(),d.vfs._emit("/home/user/Desktop")}};n.onclick=()=>{n.classList.add("active"),m.classList.remove("active"),s()},m.onclick=()=>{m.classList.add("active"),n.classList.remove("active"),c()},T.args&&T.args[1]==="icons"?m.onclick():await s()},re=async()=>{let e={scaling:"100%",nightLight:!1};try{const r=await x.readFile("~/.config/display.json");r&&(e=JSON.parse(r))}catch{}const n=async()=>{await x.writeFile("~/.config/display.json",JSON.stringify(e))};i.innerHTML=`
      <div class="settings-section-title">Monitor & Resolution</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Display Scaling</label>
          <select id="scaling-select" style="background:var(--bg-input); border:1px solid var(--border); color:white; padding:4px 8px; border-radius:4px;">
            <option value="100%" ${e.scaling==="100%"?"selected":""}>100% (Default)</option>
            <option value="110%" ${e.scaling==="110%"?"selected":""}>110%</option>
            <option value="125%" ${e.scaling==="125%"?"selected":""}>125%</option>
            <option value="150%" ${e.scaling==="150%"?"selected":""}>150%</option>
          </select>
        </div>
        <div class="settings-row">
          <label>Night Light</label>
          <input type="checkbox" id="night-light-toggle" ${e.nightLight?"checked":""}>
        </div>
      </div>

      <div class="settings-section-title">Panel Position</div>
      <div class="settings-card">
        <div style="display:flex; gap:10px;" id="panel-pos-group">
          <button class="btn-secondary btn-sm" style="flex:1;" data-pos="top">Top</button>
          <button class="btn-secondary btn-sm" style="flex:1;" data-pos="bottom">Bottom</button>
        </div>
      </div>
    `;const m=i.querySelector("#scaling-select");m.onchange=r=>{e.scaling=r.target.value;const o=parseInt(r.target.value)/100;document.documentElement.style.setProperty("--system-scale",o),n()};const s=i.querySelector("#night-light-toggle");s.onchange=r=>{e.nightLight=r.target.checked,document.body.classList.toggle("night-light",e.nightLight),n()};const c=i.querySelector("#panel-pos-group"),v=()=>{c.querySelectorAll("button").forEach(r=>{const o=r.dataset.pos===_.position;r.className=o?"btn-primary btn-sm":"btn-secondary btn-sm"})};v(),c.querySelectorAll("button").forEach(r=>{r.onclick=()=>{_.position=r.dataset.pos,v()}})},le=()=>{i.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div class="settings-section-title" style="margin-bottom:0;">Plugins & Extensions</div>
        <button id="btn-refresh-plugins" class="btn-secondary btn-sm">↻ Refresh</button>
      </div>
      <div id="extensions-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;const e=i.querySelector("#extensions-list"),n=async()=>{e.innerHTML='<div style="text-align:center; padding:20px; color:var(--text-tertiary);">Scanning...</div>';const m=await B.discover();e.innerHTML="",m.forEach(s=>{var S;const c=document.createElement("div");c.className="settings-card",c.style.margin="0";const v=s.type.slice(0,-1),r=s.type==="applets"?"#26a269":s.type==="desklets"?"#3584e4":"#9141ac",o=(S=s.metadata)!=null&&S.icon?s.metadata.icon+",🧩":"plugin,🧩",p=s.iconPath?f.getIcon(s.iconPath,{size:24,symbolic:!1}):f.getIcon(o,{size:24});c.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="font-size:24px;">${p}</div>
              <div>
                <div style="font-weight:600; display:flex; align-items:center; gap:8px;">
                  ${s.metadata.name||s.uuid}
                  <span style="font-size:10px; padding:2px 6px; border-radius:10px; background:${r}33; color:${r}; border:1px solid ${r}66; text-transform:uppercase;">${v}</span>
                </div>
                <div style="font-size:11px; color:var(--text-secondary);">${s.uuid}</div>
              </div>
            </div>
            <button class="${s.isLoaded?"btn-danger":"btn-primary"} btn-sm" id="btn-toggle-${s.uuid.replace(/@/g,"_")}">
              ${s.isLoaded?"Unload":"Load"}
            </button>
          </div>
        `;const h=`#btn-toggle-${s.uuid.replace(/@/g,"_")}`,u=c.querySelector(h);u.onclick=async()=>{u.disabled=!0;try{s.isLoaded?(B.markAsRemoved(s.uuid),B.unload(s.uuid)):(B.unmarkAsRemoved&&B.unmarkAsRemoved(s.uuid),await B.loadFromVfs(s.uuid,s.path,s.type)),n()}catch(l){alert(`Failed to ${s.isLoaded?"unload":"load"} extension: ${l.message}`),u.disabled=!1}},e.appendChild(c)}),m.length===0&&(e.innerHTML='<div style="text-align:center; padding:40px; color:var(--text-tertiary);">No plugins or extensions found</div>')};i.querySelector("#btn-refresh-plugins").onclick=n,n()},de=()=>{i.innerHTML=`
      <div class="settings-section-title">User Accounts</div>
      <div class="settings-card" style="display:flex; align-items:center; gap:16px;">
        <div style="width:64px; height:64px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:32px;">👤</div>
        <div>
          <div style="font-size:18px; font-weight:700;">everest os User</div>
          <div style="font-size:12px; color:var(--text-secondary);">Administrator</div>
        </div>
      </div>
      <button class="btn-secondary">Change Password...</button>
    `},ce=()=>{i.innerHTML=`
      <div style="text-align:center; padding:20px 0;">
        <div style="margin-bottom:24px; display:inline-flex; align-items:center; justify-content:center; width:120px; height:120px; background:var(--bg-card); border-radius:50%; border:1px solid var(--border); box-shadow:0 4px 15px rgba(0,0,0,0.2); overflow:hidden;">
          ${f.getIcon("/icons/everest-logo.svg",{size:180})}
        </div>
        <h2 style="margin-bottom:4px;">EverestOS</h2>
        <p style="color:var(--text-tertiary); font-size:14px; margin-bottom:24px;">Version 1.2.5</p>

        <div class="settings-card" style="text-align:left; max-width:500px; margin:0 auto 20px auto; line-height:1.5;">
          <div style="font-size:13px; margin-bottom:12px;">
            EverestOS is a modular web-based desktop environment inspired by the <strong>Cinnamon Desktop Environment</strong>.
            It features a robust extension system supporting JS-based <strong>desklets</strong> and <strong>applets</strong> using a custom-ported CJS loader and mock <strong>St</strong> libraries.
          </div>
          <div style="display:flex; justify-content:center; margin-top:16px;">
            <button id="btn-dev-docs" class="btn-primary btn-sm" style="display:flex; align-items:center; gap:6px;">
              ${f.getIcon("internet",{size:14})} Developer Documentation
            </button>
          </div>
        </div>

        <div class="settings-card" style="text-align:left; max-width:500px; margin:0 auto;">
          <div class="settings-row">
            <span style="color:var(--text-secondary);">Kernel</span>
            <span style="font-family:var(--font-mono);">Everest Core (VFS + Event Bus)</span>
          </div>
          <div class="settings-row">
            <span style="color:var(--text-secondary);">Storage</span>
            <span style="font-family:var(--font-mono);">IndexedDB (Browser-Native)</span>
          </div>
          <div class="settings-row">
            <span style="color:var(--text-secondary);">Compatibility</span>
            <span style="font-family:var(--font-mono);">CommonJS (CJS) + Mock GI/St</span>
          </div>
          <div class="settings-row">
            <span style="color:var(--text-secondary);">License</span>
            <span style="font-family:var(--font-mono);">GPL-3.0-or-later</span>
          </div>
        </div>
      </div>
    `,i.querySelector("#btn-dev-docs").onclick=()=>{document.dispatchEvent(new CustomEvent("launch-app",{detail:{id:"web-browser",args:["/home/user/Documents/developer-guides.html"]}}))}};z.addEventListener("click",e=>{const n=e.target.closest(".settings-nav-item");n&&J(n.dataset.section)}),J(A)}export{ue as launch};
