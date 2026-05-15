const Desklet = imports.ui.desklet;
const Settings = imports.ui.settings;
const { IconHelper, vfs, themeManager } = window.osAPI;

class SysInfoDesklet extends Desklet.Desklet {
    constructor(metadata, desklet_id) {
        super(metadata, desklet_id);
        
        // Compute boot reference timestamp from uptime performance counter
        this._bootTime = Date.now() - window.performance.now();

        // Setup the config framework and bind individual controls
        this.settings = new Settings.DeskletSettings(this, this.metadata.uuid, desklet_id);
        this.settings.bind('show-time', 'showTime', () => this._onSettingsChanged());
        this.settings.bind('show-seconds', 'showSeconds', () => this._updateTime());
        this.settings.bind('show-date', 'showDate', () => this._updateTime());

        // Sync date formats dynamically from calendar settings JSON on VFS
        this._calendarFormat = 'default';
        this._loadCalendarFormat();
        
        this._calendarListener = (e) => {
            if (e.detail?.uuid === 'calendar@playground') {
                this._loadCalendarFormat();
            }
        };
        window.addEventListener('settings-changed', this._calendarListener);
        
        // Dynamic styling triggers
        const styleUpdater = () => this._applyCustomStyles();
        this.settings.bind('use-theme-bg', 'useThemeBg', styleUpdater);
        this.settings.bind('custom-bg', 'customBg', styleUpdater);
        this.settings.bind('custom-opacity', 'customOpacity', styleUpdater);
        this.settings.bind('blur-radius', 'blurRadius', styleUpdater);
        this.settings.bind('use-theme-text', 'useThemeText', styleUpdater);
        this.settings.bind('custom-text-color', 'customTextColor', styleUpdater);

        this._container = document.createElement('div');
        this._container.style.padding = '16px';
        this._container.style.minWidth = '240px';
        this._container.style.borderRadius = '12px';
        this._container.style.boxShadow = 'var(--shadow-xl)';
        this._container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        this._container.style.display = 'flex';
        this._container.style.flexDirection = 'column';

        // Clock and Calendar Section
        this.timeSection = document.createElement('div');
        this.timeSection.style.textAlign = 'center';
        this.timeSection.style.marginBottom = '14px';
        this.timeSection.style.borderBottom = '1px solid var(--border)';
        this.timeSection.style.paddingBottom = '14px';

        this.timeLabel = document.createElement('div');
        this.timeLabel.style.fontSize = '28px';
        this.timeLabel.style.fontWeight = '750';
        this.timeLabel.style.letterSpacing = '-0.5px';
        this.timeLabel.style.lineHeight = '1.1';
        
        this.dateLabel = document.createElement('div');
        this.dateLabel.style.fontSize = '11.5px';
        this.dateLabel.style.fontWeight = '500';
        this.dateLabel.style.marginTop = '3px';

        this.timeSection.appendChild(this.timeLabel);
        this.timeSection.appendChild(this.dateLabel);
        this._container.appendChild(this.timeSection);

        // Detailed System Properties Panel
        this.infoList = document.createElement('div');
        this.infoList.style.display = 'flex';
        this.infoList.style.flexDirection = 'column';
        this.infoList.style.gap = '9px';
        this._container.appendChild(this.infoList);

        this.setContent({ _element: this._container });

        // Setup continuous triggers for theme and icon synchronizers
        this._themeListener = () => this._updateInfo();
        window.addEventListener('theme-changed', this._themeListener);
        window.addEventListener('icon-theme-changed', this._themeListener);

        this._updateTime();
        this._updateInfo();

        // Clock heartbeat loop
        this._timer = setInterval(() => {
            this._updateTime();
            this._updateUptime();
        }, 1000);

        this._onSettingsChanged(); // Immediate structural sync
        this._applyCustomStyles(); // Force draw configurations
    }

