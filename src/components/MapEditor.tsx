import { useState, useRef, useEffect, useCallback } from 'react'
import type { MapConfig, Camera, Point } from '../types'
import { TILE_TYPES, MIN_ZOOM, MAX_ZOOM, ZOOM_SENSITIVITY } from '../constants/tiles'
import { useHistory } from '../hooks/useHistory'
import { screenToWorld, worldToTile, isValidTile, generatePreviewText, downloadMap } from '../utils/coordinates'
import { renderCanvas } from '../utils/render'
import { Toolbar, TileSidebar, PreviewModal, TutorialPanel } from '../components'

interface MapEditorProps {
  config: MapConfig
  onBack: () => void
}

export function MapEditor({ config, onBack }: MapEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [mapData, setMapData] = useState<number[][]>(() => 
    Array(config.rows).fill(null).map(() => Array(config.cols).fill(0))
  )
  
  const { saveToHistory, undo, redo, canUndo, canRedo } = useHistory(mapData)
  
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const [selectedTile, setSelectedTile] = useState<number>(1)
  
  const [isPanning, setIsPanning] = useState(false)
  const [isBrushPainting, setIsBrushPainting] = useState(false)
  const [isRectSelecting, setIsRectSelecting] = useState(false)
  const [spacePressed, setSpacePressed] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 })
  const [rectStart, setRectStart] = useState<Point | null>(null)
  const [rectEnd, setRectEnd] = useState<Point | null>(null)
  
  const [showPreview, setShowPreview] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)

  const placeTile = useCallback((tileX: number, tileY: number, tileId: number) => {
    if (!isValidTile(tileX, tileY, config)) return
    
    setMapData(prev => {
      const newMap = prev.map(row => [...row])
      newMap[tileY][tileX] = tileId
      saveToHistory(newMap)
      return newMap
    })
  }, [config, saveToHistory])

  const resetTile = useCallback((tileX: number, tileY: number) => {
    placeTile(tileX, tileY, 0)
  }, [placeTile])

  const fillRectangle = useCallback((startX: number, startY: number, endX: number, endY: number, tileId: number) => {
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)
    
    setMapData(prev => {
      const newMap = prev.map(row => [...row])
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (isValidTile(x, y, config)) {
            newMap[y][x] = tileId
          }
        }
      }
      saveToHistory(newMap)
      return newMap
    })
  }, [config, saveToHistory])

  const handleUndo = useCallback(() => {
    const restored = undo()
    if (restored) setMapData(restored)
  }, [undo])

  const handleRedo = useCallback(() => {
    const restored = redo()
    if (restored) setMapData(restored)
  }, [redo])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    renderCanvas({
      canvas,
      camera,
      mapData,
      config,
      rectSelection: isRectSelecting ? { start: rectStart, end: rectEnd } : undefined,
    })
  }, [camera, mapData, config, isRectSelecting, rectStart, rectEnd])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      render()
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const worldBefore = screenToWorld(mouseX, mouseY, camera)
    const delta = -e.deltaY * ZOOM_SENSITIVITY
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom * (1 + delta)))
    
    const newCameraX = mouseX - worldBefore.x * newZoom
    const newCameraY = mouseY - worldBefore.y * newZoom
    
    setCamera({ x: newCameraX, y: newCameraY, zoom: newZoom })
  }, [camera])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
    
    if (e.button === 1 || (e.button === 0 && spacePressed)) {
      setIsPanning(true)
      e.preventDefault()
      return
    }
    
    if (e.button === 0) {
      if (e.shiftKey) {
        setIsRectSelecting(true)
        setRectStart(tilePos)
        setRectEnd(tilePos)
      } else {
        setIsBrushPainting(true)
        if (isValidTile(tilePos.x, tilePos.y, config)) {
          placeTile(tilePos.x, tilePos.y, selectedTile)
        }
      }
    }
    
    if (e.button === 2) {
      if (isValidTile(tilePos.x, tilePos.y, config)) {
        resetTile(tilePos.x, tilePos.y)
      }
    }
  }, [camera, config, spacePressed, selectedTile, placeTile, resetTile])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
    
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      
      setCamera(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }))
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
      return
    }
    
    if (isBrushPainting) {
      if (isValidTile(tilePos.x, tilePos.y, config)) {
        placeTile(tilePos.x, tilePos.y, selectedTile)
      }
    }
    
    if (isRectSelecting) {
      setRectEnd(tilePos)
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [camera, config, isPanning, isBrushPainting, isRectSelecting, lastMousePos, selectedTile, placeTile])

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false)
    if (isBrushPainting) setIsBrushPainting(false)
    
    if (isRectSelecting && rectStart && rectEnd) {
      fillRectangle(rectStart.x, rectStart.y, rectEnd.x, rectEnd.y, selectedTile)
      setIsRectSelecting(false)
      setRectStart(null)
      setRectEnd(null)
    }
  }, [isPanning, isBrushPainting, isRectSelecting, rectStart, rectEnd, selectedTile, fillRectangle])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePressed(true)
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
      
      const keyNum = parseInt(e.key)
      if (!isNaN(keyNum) && TILE_TYPES[keyNum] !== undefined) {
        setSelectedTile(keyNum)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleUndo, handleRedo])

  const handleDownload = useCallback(() => {
    const content = generatePreviewText(mapData)
    downloadMap(content, `map_${config.cols}x${config.rows}.txt`)
  }, [mapData, config])

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Toolbar
        config={config}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={() => setShowPreview(true)}
        onDownload={handleDownload}
        onTutorial={() => setShowTutorial(true)}
        onNewMap={onBack}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <TileSidebar
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
          camera={camera}
        />
        
        <div ref={containerRef} className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full h-full ${
              isPanning || spacePressed ? 'cursor-grab' : 'cursor-crosshair'
            }`}
            style={{ display: 'block' }}
          />
          
          <div className="absolute bottom-4 left-4 flex gap-2">
            {spacePressed && (
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium">
                Pan Mode (SPACE)
              </span>
            )}
            {isRectSelecting && (
              <span className="px-3 py-1 bg-amber-600 rounded-full text-sm font-medium">
                Rectangle Select (SHIFT)
              </span>
            )}
          </div>
        </div>
      </div>
      
      {showPreview && (
        <PreviewModal
          mapData={mapData}
          config={config}
          onClose={() => setShowPreview(false)}
        />
      )}
      
      {showTutorial && (
        <TutorialPanel onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}
