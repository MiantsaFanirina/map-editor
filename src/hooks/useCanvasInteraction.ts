import { useCallback } from 'react'
import type { MapConfig, Camera, Point } from '../types'
import type { SelectionShape } from '../constants/tiles'
import { screenToWorld, worldToTile, isValidTile, getTilesInShape, fillTriangleWithPoints } from '../utils/coordinates'

interface UseCanvasInteractionOptions {
  config: MapConfig
  camera: Camera
  selectedTile: number
  selectedShape: SelectionShape
  trianglePoints: Point[]
  setTrianglePoints: (points: Point[]) => void
  setMapData: React.Dispatch<React.SetStateAction<number[][]>>
  startAction: (currentMap: number[][]) => void
  endAction: (finalMap: number[][]) => void
}

export function useCanvasInteraction(options: UseCanvasInteractionOptions) {
  const {
    config,
    camera,
    selectedTile,
    selectedShape,
    trianglePoints,
    setTrianglePoints,
    setMapData,
    startAction,
    endAction,
  } = options

  const handleMouseDown = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
    
    if (e.button === 0 && e.shiftKey) {
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
      }
      return { isSelection: true, startTile: tilePos }
    }
    
    if (e.button === 0) {
      startAction([])
      return { isPainting: true, tilePos }
    }
    
    if (e.button === 2) {
      if (isValidTile(tilePos.x, tilePos.y, config)) {
        startAction([])
        setMapData(prev => {
          const newMap = prev.map(row => [...row])
          newMap[tilePos.y][tilePos.x] = 0
          return newMap
        })
      }
    }
    
    return null
  }, [config, camera, selectedTile, selectedShape, trianglePoints, setTrianglePoints, setMapData, startAction])

  const handleMouseMove = useCallback((
    _e: React.MouseEvent,
    isPainting: boolean,
    tilePos: Point,
    setMapData: React.Dispatch<React.SetStateAction<number[][]>>
  ) => {
    if (isPainting && isValidTile(tilePos.x, tilePos.y, config)) {
      setMapData(prev => {
        const newMap = prev.map(row => [...row])
        newMap[tilePos.y][tilePos.x] = selectedTile
        return newMap
      })
    }
    return tilePos
  }, [config, selectedTile])

  const handleMouseUp = useCallback((
    isPainting: boolean,
    isSelecting: boolean,
    selectionStart: Point | null,
    selectionEnd: Point | null,
    setMapData: React.Dispatch<React.SetStateAction<number[][]>>,
    endAction: (finalMap: number[][]) => void
  ) => {
    if (isPainting) {
      endAction([])
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
    }
  }, [config, selectedTile, selectedShape, endAction])

  return { handleMouseDown, handleMouseMove, handleMouseUp }
}
