interface TutorialPanelProps {
  onClose: () => void
}

export function TutorialPanel({ onClose }: TutorialPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            ❓ Tutorial
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3 text-gray-300">
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              🎨 Tile Selection
            </h3>
            <p className="text-sm">Press <span className="text-emerald-400 font-mono">0-8</span> or click sidebar</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              🖌️ Brush
            </h3>
            <p className="text-sm">Left-click to place. Drag to paint.</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              ⬚ Shapes
            </h3>
            <p className="text-sm">
              <span className="text-emerald-400 font-mono">SHIFT</span>+drag. Keys: 
              <span className="text-emerald-400 font-mono">R</span>▢ rect, 
              <span className="text-emerald-400 font-mono">C</span>◯ circle, 
              <span className="text-emerald-400 font-mono">L</span>╱ line, 
              <span className="text-emerald-400 font-mono">F</span>▩ fill all.
            </p>
            <p className="text-sm mt-1">
              <span className="text-emerald-400 font-mono">T</span>△ Triangle: click 3 points to fill
            </p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              ↩️ Reset Tile
            </h3>
            <p className="text-sm">Right-click to reset to grass</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              🔍 Zoom
            </h3>
            <p className="text-sm">Mouse wheel - centered on cursor</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              ✋ Pan
            </h3>
            <p className="text-sm"><span className="text-emerald-400 font-mono">SPACE</span>+drag or middle mouse</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              💾 Export
            </h3>
            <p className="text-sm">👁 Preview | ↓ Download TXT</p>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              💿 Save/Load
            </h3>
            <p className="text-sm">
              💾 Save to browser DB<br/>
              📂 Load from saved maps<br/>
              📥 Import from TXT file
            </p>
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
