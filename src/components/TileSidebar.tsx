import { TILE_TYPES } from '../constants/tiles'
import type { Camera } from '../types'

interface TileSidebarProps {
  selectedTile: number
  onSelectTile: (tileId: number) => void
  camera: Camera
}

export function TileSidebar({ selectedTile, onSelectTile, camera }: TileSidebarProps) {
  return (
    <div className="w-56 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-200">Tile Types</h2>
      
      <div className="flex flex-col gap-2">
        {Object.entries(TILE_TYPES).map(([id, { color, label }]) => (
          <button
            key={id}
            onClick={() => onSelectTile(Number(id))}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              selectedTile === Number(id)
                ? 'bg-gray-700 ring-2 ring-emerald-400'
                : 'hover:bg-gray-700'
            }`}
          >
            <div
              className="w-8 h-8 rounded border border-gray-600 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">{label}</span>
              <span className="text-xs text-gray-400">Key: {id}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-auto p-3 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-400 mb-2">Current Selection:</p>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-500"
            style={{ backgroundColor: TILE_TYPES[selectedTile]?.color }}
          />
          <span className="font-medium">{TILE_TYPES[selectedTile]?.label}</span>
          <span className="text-gray-400">({selectedTile})</span>
        </div>
      </div>
      
      <div className="p-3 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-400">Zoom:</p>
        <p className="font-medium">{Math.round(camera.zoom * 100)}%</p>
      </div>
    </div>
  )
}
