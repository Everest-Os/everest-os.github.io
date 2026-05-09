# EverestOS Developer Guide

This guide covers everything you need to build applications, applets, and desklets for EverestOS.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment](#development-environment)
3. [Building Applications](#building-applications)
4. [Building Applets (Panel Widgets)](#building-applets)
5. [Building Desklets (Desktop Widgets)](#building-desklets)
6. [Virtual File System (VFS) API](#virtual-file-system-api)
7. [Window Manager API](#window-manager-api)
8. [Theme System](#theme-system)
9. [Icon Helper API](#icon-helper-api)
10. [System Dialogs](#system-dialogs)
11. [Extension Loader Internals](#extension-loader-internals)
12. [Configuration Files](#configuration-files)
13. [Build System & Deployment](#build-system--deployment)
14. [Contributing](#contributing)

---

## Architecture Overview

EverestOS follows a layered architecture:

```
┌──────────────────────────────────────────────┐
│                  Applications                │  src/apps/*
│   (Files, Terminal, Settings, Browser, ...)   │
├──────────────────────────────────────────────┤
│               Extension Layer                │  src/loader/*
│   (AppLoader, ExtensionLoader, CJS Runtime)  │
├──────────────────────────────────────────────┤
│                Runtime Services              │  src/runtime/*
│   (WindowManager, PanelManager, VFS,         │
│    ThemeManager, IconHelper, Dialogs)         │
├──────────────────────────────────────────────┤
│              Shell Bootstrap                 │  src/main.js
│   (EverestSandbox — init sequence)           │
├──────────────────────────────────────────────┤
│           Vite + LocalFSMiddleware           │  vite.config.js
│   (Dev server FS API, VFS seed generation)   │
└──────────────────────────────────────────────┘
```

### Boot Sequence

The `EverestSandbox` class in `src/main.js` orchestrates startup in this order:

1. **Looking Glass** console initialized (captures early logs)
2. **VFS** initialized and seeded from `vfs-seed.json`
3. **ThemeManager** loads saved theme and applies CSS variables
4. **PanelManager** builds the taskbar
5. **ExtensionLoader** discovers and loads applets/desklets
6. **CodeEditor** initialized
7. **WindowManager** initialized on the desktop surface
8. **FilePicker** dialog system initialized
9. **DesktopSettings** loaded (wallpaper, icon visibility)
10. **AppLoader** discovers built-in + VFS apps
11. **AppMenu** initialized with app discovery results
12. **DesktopIcons** rendered
13. **Startup apps** launched from `~/.config/startup.json`
14. **Display settings** restored (scaling, night light)
15. **Clock** started, keyboard shortcuts bound

---

## Development Environment

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Commands

```bash
# Start dev server with hot reload and live FS backend
bun run dev

# Build for production (generates vfs-seed.json + dist/)
bun run build

# Preview production build
bun run preview

# Serve static build with FS API
bun run serve:static
```

### Dev Server Features

The Vite dev server includes a custom `LocalFSMiddleware` plugin that provides:

- **REST API** for VFS operations (`/api/fs/read`, `/api/fs/write`, `/api/fs/readdir`, etc.)
- **Static file serving** from `fs/` directory at `/fs/*` paths
- **VFS seed generation** at build time for offline deployments
- **Automatic `fs/` → `dist/fs/` copy** after build

---

## Building Applications

Applications are the primary way to extend EverestOS. Each app is a self-contained module.

### App Structure

```
~/Apps/my-app/          # or src/apps/my-app/ for built-ins
├── app.json            # Manifest (required)
└── app.js              # Entry point (required)
```

### Manifest (`app.json`)

```json
{
  "id": "my-app",
  "name": "My Application",
  "description": "A sample application",
  "icon": "archive",
  "category": "Utilities",
  "version": "1.0.0"
}
```

| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Unique identifier (kebab-case) |
| `name` | ✅ | Display name |
| `description` | ❌ | Short description for App Menu |
| `icon` | ❌ | Bloom theme icon key or emoji fallback (e.g., `"folder"`, `"📦"`) |
| `category` | ❌ | Menu category: `Utilities`, `Development`, `System`, `Multimedia`, `Internet`, `Office` |
| `version` | ❌ | Semantic version string |

### Entry Point (`app.js`)

Your app must export an async `launch` function:

```javascript
/**
 * @param {Object} ctx - System context object
 * @param {Object} options - Launch options (e.g., { file: '/path/to/file' })
 */
export async function launch(ctx, options = {}) {
  const { windowManager, vfs, appLoader, panelManager } = ctx;

  // Create your UI
  const content = document.createElement('div');
  content.innerHTML = `<h1>Hello World!</h1>`;

  // Open a window
  const win = windowManager.createWindow({
    id: 'my-app-' + Date.now(),
    title: 'My Application',
    icon: 'archive',
    width: 600,
    height: 400,
    content
  });
}
```

### Context Object (`ctx`)

Every app receives a context object with these properties:

| Property | Type | Description |
|---|---|---|
| `windowManager` | WindowManager | Create/close/manage windows |
| `vfs` | VirtualFileSystem | Read/write virtual filesystem |
| `appLoader` | AppLoader | Launch other applications |
| `panelManager` | PanelManager | Access taskbar and system tray |
| `loader` | ExtensionLoader | Manage extensions |
| `filePicker` | FilePickerApp | Open file/folder picker dialogs |
| `console` | LookingGlass | Log to the Looking Glass console |
| `themeManager` | ThemeManager | Access current theme info |
| `desktopSettings` | DesktopSettings | Desktop configuration |
| `showSystemDialog` | Function | Show alert/confirm dialogs |
| `log` | Function | Shortcut for console logging |

### App Locations

| Path | Source | Deletable |
|---|---|---|
| `src/apps/*` | Built-in (compiled) | ❌ |
| `~/Apps/*` | System VFS apps | ❌ |
| `~/.local/share/applications/*` | User-installed | ✅ |

---

## Building Applets

Applets are panel widgets that use the Cinnamon-compatible CommonJS API.

### Applet Structure

```
~/Plugins/applets/my-applet@author/
├── metadata.json       # Extension metadata (required)
├── applet.js           # Entry point (required)
└── settings-schema.json # Optional settings definition
```

### Metadata (`metadata.json`)

```json
{
  "uuid": "my-applet@author",
  "name": "My Applet",
  "description": "A sample panel applet",
  "icon": "preferences-system",
  "version": "1.0",
  "author": "Your Name",
  "website": "https://example.com"
}
```

### Applet Code (`applet.js`)

```javascript
const Applet = require('ui/applet');
const St = require('gi/st');
const Main = require('ui/main');

class MyApplet extends Applet.TextIconApplet {
  _init(orientation, panelHeight, instanceId) {
    super._init(orientation, panelHeight, instanceId);
    this.set_applet_icon_name('preferences-system');
    this.set_applet_label('Hello');
    this.set_applet_tooltip('My custom applet');
  }

  on_applet_clicked() {
    Main.notify('Applet clicked!');
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  return new MyApplet(orientation, panelHeight, instanceId);
}
```

### Available St Widgets

The mock `St` library (`src/runtime/st.js`) provides:

- `St.Label` — Text labels
- `St.Icon` — Icon display
- `St.Button` — Clickable buttons
- `St.BoxLayout` — Horizontal/vertical containers
- `St.Bin` — Single-child container
- `St.Widget` — Base widget class
- `St.Entry` — Text input fields
- `St.DrawingArea` — Canvas-based drawing
- `St.ScrollView` — Scrollable container

### Available Imports

The CJS loader (`src/runtime/imports.js`) provides:

- `gi/st` — Shell Toolkit widgets
- `gi/clutter` — Actor/event simulation
- `gi/gio` — File/settings stubs
- `gi/glib` — Timer utilities (timeout_add, source_remove)
- `gi/soup` — HTTP request stubs
- `gi/pango` — Text layout constants
- `ui/main` — Panel access, notifications
- `ui/applet` — Applet base classes
- `ui/desklet` — Desklet base classes
- `ui/popupMenu` — Popup menu construction
- `ui/settings` — Extension settings API
- `ui/tooltips` — Tooltip support
- `ui/signalManager` — Signal connection management
- `misc/util` — Utility functions

---

## Building Desklets

Desklets are desktop widgets that float on the desktop surface.

### Desklet Structure

```
~/Plugins/desklets/my-desklet@author/
├── metadata.json
├── desklet.js
└── settings-schema.json  # Optional
```

### Desklet Code (`desklet.js`)

```javascript
const Desklet = require('ui/desklet');
const St = require('gi/st');

class MyDesklet extends Desklet.Desklet {
  _init(metadata, instanceId) {
    super._init(metadata, instanceId);
    this.setupUI();
  }

  setupUI() {
    const label = new St.Label({
      text: 'Hello Desktop!',
      style: 'font-size: 24px; color: white;'
    });
    this.setContent(label);
  }

  on_desklet_removed() {
    // Cleanup timers, intervals, etc.
  }
}

function main(metadata, instanceId) {
  return new MyDesklet(metadata, instanceId);
}
```

---

## Virtual File System API

The VFS (`src/runtime/vfs.js`) provides a unified filesystem interface.

### Methods

```javascript
const vfs = ctx.vfs;

// Read a directory
const items = await vfs.readdir('/home/user/Documents');
// Returns: [{ name, path, type: 'file'|'dir', size, ctime, mtime }]

// Read file contents
const content = await vfs.readFile('/home/user/Documents/notes.txt');

// Write a file
await vfs.writeFile('/home/user/Documents/notes.txt', 'Hello!');

// Get file/directory info
const stat = await vfs.stat('/home/user/Documents');
// Returns: { type: 'dir'|'file', size, ctime, mtime } or null

// Create a directory
await vfs.mkdir('/home/user/Documents/new-folder');

// Copy a file or directory
await vfs.copy('/home/user/file.txt', '/home/user/Desktop/file.txt');

// Rename / Move
await vfs.rename('/home/user/old.txt', '/home/user/new.txt');

// Delete
await vfs.rm('/home/user/Documents/temp.txt');

// Move to trash
await vfs.trash('/home/user/Documents/unwanted.txt');

// Get filesystem info
const info = await vfs.getInfo();
```

### Path Aliases

- `~` or `~/` resolves to `/home/user`
- Paths are always absolute within the VFS

### Storage Modes

| Mode | Backend | Persistence | Use Case |
|---|---|---|---|
| **API Mode** | Node.js `fs` via REST | Disk (`fs/` directory) | Development |
| **IndexedDB Mode** | Browser storage | Browser profile | Production/static |
| **Seed Mode** | `vfs-seed.json` | Read-only snapshot | Initial population |

---

## Window Manager API

```javascript
const wm = ctx.windowManager;

// Create a new window
const win = wm.createWindow({
  id: 'unique-window-id',    // Required, unique string
  title: 'Window Title',     // Title bar text
  icon: 'folder',            // Bloom icon key or emoji
  width: 600,                // Initial width in pixels
  height: 400,               // Initial height in pixels
  content: domElement,        // DOM element for window body
  resizable: true,           // Allow resize (default: true)
});

// Close a window
wm.closeWindow('unique-window-id');

// Focus a window
wm.focusWindow('unique-window-id');

// Minimize a window
wm.minimizeWindow('unique-window-id');
```

---

## Theme System

### Theme JSON Format

Themes are defined in `public/themes/<name>.json`:

```json
{
  "name": "Mint Dark",
  "type": "dark",
  "icon-theme": "bloom-dark",
  "colors": {
    "--bg-primary": "#1a1a2e",
    "--bg-surface": "#242438",
    "--text-primary": "#e8e8e8",
    "--text-accent": "#8be9fd",
    "--mint-green": "#6ecf8a",
    "--border": "rgba(255,255,255,0.08)"
  }
}
```

### CSS Variables

All components use CSS variables for theming. Key variables include:

| Variable | Description |
|---|---|
| `--bg-primary` | Desktop/shell background |
| `--bg-surface` | Window/card surface |
| `--bg-card` | Elevated card background |
| `--bg-surface-hover` | Hover state background |
| `--text-primary` | Main text color |
| `--text-secondary` | Subdued text |
| `--text-tertiary` | Hint/placeholder text |
| `--text-accent` | Accent/link color |
| `--mint-green` | Brand accent (Mint green) |
| `--border` | Border color |
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | Elevation shadows |

---

## Icon Helper API

The `IconHelper` (`src/runtime/iconHelper.js`) resolves icons from the current theme:

```javascript
import { IconHelper } from './runtime/iconHelper.js';

// Get an icon by theme key with emoji fallback
const iconHtml = IconHelper.getIcon('folder,📁', { size: 24 });

// Get icon by direct path (fixed, theme-independent)
const logoHtml = IconHelper.getIcon('/icons/everest-logo.svg', { size: 64 });
```

### Icon Key Format

Use comma-separated keys for fallback: `'theme-key,emoji-fallback'`

Examples: `'folder,📁'`, `'terminal,🖥️'`, `'settings,⚙️'`, `'trash,🗑️'`

---

## System Dialogs

```javascript
import { showSystemDialog } from './runtime/dialog.js';

// Alert dialog
showSystemDialog({
  title: 'Notice',
  message: 'Operation completed successfully.',
  type: 'alert'
});

// Confirm dialog
showSystemDialog({
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  type: 'confirm',
  confirmText: 'Yes, Proceed',
  cancelText: 'Cancel',
  onConfirm: () => { /* handle confirm */ },
  onCancel: () => { /* handle cancel */ }
});
```

---

## Extension Loader Internals

The `ExtensionLoader` (`src/loader/extensionLoader.js`) implements a custom CommonJS runtime:

1. **Discovery** — Scans `~/Plugins/applets/` and `~/Plugins/desklets/` for `metadata.json`
2. **CJS Loader** — Implements `require()` with module resolution for `gi/*`, `ui/*`, and `misc/*`
3. **Lifecycle** — Calls `main()` → `init()` → `enable()` on load; `disable()` on unload
4. **Settings** — Parses `settings-schema.json` and provides `AppletSettings`/`DeskletSettings` instances
5. **State Persistence** — Tracks loaded/removed extensions in `~/.config/extensions.json`

---

## Configuration Files

All user configuration is stored in `~/.config/`:

| File | Purpose |
|---|---|
| `theme.json` | Active theme name and icon theme |
| `appearance.json` | Panel opacity, blur, border radius overrides |
| `panel.json` | Panel position (top/bottom), auto-hide |
| `desktop.json` | Desktop icon visibility toggles |
| `display.json` | UI scaling, night light mode |
| `extensions.json` | Extension load/remove state |
| `startup.json` | App IDs to launch at boot |
| `menu.json` | App Menu favorites and configuration |
| `desklet-positions.json` | Saved desklet coordinates |
| `desktop-positions.json` | Saved desktop icon positions |

---

## Build System & Deployment

### Vite Configuration

The `vite.config.js` includes the `LocalFSMiddleware` plugin which:

1. **Dev Mode** — Provides full REST API for VFS operations against the `fs/` directory
2. **Build Time** — Generates `vfs-seed.json` (a snapshot of `fs/` for offline use)
3. **Post-Build** — Copies `fs/` to `dist/fs/` for static file references
4. **Preview Mode** — Same FS API as dev mode for testing builds

### Deployment Options

**Static Hosting** (GitHub Pages, Netlify, etc.):
- Run `bun run build`
- Deploy the `dist/` directory
- VFS operates in IndexedDB mode, seeded from `vfs-seed.json`

**Server Hosting** (with live FS):
- Run `bun run serve` or `bun run serve:static`
- VFS operates in API mode with real filesystem persistence

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the existing code style
4. Test with `bun run dev`
5. Build to verify: `bun run build`
6. Submit a pull request

### Code Style

- **ES Modules** for all source code
- **No frameworks** — vanilla JS, CSS, and DOM APIs
- **CSS Variables** for all colors and spacing
- **`IconHelper.getIcon()`** for all icon rendering
- **`showSystemDialog()`** for all user confirmations

---

## License

EverestOS is licensed under **GPL-3.0-or-later**. See [LICENSE](LICENSE) for details.

---

*Built with ❤️ in Nepal for the Open Web*
