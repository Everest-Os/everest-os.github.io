const Applet = imports.ui.applet;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.set_applet_icon_name('audio-volume-high');
    this.set_applet_tooltip("Volume");
  }

  on_applet_clicked(event) {
    this._togglePopup();
  }

  _togglePopup() {
    let popup = document.getElementById('volume-popup');
    if (popup) {
      popup.remove();
      return;
    }

    popup = document.createElement('div');
    popup.id = 'volume-popup';
    popup.className = 'panel-popup';
    popup.style.padding = '15px';
    popup.style.width = '200px';
    popup.style.position = 'absolute';
    popup.style.background = 'var(--bg-surface)';
    popup.style.border = '1px solid var(--border)';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = 'var(--shadow-lg)';
    popup.style.zIndex = '9999';

    popup.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
        <input type="range" min="0" max="100" value="75" style="flex:1; accent-color: var(--mint-green);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      </div>
      <div style="margin-top:10px; font-size:12px; text-align:center; color:var(--text-secondary);">
        Output: System Speakers
      </div>
    `;

    const rect = this.actor._element.getBoundingClientRect();
    popup.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
    popup.style.right = (window.innerWidth - rect.right) + 'px';
    
    document.body.appendChild(popup);

    const close = (e) => {
      if (!popup.contains(e.target) && !this.actor._element.contains(e.target)) {
        popup.remove();
        document.removeEventListener('mousedown', close);
      }
    };
    document.addEventListener('mousedown', close);
  }
}
