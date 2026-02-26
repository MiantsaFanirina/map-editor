import { useState, useEffect } from 'react'
import { initDatabase, getAllMaps, saveMap, loadMap, deleteMap, getCurrentSession, saveCurrentSession, type SavedMap } from '../utils/database'
import type { CustomTileType } from '../hooks/useTileTypes'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSave, FaFolderOpen, FaTrash, FaTimes } from 'react-icons/fa'
import { Toast } from './Toast'
import { tileTypesToExport } from '../hooks/useTileTypes'

interface SaveLoadModalProps {
  mode: 'save' | 'load'
  mapData: number[][]
  config: { rows: number; cols: number; tileSize: number }
  tileTypes?: CustomTileType[]
  onLoad?: (map: SavedMap) => void
  onClose: () => void
  onSaveComplete?: (message: string) => void
  onDeleteComplete?: (message: string) => void
  onLoadComplete?: (message: string) => void
}

export function SaveLoadModal({ mode, mapData, config, tileTypes, onLoad, onClose, onSaveComplete, onDeleteComplete, onLoadComplete }: SaveLoadModalProps) {
  const [maps, setMaps] = useState<SavedMap[]>([])
  const [saveName, setSaveName] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentSavedId, setCurrentSavedId] = useState<number | undefined>()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const loadMaps = async () => {
      await initDatabase()
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
    }
    loadMaps()
  }, [mode])

  const handleSave = () => {
    if (!saveName.trim()) {
      setToastMessage('Please enter a name')
      setShowToast(true)
      return
    }
    const tileTypesContent = tileTypes ? tileTypesToExport(tileTypes) : undefined
    const existingMap = maps.find(m => m.name.toLowerCase() === saveName.trim().toLowerCase())
    const id = saveMap(saveName.trim(), config.rows, config.cols, config.tileSize, mapData, tileTypesContent, existingMap?.id)
    saveCurrentSession(config, mapData, tileTypesContent || '', id)
    setCurrentSavedId(id)
    const message = existingMap ? 'Map updated!' : 'Map saved!'
    onClose()
    onSaveComplete?.(message)
  }

  const handleLoad = async (savedMap: SavedMap) => {
    await initDatabase()
    const loaded = loadMap(savedMap.id)
    if (loaded && onLoad) {
      onLoad(loaded)
      onClose()
      onLoadComplete?.('Map loaded!')
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this map?')) {
      deleteMap(id)
      setMaps(getAllMaps())
      onDeleteComplete?.('Map deleted!')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 modal-overlay flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            {mode === 'save' ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <FaSave className="text-white" />
                </div>
                Save Map
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                  <FaFolderOpen className="text-white" />
                </div>
                Load Map
              </>
            )}
          </h2>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <FaTimes />
          </motion.button>
        </div>

        {mode === 'save' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Map Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => { setSaveName(e.target.value); setCurrentSavedId(undefined) }}
                placeholder="My awesome map"
                className="w-full px-4 py-3 glass-input rounded-xl text-white"
                autoFocus
              />
            </div>
            
            {currentSavedId && maps.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Or update existing:</p>
                <div className="max-h-32 overflow-auto scrollbar-thin space-y-1">
                  {maps.slice(0, 5).map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSaveName(m.name); setCurrentSavedId(m.id) }}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        currentSavedId === m.id 
                          ? 'bg-indigo-600 text-white' 
                          : 'glass hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 glass rounded-xl">
              {currentSavedId ? (
                <p className="text-indigo-300 text-sm">Updating: {maps.find(m => m.id === currentSavedId)?.name}</p>
              ) : saveName.trim() && maps.some(m => m.name.toLowerCase() === saveName.trim().toLowerCase()) ? (
                <p className="text-amber-400 text-sm">Will overwrite existing map</p>
              ) : (
                <p className="text-gray-400 text-sm">Creating new save</p>
              )}
              <p className="text-gray-400 text-sm mt-1">Size: {config.cols}×{config.rows} tiles</p>
              {tileTypes && <p className="text-gray-400 text-sm">Tile types: {tileTypes.length}</p>}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaSave /> {currentSavedId ? 'Update' : 'Save'}
            </motion.button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto scrollbar-thin">
            {loading ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"
                />
              </div>
            ) : maps.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl glass flex items-center justify-center">
                  <FaFolderOpen className="text-2xl text-gray-500" />
                </div>
                <p className="text-gray-400">No saved maps</p>
              </div>
            ) : (
              <div className="space-y-2">
                {maps.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/10 transition-all group"
                  >
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleLoad(m)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">{m.name}</p>
                      <p className="text-sm text-gray-400 mt-1">{m.cols}×{m.rows} • {m.tileSize}px • {new Date(m.updatedAt).toLocaleDateString()}</p>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(m.id)}
                      className="p-3 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <FaTrash />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {showToast && (
          <Toast 
            message={toastMessage} 
            type={toastMessage.includes('Please') ? 'error' : 'success'}
            duration={2500}
            onClose={() => setShowToast(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
