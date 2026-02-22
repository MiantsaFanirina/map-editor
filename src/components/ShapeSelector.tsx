import type { SelectionShape } from '../constants/tiles'
import { SELECTION_SHAPES } from '../constants/tiles'

interface ShapeSelectorProps {
  selectedShape: SelectionShape
  onSelectShape: (shape: SelectionShape) => void
}

export function ShapeSelector({ selectedShape, onSelectShape }: ShapeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-300">Selection Shape</h3>
      <div className="flex flex-wrap gap-1">
        {(Object.entries(SELECTION_SHAPES) as [SelectionShape, { label: string; icon: string }][]).map(
          ([shape, { label, icon }]) => (
            <button
              key={shape}
              onClick={() => onSelectShape(shape)}
              title={label}
              className={`px-2 py-1.5 rounded text-sm font-medium transition-all ${
                selectedShape === shape
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {icon}
            </button>
          )
        )}
      </div>
      <p className="text-xs text-gray-400">
        Hold SHIFT + drag to use
      </p>
    </div>
  )
}
