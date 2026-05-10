import{I as l}from"./index-DY9sEeDM.js";import{ZipHelper as m}from"./zipHelper-D3i7XoLf.js";async function M(z,w={}){const{windowManager:y,vfs:d,filePicker:v}=z,f=w.path||"",n=document.createElement("div");n.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,n.innerHTML=`
    <div style="height: 48px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
      <button class="btn-secondary btn-sm" id="zip-open" style="display:flex; align-items:center; gap:6px;">${l.getIcon("folder",{size:14})} Open Archive</button>
      <div style="flex: 1; font-size: 11px; color: var(--text-secondary); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="zip-path">No archive loaded</div>
      <button class="btn-primary btn-sm" id="zip-extract" disabled style="display:flex; align-items:center; gap:6px;">${l.getIcon("archive",{size:14})} Extract All</button>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 16px;" id="zip-content">
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.4;">
        <div style="font-size: 56px; margin-bottom: 16px;">${l.getIcon("archive",{size:64})}</div>
        <div style="font-size: 14px;">Open an archive to view contents</div>
        <div style="font-size: 11px; margin-top: 8px;">Supports .zip, .odt, .ods, .odp</div>
      </div>
    </div>

    <div style="height: 28px; padding: 0 16px; font-size: 10px; color: var(--text-tertiary); border-top: 1px solid var(--border); background: var(--bg-card); display: flex; align-items: center;" id="zip-status">
      Ready
    </div>
  `;const $=y.createWindow({id:`zip-manager-${Date.now()}`,title:"Archive Manager",icon:"archive",width:600,height:450,content:n}),S=n.querySelector("#zip-path"),c=n.querySelector("#zip-content"),o=n.querySelector("#zip-extract"),E=n.querySelector("#zip-open"),r=n.querySelector("#zip-status");let h="",p=null;const b=async e=>{if(e){h=e,S.textContent=e,o.disabled=!0,r.textContent=`Reading ${e}...`,y.setTitle($.id,`Archive Manager - ${e.split("/").pop()}`),c.innerHTML='<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading JSZip Engine...</div>';try{const s=await m.getJSZip();let t=await d.readFile(e);const a=t instanceof Blob?t:typeof t=="string"&&t.startsWith("data:")?await(await fetch(t)).blob():new Blob([t]);p=a,r.textContent="Parsing archive structure...";const x=await s.loadAsync(a),u=Object.values(x.files).map(i=>{const g=i._data&&i._data.uncompressedSize?i._data.uncompressedSize:0,C=i.dir?"—":g<1024?`${g} B`:`${(g/1024).toFixed(1)} KB`;return{name:i.name,size:C,type:i.dir?"dir":"file"}});c.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="text-align: left; color: var(--text-tertiary); border-bottom: 1px solid var(--border);">
              <th style="padding: 10px 8px; font-weight: 600;">Name</th>
              <th style="padding: 10px 8px; font-weight: 600; text-align: right;">Size</th>
            </tr>
          </thead>
          <tbody>
            ${u.map(i=>`
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px 8px; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 16px;">${l.getIcon(i.type==="dir"?"folder":"file",{size:16})}</span>
                  <span>${i.name}</span>
                </td>
                <td style="padding: 10px 8px; text-align: right; color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px;">${i.size}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `,r.textContent=`Archive loaded: ${u.length} items`,o.disabled=!1}catch(s){let t=s.message;(t.includes("end of central directory")||t.includes("Corrupted zip"))&&(t="This file is not a valid or supported ZIP archive."),c.innerHTML=`<div style="text-align: center; padding: 40px; color: var(--error);">${t}</div>`,r.textContent=`Error: ${t}`}}};E.onclick=async()=>{const e=await v.pickFile({title:"Open Archive",filter:[".zip",".odt",".ods",".odp"]});e&&b(e)},o.onclick=async()=>{const e=await v.pickFolder({title:"Extract to Folder",initialPath:"~/Documents"});if(e&&p){r.textContent="Extracting...",o.disabled=!0;const s=h.split("/").pop().replace(/\.[^/.]+$/,""),t=`${e}/${s}`;try{await d.mkdir(t),await m.extractToVfs(p,t,d,(a,x)=>{r.textContent=`Extracting (${Math.round(a*100)}%): ${x}`}),r.textContent=`Successfully extracted to ${t}`}catch(a){r.textContent=`Extraction error: ${a.message}`}o.disabled=!1}},f&&b(f)}export{M as launch};
