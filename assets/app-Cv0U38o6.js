import{I as a}from"./index-DY9sEeDM.js";function w(r,d={}){const{windowManager:p,vfs:g}=r,i=d.path||"",e=document.createElement("div");e.style.padding="0",e.style.height="100%",e.style.display="flex",e.style.flexDirection="column",e.style.background="var(--bg-surface)",e.style.color="var(--text-primary)",e.style.fontFamily="Inter, system-ui, sans-serif";const m=i?i.substring(i.lastIndexOf("/")+1):"No image loaded";e.innerHTML=`
    <!-- Toolbar -->
    <div style="background:var(--bg-surface-hover); border-bottom:1px solid var(--border); padding:8px 12px; display:flex; justify-content:space-between; align-items:center; z-index:10;">
      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
        <button id="iv-open" class="btn-secondary" style="height:30px; padding:0 10px; display:flex; align-items:center; gap:6px;">${a.getIcon("folder",{size:14})} Open</button>
        <span style="font-size:13px; font-weight:600; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:60%;" id="iv-title">${m}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button id="iv-zoom-out" class="btn-secondary" style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center;">${a.getIcon("zoom-out",{size:14})}</button>
        <button id="iv-zoom-in" class="btn-secondary" style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center;">${a.getIcon("zoom-in",{size:14})}</button>
        <button id="iv-rotate" class="btn-secondary" style="height:30px; padding:0 10px; display:flex; align-items:center; justify-content:center; gap:6px;">${a.getIcon("refresh",{size:14})} Rotate</button>
      </div>
    </div>

    <!-- Image Area -->
    <div style="flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; position:relative; padding:15px; min-height:0;" id="iv-container">
      <img id="iv-img" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; transition: transform 0.2s; transform-origin: center center;" alt="">
    </div>
  `,p.createWindow({id:`image-viewer-${Date.now()}`,title:"Image Viewer",icon:"image",width:600,height:460,content:e});const l=e.querySelector("#iv-img"),y=e.querySelector("#iv-zoom-in"),f=e.querySelector("#iv-zoom-out"),x=e.querySelector("#iv-rotate");let t=1,o=0;const s=()=>{l.style.transform=`scale(${t}) rotate(${o}deg)`};y.addEventListener("click",()=>{t=Math.min(4,t+.2),s()}),f.addEventListener("click",()=>{t=Math.max(.2,t-.2),s()}),x.addEventListener("click",()=>{o=(o+90)%360,s()});const{filePicker:v}=r,u=e.querySelector("#iv-open"),h=e.querySelector("#iv-title"),c=n=>{l.src=g.getFsPath(n),h.textContent=n.split("/").pop(),t=1,o=0,s()};u.addEventListener("click",async()=>{const n=await v.pickFile({title:"Open Image",filter:[".png",".jpg",".jpeg",".gif",".svg",".webp"]});n&&c(n)}),i&&c(i)}export{w as launch};
