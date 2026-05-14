// Robust base URL detection for subfolder deployment
const BASE_URL = (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/')
  ? import.meta.env.BASE_URL
  : (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

export class IconHelper {
  static getIcons() {
    const defaults = {
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
      'battery-empty': '🪫',
      'battery-caution': '🪫',
      'battery-low': '🪫',
      'battery-good': '🔋',
      'battery-full': '🔋',
      'battery-charged': '🔌',
      'battery-empty-charging': '⚡🪫',
      'battery-caution-charging': '⚡🪫',
      'battery-low-charging': '⚡🪫',
      'battery-good-charging': '⚡🔋',
      'battery-full-charging': '⚡🔋',
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
    const theme = window.currentThemeIcons || {};
    return { ...defaults, ...theme };
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
      else if (['txt', 'md', 'doc', 'docx', 'odt'].includes(iconName)) {
        val = (iconName === 'md' ? icons['text-markdown'] : icons['text-plain']) || icons['text'] || icons['file'];
      }
      else if (['xls', 'xlsx', 'ods', 'csv'].includes(iconName)) val = icons['office-spreadsheet'] || icons['office'] || icons['file'];
      else if (['ppt', 'pptx', 'odp'].includes(iconName)) val = icons['office-presentation'] || icons['office'] || icons['file'];
      else if (['js', 'json', 'py', 'sh', 'html', 'css', 'c', 'cpp', 'java', 'ts'].includes(iconName)) val = icons['application-javascript'] || icons['code'] || icons['file'];
    }

    // Final resolution: Themed Icon -> Fallback Emoji -> Global Default
    if (!val) {
      val = fallback || (iconName.includes('folder') ? '📂' : (icons['file'] || '📄'));
    }

    // Double check if it's a theme key but we wanted a fallback
    if (val === 'menu' && !icons['menu']) val = '🌿';

    const size = options.size || icons.size || 32;
    const className = options.className || '';

    let iconHtml = '';

    if (val.trim().startsWith('<svg')) {
      const updatedSvg = val
        .replace(/width=['"][^'"]+['"]/i, `width='${size}'`)
        .replace(/height=['"][^'"]+['"]/i, `height='${size}'`);
      iconHtml = `<span class="inline-svg-icon ${className}" style="display: inline-flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; vertical-align: middle;">${updatedSvg}</span>`;
    } else if (val.startsWith('url(') || val.startsWith('http') || val.startsWith('/') || val.startsWith('./') || val.startsWith('~') || val.includes('.svg') || val.includes('.png')) {
      if (val.startsWith('~')) {
        val = BASE_URL + `fs/home/user${val.slice(1)}`;
      } else if (val.startsWith('/home/user')) {
        val = BASE_URL + `fs${val}`;
      } else if (val.startsWith('/system')) {
        val = BASE_URL + val.slice(1);
      }
      let src = val.startsWith('/') || val.startsWith('./') || val.startsWith('http') ? val : BASE_URL + `system/icons/${val}`;

      // Smart Resolution: Determine if we want symbolic or color
      const wantSymbolic = options.symbolic === true;

      if (!wantSymbolic && iconName.endsWith('-symbolic')) {
        const baseName = iconName.replace('-symbolic', '');
        if (icons[baseName]) {
          const colorVal = icons[baseName];
          src = colorVal.startsWith('/') || colorVal.startsWith('./') || colorVal.startsWith('http') ? colorVal : `icons/${colorVal}`;
        }
      }

      const isSymbolicAsset = (window.currentThemeSymbolic === true) || src.includes('/symbolic/');
      if ((wantSymbolic || isSymbolicAsset) && src.includes('.svg')) {
        iconHtml = `<div class="symbolic-icon ${className}" style="
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
      } else {
        iconHtml = `<img src="${src}" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; vertical-align: middle;" />`;
      }
    } else {
      // Default to emoji span
      iconHtml = `<span class="${className}" style="font-size: ${size}px; line-height: 1;">${val}</span>`;
    }

    // Hook: Dynamic Theme Helper
    if (window.currentThemeIconHelper && typeof window.currentThemeIconHelper.apply === 'function') {
      try {
        iconHtml = window.currentThemeIconHelper.apply(iconHtml, iconName, options.color, options);
      } catch (e) {
        console.error('IconHelper: dynamic helper error', e);
      }
    }

    return iconHtml;
  }

  /**
   * Get raw icon value (emoji or url)
   */
  static getRaw(type) {
    const icons = this.getIcons();
    return icons[type] || icons['file'];
  }
}
