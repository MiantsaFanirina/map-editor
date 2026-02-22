import type { MapConfig } from '../types'

interface ToolbarProps {
  config: MapConfig
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onPreview: () => void
  onDownload: () => void
  onSave: () => void
  onLoad: () => void
  onImport: () => void
  onTutorial: () => void
  onNewMap: () => void
}

export function Toolbar({
  config,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onDownload,
  onSave,
  onLoad,
  onImport,
  onTutorial,
  onNewMap,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-emerald-400">Map Editor</h1>
        <span className="text-sm text-gray-400">
          {config.cols}×{config.rows} • {config.tileSize}px
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="w-10 h-10 flex items-center justify-center bg-gray-600 hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md text-lg"
        >
          ↩
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="w-10 h-10 flex items-center justify-center bg-gray-600 hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md text-lg"
        >
          ↪
        </button>
        
        <div className="w-px h-8 bg-gray-600 mx-1" />
        
        <button
          onClick={onSave}
          title="Save to Database"
          className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md text-lg"
        >
          💾
        </button>
        <button
          onClick={onLoad}
          title="Load from Database"
          className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md text-lg"
        >
          📂
        </button>
        <button
          onClick={onImport}
          title="Import from TXT"
          className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md text-lg"
        >
          📥
        </button>
        
        <div className="w-px h-8 bg-gray-600 mx-1" />
        
        <button
          onClick={onPreview}
          title="Preview"
          className="w-10 h-10 flex items-center justify-center bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-md text-lg"
        >
          👁
        </button>
        <button
          onClick={onDownload}
          title="Download"
          className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md text-lg"
        >
          ↓
        </button>
        <button
          onClick={onTutorial}
          title="Tutorial"
          className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-md text-lg"
        >
          ?
        </button>
        <button
          onClick={onNewMap}
          title="New Map"
          className="w-10 h-10 flex items-center justify-center bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors shadow-md text-lg"
        >
          +
        </button>
      </div>
    </div>
  )
}
