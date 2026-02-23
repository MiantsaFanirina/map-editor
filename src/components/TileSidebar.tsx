import { useState, useRef } from 'react'
import type { Camera } from '../types'
import type { CustomTileType } from '../hooks/useTileTypes'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPen, FaTrash, FaTimes, FaCheck, FaPlus } from 'react-icons/fa'

interface TileSidebarProps {
  selectedTile: number
  onSelectTile: (tileId: number) => void
  camera: Camera
  tileTypes: CustomTileType[]
  onAddTile: (color: string, label: string, image?: string) => void
  onUpdateTile: (id: number, color: string, label: string, image?: string) => void
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
  const [newColor, setNewColor] = useState('#6366f1')
  const [newLabel, setNewLabel] = useState('')
  const [newImage, setNewImage] = useState<string | undefined>()
  const addFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAddTile(newColor, newLabel.trim(), newImage)
      setNewLabel('')
      setNewColor('#6366f1')
      setNewImage(undefined)
      setIsAdding(false)
    }
  }

  const handleUpdate = (id: number) => {
    if (newLabel.trim()) {
      onUpdateTile(id, newColor, newLabel.trim(), newImage)
      setEditingId(null)
      setNewLabel('')
      setNewImage(undefined)
    }
  }

  const startEditing = (tile: CustomTileType) => {
    setEditingId(tile.id)
    setNewColor(tile.color)
    setNewLabel(tile.label)
    setNewImage(tile.image)
  }

  const TilePreview = ({ tile, size = 'w-10 h-10' }: { tile: CustomTileType; size?: string }) => (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      className={`${size} rounded-lg border-2 border-white/20 flex-shrink-0 overflow-hidden shadow-lg`}
    >
      {tile.image ? (
        <img src={tile.image} alt={tile.label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full" style={{ backgroundColor: tile.color }} />
      )}
    </motion.div>
  )

  return (
    <div className="w-72 glass border-r border-white/10 flex flex-col">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Tile Types</h2>
        <p className="text-xs text-gray-400 mt-1">Click to select • Edit with icons</p>
      </div>
      
      <div className="flex-1 overflow-auto p-3 space-y-2 scrollbar-thin">
        <AnimatePresence>
          {tileTypes.map((tile, index) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectTile(tile.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                selectedTile === tile.id
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 ring-2 ring-indigo-500'
                  : 'hover:bg-white/10'
              }`}
            >
              <TilePreview tile={tile} />
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {editingId === tile.id ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-full h-8 cursor-pointer rounded-lg"
                      />
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 py-2 glass-input rounded-lg text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => editFileInputRef.current?.click()}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {newImage ? 'Change' : 'Add Image'}
                        </button>
                        {newImage && (
                          <button
                            onClick={() => setNewImage(undefined)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <FaTimes className="text-xs text-red-400" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {newImage && (
                        <div className="w-full h-16 rounded-lg overflow-hidden bg-white/10">
                          <img src={newImage} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdate(tile.id)}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FaCheck className="text-xs" /> Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingId(null)}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs cursor-pointer"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="font-medium text-sm truncate text-white">{tile.label}</p>
                      <p className="text-xs text-gray-400">Key: {tile.id}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {editingId !== tile.id && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="opacity-0 group-hover:opacity-100 flex gap-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); startEditing(tile) }}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <FaPen className="w-3 h-3 text-white" />
                  </motion.button>
                  {tile.id !== 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); onRemoveTile(tile.id) }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-red-500/50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <FaTrash className="w-3 h-3 text-white" />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 glass rounded-xl space-y-3"
            >
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full h-10 cursor-pointer rounded-lg"
              />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Tile name"
                className="w-full px-3 py-2 glass-input rounded-lg text-sm"
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => addFileInputRef.current?.click()}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {newImage ? 'Change Image' : 'Add Image'}
                </button>
                {newImage && (
                  <button
                    onClick={() => setNewImage(undefined)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <FaTimes className="text-xs text-red-400" />
                  </button>
                )}
              </div>
              <input
                ref={addFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {newImage && (
                <div className="w-full h-16 rounded-lg overflow-hidden bg-white/10">
                  <img src={newImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FaPlus className="text-xs" /> Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsAdding(false); setNewImage(undefined) }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(true)}
              className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaPlus /> Add Tile
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 glass border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">Current Tile</p>
          <p className="text-xs text-gray-400">Zoom: {Math.round(camera.zoom * 100)}%</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg"
          >
            {tileTypes.find(t => t.id === selectedTile)?.image ? (
              <img 
                src={tileTypes.find(t => t.id === selectedTile)?.image} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div 
                className="w-full h-full" 
                style={{ backgroundColor: tileTypes.find(t => t.id === selectedTile)?.color }} 
              />
            )}
          </motion.div>
          <div>
            <span className="font-medium text-sm text-white block">{tileTypes.find(t => t.id === selectedTile)?.label}</span>
            <span className="text-gray-400 text-xs">ID: {selectedTile}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
