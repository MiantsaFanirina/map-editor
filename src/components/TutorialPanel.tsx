import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaMousePointer, FaThLarge, FaVectorSquare, FaEye, 
  FaUndo, FaSave, FaKeyboard, FaBolt, FaTrashAlt,
  FaPlus, FaPencilAlt, FaGripLines, FaHandPaper } from 'react-icons/fa'

interface TutorialPanelProps {
  onClose: () => void
}

const sections = [
  {
    title: 'Drawing',
    icon: FaMousePointer,
    color: 'from-blue-500 to-cyan-500',
    items: [
      { key: 'click', desc: 'Place a single tile', shortcut: 'Left Click', icon: FaBolt },
      { key: 'drag', desc: 'Paint continuously', shortcut: 'Left Drag', icon: FaHandPaper },
      { key: 'right', desc: 'Reset tile to default', shortcut: 'Right Click', icon: FaUndo },
    ]
  },
  {
    title: 'Tile Types',
    icon: FaThLarge,
    color: 'from-purple-500 to-pink-500',
    items: [
      { key: 'select', desc: 'Choose a tile type', shortcut: 'Click in sidebar', icon: FaMousePointer },
      { key: 'add', desc: 'Create new tile type', shortcut: '+ Add Tile button', icon: FaPlus },
      { key: 'edit', desc: 'Edit tile color/name', shortcut: 'Edit icon', icon: FaPencilAlt },
      { key: 'delete', desc: 'Remove tile type', shortcut: 'Trash icon', icon: FaTrashAlt },
    ]
  },
  {
    title: 'Shapes',
    icon: FaVectorSquare,
    color: 'from-orange-500 to-red-500',
    items: [
      { key: 'shift', desc: 'Enable shape mode', shortcut: 'Hold SHIFT', icon: FaBolt },
      { key: 'rect', desc: 'Draw rectangle', shortcut: 'R + Drag', icon: FaVectorSquare },
      { key: 'circle', desc: 'Draw circle', shortcut: 'C + Drag', icon: FaGripLines },
      { key: 'line', desc: 'Draw line', shortcut: 'L + Drag', icon: FaGripLines },
      { key: 'fill', desc: 'Fill entire map', shortcut: 'F + Drag', icon: FaThLarge },
      { key: 'triangle', desc: 'Draw triangle', shortcut: 'T + 3 Clicks', icon: FaVectorSquare },
    ]
  },
  {
    title: 'Navigation',
    icon: FaEye,
    color: 'from-green-500 to-emerald-500',
    items: [
      { key: 'zoom', desc: 'Zoom in or out', shortcut: 'Scroll Wheel', icon: FaBolt },
      { key: 'pan1', desc: 'Pan the canvas', shortcut: 'Space + Drag', icon: FaHandPaper },
      { key: 'pan2', desc: 'Pan with mouse', shortcut: 'Middle Click Drag', icon: FaHandPaper },
    ]
  },
  {
    title: 'History',
    icon: FaUndo,
    color: 'from-amber-500 to-yellow-500',
    items: [
      { key: 'undo', desc: 'Undo last action', shortcut: 'Ctrl + Z', icon: FaUndo },
      { key: 'redo', desc: 'Redo an action', shortcut: 'Ctrl + Y', icon: FaUndo },
    ]
  },
  {
    title: 'Data',
    icon: FaSave,
    color: 'from-indigo-500 to-blue-500',
    items: [
      { key: 'save', desc: 'Save map to browser', shortcut: 'Save button', icon: FaSave },
      { key: 'load', desc: 'Load saved map', shortcut: 'Load button', icon: FaThLarge },
      { key: 'import', desc: 'Import from TXT', shortcut: 'Import button', icon: FaPlus },
      { key: 'export', desc: 'Download as TXT', shortcut: 'Download button', icon: FaSave },
    ]
  },
]

export function TutorialPanel({ onClose }: TutorialPanelProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [showAll, setShowAll] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)' }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.98) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 pb-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex justify-between items-start">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
              >
                <span className="text-3xl text-white font-bold">?</span>
              </motion.div>
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-white"
                >
                  Welcome to Map Editor
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 mt-1"
                >
                  Master all the tools to create amazing maps
                </motion.p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <FaTimes />
            </motion.button>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 overflow-x-auto scrollbar-thin">
          {sections.map((section, i) => {
            const Icon = section.icon
            return (
              <motion.button
                key={section.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveTab(i); setShowAll(false) }}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  !showAll && activeTab === i
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="text-sm" />
                {section.title}
              </motion.button>
            )
          })}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(!showAll)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              showAll
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FaKeyboard className="text-sm" />
            View All
          </motion.button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6 scrollbar-thin" style={{ minHeight: '500px', maxHeight: '500px' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={showAll ? 'all' : activeTab.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {(showAll ? sections.flatMap(s => s.items.map(item => ({ ...item, section: s.title, color: s.color }))) : sections[activeTab].items).map((item: any, i: number) => {
                const Icon = item.icon || FaBolt
                const color = item.color || sections[activeTab].color
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: showAll ? 0.02 * i : 0.05 * i }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative p-4 rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${color.replace('from-', 'rgba(').replace(' to-', ', rgba(').replace('-500', ', 0.15)')})`,
                      }}
                    />
                    <div className="relative flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Icon className="text-white text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{item.desc}</p>
                          {showAll && <p className="text-xs text-gray-500">{item.section}</p>}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-white/80 whitespace-nowrap flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {item.shortcut}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="p-5 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Press <span className="text-white font-mono px-2 py-0.5 rounded bg-white/10">?</span> to toggle</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 cursor-pointer"
          >
            Got it!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
