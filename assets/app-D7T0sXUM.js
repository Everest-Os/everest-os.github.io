const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DY9sEeDM.js","assets/index-BKJI6B33.css"])))=>i.map(i=>d[i]);
import{_ as v}from"./index-DY9sEeDM.js";async function O(w,a={}){const{windowManager:k,vfs:x}=w,{IconHelper:p}=await v(async()=>{const{IconHelper:t}=await import("./index-DY9sEeDM.js").then(r=>r.i);return{IconHelper:t}},__vite__mapDeps([0,1])),{ZipHelper:A}=await v(async()=>{const{ZipHelper:t}=await import("./zipHelper-D3i7XoLf.js");return{ZipHelper:t}},[]),u=a.path?a.path.split(".").pop().toLowerCase():"odt";let l="doc";["xls","xlsx"].includes(u)?l="sheet":["ppt","pptx"].includes(u)&&(l="slides");const s=document.createElement("div");s.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    color: var(--text-primary);
    font-family: var(--font-main);
  `,s.innerHTML=`
    <div class="office-toolbar" style="
      height: 48px;
      background: #111;
      border-bottom: 1px solid #222;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      flex-shrink: 0;
    ">
      <div style="display: flex; gap: 4px;">
        <button class="toolbar-btn" title="New Document">${p.getIcon("file",{size:14})}</button>
        <button class="toolbar-btn" title="Open Document">${p.getIcon("folder",{size:14})}</button>
        <button class="toolbar-btn" title="Save Document">${p.getIcon("disk",{size:14})}</button>
      </div>
      <div style="width: 1px; height: 24px; background: #333; margin: 0 8px;"></div>
      <div style="display: flex; gap: 4px;">
        <button class="toolbar-btn" data-cmd="bold"><b>B</b></button>
        <button class="toolbar-btn" data-cmd="italic"><i>I</i></button>
        <button class="toolbar-btn" data-cmd="underline"><u>U</u></button>
      </div>
      <div style="width: 1px; height: 24px; background: #333; margin: 0 8px;"></div>
      <select class="toolbar-select">
        <option>Inter</option>
        <option>JetBrains Mono</option>
        <option>Georgia</option>
      </select>
    </div>
    
    <div class="office-editor-viewport" style="flex: 1; overflow-y: auto; padding: 40px 0; background: #050505; perspective: 1000px;">
      ${l==="doc"?`
        <div id="office-editor" contenteditable="true" style="
          width: 800px; min-height: 1000px; margin: 0 auto; background: #0a0a0a; padding: 80px; border: 1px solid #111;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8); color: #eee; font-size: 16px; line-height: 1.6; outline: none; transform: rotateX(2deg); transition: transform 0.5s ease;
        ">
          <h2>Untitled Document</h2>
          <p>Start typing your masterpiece here...</p>
        </div>
      `:l==="sheet"?`
        <div id="office-sheet" style="width: 100%; height: 100%; background: #111; overflow: auto; display: flex; flex-direction: column;">
          <div style="display: flex; background: #222; border-bottom: 1px solid #333;">
            <div style="width: 40px; border-right: 1px solid #333;"></div>
            ${Array.from({length:26}).map((t,r)=>`<div style="width: 100px; padding: 4px; text-align: center; border-right: 1px solid #333; font-size: 11px; color: #888;">${String.fromCharCode(65+r)}</div>`).join("")}
          </div>
          ${Array.from({length:50}).map((t,r)=>`
            <div style="display: flex; border-bottom: 1px solid #222;">
              <div style="width: 40px; padding: 4px; text-align: center; border-right: 1px solid #333; font-size: 11px; color: #555; background: #1a1a1a;">${r+1}</div>
              ${Array.from({length:26}).map(()=>'<div contenteditable="true" style="width: 100px; height: 24px; border-right: 1px solid #222; outline: none; padding: 2px 4px; font-size: 12px;"></div>').join("")}
            </div>
          `).join("")}
        </div>
      `:`
        <div style="width: 100%; height: 100%; display: flex; gap: 20px; padding: 20px;">
          <div style="width: 200px; background: #111; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
            <div style="aspect-ratio: 16/9; background: #222; border: 1px solid var(--accent); border-radius: 4px;"></div>
            <div style="aspect-ratio: 16/9; background: #1a1a1a; border: 1px solid #333; border-radius: 4px;"></div>
          </div>
          <div style="flex: 1; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div id="office-slides" contenteditable="true" style="width: 80%; aspect-ratio: 16/9; background: #111; border: 1px solid #222; padding: 40px; outline: none; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <h1 style="color: var(--accent);">Presentation Title</h1>
              <p style="color: #666;">Click to add subtitle</p>
            </div>
          </div>
        </div>
      `}
    </div>

    <style>
      .office-toolbar .toolbar-btn {
        width: 32px;
        height: 32px;
        background: transparent;
        border: 1px solid transparent;
        color: #888;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 14px;
      }
      .office-toolbar .toolbar-btn:hover {
        background: #222;
        color: #fff;
        border-color: #333;
      }
      .office-toolbar .toolbar-select {
        background: #111;
        border: 1px solid #222;
        color: #888;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        outline: none;
        cursor: pointer;
      }
      #office-editor:focus {
        transform: rotateX(0deg);
        border-color: var(--accent);
      }
      .office-editor-viewport::-webkit-scrollbar {
        width: 8px;
      }
      .office-editor-viewport::-webkit-scrollbar-thumb {
        background: #222;
        border-radius: 4px;
      }
    </style>
  `,k.createWindow({id:`office-${Date.now()}`,title:a.path?a.path.split("/").pop():`New ${l==="doc"?"Document":l==="sheet"?"Spreadsheet":"Presentation"} — Office`,icon:l==="doc"?"file":l==="sheet"?"storage":"video",width:1100,height:800,content:s});const f=s.querySelector("#office-editor")||s.querySelector("#office-sheet")||s.querySelector("#office-slides");if(s.querySelectorAll("[data-cmd]").forEach(t=>{t.onclick=()=>{const r=t.dataset.cmd;document.execCommand(r,!1,null)}}),a.path)try{let t=await x.readFile(a.path);if(a.path.endsWith(".odt")&&(t instanceof Blob||typeof t=="string"&&t.startsWith("data:"))){console.log("Office: Detected binary ODT, unzipping...");try{let c=function(e){if(e.nodeType===3)return e.textContent.replace(/</g,"&lt;").replace(/>/g,"&gt;");if(e.nodeType!==1)return"";let n="span";const i=e.getAttribute("text:style-name"),o=i&&b[i]?` style="${b[i]}"`:"";switch(e.tagName){case"text:p":n="p";break;case"text:h":const _=e.getAttribute("text:outline-level")||"1";n=`h${Math.min(Math.max(_,1),6)}`;break;case"text:span":n="span";break;case"text:a":return`<a href="${e.getAttribute("xlink:href")||"#"}"${o}>${Array.from(e.childNodes).map(c).join("")}</a>`;case"text:list":n="ul";break;case"text:list-item":n="li";break;case"text:s":return"&nbsp;".repeat(parseInt(e.getAttribute("text:c")||1));case"text:tab":return"&emsp;";case"text:line-break":return"<br/>";case"office:text":case"office:body":case"office:document-content":return Array.from(e.childNodes).map(c).join("");default:return Array.from(e.childNodes).map(c).join("")}const d=Array.from(e.childNodes).map(c).join("");return n==="span"&&!o&&!d.trim()?"":`<${n}${o}>${d}</${n}>`};const r=await A.getJSZip(),$=t instanceof Blob?t:await(await fetch(t)).blob(),T=await(await r.loadAsync($)).file("content.xml").async("text"),h=new DOMParser().parseFromString(T,"text/xml"),b={},y=h.getElementsByTagName("office:automatic-styles")[0];if(y){for(let e of y.children)if(e.tagName==="style:style"){const n=e.getAttribute("style:name");let i="";const o=e.getElementsByTagName("style:text-properties")[0];o&&(o.getAttribute("fo:font-weight")==="bold"&&(i+="font-weight: bold;"),o.getAttribute("fo:font-style")==="italic"&&(i+="font-style: italic;"),o.getAttribute("style:text-underline-style")==="solid"&&(i+="text-decoration: underline;"),o.getAttribute("fo:color")&&(i+=`color: ${o.getAttribute("fo:color")};`),o.getAttribute("fo:font-size")&&(i+=`font-size: ${o.getAttribute("fo:font-size")};`),o.getAttribute("style:font-name")&&(i+=`font-family: '${o.getAttribute("style:font-name")}';`));const d=e.getElementsByTagName("style:paragraph-properties")[0];d&&d.getAttribute("fo:text-align")&&(i+=`text-align: ${d.getAttribute("fo:text-align")};`),i&&(b[n]=i)}}const m=h.getElementsByTagName("office:body")[0];t=m?c(m):"<p><i>Empty document</i></p>"}catch(r){console.error("Office: Failed to parse ODT",r),t=`<div style="color:red; padding: 20px;">Error parsing ODT: ${r.message}</div>`}}f.innerHTML=t}catch(t){console.error("Office: Failed to load file",t)}let g;f.oninput=()=>{a.path&&(clearTimeout(g),g=setTimeout(async()=>{var t;await x.writeFile(a.path,f.innerHTML),(t=window.__everestConsole)==null||t.log(`💾 Office: Auto-saved ${a.path}`)},2e3))}}export{O as launch};
