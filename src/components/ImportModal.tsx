import { useState } from 'react'
import { importFromTxt } from '../utils/database'
import { motion } from 'framer-motion'
import { FaFileImport, FaTimes } from 'react-icons/fa'

interface ImportModalProps {
  onImport: (data: { rows: number; cols: number; data: number[][]; tileTypes?: string }) => void
  onClose: () => void
  onImportComplete?: (message: string) => void
}

export function ImportModal({ onImport, onClose, onImportComplete }: ImportModalProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const handleImport = () => {
    const result = importFromTxt(content)
    if (result) {
      onImport(result)
      onClose()
      onImportComplete?.('Map imported!')
    } else {
      setError('Invalid format. Use space-separated values with newlines between rows.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setContent(event.target?.result as string || '')
        setError('')
      }
      reader.readAsText(file)
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
        className="glass-card rounded-2xl p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
              <FaFileImport className="text-white" />
            </div>
            Import TXT
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

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload file or paste content
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="w-full mb-3 text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 transition-all cursor-pointer"
            />
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setError('') }}
              placeholder="MAP&#10;0 0 0&#10;0 1 1&#10;&#10;TILES&#10;0:#4ade80:Grass&#10;1:#374151:Wall"
              className="w-full h-40 px-4 py-3 glass-input rounded-xl text-white font-mono text-sm"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaFileImport /> Import
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
