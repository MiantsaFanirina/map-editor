import type { Camera, MapConfig, Point } from '../types'

interface RenderOptions {
  canvas: HTMLCanvasElement
  camera: Camera
  mapData: number[][]
  config: MapConfig
  selection?: {
    start: Point | null
    end: Point | null
    shape: string
  }
  trianglePoints?: Point[]
  getTileColor: (id: number) => string
}

export function renderCanvas({
  canvas,
  camera,
  mapData,
  config,
  selection,
  trianglePoints,
  getTileColor,
}: RenderOptions): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#1f2937'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const visibleLeft = -camera.x / camera.zoom
  const visibleTop = -camera.y / camera.zoom
  const visibleWidth = canvas.width / camera.zoom
  const visibleHeight = canvas.height / camera.zoom

  const startTileX = Math.max(0, Math.floor(visibleLeft / config.tileSize))
  const endTileX = Math.min(config.cols - 1, Math.ceil((visibleLeft + visibleWidth) / config.tileSize))
  const startTileY = Math.max(0, Math.floor(visibleTop / config.tileSize))
  const endTileY = Math.min(config.rows - 1, Math.ceil((visibleTop + visibleHeight) / config.tileSize))

  ctx.save()
  ctx.translate(camera.x, camera.y)
  ctx.scale(camera.zoom, camera.zoom)

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      const tileId = mapData[tileY]?.[tileX] ?? 0
      const color = getTileColor(tileId)

      ctx.fillStyle = color
      ctx.fillRect(
        tileX * config.tileSize,
        tileY * config.tileSize,
        config.tileSize,
        config.tileSize
      )

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1 / camera.zoom
      ctx.strokeRect(
        tileX * config.tileSize,
        tileY * config.tileSize,
        config.tileSize,
        config.tileSize
      )

      if (camera.zoom > 0.5) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.font = `${10 / camera.zoom}px sans-serif`
        ctx.fillText(
          tileId.toString(),
          tileX * config.tileSize + 2,
          tileY * config.tileSize + 12 / camera.zoom
        )
      }
    }
  }

  if (camera.zoom >= 0.5) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1 / camera.zoom

    for (let x = 0; x <= config.cols; x++) {
      ctx.beginPath()
      ctx.moveTo(x * config.tileSize, 0)
      ctx.lineTo(x * config.tileSize, config.rows * config.tileSize)
      ctx.stroke()
    }

    for (let y = 0; y <= config.rows; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * config.tileSize)
      ctx.lineTo(config.cols * config.tileSize, y * config.tileSize)
      ctx.stroke()
    }
  }

  if (selection?.start && selection?.end) {
    const { start, end, shape } = selection
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)
    
    const centerX = (minX + maxX) / 2 + 0.5
    const centerY = (minY + maxY) / 2 + 0.5
    const radiusX = (maxX - minX + 1) / 2
    const radiusY = (maxY - minY + 1) / 2
    
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2 / camera.zoom
    ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom])
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
    
    if (shape === 'rectangle') {
      ctx.strokeRect(
        minX * config.tileSize,
        minY * config.tileSize,
        (maxX - minX + 1) * config.tileSize,
        (maxY - minY + 1) * config.tileSize
      )
      ctx.fillRect(
        minX * config.tileSize,
        minY * config.tileSize,
        (maxX - minX + 1) * config.tileSize,
        (maxY - minY + 1) * config.tileSize
      )
    } else if (shape === 'circle') {
      ctx.beginPath()
      ctx.ellipse(
        centerX * config.tileSize,
        centerY * config.tileSize,
        radiusX * config.tileSize,
        radiusY * config.tileSize,
        0, 0, Math.PI * 2
      )
      ctx.stroke()
      ctx.fill()
    } else if (shape === 'line') {
      ctx.beginPath()
      ctx.moveTo((start.x + 0.5) * config.tileSize, (start.y + 0.5) * config.tileSize)
      ctx.lineTo((end.x + 0.5) * config.tileSize, (end.y + 0.5) * config.tileSize)
      ctx.lineWidth = 4 / camera.zoom
      ctx.stroke()
    } else if (shape === 'fill') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'
      ctx.fillRect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2 / camera.zoom
      ctx.strokeRect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)
    }
    
    ctx.setLineDash([])
  }
  
  if (trianglePoints && trianglePoints.length > 0) {
    ctx.fillStyle = '#f97316'
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2 / camera.zoom
    
    for (const point of trianglePoints) {
      const cx = (point.x + 0.5) * config.tileSize
      const cy = (point.y + 0.5) * config.tileSize
      const radius = config.tileSize * 0.3
      
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
    
    if (trianglePoints.length >= 2) {
      ctx.beginPath()
      ctx.moveTo((trianglePoints[0].x + 0.5) * config.tileSize, (trianglePoints[0].y + 0.5) * config.tileSize)
      ctx.lineTo((trianglePoints[1].x + 0.5) * config.tileSize, (trianglePoints[1].y + 0.5) * config.tileSize)
      if (trianglePoints.length >= 3) {
        ctx.lineTo((trianglePoints[2].x + 0.5) * config.tileSize, (trianglePoints[2].y + 0.5) * config.tileSize)
        ctx.closePath()
      }
      ctx.strokeStyle = '#fbbf24'
      ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom])
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  ctx.restore()
}
