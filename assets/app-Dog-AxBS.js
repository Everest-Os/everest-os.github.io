import{I as a}from"./index-CDx2cV7o.js";function g(d,s={}){const{windowManager:n,vfs:p,filePicker:c}=d,r=s.path||"",e=document.createElement("div");e.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,e.innerHTML=`
    <div style="height: 44px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
      <button id="pv-open" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${a.getIcon("pdf,📕",{size:14})} Open PDF</button>
      <div style="flex: 1; text-align: center; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="pv-status-path">No PDF loaded</div>
      <div style="width: 80px;"></div>
    </div>

    <div style="flex: 1; position: relative; background: var(--bg-desktop);" id="pv-container">
      <embed id="pv-frame" style="width: 100%; height: 100%; border: none; display: none;" type="application/pdf">
      <div id="pv-no-pdf" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; font-size: 13px; color: var(--text-tertiary); gap: 16px;">
        <div style="font-size: 48px; opacity: 0.3;">${a.getIcon("pdf,📕",{size:64})}</div>
        <div>No PDF document open</div>
      </div>
    </div>
  `;const v=n.createWindow({id:`pdf-viewer-${Date.now()}`,title:"PDF Reader",icon:"pdf,📕",width:850,height:600,content:e});e.querySelector("#pv-frame");const f=e.querySelector("#pv-no-pdf"),y=e.querySelector("#pv-status-path"),l=t=>{let x=p.resolvePath(t).replace(/^~/,"/home/user");const u=`/fs${encodeURI(x)}#toolbar=0&navpanes=0&scrollbar=1`,o=e.querySelector("#pv-frame"),i=o.cloneNode(!0);i.src=u,i.style.display="block",o.parentNode.replaceChild(i,o),f.style.display="none",y.textContent=t,n.setTitle(v.id,`PDF Reader - ${t.split("/").pop()}`)};e.querySelector("#pv-open").onclick=async()=>{const t=await c.pickFile({title:"Open PDF Document",filter:[".pdf"]});t&&l(t)},r&&l(r)}export{g as launch};
