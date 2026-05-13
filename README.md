# 🏔️ EverestOS

**A premium, modular web-based desktop environment — born in Nepal, the land of Mount Everest.**

<p align="center">
  <img src="screenshot.png" alt="EverestOS Desktop" width="100%" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
</p>

EverestOS brings the power and familiarity of a traditional Linux desktop to the browser. Inspired by the **Cinnamon Desktop Environment** from Linux Mint, it features a complete windowing system, a virtual filesystem, a powerful extension architecture, and a suite of built-in applications — all rendered entirely with modern web technologies.

---

## ✨ Highlights

- **Full Desktop Experience** — Window management, taskbar, app menu, desktop icons, right-click context menus, and keyboard shortcuts (Ctrl+C/V/X, Delete, Ctrl+/).
- **Virtual File System (VFS)** — A dual-mode storage layer: IndexedDB for standalone deployments, and a native Node.js backend for development with real file persistence.
- **Cinnamon-Compatible Extensions** — Write **Applets** (panel widgets) and **Desklets** (desktop widgets) using a custom-ported CommonJS loader and mock `St` (Shell Toolkit) / `gi` libraries.
- **18 Built-in Applications** — File Manager, Terminal, Web Browser, Text Editor, Calculator, System Settings, App Center, Extension Manager, and more.
- **Adaptive Theming** — Full light/dark mode support with the high-fidelity **Bloom** icon theme **Copied from Deepin project** (600+ SVG icons), CSS variable-driven color systems, and multiple bundled themes.
- **Developer Tooling** — Built-in Developer Center for creating apps, Looking Glass debug console, and live code editor.

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
git clone https://github.com/Everest-Os/everest-os.github.io.git
cd everest-os.github.io

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
bun run serve:static or npx serve dist for 100% static mode.
```

The production build generates a `vfs-seed.json` from `fs/` at build time and copies the filesystem into `dist/fs/` for complete offline operation.

---

## 📂 Project Structure

```
EverestOS/
├── index.html              # Shell HTML — desktop layout, panel, overlays
├── vite.config.js          # Vite configuration
├── package.json            # Project metadata and scripts
│
├── src/                    # Core Shell Source Code
│   ├── main.js             # Boot orchestrator & Sandbox kernel
│   ├── loader/             # Module discovery & Sandboxing
│   │   ├── appLoader.js    #   App discovery (System + User)
│   │   └── extensionLoader.js # Cinnamon-compatible plugin loader
│   ├── runtime/            # OS Services & Mock APIs
│   │   ├── vfs.js          #   VirtualFileSystem engine
│   │   ├── windowManager.js #  Windowing system
│   │   ├── panelManager.js #   Taskbar & System Tray
│   │   ├── appMenu.js      #   Application menu logic
│   │   ├── themeManager.js #   CSS variable & theme engine
│   │   ├── iconHelper.js   #   Multi-layer icon resolution
│   │   ├── imports.js      #   CJS / Cinnamon API shims
│   │   └── zipHelper.js    #   Package extraction (JSZip)
│   ├── console/            # Looking Glass debug tool
│   ├── editor/             # Built-in code editor
│   └── styles/             # Global CSS & Design System
│
├── public/                 # Static Assets & System Binaries
│   ├── system/             # Read-only System files
│   │   ├── apps/           #   19 Built-in applications
│   │   ├── plugins/        #   Built-in applets & desklets
│   │   ├── lib/            #   Shared system libraries (JSZip, etc.)
│   │   ├── themes/         #   Color theme definitions (.json)
│   │   └── icons/          #   Themed icons (Bloom, Modern, Emoji)
│   ├── vfs-seed.json       # Generated user profile snapshot
│   └── system-manifest.json # Generated system directory index
│
├── fs/                     # VFS Root Template (packed at build time)
│   └── home/user/
│       ├── .config/        # User settings & app state
│       ├── .local/share/   # Standard storage for installed software
│       │   ├── applications/ # One-click installed apps
│       │   ├── plugins/    # One-click installed plugins
│       │   └── icons/      # Extracted app/plugin icons
│       ├── Apps/           # Legacy/Local development apps
│       ├── Plugins/        # Legacy/Local development plugins
│       └── Desktop/         # Desktop shortcuts
│
└── scripts/                # Build & Deployment Utilities
    ├── pack-vfs.js         # Generates vfs-seed.json from fs/
    ├── pack-system.js      # Generates system-manifest.json from public/system/
    └── serve.js            # Production static server
```
```

---

## 🧩 Extension System

EverestOS supports three types of extensions, modeled after the Cinnamon Desktop:

### Applets (Panel Widgets)
Panel applets live in `~/.local/share/plugins/applets/<uuid>/` (installed) or `~/Plugins/applets/<uuid>/` (dev) or `public/system/plugins/applets/<uuid>/` (built-in). They use the CommonJS `require()` pattern with mock `St` and `gi` libraries.

### Desklets (Desktop Widgets)
Desktop desklets live in `~/.local/share/plugins/desklets/<uuid>/` (installed) or `~/Plugins/desklets/<uuid>/` (dev) or `public/system/plugins/desklets/<uuid>/` (built-in) and can render floating, draggable widgets on the desktop surface.

### User Applications
Custom apps live in `~/.local/share/applications/<app-name>/` with an `app.json` manifest and `app.js` entry point.

See the **[Developer Guide](DEVELOPER_GUIDE.md)** for complete documentation and contribution instructions.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + /` | Toggle Looking Glass developer console |
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

### Open Source Libraries
- **[JSZip](https://stuk.github.io/jszip/)** — Used by the Zip Manager and Office App to process and extract `.zip` and `.odt` archives.

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
