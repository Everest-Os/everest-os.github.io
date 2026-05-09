import{I as s,s as m}from"./index-BX5Da8PK.js";async function P(S,I={}){const{windowManager:f,vfs:k,appLoader:h,loader:E}=S,b=E;if(f.windows.get("app-center")){f.focusWindow("app-center");return}const d=document.createElement("div");d.style.cssText=`
    height: 100%;
    display: flex;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,d.innerHTML=`
    <div id="app-center-sidebar" style="
      width: 220px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 16px 0;
      flex-shrink: 0;
    ">
      <div style="padding: 0 20px 20px; font-weight: 800; font-size: 16px; color: var(--accent);">
        App Center
      </div>
      
      <div style="padding: 0 20px 8px; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">
        Local
      </div>
      <div class="nav-item active" data-view="installed-apps">${s.getIcon("archive",{size:14})} Installed Apps</div>
      <div class="nav-item" data-view="installed-exts">${s.getIcon("plugin",{size:14})} Installed Extensions</div>
      
      <div style="padding: 24px 20px 8px; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">
        Explore
      </div>
      <div class="nav-item" data-view="get-apps">${s.getIcon("app-center",{size:14})} Get Apps</div>
      <div class="nav-item" data-view="get-exts">${s.getIcon("bolt",{size:14})} Get Extensions</div>
    </div>
    
    <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
      <div style="height: 60px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 16px;">
        <div style="flex: 1; position: relative;">
          <input type="text" id="app-search" placeholder="Search applications..." style="
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border);
            color: var(--text-primary);
            padding: 8px 12px 8px 36px;
            border-radius: 20px;
            font-size: 13px;
            outline: none;
          " />
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.4;">${s.getIcon("search",{size:14})}</span>
        </div>
      </div>
      
      <div id="app-center-body" style="flex: 1; overflow-y: auto; padding: 24px;">
      </div>
    </div>

    <style>
      .nav-item {
        padding: 10px 20px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      .nav-item:hover {
        background: var(--bg-card-hover);
      }
      .nav-item.active {
        background: rgba(var(--accent-rgb), 0.1);
        border-left-color: var(--accent);
        color: var(--accent);
        font-weight: 600;
      }
      .app-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        gap: 16px;
        align-items: center;
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }
      .app-card:hover {
        transform: translateY(-2px);
        background: var(--bg-card-hover);
        box-shadow: var(--shadow-md);
      }
    </style>
  `,f.createWindow({id:"app-center",title:"App Center",icon:"app-center",width:850,height:600,content:d});const $=d.querySelector("#app-center-sidebar"),y=d.querySelector("#app-center-body"),w=d.querySelector("#app-search");let c="installed-apps";const L=e=>{c=e,$.querySelectorAll(".nav-item").forEach(n=>{n.classList.toggle("active",n.dataset.view===e)}),w.placeholder=e.includes("ext")?"Search extensions...":"Search applications...",u()},u=async()=>{y.innerHTML="";const e=w.value.toLowerCase();if(c==="installed-apps"){const n=h.getApps().filter(t=>t.name.toLowerCase().includes(e)||t.id.toLowerCase().includes(e)),l=document.createElement("div");l.style.display="grid",l.style.gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))",l.style.gap="16px",n.forEach(t=>{const i=document.createElement("div");i.className="app-card",i.innerHTML=`
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center;">
            ${s.getIcon(t.icon||"archive",{size:32})}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 14px;">${t.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${t.description||t.id}
            </div>
            <div style="font-size: 10px; margin-top: 4px; color: var(--accent); opacity: 0.8; font-family: var(--font-mono);">
              ${t.source==="builtin"?"System Application":"User Application"}
            </div>
          </div>
        `,i.onclick=()=>z(t,"app"),l.appendChild(i)}),y.appendChild(l)}else if(c==="installed-exts"){const l=(await b.discover()).filter(i=>(i.metadata.name||i.uuid).toLowerCase().includes(e)),t=document.createElement("div");t.style.display="grid",t.style.gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))",t.style.gap="16px",l.forEach(i=>{const r=document.createElement("div");r.className="app-card",r.innerHTML=`
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center;">
            ${s.getIcon(i.metadata.icon||"plugin",{size:32})}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 14px;">${i.metadata.name||i.uuid}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">
              ${i.type.slice(0,-1).toUpperCase()} • ${i.metadata.version||"1.0.0"}
            </div>
            <div style="font-size: 10px; margin-top: 4px; color: var(--text-tertiary); font-family: var(--font-mono);">
              ${i.uuid}
            </div>
          </div>
        `,r.onclick=()=>z(i,"extension"),t.appendChild(r)}),y.appendChild(t)}else if(c==="get-apps"||c==="get-exts"){const n=c==="get-exts",t=(n?[{uuid:"weather@prozilla",name:"Weather",description:"Real-time weather forecast on your panel.",type:"applets",icon:"weather",author:"Prozilla",rating:4.8},{uuid:"system-monitor@prozilla",name:"System Monitor",description:"Monitor CPU, RAM and Network usage.",type:"applets",icon:"system-monitor",author:"Prozilla",rating:4.9},{uuid:"workspace-switcher@prozilla",name:"Workspace Switcher",description:"Visual switcher for virtual desktops.",type:"applets",icon:"window-list",author:"Prozilla",rating:4.5},{uuid:"notes@prozilla",name:"Desktop Notes",description:"Sticky notes for your desktop.",type:"desklets",icon:"text",author:"Prozilla",rating:4.7}]:[{id:"code-editor",name:"ProCode",description:"Professional code editor with syntax highlighting.",category:"Development",icon:"computer",author:"Prozilla",rating:4.9},{id:"spotify",name:"Spotify",description:"Music for everyone.",category:"Multimedia",icon:"music",author:"Spotify AB",rating:4.8},{id:"discord",name:"Discord",description:"All-in-one voice and text chat.",category:"Communication",icon:"chat",author:"Discord Inc.",rating:4.7},{id:"slack",name:"Slack",description:"Team communication and collaboration.",category:"Communication",icon:"tag",author:"Slack Technologies",rating:4.6}]).filter(o=>(o.name||o.uuid).toLowerCase().includes(e)),i=document.createElement("div");i.innerHTML=`
        <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, var(--accent) 0%, #1a2a3a 100%); border-radius: 16px; color: #fff;">
          <h2 style="margin-bottom: 8px;">Featured ${n?"Extension":"Application"}</h2>
          <p style="opacity: 0.8; margin-bottom: 16px; font-size: 13px;">Discover the best ${n?"extensions":"apps"} curated for ProzillaOS.</p>
          <button class="btn-primary" id="btn-learn-more" style="background: #fff; color: var(--accent);">Learn More</button>
        </div>
        <h3 style="margin-bottom: 16px; font-size: 15px;">Trending Now</h3>
      `,i.querySelector("#btn-learn-more").onclick=()=>{document.dispatchEvent(new CustomEvent("launch-app",{detail:{id:"web-browser",args:["/fs/home/user/Documents/app-center-details.html"]}}))};const r=document.createElement("div");r.style.display="grid",r.style.gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))",r.style.gap="16px",t.forEach(o=>{const a=document.createElement("div");a.className="app-card",a.innerHTML=`
          <div style="width: 48px; height: 48px; font-size: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-input); border-radius: 12px;">
            ${s.getIcon(o.icon||(n?"plugin":"archive"),{size:32})}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="font-weight: 700; font-size: 14px;">${o.name||o.uuid}</div>
              <div style="font-size: 10px; color: var(--warning); display:flex; align-items:center; gap:2px;">${s.getIcon("star",{size:10})} ${o.rating}</div>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
              ${o.author} • ${n?o.type.slice(0,-1).toUpperCase():o.category}
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="btn-primary btn-sm" style="flex: 1; height: 26px; padding: 0;">Install</button>
              <button class="btn-secondary btn-sm" style="height: 26px; width: 26px; padding: 0; display: flex; align-items: center; justify-content: center;">...</button>
            </div>
          </div>
        `;const g=a.querySelector(".btn-primary");g.onclick=x=>{x.stopPropagation(),m({title:"App Center",message:"Remote installation is not implemented yet!",type:"alert"})},a.onclick=()=>z(o,n?"online-extension":"online-app"),r.appendChild(a)}),i.appendChild(r),y.appendChild(i)}else y.innerHTML=`
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; text-align: center;">
          <div style="font-size: 80px; margin-bottom: 24px;">${s.getIcon("settings-cog",{size:80})}</div>
          <h2 style="margin-bottom: 8px;">View Not Found</h2>
          <p style="max-width: 300px; color: var(--text-secondary);">This section is currently unavailable.</p>
        </div>
      `},z=(e,n)=>{var g,x,C;const l=n.startsWith("online-"),t=n==="app"||n==="online-app",i=t?e.name:((g=e.metadata)==null?void 0:g.name)||e.uuid,r=t?e.description:((x=e.metadata)==null?void 0:x.description)||"No description available.",o=t?e.icon:((C=e.metadata)==null?void 0:C.icon)||"plugin",a=document.createElement("div");if(a.style.cssText=`
      position: absolute;
      inset: 0;
      background: var(--bg-surface);
      z-index: 10;
      padding: 40px;
      display: flex;
      flex-direction: column;
      animation: details-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `,a.innerHTML=`
      <div style="margin-bottom: 32px;">
        <button id="btn-back" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${s.getIcon("back",{size:12})} Back to List</button>
      </div>
      <div style="display: flex; gap: 32px; align-items: start;">
        <div style="width: 120px; height: 120px; background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 64px;">
          ${s.getIcon(o,{size:64})}
        </div>
        <div style="flex: 1;">
          <h1 style="margin-bottom: 8px; font-size: 28px;">${i}</h1>
          <p style="color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">${r}</p>
          
          <div style="display: flex; gap: 12px;">
            ${l?`
              <button class="btn-primary" id="btn-install-online">Install</button>
            `:t?`
              <button class="btn-primary" id="btn-launch">Launch Application</button>
              ${e.source!=="builtin"?'<button class="btn-danger" id="btn-uninstall" style="background:var(--danger); border-color:var(--danger); color:white; padding: 8px 16px; border-radius:var(--radius-sm); cursor:pointer; font-size:13px; font-weight:600;">Uninstall</button>':""}
            `:`
              <button class="btn-primary" id="btn-toggle-ext">${e.isLoaded?"Unload":"Load"}</button>
            `}
          </div>
        </div>
      </div>
      
      <div style="margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px;">
        <h3 style="margin-bottom: 16px;">Details</h3>
        <div style="display: grid; grid-template-columns: 150px 1fr; gap: 12px; font-size: 13px;">
          <div style="color: var(--text-tertiary);">Identifier</div>
          <div style="font-family: var(--font-mono);">${t?e.id:e.uuid}</div>
          <div style="color: var(--text-tertiary);">Version</div>
          <div>${t?"1.0.0":e.metadata.version||"1.0.0"}</div>
          <div style="color: var(--text-tertiary);">Category</div>
          <div>${t?e.category||"Utility":e.type}</div>
          <div style="color: var(--text-tertiary);">Source</div>
          <div>${t?e.source==="builtin"?"System":"User":"VFS (Plugins)"}</div>
        </div>
      </div>

      <style>
        @keyframes details-in {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `,a.querySelector("#btn-back").onclick=()=>a.remove(),l)a.querySelector("#btn-install-online").onclick=()=>{m({title:"App Center",message:"Remote installation is not implemented yet!",type:"alert"})};else if(t){a.querySelector("#btn-launch").onclick=()=>{document.dispatchEvent(new CustomEvent("launch-app",{detail:{id:e.id}})),a.remove()};const p=a.querySelector("#btn-uninstall");p&&(p.onclick=()=>{m({title:"Uninstall Application",message:`Are you sure you want to uninstall "${e.name}"? This will delete the application and all its source files.`,type:"confirm",confirmText:"Uninstall",onConfirm:async()=>{try{const v=h.getAppPath(e.id);if(v){await k.rm(v);try{await k.rm(`~/Desktop/${e.name}.desktop`)}catch{}await h.init(),a.remove(),u()}}catch(v){m({title:"Error",message:"Failed to uninstall: "+v.message,type:"alert"})}}})})}else{const p=a.querySelector("#btn-toggle-ext");p.onclick=async()=>{p.disabled=!0;try{e.isLoaded?await b.unload(e.uuid):await b.loadFromVfs(e.uuid,e.path,e.type),a.remove(),u()}catch(v){alert(v.message),p.disabled=!1}}}d.appendChild(a)};$.onclick=e=>{const n=e.target.closest(".nav-item");n&&L(n.dataset.view)},w.oninput=()=>u(),u()}export{P as launch};
