import { useState, useEffect } from 'react'
import { initDatabase, getAllMaps, saveMap, loadMap, deleteMap, getCurrentSession, saveCurrentSession, type SavedMap } from '../utils/database'
import type { CustomTileType } from '../hooks/useTileTypes'

interface SaveLoadModalProps {
  mode: 'save' | 'load'
  mapData: number[][]
  config: { rows: number; cols: number; tileSize: number }
  tileTypes?: CustomTileType[]
  onLoad?: (map: SavedMap) => void
  onClose: () => void
}

export function SaveLoadModal({ mode, mapData, config, tileTypes, onLoad, onClose }: SaveLoadModalProps) {
  const [maps, setMaps] = useState<SavedMap[]>([])
  const [saveName, setSaveName] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentSavedId, setCurrentSavedId] = useState<number | undefined>()

  useEffect(() => {
    initDatabase().then(() => {
      const allMaps = getAllMaps()
      setMaps(allMaps)
      
      if (mode === 'save') {
        const session = getCurrentSession()
        if (session?.savedMapId) {
          const savedMap = allMaps.find(m => m.id === session.savedMapId)
          if (savedMap) {
            setSaveName(savedMap.name)
            setCurrentSavedId(session.savedMapId)
          }
        }
      }
      
      setLoading(false)
    })
  }, [mode])

  const handleSave = () => {
    if (!saveName.trim()) {
      setMessage('Please enter a name')
      return
    }
    const tileTypesJson = tileTypes ? JSON.stringify(tileTypes) : undefined
    const id = saveMap(saveName.trim(), config.rows, config.cols, config.tileSize, mapData, tileTypesJson)
    saveCurrentSession(config, mapData, tileTypesJson || '', id)
    setCurrentSavedId(id)
    setMessage('Saved!')
    setTimeout(() => {
      setMaps(getAllMaps())
      setMessage('')
    }, 1000)
  }

  const handleLoad = (savedMap: SavedMap) => {
    const loaded = loadMap(savedMap.id)
    if (loaded && onLoad) {
      onLoad(loaded)
      onClose()
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this map?')) {
      deleteMap(id)
      setMaps(getAllMaps())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-gray-600 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            {mode === 'save' ? '💾 Save Map' : '📂 Load Map'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {mode === 'save' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Map Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My awesome map"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="p-3 bg-gray-700 rounded-lg text-sm">
              {currentSavedId ? (
                <p className="text-blue-400">Updating existing save</p>
              ) : (
                <p className="text-gray-400">Saving as new map</p>
              )}
              <p className="text-gray-400">Size: {config.cols}×{config.rows} tiles</p>
              {tileTypes && <p className="text-gray-400">Tile types: {tileTypes.length}</p>}
            </div>
            {message && <p className="text-emerald-400 text-sm">{message}</p>}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold"
            >
              💾 Save
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : maps.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No saved maps</p>
            ) : (
              <div className="space-y-2">
                {maps.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1 cursor-pointer" onClick={() => handleLoad(m)}>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.cols}×{m.rows} • {m.tileSize}px</p>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
