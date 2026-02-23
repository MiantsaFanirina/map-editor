import { motion } from 'framer-motion'
import type { SelectionShape } from '../constants/tiles'
import { SELECTION_SHAPES } from '../constants/tiles'
import { FaRegSquare, FaCircle, FaDrawPolygon, FaSlash, FaFill } from 'react-icons/fa6'

interface ShapeSelectorProps {
  selectedShape: SelectionShape
  onSelectShape: (shape: SelectionShape) => void
}

const shapeIcons: Record<SelectionShape, React.ReactNode> = {
  rectangle: <FaRegSquare />,
  circle: <FaCircle />,
  triangle: <FaDrawPolygon />,
  line: <FaSlash />,
  fill: <FaFill />,
}

export function ShapeSelector({ selectedShape, onSelectShape }: ShapeSelectorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
      className="absolute bottom-4 right-4 z-20"
    >
      <div className="glass-card rounded-2xl p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Shapes</span>
        </div>
        
        <div className="flex gap-1.5">
          {(Object.entries(SELECTION_SHAPES) as [SelectionShape, { label: string }][]).map(
            ([shape, { label }], index) => (
              <motion.button
                key={shape}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectShape(shape)}
                title={label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedShape === shape
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {shapeIcons[shape]}
              </motion.button>
            )
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-indigo-300 font-mono text-[10px]">
              <span className="text-base leading-none">⇧</span> + Drag
            </span>
            <span>to draw</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
