import{I as y}from"./index-DY9sEeDM.js";async function W(k,E={}){const{windowManager:x,vfs:$,filePicker:I}=k;let i=E.path||null,f=!1;const t=document.createElement("div");t.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,t.innerHTML=`
    <div style="height: 40px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 12px; gap: 8px; background: var(--bg-elevated);">
      <button class="btn-secondary btn-sm" id="btn-open" style="display:flex; align-items:center; gap:6px;">${y.getIcon("folder,📁",{size:14})} Open</button>
      <button class="btn-primary btn-sm" id="btn-save" style="display:flex; align-items:center; gap:6px;">${y.getIcon("disk,💽",{size:14})} Save</button>
      <div style="flex: 1; text-align: center; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="status-path">Untitled.txt</div>
      <div id="md-tools" style="display: none; gap: 8px;">
        <button class="btn-secondary btn-sm" id="btn-preview" style="display:flex; align-items:center; gap:6px;">${y.getIcon("view,👁️",{size:14})} Preview</button>
        <button class="btn-secondary btn-sm" id="btn-split" style="display:flex; align-items:center; gap:6px;">${y.getIcon("monitor,🖥️",{size:14})} Split View</button>
      </div>
    </div>
    
    <div style="flex: 1; position: relative; display: flex; overflow: hidden;">
      <div id="editor-container" style="flex: 1; display: flex; transition: flex 0.2s;">
        <textarea id="editor-textarea" spellcheck="false" style="
          flex: 1;
          background: transparent;
          border: none;
          color: inherit;
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 16px;
          resize: none;
          outline: none;
          line-height: 1.5;
        "></textarea>
      </div>
      
      <div id="preview-container" style="
        display: none;
        flex: 1;
        background: var(--bg-surface);
        padding: 24px;
        overflow-y: auto;
        border-left: 1px solid var(--border);
        line-height: 1.6;
        transition: flex 0.2s;
        position: relative;
      " class="markdown-body">
        <button id="btn-edit-md" class="btn-secondary btn-sm" style="position: sticky; top: 0; float: right; z-index: 10; display: none; margin-bottom: 8px; align-items:center; gap:6px;">${y.getIcon("edit,📝",{size:14})} Edit</button>
        <div id="preview-content"></div>
      </div>
    </div>

    <style>
      .markdown-body { color: var(--text-primary); font-size: 14px; }
      .markdown-body h1 { font-size: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 16px; margin-top: 0; }
      .markdown-body h2 { font-size: 20px; border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-bottom: 14px; margin-top: 24px; }
      .markdown-body h3 { font-size: 18px; margin-bottom: 12px; margin-top: 20px; }
      .markdown-body p { margin-bottom: 16px; }
      .markdown-body code { background: var(--bg-input); padding: 2px 4px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; color: var(--accent); }
      .markdown-body pre { background: var(--bg-input); padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; border: 1px solid var(--border); }
      .markdown-body pre code { background: transparent; padding: 0; color: inherit; }
      .markdown-body ul, .markdown-body ol { margin-bottom: 16px; padding-left: 24px; }
      .markdown-body li { margin-bottom: 6px; }
      .markdown-body blockquote { border-left: 4px solid var(--accent); padding-left: 16px; color: var(--text-secondary); font-style: italic; margin-bottom: 16px; background: var(--bg-input); padding: 8px 16px; }
      .markdown-body a { color: var(--accent); text-decoration: none; }
      .markdown-body a:hover { text-decoration: underline; }
      .markdown-body img { max-width: 100%; border-radius: 8px; box-shadow: var(--shadow-sm); }
      .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
      .markdown-body th, .markdown-body td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
      .markdown-body th { background: var(--bg-elevated); font-weight: 600; }
      .markdown-body hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
    </style>
  `;const v=x.createWindow({id:"text-editor-"+Math.random().toString(36).substr(2,9),title:"Text Editor",icon:"text,📝",width:850,height:600,content:t}),r=t.querySelector("#editor-textarea"),S=t.querySelector("#editor-container"),z=t.querySelector("#preview-container"),C=t.querySelector("#md-tools"),p=t.querySelector("#btn-preview"),c=t.querySelector("#btn-split"),q=t.querySelector("#status-path"),L=e=>{let o=e.replace(/^# (.*$)/gim,"<h1>$1</h1>").replace(/^## (.*$)/gim,"<h2>$1</h2>").replace(/^### (.*$)/gim,"<h3>$1</h3>").replace(/^\> (.*$)/gim,"<blockquote>$1</blockquote>").replace(/\*\*(.*)\*\*/gim,"<b>$1</b>").replace(/\*(.*)\*/gim,"<i>$1</i>").replace(/!\[(.*?)\]\((.*?)\)/gim,"<img alt='$1' src='$2' />").replace(/\[(.*?)\]\((.*?)\)/gim,"<a href='$2' target='_blank'>$1</a>").replace(/^---$/gm,"<hr />");const M=o.split(`
`);let b=!1,d="";const u=[];for(let m=0;m<M.length;m++){const a=M[m].trim();if(a.startsWith("|")&&a.endsWith("|")){const w=a.slice(1,-1).split("|").map(s=>s.trim());if(!b)b=!0,d="<table><thead><tr>"+w.map(s=>`<th>${s}</th>`).join("")+"</tr></thead><tbody>";else{if(w.every(s=>s.match(/^:?-+:?$/)))continue;d+="<tr>"+w.map(s=>`<td>${s}</td>`).join("")+"</tr>"}}else b&&(d+="</tbody></table>",u.push(d),b=!1,d=""),u.push(a)}return b&&u.push(d+"</tbody></table>"),o=u.join(`
`),o=o.replace(/^\- (.*$)/gim,"<ul><li>$1</li></ul>"),o=o.replace(/<\/ul>\n<ul>/gim,""),o=o.replace(/```([\s\S]*?)```/gim,"<pre><code>$1</code></pre>"),o=o.replace(/`(.*?)`/gim,"<code>$1</code>"),o.split(`
`).map(m=>{const a=m.trim();return a?a.startsWith("<")?a:`<p>${a}</p>`:"<br/>"}).join(`
`)};let l=!1,n=!1;const T=t.querySelector("#preview-content"),h=t.querySelector("#btn-edit-md"),g=()=>{const e=i==null?void 0:i.toLowerCase().endsWith(".md");C.style.display=e?"flex":"none",e&&(n||l)?(z.style.display="block",T.innerHTML=L(r.value),S.style.display=n?"none":"flex",h.style.display=n?"block":"none"):(z.style.display="none",S.style.display="flex",h.style.display="none")};h.onclick=()=>{n=!1,l=!0,p.classList.remove("btn-primary"),c.classList.add("btn-primary"),g()};const F=async e=>{try{const o=await $.readFile(e);o instanceof Blob?(r.value=`Unsupported Binary File

This file is a binary archive or media file and cannot be viewed or edited as plain text.
If this is an archive like .7z or .rar, the EverestOS Zip Manager currently only supports .zip formats.`,r.readOnly=!0,r.style.opacity="0.7",t.querySelector("#btn-save").disabled=!0):(r.value=o,r.readOnly=!1,r.style.opacity="1",t.querySelector("#btn-save").disabled=!1),i=e,q.textContent=e,f=!1,e.toLowerCase().endsWith(".md")&&(n=!0,l=!1,p.classList.add("btn-primary"),c.classList.remove("btn-primary")),g(),x.setTitle(v.id,`Text Editor - ${e.split("/").pop()}`)}catch(o){alert("Failed to load file: "+o.message)}},O=async()=>{if(!r.readOnly){if(!i){const e=await k.filePicker.pickFile({title:"Save As",mode:"save"});if(!e)return;i=e}try{await $.writeFile(i,r.value),f=!1,q.textContent=i,x.setTitle(v.id,`Text Editor - ${i.split("/").pop()}`)}catch(e){alert("Failed to save file: "+e.message)}}};p.onclick=()=>{n=!n,l=!1,p.classList.toggle("btn-primary",n),c.classList.remove("btn-primary"),g()},c.onclick=()=>{l=!l,n=!1,c.classList.toggle("btn-primary",l),p.classList.remove("btn-primary"),g()},r.oninput=()=>{l&&(T.innerHTML=L(r.value)),f||(f=!0,x.setTitle(v.id,`Text Editor - ${i?i.split("/").pop():"Untitled"}*`))},t.querySelector("#btn-open").onclick=async()=>{const e=await I.pickFile({title:"Open File"});e&&F(e)},t.querySelector("#btn-save").onclick=O,i&&F(i)}export{W as launch};
