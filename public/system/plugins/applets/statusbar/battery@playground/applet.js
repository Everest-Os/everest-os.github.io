const Applet = imports.ui.applet;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.TextIconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.set_applet_icon_name('battery-full');
    this.set_applet_label('--%');
    this.set_applet_tooltip("Battery: Detecting...");

    this._battery = null;
    this._initBattery();
  }

  async _initBattery() {
    if (navigator.getBattery) {
      try {
        this._battery = await navigator.getBattery();

        const update = () => this._updateBatteryUI();
        this._battery.addEventListener('levelchange', update);
        this._battery.addEventListener('chargingchange', update);
        this._battery.addEventListener('dischargingtimechange', update);
        this._battery.addEventListener('chargingtimechange', update);

        update();
      } catch (e) {
        console.error("Battery API error:", e);
        this._updateBatteryUI(); // Fallback
      }
    } else {
      this._updateBatteryUI(); // No API fallback
    }
  }

  _updateBatteryUI() {
    const level = this._battery ? Math.round(this._battery.level * 100) : 100;
    const charging = this._battery ? this._battery.charging : true;

    let icon = 'battery-full';
    if (level <= 10) icon = 'battery-empty';
    else if (level <= 25) icon = 'battery-caution';
    else if (level <= 45) icon = 'battery-low';
    else if (level <= 75) icon = 'battery-good';

    if (charging) {
      if (level === 100) icon = 'battery-charged';
      else icon += '-charging';
    }

    // Update label percentage
    this.set_applet_label(`${level}%`);

    // Check if theme actually has this icon, otherwise use our beautiful SVG
    const themeIcons = window.currentThemeIcons || {};
    if (themeIcons[icon]) {
      this.set_applet_icon_name(icon);
    } else {
      this._iconEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:${level < 20 ? 'var(--red)' : 'var(--mint-green)'};">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
          <line x1="23" y1="13" x2="23" y2="11"></line>
          ${charging ? '<polyline points="7 12 10 9 10 15 13 12" style="stroke:currentColor"></polyline>' : ''}
          <rect x="3" y="9" width="${Math.max(1, (level / 100) * 14)}" height="6" fill="currentColor" opacity="0.4" stroke="none"></rect>
        </svg>
      `;
    }

    const status = charging ? (level === 100 ? "Fully Charged" : "Charging") : "Discharging";
    this.set_applet_tooltip(`Battery: ${level}% (${status})`);

    // Refresh popup if open
    const popup = document.getElementById('battery-popup');
    if (popup) {
      this._updatePopupContent(popup, level, charging, status);
    }
  }

  _updatePopupContent(popup, level, charging, status) {
    const source = charging ? "AC Adapter" : "Battery";
    const container = popup.querySelector('div:nth-child(2)');
    if (!container) return;

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${level < 20 ? 'var(--red)' : 'var(--mint-green)'};">
              <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
              <line x1="23" y1="13" x2="23" y2="11"></line>
              ${charging ? '<polyline points="7 12 10 9 10 15 13 12" style="stroke:white"></polyline>' : ''}
            </svg>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:18px; font-weight:700; color:${level < 20 ? 'var(--red)' : 'var(--text-primary)'};">${level}%</span>
              <span style="font-size:10px; color:var(--text-tertiary);">${status}</span>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid var(--border); margin:5px 0;"></div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary);">
          <span>Power Source:</span>
          <span style="font-weight:600; color:var(--text-primary);">${source}</span>
        </div>
        <div style="font-size:11px; color:var(--text-tertiary); margin-top:5px;">
           ${this._battery && !charging && this._battery.dischargingTime !== Infinity ? `Estimated: ${Math.round(this._battery.dischargingTime / 60)} min left` : ''}
        </div>
    `;
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

    const level = this._battery ? Math.round(this._battery.level * 100) : 100;
    const charging = this._battery ? this._battery.charging : true;
    const status = charging ? (level === 100 ? "Fully Charged" : "Charging") : "On Battery";
    const source = charging ? "AC Adapter" : "Battery";

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${level < 20 ? 'var(--red)' : 'var(--mint-green)'};">
              <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
              <line x1="23" y1="13" x2="23" y2="11"></line>
              ${charging ? '<polyline points="7 12 10 9 10 15 13 12" style="stroke:white"></polyline>' : ''}
            </svg>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:18px; font-weight:700; color:${level < 20 ? 'var(--red)' : 'var(--text-primary)'};">${level}%</span>
              <span style="font-size:10px; color:var(--text-tertiary);">${status}</span>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid var(--border); margin:5px 0;"></div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary);">
          <span>Power Source:</span>
          <span style="font-weight:600; color:var(--text-primary);">${source}</span>
        </div>
        <div style="font-size:11px; color:var(--text-tertiary); margin-top:5px;">
           ${this._battery && !charging && this._battery.dischargingTime !== Infinity ? `Estimated: ${Math.round(this._battery.dischargingTime / 60)} min left` : ''}
        </div>
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
