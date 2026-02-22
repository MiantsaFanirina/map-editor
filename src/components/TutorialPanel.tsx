import { useState } from 'react'

interface TutorialPanelProps {
  onClose: () => void
}

const sections = [
  {
    title: 'Drawing',
    icon: '',
    items: [
      { key: '0-8', desc: 'Select tile type', shortcut: 'Keys 0-8' },
      { key: 'click', desc: 'Place single tile', shortcut: 'Left Click' },
      { key: 'drag', desc: 'Paint continuously', shortcut: 'Left Drag' },
      { key: 'right', desc: 'Reset to grass', shortcut: 'Right Click' },
    ]
  },
  {
    title: 'Shapes',
    icon: '',
    items: [
      { key: 'shift', desc: 'Enable shapes', shortcut: 'Hold SHIFT' },
      { key: 'rect', desc: 'Rectangle', shortcut: 'R + Drag' },
      { key: 'circle', desc: 'Circle/Ellipse', shortcut: 'C + Drag' },
      { key: 'line', desc: 'Draw line', shortcut: 'L + Drag' },
      { key: 'fill', desc: 'Fill entire map', shortcut: 'F + Drag' },
      { key: 'triangle', desc: 'Triangle (3 points)', shortcut: 'T + 3 Clicks' },
    ]
  },
  {
    title: 'View',
    icon: '',
    items: [
      { key: 'zoom', desc: 'Zoom in/out', shortcut: 'Mouse Wheel' },
      { key: 'pan1', desc: 'Pan view', shortcut: 'SPACE + Drag' },
      { key: 'pan2', desc: 'Pan view', shortcut: 'Middle Mouse' },
    ]
  },
  {
    title: 'Edit',
    icon: '',
    items: [
      { key: 'undo', desc: 'Undo', shortcut: 'Ctrl+Z' },
      { key: 'redo', desc: 'Redo', shortcut: 'Ctrl+Y' },
    ]
  },
  {
    title: 'Save/Load',
    icon: '',
    items: [
      { key: 'save', desc: 'Save to browser', shortcut: '💾 Button' },
      { key: 'load', desc: 'Load saved map', shortcut: '📂 Button' },
      { key: 'import', desc: 'Import TXT file', shortcut: '📥 Button' },
      { key: 'export', desc: 'Export as TXT', shortcut: '↓ Button' },
    ]
  },
]

export function TutorialPanel({ onClose }: TutorialPanelProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-emerald-900/50 p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">️</span>
                Map Editor Tutorial
              </h2>
              <p className="text-gray-400 mt-1">Learn how to use all the features</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-gray-800/50 border-b border-gray-700 overflow-x-auto">
          {sections.map((section, i) => (
            <button
              key={section.title}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === i
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections[activeTab].items.map((item) => (
              <div
                key={item.key}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-colors group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{item.desc}</span>
                  <span className="px-3 py-1 bg-gray-700 rounded-lg text-sm font-mono text-emerald-400 group-hover:bg-gray-600 transition-colors">
                    {item.shortcut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/30 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Tip: Press <span className="text-emerald-400 font-mono">?</span> to toggle this panel
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
