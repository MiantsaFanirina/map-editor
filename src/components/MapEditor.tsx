import { useState, useRef, useEffect, useCallback } from 'react'
import type { MapConfig, Camera, Point } from '../types'
import { TILE_TYPES, MIN_ZOOM, MAX_ZOOM, ZOOM_SENSITIVITY, type SelectionShape, SELECTION_SHAPES } from '../constants/tiles'
import { useHistory } from '../hooks/useHistory'
import { screenToWorld, worldToTile, isValidTile, generatePreviewText, downloadMap, getTilesInShape, fillTriangleWithPoints } from '../utils/coordinates'
import { renderCanvas } from '../utils/render'
import { Toolbar, TileSidebar, PreviewModal, TutorialPanel, ShapeSelector, SaveLoadModal, ImportModal } from './index'
import type { SavedMap } from '../utils/database'

interface MapEditorProps {
  config: MapConfig
  onBack: () => void
  initialData?: number[][] | null
  onLoadMap?: (savedMap: SavedMap) => void
}

export function MapEditor({ config, onBack, initialData }: MapEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  
  const [mapData, setMapData] = useState<number[][]>(() => 
    initialData || Array(config.rows).fill(null).map(() => Array(config.cols).fill(0))
  )
  
  const { startAction, endAction, forceSave, undo, redo, canUndo, canRedo } = useHistory(mapData)
  
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const [selectedTile, setSelectedTile] = useState<number>(1)
  const [selectedShape, setSelectedShape] = useState<SelectionShape>('rectangle')
  
  const [isPanning, setIsPanning] = useState(false)
  const [isBrushPainting, setIsBrushPainting] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [spacePressed, setSpacePressed] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 })
  const [selectionStart, setSelectionStart] = useState<Point | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null)
  const [trianglePoints, setTrianglePoints] = useState<Point[]>([])
  
  const [showPreview, setShowPreview] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [showSave, setShowSave] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const mapDataRef = useRef(mapData)
  mapDataRef.current = mapData

  const placeTile = useCallback((tileX: number, tileY: number, tileId: number) => {
    if (!isValidTile(tileX, tileY, config)) return
    
    setMapData(prev => {
      const newMap = prev.map(row => [...row])
      newMap[tileY][tileX] = tileId
      return newMap
    })
  }, [config])

  const resetTile = useCallback((tileX: number, tileY: number) => {
    placeTile(tileX, tileY, 0)
  }, [placeTile])

  const handleUndo = useCallback(() => {
    const restored = undo()
    if (restored) setMapData(restored)
  }, [undo])

  const handleRedo = useCallback(() => {
    const restored = redo()
    if (restored) setMapData(restored)
  }, [redo])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const render = () => {
      renderCanvas({
        canvas,
        camera,
        mapData: mapDataRef.current,
        config,
        selection: isSelecting && selectionStart && selectionEnd ? { start: selectionStart, end: selectionEnd, shape: selectedShape } : undefined,
        trianglePoints,
      })
    }
    
    const handleResize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      render()
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    let pending = false
    const loop = () => {
      if (!pending) {
        pending = true
        requestAnimationFrame(() => {
          render()
          pending = false
        })
      }
      animationRef.current = requestAnimationFrame(loop)
    }
    loop()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [camera, config, isSelecting, selectionStart, selectionEnd, selectedShape, trianglePoints])

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
        if (selectedShape === 'triangle') {
          const newPoints = [...trianglePoints, tilePos]
          setTrianglePoints(newPoints)
          
          if (newPoints.length >= 3) {
            const tiles = fillTriangleWithPoints(newPoints[0], newPoints[1], newPoints[2], config)
            setMapData(prev => {
              const newMap = prev.map(row => [...row])
              for (const { x, y } of tiles) {
                if (isValidTile(x, y, config)) {
                  newMap[y][x] = selectedTile
                }
              }
              forceSave(newMap)
              return newMap
            })
            setTrianglePoints([])
          }
        } else {
          startAction(mapDataRef.current)
          setIsSelecting(true)
          setSelectionStart(tilePos)
          setSelectionEnd(tilePos)
        }
      } else {
        startAction(mapDataRef.current)
        setIsBrushPainting(true)
        if (isValidTile(tilePos.x, tilePos.y, config)) {
          placeTile(tilePos.x, tilePos.y, selectedTile)
        }
      }
    }
    
    if (e.button === 2) {
      if (isValidTile(tilePos.x, tilePos.y, config)) {
        startAction(mapDataRef.current)
        resetTile(tilePos.x, tilePos.y)
      }
    }
  }, [camera, config, spacePressed, selectedTile, selectedShape, trianglePoints, startAction, placeTile, resetTile, forceSave])

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
    
    if (isSelecting) {
      setSelectionEnd(tilePos)
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [camera, config, isPanning, isBrushPainting, isSelecting, lastMousePos, selectedTile, placeTile])

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false)
    
    if (isBrushPainting) {
      setIsBrushPainting(false)
      endAction(mapDataRef.current)
    }
    
    if (isSelecting && selectionStart && selectionEnd) {
      const tiles = getTilesInShape(selectionStart, selectionEnd, selectedShape, config)
      setMapData(prev => {
        const newMap = prev.map(row => [...row])
        for (const { x, y } of tiles) {
          if (isValidTile(x, y, config)) {
            newMap[y][x] = selectedTile
          }
        }
        endAction(newMap)
        return newMap
      })
      setIsSelecting(false)
      setSelectionStart(null)
      setSelectionEnd(null)
    }
  }, [isPanning, isBrushPainting, isSelecting, selectionStart, selectionEnd, selectedShape, config, selectedTile, endAction])

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
      
      const shapeKey = e.key.toLowerCase()
      if (shapeKey === 'r') setSelectedShape('rectangle')
      if (shapeKey === 'c') setSelectedShape('circle')
      if (shapeKey === 't') { setSelectedShape('triangle'); setTrianglePoints([]) }
      if (shapeKey === 'l') setSelectedShape('line')
      if (shapeKey === 'f') setSelectedShape('fill')
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
        onSave={() => setShowSave(true)}
        onLoad={() => setShowLoad(true)}
        onImport={() => setShowImport(true)}
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
            className={`w-full h-full ${isPanning || spacePressed ? 'cursor-grab' : 'cursor-crosshair'}`}
            style={{ display: 'block' }}
          />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <ShapeSelector
              selectedShape={selectedShape}
              onSelectShape={(shape) => { setSelectedShape(shape); setTrianglePoints([]) }}
            />
          </div>
          
          <div className="absolute bottom-4 left-4 flex gap-2">
            {spacePressed && (
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium flex items-center gap-2">
                ✋ Pan
              </span>
            )}
            {isSelecting && (
              <span className="px-3 py-1 bg-amber-600 rounded-full text-sm font-medium flex items-center gap-2">
                {SELECTION_SHAPES[selectedShape].icon} {selectedShape}
              </span>
            )}
            {selectedShape === 'triangle' && trianglePoints.length > 0 && (
              <span className="px-3 py-1 bg-orange-600 rounded-full text-sm font-medium flex items-center gap-2">
                △ Click {3 - trianglePoints.length} more {trianglePoints.length === 2 ? 'point' : 'points'}
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
      
      {showSave && (
        <SaveLoadModal
          mode="save"
          mapData={mapData}
          config={config}
          onClose={() => setShowSave(false)}
        />
      )}
      
      {showLoad && (
        <SaveLoadModal
          mode="load"
          mapData={mapData}
          config={config}
          onLoad={(savedMap) => {
            setMapData(savedMap.data)
            setCamera({ x: 0, y: 0, zoom: 1 })
          }}
          onClose={() => setShowLoad(false)}
        />
      )}
      
      {showImport && (
        <ImportModal
          onImport={(imported) => {
            setMapData(imported.data)
            setCamera({ x: 0, y: 0, zoom: 1 })
          }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}
