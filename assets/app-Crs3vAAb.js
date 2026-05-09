import{I as y}from"./index-BX5Da8PK.js";async function H(k,E={}){const{windowManager:x,vfs:$,filePicker:I}=k;let i=E.path||null,g=!1;const o=document.createElement("div");o.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
  `,o.innerHTML=`
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
  `;const u=x.createWindow({id:"text-editor-"+Math.random().toString(36).substr(2,9),title:"Text Editor",icon:"text,📝",width:850,height:600,content:o}),d=o.querySelector("#editor-textarea"),S=o.querySelector("#editor-container"),z=o.querySelector("#preview-container"),C=o.querySelector("#md-tools"),p=o.querySelector("#btn-preview"),c=o.querySelector("#btn-split"),q=o.querySelector("#status-path"),L=e=>{let t=e.replace(/^# (.*$)/gim,"<h1>$1</h1>").replace(/^## (.*$)/gim,"<h2>$1</h2>").replace(/^### (.*$)/gim,"<h3>$1</h3>").replace(/^\> (.*$)/gim,"<blockquote>$1</blockquote>").replace(/\*\*(.*)\*\*/gim,"<b>$1</b>").replace(/\*(.*)\*/gim,"<i>$1</i>").replace(/!\[(.*?)\]\((.*?)\)/gim,"<img alt='$1' src='$2' />").replace(/\[(.*?)\]\((.*?)\)/gim,"<a href='$2' target='_blank'>$1</a>").replace(/^---$/gm,"<hr />");const M=t.split(`
`);let b=!1,s="";const v=[];for(let m=0;m<M.length;m++){const n=M[m].trim();if(n.startsWith("|")&&n.endsWith("|")){const h=n.slice(1,-1).split("|").map(l=>l.trim());if(!b)b=!0,s="<table><thead><tr>"+h.map(l=>`<th>${l}</th>`).join("")+"</tr></thead><tbody>";else{if(h.every(l=>l.match(/^:?-+:?$/)))continue;s+="<tr>"+h.map(l=>`<td>${l}</td>`).join("")+"</tr>"}}else b&&(s+="</tbody></table>",v.push(s),b=!1,s=""),v.push(n)}return b&&v.push(s+"</tbody></table>"),t=v.join(`
`),t=t.replace(/^\- (.*$)/gim,"<ul><li>$1</li></ul>"),t=t.replace(/<\/ul>\n<ul>/gim,""),t=t.replace(/```([\s\S]*?)```/gim,"<pre><code>$1</code></pre>"),t=t.replace(/`(.*?)`/gim,"<code>$1</code>"),t.split(`
`).map(m=>{const n=m.trim();return n?n.startsWith("<")?n:`<p>${n}</p>`:"<br/>"}).join(`
`)};let a=!1,r=!1;const T=o.querySelector("#preview-content"),w=o.querySelector("#btn-edit-md"),f=()=>{const e=i==null?void 0:i.toLowerCase().endsWith(".md");C.style.display=e?"flex":"none",e&&(r||a)?(z.style.display="block",T.innerHTML=L(d.value),S.style.display=r?"none":"flex",w.style.display=r?"block":"none"):(z.style.display="none",S.style.display="flex",w.style.display="none")};w.onclick=()=>{r=!1,a=!0,p.classList.remove("btn-primary"),c.classList.add("btn-primary"),f()};const F=async e=>{try{const t=await $.readFile(e);d.value=t,i=e,q.textContent=e,g=!1,e.toLowerCase().endsWith(".md")&&(r=!0,a=!1,p.classList.add("btn-primary"),c.classList.remove("btn-primary")),f(),x.setTitle(u.id,`Text Editor - ${e.split("/").pop()}`)}catch(t){alert("Failed to load file: "+t.message)}},P=async()=>{if(!i){const e=await k.filePicker.pickFile({title:"Save As",mode:"save"});if(!e)return;i=e}try{await $.writeFile(i,d.value),g=!1,q.textContent=i,x.setTitle(u.id,`Text Editor - ${i.split("/").pop()}`)}catch(e){alert("Failed to save file: "+e.message)}};p.onclick=()=>{r=!r,a=!1,p.classList.toggle("btn-primary",r),c.classList.remove("btn-primary"),f()},c.onclick=()=>{a=!a,r=!1,c.classList.toggle("btn-primary",a),p.classList.remove("btn-primary"),f()},d.oninput=()=>{a&&(T.innerHTML=L(d.value)),g||(g=!0,x.setTitle(u.id,`Text Editor - ${i?i.split("/").pop():"Untitled"}*`))},o.querySelector("#btn-open").onclick=async()=>{const e=await I.pickFile({title:"Open File"});e&&F(e)},o.querySelector("#btn-save").onclick=P,i&&F(i)}export{H as launch};
