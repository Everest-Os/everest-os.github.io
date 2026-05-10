const { IconHelper } = window.osAPI;

export function launch(ctx, options = {}) {
  const { windowManager, vfs, filePicker } = ctx;
  const initialPath = options.path || '';

  const content = document.createElement('div');
  content.style.cssText = `
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
    padding: 24px;
  `;

  content.innerHTML = `
    <div style="width: 100%; display: flex; justify-content: flex-end;">
      <button id="mp-open" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${IconHelper.getIcon('folder,📁', { size: 14 })} Open File</button>
    </div>

    <div style="text-align: center; margin-top: 8px;">
      <div id="mp-title" style="font-size: 15px; font-weight: 700; margin-bottom: 4px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">No song loaded</div>
      <div id="mp-artist" style="font-size: 11px; color: var(--text-secondary); opacity: 0.7;">Unknown Artist</div>
    </div>

    <!-- Vinyl record animation -->
    <div style="width: 160px; height: 160px; border-radius: 50%; background: #111; border: 8px solid #282828; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg); position: relative; margin: 20px 0;" id="mp-disc">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #1a1a1a;"></div>
      </div>
      <div style="position: absolute; inset: 0; border-radius: 50%; background: repeating-radial-gradient(circle, transparent 0, transparent 2px, rgba(255,255,255,0.03) 3px, transparent 4px);"></div>
    </div>

    <div style="width: 100%; display: flex; flex-direction: column; gap: 16px;">
      <audio id="mp-audio" style="display: none;"></audio>
      
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 0 4px;">
        <input type="range" id="mp-progress" value="0" min="0" max="100" style="width: 100%; cursor: pointer;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-tertiary); font-family: var(--font-mono);">
          <span id="mp-current-time">0:00</span>
          <span id="mp-duration">0:00</span>
        </div>
      </div>

      <div style="display: flex; justify-content: center; align-items: center; gap: 24px;">
        <button id="mp-play" style="width: 52px; height: 52px; border-radius: 50%; border: none; background: var(--accent); color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow); transition: transform 0.2s;">${IconHelper.getIcon('play,▶️', { size: 24 })}</button>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0.8;">
        <span style="font-size: 12px;">${IconHelper.getIcon('volume,🔊', { size: 16 })}</span>
        <input type="range" id="mp-volume" value="80" min="0" max="100" style="flex: 1; cursor: pointer;">
        <span style="font-size: 12px;">${IconHelper.getIcon('volume,🔊', { size: 16 })}</span>
      </div>
    </div>

    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      #mp-progress, #mp-volume { accent-color: var(--accent); }
    </style>
  `;

  const win = windowManager.createWindow({
    id: `music-player-${Date.now()}`,
    title: 'Music Player',
    icon: 'music,🎵',
    width: 320,
    height: 480,
    content: content
  });

  const audio = content.querySelector('#mp-audio');
  const playBtn = content.querySelector('#mp-play');
  const progress = content.querySelector('#mp-progress');
  const volume = content.querySelector('#mp-volume');
  const currentTime = content.querySelector('#mp-current-time');
  const duration = content.querySelector('#mp-duration');
  const disc = content.querySelector('#mp-disc');
  const titleEl = content.querySelector('#mp-title');

  let isPlaying = false;

  const loadFile = (filePath) => {
    if (!filePath) return;
    audio.src = vfs.getFsPath(filePath);
    audio.load();
    const fname = filePath.split('/').pop();
    titleEl.textContent = fname;
    windowManager.setTitle(win.id, `Music - ${fname}`);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  playBtn.onclick = () => {
    if (!audio.src) return;
    if (isPlaying) {
      audio.pause();
      playBtn.innerHTML = IconHelper.getIcon('play,▶️', { size: 24 });
      disc.style.animation = 'none';
      isPlaying = false;
    } else {
      audio.play().catch(e => console.error(e));
      playBtn.innerHTML = IconHelper.getIcon('pause,⏸️', { size: 24 });
      disc.style.animation = 'spin 3s linear infinite';
      isPlaying = true;
    }
  };

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
  });

  progress.oninput = () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
  };

  volume.oninput = () => {
    audio.volume = volume.value / 100;
  };

  content.querySelector('#mp-open').onclick = async () => {
    const p = await filePicker.pickFile({
      title: 'Open Audio File',
      filter: ['.mp3', '.ogg', '.wav', '.m4a', '.aac']
    });
    if (p) {
      loadFile(p);
      if (!isPlaying) playBtn.onclick();
    }
  };

  if (initialPath) loadFile(initialPath);
}
