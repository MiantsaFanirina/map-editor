import { useEffect, useCallback, useState } from 'react'
import { MIN_ZOOM, MAX_ZOOM, ZOOM_SENSITIVITY } from '../constants/tiles'

interface UseKeyboardOptions {
  onUndo: () => void
  onRedo: () => void
  onSelectTile: (id: number) => void
  onSelectShape: (shape: string) => void
  tileTypeIds: number[]
}

export function useKeyboard(options: UseKeyboardOptions) {
  const { onUndo, onRedo, onSelectTile, onSelectShape, tileTypeIds } = options
  const [spacePressed, setSpacePressed] = useState(false)

  const handleWheel = useCallback((e: WheelEvent, camera: { x: number; y: number; zoom: number }, setCamera: (c: { x: number; y: number; zoom: number }) => void) => {
    e.preventDefault()
    
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const worldBefore = screenToWorld(mouseX, mouseY, camera)
    const delta = -e.deltaY * ZOOM_SENSITIVITY
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom * (1 + delta)))
    
    const newCameraX = mouseX - worldBefore.x * newZoom
    const newCameraY = mouseY - worldBefore.y * newZoom
    
    setCamera({ x: newCameraX, y: newCameraY, zoom: newZoom })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePressed(true)
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        onUndo()
      }
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        onRedo()
      }
      
      const keyNum = parseInt(e.key)
      if (!isNaN(keyNum) && tileTypeIds.includes(keyNum)) {
        onSelectTile(keyNum)
      }
      
      const shapeKey = e.key.toLowerCase()
      if (shapeKey === 'r') onSelectShape('rectangle')
      if (shapeKey === 'c') onSelectShape('circle')
      if (shapeKey === 't') onSelectShape('triangle')
      if (shapeKey === 'l') onSelectShape('line')
      if (shapeKey === 'f') onSelectShape('fill')
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
  }, [onUndo, onRedo, onSelectTile, onSelectShape, tileTypeIds])

  return { spacePressed, handleWheel }
}

function screenToWorld(mouseX: number, mouseY: number, camera: { x: number; y: number; zoom: number }) {
  return {
    x: mouseX / camera.zoom - camera.x / camera.zoom,
    y: mouseY / camera.zoom - camera.y / camera.zoom,
  }
}
