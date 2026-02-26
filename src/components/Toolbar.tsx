import type { MapConfig } from '../types'
import { motion } from 'framer-motion'
import { 
  FaUndo, FaRedo, FaSave, FaFolderOpen, FaDownload, FaEye, 
  FaQuestionCircle, FaPlus, FaFileImport 
} from 'react-icons/fa'
import { ToolbarButton } from './ToolbarButton'

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
          TileMap Editor
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
