import{I as i,a as k,s as d}from"./index-DY9sEeDM.js";function L(S,h={}){var m;const{windowManager:T,vfs:b,appLoader:q}=S;let o=h.url||((m=h.args)==null?void 0:m[0])||"https://example.com";(o.startsWith("/")||o.startsWith("~"))&&(o=b.getFsPath(o));const t=document.createElement("div");t.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    position: relative;
    overflow: hidden;
  `,t.innerHTML=`
    <!-- Progress Bar -->
    <div id="br-progress-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0,0,0,0.1); z-index: 100; display: none;">
      <div id="br-progress-bar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);"></div>
    </div>

    <!-- Toolbar -->
    <div style="display:flex; gap:8px; padding:8px 12px; background:var(--bg-elevated); border-bottom:1px solid var(--border); align-items:center; z-index: 10;">
      <div style="display:flex; gap:4px;">
        <button id="br-back" class="br-tool-btn" title="Back">${i.getIcon("back",{size:18})}</button>
        <button id="br-fwd" class="br-tool-btn" title="Forward">${i.getIcon("next",{size:18})}</button>
        <button id="br-reload" class="br-tool-btn" title="Reload">${i.getIcon("restart",{size:18})}</button>
      </div>

      <div style="flex:1; display:flex; align-items:center; background:var(--bg-input); border:1px solid var(--border); border-radius:16px; padding:2px 12px; gap:8px;">
        <div style="opacity:0.5; display:flex;">${i.getIcon("internet",{size:12})}</div>
        <input type="text" id="br-url" value="${o}" style="flex:1; border:none; background:transparent; color:var(--text-primary); font-size:12px; outline:none; height:24px;">
        <button id="br-go" style="border:none; background:transparent; color:var(--accent); cursor:pointer; font-size:11px; font-weight:600; padding:0 4px;">GO</button>
      </div>

      <button id="br-download-mgr" class="br-tool-btn" title="VFS Downloads">${i.getIcon("download,📥",{size:18})}</button>
    </div>

    <div style="flex:1; position:relative; background:white;">
      <iframe id="br-frame" src="${o}" style="width:100%; height:100%; border:none; position:absolute; top:0; left:0; z-index:1;"></iframe>

      <!-- Error Page Layer -->
      <div id="br-error-page" style="position:absolute; top:0; left:0; width:100%; height:100%; background:var(--bg-surface); z-index:5; display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px;">
        <div id="br-error-icon" style="font-size:64px; margin-bottom:20px; opacity:0.5;">${i.getIcon("info",{size:64})}</div>
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
  `;const z=T.createWindow({id:`browser-${Date.now()}`,title:"Web Browser",icon:"browser",width:1e3,height:700,content:t}),a=t.querySelector("#br-url"),n=t.querySelector("#br-frame"),D=t.querySelector("#br-go"),w=t.querySelector("#br-reload"),F=t.querySelector("#br-back"),W=t.querySelector("#br-fwd"),r=t.querySelector("#br-progress-bar"),p=t.querySelector("#br-progress-container"),f=t.querySelector("#br-error-page"),$=t.querySelector("#br-error-title"),I=t.querySelector("#br-error-desc");let s=null;const l=(e=!0)=>{e?(p.style.display="block",r.style.width="10%",setTimeout(()=>{r.style.width==="10%"&&(r.style.width="60%")},500),setTimeout(()=>{r.style.width==="60%"&&(r.style.width="85%")},2e3)):(r.style.width="100%",setTimeout(()=>{p.style.display="none",r.style.width="0%"},300))},u=async()=>{let e=a.value.trim();e&&(e.startsWith("~")||e.startsWith("/")&&!e.startsWith("//")?e=b.getFsPath(e):!e.startsWith("http://")&&!e.startsWith("https://")&&!e.startsWith("/")&&(e="https://"+e),a.value=e,f.style.display="none",l(!0),n.src=e,s&&clearTimeout(s),s=setTimeout(()=>{p.style.display!=="none"&&(l(!1),$.textContent="Website Not Loading",I.textContent="This website is either offline or it does not support being viewed inside EverestOS (security block).",f.style.display="flex")},8e3))};n.onload=()=>{l(!1),s&&clearTimeout(s)},D.onclick=u,a.onkeydown=e=>{e.key==="Enter"&&u()},w.onclick=()=>{n.src=n.src,l(!0)},F.onclick=()=>{try{n.contentWindow.history.back()}catch{}},W.onclick=()=>{try{n.contentWindow.history.forward()}catch{}},t.querySelector("#br-error-retry").onclick=u,t.querySelector("#br-download-mgr").onclick=()=>{const e=[{icon:"download,📥",label:"Download URL to VFS",action:()=>{d({title:"Download to VFS",message:"Enter a direct URL. Note: Only works for CORS-enabled links.",type:"prompt",onConfirm:async c=>{if(!c)return;const x=c.split("/").pop()||"download",v=`/home/user/Downloads/${x}`;d({title:"Downloading...",message:`Fetching ${x} to VFS...`,type:"alert"});try{const B=await(await fetch(c,{mode:"cors"})).blob(),g=new FileReader;g.onload=async()=>{await b.writeFile(v,g.result),d({title:"Download Complete",message:`Saved to ${v}`,type:"alert"})},g.readAsDataURL(B)}catch{d({title:"Download Failed",message:"CORS Blocked: This file cannot be saved to VFS directly because the source server forbids it. System download triggered.",type:"alert"}),window.open(c,"_blank")}}})}},{separator:!0},{icon:"folder,📁",label:"Open Downloads Folder",action:()=>q.launchApp("files",{path:"/home/user/Downloads"})}],y=t.querySelector("#br-download-mgr").getBoundingClientRect();k(e,y.left,y.bottom)},t.addEventListener("contextmenu",e=>{e.preventDefault(),k([{icon:"refresh",label:"Reload Page",action:()=>w.click()},{separator:!0},{icon:"copy",label:"Copy Page URL",action:()=>navigator.clipboard.writeText(a.value)},{icon:"internet",label:"Open in System Browser",action:()=>window.open(a.value,"_blank")},{separator:!0},{icon:"info",label:"Inspect Everest Browser",action:()=>console.log("Everest Browser Instance",z.id)}],e.clientX,e.clientY)})}export{L as launch};
