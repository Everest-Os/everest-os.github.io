import{I as r}from"./index-CzAWk2Jy.js";async function $(f,m={}){const{windowManager:l,vfs:c,filePicker:d}=f,p=m.path||"",i=document.createElement("div");i.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,i.innerHTML=`
    <div style="height: 48px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; background: var(--bg-elevated);">
      <button class="btn-secondary btn-sm" id="zip-open" style="display:flex; align-items:center; gap:6px;">${r.getIcon("folder",{size:14})} Open Archive</button>
      <div style="flex: 1; font-size: 11px; color: var(--text-secondary); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="zip-path">No archive loaded</div>
      <button class="btn-primary btn-sm" id="zip-extract" disabled style="display:flex; align-items:center; gap:6px;">${r.getIcon("archive",{size:14})} Extract All</button>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 16px;" id="zip-content">
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.4;">
        <div style="font-size: 56px; margin-bottom: 16px;">${r.getIcon("archive",{size:64})}</div>
        <div style="font-size: 14px;">Open an archive to view contents</div>
        <div style="font-size: 11px; margin-top: 8px;">Supports .zip, .tar, .gz</div>
      </div>
    </div>

    <div style="height: 28px; padding: 0 16px; font-size: 10px; color: var(--text-tertiary); border-top: 1px solid var(--border); background: var(--bg-card); display: flex; align-items: center;" id="zip-status">
      Ready
    </div>
  `;const h=l.createWindow({id:`zip-manager-${Date.now()}`,title:"Archive Manager",icon:"archive",width:600,height:450,content:i}),b=i.querySelector("#zip-path"),x=i.querySelector("#zip-content"),a=i.querySelector("#zip-extract"),z=i.querySelector("#zip-open"),n=i.querySelector("#zip-status");let y="";const g=async t=>{t&&(y=t,b.textContent=t,a.disabled=!1,n.textContent=`Reading ${t}...`,l.setTitle(h.id,`Archive Manager - ${t.split("/").pop()}`),x.innerHTML='<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Scanning archive...</div>',setTimeout(()=>{const e=t.split("/").pop().replace(/\.[^/.]+$/,""),o=[{name:`${e}/`,size:"—",type:"dir"},{name:`${e}/README.txt`,size:"1.2 KB",type:"file"},{name:`${e}/data.json`,size:"45 KB",type:"file"},{name:`${e}/assets/`,size:"—",type:"dir"},{name:`${e}/assets/logo.png`,size:"128 KB",type:"file"}];x.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="text-align: left; color: var(--text-tertiary); border-bottom: 1px solid var(--border);">
              <th style="padding: 10px 8px; font-weight: 600;">Name</th>
              <th style="padding: 10px 8px; font-weight: 600; text-align: right;">Size</th>
            </tr>
          </thead>
          <tbody>
            ${o.map(s=>`
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px 8px; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 16px;">${r.getIcon(s.type==="dir"?"folder":"file",{size:16})}</span>
                  <span>${s.name}</span>
                </td>
                <td style="padding: 10px 8px; text-align: right; color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px;">${s.size}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `,n.textContent=`Archive loaded: ${o.length} items`},600))};z.onclick=async()=>{const t=await d.pickFile({title:"Open Archive",filter:[".zip",".tar",".gz",".7z",".rar"]});t&&g(t)},a.onclick=async()=>{const t=await d.pickFolder({title:"Extract to Folder",initialPath:"~/Documents"});t&&(n.textContent=`Extracting to ${t}...`,a.disabled=!0,setTimeout(async()=>{const v=y.split("/").pop().replace(/\.[^/.]+$/,""),e=`${t}/${v}`;try{await c.mkdir(e),await c.writeFile(`${e}/README.txt`,"Extracted content placeholder"),n.textContent=`Successfully extracted to ${e}`}catch(o){n.textContent=`Extraction error: ${o.message}`}a.disabled=!1},1500))},p&&g(p)}export{$ as launch};
