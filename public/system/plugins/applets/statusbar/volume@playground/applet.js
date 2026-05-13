const Applet = imports.ui.applet;
const { VolumeManager, IconHelper } = window.osAPI;

function main(metadata, orientation, panel_height, instance_id) {
  return new MyApplet(metadata, orientation, panel_height, instance_id);
}

class MyApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this._updateIcon();
    this.set_applet_tooltip("Volume");

    // Sync with system volume changes from other sources
    window.addEventListener('system-volume-changed', () => {
      this._updateIcon();
    });
  }

  _updateIcon() {
    const vol = VolumeManager.masterVolume;
    const muted = VolumeManager.muted;

    if (muted || vol === 0) {
      this.set_applet_icon_name('audio-volume-muted');
    } else if (vol < 33) {
      this.set_applet_icon_name('audio-volume-low');
    } else if (vol < 66) {
      this.set_applet_icon_name('audio-volume-medium');
    } else {
      this.set_applet_icon_name('audio-volume-high');
    }
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
    popup.style.width = '240px';
    popup.style.position = 'absolute';
    popup.style.background = 'var(--bg-surface)';
    popup.style.border = '1px solid var(--border)';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = 'var(--shadow-lg)';
    popup.style.zIndex = '9999';
    popup.style.backdropFilter = 'blur(10px)';

    const currentVol = VolumeManager.masterVolume;
    const isMuted = VolumeManager.muted;

    popup.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 4px;">
           <span style="font-size:13px; font-weight:600; color:var(--text-primary);">Master Volume</span>
           <span id="vol-percentage" style="font-size:11px; color:var(--text-secondary);">${currentVol}%</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <button id="mute-toggle" style="background:none; border:none; padding:8px; cursor:pointer; color:var(--text-primary); display:flex; align-items:center; border-radius:50%; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-surface-hover)'" onmouseout="this.style.background='none'">
             ${isMuted ? IconHelper.getIcon('audio-volume-muted', { size: 22 }) : IconHelper.getIcon('audio-volume-low', { size: 22 })}
          </button>
          <input type="range" id="master-vol-slider" min="0" max="100" value="${currentVol}" style="flex:1; accent-color: var(--mint-green); cursor:pointer;">
          <button id="max-toggle" style="background:none; border:none; padding:8px; cursor:pointer; color:var(--text-primary); display:flex; align-items:center; border-radius:50%; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-surface-hover)'" onmouseout="this.style.background='none'">
             ${IconHelper.getIcon('audio-volume-high', { size: 22 })}
          </button>
        </div>
        <div style="height:1px; background:var(--border); margin:4px 0;"></div>
        <div style="font-size:11px; text-align:center; color:var(--text-tertiary); display:flex; align-items:center; justify-content:center; gap:6px;">
          ${IconHelper.getIcon('computer,💻', { size: 12 })} Output: System Speakers
        </div>
      </div>
    `;

    const rect = this.actor._element.getBoundingClientRect();
    popup.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    popup.style.right = (window.innerWidth - rect.right) + 'px';
    
    document.body.appendChild(popup);

    const slider = popup.querySelector('#master-vol-slider');
    const percentage = popup.querySelector('#vol-percentage');
    const muteBtn = popup.querySelector('#mute-toggle');
    const maxBtn = popup.querySelector('#max-toggle');

    const updateUI = () => {
      const vol = VolumeManager.masterVolume;
      const muted = VolumeManager.muted;
      percentage.textContent = vol + '%';
      slider.value = vol;
      slider.style.opacity = muted ? '0.5' : '1';
      muteBtn.innerHTML = (muted || vol === 0) ? IconHelper.getIcon('audio-volume-muted', { size: 22 }) : IconHelper.getIcon('audio-volume-low', { size: 22 });
    };

    slider.oninput = () => {
      const val = parseInt(slider.value);
      VolumeManager.setVolume(val);
      if (val > 0 && VolumeManager.muted) {
        VolumeManager.setMuted(false);
      }
      updateUI();
    };

    muteBtn.onclick = () => {
      VolumeManager.toggleMute();
      updateUI();
    };

    maxBtn.onclick = () => {
      VolumeManager.setVolume(100);
      VolumeManager.setMuted(false);
      updateUI();
    };

    // Listen for external changes while popup is open
    const onExtChange = () => updateUI();
    window.addEventListener('system-volume-changed', onExtChange);


    const close = (e) => {
      if (!popup.contains(e.target) && !this.actor._element.contains(e.target)) {
        popup.remove();
        document.removeEventListener('mousedown', close);
      }
    };
    document.addEventListener('mousedown', close);
  }
}
