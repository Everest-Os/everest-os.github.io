import{I as p,s as A}from"./index-BX5Da8PK.js";async function D(P,L={}){const{windowManager:S,vfs:f,loader:l,filePicker:w}=P,$=L.type||"applets",u=document.createElement("div");u.style.height="100%",u.style.display="flex",u.style.flexDirection="column",u.innerHTML=`
    <div style="display:flex; border-bottom:1px solid var(--border); background:var(--bg-surface-hover);">
      <button class="plugin-tab" data-tab="applets" style="
        flex:1; padding:12px 16px; border:none; background:transparent; color:var(--text-primary);
        cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s;
        border-bottom:2px solid transparent; margin-bottom:-1px;
        display:flex; align-items:center; justify-content:center; gap:8px;
      ">${p.getIcon("plugin",{size:16})} Applets</button>
      <button class="plugin-tab" data-tab="desklets" style="
        flex:1; padding:12px 16px; border:none; background:transparent; color:var(--text-secondary);
        cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s;
        border-bottom:2px solid transparent; margin-bottom:-1px;
        display:flex; align-items:center; justify-content:center; gap:8px;
      ">${p.getIcon("monitor",{size:16})} Desklets</button>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border);">
      <button id="em-browse" class="btn-primary" style="padding:6px 14px; font-size:12px; display:flex; align-items:center; gap:6px;">${p.getIcon("folder",{size:14})} Load from folder...</button>
      <button id="em-refresh" class="btn-secondary" style="padding:6px 14px; font-size:12px; display:flex; align-items:center; gap:6px;">${p.getIcon("refresh",{size:14})} Refresh</button>
    </div>
    <div id="em-list" style="flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:10px;">
      <div class="loading-spinner">Loading...</div>
    </div>
  `,S.createWindow({id:"plugin-settings",title:"Plugin Settings",icon:"plugin",width:680,height:540,content:u});const m=u.querySelector("#em-list"),I=u.querySelector("#em-refresh"),T=u.querySelector("#em-browse"),k=u.querySelectorAll(".plugin-tab");let d=$;const z=n=>{d=n,k.forEach(s=>{const g=s.dataset.tab===n;s.style.color=g?"var(--text-primary)":"var(--text-secondary)",s.style.borderBottomColor=g?"var(--accent)":"transparent",s.style.background=g?"var(--bg-active)":"transparent"}),x()};k.forEach(n=>{n.addEventListener("click",()=>z(n.dataset.tab))});const E=async n=>{const s=[],g=async(y,b)=>{try{const t=await f.readdir(y);for(const e of t)if(e.type==="dir"){if(e.name==="statusbar"||e.name==="system"){try{const i=await f.readdir(e.path);for(const a of i)if(a.type==="dir")try{const c=await f.readFile(`${a.path}/metadata.json`),o=JSON.parse(c);let r=null;try{const v=await f.readdir(a.path);v.find(h=>h.name==="icon.svg")?r=`${a.path}/icon.svg`:v.find(h=>h.name==="icon.png")&&(r=`${a.path}/icon.png`)}catch{}s.push({...o,uuid:o.uuid||a.name,vfsPath:a.path,pluginType:n,source:b,iconPath:r})}catch{}}catch{}continue}try{const i=await f.readFile(`${e.path}/metadata.json`),a=JSON.parse(i);let c=null;try{const o=await f.readdir(e.path);o.find(r=>r.name==="icon.svg")?c=`${e.path}/icon.svg`:o.find(r=>r.name==="icon.png")&&(c=`${e.path}/icon.png`)}catch{}s.push({...a,uuid:a.uuid||e.name,vfsPath:e.path,pluginType:n,source:b,iconPath:c})}catch{}}}catch{}};return await g(`~/Plugins/${n}`,"system"),await g(`~/.local/share/plugins/${n}`,"user"),s},x=async()=>{var b;m.innerHTML='<div style="text-align:center; padding:20px; color:var(--text-tertiary);">Loading...</div>';const n=await E(d),s=d==="applets"?"plugin":"monitor",g=d==="applets"?"Applets":"Desklets";if(n.length===0){m.innerHTML=`
        <div style="text-align:center; padding:40px 20px; color:var(--text-tertiary);">
          <div style="font-size:48px; margin-bottom:12px;">${p.getIcon(s,{size:64})}</div>
          <div style="font-size:14px; margin-bottom:8px;">No ${g.toLowerCase()} found</div>
          <div style="font-size:12px;">Place plugins in <code style="background:var(--bg-input); padding:2px 6px; border-radius:3px;">~/.local/share/plugins/${d}/</code></div>
          <div style="font-size:12px; margin-top:6px;">or use <strong>Load from folder</strong> to load from any location.</div>
        </div>`;return}m.innerHTML="";for(const t of n){const e=l.getLoaded().has(t.uuid),i=document.createElement("div");i.style.cssText=`
        display:flex; background:var(--bg-card); border:1px solid var(--border);
        border-radius:10px; padding:14px; align-items:center; gap:14px;
        transition:border-color 0.15s, box-shadow 0.15s;
      `,i.onmouseover=()=>{i.style.borderColor="var(--border-accent)",i.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)"},i.onmouseout=()=>{i.style.borderColor="var(--border)",i.style.boxShadow="none"};const a=e?'<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--success); margin-right:6px;" title="Loaded"></span>':'<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--text-tertiary); margin-right:6px;" title="Not loaded"></span>',c=t.vfsPath&&(t.vfsPath.includes("/.local/share/")||t.vfsPath.startsWith("~/.local/share/")),o=c?'<span style="font-size:10px; color:var(--mint-green); background:var(--mint-green-dim); padding:1px 6px; border-radius:4px; margin-left:auto;">User</span>':'<span style="font-size:10px; color:var(--text-tertiary); background:var(--bg-input); padding:1px 6px; border-radius:4px; margin-left:auto;">System</span>',r=(b=t.metadata)!=null&&b.icon?t.metadata.icon+",🧩":s,v=t.iconPath?p.getIcon(t.iconPath,{size:32,symbolic:!1}):p.getIcon(r,{size:32});i.innerHTML=`
        <div style="font-size:32px; width:40px; text-align:center;">${v}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; font-size:14px; margin-bottom:3px; display:flex; align-items:center; gap:4px;">
            ${a}
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.name||t.uuid}</span>
            <span style="font-size:10px; color:var(--text-tertiary); font-weight:normal; background:var(--bg-input); padding:1px 6px; border-radius:4px; flex-shrink:0;">v${t.version||"1.0"}</span>
            ${o}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin-bottom:2px;">${t.description||"No description available."}</div>
          <div style="font-size:10px; color:var(--text-tertiary); font-family:monospace; overflow:hidden; text-overflow:ellipsis;">${t.uuid}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px; flex-shrink:0;">
          ${e?`<button class="btn-danger btn-sm" data-action="unload" data-uuid="${t.uuid}" data-type="${d}">Unload</button>
               <button class="btn-secondary btn-sm" data-action="reload" data-uuid="${t.uuid}" data-type="${d}" style="display:flex; align-items:center; justify-content:center; gap:6px;">${p.getIcon("refresh",{size:12})} Reload</button>`:`<button class="btn-primary btn-sm" data-action="load" data-uuid="${t.uuid}" data-vfs="${t.vfsPath}" data-type="${d}">Load</button>`}
          <div style="display:flex; gap:5px;">
            <button class="btn-secondary btn-sm" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;" data-action="settings" data-uuid="${t.uuid}" ${e?"":'disabled style="opacity:0.4; cursor:default;"'}>${p.getIcon("settings",{size:12})} Settings</button>
            ${c?`<button class="btn-danger btn-sm" style="padding:4px 8px; display:flex; align-items:center; justify-content:center;" data-action="delete" data-uuid="${t.uuid}" data-vfs="${t.vfsPath}" title="Delete Plugin">${p.getIcon("trash",{size:12})}</button>`:""}
          </div>
        </div>
      `,m.appendChild(i)}const y=async t=>{const e=t.target.closest("button[data-action]");if(!e)return;const i=e.dataset.action,a=e.dataset.uuid,c=e.dataset.type;if(i==="load")try{e.disabled=!0,e.textContent="Loading...",l.unmarkAsRemoved&&l.unmarkAsRemoved(a),await l.loadFromVfs(a,e.dataset.vfs,c),x()}catch(o){alert("Failed to load: "+o.message),x()}else if(i==="unload")l.markAsRemoved&&l.markAsRemoved(a),l.unload(a),x();else if(i==="reload")l.reload(a),setTimeout(x,500);else if(i==="settings")window.dispatchEvent(new CustomEvent("open-extension-settings",{detail:{uuid:a}}));else if(i==="delete"){const o=e.dataset.vfs;A({title:"Delete Plugin",message:`Are you sure you want to permanently delete the plugin "${a}"?

This will remove all its files from ${o}.`,type:"confirm",confirmText:"Delete",onConfirm:async()=>{try{l.unload(a),await f.rm(o),x()}catch(r){alert("Failed to delete: "+r.message)}}})}};m.addEventListener("click",y)};T.addEventListener("click",async()=>{if(!w){alert("File picker not available");return}const n=await w.pickFolder({title:`Select ${d==="applets"?"Applet":"Desklet"} Folder`,initialPath:"~/Plugins"});if(n)try{const s=await f.readFile(`${n}/metadata.json`),y=JSON.parse(s).uuid||n.split("/").pop();await l.loadFromVfs(y,n,d),x()}catch(s){alert(`Could not load plugin from "${n}".

Make sure it contains a valid metadata.json.

Error: ${s.message}`)}}),I.addEventListener("click",x),z($)}export{D as launch};
