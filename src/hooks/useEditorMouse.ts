import { useState, useCallback } from 'react'
import type { MapConfig, Point } from '../types'
import type { SelectionShape } from '../constants/tiles'
import { screenToWorld, worldToTile, isValidTile, getTilesInShape, fillTriangleWithPoints } from '../utils/coordinates'

interface UseEditorMouseOptions {
  config: MapConfig
  camera: { x: number; y: number; zoom: number }
  selectedTile: number
  selectedShape: SelectionShape
  trianglePoints: Point[]
  setTrianglePoints: (points: Point[]) => void
  placeTile: (x: number, y: number, tileId: number) => void
  resetTile: (x: number, y: number) => void
  startAction: (currentMap: number[][]) => void
  endAction: (finalMap: number[][]) => void
  forceSave: (map: number[][]) => void
}

interface UseEditorMouseReturn {
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: () => void
  isPanning: boolean
  isBrushPainting: boolean
  isSelecting: boolean
  lastMousePos: Point
  selectionStart: Point | null
  selectionEnd: Point | null
  setIsPanning: (v: boolean) => void
  setIsBrushPainting: (v: boolean) => void
  setIsSelecting: (v: boolean) => void
  setSelectionStart: (p: Point | null) => void
  setSelectionEnd: (p: Point | null) => void
}

export function useEditorMouse(options: UseEditorMouseOptions): UseEditorMouseReturn {
  const {
    config,
    camera,
    selectedTile,
    selectedShape,
    trianglePoints,
    setTrianglePoints,
    placeTile,
    resetTile,
    startAction,
    endAction,
    forceSave,
  } = options

  const [isPanning, setIsPanning] = useState(false)
  const [isBrushPainting, setIsBrushPainting] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 })
  const [selectionStart, setSelectionStart] = useState<Point | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null)

  const getTilePosition = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    return worldToTile(worldPos.x, worldPos.y, config.tileSize)
  }, [camera, config.tileSize])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const tilePos = getTilePosition(e)
    setLastMousePos({ x: e.clientX, y: e.clientY })
    
    if (e.button === 1 || (e.button === 0 && e.shiftKey === false)) {
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
            const newMap = Array(config.rows).fill(null).map((_, y) => 
              Array(config.cols).fill(null).map((_, x) => {
                const found = tiles.find(t => t.x === x && t.y === y)
                return found ? selectedTile : 0
              })
            )
            forceSave(newMap)
            setTrianglePoints([])
          }
        } else {
          startAction([])
          setIsSelecting(true)
          setSelectionStart(tilePos)
          setSelectionEnd(tilePos)
        }
      } else {
        startAction([])
        setIsBrushPainting(true)
        if (isValidTile(tilePos.x, tilePos.y, config)) {
          placeTile(tilePos.x, tilePos.y, selectedTile)
        }
      }
    }
    
    if (e.button === 2) {
      if (isValidTile(tilePos.x, tilePos.y, config)) {
        startAction([])
        resetTile(tilePos.x, tilePos.y)
      }
    }
  }, [getTilePosition, selectedShape, trianglePoints, config, selectedTile, startAction, placeTile, resetTile, forceSave, setTrianglePoints])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const tilePos = getTilePosition(e)
    
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      setLastMousePos({ x: e.clientX, y: e.clientY })
      return { dx, dy }
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
    return null
  }, [getTilePosition, isPanning, isBrushPainting, isSelecting, config, selectedTile, placeTile, lastMousePos])

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false)
    
    if (isBrushPainting) {
      setIsBrushPainting(false)
    }
    
    if (isSelecting && selectionStart && selectionEnd) {
      const tiles = getTilesInShape(selectionStart, selectionEnd, selectedShape, config)
      const newMap = Array(config.rows).fill(null).map((_, y) => 
        Array(config.cols).fill(null).map((_, x) => {
          const found = tiles.find(t => t.x === x && t.y === y)
          return found ? selectedTile : 0
        })
      )
      endAction(newMap)
      setIsSelecting(false)
      setSelectionStart(null)
      setSelectionEnd(null)
    }
  }, [isPanning, isBrushPainting, isSelecting, selectionStart, selectionEnd, selectedShape, config, selectedTile, endAction])

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isPanning,
    isBrushPainting,
    isSelecting,
    lastMousePos,
    selectionStart,
    selectionEnd,
    setIsPanning,
    setIsBrushPainting,
    setIsSelecting,
    setSelectionStart,
    setSelectionEnd,
  }
}
