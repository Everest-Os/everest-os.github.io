const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Cxhu8mxZ.js","assets/index-BKJI6B33.css"])))=>i.map(i=>d[i]);
import{_ as le}from"./index-Cxhu8mxZ.js";async function de(c,q={}){const{windowManager:B,vfs:x,themeManager:S,appLoader:F,loader:E,panelManager:O}=c,{IconHelper:b}=await le(async()=>{const{IconHelper:e}=await import("./index-Cxhu8mxZ.js").then(a=>a.i);return{IconHelper:e}},__vite__mapDeps([0,1]));let g={};const _=async()=>{try{const e=await x.readFile("~/.config/appearance.json");e&&(g=JSON.parse(e))}catch{}},A=async()=>{await x.writeFile("~/.config/appearance.json",JSON.stringify(g,null,2)),document.dispatchEvent(new CustomEvent("reload-appearance"))};await _();let T="appearance";q.args&&q.args.length>0&&(T=q.args[0]),q.section&&(T=q.section);const P=B.windows.get("system-settings");if(P){B.focusWindow("system-settings"),setTimeout(()=>{const e=P.frame.querySelector(`.settings-nav-item[data-section="${T}"]`);e&&(e.click(),e.dispatchEvent(new Event("click",{bubbles:!0})))},50);return}const k=document.createElement("div");k.style.height="100%",k.style.display="flex",k.style.background="var(--bg-surface)",k.style.color="var(--text-primary)",k.style.fontFamily="var(--font-main)",k.innerHTML=`
    <div id="settings-sidebar" style="
      width: 180px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 12px 0;
      flex-shrink: 0;
    ">
      <div class="settings-nav-item" data-section="appearance">${b.getIcon("appearance,🎨",{size:16})} Appearance</div>
      <div class="settings-nav-item" data-section="panel">${b.getIcon("panel-color,🚥",{size:16})} Panel</div>
      <div class="settings-nav-item" data-section="menu">${b.getIcon("menu-color,🌿",{size:16})} Menu</div>
      <div class="settings-nav-item" data-section="desktop">${b.getIcon("desktop,🖥️",{size:16})} Desktop</div>
      <div class="settings-nav-item" data-section="display">${b.getIcon("monitor-color,🖥️",{size:16})} Display</div>
      <div class="settings-nav-item" data-section="extensions">${b.getIcon("plugin-color,🧩",{size:16})} Extensions</div>
      <div class="settings-nav-item" data-section="startup">${b.getIcon("startup,🚀",{size:16})} Startup</div>
      <div class="settings-nav-item" data-section="storage">${b.getIcon("storage,💽",{size:16})} Storage</div>
      <div class="settings-nav-item" data-section="users">${b.getIcon("user-color,👥",{size:16})} Users</div>
      <div style="flex: 1;"></div>
      <div class="settings-nav-item" data-section="about">${b.getIcon("system-color,ℹ️",{size:16})} About</div>
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
  `;const M=B.createWindow({id:"system-settings",title:"System Settings",icon:"settings,⚙️",width:800,height:600,content:k,onClose:()=>{C==="menu"&&window.dispatchEvent(new CustomEvent("everest:close-menu"))}}),$=k.querySelector("#settings-sidebar"),N=k.querySelector("#settings-header"),n=k.querySelector("#settings-body"),W=k.querySelectorAll(".settings-nav-item"),G=()=>{$.querySelector('[data-section="appearance"]').innerHTML=`${b.getIcon("appearance,🎨",{size:16})} Appearance`,$.querySelector('[data-section="panel"]').innerHTML=`${b.getIcon("panel-color,🚥",{size:16})} Panel`,$.querySelector('[data-section="menu"]').innerHTML=`${b.getIcon("menu-color,🌿",{size:16})} Menu`,$.querySelector('[data-section="desktop"]').innerHTML=`${b.getIcon("desktop,🖥️",{size:16})} Desktop`,$.querySelector('[data-section="display"]').innerHTML=`${b.getIcon("monitor-color,🖥️",{size:16})} Display`,$.querySelector('[data-section="extensions"]').innerHTML=`${b.getIcon("plugin-color,🧩",{size:16})} Extensions`,$.querySelector('[data-section="startup"]').innerHTML=`${b.getIcon("startup,🚀",{size:16})} Startup`,$.querySelector('[data-section="storage"]').innerHTML=`${b.getIcon("storage,💽",{size:16})} Storage`,$.querySelector('[data-section="users"]').innerHTML=`${b.getIcon("user-color,👥",{size:16})} Users`,$.querySelector('[data-section="about"]').innerHTML=`${b.getIcon("system-color,ℹ️",{size:16})} About`};window.addEventListener("icon-theme-changed",()=>{G(),j(C)}),window.addEventListener("theme-changed",()=>{j(C)});let C=T,z=null;const D=async e=>{if(e==="menu"){window.dispatchEvent(new CustomEvent("everest:open-menu")),z||(z={left:M.frame.style.left,top:M.frame.style.top});try{const a=await x.readFile("~/.config/menu.json"),o=(a?JSON.parse(a):{menuWidth:420}).menuWidth||420;M.frame.style.left=o+60+"px";const d=window.innerWidth-M.frame.offsetWidth-20;parseFloat(M.frame.style.left)>d&&(M.frame.style.left=d+"px")}catch{M.frame.style.left="450px"}}else C==="menu"&&(window.dispatchEvent(new CustomEvent("everest:close-menu")),z&&(M.frame.style.left=z.left,M.frame.style.top=z.top,z=null));C=e,W.forEach(a=>{a.classList.toggle("active",a.dataset.section===e)}),N.textContent=e.charAt(0).toUpperCase()+e.slice(1),j(e)},J=()=>{const e=document.documentElement,a={height:g.panelHeight!==void 0?g.panelHeight:48,blur:g.panelBlur!==void 0?g.panelBlur:20,opacity:g.panelOpacity!==void 0?g.panelOpacity:.92,marginY:g.panelMarginY!==void 0?g.panelMarginY:12,marginX:g.panelMarginX!==void 0?g.panelMarginX:60,radius:g.panelRadius!==void 0?g.panelRadius:12,color:g.panelColor||"#1e1e1e",borderColor:g.panelBorderColor||"#6496ff",borderOpacity:g.panelBorderOpacity!==void 0?g.panelBorderOpacity:.3};n.innerHTML=`
      <div class="settings-section-title">Behavior</div>
      <div class="settings-card">
        <div class="settings-row">
          <label>Panel Position</label>
          <select id="panel-position" style="background:var(--bg-input); border:1px solid var(--border); color:white; padding:6px 10px; border-radius:6px; outline:none; width:120px;">
            <option value="bottom" ${!c.panelManager||c.panelManager.position==="bottom"?"selected":""}>Bottom</option>
            <option value="top" ${c.panelManager&&c.panelManager.position==="top"?"selected":""}>Top</option>
          </select>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row">
          <label>Auto-hide Panel</label>
          <input type="checkbox" id="panel-autohide" ${c.panelManager&&c.panelManager.autoHide?"checked":""}>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row">
          <label>Show App Name in Window List</label>
          <input type="checkbox" id="panel-show-app-name" ${c.panelManager&&c.panelManager.showAppName?"checked":""}>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="align-items:center;">
          <label style="flex:1;">App Icon Size <span style="font-size:12px; color:var(--text-tertiary); margin-left:8px;" id="val-panel-icon-size">${c.panelManager?c.panelManager.iconSize:16}px</span></label>
          <input type="range" id="panel-icon-size" min="12" max="32" step="2" value="${c.panelManager?c.panelManager.iconSize:16}" style="width:120px;">
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
            <input type="color" id="panel-color" value="${a.color}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Opacity</label>
            <span id="opacity-val">${Math.round(a.opacity*100)}%</span>
          </div>
          <input type="range" id="opacity-range" min="0" max="100" value="${Math.round(a.opacity*100)}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Transparency Blur</label>
            <span id="blur-val">${a.blur}px</span>
          </div>
          <input type="range" id="blur-range" min="0" max="64" value="${a.blur}" style="width:100%;">
        </div>
        <div style="height:12px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Border Color</label>
            <input type="color" id="border-color" value="${a.borderColor}">
          </div>
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Border Opacity</label>
            <span id="border-opacity-val">${Math.round(a.borderOpacity*100)}%</span>
          </div>
          <input type="range" id="border-opacity" min="0" max="100" value="${Math.round(a.borderOpacity*100)}" style="width:100%;">
        </div>
      </div>

      <div class="settings-section-title">Layout & Spacing</div>
      <div class="settings-card">
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Panel Height</label>
            <span id="height-val">${a.height}px</span>
          </div>
          <input type="range" id="height-range" min="24" max="64" value="${a.height}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Edge Spacing (Elevate)</label>
            <span id="margin-y-val">${a.marginY}px</span>
          </div>
          <input type="range" id="margin-y-range" min="0" max="40" value="${a.marginY}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Side Spacing (Width)</label>
            <span id="margin-x-val">${a.marginX}px</span>
          </div>
          <input type="range" id="margin-x-range" min="0" max="300" step="10" value="${a.marginX}" style="width:100%;">
        </div>
        <div style="height:12px;"></div>
        <div class="settings-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <label>Corner Rounding</label>
            <span id="radius-val">${a.radius}px</span>
          </div>
          <input type="range" id="radius-range" min="0" max="32" value="${a.radius}" style="width:100%;">
        </div>
      </div>
    `;const m=(t,i)=>{if(!t||!t.startsWith("#"))return t;const y=parseInt(t.slice(1,3),16)||0,w=parseInt(t.slice(3,5),16)||0,L=parseInt(t.slice(5,7),16)||0;return`rgba(${y}, ${w}, ${L}, ${i})`},o=async(t,i)=>{g[t]=i,await A(),t==="panelRadius"?e.style.setProperty("--panel-radius",i+"px"):t==="panelBlur"?e.style.setProperty("--panel-blur",i+"px"):t==="panelOpacity"||t==="panelColor"?e.style.setProperty("--bg-panel-rgba",m(g.panelColor||"#1e1e1e",g.panelOpacity!==void 0?g.panelOpacity:.92)):t==="panelHeight"?(e.style.setProperty("--panel-height",i+"px"),c.panelManager&&(c.panelManager.height=parseInt(i))):t==="panelMarginY"?e.style.setProperty("--panel-margin-y",i+"px"):t==="panelMarginX"?e.style.setProperty("--panel-margin-x",i+"px"):(t==="panelBorderColor"||t==="panelBorderOpacity")&&e.style.setProperty("--panel-border-rgba",m(g.panelBorderColor||"#6496ff",g.panelBorderOpacity!==void 0?g.panelBorderOpacity:.3))},d=n.querySelector("#panel-position");d&&d.addEventListener("change",t=>{c.panelManager&&(c.panelManager.position=t.target.value)});const v=n.querySelector("#panel-autohide");v&&v.addEventListener("change",t=>{c.panelManager&&(c.panelManager.autoHide=t.target.checked)});const l=n.querySelector("#panel-show-app-name");l&&l.addEventListener("change",t=>{c.panelManager&&(c.panelManager.showAppName=t.target.checked)});const s=n.querySelector("#panel-icon-size");s&&s.addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#val-panel-icon-size").textContent=i+"px",c.panelManager&&(c.panelManager.iconSize=i)}),n.querySelector("#panel-color").addEventListener("input",t=>o("panelColor",t.target.value)),n.querySelector("#opacity-range").addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#opacity-val").textContent=i+"%",o("panelOpacity",i/100)}),n.querySelector("#blur-range").addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#blur-val").textContent=i+"px",o("panelBlur",i)}),n.querySelector("#border-color").addEventListener("input",t=>o("panelBorderColor",t.target.value)),n.querySelector("#border-opacity").addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#border-opacity-val").textContent=i+"%",o("panelBorderOpacity",i/100)}),n.querySelector("#height-range").addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#height-val").textContent=i+"px",o("panelHeight",i)});const u=n.querySelector("#margin-y-range"),f=n.querySelector("#margin-x-range"),p=()=>{const t=document.getElementById("everest-panel");t&&t.classList.toggle("is-dock",parseInt(u.value)>0||parseInt(f.value)>0)};u.addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#margin-y-val").textContent=i+"px",o("panelMarginY",i),p()}),f.addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#margin-x-val").textContent=i+"px",o("panelMarginX",i),p()}),n.querySelector("#radius-range").addEventListener("input",t=>{const i=parseInt(t.target.value);n.querySelector("#radius-val").textContent=i+"px",o("panelRadius",i)});const h=n.querySelector("#panel-mode-group"),r=()=>{const t=parseInt(u.value)>0||parseInt(f.value)>0;h.querySelectorAll("button").forEach(i=>{const y=i.dataset.mode==="dock"&&t||i.dataset.mode==="full"&&!t;i.className=y?"btn-primary btn-sm":"btn-secondary btn-sm"})};r(),h.querySelectorAll("button").forEach(t=>{t.onclick=()=>{const i=n.querySelector("#height-range"),y=n.querySelector("#radius-range");t.dataset.mode==="full"?(u.value=0,f.value=0,i.value=42,y.value=0):(u.value=12,f.value=60,i.value=48,y.value=12),u.dispatchEvent(new Event("input")),f.dispatchEvent(new Event("input")),i.dispatchEvent(new Event("input")),y.dispatchEvent(new Event("input")),r()}})},j=async e=>{n.innerHTML="",e==="appearance"?H():e==="panel"?J():e==="menu"?await Z():e==="desktop"?await Q():e==="display"?ee():e==="extensions"?te():e==="startup"?await V():e==="storage"?await K():e==="users"?ie():e==="about"&&ne()},V=async()=>{n.innerHTML=`
      <div class="settings-section-title">Startup Applications</div>
      <div id="startup-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;const e=n.querySelector("#startup-list");let a=[];try{const d=await x.readFile("~/.config/startup.json");d&&(a=JSON.parse(d))}catch{}const m=F.getApps();(()=>{e.innerHTML="",m.forEach(d=>{const v=a.includes(d.id),l=document.createElement("div");l.className="settings-card",l.style.margin="0",l.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="font-size:24px;">${b.getIcon((d.icon||"archive")+",📦",{size:24})}</div>
              <div>
                <div style="font-weight:600;">${d.name}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${d.id}</div>
              </div>
            </div>
            <input type="checkbox" ${v?"checked":""} id="toggle-${d.id}">
          </div>
        `,l.querySelector("input").onchange=async s=>{s.target.checked?a.includes(d.id)||a.push(d.id):a=a.filter(u=>u!==d.id),await x.writeFile("~/.config/startup.json",JSON.stringify(a))},e.appendChild(l)})})()},R={storageLimitServer:2147483648,storageLimitLocal:104857600},U=async()=>{const e=[],a=async m=>{try{const o=await x.readdir(m);for(const d of o)if(d.type==="dir")e.push({path:d.path,type:"dir"}),await a(d.path);else try{const v=await x.readFile(d.path);e.push({path:d.path,type:"file",content:v,size:v.length})}catch{}}catch{}};return await a("/"),{version:"1.0",os:"EverestOS",timestamp:new Date().toISOString(),fileCount:e.length,files:e}},Y=async e=>await x.importBackup(e),X=async()=>{try{const e=await x.getInfo();if(e&&e.root!=="browser-storage")return{mode:"server",label:"Server File System",color:"#44ff44",persistent:!0}}catch{}return x.db?{mode:"indexeddb",label:"IndexedDB (Browser Storage)",color:"#ffaa00",persistent:!1}:x.useLocalStorage?{mode:"localstorage",label:"LocalStorage",color:"#ff6644",persistent:!1}:{mode:"memory",label:"In-Memory (Volatile)",color:"#ff4444",persistent:!1}},K=async()=>{const a=(await x.getInfo()).root!=="browser-storage",m=await X();n.innerHTML=`
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

      <div class="settings-section-title" style="color:#ff4444;">Danger Zone</div>
      <div class="settings-card" style="border:1px solid rgba(255,68,68,0.3);">
        <p style="font-size:13px; margin-bottom:16px;">Resetting the system will clear all virtual files, settings, and installed plugins. This action cannot be undone.</p>
        <button id="btn-reset-system" class="btn-danger" style="width:100%;">Reset System & Reload</button>
      </div>
    `;const o=n.querySelector("#storage-val"),d=n.querySelector("#storage-bar"),v=n.querySelector("#storage-file-count"),l=n.querySelector("#backup-status"),s=p=>{l.style.display="block",l.textContent=p};(async()=>{let p=0,h=0;const r=async y=>{try{const w=await x.readdir(y);for(const L of w)L.type==="dir"?await r(L.path):(p+=L.size||0,h++)}catch{}};await r("/");const t=a?R.storageLimitServer:R.storageLimitLocal,i=Math.min(100,p/t*100);o.textContent=`${(p/1024/1024).toFixed(2)} MB of ${(t/1024/1024).toFixed(0)} MB used`,d.style.width=i+"%",v.textContent=`${h} files indexed`})(),n.querySelector("#btn-export-vfs").onclick=async()=>{try{s("⏳ Collecting files...");const p=await U(),h=JSON.stringify(p,null,2),r=new Blob([h],{type:"application/json"}),t=URL.createObjectURL(r),i=document.createElement("a");i.href=t,i.download=`everest-backup-${new Date().toISOString().split("T")[0]}.json`,i.click(),URL.revokeObjectURL(t),s(`✅ Backup downloaded — ${p.fileCount} files, ${(r.size/1024).toFixed(1)} KB`)}catch(p){s(`❌ Export failed: ${p.message}`)}};const f=n.querySelector("#import-vfs-file");n.querySelector("#btn-import-vfs").onclick=()=>f.click(),f.onchange=async p=>{const h=p.target.files[0];if(!h)return;const r=new FileReader;r.onload=async t=>{try{const i=JSON.parse(t.target.result);let y;if(Array.isArray(i))y={files:i,timestamp:"legacy",os:"unknown"};else if(i.files)y=i;else throw new Error("Invalid backup format");if(confirm(`Restore ${y.files.length} items from ${y.os||"unknown"} (${y.timestamp||"unknown"})? This will write files to the active storage backend.`)){s("⏳ Restoring files...");const{restored:w,errors:L}=await Y(y);s(`✅ Restored ${w} items${L>0?`, ${L} errors`:""}. Reloading...`),setTimeout(()=>location.reload(),1500)}}catch(i){s(`❌ Import failed: ${i.message}`)}},r.readAsText(h)},n.querySelector("#btn-reset-system").onclick=async()=>{if(confirm("Are you absolutely sure you want to reset the system? ALL DATA WILL BE LOST.")){const p=indexedDB.deleteDatabase("PlaygroundVFS");p.onsuccess=()=>location.reload(),p.onerror=()=>alert("Failed to clear database.")}}},Z=async()=>{let e={icon:"menu",showLabel:!0,menuWidth:420,menuOpacity:.85,menuBlur:20,showCategoryIcons:!0,enableSearch:!0,iconSize:28};try{const s=await x.readFile("~/.config/menu.json");s&&(e={...e,...JSON.parse(s)})}catch{}const a=async()=>{await x.writeFile("~/.config/menu.json",JSON.stringify(e,null,2)),document.dispatchEvent(new CustomEvent("reload-menu-settings"))};n.innerHTML=`
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
            ${["🌿","🔮","🍉","🍕","🚀","⭐","🌈","🔥","⚙️","🖥️","🐧","🛸","🍎","🍓","🏀","🎮","💡","🔔"].map(s=>`<div class="emoji-item" style="font-size:20px; cursor:pointer; padding:8px; text-align:center; border-radius:8px; background:var(--bg-surface-hover); border:1px solid var(--border);">${s}</div>`).join("")}
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
    `;const m=n.querySelector("#icon-preview"),o=n.querySelector("#icon-selector"),d=n.querySelector("#custom-icon-grid"),v=()=>{const s=e.icon;m.innerHTML=b.getIcon(s,{size:28})};v(),m.onclick=()=>{const s=o.style.display==="block";o.style.display=s?"none":"block",m.style.borderColor=s?"var(--border)":"var(--accent)",s||l()};const l=async()=>{d.innerHTML='<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">Scanning...</div>';try{const s=await x.readdir("~/images/icons");d.innerHTML="",s.forEach(u=>{if(u.type==="dir"||!u.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))return;const f=document.createElement("div");f.style.cssText=`
            height: 40px;
            border-radius: 6px;
            background: var(--bg-surface-hover);
            border: 1px solid var(--border);
            cursor: pointer;
            background-image: url("/fs${u.path}");
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
          `,f.onclick=()=>{e.icon=u.path,v(),a()},d.appendChild(f)}),s.length===0&&(d.innerHTML='<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">No icons in ~/images/icons</div>')}catch{d.innerHTML='<div style="grid-column: span 6; font-size:10px; color:var(--text-tertiary);">Failed to scan icons</div>'}};n.querySelectorAll(".emoji-item").forEach(s=>{s.onclick=()=>{e.icon=s.textContent,v(),a()}}),n.querySelector("#btn-browse-custom").onclick=async()=>{const s=await c.filePicker.pickFile({title:"Select Menu Icon",initialPath:"~/images/icons",filter:u=>u.type==="dir"||u.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)});s&&(e.icon=s,v(),a())},n.querySelector("#btn-theme-default").onclick=()=>{e.icon="menu",v(),a()},n.querySelector("#show-label").onchange=s=>{e.showLabel=s.target.checked,a()},n.querySelector("#icon-size-range").oninput=s=>{const u=s.target.value;e.iconSize=parseInt(u),n.querySelector("#icon-size-val").textContent=u+"px",a()},n.querySelector("#width-range").oninput=s=>{const u=s.target.value;e.menuWidth=parseInt(u),n.querySelector("#width-val").textContent=u+"px",a()},n.querySelector("#menu-blur-range").oninput=s=>{const u=s.target.value;e.menuBlur=parseInt(u),n.querySelector("#menu-blur-val").textContent=u+"px",a()},n.querySelector("#menu-opacity-range").oninput=s=>{const u=s.target.value;e.menuOpacity=parseInt(u)/100,n.querySelector("#menu-opacity-val").textContent=u+"%",a()},n.querySelector("#enable-search").onchange=s=>{e.enableSearch=s.target.checked,a()},n.querySelector("#show-categories").onchange=s=>{e.showCategoryIcons=s.target.checked,a()}},H=()=>{const e={shellTheme:g.shellTheme||"dark",appTheme:g.appTheme||"dark",ctxColor:g.contextMenuColor||"#19191e",ctxOpacity:g.contextMenuOpacity!==void 0?g.contextMenuOpacity:.97,ctxBlur:g.contextMenuBlur!==void 0?g.contextMenuBlur:24,radius:g.panelRadius||10},a=S.currentTheme.replace("-dark",""),m=S.themes.has(a)&&S.themes.has(`${a}-dark`);n.innerHTML=`
      <div class="settings-section-title">Desktop Skin</div>
      <div id="theme-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:16px; margin-bottom:16px;"></div>

      <div class="settings-card" style="margin-bottom:24px;">
        <div class="settings-row">
          <label style="font-weight:600; font-size:12px; color:var(--text-secondary); text-transform:uppercase;">Global Appearance</label>
          <div style="display:flex; gap:10px; background:var(--bg-input); padding:4px; border-radius:8px; border:1px solid var(--border); ${m?"":"opacity:0.5; pointer-events:none; filter:grayscale(1);"}" id="master-mode-group">
            <button class="btn-sm ${S.preferredMode==="light"?"btn-primary":"btn-secondary"}" style="flex:1; border:none;" data-mode="light">Light</button>
            <button class="btn-sm ${S.preferredMode==="dark"?"btn-primary":"btn-secondary"}" style="flex:1; border:none;" data-mode="dark">Dark</button>
          </div>
        </div>
        <div style="margin-top:10px; font-size:11px; color:var(--text-tertiary); display:flex; align-items:center; gap:6px;">
          ${b.getIcon("info,ℹ️",{size:14,symbolic:!0})}
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
    `;const o=document.documentElement,d=(r,t)=>{if(!r.startsWith("#"))return r;const i=parseInt(r.slice(1,3),16)||0,y=parseInt(r.slice(3,5),16)||0,w=parseInt(r.slice(5,7),16)||0;return`rgba(${i}, ${y}, ${w}, ${t})`};n.querySelector("#master-mode-group").querySelectorAll("button").forEach(r=>{r.onclick=()=>{const t=r.dataset.mode;S.setMode(t),H()}});const l=async(r,t)=>{g[r]=t,await A(),r==="contextMenuColor"||r==="contextMenuOpacity"?g.appTheme!=="light"&&o.style.setProperty("--bg-context-menu-rgba",d(g.contextMenuColor||"#19191e",g.contextMenuOpacity!==void 0?g.contextMenuOpacity:.97)):r==="contextMenuBlur"?o.style.setProperty("--context-menu-blur",t+"px"):r==="panelRadius"&&(o.style.setProperty("--radius-main",t+"px"),o.style.setProperty("--radius-md",t+"px"))};n.querySelector("#ctx-color").addEventListener("input",r=>l("contextMenuColor",r.target.value)),n.querySelector("#ctx-opacity").addEventListener("input",r=>{const t=parseInt(r.target.value);n.querySelector("#ctx-opacity-val").textContent=t+"%",l("contextMenuOpacity",t/100)}),n.querySelector("#ctx-blur").addEventListener("input",r=>{const t=parseInt(r.target.value);n.querySelector("#ctx-blur-val").textContent=t+"px",l("contextMenuBlur",t)}),n.querySelector("#radius-range").addEventListener("input",r=>{const t=parseInt(r.target.value);n.querySelector("#radius-val").textContent=t+"px",l("panelRadius",t)});const u=n.querySelector("#theme-grid"),f=()=>{u.innerHTML="";const r=S.getThemes();r.filter(i=>{if(i.id.endsWith("-dark")){const y=i.id.replace("-dark","");return!r.some(w=>w.id===y)}return!0}).forEach(i=>{const y=document.createElement("div"),w=S.currentTheme===i.id||S.currentTheme===`${i.id}-dark`,ae=S.preferredMode==="dark"&&S.themes.has(`${i.id}-dark`)?`${i.id}-dark`:i.id,I=S.themes.get(ae)||i,se=I.variables["--bg-surface-rgb"]?`rgb(${I.variables["--bg-surface-rgb"]})`:I.mode==="light"?"#f0f0f0":"#1e1e1e",re=I.variables["--text-primary-rgb"]?`rgb(${I.variables["--text-primary-rgb"]})`:I.mode==="light"?"#222":"#eee",oe=I.variables["--accent-rgb"]?`rgb(${I.variables["--accent-rgb"]})`:"#3584e4";y.style.cssText=`
          background: ${se};
          color: ${re};
          border: 2px solid ${w?"var(--accent)":"rgba(0,0,0,0.1)"};
          border-radius: 14px;
          padding: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${w?"0 8px 24px rgba(0,0,0,0.3)":"0 2px 8px rgba(0,0,0,0.1)"};
          transform: ${w?"scale(1.05)":"scale(1)"};
          position: relative;
          overflow: hidden;
        `,y.innerHTML=`
          <div style="width:100%; height:60px; background:${oe}; border-radius:8px; position:relative; overflow:hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.1);">
            <div style="position:absolute; bottom:0; left:0; right:0; height:12px; background:rgba(0,0,0,0.2); backdrop-filter:blur(4px);"></div>
            <div style="position:absolute; top:8px; left:8px; width:24px; height:4px; background:rgba(255,255,255,0.3); border-radius:2px;"></div>
          </div>
          <span style="font-size:11px; font-weight:700; text-align:center; letter-spacing:0.3px;">${i.name.replace("-Dark","").replace("-Y","Y")}</span>
          ${w?'<div style="position:absolute; top:6px; right:6px; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow: 0 0 8px var(--accent);"></div>':""}
        `,y.onmouseover=()=>{w||(y.style.transform="translateY(-4px)")},y.onmouseout=()=>{w||(y.style.transform="scale(1)")},y.addEventListener("click",()=>{S.applyTheme(i.id,{ignoreMode:!1}),H()}),u.appendChild(y)})},p=n.querySelector("#icon-theme-grid"),h=()=>{p.innerHTML="",S.getIconThemes().forEach(r=>{const t=document.createElement("div"),i=S.currentIconTheme===r.id;t.style.cssText=`
          background: var(--bg-card);
          border: 2px solid ${i?"var(--accent)":"var(--border)"};
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${i?"0 8px 24px rgba(0,0,0,0.15)":"none"};
          transform: ${i?"scale(1.05)":"scale(1)"};
          position: relative;
        `;const y=b.getIcon("folder,📁",{size:32});t.innerHTML=`
          <div style="width:100%; height:60px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg, var(--bg-elevated), var(--bg-card)); border-radius:10px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);">
            ${y}
          </div>
          <span style="font-size:11px; font-weight:700; color:var(--text-primary);">${r.name}</span>
          ${i?'<div style="position:absolute; top:8px; right:8px; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow: 0 0 8px var(--accent);"></div>':""}
        `,t.onmouseover=()=>{i||(t.style.transform="translateY(-4px)")},t.onmouseout=()=>{i||(t.style.transform="scale(1)")},t.addEventListener("click",()=>{S.applyIconTheme(r.id),h(),window.dispatchEvent(new CustomEvent("icon-theme-changed",{detail:{theme:r}}))}),p.appendChild(t)})};f(),h()},Q=async()=>{n.innerHTML=`
      <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid var(--border); padding-bottom:8px;">
        <button class="btn-secondary btn-sm active" id="tab-bg">Background</button>
        <button class="btn-secondary btn-sm" id="tab-icons">Icons & Layout</button>
      </div>
      <div id="desktop-content"></div>
    `;const e=n.querySelector("#desktop-content"),a=n.querySelector("#tab-bg"),m=n.querySelector("#tab-icons"),o=async()=>{e.innerHTML=`
        <div class="settings-section-title">Solid & Gradients</div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:20px;" id="grad-grid"></div>

        <div class="settings-section-title">Wallpapers</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:20px;" id="wallpaper-grid"></div>

        <button class="btn-secondary" style="width:100%;" id="btn-browse-bg">Browse for image...</button>
      `;const v=e.querySelector("#grad-grid");["linear-gradient(135deg, #2c3e50, #3498db)","linear-gradient(135deg, #1e130c, #9a8478)","linear-gradient(135deg, #43cea2, #185a9d)","linear-gradient(135deg, #ff4b1f, #ff9068)","#242424","#1a1a1a","#3584e4","#26a269"].forEach(f=>{const p=document.createElement("div");p.style.height="50px",p.style.borderRadius="6px",p.style.background=f,p.style.cursor="pointer",p.style.border="2px solid transparent",p.onclick=()=>{c.desktopSettings.settings.background=f,c.desktopSettings._applyBackground(),c.desktopSettings._save(),v.querySelectorAll("div").forEach(h=>h.style.borderColor="transparent"),p.style.borderColor="var(--accent)"},v.appendChild(p)});const s=e.querySelector("#wallpaper-grid"),u=async()=>{s.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-tertiary);">Scanning for images...</div>';const f=["~/images/backgrounds"];let p=[];for(const h of f)try{(await x.readdir(h)).forEach(t=>{if(t.type!=="dir"&&t.name.match(/\.(png|jpg|jpeg|webp)$/i)){let i=t.path||`${h}/${t.name}`;i.startsWith("~")?i=`/fs/home/user${i.slice(1)}`:i.startsWith("/home/user")&&(i=`/fs${i}`),p.push({name:t.name,path:i})}})}catch(r){console.warn(`Failed to scan wallpapers in ${h}`,r)}if(s.innerHTML="",p.length===0){s.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-tertiary);">No backgrounds found.</div>';return}p.forEach(h=>{const r=document.createElement("div");r.className="wallpaper-item",r.style.cssText=`
            height: 100px;
            border-radius: 6px;
            background-image: url("${h.path}");
            background-size: cover;
            background-position: center;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
          `,c.desktopSettings.settings.background.includes(h.path)&&(r.style.borderColor="var(--accent)"),r.onclick=()=>{c.desktopSettings.settings.background=`url("${h.path}")`,c.desktopSettings._applyBackground(),c.desktopSettings._save(),s.querySelectorAll(".wallpaper-item").forEach(t=>t.style.borderColor="transparent"),r.style.borderColor="var(--accent)"},s.appendChild(r)})};u(),e.querySelector("#btn-browse-bg").addEventListener("click",async()=>{const f=await c.filePicker.pickFile({title:"Select Background Image",initialPath:"~/images/backgrounds",filter:p=>p.type==="dir"||p.name.match(/\.(png|jpg|jpeg|webp)$/i)});f&&(c.desktopSettings.settings.background=`url("${f}")`,c.desktopSettings._applyBackground(),c.desktopSettings._save(),u())})},d=()=>{const v=c.desktopSettings.settings;e.innerHTML=`
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
      `,e.querySelector("#grid-size").oninput=l=>{v.gridSize=parseInt(l.target.value),c.desktopSettings._save(),c.vfs._emit("/home/user/Desktop")},e.querySelector("#icon-size").oninput=l=>{v.iconSize=parseInt(l.target.value),c.desktopSettings._save(),c.vfs._emit("/home/user/Desktop")},e.querySelector("#show-home").onchange=l=>{v.showHome=l.target.checked,c.desktopSettings._save(),c.vfs._emit("/home/user/Desktop")},e.querySelector("#show-computer").onchange=l=>{v.showComputer=l.target.checked,c.desktopSettings._save(),c.vfs._emit("/home/user/Desktop")},e.querySelector("#show-trash").onchange=l=>{v.showTrash=l.target.checked,c.desktopSettings._save(),c.vfs._emit("/home/user/Desktop")}};a.onclick=()=>{a.classList.add("active"),m.classList.remove("active"),o()},m.onclick=()=>{m.classList.add("active"),a.classList.remove("active"),d()},q.args&&q.args[1]==="icons"?m.onclick():await o()},ee=async()=>{let e={scaling:"100%",nightLight:!1};try{const l=await x.readFile("~/.config/display.json");l&&(e=JSON.parse(l))}catch{}const a=async()=>{await x.writeFile("~/.config/display.json",JSON.stringify(e))};n.innerHTML=`
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
    `;const m=n.querySelector("#scaling-select");m.onchange=l=>{e.scaling=l.target.value;const s=parseInt(l.target.value)/100;document.documentElement.style.setProperty("--system-scale",s),a()};const o=n.querySelector("#night-light-toggle");o.onchange=l=>{e.nightLight=l.target.checked,document.body.classList.toggle("night-light",e.nightLight),a()};const d=n.querySelector("#panel-pos-group"),v=()=>{d.querySelectorAll("button").forEach(l=>{const s=l.dataset.pos===O.position;l.className=s?"btn-primary btn-sm":"btn-secondary btn-sm"})};v(),d.querySelectorAll("button").forEach(l=>{l.onclick=()=>{O.position=l.dataset.pos,v()}})},te=()=>{n.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div class="settings-section-title" style="margin-bottom:0;">Plugins & Extensions</div>
        <button id="btn-refresh-plugins" class="btn-secondary btn-sm">↻ Refresh</button>
      </div>
      <div id="extensions-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;const e=n.querySelector("#extensions-list"),a=async()=>{e.innerHTML='<div style="text-align:center; padding:20px; color:var(--text-tertiary);">Scanning...</div>';const m=await E.discover();e.innerHTML="",m.forEach(o=>{var h;const d=document.createElement("div");d.className="settings-card",d.style.margin="0";const v=o.type.slice(0,-1),l=o.type==="applets"?"#26a269":o.type==="desklets"?"#3584e4":"#9141ac",s=(h=o.metadata)!=null&&h.icon?o.metadata.icon+",🧩":"plugin,🧩",u=o.iconPath?b.getIcon(o.iconPath,{size:24,symbolic:!1}):b.getIcon(s,{size:24});d.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="font-size:24px;">${u}</div>
              <div>
                <div style="font-weight:600; display:flex; align-items:center; gap:8px;">
                  ${o.metadata.name||o.uuid}
                  <span style="font-size:10px; padding:2px 6px; border-radius:10px; background:${l}33; color:${l}; border:1px solid ${l}66; text-transform:uppercase;">${v}</span>
                </div>
                <div style="font-size:11px; color:var(--text-secondary);">${o.uuid}</div>
              </div>
            </div>
            <button class="${o.isLoaded?"btn-danger":"btn-primary"} btn-sm" id="btn-toggle-${o.uuid.replace(/@/g,"_")}">
              ${o.isLoaded?"Unload":"Load"}
            </button>
          </div>
        `;const f=`#btn-toggle-${o.uuid.replace(/@/g,"_")}`,p=d.querySelector(f);p.onclick=async()=>{p.disabled=!0;try{o.isLoaded?(E.markAsRemoved(o.uuid),E.unload(o.uuid)):(E.unmarkAsRemoved&&E.unmarkAsRemoved(o.uuid),await E.loadFromVfs(o.uuid,o.path,o.type)),a()}catch(r){alert(`Failed to ${o.isLoaded?"unload":"load"} extension: ${r.message}`),p.disabled=!1}},e.appendChild(d)}),m.length===0&&(e.innerHTML='<div style="text-align:center; padding:40px; color:var(--text-tertiary);">No extensions found in ~/Plugins</div>')};n.querySelector("#btn-refresh-plugins").onclick=a,a()},ie=()=>{n.innerHTML=`
      <div class="settings-section-title">User Accounts</div>
      <div class="settings-card" style="display:flex; align-items:center; gap:16px;">
        <div style="width:64px; height:64px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:32px;">👤</div>
        <div>
          <div style="font-size:18px; font-weight:700;">everest os User</div>
          <div style="font-size:12px; color:var(--text-secondary);">Administrator</div>
        </div>
      </div>
      <button class="btn-secondary">Change Password...</button>
    `},ne=()=>{n.innerHTML=`
      <div style="text-align:center; padding:20px 0;">
        <div style="margin-bottom:24px; display:inline-flex; align-items:center; justify-content:center; width:120px; height:120px; background:var(--bg-card); border-radius:50%; border:1px solid var(--border); box-shadow:0 4px 15px rgba(0,0,0,0.2); overflow:hidden;">
          ${b.getIcon("/icons/everest-logo.svg",{size:180})}
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
              ${b.getIcon("internet",{size:14})} Developer Documentation
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
    `,n.querySelector("#btn-dev-docs").onclick=()=>{document.dispatchEvent(new CustomEvent("launch-app",{detail:{id:"web-browser",args:["/fs/home/user/Documents/developer-guides.html"]}}))}};$.addEventListener("click",e=>{const a=e.target.closest(".settings-nav-item");a&&D(a.dataset.section)}),D(T)}export{de as launch};
