export async function launch(ctx) {
  const { windowManager } = ctx;
  const root = document.documentElement;

  // Dynamically grab current design values from document root to populate inputs
  const getVar = (key) => getComputedStyle(root).getPropertyValue(key).trim();

  const rgbToHex = (rgbStr) => {
    if (!rgbStr) return '#7c5cff';
    const parts = rgbStr.split(',').map(x => parseInt(x.trim()));
    if (parts.length < 3 || parts.some(isNaN)) return '#7c5cff';
    return '#' + parts.map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--text-primary);
    overflow: hidden;
    font-family: var(--font-main);
    background: var(--bg-surface);
  `;

  wrap.innerHTML = `
    <!-- Scrollable Content Area -->
    <div style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 24px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom: 4px; flex-shrink:0;">
        <span style="font-size: 28px;">🎨</span>
        <div>
          <h2 style="font-size: 18px; font-weight: 700; margin:0;">Theme Studio</h2>
          <p style="font-size:11px; color:var(--text-secondary); margin:2px 0 0 0;">Live design & export tool for custom Everest themes</p>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:24px;" id="ts-sections">
        <!-- Sections injected dynamically here -->
      </div>
    </div>

    <!-- Fixed Bottom Sticky Footer -->
    <div style="padding: 16px 20px; border-top: 1px solid var(--border); flex-shrink:0; background: rgba(255, 255, 255, 0.01); backdrop-filter: blur(8px);">
      <button id="ts-export" class="btn-primary" style="width:100%; padding: 12px; display:flex; align-items:center; justify-content:center; gap:8px; font-weight:600; font-size:13px;">
        📥 Export Theme JSON
      </button>
    </div>
  `;

  const sectionsContainer = wrap.querySelector('#ts-sections');

  const createSection = (title, description) => {
    const sec = document.createElement('div');
    sec.style.cssText = 'display:flex; flex-direction:column; gap:12px;';
    sec.innerHTML = `
      <div style="border-bottom: 1px solid var(--border); padding-bottom: 6px;">
        <h3 style="font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px; margin:0;">${title}</h3>
        <div style="font-size:11px; color:var(--text-secondary); margin-top: 2px;">${description}</div>
      </div>
      <div class="sec-rows" style="display:flex; flex-direction:column; gap:8px;"></div>
    `;
    sectionsContainer.appendChild(sec);
    return sec.querySelector('.sec-rows');
  };

  // Clone ALL active base theme variables dynamically so we never drop custom configuration fields!
  const activeThemeId = (ctx.themeManager && ctx.themeManager.currentTheme) || '';
  const activeThemeObj = activeThemeId ? ctx.themeManager.themes.get(activeThemeId) : null;
  const trackedVars = activeThemeObj?.variables ? { ...activeThemeObj.variables } : {};

  // Parse alpha channel from standard rgba(r,g,b,a) strings
  const getRgbaAlpha = (rgbaStr, defaultAlpha = 0.85) => {
    if (!rgbaStr || !rgbaStr.includes('rgba')) return defaultAlpha;
    const match = rgbaStr.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d\.]+)\s*\)/);
    return match ? parseFloat(match[1]) : defaultAlpha;
  };

  let wmAlpha = getRgbaAlpha(trackedVars['--wm-bg'], 0.88);
  let wmBorderAlpha = getRgbaAlpha(trackedVars['--wm-border'], 0.2);
  let wmTitlebarAlpha = getRgbaAlpha(trackedVars['--wm-titlebar-bg'], 0.04);

  const addColorRow = (parent, key, label) => {
    const currentRgb = getVar(key) || '255, 255, 255';
    trackedVars[key] = currentRgb;

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding: 8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border); transition: background 0.2s;';
    row.innerHTML = `
      <span style="font-size:12px; font-weight:500; color:var(--text-secondary);">${label}</span>
      <input type="color" style="border:none; background:none; cursor:pointer; width:30px; height:30px; padding:0; border-radius:4px;" value="${rgbToHex(currentRgb)}">
    `;

    row.querySelector('input').oninput = (e) => {
      const rgb = hexToRgb(e.target.value);
      trackedVars[key] = rgb;
      root.style.setProperty(key, rgb);

      // Morph Window overlays dynamically preserving custom opacities!
      if (key === '--bg-surface-rgb') {
        const wmBgStr = `rgba(${rgb}, ${wmAlpha})`;
        root.style.setProperty('--wm-bg', wmBgStr);
        trackedVars['--wm-bg'] = wmBgStr;
      }
      if (key === '--accent-rgb') {
        const wmBorderStr = `rgba(${rgb}, ${wmBorderAlpha})`;
        root.style.setProperty('--wm-border', wmBorderStr);
        trackedVars['--wm-border'] = wmBorderStr;
      }
    };
    parent.appendChild(row);
  };

  const addRangeRow = (parent, key, label, min, max, step, suffix = '') => {
    let current = getVar(key);

    // Fallback logic if the CSS property hasn't been explicitly assigned in the current active stylesheet
    if (!current || current === 'initial') {
      if (suffix === 'px') current = '12px';
      else current = '0.9';
    }

    const cleanVal = parseFloat(current) || min;
    trackedVars[key] = cleanVal + suffix;

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.02); padding: 10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);';
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span style="font-weight:500; color:var(--text-secondary);">${label}</span>
        <span class="val-display" style="color:var(--accent); font-weight:700; font-family:var(--font-mono);">${cleanVal}${suffix}</span>
      </div>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${cleanVal}" style="width:100%; accent-color:var(--accent); cursor:pointer; background:var(--bg-input); border-radius:4px; height:6px;">
    `;

    const display = row.querySelector('.val-display');
    row.querySelector('input').oninput = (e) => {
      const val = e.target.value + suffix;
      trackedVars[key] = val;
      root.style.setProperty(key, val);
      display.textContent = val;

      // Real-time layout sync for physical shell bounds!
      if (key === '--panel-height') {
        const p = document.getElementById('everest-panel');
        if (p) p.style.height = val;
      }
      if (key === '--panel-margin-x' || key === '--panel-margin-y') {
        const p = document.getElementById('everest-panel');
        if (p) {
          const mx = parseFloat(root.style.getPropertyValue('--panel-margin-x')) || 0;
          const my = parseFloat(root.style.getPropertyValue('--panel-margin-y')) || 0;
          if (mx === 0 && my === 0) p.classList.remove('is-dock');
          else p.classList.add('is-dock');
        }
      }
    };
    parent.appendChild(row);
  };

  const addCustomRangeRow = (parent, label, currentVal, min, max, step, onInput, suffix = '') => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.02); padding: 10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);';
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span style="font-weight:500; color:var(--text-secondary);">${label}</span>
        <span class="val-display" style="color:var(--accent); font-weight:700; font-family:var(--font-mono);">${currentVal}${suffix}</span>
      </div>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${currentVal}" style="width:100%; accent-color:var(--accent); cursor:pointer; background:var(--bg-input); border-radius:4px; height:6px;">
    `;
    
    const display = row.querySelector('.val-display');
    row.querySelector('input').oninput = (e) => {
      onInput(e.target.value);
      display.textContent = e.target.value + suffix;
    };
    parent.appendChild(row);
  };

  const addSelectRow = (parent, key, label, options, fallback = 'initial') => {
    let current = getVar(key);
    if (!current || current === 'initial') current = fallback;
    trackedVars[key] = current;

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding: 8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border); transition: background 0.2s;';
    
    let opts = '';
    for (const [val, lbl] of Object.entries(options)) {
      opts += `<option value="${val}" ${current === val ? 'selected' : ''}>${lbl}</option>`;
    }

    row.innerHTML = `
      <span style="font-size:12px; font-weight:500; color:var(--text-secondary);">${label}</span>
      <select style="border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary); cursor:pointer; padding:6px 10px; border-radius:6px; outline:none; font-size:12px; min-width:140px;">
        ${opts}
      </select>
    `;

    row.querySelector('select').onchange = (e) => {
      const val = e.target.value;
      trackedVars[key] = val;
      root.style.setProperty(key, val);
    };
    parent.appendChild(row);
  };

  // Detect current system base settings
  const currentBaseMode = (ctx.themeManager && ctx.themeManager.preferredMode) || 'dark';
  const currentBasePanel = activeThemeObj?.panelMode || currentBaseMode;
  const currentBaseName = activeThemeObj?.name ? `${activeThemeObj.name} Custom` : 'My Everest Custom';

  // Helper for generating the Identity section
  const createIdentitySection = (parent) => {
    const sec = document.createElement('div');
    sec.style.cssText = 'display:flex; flex-direction:column; gap:12px;';
    sec.innerHTML = `
      <div style="border-bottom: 1px solid var(--border); padding-bottom: 6px;">
        <h3 style="font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px; margin:0;">Identity & Variants</h3>
        <div style="font-size:11px; color:var(--text-secondary); margin-top: 2px;">Theme name and window variant parameters</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.02); padding: 10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
          <span style="font-size:12px; font-weight:500; color:var(--text-secondary);">Theme Display Name</span>
          <input type="text" id="ts-meta-name" value="${currentBaseName}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary); font-size:13px; outline:none;">
        </div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1; display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.02); padding: 10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span style="font-size:12px; font-weight:500; color:var(--text-secondary);">System Mode</span>
            <select id="ts-meta-mode" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary); font-size:12px; outline:none; cursor:pointer;">
              <option value="dark" ${currentBaseMode === 'dark' ? 'selected' : ''}>Dark Mode</option>
              <option value="light" ${currentBaseMode === 'light' ? 'selected' : ''}>Light Mode</option>
            </select>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.02); padding: 10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
            <span style="font-size:12px; font-weight:500; color:var(--text-secondary);">Panel Mode</span>
            <select id="ts-meta-panel" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary); font-size:12px; outline:none; cursor:pointer;">
              <option value="dark" ${currentBasePanel === 'dark' ? 'selected' : ''}>Dark Panel</option>
              <option value="light" ${currentBasePanel === 'light' ? 'selected' : ''}>Light Panel</option>
            </select>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.02); padding: 10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
          <span style="font-size:12px; font-weight:500; color:var(--text-secondary);">Allow User Config Overrides</span>
          <select id="ts-meta-override" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary); font-size:12px; outline:none; cursor:pointer;">
            <option value="true" ${activeThemeObj?.allowConfigOverride !== false ? 'selected' : ''}>Yes (Allow user customization)</option>
            <option value="false" ${activeThemeObj?.allowConfigOverride === false ? 'selected' : ''}>No (Enforce theme specs strictly)</option>
          </select>
        </div>
      </div>
    `;
    parent.appendChild(sec);
    return {
      nameInput: sec.querySelector('#ts-meta-name'),
      modeSelect: sec.querySelector('#ts-meta-mode'),
      panelSelect: sec.querySelector('#ts-meta-panel'),
      overrideSelect: sec.querySelector('#ts-meta-override')
    };
  };

  // Build Sections
  const identityControls = createIdentitySection(sectionsContainer);
  const colors = createSection('Colors', 'Dynamic backdrop and surface definitions');
  addColorRow(colors, '--bg-desktop-rgb', 'Desktop Background');
  addColorRow(colors, '--bg-surface-rgb', 'Application Surface');
  addColorRow(colors, '--bg-panel-rgb', 'Panel Background');
  addColorRow(colors, '--bg-menu-rgb', 'Menu Overlay');
  addColorRow(colors, '--accent-rgb', 'Primary Accent');
  addColorRow(colors, '--text-primary-rgb', 'Base Typography');

  const filters = createSection('Translucency & Glass', 'Fine-tune backdrops and Gaussian blurs');
  addRangeRow(filters, '--panel-opacity', 'Taskbar Opacity', 0.1, 1.0, 0.05);
  addRangeRow(filters, '--menu-opacity', 'App Menu Opacity', 0.1, 1.0, 0.05);
  addRangeRow(filters, '--panel-blur', 'Panel Blur Radius', 0, 50, 1, 'px');
  addRangeRow(filters, '--menu-blur', 'Menu Blur Radius', 0, 50, 1, 'px');
  addRangeRow(filters, '--dock-blur', 'Window Backdrop Blur', 0, 60, 1, 'px');

  // Window Alpha Sliders
  addCustomRangeRow(filters, 'Window Glass Opacity', wmAlpha, 0.1, 1.0, 0.05, (val) => {
    wmAlpha = val;
    const surfaceRgb = trackedVars['--bg-surface-rgb'] || '59, 66, 82';
    const wmBgStr = `rgba(${surfaceRgb}, ${wmAlpha})`;
    root.style.setProperty('--wm-bg', wmBgStr);
    trackedVars['--wm-bg'] = wmBgStr;
  });

  addCustomRangeRow(filters, 'Window Border Opacity', wmBorderAlpha, 0.0, 1.0, 0.05, (val) => {
    wmBorderAlpha = val;
    const accentRgb = trackedVars['--accent-rgb'] || '136, 192, 208';
    const wmBorderStr = `rgba(${accentRgb}, ${wmBorderAlpha})`;
    root.style.setProperty('--wm-border', wmBorderStr);
    trackedVars['--wm-border'] = wmBorderStr;
  });

  addCustomRangeRow(filters, 'Titlebar Tint Opacity', wmTitlebarAlpha, 0.0, 0.5, 0.01, (val) => {
    wmTitlebarAlpha = val;
    const modeColor = currentBaseMode === 'light' ? '0, 0, 0' : '255, 255, 255';
    const titlebarBgStr = `rgba(${modeColor}, ${wmTitlebarAlpha})`;
    root.style.setProperty('--wm-titlebar-bg', titlebarBgStr);
    trackedVars['--wm-titlebar-bg'] = titlebarBgStr;
  });

  const layout = createSection('Layout & Dimension', 'Control layout proportions and visual scale');
  addRangeRow(layout, '--panel-height', 'Taskbar Height', 24, 72, 2, 'px');
  addRangeRow(layout, '--panel-margin-y', 'Taskbar Edge Elevation', 0, 50, 1, 'px');
  addRangeRow(layout, '--panel-margin-x', 'Taskbar Side Spacing', 0, 300, 5, 'px');
  addSelectRow(layout, '--panel-justify', 'Taskbar Alignment', { 'center': 'Centered', 'flex-start': 'Left Aligned' }, 'center');
  addRangeRow(layout, '--menu-width', 'App Menu Width', 300, 900, 10, 'px');
  addRangeRow(layout, '--menu-height', 'App Menu Height', 300, 800, 10, 'px');
  addSelectRow(layout, '--menu-categories-display', 'App Menu Filtering', { 'flex': 'Show Categories', 'none': 'Flat List (No Categories)' }, 'flex');
  addRangeRow(layout, '--panel-icon-size', 'Taskbar Icon Size', 12, 32, 1, 'px');
  addRangeRow(layout, '--wm-btn-size', 'Window Controls Size', 16, 32, 1, 'px');

  const geometry = createSection('Geometries', 'Scale curves and radius offsets');
  addRangeRow(geometry, '--radius-main', 'Interface Rounding', 0, 30, 1, 'px');
  addRangeRow(geometry, '--panel-radius', 'Taskbar Corner Radius', 0, 32, 1, 'px');
  addRangeRow(geometry, '--window-radius', 'Window Curvature', 0, 40, 1, 'px');
  addRangeRow(geometry, '--menu-radius', 'App Menu Radius', 0, 40, 1, 'px');

  // Helper function to wrap showSystemDialog prompt as an async Promise
  const showSystemPrompt = (title, placeholder, defaultValue = '') => {
    return new Promise((resolve) => {
      if (window.osAPI && window.osAPI.showSystemDialog) {
        window.osAPI.showSystemDialog({
          title,
          type: 'prompt',
          placeholder,
          value: defaultValue,
          onConfirm: (val) => resolve(val),
          onCancel: () => resolve(null)
        });
      } else {
        resolve(prompt(title, defaultValue));
      }
    });
  };

  const showSystemAlert = (title, message) => {
    if (window.osAPI && window.osAPI.showSystemDialog) {
      window.osAPI.showSystemDialog({ title, message, type: 'alert' });
    } else {
      alert(message);
    }
  };

  // Bind Action Handler for Export
  wrap.querySelector('#ts-export').onclick = async () => {
    const themeName = identityControls.nameInput.value.trim() || 'My Everest Custom';
    const themeMode = identityControls.modeSelect.value;
    const panelMode = identityControls.panelSelect.value;
    const allowOverride = identityControls.overrideSelect.value === 'true';

    const cleanId = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Map generated overrides back into a standard Everest schema format
    const exportObject = {
      id: cleanId,
      name: themeName,
      mode: themeMode,
      panelMode: panelMode,
      allowConfigOverride: allowOverride,
      variables: { ...trackedVars }
    };

    // Verify minimal fallbacks just in case activeTheme was completely empty
    if (!exportObject.variables['--border']) {
      exportObject.variables['--border'] = 'rgba(255, 255, 255, 0.08)';
    }

    // 🗂️ VFS Save Workflow using system filePicker
    const defaultDir = '/home/user/themes';
    
    // Create user themes directory on demand if missing
    try {
      await ctx.vfs.mkdir(defaultDir).catch(() => {});
    } catch (e) {}

    if (!ctx.filePicker) {
      showSystemAlert('Error', 'System dialog service is currently unavailable.');
      return;
    }

    // Open standard system folder picker
    const selectedDir = await ctx.filePicker.pickFolder({
      initialPath: defaultDir,
      title: 'Select Save Location'
    });

    if (!selectedDir) return; // User cancelled dialog

    const filename = `${cleanId}.json`;
    const savePath = `${selectedDir.endsWith('/') ? selectedDir : selectedDir + '/'}${filename}`;

    try {
      await ctx.vfs.writeFile(savePath, JSON.stringify(exportObject, null, 2));
      
      // Inject immediately into ThemeManager memory to skip desktop reload
      if (ctx.themeManager) {
        ctx.themeManager.themes.set(cleanId, exportObject);
        // Notify elements to sync status
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: exportObject } }));
      }
      
      showSystemAlert(
        'Success',
        `Theme successfully saved to VFS at:\n${savePath}\n\nYou can apply it immediately through your App Menu → System Settings.`
      );
    } catch (err) {
      console.error('Failed to save user theme to VFS:', err);
      showSystemAlert('Save Failed', `Error saving theme file: ${err.message}`);
    }
  };

  windowManager.createWindow({
    id: 'theme-studio',
    title: 'Theme Studio',
    width: 480,
    height: 500,
    content: wrap,
    icon: '🎨'
  });
}
