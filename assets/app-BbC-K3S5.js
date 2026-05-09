import{I as i}from"./index-GtZ1kKMR.js";async function h(n){const{windowManager:x,vfs:f,loader:b}=n,r=n.console,e=document.createElement("div");e.style.padding="20px",e.style.height="100%",e.style.display="flex",e.style.flexDirection="column",e.style.gap="15px",e.style.overflowY="auto",e.innerHTML=`
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0;">System Overview</h3>
      <button id="si-refresh" class="btn-secondary" style="display:flex; align-items:center; gap:6px;">${i.getIcon("refresh",{size:14})} Refresh</button>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${i.getIcon("folder",{size:24})}</div>
        <div style="font-size:12px; color:var(--text-secondary);">Total Folders</div>
        <div id="si-folders" style="font-size:24px; font-weight:bold;">...</div>
      </div>
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${i.getIcon("file",{size:24})}</div>
        <div style="font-size:12px; color:var(--text-secondary);">Total Files</div>
        <div id="si-files" style="font-size:24px; font-weight:bold;">...</div>
      </div>
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${i.getIcon("plugin",{size:24})}</div>
        <div style="font-size:12px; color:var(--text-secondary);">Loaded Plugins</div>
        <div id="si-plugins" style="font-size:24px; font-weight:bold;">...</div>
      </div>
      <div class="si-stat-card" style="background:var(--bg-card); padding:15px; border-radius:8px; border:1px solid var(--border);">
        <div style="font-size:24px; margin-bottom:5px;">${i.getIcon("warning",{size:24})}</div>
        <div style="font-size:12px; color:var(--text-secondary);">System Errors</div>
        <div id="si-errors" style="font-size:24px; font-weight:bold;">...</div>
      </div>
    </div>

    <h4 style="margin-top:10px; margin-bottom:5px;">Loaded Plugins List</h4>
    <div id="si-plugin-list" style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:10px; flex:1; overflow-y:auto; min-height:100px;">
      Loading...
    </div>
  `,x.createWindow({id:"system-inspector",title:"System Inspector",icon:"storage",width:500,height:450,content:e});const u=e.querySelector("#si-refresh"),l=async()=>{e.querySelector("#si-folders").textContent="...",e.querySelector("#si-files").textContent="...";let a=0,c=0;const p=async t=>{try{const y=await f.readdir(t);for(const g of y)g.type==="dir"?(a++,await p(g.path)):c++}catch{}};await p("/"),e.querySelector("#si-folders").textContent=a,e.querySelector("#si-files").textContent=c;const o=b.getLoaded();e.querySelector("#si-plugins").textContent=o.size;const v=e.querySelector("#si-plugin-list");o.size===0?v.innerHTML='<div style="color:var(--text-tertiary);">No plugins loaded.</div>':v.innerHTML=Array.from(o.keys()).map(t=>`<div style="padding:4px 0; border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:12px;">${t}</div>`).join("");let s=0;r&&r._logs&&(s=r._logs.filter(t=>t.type==="error").length);const d=e.querySelector("#si-errors");d.textContent=s,s>0?d.style.color="var(--danger)":d.style.color="var(--text-primary)"};u.addEventListener("click",l),l()}export{h as launch};
