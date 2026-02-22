import { useState } from 'react'
import type { Camera } from '../types'
import type { CustomTileType } from '../hooks/useTileTypes'

interface TileSidebarProps {
  selectedTile: number
  onSelectTile: (tileId: number) => void
  camera: Camera
  tileTypes: CustomTileType[]
  onAddTile: (color: string, label: string) => void
  onUpdateTile: (id: number, color: string, label: string) => void
  onRemoveTile: (id: number) => void
}

export function TileSidebar({ 
  selectedTile, 
  onSelectTile, 
  camera,
  tileTypes,
  onAddTile,
  onUpdateTile,
  onRemoveTile,
}: TileSidebarProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newColor, setNewColor] = useState('#3b82f6')
  const [newLabel, setNewLabel] = useState('')

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAddTile(newColor, newLabel.trim())
      setNewLabel('')
      setIsAdding(false)
    }
  }

  const handleUpdate = (id: number) => {
    if (newLabel.trim()) {
      onUpdateTile(id, newColor, newLabel.trim())
      setEditingId(null)
      setNewLabel('')
    }
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200">Tile Types</h2>
        <p className="text-xs text-gray-400 mt-1">Click to select • Edit with button</p>
      </div>
      
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {tileTypes.map((tile) => (
          <div
            key={tile.id}
            onClick={() => onSelectTile(tile.id)}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer group ${
              selectedTile === tile.id
                ? 'bg-gray-700 ring-2 ring-emerald-400'
                : 'hover:bg-gray-700'
            }`}
          >
            <div
              className="w-10 h-10 rounded-lg border-2 border-gray-600 flex-shrink-0 pointer-events-none"
              style={{ backgroundColor: tile.color }}
            />
            <div className="flex-1 min-w-0">
              {editingId === tile.id ? (
                <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full h-6 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Name"
                    className="w-full px-2 py-1 bg-gray-600 rounded text-sm"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdate(tile.id)}
                      className="flex-1 py-1 bg-emerald-600 rounded text-xs"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 py-1 bg-gray-600 rounded text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm truncate">{tile.label}</p>
                  <p className="text-xs text-gray-400">Key: {tile.id}</p>
                </>
              )}
            </div>
            {editingId !== tile.id && (
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingId(tile.id); setNewColor(tile.color); setNewLabel(tile.label) }}
                  className="p-1 bg-gray-600 rounded hover:bg-gray-500"
                  title="Edit"
                >
                  ✏️
                </button>
                {tile.id !== 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveTile(tile.id) }}
                    className="p-1 bg-gray-600 rounded hover:bg-red-600"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isAdding ? (
          <div className="p-2 bg-gray-700 rounded-lg space-y-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Tile name"
              className="w-full px-2 py-1 bg-gray-600 rounded text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-1 bg-emerald-600 rounded text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-gray-600 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full p-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Add Tile
          </button>
        )}
      </div>
      
      <div className="p-3 bg-gray-700/50 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">Current:</p>
          <p className="text-xs text-gray-400">Zoom: {Math.round(camera.zoom * 100)}%</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-500"
            style={{ backgroundColor: tileTypes.find(t => t.id === selectedTile)?.color }}
          />
          <span className="font-medium text-sm">{tileTypes.find(t => t.id === selectedTile)?.label}</span>
          <span className="text-gray-400 text-sm">({selectedTile})</span>
        </div>
      </div>
    </div>
  )
}
