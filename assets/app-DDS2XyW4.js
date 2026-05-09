import{I as s,s as k,a as B}from"./index-Cxhu8mxZ.js";window.desktopClipboard=window.desktopClipboard||{type:null,path:null,name:null,items:[]};const N=L=>{window.desktopClipboard=L};function Y(L,M={}){const{windowManager:P,vfs:a,appLoader:h}=L,j=M.path||"computer://",r=document.createElement("div");r.style.cssText=`
    height: 100%;
    display: flex;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,r.innerHTML=`
    <!-- Sidebar -->
    <div style="width: 200px; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0; background: var(--bg-card);">
      <div class="sidebar-item" data-path="computer://">${s.getIcon("computer,🖥️",{size:16,className:"sidebar-icon"})} Computer</div>
      <div class="sidebar-item active" data-path="/home/user">${s.getIcon("home,🏠",{size:16,className:"sidebar-icon"})} Home</div>
      <div class="sidebar-item" data-path="/home/user/Desktop">${s.getIcon("desktop,🖥️",{size:16,className:"sidebar-icon"})} Desktop</div>
      <div class="sidebar-item" data-path="/home/user/Documents">${s.getIcon("folder,📁",{size:16,className:"sidebar-icon"})} Documents</div>
      <div class="sidebar-item" data-path="/home/user/Downloads">${s.getIcon("download,📥",{size:16,className:"sidebar-icon"})} Downloads</div>
      <div class="sidebar-item" data-path="/home/user/Music">${s.getIcon("music,🎵",{size:16,className:"sidebar-icon"})} Music</div>
      <div class="sidebar-item" data-path="/home/user/Videos">${s.getIcon("video,🎬",{size:16,className:"sidebar-icon"})} Videos</div>
      <div class="sidebar-item" data-path="/home/user/Pictures">${s.getIcon("image,🖼️",{size:16,className:"sidebar-icon"})} Pictures</div>
      <div style="flex: 1;"></div>
      <div class="sidebar-item" data-path="/home/user/.local/share/Trash/files">${s.getIcon("trash,🗑️",{size:16,className:"sidebar-icon"})} Trash</div>
    </div>

    <!-- Main Content -->
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- Toolbar -->
      <div style="height: 50px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
        <button id="fm-up" class="btn-secondary btn-sm" title="Up One Level">${s.getIcon("up,⬆️",{size:14})}</button>
        <div style="flex: 1; position: relative; display: flex; align-items: center;">
          <input type="text" id="fm-path" style="width: 100%; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-primary); font-size: 12px; outline: none; font-family: var(--font-mono);">
        </div>
        <div id="fm-actions" style="display: flex; gap: 8px;">
          <button id="fm-mkdir" class="btn-secondary btn-sm">${s.getIcon("folder,📁",{size:14})} New Folder</button>
          <button id="fm-upload" class="btn-primary btn-sm">${s.getIcon("upload,📤",{size:14})} Upload</button>
          <button id="fm-empty-trash" class="btn-danger btn-sm" style="display: none;">${s.getIcon("trash,🗑️",{size:14})} Empty Trash</button>
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
  `,P.createWindow({id:`file-manager-${Date.now()}`,title:"Files",icon:"folder,📁",width:850,height:550,content:r});const n=r.querySelector("#fm-list"),z=r.querySelector("#fm-path"),A=r.querySelector("#fm-status"),F=r.querySelector("#fm-empty-trash");r.querySelector("#fm-actions");let o=j;const O=async()=>{const c=(await a.getInfo()).root!=="browser-storage",t={storageLimitServer:2048*1024*1024,storageLimitLocal:100*1024*1024};let e;try{const d=await a.getInfo();if(d&&d.root!=="browser-storage")e={label:"Server File System",color:"#44ff44",persistent:!0};else throw new Error}catch{a.db?e={label:"IndexedDB (Browser Storage)",color:"#ffaa00",persistent:!1}:a.useLocalStorage?e={label:"LocalStorage",color:"#ff6644",persistent:!1}:e={label:"In-Memory (Volatile)",color:"#ff4444",persistent:!1}}n.innerHTML=`
      <div style="grid-column: 1/-1; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h2 style="margin-top: 0; display: flex; align-items: center; gap: 12px; font-weight: 700; color: #fff;">
          ${s.getIcon("computer,💻",{size:48})} Everest OS
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

        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 12px;">Drives & Partitions</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;" id="fm-drives-list">
          <div class="fm-drive-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 14px;" data-path="/">
            <div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${s.getIcon("disk,💽",{size:32})}</div>
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
            <button id="fm-btn-export" class="btn-secondary" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">${s.getIcon("upload,📤",{size:14})} Export Backup</button>
            <button id="fm-btn-import" class="btn-secondary" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">${s.getIcon("download,📥",{size:14})} Import Backup</button>
          </div>
          <div id="fm-backup-status" style="font-size:11px; color:var(--text-tertiary); display:none; padding:8px 12px; background:rgba(0,0,0,0.1); border-radius:6px;"></div>
          <input type="file" id="fm-import-file" style="display: none;" accept=".json">
        </div>

        <div class="settings-section-title" style="margin-top: 30px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ff4444; margin-bottom: 12px;">Danger Zone</div>
        <div style="background: var(--bg-card); border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 12px; padding: 20px;">
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Resetting the system will clear all virtual files, settings, and apps. This action cannot be undone.</p>
          <button id="fm-btn-reset" class="btn-danger" style="width: 100%; padding: 10px; font-weight: 600;">Reset System & Reload</button>
        </div>
      </div>

      <style>
        .fm-drive-card:hover { 
          background: var(--bg-surface-hover); 
          transform: translateY(-2px); 
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      </style>
    `;const y=n.querySelector("#fm-storage-val"),u=n.querySelector("#fm-storage-bar"),g=n.querySelector("#fm-file-count"),p=n.querySelector("#fm-backup-status"),f=d=>{p.style.display="block",p.textContent=d};let m=0,I=0;const E=async d=>{try{const v=await a.readdir(d);for(const w of v)w.type==="dir"?await E(w.path):(m+=w.size||0,I++)}catch{}};await E("/");const T=c?t.storageLimitServer:t.storageLimitLocal,U=Math.min(100,m/T*100);y.textContent=`${(m/1024/1024).toFixed(2)} MB of ${(T/1024/1024).toFixed(0)} MB used`,u.style.width=U+"%",g.textContent=`${I} files indexed`,n.querySelector("#fm-btn-export").onclick=async()=>{try{f("⏳ Collecting files...");const d=[],v=async C=>{try{const H=await a.readdir(C);for(const $ of H)if($.type==="dir")d.push({path:$.path,type:"dir"}),await v($.path);else try{const R=await a.readFile($.path);d.push({path:$.path,type:"file",content:R,size:R.length})}catch{}}catch{}};await v("/");const w={version:"1.0",os:"EverestOS",timestamp:new Date().toISOString(),fileCount:d.length,files:d},q=JSON.stringify(w,null,2),b=new Blob([q],{type:"application/json"}),x=URL.createObjectURL(b),S=document.createElement("a");S.href=x,S.download=`everest-backup-${new Date().toISOString().split("T")[0]}.json`,S.click(),URL.revokeObjectURL(x),f(`✅ Backup downloaded — ${d.length} files, ${(b.size/1024).toFixed(1)} KB`)}catch(d){f(`❌ Export failed: ${d.message}`)}};const D=n.querySelector("#fm-import-file");n.querySelector("#fm-btn-import").onclick=()=>D.click(),D.onchange=async d=>{const v=d.target.files[0];if(!v)return;const w=new FileReader;w.onload=async q=>{try{const b=JSON.parse(q.target.result);let x;if(Array.isArray(b))x={files:b,timestamp:"legacy",os:"unknown"};else if(b.files)x=b;else throw new Error("Invalid backup format");k({title:"Import Backup",message:`Restore ${x.files.length} items from ${x.os||"unknown"} (${x.timestamp||"unknown"})? Files will be written to the active storage backend (${e.label}).`,type:"confirm",onConfirm:async()=>{f("⏳ Restoring files...");try{const{restored:S,errors:C}=await a.importBackup(x);f(`✅ Restored ${S} items${C>0?`, ${C} errors`:""}. Reloading...`),setTimeout(()=>location.reload(),1500)}catch(S){f(`❌ Import failed: ${S.message}`)}}})}catch(b){f(`❌ Import failed: ${b.message}`)}},w.readAsText(v)},n.querySelector("#fm-btn-reset").onclick=()=>{k({title:"Reset System",message:"Are you absolutely sure you want to reset the system? ALL DATA WILL BE LOST.",type:"confirm",onConfirm:async()=>{const d=indexedDB.deleteDatabase("PlaygroundVFS");d.onsuccess=()=>location.reload()}})},n.querySelector(".fm-drive-card").onclick=()=>{o="/",l()}},l=async()=>{if(!r.isConnected)return;if(o==="computer://"){z.value="computer://",O(),r.querySelectorAll(".sidebar-item").forEach(c=>{c.classList.toggle("active",c.dataset.path==="computer://")}),A.textContent="System Status",F.style.display="none",r.querySelector("#fm-mkdir").style.display="none",r.querySelector("#fm-upload").style.display="none";return}z.value=o;const i=o.includes("/Trash/files");r.querySelectorAll(".sidebar-item").forEach(c=>{c.classList.toggle("active",c.dataset.path===o)}),F.style.display=i?"block":"none",r.querySelector("#fm-mkdir").style.display=i?"none":"block",r.querySelector("#fm-upload").style.display=i?"none":"block";try{const c=await a.readdir(o);n.innerHTML="",A.textContent=`${c.length} item(s)`,c.length===0&&(n.innerHTML='<div style="grid-column: 1/-1; text-align: center; margin-top: 100px; color: var(--text-tertiary); font-size: 13px;">This folder is empty.</div>'),c.forEach(t=>{const e=document.createElement("div");e.className="fm-file-item",e.dataset.path=t.path,e.dataset.name=t.name;let y="";const u=t.name.split(".").pop().toLowerCase();if(t.type==="dir")y=s.getIcon("folder,📁",{size:40});else if(["png","jpg","jpeg","gif","svg","webp"].includes(u)){const g=`fm-img-${Math.random().toString(36).substr(2,9)}`;y=`<img id="${g}" src="${s.getRaw("image")}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; box-shadow: var(--shadow-sm);" />`,a.readFile(t.path).then(p=>{const f=document.getElementById(g);f&&(f.src=p)}).catch(()=>{})}else y=s.getIcon(u,{size:40});e.innerHTML=`
          <div style="font-size:36px; margin-bottom:8px; height:40px; display:flex; align-items:center; justify-content:center;">${y}</div>
          <div style="font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:center;">${t.name}</div>
        `,e.onclick=g=>{g.stopPropagation(),g.ctrlKey||n.querySelectorAll(".fm-file-item").forEach(p=>p.classList.remove("selected")),e.classList.add("selected"),window.lastFocusedScope={type:"files",currentPath:o,renderFiles:l,fmList:n,vfs:a}},e.ondblclick=()=>{t.type==="dir"?(o=t.path,l()):["mp3","ogg","wav","m4a","aac"].includes(u)?h.launchApp("music-player",{path:t.path}):["mp4","webm","mov","mkv"].includes(u)?h.launchApp("video-player",{path:t.path}):["png","jpg","jpeg","gif","svg","webp"].includes(u)?h.launchApp("image-viewer",{path:t.path}):u==="pdf"?h.launchApp("pdf-viewer",{path:t.path}):u==="html"?h.launchApp("web-browser",{url:t.path}):["zip","rar","tar","gz","7z"].includes(u)?h.launchApp("zip-manager",{path:t.path}):["doc","docx","odt","ppt","pptx","xls","xlsx"].includes(u)?h.launchApp("office",{path:t.path}):h.launchApp("text-editor",{path:t.path})},e.oncontextmenu=g=>{g.preventDefault(),g.stopPropagation(),e.classList.contains("selected")||(n.querySelectorAll(".fm-file-item").forEach(m=>m.classList.remove("selected")),e.classList.add("selected"));const p=Array.from(n.querySelectorAll(".fm-file-item.selected")).map(m=>({path:m.dataset.path,name:m.dataset.name})),f=[{icon:"folder,📁",label:"Open",action:()=>e.ondblclick()},{separator:!0}];i?f.push({icon:"undo,↩️",label:"Restore",action:async()=>{for(const m of p)await a.restore(m.path);l()}},{icon:"trash,🗑️",label:"Delete Permanently",danger:!0,action:()=>{k({title:"Delete Permanently",message:`Delete ${p.length} item(s) permanently?`,type:"confirm",onConfirm:async()=>{for(const m of p)await a.rm(m.path);l()}})}}):f.push({icon:"edit,📝",label:"Rename",action:()=>{k({title:"Rename",type:"prompt",value:t.name,onConfirm:async m=>{if(m){const I=t.path.substring(0,t.path.lastIndexOf("/"));await a.rename(t.path,`${I}/${m}`),l()}}})}},{icon:"copy,📄",label:"Copy",action:()=>N({type:"copy",items:p,name:p[0].name,path:p[0].path})},{icon:"cut,✂️",label:"Cut",action:()=>N({type:"cut",items:p,name:p[0].name,path:p[0].path})},{separator:!0},{icon:"trash,🗑️",label:"Move to Trash",danger:!0,action:async()=>{for(const m of p)await a.trash(m.path);l()}}),B(f,g.clientX,g.clientY)},n.appendChild(e)})}catch(c){console.error(c)}};a.onChange(i=>{(i===o||i.startsWith(o+"/"))&&l()}),window.addEventListener("icon-theme-changed",()=>{l()}),n.oncontextmenu=i=>{var t;if(i.target!==n)return;i.preventDefault();const c=[{icon:"folder,📁",label:"New Folder",action:()=>{k({title:"New Folder",type:"prompt",onConfirm:async e=>{e&&(await a.mkdir(`${o}/${e}`),l())}})}},{icon:"file,📄",label:"New Text File",action:()=>{k({title:"New File",type:"prompt",onConfirm:async e=>{e&&(await a.writeFile(`${o}/${e}.txt`,""),l())}})}},{separator:!0},{icon:"paste,📋",label:"Paste",disabled:!((t=window.desktopClipboard)!=null&&t.path),action:async()=>{const e=window.desktopClipboard;if(e)try{const y=`${o}/${e.name}`;if(e.type==="copy"){const u=await a.readFile(e.path);await a.writeFile(y,u)}else await a.rename(e.path,y),window.desktopClipboard=null;l()}catch(y){console.error(y)}}}];B(c,i.clientX,i.clientY)},r.querySelectorAll(".sidebar-item").forEach(i=>{i.onclick=()=>{o=i.dataset.path,l()}}),r.querySelector("#fm-up").onclick=()=>{o!=="computer://"&&o!=="/"&&(o=o.substring(0,o.lastIndexOf("/"))||"/",l())},z.onkeydown=i=>{i.key==="Enter"&&(o=a.resolvePath(z.value),l())},r.querySelector("#fm-mkdir").onclick=()=>{k({title:"New Folder",type:"prompt",onConfirm:async i=>{i&&(await a.mkdir(`${o}/${i}`),l())}})},F.onclick=()=>{k({title:"Empty Trash",message:"Are you sure you want to delete everything in the Trash?",type:"confirm",onConfirm:async()=>{await a.emptyTrash(),l()}})},r.querySelector("#fm-upload").onclick=()=>r.querySelector("#fm-file-input").click(),r.querySelector("#fm-file-input").onchange=async i=>{for(const c of i.target.files){const t=new FileReader;t.onload=async e=>{await a.writeFile(`${o}/${c.name}`,e.target.result),l()},t.readAsDataURL(c)}},l()}export{Y as launch};
