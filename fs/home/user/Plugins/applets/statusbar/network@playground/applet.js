const Applet = imports.ui.applet;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.set_applet_icon_name('network-wireless');
    this.set_applet_tooltip("Network");
  }

  on_applet_clicked(event) {
    this._togglePopup();
  }

  _togglePopup() {
    let popup = document.getElementById('network-popup');
    if (popup) {
      popup.remove();
      return;
    }

    popup = document.createElement('div');
    popup.id = 'network-popup';
    popup.className = 'panel-popup';
    popup.style.padding = '15px';
    popup.style.width = '240px';
    popup.style.position = 'absolute';
    popup.style.background = 'var(--bg-surface)';
    popup.style.border = '1px solid var(--border)';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = 'var(--shadow-lg)';
    popup.style.zIndex = '9999';

    popup.innerHTML = `
      <div style="font-weight:600; margin-bottom:10px; font-size:13px; color:var(--text-primary);">Network Connections</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(0,255,0,0.05); border-radius:4px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--mint-green);"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:12px; font-weight:500;">Prozilla-Fiber-5G</span>
              <span style="font-size:10px; color:var(--mint-green);">Connected</span>
            </div>
          </div>
          <span style="font-size:10px; color:var(--text-tertiary);">Secure</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:8px; opacity:0.6;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.58 16.11a7 7 0 0 1 6.84 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
          <span style="font-size:12px;">Office-Guest</span>
        </div>
        <div style="border-top:1px solid var(--border); margin:5px 0;"></div>
        <div style="font-size:12px; color:var(--text-accent); cursor:pointer;">Network Settings...</div>
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
