import { useState, useEffect } from 'react'
import { SetupScreen, MapEditor } from './components'
import type { MapConfig } from './types'
import type { SavedMap } from './utils/database'
import { initDatabase } from './utils/database'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [config, setConfig] = useState<MapConfig | null>(null)
  const [wentBack, setWentBack] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [mapData, setMapData] = useState<number[][] | null>(null)
  const [initialTileTypes, setInitialTileTypes] = useState<string | null>(null)

  useEffect(() => {
    initDatabase()
  }, [])

  const handleStart = (newConfig: MapConfig, data?: number[][] | null, tileTypes?: string) => {
    setConfig(newConfig)
    setMapData(data || null)
    setInitialTileTypes(tileTypes ?? null)
    setWentBack(false)
    setMapKey(k => k + 1)
  }

  const handleLoadMap = (savedMap: SavedMap) => {
    setConfig({
      rows: savedMap.rows,
      cols: savedMap.cols,
      tileSize: savedMap.tileSize,
    })
    setMapData(savedMap.data)
    setInitialTileTypes(savedMap.tileTypes ?? null)
    setWentBack(false)
    setMapKey(k => k + 1)
  }

  return (
    <div className="min-h-screen relative">
      <div className="animated-bg" />
      
      <AnimatePresence mode="wait">
        {config && !wentBack ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <MapEditor
              key={mapKey}
              initialData={mapData}
              initialTileTypes={initialTileTypes}
              config={config}
              onBack={() => { setWentBack(true) }}
              onLoadMap={handleLoadMap}
            />
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <SetupScreen
              onStart={handleStart}
              onBack={config ? () => setWentBack(false) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
