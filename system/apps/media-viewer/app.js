const { IconHelper } = window.osAPI;

export async function launch(ctx, options = {}) {
  const { windowManager, vfs, appLoader } = ctx;
  const path = (typeof options === 'string') ? options : options.path;

  if (!path) {
    // If no file specified, try to open Pictures folder in Files app
    appLoader.launchApp('files', '~/Pictures');
    return;
  }

  const container = document.createElement('div');
  container.style.cssText = `
    height: 100%;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: white;
  `;

  const fileName = path.split('/').pop();
  const ext = fileName.split('.').pop().toLowerCase();

  const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
  const AUDIO_EXTS = ['mp3', 'ogg', 'wav'];
  const VIDEO_EXTS = ['mp4', 'webm', 'ogv', 'yt'];

  const win = windowManager.createWindow({
    id: `media-viewer-${Date.now()}`,
    title: fileName || 'Media Viewer',
    icon: 'video',
    width: 640,
    height: 480,
    content: container
  });

  try {
    // If it's a VFS path, we might need to resolve it to a URL
    // For now, assuming direct path works if it's in public or resolved via /api/fs
    let url = path;
    if (path.startsWith('~') || path.startsWith('/')) {
      url = vfs.getFsPath(path);
    }

    if (IMAGE_EXTS.includes(ext)) {
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
      container.appendChild(img);
    } else if (AUDIO_EXTS.includes(ext)) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.autoplay = true;
      audio.src = url;
      audio.style.width = '80%';
      container.appendChild(audio);
    } else if (VIDEO_EXTS.includes(ext)) {
      if (ext === 'yt') {
        // ProzillaOS handles .yt files by reading their content as a URL
        const ytUrl = await vfs.readFile(path);
        const iframe = document.createElement('iframe');
        iframe.src = ytUrl.replace("watch?v=", "embed/");
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        container.appendChild(iframe);
      } else {
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.src = url;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '100%';
        container.appendChild(video);
      }
    } else {
      container.innerHTML = `<div style="padding:20px; text-align:center;">Unsupported media type: .${ext}</div>`;
    }
  } catch (e) {
    container.innerHTML = `<div style="padding:20px; text-align:center;">Error loading file: ${e.message}</div>`;
  }
}
