import { useState } from 'react'
import { SetupScreen, MapEditor } from './components'
import type { MapConfig } from './types'

function App() {
  const [config, setConfig] = useState<MapConfig | null>(null)
  const [wentBack, setWentBack] = useState(false)

  if (config && !wentBack) {
    return <MapEditor config={config} onBack={() => { setWentBack(true) }} />
  }

  return (
    <SetupScreen
      onStart={(newConfig) => { setConfig(newConfig); setWentBack(false) }}
      onBack={config ? () => setWentBack(false) : undefined}
    />
  )
}

export default App
