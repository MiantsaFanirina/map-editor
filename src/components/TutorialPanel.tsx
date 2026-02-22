interface TutorialPanelProps {
  onClose: () => void
}

export function TutorialPanel({ onClose }: TutorialPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">Map Editor Tutorial</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Tile Selection</h3>
            <p className="text-sm">Press number keys <span className="text-emerald-400 font-mono">0-8</span> to select tile types. Or click on a tile in the left sidebar.</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Brush Painting</h3>
            <p className="text-sm">Left-click to place a single tile. Click and drag to paint continuously.</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Rectangle Selection</h3>
            <p className="text-sm">Hold <span className="text-emerald-400 font-mono">SHIFT</span> and drag to select a rectangular area. Release to fill with the selected tile.</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Right Click Reset</h3>
            <p className="text-sm">Right-click on any tile to reset it back to grass (0).</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Zooming</h3>
            <p className="text-sm">Use the <span className="text-emerald-400 font-mono">mouse wheel</span> to zoom in/out. The zoom is centered on your cursor position.</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Panning</h3>
            <p className="text-sm">Hold <span className="text-emerald-400 font-mono">SPACE</span> and drag, or use <span className="text-emerald-400 font-mono">middle mouse button</span> to pan the view.</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1">Export</h3>
            <p className="text-sm">Click <span className="text-amber-400">Preview TXT</span> to see the map data. Click <span className="text-emerald-400">Download TXT</span> to save the map as a text file.</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
