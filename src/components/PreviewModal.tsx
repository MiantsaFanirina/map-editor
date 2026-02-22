import type { MapConfig } from '../types'

interface PreviewModalProps {
  mapData: number[][]
  config: MapConfig
  onClose: () => void
}

export function PreviewModal({ mapData, config, onClose }: PreviewModalProps) {
  const previewText = mapData.map(row => row.join(' ')).join('\n')

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full mx-4 shadow-2xl border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-400">Map Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        <pre className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono text-green-400">
          {previewText}
        </pre>
        <p className="mt-3 text-sm text-gray-400">
          Dimensions: {config.cols} columns × {config.rows} rows
        </p>
      </div>
    </div>
  )
}
