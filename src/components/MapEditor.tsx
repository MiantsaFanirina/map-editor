import { useState, useRef, useCallback, useEffect } from 'react'
import type { MapConfig, Camera, Point } from '../types'
import { useEditorState } from '../hooks/useEditorState'
import { useCanvasLoop } from '../hooks/useCanvasLoop'
import { screenToWorld, worldToTile, isValidTile, generatePreviewText, downloadMap, getTilesInShape, fillTriangleWithPoints } from '../utils/coordinates'
import { Toolbar, TileSidebar, PreviewModal, TutorialPanel, ShapeSelector, SaveLoadModal, ImportModal } from './index'
import { tileTypesToExport, tileTypesFromExport } from '../hooks/useTileTypes'
import { saveMap, saveCurrentSession, getCurrentSession, initDatabase, type SavedMap } from '../utils/database'

const RULER_SIZE = 34

interface MapEditorProps {
  config: MapConfig
  onBack: () => void
  initialData?: number[][] | null
  initialTileTypes?: string
  onLoadMap?: (savedMap: SavedMap) => void
}

function renderRulers(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, camera: Camera, config: MapConfig, mouseTile?: { x: number; y: number } | null) {
  ctx.save()

  ctx.fillStyle = '#374151'
  ctx.fillRect(0, 0, canvas.width, RULER_SIZE)
  ctx.fillRect(0, 0, RULER_SIZE, canvas.height)

  ctx.strokeStyle = '#4b5563'
  ctx.lineWidth = 1

  const visibleLeft = -camera.x / camera.zoom
  const visibleTop = -camera.y / camera.zoom
  const visibleWidth = canvas.width / camera.zoom
  const visibleHeight = canvas.height / camera.zoom

  const tileStep = calculateRulerTileStep(config.tileSize, camera.zoom)
  const step = tileStep * config.tileSize

  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#9ca3af'
  ctx.textAlign = 'center'

  const startX = Math.floor(visibleLeft / step) * step
  for (let worldX = startX; worldX < visibleLeft + visibleWidth; worldX += step) {
    const screenX = worldX * camera.zoom + camera.x
    if (screenX < RULER_SIZE || screenX > canvas.width) continue

    const tileX = Math.floor(worldX / config.tileSize)
    ctx.beginPath()
    ctx.moveTo(screenX, RULER_SIZE - 8)
    ctx.lineTo(screenX, RULER_SIZE)
    ctx.stroke()

    const isMajor = tileX % (tileStep * 2) === 0
    if (isMajor) {
      ctx.fillText(tileX.toString(), screenX, RULER_SIZE - 10)
    }
  }

  ctx.textAlign = 'right'
  const startY = Math.floor(visibleTop / step) * step
  for (let worldY = startY; worldY < visibleTop + visibleHeight; worldY += step) {
    const screenY = worldY * camera.zoom + camera.y
    if (screenY < RULER_SIZE || screenY > canvas.height) continue

    const tileY = Math.floor(worldY / config.tileSize)
    ctx.beginPath()
    ctx.moveTo(RULER_SIZE - 8, screenY)
    ctx.lineTo(RULER_SIZE, screenY)
    ctx.stroke()

    const isMajor = tileY % (tileStep * 2) === 0
    if (isMajor) {
      ctx.fillText(tileY.toString(), RULER_SIZE - 10, screenY + 4)
    }
  }

  ctx.strokeStyle = '#60a5fa'
  ctx.lineWidth = 2
  
  const originScreenX = camera.x
  const originScreenY = camera.y
  
  if (originScreenX >= RULER_SIZE && originScreenX <= canvas.width) {
    ctx.beginPath()
    ctx.moveTo(originScreenX, 0)
    ctx.lineTo(originScreenX, RULER_SIZE)
    ctx.stroke()
  }
  if (originScreenY >= RULER_SIZE && originScreenY <= canvas.height) {
    ctx.beginPath()
    ctx.moveTo(0, originScreenY)
    ctx.lineTo(RULER_SIZE, originScreenY)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)'
  ctx.lineWidth = 1
  if (originScreenX >= RULER_SIZE && originScreenX <= canvas.width) {
    ctx.beginPath()
    ctx.moveTo(originScreenX, RULER_SIZE)
    ctx.lineTo(originScreenX, canvas.height)
    ctx.stroke()
  }
  if (originScreenY >= RULER_SIZE && originScreenY <= canvas.height) {
    ctx.beginPath()
    ctx.moveTo(RULER_SIZE, originScreenY)
    ctx.lineTo(canvas.width, originScreenY)
    ctx.stroke()
  }

  if (mouseTile) {
    const mouseWorldX = mouseTile.x * config.tileSize
    const mouseWorldY = mouseTile.y * config.tileSize
    const mouseScreenX = mouseWorldX * camera.zoom + camera.x
    const mouseScreenY = mouseWorldY * camera.zoom + camera.y
    
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    if (mouseScreenX >= RULER_SIZE) {
      ctx.beginPath()
      ctx.moveTo(mouseScreenX, 0)
      ctx.lineTo(mouseScreenX, RULER_SIZE)
      ctx.stroke()
    }
    if (mouseScreenY >= RULER_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, mouseScreenY)
      ctx.lineTo(RULER_SIZE, mouseScreenY)
      ctx.stroke()
    }

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'left'
    if (mouseScreenX >= RULER_SIZE) {
      const labelX = mouseScreenX + 5
      const labelY = RULER_SIZE - 5
      ctx.fillText(`X: ${mouseTile.x}`, labelX, labelY)
    }
    if (mouseScreenY >= RULER_SIZE) {
      const labelX = RULER_SIZE + 5
      const labelY = mouseScreenY - 5
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`Y: ${mouseTile.y}`, labelX, labelY)
    }
  }

  ctx.restore()
}

