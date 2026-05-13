const { IconHelper } = window.osAPI;

export function launch(ctx, options = {}) {
  const { windowManager, vfs, filePicker } = ctx;
  const initialPath = options.path || '';

  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #000;
    color: #fff;
    font-family: var(--font-main);
    position: relative;
    overflow: hidden;
  `;

  content.innerHTML = `
    <!-- Top toolbar -->
    <div style="background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); padding: 12px 20px; position: absolute; top: 0; left: 0; right: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; opacity: 0; transition: opacity 0.3s;" id="vp-top">
      <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
        <button id="vp-open" class="btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); border: none; color: white; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('folder', { size: 14 })} Open</button>
        <span id="vp-title" style="font-size: 13px; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 80%;">No video loaded</span>
      </div>
    </div>

    <!-- Video Area -->
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;" id="vp-container">
      <video id="vp-video" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer;" autoplay></video>
    </div>

    <!-- Custom Controls -->
    <div style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; opacity: 0; transition: opacity 0.3s; position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;" id="vp-bottom">
      
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <input type="range" id="vp-progress" value="0" min="0" max="100" style="width: 100%; height: 4px; cursor: pointer;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #ccc; font-family: var(--font-mono);">
          <span id="vp-current-time">0:00</span>
          <span id="vp-duration">0:00</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button id="vp-play" style="background: none; border: none; font-size: 18px; cursor: pointer; color: white; padding: 4px; display:flex; align-items:center; justify-content:center;">${IconHelper.getIcon('pause', { size: 18 })}</button>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px;">${IconHelper.getIcon('volume', { size: 14 })}</span>
            <input type="range" id="vp-volume" value="80" min="0" max="100" style="width: 80px; height: 4px; cursor: pointer;">
            <span style="font-size: 12px;">${IconHelper.getIcon('volume', { size: 14 })}</span>
          </div>
        </div>
        <button id="vp-fullscreen" style="background: rgba(255,255,255,0.1); border: none; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; color: white; padding: 4px 10px; display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('scale', { size: 14 })} Fullscreen</button>
      </div>
    </div>

    <style>
      #vp-progress, #vp-volume { accent-color: var(--accent); }
    </style>
  `;

  const win = windowManager.createWindow({
    id: `video-player-${Date.now()}`,
    title: 'Video Player',
    icon: 'video',
    width: 800,
    height: 500,
    content: content
  });

  const video = content.querySelector('#vp-video');
  const playBtn = content.querySelector('#vp-play');
  const progress = content.querySelector('#vp-progress');
  const volume = content.querySelector('#vp-volume');
  const currentTime = content.querySelector('#vp-current-time');
  const duration = content.querySelector('#vp-duration');
  const fullscreen = content.querySelector('#vp-fullscreen');
  const topToolbar = content.querySelector('#vp-top');
  const bottomToolbar = content.querySelector('#vp-bottom');
  const container = content.querySelector('#vp-container');
  const titleEl = content.querySelector('#vp-title');

  let isPlaying = true;

  const loadFile = (filePath) => {
    if (!filePath) return;
    video.src = vfs.getFsPath(filePath);
    const fname = filePath.split('/').pop();
    titleEl.textContent = fname;
    windowManager.setTitle(win.id, `Video - ${fname}`);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  let hideTimeout;
  const showControls = () => {
    topToolbar.style.opacity = '1';
    bottomToolbar.style.opacity = '1';
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (isPlaying) {
        topToolbar.style.opacity = '0';
        bottomToolbar.style.opacity = '0';
      }
    }, 2500);
  };

  content.onmousemove = showControls;
  content.onmouseleave = () => {
    topToolbar.style.opacity = '0';
    bottomToolbar.style.opacity = '0';
  };

  playBtn.onclick = () => {
    if (isPlaying) {
      video.pause();
      playBtn.innerHTML = IconHelper.getIcon('play', { size: 18 });
      isPlaying = false;
    } else {
      video.play().catch(e => console.error(e));
      playBtn.innerHTML = IconHelper.getIcon('pause', { size: 18 });
      isPlaying = true;
    }
  };

  video.onclick = () => playBtn.onclick();

  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      progress.value = (video.currentTime / video.duration) * 100;
      currentTime.textContent = formatTime(video.currentTime);
      duration.textContent = formatTime(video.duration);
    }
  });

  video.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(video.duration);
    showControls();
  });

  progress.oninput = () => {
    if (video.duration) {
      video.currentTime = (progress.value / 100) * video.duration;
    }
  };

  const { VolumeManager } = window.osAPI;
  const updateActualVolume = () => {
    const master = VolumeManager.volume / 100;
    const local = volume.value / 100;
    video.volume = master * local;
  };

  volume.oninput = () => {
    updateActualVolume();
  };

  const volHandler = () => updateActualVolume();
  window.addEventListener('system-volume-changed', volHandler);
  win._onClose = () => {
    window.removeEventListener('system-volume-changed', volHandler);
  };

  updateActualVolume();

  fullscreen.onclick = () => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (container.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  content.querySelector('#vp-open').onclick = async () => {
    const p = await filePicker.pickFile({
      title: 'Open Video File',
      filter: ['.mp4', '.webm', '.mov', '.mkv']
    });
    if (p) {
      loadFile(p);
      if (!isPlaying) playBtn.onclick();
    }
  };

  if (initialPath) loadFile(initialPath);
}
