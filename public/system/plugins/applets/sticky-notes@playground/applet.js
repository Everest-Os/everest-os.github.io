const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Settings = imports.ui.settings;

const CONFIG_PATH = '~/.config/sticky-notes-data.json';

class StickyNotesApplet extends Applet.IconApplet {
  constructor(metadata, orientation, panel_height, instance_id) {
    super(metadata, orientation, panel_height, instance_id);
    this.metadata = metadata;
    this.instance_id = instance_id;

    this.set_applet_icon_name('format-text-direction-ltr,📝');
    this.set_applet_tooltip('Sticky Notes');

    // State
    this.state = {
      active: [],
      saved: []
    };

    // Initialize Settings
    try {
      this.settings = new Settings.AppletSettings(this, metadata.uuid, instance_id);
      this.settings.bind("default-color", "defaultColor");
      this.settings.bind("font-size", "defaultFontSize");
      this.settings.bind("auto-save-interval", "autoSaveInterval");
    } catch (e) {
      console.error("Sticky Notes: Settings binding failed", e);
    }

    // Build the popup menu
    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);

    // Load state and restore
    this._loadState().then(() => {
      this._restoreActiveNotes();
    });
  }

  on_applet_clicked(event) {
    this.menu.toggle();
  }

  async _loadState() {
    try {
      const vfs = window.osAPI.vfs;
      const str = await vfs.readFile(CONFIG_PATH);
      if (str) {
        const data = JSON.parse(str);
        if (data.active) this.state.active = data.active;
        if (data.saved) this.state.saved = data.saved;
      }
    } catch (e) {
      // file might not exist yet
    }
    this._buildMenu();
  }

  async _saveState() {
    try {
      const vfs = window.osAPI.vfs;
      await vfs.writeFile(CONFIG_PATH, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error("Failed to save sticky notes state", e);
    }
  }

  _buildMenu() {
    this.menu.removeAll();

    // Create New Note
    this.menu.addAction('📝 Create New Note', () => {
      this._spawnNote({
        id: 'note-' + Date.now(),
        text: '',
        color: this.defaultColor || '#ffeb3b',
        x: undefined,
        y: undefined,
        w: 250,
        h: 250
      }, true);
    });

    // Manage Saved Notes
    this.menu.addAction('⚙️ Manage Saved Notes', () => {
      this._openManageWindow();
    });

    // Separator
    const sep = new PopupMenu.PopupSeparatorMenuItem();
    this.menu.addMenuItem(sep);

    if (this.state.saved.length === 0) {
      const item = new PopupMenu.PopupMenuItem('No saved notes yet.');
      item._element.style.opacity = '0.5';
      this.menu.addMenuItem(item);
    } else {
      const item = new PopupMenu.PopupMenuItem(`${this.state.saved.length} Saved Notes`);
      item._element.style.opacity = '0.7';
      item._element.addEventListener('click', () => this._openManageWindow());
      this.menu.addMenuItem(item);
    }
  }

  _openManageWindow() {
    const container = document.createElement('div');
    container.className = 'manage-notes-container';

    const renderList = () => {
      container.innerHTML = `
        <div class="manage-notes-header">
          <span>Saved Sticky Notes</span>
          <span style="font-size: 0.8em; opacity: 0.7;">${this.state.saved.length} notes</span>
        </div>
        <div class="notes-list">
          ${this.state.saved.length === 0 ? '<div style="opacity: 0.5; text-align: center; margin-top: 40px;">No saved notes found.</div>' : ''}
          ${this.state.saved.map(note => `
            <div class="note-item" data-id="${note.id}">
              <div class="note-item-icon">📄</div>
              <div class="note-item-info">
                <div class="note-item-title">${note.title || 'Untitled Note'}</div>
                <div class="note-item-preview">${(note.text || '').substring(0, 50)}${note.text?.length > 50 ? '...' : ''}</div>
              </div>
              <div class="note-item-actions">
                <button class="note-btn note-btn-open" data-action="open" data-id="${note.id}">Open</button>
                <button class="note-btn note-btn-delete" data-action="delete" data-id="${note.id}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Add event listeners
      container.querySelectorAll('.note-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = btn.dataset.id;
          const action = btn.dataset.action;
          if (action === 'open') {
            const note = this.state.saved.find(n => n.id === id);
            if (note) {
              const isActive = this.state.active.find(n => n.id === id);
              if (isActive) window.osAPI.windowManager.focusWindow(id);
              else this._spawnNote({ ...note }, true);
            }
          } else if (action === 'delete') {
            if (confirm('Are you sure you want to delete this note?')) {
              this._deleteNote(id);
              renderList();
            }
          }
        });
      });
    };

    renderList();

    window.osAPI.windowManager.createWindow({
      id: 'sticky-notes-manager',
      title: 'Manage Sticky Notes',
      icon: 'format-text-direction-ltr,📝',
      content: container,
      width: 450,
      height: 500,
      customClass: 'sticky-notes-manager-window'
    });
  }

  _deleteNote(id) {
    // Remove from saved
    this.state.saved = this.state.saved.filter(n => n.id !== id);
    // Remove from active if present
    this.state.active = this.state.active.filter(n => n.id !== id);
    // Close window if open
    window.osAPI.windowManager.closeWindow(id);
    
    this._saveState();
    this._buildMenu();
  }

  _restoreActiveNotes() {
    for (const note of this.state.active) {
      this._spawnNote(note, false);
    }
  }

  _spawnNote(noteData, addToActive = false) {
    if (addToActive) {
      if (!this.state.active.find(n => n.id === noteData.id)) {
        this.state.active.push(noteData);
        this._saveState();
      }
    }

    // Textarea for content
    const textarea = document.createElement('textarea');
    textarea.classList.add('sticky-note-content');
    textarea.value = noteData.text || '';
    textarea.placeholder = 'Type your note here...';
    
    // Apply font size from settings
    textarea.style.fontSize = (this.defaultFontSize || 14) + 'px';

    // Auto-save on changes (debounced)
    let saveTimeout = null;
    const triggerAutoSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const activeNote = this.state.active.find(n => n.id === noteData.id);
        if (activeNote) {
          activeNote.text = textarea.value;
          const winFrame = document.getElementById(noteData.id);
          if (winFrame) {
            activeNote.x = parseInt(winFrame.style.left, 10);
            activeNote.y = parseInt(winFrame.style.top, 10);
            activeNote.w = parseInt(winFrame.style.width, 10);
            activeNote.h = parseInt(winFrame.style.height, 10);
            activeNote.color = winFrame.style.getPropertyValue('--note-color');
          }
          this._saveState();

          // Sync saved copy too
          const savedNote = this.state.saved.find(n => n.id === noteData.id);
          if (savedNote) {
            savedNote.text = textarea.value;
            savedNote.color = activeNote.color;
          }
        }
      }, this.autoSaveInterval || 500);
    };
    textarea.addEventListener('input', triggerAutoSave);

    // Color cycle button
    const btnColor = document.createElement('button');
    btnColor.classList.add('app-btn', 'btn-color');
    btnColor.title = 'Change Color';
    btnColor.innerHTML = IconHelper.getIcon('color-swatch', { size: 14 });
    const colors = ['#ffeb3b', '#f8bbd0', '#c8e6c9', '#bbdefb', '#e1bee7', '#ffccbc'];
    btnColor.addEventListener('click', (e) => {
      e.stopPropagation();
      const winFrame = document.getElementById(noteData.id);
      if (winFrame) {
        const currentColor = winFrame.style.getPropertyValue('--note-color') || this.defaultColor || '#ffeb3b';
        let nextIdx = colors.indexOf(currentColor) + 1;
        if (nextIdx >= colors.length) nextIdx = 0;
        const nextColor = colors[nextIdx];
        winFrame.style.setProperty('--note-color', nextColor);
        triggerAutoSave();
      }
    });

    // Save button for titlebar
    const btnSave = document.createElement('button');
    btnSave.classList.add('app-btn', 'btn-save');
    btnSave.title = 'Save to Library';
    btnSave.innerHTML = '💾';
    btnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = prompt('Enter a title for this saved note:', noteData.title || 'My Note');
      if (title !== null) {
        noteData.title = title;
        noteData.text = textarea.value;
        const existingIdx = this.state.saved.findIndex(n => n.id === noteData.id);
        if (existingIdx !== -1) {
          this.state.saved[existingIdx] = { ...noteData };
        } else {
          this.state.saved.push({ ...noteData });
        }
        this._saveState();
        this._buildMenu();
        window.osAPI.showSystemDialog({
          title: 'Saved',
          message: 'Note saved to library!',
          type: 'alert'
        });
      }
    });

    // Create borderless window
    const win = window.osAPI.windowManager.createWindow({
      id: noteData.id,
      title: noteData.title || 'Sticky Note',
      icon: 'format-text-direction-ltr,📝',
      content: textarea,
      width: noteData.w || 250,
      height: noteData.h || 250,
      x: noteData.x,
      y: noteData.y,
      customClass: 'sticky-note-window',
      customControls: [btnColor, btnSave],
      onClose: () => {
        this.state.active = this.state.active.filter(n => n.id !== noteData.id);
        this._saveState();
      }
    });

    // Track position/size changes
    if (win && win.frame) {
      // Apply color
      const noteColor = noteData.color || this.defaultColor || '#ffeb3b';
      win.frame.style.setProperty('--note-color', noteColor);

      const observer = new MutationObserver(() => triggerAutoSave());
      observer.observe(win.frame, { attributes: true, attributeFilter: ['style'] });
    }
  }

  on_applet_removed_from_panel() {
    this.menu.close();
  }
}

function main(metadata, orientation, panel_height, instance_id) {
  return new StickyNotesApplet(metadata, orientation, panel_height, instance_id);
}
