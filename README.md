# 🏔️ EverestOS

**A premium, modular web-based desktop environment — born in Nepal, the land of Mount Everest.**

<p align="center">
  <img src="screenshot.png" alt="EverestOS Desktop" width="100%" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
</p>

EverestOS brings the power and familiarity of a traditional Linux desktop to the browser. Inspired by the **Cinnamon Desktop Environment** from Linux Mint, it features a complete windowing system, a virtual filesystem, a powerful extension architecture, and a suite of built-in applications — all rendered entirely with modern web technologies.

---

## ✨ Highlights

- **Full Desktop Experience** — Window management, taskbar, app menu, desktop icons, right-click context menus, and keyboard shortcuts (Ctrl+C/V/X, Delete, Alt+F2).
- **Virtual File System (VFS)** — A dual-mode storage layer: IndexedDB for standalone deployments, and a native Node.js backend for development with real file persistence.
- **Cinnamon-Compatible Extensions** — Write **Applets** (panel widgets) and **Desklets** (desktop widgets) using a custom-ported CommonJS loader and mock `St` (Shell Toolkit) / `gi` libraries.
- **18 Built-in Applications** — File Manager, Terminal, Web Browser, Text Editor, Calculator, System Settings, App Center, Extension Manager, and more.
- **Adaptive Theming** — Full light/dark mode support with the high-fidelity **Bloom** icon theme (600+ SVG icons), CSS variable-driven color systems, and multiple bundled themes.
- **Developer Tooling** — Built-in Developer Center for creating apps, Looking Glass debug console (Alt+F2), and live code editor.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Vanilla JavaScript (ES Modules) |
| **Build Tool** | [Vite](https://vitejs.dev/) 6.x |
| **Styling** | CSS3 — Variables, Grid, Flexbox, Glassmorphism |
| **Fonts** | Inter, JetBrains Mono (Google Fonts) |
| **Storage** | IndexedDB (client) / Node.js FS API (dev server) |
| **Runtime** | [Bun](https://bun.sh/) (recommended) or Node.js |
| **Icons** | Bloom SVG icon theme (deepin-inspired) |

---

## 📥 Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** (recommended) or **Node.js** 18+.

### Installation

```bash
# Clone the repository
git clone https://github.com/Everest-Os/EverestOS.git
cd EverestOS

# Install dependencies
bun install      # or: npm install

# Start the development server
bun run dev      # or: npm run dev
```

The development server starts at **http://localhost:5173** with full VFS backend support (reads/writes to the `fs/` directory on disk).

### Production Build

```bash
# Build optimized static assets
bun run build

# Serve the static build (uses vfs-seed.json for offline VFS)
bun run serve:static
```

The production build generates a `vfs-seed.json` from `fs/` at build time and copies the filesystem into `dist/fs/` for complete offline operation.

---

## 📂 Project Structure

```
EverestOS/
├── index.html              # Shell HTML — desktop layout, panel, overlays
├── vite.config.js          # Vite config + LocalFSMiddleware plugin
├── package.json            # Project metadata and scripts
│
├── src/                    # Application source code
│   ├── main.js             # EverestSandbox — boot sequence orchestrator
│   ├── apps/               # 18 built-in applications
│   │   ├── app-center/     #   App marketplace (install/uninstall)
│   │   ├── calculator/     #   Scientific calculator
│   │   ├── desktop-settings/ # Desktop icon & wallpaper config
│   │   ├── developer-center/ # App creation IDE
│   │   ├── extension-manager/ # Applet/Desklet manager
│   │   ├── files/          #   File manager (Nemo-inspired)
│   │   ├── image-viewer/   #   Image viewer with zoom/rotate
│   │   ├── media-viewer/   #   Generic media viewer
│   │   ├── music-player/   #   Audio player
│   │   ├── office/         #   Basic office suite
│   │   ├── pdf-viewer/     #   PDF reader
│   │   ├── system-inspector/ # System information
│   │   ├── system-settings/ # Appearance, display, about
│   │   ├── terminal/       #   Shell emulator with commands
│   │   ├── text-editor/    #   Code/text editor
│   │   ├── video-player/   #   Video playback
│   │   ├── web-browser/    #   Embedded web browser (iframe)
│   │   └── zip-manager/    #   Archive handler
│   │
│   ├── runtime/            # Core OS services
│   │   ├── vfs.js          #   VirtualFileSystem (IndexedDB + API)
│   │   ├── windowManager.js #  Window lifecycle (create/close/minimize)
│   │   ├── panelManager.js #   Taskbar, system tray, window list
│   │   ├── appMenu.js      #   Application launcher menu
│   │   ├── themeManager.js #   Theme switching & CSS variable engine
│   │   ├── iconHelper.js   #   Theme-aware icon resolution (Bloom)
│   │   ├── desktopIcons.js #   Desktop shortcut management
│   │   ├── desktopSettings.js # Wallpaper & desktop config
│   │   ├── contextMenu.js  #   Right-click context menus
│   │   ├── dialog.js       #   System alert/confirm dialogs
│   │   ├── filePickerApp.js #  File/folder picker dialog
│   │   ├── popupMenu.js    #   Popup menu component
│   │   ├── applet.js       #   Applet base class & lifecycle
│   │   ├── desklet.js      #   Desklet base class & lifecycle
│   │   ├── st.js           #   Mock Shell Toolkit (St) library
│   │   ├── imports.js      #   Mock gi/imports compatibility layer
│   │   ├── signals.js      #   Event signal system
│   │   ├── settings.js     #   Extension settings manager
│   │   └── appearanceLoader.js # Appearance config loader
│   │
│   ├── loader/             # Module loaders
│   │   ├── appLoader.js    #   App discovery & launch (glob-based)
│   │   └── extensionLoader.js # CJS extension loader (applets/desklets)
│   │
│   ├── console/            # Debug tools
│   │   └── lookingGlass.js #   Looking Glass console (Alt+F2)
│   │
│   ├── editor/             # Built-in editors
│   │   └── codeEditor.js   #   Inline code editor overlay
│   │
│   └── styles/             # Global stylesheets
│       ├── index.css       #   CSS reset & variables
│       ├── desktop.css     #   Desktop, panel, window styles
│       └── widgets.css     #   Buttons, inputs, cards
│
├── public/                 # Static assets (copied to dist/)
│   ├── icons/              # Icon themes
│   │   ├── bloom/          #   Bloom light icons (600+ SVGs)
│   │   ├── bloom-dark/     #   Bloom dark variant
│   │   ├── emoji/          #   Emoji fallback set
│   │   ├── modern/         #   Modern icon set
│   │   └── everest-logo.svg #  EverestOS brand logo
│   ├── themes/             # Color theme definitions
│   │   ├── mint.json       #   Linux Mint light
│   │   ├── mint-dark.json  #   Linux Mint dark
│   │   ├── minimal.json    #   Minimal theme
│   │   └── win95.json      #   Retro Windows 95
│   └── vfs-seed.json       # Generated VFS snapshot for offline use
│
├── fs/                     # Virtual filesystem root (maps to / in VFS)
│   └── home/user/
│       ├── .config/        # User configuration files
│       ├── Apps/            # User-installed applications
│       ├── Desktop/         # Desktop shortcuts
│       ├── Documents/       # User documents
│       ├── images/          # Image files
│       ├── Music/           # Audio files
│       ├── Videos/          # Video files
│       ├── Plugins/         # Extension plugins
│       │   ├── applets/     #   Panel applets
│       │   ├── desklets/    #   Desktop desklets
│       │   └── extensions/  #   System extensions
│       └── samples/         # Sample files
│
└── scripts/                # Server utilities
    ├── serve.js            # Production static server
    └── extract-vfs.js      # VFS extraction utility
```

---

## 🧩 Extension System

EverestOS supports three types of extensions, modeled after the Cinnamon Desktop:

### Applets (Panel Widgets)
Panel applets live in `~/Plugins/applets/<uuid>/` and use the CommonJS `require()` pattern with mock `St` and `gi` libraries.

### Desklets (Desktop Widgets)
Desktop desklets live in `~/Plugins/desklets/<uuid>/` and can render floating, draggable widgets on the desktop surface.

### User Applications
Custom apps live in `~/Apps/<app-name>/` with an `app.json` manifest and `app.js` entry point. They receive a context object with access to all system APIs.

See the **[Developer Guide](DEVELOPER_GUIDE.md)** for complete documentation on building extensions and applications.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt + F2` | Toggle Looking Glass console |
| `Ctrl + A` | Select all (desktop/file manager) |
| `Ctrl + C` | Copy selected items |
| `Ctrl + X` | Cut selected items |
| `Ctrl + V` | Paste items |
| `Delete` | Move selected items to Trash |
| `Escape` | Close overlays and dialogs |

---

## 🎨 Themes

EverestOS ships with multiple themes that control both colors and icon styles:

| Theme | Description |
|---|---|
| **Mint Dark** | Default dark theme inspired by Linux Mint |
| **Mint Light** | Clean light variant |
| **Minimal** | Ultra-minimal interface |
| **Windows 95** | Retro nostalgia theme |

Themes are defined as JSON files in `public/themes/` and applied through the **System Settings > Appearance** panel. Each theme maps to a set of CSS variables and an icon pack (Bloom, Bloom Dark, Emoji, or Modern).

---

## 🤝 Acknowledgments & Attributions

### 🇳🇵 Origin
EverestOS was born in **Nepal** — the country of **Mount Everest**, the highest peak on Earth. The project name and branding pay tribute to this heritage.

### Cinnamon Desktop Environment
A massive thank you to the **Linux Mint team** and the developers of the **Cinnamon Desktop Environment**. The following components draw heavy inspiration from Cinnamon:
- Panel and applet architecture
- Desklet system and lifecycle
- Extension settings schema format
- Looking Glass debug console
- Context menu patterns
- Shell Toolkit (St) API surface

### Individual Plugin Creators
The following community plugins are included and attributed to their original authors:

| Plugin | Type | Author | UUID |
|---|---|---|---|
| **Seven Segment Clock** | Desklet | lxs242 | `SevenSegmentClock@lxs242` |
| **Nepali Date** | Applet | Bishal Acharya | `nepali-date@bishalacharya` |
| **Nepali Date** | Desklet | Khumnath | `nepali-date@khumnath` |
| **Panchang** | Desklet | OnlineLearningTutorials | `panchang@india` |
| **Main Menu** | Applet | EverestOS | `menu@playground` |
| **Status Bar** | Applet | EverestOS | `statusbar` |
| **System Monitor** | Desklet | EverestOS | `system` |

### AI Assistance
- **Google Gemini** — Extensive assistance in code generation, architectural planning, debugging, and documentation throughout the development of this project.

### Iconography
- System icons are based on the **Bloom** icon theme from the **deepin** desktop project and various open-source SVG sets.

---

## 📜 License

EverestOS is open-source software licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)**.

```
Copyright (C) 2026 EverestOS Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

---

<p align="center">
  Built with ❤️ in Nepal for the Open Web
</p>
