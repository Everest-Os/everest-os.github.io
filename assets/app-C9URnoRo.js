const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Cxhu8mxZ.js","assets/index-BKJI6B33.css"])))=>i.map(i=>d[i]);
import{_ as x}from"./index-Cxhu8mxZ.js";async function b(c,t={}){const{windowManager:p,vfs:n}=c,{IconHelper:d}=await x(async()=>{const{IconHelper:e}=await import("./index-Cxhu8mxZ.js").then(r=>r.i);return{IconHelper:e}},__vite__mapDeps([0,1])),l=t.path?t.path.split(".").pop().toLowerCase():"odt";let o="doc";["xls","xlsx"].includes(l)?o="sheet":["ppt","pptx"].includes(l)&&(o="slides");const i=document.createElement("div");i.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    color: var(--text-primary);
    font-family: var(--font-main);
  `,i.innerHTML=`
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
        <button class="toolbar-btn" title="New Document">${d.getIcon("file",{size:14})}</button>
        <button class="toolbar-btn" title="Open Document">${d.getIcon("folder",{size:14})}</button>
        <button class="toolbar-btn" title="Save Document">${d.getIcon("disk",{size:14})}</button>
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
      ${o==="doc"?`
        <div id="office-editor" contenteditable="true" style="
          width: 800px; min-height: 1000px; margin: 0 auto; background: #0a0a0a; padding: 80px; border: 1px solid #111;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8); color: #eee; font-size: 16px; line-height: 1.6; outline: none; transform: rotateX(2deg); transition: transform 0.5s ease;
        ">
          <h2>Untitled Document</h2>
          <p>Start typing your masterpiece here...</p>
        </div>
      `:o==="sheet"?`
        <div id="office-sheet" style="width: 100%; height: 100%; background: #111; overflow: auto; display: flex; flex-direction: column;">
          <div style="display: flex; background: #222; border-bottom: 1px solid #333;">
            <div style="width: 40px; border-right: 1px solid #333;"></div>
            ${Array.from({length:26}).map((e,r)=>`<div style="width: 100px; padding: 4px; text-align: center; border-right: 1px solid #333; font-size: 11px; color: #888;">${String.fromCharCode(65+r)}</div>`).join("")}
          </div>
          ${Array.from({length:50}).map((e,r)=>`
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
  `,p.createWindow({id:`office-${Date.now()}`,title:t.path?t.path.split("/").pop():`New ${o==="doc"?"Document":o==="sheet"?"Spreadsheet":"Presentation"} — Office`,icon:o==="doc"?"file":o==="sheet"?"storage":"video",width:1100,height:800,content:i});const a=i.querySelector("#office-editor")||i.querySelector("#office-sheet")||i.querySelector("#office-slides");if(i.querySelectorAll("[data-cmd]").forEach(e=>{e.onclick=()=>{const r=e.dataset.cmd;document.execCommand(r,!1,null)}}),t.path)try{const e=await n.readFile(t.path);a.innerHTML=e}catch(e){console.error("Office: Failed to load file",e)}let s;a.oninput=()=>{t.path&&(clearTimeout(s),s=setTimeout(async()=>{var e;await n.writeFile(t.path,a.innerHTML),(e=window.__everestConsole)==null||e.log(`💾 Office: Auto-saved ${t.path}`)},2e3))}}export{b as launch};
