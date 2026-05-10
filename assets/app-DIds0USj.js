import{I as n,s as k,a as U}from"./index-DY9sEeDM.js";window.desktopClipboard=window.desktopClipboard||{type:null,path:null,name:null,items:[]};const H=B=>{window.desktopClipboard=B};function Z(B,V={}){const{windowManager:Q,vfs:i,appLoader:S}=B,W=V.path||"computer://",l=document.createElement("div");l.style.cssText=`
    height: 100%;
    display: flex;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,l.innerHTML=`
    <!-- Sidebar -->
    <div style="width: 200px; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0; background: var(--bg-card);">
      <div class="sidebar-item" data-path="computer://">${n.getIcon("computer,🖥️",{size:16,className:"sidebar-icon"})} Computer</div>
      <div class="sidebar-item active" data-path="/home/user">${n.getIcon("home,🏠",{size:16,className:"sidebar-icon"})} Home</div>
      <div class="sidebar-item" data-path="/home/user/Desktop">${n.getIcon("desktop,🖥️",{size:16,className:"sidebar-icon"})} Desktop</div>
      <div class="sidebar-item" data-path="/home/user/Documents">${n.getIcon("folder,📁",{size:16,className:"sidebar-icon"})} Documents</div>
      <div class="sidebar-item" data-path="/home/user/Downloads">${n.getIcon("download,📥",{size:16,className:"sidebar-icon"})} Downloads</div>
      <div class="sidebar-item" data-path="/home/user/Music">${n.getIcon("music,🎵",{size:16,className:"sidebar-icon"})} Music</div>
      <div class="sidebar-item" data-path="/home/user/Videos">${n.getIcon("video,🎬",{size:16,className:"sidebar-icon"})} Videos</div>
      <div class="sidebar-item" data-path="/home/user/Pictures">${n.getIcon("image,🖼️",{size:16,className:"sidebar-icon"})} Pictures</div>
      <div class="sidebar-item" data-path="/system">${n.getIcon("system,⚙️",{size:16,className:"sidebar-icon"})} System</div>
      <div style="flex: 1;"></div>
      <div class="sidebar-item" data-path="/home/user/.local/share/Trash/files">${n.getIcon("trash,🗑️",{size:16,className:"sidebar-icon"})} Trash</div>
    </div>

    <!-- Main Content -->
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- Toolbar -->
      <div style="height: 50px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
        <button id="fm-up" class="btn-secondary btn-sm" title="Up One Level">${n.getIcon("up,⬆️",{size:14})}</button>
        <div style="flex: 1; position: relative; display: flex; align-items: center;">
          <input type="text" id="fm-path" style="width: 100%; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-primary); font-size: 12px; outline: none; font-family: var(--font-mono);">
        </div>
        <div id="fm-actions" style="display: flex; gap: 8px;">
          <button id="fm-mkdir" class="btn-secondary btn-sm">${n.getIcon("folder,📁",{size:14})} New Folder</button>
          <button id="fm-upload" class="btn-primary btn-sm">${n.getIcon("upload,📤",{size:14})} Upload</button>
          <button id="fm-empty-trash" class="btn-danger btn-sm" style="display: none;">${n.getIcon("trash,🗑️",{size:14})} Empty Trash</button>
        </div>
      </div>

      <!-- File List -->
      <div id="fm-list" style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px; padding: 20px; align-content: start;">
      </div>
      
      <!-- Status Bar -->
      <div id="fm-status" style="height: 24px; padding: 0 16px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-tertiary); display: flex; align-items: center; background: var(--bg-card);">
        0 items
      </div>
    </div>

    <style>
      .sidebar-item {
        padding: 8px 20px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
        border-left: 3px solid transparent;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .sidebar-icon {
        flex-shrink: 0;
      }
      .sidebar-item:hover { background: var(--bg-surface-hover); }
      .sidebar-item.active {
        background: rgba(var(--accent-rgb), 0.1);
        border-left-color: var(--accent);
        color: var(--accent);
        font-weight: 600;
      }
      .fm-file-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.1s, background 0.2s;
        text-align: center;
        user-select: none;
      }
      .fm-file-item:hover { background: var(--bg-surface-hover); }
      .fm-file-item.selected { background: rgba(var(--accent-rgb), 0.15) !important; box-shadow: inset 0 0 0 1px var(--accent); }
      .fm-file-item:active { transform: scale(0.95); }
    </style>
    <input type="file" id="fm-file-input" style="display:none" multiple>
  `,Q.createWindow({id:`file-manager-${Date.now()}`,title:"Files",icon:"folder,📁",width:850,height:550,content:l});const r=l.querySelector("#fm-list"),F=l.querySelector("#fm-path"),D=l.querySelector("#fm-status"),E=l.querySelector("#fm-empty-trash");l.querySelector("#fm-actions");let s=W;const Y=async()=>{var M,j;const d=(await i.getInfo()).root!=="browser-storage",a={storageLimitServer:2048*1024*1024,storageLimitLocal:100*1024*1024};let e;try{const t=await i.getInfo();if(t&&t.root!=="browser-storage")e={label:"Server File System",color:"#44ff44",persistent:!0};else throw new Error}catch{i.db?e={label:"IndexedDB (Browser Storage)",color:"#ffaa00",persistent:!1}:i.useLocalStorage?e={label:"LocalStorage",color:"#ff6644",persistent:!1}:e={label:"In-Memory (Volatile)",color:"#ff4444",persistent:!1}}r.innerHTML=`
      <div style="grid-column: 1/-1; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h2 style="margin-top: 0; display: flex; align-items: center; gap: 12px; font-weight: 700; color: #fff;">
          ${n.getIcon("computer,💻",{size:48})} Everest OS
        </h2>
        
        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Virtual File System</div>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-weight: 600;">Disk Usage</span>
            <span id="fm-storage-val" style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 13px;">Calculating...</span>
          </div>
          <div style="height: 10px; background: var(--bg-elevated); border-radius: 5px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);">
            <div id="fm-storage-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), ${e.color}); transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
          </div>
          <div style="margin-top:16px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
              <div style="width:10px; height:10px; border-radius:50%; background:${e.color}; box-shadow:0 0 8px ${e.color};"></div>
              <div>
                <div style="font-size:13px; font-weight:600;">Active Backend: ${e.label}</div>
                <div style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">
                  ${e.persistent?"✅ Files persist on disk — safe across reloads and browser clears":"⚠️ Files stored in browser — survive reload, but may be lost if browser data is cleared"}
                </div>
              </div>
            </div>
            <div id="fm-file-count" style="font-size:11px; color:var(--text-secondary); padding:0 4px;">Counting files...</div>
          </div>
        </div>

        ${d?"":`
        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Storage Quota</div>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; font-weight:600;">Browser Quota</span>
            <span id="fm-quota-val" style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);">Checking...</span>
          </div>
          <div style="height:8px; background:var(--bg-elevated); border-radius:4px; overflow:hidden;">
            <div id="fm-quota-bar" style="height:100%; width:0%; background:linear-gradient(90deg, #22c55e, #3b82f6); transition:width 0.8s;"></div>
          </div>
          <div id="fm-quota-detail" style="font-size:11px; color:var(--text-tertiary);"></div>
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.1); padding:10px 14px; border-radius:8px;">
            <div>
              <div style="font-size:12px; font-weight:600;">Persistent Storage</div>
              <div style="font-size:10px; color:var(--text-tertiary); margin-top:2px;">Prevents browser from auto-clearing your files</div>
            </div>
            <button id="fm-btn-persist" class="btn-secondary btn-sm" style="padding:6px 14px; font-size:11px;">Enable</button>
          </div>
        </div>
        `}

        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Drives & Partitions</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;" id="fm-drives-list">
          <div class="fm-drive-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 14px;" data-path="/">
            <div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${n.getIcon("disk,💽",{size:32})}</div>
            <div>
              <div style="font-weight: 600; font-size: 13px;">Root Partition</div>
              <div style="font-size: 11px; color: var(--text-secondary);">/ (Primary)</div>
            </div>
          </div>
        </div>

        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Backup & Recovery</div>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">Export a portable backup that works across all storage modes. A backup from IndexedDB can restore to Server FS and vice versa.</p>
          <div style="display: flex; gap: 12px;">
            <button id="fm-btn-export" class="btn-secondary" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">${n.getIcon("upload,📤",{size:14})} Export Backup</button>
            <button id="fm-btn-import" class="btn-secondary" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">${n.getIcon("download,📥",{size:14})} Import Backup</button>
          </div>
          <div id="fm-backup-status" style="font-size:11px; color:var(--text-tertiary); display:none; padding:8px 12px; background:rgba(0,0,0,0.1); border-radius:6px;"></div>
          <input type="file" id="fm-import-file" style="display: none;" accept=".json">
        </div>

        ${d?"":`
        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ff4444; margin-bottom: 12px;">Reset & Recovery</div>
        <div style="background: var(--bg-card); border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
            Accidentally deleted an important system file? Reset will restore the original system image. All your custom files, settings, and modifications will be removed.
          </p>
          <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">⚠️</span>
            <span style="font-size: 11px; color: var(--text-secondary);">We recommend exporting a backup before resetting. Use the <strong>Export Backup</strong> button above to save your files first.</span>
          </div>
          <button id="fm-btn-reset" class="btn-danger" style="width: 100%; padding: 10px; font-weight: 600;">
            ${n.getIcon("restart,🔄",{size:14})} Reset System & Fetch Fresh
          </button>
        </div>
        `}
      </div>

      <style>
        .fm-drive-card:hover { 
          background: var(--bg-surface-hover); 
          transform: translateY(-2px); 
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      </style>
    `;const b=r.querySelector("#fm-storage-val"),g=r.querySelector("#fm-storage-bar"),y=r.querySelector("#fm-file-count"),f=r.querySelector("#fm-backup-status"),m=t=>{f.style.display="block",f.textContent=t},p=t=>t>=1024*1024*1024?(t/1024/1024/1024).toFixed(1)+" GB":t>=1024*1024?(t/1024/1024).toFixed(0)+" MB":t>=1024?(t/1024).toFixed(0)+" KB":t+" B";let C=0,N=0;const R=async t=>{try{const x=await i.readdir(t);for(const u of x)u.type==="dir"?await R(u.path):(C+=u.size||0,N++)}catch{}};await R("/");let A=d?a.storageLimitServer:a.storageLimitLocal;if(!d&&((M=navigator.storage)!=null&&M.estimate))try{const t=await navigator.storage.estimate();t.quota&&(A=t.quota)}catch{}const K=Math.min(100,C/A*100);b.textContent=`${(C/1024/1024).toFixed(2)} MB of ${p(A)} used`,g.style.width=K+"%",y.textContent=`${N} files indexed`;const T=r.querySelector("#fm-quota-val"),G=r.querySelector("#fm-quota-bar"),J=r.querySelector("#fm-quota-detail"),v=r.querySelector("#fm-btn-persist");if(T&&((j=navigator.storage)!=null&&j.estimate))try{const t=await navigator.storage.estimate(),x=t.usage||0,u=t.quota||0,I=u>0?Math.min(100,x/u*100):0;T.textContent=`${p(x)} / ${p(u)}`,G.style.width=I.toFixed(1)+"%",J.textContent=`${p(u-x)} available · Browser allocates quota based on your free disk space`}catch{T.textContent="Not available"}if(v){try{await navigator.storage.persisted()&&(v.textContent="✅ Enabled",v.disabled=!0,v.style.opacity="0.7")}catch{}v.onclick=async()=>{try{await navigator.storage.persist()?(v.textContent="✅ Enabled",v.disabled=!0,v.style.opacity="0.7"):(v.textContent="❌ Denied",setTimeout(()=>{v.textContent="Try Again"},2e3),k({title:"Storage Persistence Denied",message:"Your browser denied the request to make storage persistent.\\n\\nBrowsers usually require you to bookmark the page, install it as a Web App (PWA), or interact with it more before granting this permission.\\n\\nTry bookmarking the page and trying again!",type:"alert"}))}catch{v.textContent="❌ Not supported"}}}r.querySelector("#fm-btn-export").onclick=async()=>{try{m("⏳ Collecting files...");const t=[],x=async L=>{try{const X=await i.readdir(L);for(const q of X)if(q.type==="dir")t.push({path:q.path,type:"dir"}),await x(q.path);else try{const O=await i.readFile(q.path);t.push({path:q.path,type:"file",content:O,size:O.length})}catch{}}catch{}};await x("/");const u={version:"1.0",os:"EverestOS",timestamp:new Date().toISOString(),fileCount:t.length,files:t},I=JSON.stringify(u,null,2),h=new Blob([I],{type:"application/json"}),w=URL.createObjectURL(h),$=document.createElement("a");$.href=w,$.download=`everest-backup-${new Date().toISOString().split("T")[0]}.json`,$.click(),URL.revokeObjectURL(w),m(`✅ Backup downloaded — ${t.length} files, ${(h.size/1024).toFixed(1)} KB`)}catch(t){m(`❌ Export failed: ${t.message}`)}};const P=r.querySelector("#fm-import-file");r.querySelector("#fm-btn-import").onclick=()=>P.click(),P.onchange=async t=>{const x=t.target.files[0];if(!x)return;const u=new FileReader;u.onload=async I=>{try{const h=JSON.parse(I.target.result);let w;if(Array.isArray(h))w={files:h,timestamp:"legacy",os:"unknown"};else if(h.files)w=h;else throw new Error("Invalid backup format");k({title:"Import Backup",message:`Restore ${w.files.length} items from ${w.os||"unknown"} (${w.timestamp||"unknown"})? Files will be written to the active storage backend (${e.label}).`,type:"confirm",onConfirm:async()=>{m("⏳ Restoring files...");try{const{restored:$,errors:L}=await i.importBackup(w);m(`✅ Restored ${$} items${L>0?`, ${L} errors`:""}. Reloading...`),setTimeout(()=>location.reload(),1500)}catch($){m(`❌ Import failed: ${$.message}`)}}})}catch(h){m(`❌ Import failed: ${h.message}`)}},u.readAsText(x)};const z=r.querySelector("#fm-btn-reset");z&&(z.onclick=()=>{k({title:"Reset System & Fetch Fresh",message:`This will erase ALL local data (files, settings, plugins) and re-download the original system image.

⚠️ Have you exported a backup? This cannot be undone.`,type:"confirm",onConfirm:async()=>{z.disabled=!0,z.textContent="⏳ Clearing & re-fetching...";try{await i.wipe(),location.reload()}catch{z.disabled=!1,z.textContent="❌ Failed — try again"}}})}),r.querySelector(".fm-drive-card").onclick=()=>{s="/",c()}},c=async()=>{if(!l.isConnected)return;if(s==="computer://"){F.value="computer://",Y(),l.querySelectorAll(".sidebar-item").forEach(d=>{d.classList.toggle("active",d.dataset.path==="computer://")}),D.textContent="System Status",E.style.display="none",l.querySelector("#fm-mkdir").style.display="none",l.querySelector("#fm-upload").style.display="none";return}F.value=s;const o=s.includes("/Trash/files");l.querySelectorAll(".sidebar-item").forEach(d=>{d.classList.toggle("active",d.dataset.path===s)}),E.style.display=o?"block":"none",l.querySelector("#fm-mkdir").style.display=o?"none":"block",l.querySelector("#fm-upload").style.display=o?"none":"block";try{const d=await i.readdir(s);r.innerHTML="",D.textContent=`${d.length} item(s)`,d.length===0&&(r.innerHTML='<div style="grid-column: 1/-1; text-align: center; margin-top: 100px; color: var(--text-tertiary); font-size: 13px;">This folder is empty.</div>'),d.forEach(a=>{const e=document.createElement("div");e.className="fm-file-item",e.dataset.path=a.path,e.dataset.name=a.name;let b="";const g=a.name.split(".").pop().toLowerCase();if(a.type==="dir")b=n.getIcon("folder,📁",{size:40});else if(["png","jpg","jpeg","gif","svg","webp"].includes(g)){const y=`fm-img-${Math.random().toString(36).substr(2,9)}`;b=`<img id="${y}" src="${n.getRaw("image")}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; box-shadow: var(--shadow-sm);" />`,i.readFile(a.path).then(f=>{const m=document.getElementById(y);m&&(m.src=f)}).catch(()=>{})}else b=n.getIcon(g,{size:40});e.innerHTML=`
          <div style="font-size:36px; margin-bottom:8px; height:40px; display:flex; align-items:center; justify-content:center;">${b}</div>
          <div style="font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:center;">${a.name}</div>
        `,e.onclick=y=>{y.stopPropagation(),y.ctrlKey||r.querySelectorAll(".fm-file-item").forEach(f=>f.classList.remove("selected")),e.classList.add("selected"),window.lastFocusedScope={type:"files",currentPath:s,renderFiles:c,fmList:r,vfs:i}},e.ondblclick=()=>{a.type==="dir"?(s=a.path,c()):["mp3","ogg","wav","m4a","aac"].includes(g)?S.launchApp("music-player",{path:a.path}):["mp4","webm","mov","mkv"].includes(g)?S.launchApp("video-player",{path:a.path}):["png","jpg","jpeg","gif","svg","webp"].includes(g)?S.launchApp("image-viewer",{path:a.path}):g==="pdf"?S.launchApp("pdf-viewer",{path:a.path}):g==="html"?S.launchApp("web-browser",{url:a.path}):g==="zip"?S.launchApp("zip-manager",{path:a.path}):["doc","docx","odt","ppt","pptx","xls","xlsx"].includes(g)?S.launchApp("office",{path:a.path}):S.launchApp("text-editor",{path:a.path})},e.oncontextmenu=y=>{y.preventDefault(),y.stopPropagation(),e.classList.contains("selected")||(r.querySelectorAll(".fm-file-item").forEach(p=>p.classList.remove("selected")),e.classList.add("selected"));const f=Array.from(r.querySelectorAll(".fm-file-item.selected")).map(p=>({path:p.dataset.path,name:p.dataset.name})),m=[{icon:"folder,📁",label:"Open",action:()=>e.ondblclick()},{separator:!0}];o?m.push({icon:"undo,↩️",label:"Restore",action:async()=>{for(const p of f)await i.restore(p.path);c()}},{icon:"trash,🗑️",label:"Delete Permanently",danger:!0,action:()=>{k({title:"Delete Permanently",message:`Delete ${f.length} item(s) permanently?`,type:"confirm",onConfirm:async()=>{for(const p of f)await i.rm(p.path);c()}})}}):m.push({icon:"edit,📝",label:"Rename",action:()=>{k({title:"Rename",type:"prompt",value:a.name,onConfirm:async p=>{if(p){const C=a.path.substring(0,a.path.lastIndexOf("/"));await i.rename(a.path,`${C}/${p}`),c()}}})}},{icon:"copy,📄",label:"Copy",action:()=>H({type:"copy",items:f,name:f[0].name,path:f[0].path})},{icon:"cut,✂️",label:"Cut",action:()=>H({type:"cut",items:f,name:f[0].name,path:f[0].path})},{separator:!0},{icon:"trash,🗑️",label:"Move to Trash",danger:!0,action:async()=>{for(const p of f)await i.trash(p.path);c()}}),U(m,y.clientX,y.clientY)},r.appendChild(e)})}catch(d){console.error(d)}};i.onChange(o=>{(o===s||o.startsWith(s+"/"))&&c()}),window.addEventListener("icon-theme-changed",()=>{c()}),r.oncontextmenu=o=>{var a;if(o.target!==r)return;o.preventDefault();const d=[{icon:"folder,📁",label:"New Folder",action:()=>{k({title:"New Folder",type:"prompt",onConfirm:async e=>{e&&(await i.mkdir(`${s}/${e}`),c())}})}},{icon:"file,📄",label:"New Text File",action:()=>{k({title:"New File",type:"prompt",onConfirm:async e=>{e&&(await i.writeFile(`${s}/${e}.txt`,""),c())}})}},{separator:!0},{icon:"paste,📋",label:"Paste",disabled:!((a=window.desktopClipboard)!=null&&a.path),action:async()=>{const e=window.desktopClipboard;if(e)try{const b=`${s}/${e.name}`;if(e.type==="copy"){const g=await i.readFile(e.path);await i.writeFile(b,g)}else await i.rename(e.path,b),window.desktopClipboard=null;c()}catch(b){console.error(b)}}}];U(d,o.clientX,o.clientY)},l.querySelectorAll(".sidebar-item").forEach(o=>{o.onclick=()=>{s=o.dataset.path,c()}}),l.querySelector("#fm-up").onclick=()=>{s!=="computer://"&&s!=="/"&&(s=s.substring(0,s.lastIndexOf("/"))||"/",c())},F.onkeydown=o=>{o.key==="Enter"&&(s=i.resolvePath(F.value),c())},l.querySelector("#fm-mkdir").onclick=()=>{k({title:"New Folder",type:"prompt",onConfirm:async o=>{o&&(await i.mkdir(`${s}/${o}`),c())}})},E.onclick=()=>{k({title:"Empty Trash",message:"Are you sure you want to delete everything in the Trash?",type:"confirm",onConfirm:async()=>{await i.emptyTrash(),c()}})},l.querySelector("#fm-upload").onclick=()=>l.querySelector("#fm-file-input").click(),l.querySelector("#fm-file-input").onchange=async o=>{for(const d of o.target.files){const a=new FileReader;a.onload=async e=>{await i.writeFile(`${s}/${d.name}`,e.target.result),c()},a.readAsDataURL(d)}},c()}export{Z as launch};
