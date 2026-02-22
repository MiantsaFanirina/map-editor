import { useEffect, useRef } from 'react'
import type { MapConfig, Camera, Point } from '../types'
import type { SelectionShape } from '../constants/tiles'
import { renderCanvas } from '../utils/render'

interface UseCanvasLoopOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  camera: Camera
  mapData: number[][]
  config: MapConfig
  selection?: { start: Point; end: Point; shape: SelectionShape } | undefined
  trianglePoints: Point[]
  getTileColor: (id: number) => string
}

export function useCanvasLoop(options: UseCanvasLoopOptions) {
  const { canvasRef, containerRef, camera, mapData, config, selection, trianglePoints, getTileColor } = options
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const render = () => {
      renderCanvas({
        canvas,
        camera,
        mapData,
        config,
        selection,
        trianglePoints,
        getTileColor,
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
  }, [canvasRef, containerRef, camera, mapData, config, selection, trianglePoints, getTileColor])
}
