import { IconHelper } from '../../runtime/iconHelper.js';

export function launch(ctx, options = {}) {
  const { windowManager, vfs } = ctx;
  const path = options.path || '';

  const content = document.createElement('div');
  content.style.padding = '0';
  content.style.height = '100%';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.background = 'var(--bg-surface)';
  content.style.color = 'var(--text-primary)';
  content.style.fontFamily = 'Inter, system-ui, sans-serif';

  const basename = path ? path.substring(path.lastIndexOf('/') + 1) : 'No image loaded';

  content.innerHTML = `
    <!-- Toolbar -->
    <div style="background:var(--bg-surface-hover); border-bottom:1px solid var(--border); padding:8px 12px; display:flex; justify-content:space-between; align-items:center; z-index:10;">
      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
        <button id="iv-open" class="btn-secondary" style="height:30px; padding:0 10px; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('folder', { size: 14 })} Open</button>
        <span style="font-size:13px; font-weight:600; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:60%;" id="iv-title">${basename}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button id="iv-zoom-out" class="btn-secondary" style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center;">${IconHelper.getIcon('zoom-out', { size: 14 })}</button>
        <button id="iv-zoom-in" class="btn-secondary" style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center;">${IconHelper.getIcon('zoom-in', { size: 14 })}</button>
        <button id="iv-rotate" class="btn-secondary" style="height:30px; padding:0 10px; display:flex; align-items:center; justify-content:center; gap:6px;">${IconHelper.getIcon('refresh', { size: 14 })} Rotate</button>
      </div>
    </div>

    <!-- Image Area -->
    <div style="flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; position:relative; padding:15px; min-height:0;" id="iv-container">
      <img id="iv-img" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; transition: transform 0.2s; transform-origin: center center;" alt="">
    </div>
  `;

  windowManager.createWindow({
    id: `image-viewer-${Date.now()}`,
    title: 'Image Viewer',
    icon: 'image',
    width: 600,
    height: 460,
    content: content
  });

  const img = content.querySelector('#iv-img');
  const zoomIn = content.querySelector('#iv-zoom-in');
  const zoomOut = content.querySelector('#iv-zoom-out');
  const rotateBtn = content.querySelector('#iv-rotate');

  let scale = 1;
  let rotation = 0;

  const updateTransform = () => {
    img.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
  };

  zoomIn.addEventListener('click', () => {
    scale = Math.min(4, scale + 0.2);
    updateTransform();
  });

  zoomOut.addEventListener('click', () => {
    scale = Math.max(0.2, scale - 0.2);
    updateTransform();
  });

  rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    updateTransform();
  });

  const { filePicker } = ctx;
  const openBtn = content.querySelector('#iv-open');
  const titleEl = content.querySelector('#iv-title');

  const loadImage = (imagePath) => {
    let resolved = vfs.resolvePath(imagePath).replace(/^~/, '/home/user');
    img.src = `/fs${resolved}`;
    titleEl.textContent = imagePath.split('/').pop();
    scale = 1;
    rotation = 0;
    updateTransform();
  };

  openBtn.addEventListener('click', async () => {
    const p = await filePicker.pickFile({
      title: 'Open Image',
      filter: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
    });
    if (p) loadImage(p);
  });

  if (path) {
    loadImage(path);
  }
}
