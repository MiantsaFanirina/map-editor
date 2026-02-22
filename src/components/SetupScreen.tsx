import { useState } from 'react'
import type { MapConfig } from '../types'
import { DEFAULT_TILE_SIZE } from '../constants/tiles'

interface SetupScreenProps {
  onStart: (config: MapConfig) => void
  onBack?: () => void
}

export function SetupScreen({ onStart, onBack }: SetupScreenProps) {
  const [rows, setRows] = useState(20)
  const [cols, setCols] = useState(30)
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStart({ rows, cols, tileSize })
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-md w-full">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2 flex items-center gap-3">
          🗺️ Map Editor
        </h1>
        <p className="text-gray-400 mb-8">Create your 2D tile-based map</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              ↕ Rows
            </label>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              ↔ Columns
            </label>
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              ◻ Tile Size (px)
            </label>
            <input
              type="number"
              value={tileSize}
              onChange={(e) => setTileSize(Math.max(8, Math.min(128, parseInt(e.target.value) || DEFAULT_TILE_SIZE)))}
              min={8}
              max={128}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg space-y-1">
            <p className="text-sm text-gray-400">
              Total: <span className="text-white font-semibold">{rows * cols}</span> tiles
            </p>
            <p className="text-sm text-gray-400">
              Size: <span className="text-white font-semibold">{cols * tileSize} × {rows * tileSize}</span> px
            </p>
          </div>
          
          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            ✨ Create Map
          </button>
          
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 mt-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ← Back to Editor
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
