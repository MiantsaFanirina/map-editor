import { useState, useEffect } from 'react'
import type { MapConfig } from '../types'
import { DEFAULT_TILE_SIZE } from '../constants/tiles'
import { getAllMaps, loadMap, deleteMap, importFromTxt, getCurrentSession, initDatabase, type SavedMap } from '../utils/database'

interface SetupScreenProps {
  onStart: (config: MapConfig, data?: number[][], tileTypes?: string) => void
  onBack?: () => void
}

type Tab = 'new' | 'saved' | 'import'

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-purple-900/50 p-8 text-center">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            Map Editor
          </h1>
          <p className="text-gray-400 mt-2">Create, edit, and manage your tile-based maps</p>
          {currentSession && (
            <button
              onClick={() => onStart(currentSession.config, currentSession.data, currentSession.tileTypes)}
              className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              ▶ Resume Editing
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'new', label: 'New Map', icon: '' },
            { id: 'saved', label: 'Saved', icon: '' },
            { id: 'import', label: 'Import', icon: '' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* New Map Tab */}
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ↕ Rows
                  </label>
                  <input
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ↔ Columns
                  </label>
                  <input
                    type="number"
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                     Size (px)
                  </label>
                  <input
                    type="number"
                    value={tileSize}
                    onChange={(e) => setTileSize(Math.max(8, Math.min(128, parseInt(e.target.value) || DEFAULT_TILE_SIZE)))}
                    min={8}
                    max={128}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-gray-700/50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Total tiles</p>
                  <p className="text-lg font-bold text-white">{rows * cols}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Map size</p>
                  <p className="text-lg font-bold text-white">{cols * tileSize} × {rows * tileSize}</p>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
              >
                Create New Map
              </button>
              
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  ← Back to Editor
                </button>
              )}
            </form>
          )}

          {/* Saved Maps Tab */}
          {activeTab === 'saved' && (
            <div>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : savedMaps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-gray-400">No saved maps yet</p>
                  <p className="text-sm text-gray-500 mt-1">Save a map from the editor to see it here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {savedMaps.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors group"
                    >
                      <button
                        onClick={() => handleLoadMap(m)}
                        className="flex-1 text-left"
                      >
                        <p className="font-medium text-white group-hover:text-emerald-400 transition-colors">{m.name}</p>
                        <p className="text-sm text-gray-400">
                          {m.cols}×{m.rows} • {m.tileSize}px • {new Date(m.updatedAt).toLocaleDateString()}
                        </p>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this map?')) {
                            deleteMap(m.id)
                            setSavedMaps(getAllMaps())
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload TXT file
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800 text-gray-500">or paste</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paste map data
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => { setImportText(e.target.value); setImportError('') }}
                  placeholder="0 0 0 0&#10;0 1 1 0&#10;0 1 1 0&#10;0 0 0 0"
                  className="w-full h-40 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              {importError && (
                <p className="text-red-400 text-sm">{importError}</p>
              )}
              
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Import Map
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
