import type { MapConfig } from '../types'
import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

interface PreviewModalProps {
  mapData: number[][]
  config: MapConfig
  onClose: () => void
}

export function PreviewModal({ mapData, config, onClose }: PreviewModalProps) {
  const previewText = mapData.map(row => row.join(' ')).join('\n')

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
        className="glass-card rounded-2xl p-6 max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
              <span className="text-white text-lg">◉</span>
            </div>
            Map Preview
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
        <div className="relative">
          <pre className="bg-black/30 p-5 rounded-xl overflow-auto max-h-96 text-sm font-mono text-indigo-300 border border-white/10">
            {previewText}
          </pre>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-xl" />
        </div>
        <p className="mt-4 text-sm text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Dimensions: {config.cols} columns × {config.rows} rows
        </p>
      </motion.div>
    </motion.div>
  )
}
