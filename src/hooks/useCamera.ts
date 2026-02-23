import { useState, useCallback } from 'react'
import type { Camera, MapConfig } from '../types'
import { screenToWorld, worldToTile } from '../utils/coordinates'

interface UseCameraOptions {
  config: MapConfig
}

interface UseCameraReturn {
  camera: Camera
  setCamera: React.Dispatch<React.SetStateAction<Camera>>
  handleWheel: (e: React.WheelEvent) => void
  panBy: (dx: number, dy: number) => void
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_SENSITIVITY = 0.001

export function useCamera(_options: UseCameraOptions): UseCameraReturn {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const canvas = e.currentTarget
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

  const panBy = useCallback((dx: number, dy: number) => {
    setCamera(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }))
  }, [])

  return { camera, setCamera, handleWheel, panBy }
}

export function useMouseTileTracking(camera: Camera, config: MapConfig) {
  const [mouseTile, setMouseTile] = useState<{ x: number; y: number } | null>(null)

  const updateMouseTile = useCallback((e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, camera)
    const tilePos = worldToTile(worldPos.x, worldPos.y, config.tileSize)
    
    if (tilePos.x >= 0 && tilePos.x < config.cols && tilePos.y >= 0 && tilePos.y < config.rows) {
      setMouseTile(tilePos)
    } else {
      setMouseTile(null)
    }
  }, [camera, config])

  return { mouseTile, updateMouseTile, setMouseTile }
}
