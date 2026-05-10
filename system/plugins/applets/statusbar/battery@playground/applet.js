const Applet = imports.ui.applet;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.set_applet_icon_name('battery-full');
    this.set_applet_tooltip("Battery: 100% (Charged)");
  }

  on_applet_clicked(event) {
    this._togglePopup();
  }

  _togglePopup() {
    let popup = document.getElementById('battery-popup');
    if (popup) {
      popup.remove();
      return;
    }

    popup = document.createElement('div');
    popup.id = 'battery-popup';
    popup.className = 'panel-popup';
    popup.style.padding = '15px';
    popup.style.width = '220px';
    popup.style.position = 'absolute';
    popup.style.background = 'var(--bg-surface)';
    popup.style.border = '1px solid var(--border)';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = 'var(--shadow-lg)';
    popup.style.zIndex = '9999';

    popup.innerHTML = `
      <div style="font-weight:600; margin-bottom:12px; font-size:13px; color:var(--text-primary);">Power Management</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--mint-green);"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:14px; font-weight:700; color:var(--mint-green);">100%</span>
              <span style="font-size:10px; color:var(--text-tertiary);">Fully Charged</span>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid var(--border); margin:5px 0;"></div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary);">
          <span>Power Source:</span>
          <span style="font-weight:500;">AC Adapter</span>
        </div>
        <div style="font-size:12px; color:var(--text-accent); cursor:pointer; margin-top:5px;">Power Settings...</div>
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
