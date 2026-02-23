import type { MapConfig } from '../types'
import { motion } from 'framer-motion'
import { 
  FaUndo, FaRedo, FaSave, FaFolderOpen, FaDownload, FaEye, 
  FaQuestionCircle, FaPlus, FaFileImport 
} from 'react-icons/fa'

interface ToolbarProps {
  config: MapConfig
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onPreview: () => void
  onDownload: () => void
  onSave: () => void
  onLoad: () => void
  onImport: () => void
  onTutorial: () => void
  onNewMap: () => void
}

const ToolbarButton = ({ 
  onClick, 
  disabled, 
  title, 
  icon, 
  variant = 'default',
  className = '' 
}: { 
  onClick: () => void
  disabled?: boolean
  title: string
  icon: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  className?: string
}) => {
  const variants = {
    default: 'glass hover:bg-white/10',
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
    accent: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/20',
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${variants[variant]} ${disabled ? 'opacity-40' : 'cursor-pointer'} ${className}`}
    >
      {icon}
    </motion.button>
  )
}

export function Toolbar({
  config,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onDownload,
  onSave,
  onLoad,
  onImport,
  onTutorial,
  onNewMap,
}: ToolbarProps) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-6 py-3 glass border-b border-white/10 shadow-xl"
    >
      <div className="flex items-center gap-4">
        <motion.h1 
          className="text-xl font-bold gradient-text cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          Map Editor
        </motion.h1>
        <div className="h-6 w-px bg-white/10" />
        <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
          {config.cols}×{config.rows} • {config.tileSize}px
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <ToolbarButton
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          icon={<FaUndo className="text-white" />}
        />
        <ToolbarButton
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          icon={<FaRedo className="text-white" />}
        />
        
        <div className="w-px h-8 bg-white/10 mx-2" />
        
        <ToolbarButton
          onClick={onSave}
          title="Save to Database"
          icon={<FaSave className="text-white" />}
          variant="primary"
        />
        <ToolbarButton
          onClick={onLoad}
          title="Load from Database"
          icon={<FaFolderOpen className="text-white" />}
          variant="primary"
        />
        <ToolbarButton
          onClick={onImport}
          title="Import from TXT"
          icon={<FaFileImport className="text-white" />}
          variant="primary"
        />
        
        <div className="w-px h-8 bg-white/10 mx-2" />
        
        <ToolbarButton
          onClick={onPreview}
          title="Preview"
          icon={<FaEye className="text-white" />}
          variant="secondary"
        />
        <ToolbarButton
          onClick={onDownload}
          title="Download"
          icon={<FaDownload className="text-white" />}
          variant="secondary"
        />
        <ToolbarButton
          onClick={onTutorial}
          title="Tutorial"
          icon={<FaQuestionCircle className="text-white" />}
          variant="accent"
        />
        <ToolbarButton
          onClick={onNewMap}
          title="New Map"
          icon={<FaPlus className="text-white" />}
        />
      </div>
    </motion.div>
  )
}