    _hexToRgba(hex, opacityPct) {
        let r = 30, g = 30, b = 30;
        const cleaned = hex ? hex.replace('#', '') : '1e1e1e';
        
        if (cleaned.length === 3) {
            r = parseInt(cleaned[0] + cleaned[0], 16);
            g = parseInt(cleaned[1] + cleaned[1], 16);
            b = parseInt(cleaned[2] + cleaned[2], 16);
        } else if (cleaned.length === 6) {
            r = parseInt(cleaned.substring(0, 2), 16);
            g = parseInt(cleaned.substring(2, 4), 16);
            b = parseInt(cleaned.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${opacityPct / 100})`;
    }

    _applyCustomStyles() {
        if (!this._container) return;

        // Background, Border, and Blur Logic
        if (this.useThemeBg !== false) {
            const root = document.documentElement;
            const themeOpacity = getComputedStyle(root).getPropertyValue('--window-opacity').trim();
            const themeBlur = getComputedStyle(root).getPropertyValue('--window-blur').trim();
            
            // Allow desklet's custom opacity/blur sliders to work on theme background
            // UNLESS the theme explicitly forces solid/no-blur (e.g. Win95)
            let finalOpacity = (this.customOpacity !== undefined) ? (this.customOpacity / 100) : 0.88;
            if (themeOpacity === '1') finalOpacity = 1;
            
            let finalBlur = (this.blurRadius !== undefined) ? this.blurRadius + 'px' : '12px';
            if (themeBlur === '0px') finalBlur = '0px';

            this._container.style.background = `rgba(var(--bg-surface-rgb), ${finalOpacity})`;
            this._container.style.border = '1px solid var(--wm-border)';
            const blurStr = `blur(${finalBlur}) saturate(170%)`;
            this._container.style.backdropFilter = blurStr;
            this._container.style.WebkitBackdropFilter = blurStr;
        } else {
            const bgHex = this.customBg || '#1e1e1e';
            const opacity = (this.customOpacity !== undefined) ? this.customOpacity : 80;
            this._container.style.background = this._hexToRgba(bgHex, opacity);
            this._container.style.border = `1px solid rgba(255, 255, 255, 0.12)`;
            const blurStrength = (this.blurRadius !== undefined) ? this.blurRadius : 12;
            const blurStr = `blur(${blurStrength}px) saturate(170%)`;
            this._container.style.backdropFilter = blurStr;
            this._container.style.WebkitBackdropFilter = blurStr;
        }

        // Foreground Text Logic
        const useSystemText = (this.useThemeText !== false);
        const customCol = this.customTextColor || '#ffffff';

        if (useSystemText) {
            this._container.style.color = 'var(--text-primary)';
            this.timeLabel.style.color = 'var(--text-primary)';
            this.dateLabel.style.color = 'var(--text-tertiary)';
            this.dateLabel.style.opacity = '';
            
            const rows = this.infoList.querySelectorAll('[data-key]');
            rows.forEach(row => {
                const labelSide = row.children[0];
                const valCell = row.children[1];
                if (labelSide) {
                    labelSide.style.color = 'var(--text-secondary)';
                    labelSide.style.opacity = '';
                }
                if (valCell) {
                    valCell.style.color = 'var(--text-primary)';
                    valCell.style.opacity = '';
                }
            });
        } else {
            this._container.style.color = customCol;
            this.timeLabel.style.color = customCol;
            this.dateLabel.style.color = customCol;
            this.dateLabel.style.opacity = '0.65';

            const rows = this.infoList.querySelectorAll('[data-key]');
            rows.forEach(row => {
                const labelSide = row.children[0];
                const valCell = row.children[1];
                if (labelSide) {
                    labelSide.style.color = customCol;
                    labelSide.style.opacity = '0.75';
                }
                if (valCell) {
                    valCell.style.color = customCol;
                    valCell.style.opacity = '1';
                }
            });
        }
    }

    _onSettingsChanged() {
        const visible = (this.showTime !== undefined) ? this.showTime : true;
        this.timeSection.style.display = visible ? 'block' : 'none';
        this.timeSection.style.marginBottom = visible ? '14px' : '0';
        this.timeSection.style.paddingBottom = visible ? '14px' : '0';
        this.timeSection.style.borderBottom = visible ? '1px solid var(--border)' : 'none';
    }

    async _loadCalendarFormat() {
        try {
            const path = '~/.config/extensions/calendar@playground/sandbox-calendar@playground.json';
            const exists = await vfs.exists(path);
            if (exists) {
                const raw = await vfs.readFile(path);
                const parsed = JSON.parse(raw);
                const preset = parsed['date-format-preset'] || 'default';
                const custom = parsed['custom-format'] || '%a %b %d';
                this._calendarFormat = (preset === 'custom') ? custom : preset;
            } else {
                this._calendarFormat = 'default';
            }
        } catch (e) {
            this._calendarFormat = 'default';
        }
        this._updateTime();
    }

    _updateTime() {
        const visible = (this.showTime !== undefined) ? this.showTime : true;
        if (!visible) return;
        
        const now = new Date();
        const showSec = (this.showSeconds === true); // default false
        
        this.timeLabel.textContent = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: showSec ? '2-digit' : undefined 
        });
        
        const showD = (this.showDate === true); // default false
        if (showD) {
            this.dateLabel.style.display = 'block';
            let format = this._calendarFormat;
            
            if (!format || format === 'default') {
                this.dateLabel.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            } else {
                this.dateLabel.textContent = format
                    .replace(/%Y/g, now.getFullYear())
                    .replace(/%m/g, (now.getMonth() + 1).toString().padStart(2, '0'))
                    .replace(/%d/g, now.getDate().toString().padStart(2, '0'))
                    .replace(/%a/g, now.toLocaleDateString([], { weekday: 'short' }))
                    .replace(/%A/g, now.toLocaleDateString([], { weekday: 'long' }))
                    .replace(/%b/g, now.toLocaleDateString([], { month: 'short' }))
                    .replace(/%B/g, now.toLocaleDateString([], { month: 'long' }));
            }
        } else {
            this.dateLabel.style.display = 'none';
        }
    }

    _getFilesystemMode() {
        if (!vfs) return 'Offline / Unknown';
        if (vfs.serverAvailable) return 'Server (Dev Mode)';
        if (vfs.db) return 'IndexedDB (Persistent)';
        return 'In-Memory Cache';
    }

    _updateUptime() {
        const elapsedMs = Date.now() - this._bootTime;
        const secs = Math.floor(elapsedMs / 1000) % 60;
        const mins = Math.floor(elapsedMs / (1000 * 60)) % 60;
        const hrs = Math.floor(elapsedMs / (1000 * 60 * 60));
        
        const textVal = `${hrs}h ${mins}m ${secs}s`;
        const row = this.infoList.querySelector('[data-key="uptime"]');
        if (row) {
            const el = row.querySelector('.info-val');
            if (el) el.textContent = textVal;
        }
    }

    _renderStatRow(key, iconKey, desc, val) {
        const row = document.createElement('div');
        row.setAttribute('data-key', key);
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.fontSize = '11px';
        
        const labelSide = document.createElement('div');
        labelSide.style.display = 'flex';
        labelSide.style.alignItems = 'center';
        labelSide.style.gap = '6px';

        const iconCell = document.createElement('div');
        iconCell.style.width = '14px';
        iconCell.style.height = '14px';
        iconCell.style.display = 'flex';
        iconCell.style.alignItems = 'center';
        iconCell.style.justifyContent = 'center';
        
        // Extract fallback emoji and string for safe SVG loading
        iconCell.innerHTML = IconHelper.getIcon(iconKey, { size: 12 });

        const labelTxt = document.createElement('span');
        labelTxt.textContent = desc;

        labelSide.appendChild(iconCell);
        labelSide.appendChild(labelTxt);

        const valueCell = document.createElement('div');
        valueCell.className = 'info-val';
        valueCell.style.fontWeight = '600';
        valueCell.textContent = val;

        row.appendChild(labelSide);
        row.appendChild(valueCell);
        return row;
    }

    _updateInfo() {
        if (!this.infoList) return;
        this.infoList.innerHTML = '';

        const storageMode = this._getFilesystemMode();
        const activeTheme = themeManager?.currentTheme || 'mint-dark';
        const activeIcons = themeManager?.currentIconTheme || 'bloom-dark';
        const screenGeometry = `${window.screen.width} × ${window.screen.height}`;

        this.infoList.appendChild(this._renderStatRow('fs', 'drive-harddisk,💾', 'Filesystem', storageMode));
        this.infoList.appendChild(this._renderStatRow('theme', 'preferences-system,🎨', 'Theme', activeTheme));
        this.infoList.appendChild(this._renderStatRow('icons', 'image,🖼️', 'Icons', activeIcons));
        this.infoList.appendChild(this._renderStatRow('display', 'computer,💻', 'Display', screenGeometry));
        
        const sysMem = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Browser Allocated';
        this.infoList.appendChild(this._renderStatRow('memory', 'media-memory,🧠', 'Memory', sysMem));

        this.infoList.appendChild(this._renderStatRow('uptime', 'appointment-soon,⏱️', 'OS Uptime', '0h 0m 0s'));
        
        this._updateUptime();
        this._applyCustomStyles(); // Force new elements to adopt customized colors
    }

    on_desklet_removed() {
        if (this._timer) clearInterval(this._timer);
        window.removeEventListener('theme-changed', this._themeListener);
        window.removeEventListener('icon-theme-changed', this._themeListener);
        if (this._calendarListener) {
            window.removeEventListener('settings-changed', this._calendarListener);
        }
    }
}

function main(metadata, desklet_id) {
    return new SysInfoDesklet(metadata, desklet_id);
}
