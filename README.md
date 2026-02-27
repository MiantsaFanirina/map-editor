# TileMap Editor

<p align="center">
  <img src="public/logo.svg" alt="TileMap Editor Logo" width="120" />
</p>

<p align="center">
  A powerful, modern tile map editor for creating 2D game maps. Build beautiful tile-based worlds with an intuitive interface and comprehensive toolset.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.1-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/platform-Windows-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Electron-28+-purple" alt="Electron" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Web Version](#web-version)
  - [Desktop Version](#desktop-version)
- [Usage Guide](#usage-guide)
  - [Creating a Map](#creating-a-map)
  - [Drawing Tools](#drawing-tools)
  - [Tile Management](#tile-management)
  - [Navigation](#navigation)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Project Structure](#project-structure)
- [Building from Source](#building-from-source)
- [Import/Export Format](#importexport-format)
- [Author](#author)
- [License](#license)

---

## Overview

TileMap Editor is a professional-grade 2D map creation tool designed for game developers, hobbyists, and digital artists. Whether you're creating levels for a platformer, designing a dungeon for an RPG, or building a world for your indie game, TileMap Editor provides all the essential tools you need.

The editor supports maps of any size (up to 10,000 x 10,000 tiles), multiple drawing tools, custom tile types with colors and images, and seamless save/load functionality using local browser storage.

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Custom Map Sizes** | Create maps from 1x1 to 10,000x10,000 tiles |
| **Variable Tile Sizes** | Support for tiles from 8px to 512px |
| **Multiple Drawing Tools** | Brush, Rectangle, Circle, Triangle, Line, Flood Fill |
| **Custom Tile Types** | Unlimited tile types with custom colors and images |
| **Pan & Zoom** | Smooth camera navigation with mouse wheel zoom |
| **Undo/Redo** | Full history support with unlimited undo steps |
| **Save/Load** | Persistent storage using IndexedDB |
| **Import/Export** | Load and save maps as TXT files |
| **Preview Mode** | Full map preview with zoom and pan |
| **Tutorial System** | Built-in help panel for new users |

### Drawing Tools

- **Brush Tool** - Paint individual tiles by clicking or dragging
- **Rectangle Tool** - Draw rectangular regions (Shift + Click)
- **Circle Tool** - Create circular patterns
- **Triangle Tool** - Define triangles point by point
- **Line Tool** - Draw straight lines between two points
- **Flood Fill** - Fill connected regions of the same tile

### Navigation Controls

- **Space + Drag** - Pan the camera
- **Mouse Wheel** - Zoom in/out (0.1x to 5x)
- **Middle Mouse Button** - Alternative pan option

---

## Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **React Icons** - Icon set
- **PixiJS** - Canvas rendering (optional)

### Desktop
- **Electron 28** - Desktop framework
- **electron-builder** - Packaging

### Build Tools
- **Vite** - Build tool
- **ESLint** - Linting

---

## Getting Started

### Web Version

The fastest way to use TileMap Editor is through the web version:

1. Open your browser
2. Navigate to the hosted web application
3. Start creating maps immediately

### Desktop Version

For the best experience, download the desktop application:

#### Installer (Recommended)
Download `TileMap.Editor.Setup.1.0.1.exe` from the [Releases](https://github.com/MiantsaFanirina/map-editor/releases) page.

#### Portable Version
Download `TileMap-Editor-1.0.1-portable.zip`, extract, and run `TileMap Editor.exe`.

---

## Usage Guide

### Creating a Map

1. **Launch the application** - You'll see the setup screen
2. **Choose an option:**
   - **New Map** - Create a fresh map
   - **Saved Maps** - Continue editing a previous map
   - **Import** - Load a map from a TXT file
3. **Configure your map:**
   - Set **Rows** (vertical tiles)
   - Set **Columns** (horizontal tiles)
   - Set **Tile Size** (pixel size of each tile)
4. **Click "Create New Map"** to start editing

### Drawing Tools

| Tool | Shortcut | Usage |
|------|----------|-------|
| Brush | Default | Click/drag to paint tiles |
| Rectangle | R | Shift + Click + Drag |
| Circle | C | Shift + Click + Drag |
| Polygon | T | Click 3 points, then Shift |
| Line | L | Click start and end points |
| Fill | F | Click to flood fill area |

### Tile Management

1. **Select a tile** - Click on a tile type in the sidebar
2. **Add new tile** - Click the "+" button in the sidebar
3. **Edit tile** - Right-click a tile to change color/label
4. **Delete tile** - Click the trash icon on a tile

### Navigation

- **Zoom**: Mouse wheel (scroll up to zoom in, down to zoom out)
- **Pan**: Hold Space + drag, or use middle mouse button
- **Reset view**: Use the toolbar buttons

---

## Keyboard Shortcuts

### Tools
| Key | Action |
|-----|--------|
| R | Select Rectangle tool |
| C | Select Circle tool |
| T | Select Polygon tool |
| L | Select Line tool |
| F | Select Fill tool |

### History
| Key | Action |
|-----|--------|
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| Ctrl + Shift + Z | Redo |

### Tile Selection
| Key | Action |
|-----|--------|
| 0-9 | Quick select tile type by number |

### Other
| Key | Action |
|-----|--------|
| Space + Drag | Pan camera |
| Mouse Wheel | Zoom in/out |
| Shift + Click | Use shape tool |

---

## Project Structure

```
map-editor/
├── src/
│   ├── components/           # React components
│   │   ├── MapEditor.tsx    # Main editor component
│   │   ├── SetupScreen.tsx  # Map creation/load screen
│   │   ├── Toolbar.tsx      # Top toolbar
│   │   ├── TileSidebar.tsx  # Tile selection panel
│   │   ├── ShapeSelector.tsx # Tool selection
│   │   ├── PreviewModal.tsx  # Map preview
│   │   ├── SaveLoadModal.tsx # Save/load dialog
│   │   ├── ImportModal.tsx  # Import dialog
│   │   ├── TutorialPanel.tsx # Help panel
│   │   └── Toast.tsx        # Notification component
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useEditorState.ts  # Editor state management
│   │   ├── useTileTypes.ts    # Tile type management
│   │   ├── useHistory.ts      # Undo/redo history
│   │   └── useCanvasLoop.ts   # Canvas render loop
│   │
│   ├── utils/              # Utility functions
│   │   ├── coordinates.ts  # Coordinate transformations
│   │   ├── database.ts     # IndexedDB operations
│   │   ├── fileOperations.ts # Import/export
│   │   └── render.ts       # Canvas rendering
│   │
│   ├── constants/          # App constants
│   │   └── tiles.ts       # Default tile definitions
│   │
│   ├── types/             # TypeScript types
│   │   └── index.ts       # Type definitions
│   │
│   ├── App.tsx            # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── electron/              # Electron main process
│   └── main.js           # Electron entry point
│
├── public/               # Static assets
│   └── logo.svg          # App logo
│
├── dist/                  # Built web files
├── release/              # Built desktop app
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

---

## Building from Source

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MiantsaFanirina/map-editor.git

# Navigate to the project directory
cd map-editor

# Install dependencies
npm install
```

### Development Mode (Web)

```bash
npm run dev
```

This starts the Vite development server at `http://localhost:5173`.

### Build for Web

```bash
npm run build
```

Output will be in the `dist/` folder.

### Build Desktop App

```bash
npm run electron:build
```

The executable will be created in the `release/` folder.

---

## Import/Export Format

### TXT Format

The editor uses a simple text format for import/export:

simple map:

```txt
MAP
0 0 0 0 0
0 1 1 0 0
0 1 1 0 0
0 0 0 0 0
0 0 0 0 0

TILES
0:#FFFFFF:Empty
1:#FF0000:Grass
2:#00FF00:Water
```

With custom images (base64 encoded):

```txt
MAP
2 2 2
2 1 2
2 2 2

TILES
0:#000000:Empty
1:#6366f1:Grass:data:image/png;base64,iVBORw0KGgo...
2:#6366f1:Water:data:image/png;base64,iVBORw0KGgo...
```

### Format Specification

simple map: 
```
MAP
<row1_tile1> <row1_tile2> ... <row1_tileN>
<row2_tile1> <row2_tile2> ... <row2_tileN>
...

TILES
<id>:<color>:<label>
<id>:<color>:<label>
...
```

With custom images (base64 encoded):

```
<row1_tile1> <row1_tile2> ... <row1_tileN>
<row2_tile1> <row2_tile2> ... <row2_tileN>
...
<rowN_tile1> <rowN_tile2> ... <rowN_tileN>

TILES
<id>:<color>:<label>[:<base64_image>]
<id>:<color>:<label>[:<base64_image>]
...
```

```
- **MAP section**: Space-separated tile IDs (0 = empty)
- **TILES section**: `id:hex_color:label[:base64_image]` (image is optional)
```

---

## Author

**Miantsa Fanirina**

- GitHub: [@MiantsaFanirina](https://github.com/MiantsaFanirina)

---

## License

This project is licensed under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<p align="center">
  Made with ❤️ by <strong>Miantsa Fanirina</strong>
</p>