function calculateRulerTileStep(tileSize: number, zoom: number): number {
  const minPixelsBetween = 60
  const tilesPerStep = Math.max(1, Math.round(minPixelsBetween / (tileSize * zoom)))
  
  if (tilesPerStep <= 1) return 1
  if (tilesPerStep <= 2) return 2
  if (tilesPerStep <= 5) return 5
  return 10
}

export function MapEditor({ config, onBack, initialData, initialTileTypes, onLoadMap }: MapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rulerRef = useRef<HTMLCanvasElement>(null)
  
  const {
    mapData,
    setMapData,
    selectedTile,
    setSelectedTile,
    selectedShape,
    setSelectedShape,
    undo,
    redo,
    canUndo,
    canRedo,
    tileTypes,
    addTileType,
    updateTileType,
    removeTileType,
    getTileColor,
    getTileImage,
    startAction,
    endAction,
  } = useEditorState({ config, initialData, initialTileTypes })
  
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const [trianglePoints, setTrianglePoints] = useState<Point[]>([])
  const [spacePressed, setSpacePressed] = useState(false)
  
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
    
    if (e.button === 1 || (e.button === 0 && spacePressed)) {
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
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
              for (const t of tiles) {
                if (isValidTile(t.x, t.y, config)) {
                  newMap[t.y][t.x] = selectedTile
                }
              }
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
  }, [camera, config, spacePressed, selectedTile, selectedShape, trianglePoints, startAction, placeTile, resetTile])

  const [isPanning, setIsPanning] = useState(false)
  const [isBrushPainting, setIsBrushPainting] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 })
  const [selectionStart, setSelectionStart] = useState<Point | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null)
  const [mouseTile, setMouseTile] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    isSelectingRef.current = isSelecting
    if (!isSelecting && scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = 0
    }
  }, [isSelecting])

  const SCROLL_ZONE = 50
  const SCROLL_SPEED = 15
  const scrollFrameRef = useRef<number>(0)
  const isSelectingRef = useRef(false)
  const mousePosRef = useRef({ x: 0, y: 0, rect: { width: 0, height: 0 } })

  const updateSelectionAndScroll = useCallback(() => {
    if (!isSelectingRef.current) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const mouseX = mousePosRef.current.x
    const mouseY = mousePosRef.current.y

    let dx = 0
    let dy = 0
    if (mouseX < SCROLL_ZONE) dx = SCROLL_SPEED
    if (mouseX > rect.width - SCROLL_ZONE) dx = -SCROLL_SPEED
    if (mouseY < SCROLL_ZONE) dy = SCROLL_SPEED
    if (mouseY > rect.height - SCROLL_ZONE) dy = -SCROLL_SPEED

    if (dx !== 0 || dy !== 0) {
      setCamera(prev => {
        const newCamera = { x: prev.x + dx, y: prev.y + dy, zoom: prev.zoom }
        const worldPos = screenToWorld(mouseX, mouseY, newCamera)
        const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
        setSelectionEnd(tilePos)
        return newCamera
      })
    }

    scrollFrameRef.current = requestAnimationFrame(updateSelectionAndScroll)
  }, [config.tileSize])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    mousePosRef.current = { x: mouseX, y: mouseY, rect: { width: rect.width, height: rect.height } }
    
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
    
    if (isValidTile(tilePos.x, tilePos.y, config)) {
      setMouseTile(tilePos)
    } else {
      setMouseTile(null)
    }
    
    if (isPanning) {
      const dx = (e.clientX - lastMousePos.x)
      const dy = (e.clientY - lastMousePos.y)
      
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
      
      let dx = 0
      let dy = 0
      if (mouseX < SCROLL_ZONE) dx = SCROLL_SPEED
      if (mouseX > rect.width - SCROLL_ZONE) dx = -SCROLL_SPEED
      if (mouseY < SCROLL_ZONE) dy = SCROLL_SPEED
      if (mouseY > rect.height - SCROLL_ZONE) dy = -SCROLL_SPEED
      
      if (dx !== 0 || dy !== 0) {
        if (!scrollFrameRef.current) {
          scrollFrameRef.current = requestAnimationFrame(updateSelectionAndScroll)
        }
      } else {
        if (scrollFrameRef.current) {
          cancelAnimationFrame(scrollFrameRef.current)
          scrollFrameRef.current = 0
        }
      }
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [camera, config, isPanning, isBrushPainting, isSelecting, lastMousePos, selectedTile, placeTile, updateSelectionAndScroll, setMouseTile])

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
        for (const t of tiles) {
          if (isValidTile(t.x, t.y, config)) {
            newMap[t.y][t.x] = selectedTile
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

  useCanvasLoop({
    canvasRef,
    containerRef,
    camera,
    mapData,
    config,
    selection: isSelecting && selectionStart && selectionEnd ? { start: selectionStart, end: selectionEnd, shape: selectedShape } : undefined,
    trianglePoints,
    getTileColor,
    getTileImage,
    mouseTile,
  })

  useEffect(() => {
    const rulerCanvas = rulerRef.current
    const container = containerRef.current
    if (!rulerCanvas || !container) return

    const resizeCanvas = () => {
      rulerCanvas.width = container.clientWidth
      rulerCanvas.height = container.clientHeight
      const ctx = rulerCanvas.getContext('2d')
      if (ctx) {
        renderRulers(ctx, rulerCanvas, camera, config, mouseTile ?? undefined)
      }
    }

    resizeCanvas()

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [camera, config, mouseTile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePressed(true)
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      
      const keyNum = parseInt(e.key)
      if (!isNaN(keyNum) && tileTypes.find(t => t.id === keyNum)) {
        setSelectedTile(keyNum)
      }
      
      const shapeKey = e.key.toLowerCase()
      if (shapeKey === 'r') { setSelectedShape('rectangle'); setTrianglePoints([]) }
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
  }, [undo, redo, tileTypes])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const worldBefore = screenToWorld(mouseX, mouseY, camera)
      const delta = -e.deltaY * 0.001
      const newZoom = Math.max(0.1, Math.min(5, camera.zoom * (1 + delta)))
      
      const newCameraX = mouseX - worldBefore.x * newZoom
      const newCameraY = mouseY - worldBefore.y * newZoom
      
      setCamera({ x: newCameraX, y: newCameraY, zoom: newZoom })
    }

    container.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', onWheel)
    }
  }, [camera])

  const handleRemoveTile = (id: number) => {
    if (selectedTile === id) {
      setSelectedTile(0)
    }
    removeTileType(id)
  }

  const handleSave = useCallback(async () => {
    await initDatabase()
    const session = getCurrentSession()
    
    if (session?.savedMapId) {
      const tileTypesJson = JSON.stringify(tileTypes)
      saveMap('', config.rows, config.cols, config.tileSize, mapData, tileTypesJson, session.savedMapId)
      saveCurrentSession(config, mapData, tileTypesJson, session.savedMapId)
    } else {
      setShowSave(true)
    }
  }, [config, mapData, tileTypes, setShowSave])

  const handleDownload = useCallback(() => {
    const content = generatePreviewText(mapData)
    const tileTypesContent = tileTypesToExport(tileTypes)
    const combined = `MAP\n${content}\n\nTILES\n${tileTypesContent}`
    downloadMap(combined, `map_${config.cols}x${config.rows}.txt`)
  }, [mapData, config, tileTypes])

  const handleLoadMap = (savedMap: SavedMap) => {
    if (onLoadMap) {
      onLoadMap(savedMap)
    }
  }

  const handleImport = (imported: { rows: number; cols: number; data: number[][]; tileTypes?: string }) => {
    if (imported.tileTypes) {
      const parsed = tileTypesFromExport(imported.tileTypes)
      if (parsed.length > 0) {
        parsed.forEach(t => {
          if (!tileTypes.find(existing => existing.id === t.id)) {
            addTileType(t.color, t.label)
          }
        })
      }
    }
    setMapData(imported.data)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Toolbar
        config={config}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onPreview={() => setShowPreview(true)}
        onDownload={handleDownload}
        onSave={handleSave}
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
          tileTypes={tileTypes}
          onAddTile={addTileType}
          onUpdateTile={updateTileType}
          onRemoveTile={handleRemoveTile}
        />
        
        <div ref={containerRef} 
          className={`flex-1 relative ${isPanning || spacePressed ? 'cursor-grab' : 'cursor-crosshair'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
          />
          <canvas
            ref={rulerRef}
            className="absolute top-0 left-0 pointer-events-none z-10"
            width={800}
            height={600}
          />
          
          <div className="absolute bottom-4 right-4">
            <ShapeSelector
              selectedShape={selectedShape}
              onSelectShape={(shape) => { setSelectedShape(shape); setTrianglePoints([]) }}
            />
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

      {showSave && (
        <SaveLoadModal
          mode="save"
          mapData={mapData}
          config={config}
          tileTypes={tileTypes}
          onClose={() => setShowSave(false)}
        />
      )}

      {showLoad && (
        <SaveLoadModal
          mode="load"
          mapData={mapData}
          config={config}
          onLoad={handleLoadMap}
          onClose={() => setShowLoad(false)}
        />
      )}

      {showImport && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {showTutorial && (
        <TutorialPanel onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}
