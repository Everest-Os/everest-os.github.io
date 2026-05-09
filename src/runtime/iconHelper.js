// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/') 
  ? import.meta.env.BASE_URL 
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

export class IconHelper {
  static getIcons() {
    return window.currentThemeIcons || {
      folder: '📂',
      file: '📄',
      home: '🏠',
      desktop: '🖥️',
      trash: '🗑️',
      computer: '💻',
      music: '🎵',
      video: '🎬',
      image: '🖼️',
      pdf: '📕',
      archive: '📦',
      settings: '⚙️',
      terminal: '💻',
      network: '🌐',
      volume: '🔊',
      calendar: '📅',
      clock: '⏰',
      battery: '🔋',
      shortcut: '🔗',
      info: 'ℹ️',
      search: '🔍',
      menu: '🌿',
      user: '👤',
      users: '👥',
      monitor: '🖥️',
      display: '📺',
      size: 32
    };
  }

  static getIcon(type, options = {}) {
    if (!type) return '';
    const icons = this.getIcons();
    
    let iconName = type;
    let fallback = null;
    
    if (type.includes(',')) {
      const parts = type.split(',');
      iconName = parts[0].trim();
      fallback = parts[1].trim();
    }

    // Smart Lookup: If name has -symbolic, try both symbolic and non-symbolic keys
    let val = icons[iconName];
    if (!val && iconName.endsWith('-symbolic')) {
      const baseName = iconName.replace('-symbolic', '');
      val = icons[baseName];
    }
    
    // If not found in theme as key, check if the name itself is a path/filename
    if (!val && (iconName.includes('.svg') || iconName.includes('.png') || iconName.includes('/'))) {
      val = iconName;
    }

    // If the name is an emoji, just use it
    if (!val && /[^\x00-\x7F]/.test(iconName)) {
      val = iconName;
    }

    // Check for extension specific icons if not found by name
    if (!val) {
      if (iconName === 'html') val = icons['text-html'] || icons['code'];
      else if (['mp3', 'ogg', 'wav', 'm4a', 'aac'].includes(iconName)) val = icons['music'];
      else if (['mp4', 'webm', 'mov', 'mkv'].includes(iconName)) val = icons['video'];
      else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(iconName)) val = icons['image'];
      else if (iconName === 'pdf') val = icons['pdf'];
      else if (['zip', 'rar', 'tar', 'gz', '7z', 'iso'].includes(iconName)) val = icons['archive'];
      else if (['js', 'json', 'py', 'sh', 'html', 'css', 'c', 'cpp', 'java', 'ts'].includes(iconName)) val = icons['code'];
      else if (['txt', 'md', 'doc', 'docx', 'odt'].includes(iconName)) val = icons['text'] || icons['file'];
      else if (['xls', 'xlsx', 'ods', 'csv'].includes(iconName)) val = icons['office'] || icons['file'];
      else if (['ppt', 'pptx', 'odp'].includes(iconName)) val = icons['office'] || icons['file'];
    }

    // Final resolution: Themed Icon -> Fallback Emoji -> Global Default
    if (!val) {
      val = fallback || (iconName.includes('folder') ? '📂' : (icons['file'] || '📄'));
    }

    // Double check if it's a theme key but we wanted a fallback
    if (val === 'menu' && !icons['menu']) val = '🌿';

    const size = options.size || icons.size || 32;
    const className = options.className || '';

    if (val.startsWith('url(') || val.startsWith('http') || val.startsWith('/') || val.startsWith('./') || val.startsWith('~') || val.includes('.svg') || val.includes('.png')) {
      if (val.startsWith('~')) {
        val = BASE_URL + `fs/home/user${val.slice(1)}`;
      } else if (val.startsWith('/home/user')) {
        val = BASE_URL + `fs${val}`;
      }
      let src = val.startsWith('/') || val.startsWith('./') || val.startsWith('http') ? val : BASE_URL + `icons/${val}`;

      // Smart Resolution: Determine if we want symbolic or color
      // If symbolic is not explicitly true, we prefer color.
      const wantSymbolic = options.symbolic === true;
      
      // If we don't want symbolic, but we have a symbolic name, try to find the color version
      if (!wantSymbolic && iconName.endsWith('-symbolic')) {
        const baseName = iconName.replace('-symbolic', '');
        if (icons[baseName]) {
          const colorVal = icons[baseName];
          src = colorVal.startsWith('/') || colorVal.startsWith('./') || colorVal.startsWith('http') ? colorVal : `icons/${colorVal}`;
        }
      }

      // We use the monochrome mask if:
      // 1. We explicitly want symbolic rendering, OR the asset is inherently symbolic (from a symbolic folder)
      // 2. The asset is an SVG (masks don't work well with PNGs for this purpose)
      const isSymbolicAsset = src.includes('/symbolic/');
      if ((wantSymbolic || isSymbolicAsset) && src.includes('.svg')) {
        return `<div class="symbolic-icon ${className}" style="
          width: ${size}px; 
          height: ${size}px; 
          background-color: currentColor; 
          -webkit-mask: url(${src}) no-repeat center; 
          mask: url(${src}) no-repeat center; 
          -webkit-mask-size: contain; 
          mask-size: contain; 
          display: inline-block; 
          vertical-align: middle;
        "></div>`;
      }

      // Default to color image (img tag preserves SVG/PNG colors)
      return `<img src="${src}" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; vertical-align: middle;" />`;
    }

    // Default to emoji span
    return `<span class="${className}" style="font-size: ${size}px; line-height: 1;">${val}</span>`;
  }

  /**
   * Get raw icon value (emoji or url)
   */
  static getRaw(type) {
    const icons = this.getIcons();
    return icons[type] || icons['file'];
  }
}
