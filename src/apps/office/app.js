/**
 * Office App
 * Professional document editor with cinematic design.
 */

export async function launch(ctx, options = {}) {
  const { windowManager, vfs } = ctx;
  const { IconHelper } = await import('../../runtime/iconHelper.js');
  const { ZipHelper } = await import('../../runtime/zipHelper.js');


  const ext = options.path ? options.path.split('.').pop().toLowerCase() : 'odt';
  let mode = 'doc';
  if (['xls', 'xlsx'].includes(ext)) mode = 'sheet';
  else if (['ppt', 'pptx'].includes(ext)) mode = 'slides';


  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    color: var(--text-primary);
    font-family: var(--font-main);
  `;

  content.innerHTML = `
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
        <button class="toolbar-btn" title="New Document">${IconHelper.getIcon('file', { size: 14 })}</button>
        <button class="toolbar-btn" title="Open Document">${IconHelper.getIcon('folder', { size: 14 })}</button>
        <button class="toolbar-btn" title="Save Document">${IconHelper.getIcon('disk', { size: 14 })}</button>
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
      ${mode === 'doc' ? `
        <div id="office-editor" contenteditable="true" style="
          width: 800px; min-height: 1000px; margin: 0 auto; background: #0a0a0a; padding: 80px; border: 1px solid #111;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8); color: #eee; font-size: 16px; line-height: 1.6; outline: none; transform: rotateX(2deg); transition: transform 0.5s ease;
        ">
          <h2>Untitled Document</h2>
          <p>Start typing your masterpiece here...</p>
        </div>
      ` : mode === 'sheet' ? `
        <div id="office-sheet" style="width: 100%; height: 100%; background: #111; overflow: auto; display: flex; flex-direction: column;">
          <div style="display: flex; background: #222; border-bottom: 1px solid #333;">
            <div style="width: 40px; border-right: 1px solid #333;"></div>
            ${Array.from({ length: 26 }).map((_, i) => `<div style="width: 100px; padding: 4px; text-align: center; border-right: 1px solid #333; font-size: 11px; color: #888;">${String.fromCharCode(65 + i)}</div>`).join('')}
          </div>
          ${Array.from({ length: 50 }).map((_, i) => `
            <div style="display: flex; border-bottom: 1px solid #222;">
              <div style="width: 40px; padding: 4px; text-align: center; border-right: 1px solid #333; font-size: 11px; color: #555; background: #1a1a1a;">${i + 1}</div>
              ${Array.from({ length: 26 }).map(() => `<div contenteditable="true" style="width: 100px; height: 24px; border-right: 1px solid #222; outline: none; padding: 2px 4px; font-size: 12px;"></div>`).join('')}
            </div>
          `).join('')}
        </div>
      ` : `
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
  `;

  const win = windowManager.createWindow({
    id: `office-${Date.now()}`,
    title: options.path ? options.path.split('/').pop() : `New ${mode === 'doc' ? 'Document' : mode === 'sheet' ? 'Spreadsheet' : 'Presentation'} — Office`,
    icon: mode === 'doc' ? 'file' : mode === 'sheet' ? 'storage' : 'video',
    width: 1100,
    height: 800,
    content
  });

  const editor = content.querySelector('#office-editor') || content.querySelector('#office-sheet') || content.querySelector('#office-slides');


  content.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.onclick = () => {
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
    };
  });

  if (options.path) {
    try {
      let savedContent = await vfs.readFile(options.path);
      
      // Real ODT Support
      if (options.path.endsWith('.odt') && (savedContent instanceof Blob || (typeof savedContent === 'string' && savedContent.startsWith('data:')))) {
        console.log("Office: Detected binary ODT, unzipping...");
        try {
          const JSZip = await ZipHelper.getJSZip();
          const blob = savedContent instanceof Blob ? savedContent : await (await fetch(savedContent)).blob();
          const zip = await JSZip.loadAsync(blob);
          const contentXml = await zip.file("content.xml").async("text");
          
          // Extract automatic styles for formatting (bold, italic, alignment, etc.)
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(contentXml, "text/xml");
          
          const styles = {};
          const autoStyles = xmlDoc.getElementsByTagName("office:automatic-styles")[0];
          if (autoStyles) {
            for (let style of autoStyles.children) {
              if (style.tagName === "style:style") {
                const name = style.getAttribute("style:name");
                let css = "";
                const textProps = style.getElementsByTagName("style:text-properties")[0];
                if (textProps) {
                  if (textProps.getAttribute("fo:font-weight") === "bold") css += "font-weight: bold;";
                  if (textProps.getAttribute("fo:font-style") === "italic") css += "font-style: italic;";
                  if (textProps.getAttribute("style:text-underline-style") === "solid") css += "text-decoration: underline;";
                  if (textProps.getAttribute("fo:color")) css += `color: ${textProps.getAttribute("fo:color")};`;
                  if (textProps.getAttribute("fo:font-size")) css += `font-size: ${textProps.getAttribute("fo:font-size")};`;
                  if (textProps.getAttribute("style:font-name")) css += `font-family: '${textProps.getAttribute("style:font-name")}';`;
                }
                const paraProps = style.getElementsByTagName("style:paragraph-properties")[0];
                if (paraProps) {
                  if (paraProps.getAttribute("fo:text-align")) css += `text-align: ${paraProps.getAttribute("fo:text-align")};`;
                }
                if (css) styles[name] = css;
              }
            }
          }

          // Recursive function to convert ODT nodes to HTML
          function nodeToHtml(node) {
            if (node.nodeType === 3) return node.textContent.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if (node.nodeType !== 1) return "";
            
            let tag = "span";
            const styleName = node.getAttribute("text:style-name");
            const styleAttr = styleName && styles[styleName] ? ` style="${styles[styleName]}"` : "";

            switch (node.tagName) {
              case "text:p": tag = "p"; break;
              case "text:h": 
                const level = node.getAttribute("text:outline-level") || "1";
                tag = `h${Math.min(Math.max(level, 1), 6)}`; 
                break;
              case "text:span": tag = "span"; break;
              case "text:a": 
                const href = node.getAttribute("xlink:href") || "#";
                return `<a href="${href}"${styleAttr}>${Array.from(node.childNodes).map(nodeToHtml).join("")}</a>`;
              case "text:list": tag = "ul"; break;
              case "text:list-item": tag = "li"; break;
              case "text:s": return "&nbsp;".repeat(parseInt(node.getAttribute("text:c") || 1));
              case "text:tab": return "&emsp;";
              case "text:line-break": return "<br/>";
              // Skip these wrapper tags, just render children
              case "office:text": 
              case "office:body":
              case "office:document-content":
                return Array.from(node.childNodes).map(nodeToHtml).join("");
              // If it's an unmapped tag, just render children
              default: return Array.from(node.childNodes).map(nodeToHtml).join("");
            }

            const childrenHtml = Array.from(node.childNodes).map(nodeToHtml).join("");
            // Don't render empty spans to keep HTML clean
            if (tag === "span" && !styleAttr && !childrenHtml.trim()) return ""; 
            
            return `<${tag}${styleAttr}>${childrenHtml}</${tag}>`;
          }

          const officeBody = xmlDoc.getElementsByTagName("office:body")[0];
          savedContent = officeBody ? nodeToHtml(officeBody) : "<p><i>Empty document</i></p>";
        } catch (err) {
          console.error("Office: Failed to parse ODT", err);
          savedContent = `<div style="color:red; padding: 20px;">Error parsing ODT: ${err.message}</div>`;
        }
      }
      
      editor.innerHTML = savedContent;
    } catch (e) {
      console.error("Office: Failed to load file", e);
    }
  }

  // Auto-save logic
  let saveTimeout;
  editor.oninput = () => {
    if (options.path) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        await vfs.writeFile(options.path, editor.innerHTML);
        window.__everestConsole?.log(`💾 Office: Auto-saved ${options.path}`);
      }, 2000);
    }
  };
}
