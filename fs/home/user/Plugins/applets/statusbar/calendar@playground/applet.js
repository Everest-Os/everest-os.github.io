const Applet = imports.ui.applet;
const Settings = imports.ui.settings;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.TextApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.metadata = metadata;
    this.set_applet_tooltip("Clock & Calendar");
    
    // Initialize Settings
    try {
      this.settings = new Settings.AppletSettings(this, metadata.uuid, instance_id);
      this.settings.bind("use-24h", "use24h", this._updateClock.bind(this));
      this.settings.bind("show-seconds", "showSeconds", this._updateClock.bind(this));
      this.settings.bind("show-date", "showDate", this._updateClock.bind(this));
      this.settings.bind("format-preset", "formatPreset", this._updateClock.bind(this));
      this.settings.bind("custom-format", "customFormat", this._updateClock.bind(this));
    } catch (e) {
      console.error("Calendar Applet: Settings binding failed", e);
    }

    this._updateClock();
    this._timer = setInterval(() => this._updateClock(), 1000);
  }

  on_applet_clicked(event) {
    this._togglePopup();
  }

  _updateClock() {
    const now = new Date();
    
    let formatStr = null;
    if (this.formatPreset && this.formatPreset !== 'default') {
      formatStr = this.formatPreset === 'custom' ? this.customFormat : this.formatPreset;
    }
    
    if (formatStr && formatStr.trim().length > 0) {
      // Very basic formatting support for standard tokens
      let formatted = formatStr
        .replace(/%H/g, now.getHours().toString().padStart(2, '0'))
        .replace(/%I/g, (now.getHours() % 12 || 12).toString().padStart(2, '0'))
        .replace(/%M/g, now.getMinutes().toString().padStart(2, '0'))
        .replace(/%S/g, now.getSeconds().toString().padStart(2, '0'))
        .replace(/%p/g, now.getHours() >= 12 ? 'PM' : 'AM')
        .replace(/%Y/g, now.getFullYear())
        .replace(/%m/g, (now.getMonth() + 1).toString().padStart(2, '0'))
        .replace(/%d/g, now.getDate().toString().padStart(2, '0'))
        .replace(/%a/g, now.toLocaleDateString([], { weekday: 'short' }))
        .replace(/%A/g, now.toLocaleDateString([], { weekday: 'long' }))
        .replace(/%b/g, now.toLocaleDateString([], { month: 'short' }))
        .replace(/%B/g, now.toLocaleDateString([], { month: 'long' }));
      
      this.set_applet_label(formatted);
      return;
    }

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: this.showSeconds ? '2-digit' : undefined,
      hour12: !this.use24h
    };
    
    let timeStr = now.toLocaleTimeString([], options);
    if (this.showDate) {
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      this.set_applet_label(`${timeStr}  ${dateStr}`);
    } else {
      this.set_applet_label(timeStr);
    }
  }

  _togglePopup() {
    let popup = document.getElementById('calendar-popup');
    if (popup) {
      popup.remove();
      return;
    }

    popup = document.createElement('div');
    popup.id = 'calendar-popup';
    popup.className = 'panel-popup';
    popup.style.padding = '20px';
    popup.style.width = '280px';
    popup.style.position = 'absolute';
    popup.style.background = 'var(--bg-surface)';
    popup.style.border = '1px solid var(--border)';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = 'var(--shadow-xl)';
    popup.style.zIndex = '9999';

    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    popup.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <span style="font-weight:700; font-size:15px; color:var(--mint-green);">${month} ${year}</span>
        <div style="display:flex; gap:10px; color:var(--text-tertiary); cursor:pointer;">
          <span>◀</span>
          <span>▶</span>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; text-align:center; font-size:11px; font-weight:600; color:var(--text-tertiary); margin-bottom:10px;">
        <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; text-align:center; font-size:13px;">
        ${this._generateCalendarDays()}
      </div>
      <div style="margin-top:15px; padding-top:15px; border-top:1px solid var(--border); font-size:12px; color:var(--text-secondary);">
        <div style="display:flex; justify-content:space-between;">
          <span>Today</span>
          <span style="color:var(--mint-green); font-weight:600;">${now.toLocaleDateString()}</span>
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

  _generateCalendarDays() {
    const now = new Date();
    const today = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    
    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<span></span>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today;
      const style = isToday ? 'background:var(--mint-green); color:#000; font-weight:700; border-radius:4px;' : 'color:var(--text-primary);';
      html += `<span style="padding:5px 0; ${style}">${d}</span>`;
    }
    return html;
  }

  on_applet_removed_from_panel() {
    if (this._timer) clearInterval(this._timer);
  }
}
