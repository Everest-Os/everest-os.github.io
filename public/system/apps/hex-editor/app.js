const { IconHelper } = window.osAPI;

export async function launch(ctx, args = []) {
  const { windowManager, vfs } = ctx;
  const filePath = args[0] || null;

  const content = document.createElement('div');
  content.style.height = '100%';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.background = '#1e1e1e';
  content.style.color = '#d4d4d4';
  content.style.fontFamily = 'var(--font-mono)';

  content.innerHTML = `
    <div style="padding: 12px 16px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; background: #252526;">
      <div style="display: flex; gap: 8px; align-items: center; font-size: 13px;">
        ${IconHelper.getIcon('file', { size: 16, color: '#007acc' })}
        <span id="he-path" style="font-weight: 600;">No file opened</span>
      </div>
      <div id="he-size" style="font-size: 12px; color: #858585;">0 bytes</div>
    </div>
    
    <div style="display: flex; flex: 1; overflow: hidden;">
      <div id="he-offsets" style="padding: 16px 8px; background: #1e1e1e; color: #858585; user-select: none; text-align: right; border-right: 1px solid #333; overflow-y: hidden;"></div>
      <div id="he-hex" style="padding: 16px; flex: 2; overflow-y: auto; white-space: pre;"></div>
      <div id="he-ascii" style="padding: 16px; flex: 1; border-left: 1px solid #333; overflow-y: hidden; white-space: pre; color: #9cdcfe;"></div>
    </div>
  `;

  const win = windowManager.createWindow({
    id: 'hex-editor' + (filePath ? '-' + filePath.replace(/[^a-zA-Z0-9]/g, '') : ''),
    title: 'Hex Editor' + (filePath ? ' - ' + filePath.split('/').pop() : ''),
    icon: 'application-octet-stream',
    width: 750,
    height: 500,
    content
  });

  const offsetsEl = content.querySelector('#he-offsets');
  const hexEl = content.querySelector('#he-hex');
  const asciiEl = content.querySelector('#he-ascii');
  
  // Sync scroll
  hexEl.addEventListener('scroll', () => {
    offsetsEl.scrollTop = hexEl.scrollTop;
    asciiEl.scrollTop = hexEl.scrollTop;
  });

  if (filePath) {
    try {
      content.querySelector('#he-path').textContent = filePath;
      
      // Read as ArrayBuffer/Blob
      const blob = await vfs.readFile(filePath);
      let buffer;
      
      if (blob instanceof Blob) {
        buffer = await blob.arrayBuffer();
      } else if (typeof blob === 'string') {
        const encoder = new TextEncoder();
        buffer = encoder.encode(blob).buffer;
      } else if (blob instanceof ArrayBuffer) {
        buffer = blob;
      } else {
        throw new Error('Unsupported buffer format');
      }

      content.querySelector('#he-size').textContent = buffer.byteLength + ' bytes';

      // Only display the first 64KB to prevent hanging the browser
      const maxRender = 65536; 
      const viewLength = Math.min(buffer.byteLength, maxRender);
      const view = new Uint8Array(buffer, 0, viewLength);
      
      let offsetsStr = '';
      let hexStr = '';
      let asciiStr = '';
      
      for (let i = 0; i < view.length; i += 16) {
        // Offset
        offsetsStr += i.toString(16).padStart(8, '0').toUpperCase() + '\\n';
        
        let hexLine = '';
        let asciiLine = '';
        
        for (let j = 0; j < 16; j++) {
          if (i + j < view.length) {
            const byte = view[i + j];
            hexLine += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
            
            // ASCII representation (printable characters only)
            if (byte >= 32 && byte <= 126) {
              asciiLine += String.fromCharCode(byte);
            } else {
              asciiLine += '.';
            }
          } else {
            hexLine += '   ';
            asciiLine += ' ';
          }
          if (j === 7) hexLine += ' '; // Extra space at half line
        }
        
        hexStr += hexLine + '\\n';
        asciiStr += asciiLine + '\\n';
      }
      
      if (buffer.byteLength > maxRender) {
        offsetsStr += '...\\n';
        hexStr += '\\n[File exceeds 64KB. Remaining bytes truncated for performance]\\n';
        asciiStr += '...\\n';
      }

      offsetsEl.textContent = offsetsStr;
      hexEl.textContent = hexStr;
      asciiEl.textContent = asciiStr;
      
    } catch (err) {
      hexEl.textContent = 'Failed to read file: ' + err.message;
    }
  } else {
    hexEl.textContent = 'No file specified.';
  }
}
