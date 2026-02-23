import { useState, useEffect } from 'react'
import type { MapConfig } from '../types'
import { DEFAULT_TILE_SIZE } from '../constants/tiles'
import { getAllMaps, loadMap, deleteMap, importFromTxt, getCurrentSession, initDatabase, type SavedMap } from '../utils/database'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaFolderOpen, FaFileImport, FaPlay, FaTrash, FaArrowRight } from 'react-icons/fa'

interface SetupScreenProps {
  onStart: (config: MapConfig, data?: number[][], tileTypes?: string) => void
  onBack?: () => void
}

type Tab = 'new' | 'saved' | 'import'

const tabs = [
  { id: 'new' as Tab, label: 'New Map', icon: FaPlus },
  { id: 'saved' as Tab, label: 'Saved Maps', icon: FaFolderOpen },
  { id: 'import' as Tab, label: 'Import', icon: FaFileImport },
]

export function SetupScreen({ onStart, onBack }: SetupScreenProps) {
  const [rows, setRows] = useState(20)
  const [cols, setCols] = useState(30)
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE)
  
  const [activeTab, setActiveTab] = useState<Tab>('new')
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([])
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState<{ config: MapConfig; data: number[][]; tileTypes: string } | null>(null)

  useEffect(() => {
    const session = getCurrentSession()
    if (session) {
      setCurrentSession({
        config: session.config,
        data: session.data,
        tileTypes: session.tileTypes,
      })
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'saved') {
      initDatabase().then(() => {
        setSavedMaps(getAllMaps())
        setLoading(false)
      })
    }
  }, [activeTab])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStart({ rows, cols, tileSize })
  }

  const handleLoadMap = (savedMap: SavedMap) => {
    const loaded = loadMap(savedMap.id)
    if (loaded) {
      onStart({ rows: loaded.rows, cols: loaded.cols, tileSize: loaded.tileSize }, loaded.data)
    }
  }

  const handleImport = () => {
    const result = importFromTxt(importText)
    if (result) {
      onStart({ rows: result.rows, cols: result.cols, tileSize: DEFAULT_TILE_SIZE }, result.data)
    } else {
      setImportError('Invalid format. Use space-separated values.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImportText(event.target?.result as string || '')
        setImportError('')
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="glass-card rounded-3xl overflow-hidden"  >
            
            <div className="relative p-8 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-cyan-500/20" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold gradient-text"
                >
                  Map Editor
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 mt-3 text-lg"
                >
                  Create, edit, and manage your tile-based maps
                </motion.p>
                
                <AnimatePresence>
                  {currentSession && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => onStart(currentSession.config, currentSession.data, currentSession.tileTypes)}
                      className="mt-6 px-8 py-3 glass-button text-white font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer"
                    >
                      <FaPlay />
                      Resume Editing
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex border-b border-white/10">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 font-medium transition-all relative flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === tab.id
                        ? 'tab-active text-indigo-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="text-sm" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            <div className="p-8 " style={{ minHeight: '500px', maxHeight: '500px' }}>
              <AnimatePresence mode="wait">
                {activeTab === 'new' && (
                  <motion.div
                    key="new"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: '↕ Rows', value: rows, setValue: setRows, min: 1, max: 100 },
                          { label: '↔ Columns', value: cols, setValue: setCols, min: 1, max: 100 },
                          { label: '⬡ Size (px)', value: tileSize, setValue: setTileSize, min: 8, max: 128 },
                        ].map((field, i) => (
                          <motion.div
                            key={field.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              {field.label}
                            </label>
                            <input
                              type="number"
                              value={field.value}
                              onChange={(e) => field.setValue(Math.max(field.min, Math.min(field.max, parseInt(e.target.value) || field.min)))}
                              min={field.min}
                              max={field.max}
                              className="w-full px-4 py-4 glass-input rounded-xl text-white text-center text-lg font-semibold"
                            />
                          </motion.div>
                        ))}
                      </div>
                      
                      <motion.div 
                        className="p-6 glass rounded-2xl flex justify-between items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="text-center">
                          <p className="text-sm text-gray-400 mb-1">Total tiles</p>
                          <p className="text-2xl font-bold text-white">{rows * cols}</p>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="text-center">
                          <p className="text-sm text-gray-400 mb-1">Canvas size</p>
                          <p className="text-2xl font-bold gradient-text">{cols * tileSize} × {rows * tileSize}</p>
                        </div>
                      </motion.div>
                      
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-pos-0 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 text-lg cursor-pointer"
                      >
                        Create New Map
                        <FaArrowRight className="text-sm" />
                      </motion.button>
                      
                      {onBack && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={onBack}
                          className="w-full py-4 glass text-white font-medium rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-white/10 cursor-pointer"
                        >
                          <FaArrowRight className="rotate-180" />
                          Back to Editor
                        </motion.button>
                      )}
                    </form>
                  </motion.div>
                )}

                {activeTab === 'saved' && (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {loading ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"
                        />
                        <p className="text-gray-400 mt-4">Loading maps...</p>
                      </div>
                    ) : savedMaps.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center"
                        >
                          <FaFolderOpen className="text-3xl text-gray-500" />
                        </motion.div>
                        <p className="text-gray-400 text-lg">No saved maps yet</p>
                        <p className="text-sm text-gray-500 mt-2">Save a map from the editor to see it here</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-auto scrollbar-thin">
                        {savedMaps.map((m, i) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/10 transition-all group"
                          >
                            <button
                              onClick={() => handleLoadMap(m)}
                              className="flex-1 text-left cursor-pointer"
                            >
                              <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-lg">{m.name}</p>
                              <p className="text-sm text-gray-400 mt-1">
                                {m.cols}×{m.rows} • {m.tileSize}px • {new Date(m.updatedAt).toLocaleDateString()}
                              </p>
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (confirm('Delete this map?')) {
                                  deleteMap(m.id)
                                  setSavedMaps(getAllMaps())
                                }
                              }}
                              className="p-3 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <FaTrash />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'import' && (
                  <motion.div
                    key="import"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Upload TXT file
                      </label>
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-4 file:px-6 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:transition-all file:cursor-pointer cursor-pointer"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-800 text-gray-500">or paste</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Paste map data
                      </label>
                      <textarea
                        value={importText}
                        onChange={(e) => { setImportText(e.target.value); setImportError('') }}
                        placeholder="0 0 0 0&#10;0 1 1 0&#10;0 1 1 0&#10;0 0 0 0"
                        className="w-full h-40 px-4 py-4 glass-input rounded-xl text-white font-mono text-sm"
                      />
                    </div>
                    
                    {importError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm"
                      >
                        {importError}
                    </motion.p>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImport}
                      disabled={!importText.trim()}
                      className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-pos-0 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 text-lg cursor-pointer"
                    >
                      <FaFileImport />
                      Import Map
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
