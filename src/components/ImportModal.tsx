import { useState } from 'react'
import { importFromTxt } from '../utils/database'

interface ImportModalProps {
  onImport: (data: { rows: number; cols: number; data: number[][] }) => void
  onClose: () => void
}

export function ImportModal({ onImport, onClose }: ImportModalProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const handleImport = () => {
    const result = importFromTxt(content)
    if (result) {
      onImport(result)
      onClose()
    } else {
      setError('Invalid format. Use space-separated values with newlines between rows.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setContent(event.target?.result as string || '')
        setError('')
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            📥 Import TXT
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload file or paste content
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="w-full mb-3 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
            />
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setError('') }}
              placeholder="0 0 0 0&#10;0 1 1 0&#10;0 1 1 0&#10;0 0 0 0"
              className="w-full h-40 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold"
            >
              📥 Import
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
