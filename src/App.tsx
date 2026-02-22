import { useState, useEffect } from 'react'
import { SetupScreen, MapEditor } from './components'
import type { MapConfig } from './types'
import type { SavedMap } from './utils/database'
import { initDatabase } from './utils/database'

function App() {
  const [config, setConfig] = useState<MapConfig | null>(null)
  const [wentBack, setWentBack] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [mapData, setMapData] = useState<number[][] | null>(null)
  const [initialTileTypes, setInitialTileTypes] = useState<string | undefined>()

  useEffect(() => {
    initDatabase()
  }, [])

  const handleStart = (newConfig: MapConfig, data?: number[][] | null, tileTypes?: string) => {
    setConfig(newConfig)
    setMapData(data || null)
    setInitialTileTypes(tileTypes)
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
    setWentBack(false)
    setMapKey(k => k + 1)
  }

  if (config && !wentBack) {
    return (
      <MapEditor
        key={mapKey}
        initialData={mapData}
        initialTileTypes={initialTileTypes}
        config={config}
        onBack={() => { setWentBack(true) }}
        onLoadMap={handleLoadMap}
      />
    )
  }

  return (
    <SetupScreen
      onStart={handleStart}
      onBack={config ? () => setWentBack(false) : undefined}
    />
  )
}

export default App
