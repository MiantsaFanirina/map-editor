import type { MapConfig } from '../types'

interface ToolbarProps {
  config: MapConfig
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onPreview: () => void
  onDownload: () => void
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
  onTutorial,
  onNewMap,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-emerald-400">Map Editor</h1>
        <span className="text-sm text-gray-400">
          {config.cols}×{config.rows} • {config.tileSize}px tiles
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors shadow-md"
        >
          Undo (Ctrl+Z)
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors shadow-md"
        >
          Redo (Ctrl+Y)
        </button>
        <button
          onClick={onPreview}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors shadow-md"
        >
          Preview TXT
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors shadow-md"
        >
          Download TXT
        </button>
        <button
          onClick={onTutorial}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors shadow-md"
        >
          Tutorial
        </button>
        <button
          onClick={onNewMap}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors shadow-md"
        >
          New Map
        </button>
      </div>
    </div>
  )
}
