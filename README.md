# TileMap Editor

A modern, user-friendly tile map editor for creating 2D game maps. Built with React, TypeScript, and Tailwind CSS.

![TileMap Editor](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Intuitive Interface**: Clean, modern glass-morphism design
- **Multiple Tile Shapes**: Rectangle, circle, triangle, line, and fill tools
- **Custom Tile Types**: Create and manage unlimited tile types with custom colors and images
- **History**: Undo/Redo support for all edits
- **Camera Controls**: Pan and zoom to navigate your map
- **Save & Load**: Save maps locally or export to TXT format
- **Import**: Import maps from TXT files
- **Keyboard Shortcuts**: Quick access to all tools

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tilemap-editor.git

# Navigate to the project directory
cd tilemap-editor

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for web
npm run build
```

### Create Desktop App

```bash
# Install dependencies first
npm install

# Build desktop app (Windows)
npm run electron:build
```

The executable will be created in the `release` folder.

## Usage

### Creating a New Map

1. Click "New Map" on the setup screen
2. Set the number of rows, columns, and tile size
3. Click "Start" to begin editing

### Editing Tools

- **Left Click**: Place tiles
- **Right Click**: Erase tiles (place empty)
- **Shift + Click**: Use shape tools (rectangle, circle, triangle)
- **Space + Drag**: Pan the camera
- **Mouse Wheel**: Zoom in/out

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Rectangle tool |
| C | Circle tool |
| T | Triangle tool |
| L | Line tool |
| F | Fill tool |
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| 0-9 | Quick select tile type |

### Saving & Exporting

- **Save to Database**: Save your map locally in the browser
- **Download as TXT**: Export map as a text file
- **Import**: Load maps from TXT files

## Project Structure

```
src/
├── components/       # React UI components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── constants/       # App constants
├── types/           # TypeScript types
└── index.css        # Global styles
```

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: React Icons
- **Desktop**: Electron

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with Vite
- Design inspired by modern glass-morphism aesthetics
