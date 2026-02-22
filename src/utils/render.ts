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
  mouseTile?: { x: number; y: number } | null
}

const RULER_SIZE = 25
const GRID_LINE_EVERY = 5

export function renderCanvas({
  canvas,
  camera,
  mapData,
  config,
  selection,
  trianglePoints,
  getTileColor,
  mouseTile,
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

  ctx.fillStyle = '#1f2937'
  ctx.fillRect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)

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
    }
  }

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.lineWidth = 1 / camera.zoom

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      ctx.strokeRect(
        tileX * config.tileSize,
        tileY * config.tileSize,
        config.tileSize,
        config.tileSize
      )
    }
  }

  if (camera.zoom >= 0.3) {
    const worldLeft = visibleLeft
    const worldTop = visibleTop
    const worldRight = visibleLeft + visibleWidth
    const worldBottom = visibleTop + visibleHeight

    const startCol = Math.floor(worldLeft / config.tileSize)
    const endCol = Math.ceil(worldRight / config.tileSize)
    const startRow = Math.floor(worldTop / config.tileSize)
    const endRow = Math.ceil(worldBottom / config.tileSize)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1 / camera.zoom

    for (let x = startCol; x <= endCol; x++) {
      const isMajor = x % GRID_LINE_EVERY === 0
      ctx.globalAlpha = isMajor ? 0.4 : 0.15
      const worldX = x * config.tileSize
      ctx.beginPath()
      ctx.moveTo(worldX, worldTop)
      ctx.lineTo(worldX, worldBottom)
      ctx.stroke()
    }

    for (let y = startRow; y <= endRow; y++) {
      const isMajor = y % GRID_LINE_EVERY === 0
      ctx.globalAlpha = isMajor ? 0.4 : 0.15
      const worldY = y * config.tileSize
      ctx.beginPath()
      ctx.moveTo(worldLeft, worldY)
      ctx.lineTo(worldRight, worldY)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  if (camera.zoom >= 0.5) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.font = `${10 / camera.zoom}px sans-serif`

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tileId = mapData[tileY]?.[tileX] ?? 0
        ctx.fillText(
          tileId.toString(),
          tileX * config.tileSize + 2,
          tileY * config.tileSize + 12 / camera.zoom
        )
      }
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
    
    let width = 0
    let height = 0
    
    if (shape === 'rectangle') {
      width = maxX - minX + 1
      height = maxY - minY + 1
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
      width = Math.ceil(radiusX * 2)
      height = Math.ceil(radiusY * 2)
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
      const dx = Math.abs(end.x - start.x) + 1
      const dy = Math.abs(end.y - start.y) + 1
      width = Math.max(dx, dy)
      height = Math.min(dx, dy)
      ctx.beginPath()
      ctx.moveTo((start.x + 0.5) * config.tileSize, (start.y + 0.5) * config.tileSize)
      ctx.lineTo((end.x + 0.5) * config.tileSize, (end.y + 0.5) * config.tileSize)
      ctx.lineWidth = 4 / camera.zoom
      ctx.stroke()
    } else if (shape === 'fill') {
      width = config.cols
      height = config.rows
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'
      ctx.fillRect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2 / camera.zoom
      ctx.strokeRect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)
    }
    
    ctx.setLineDash([])

    if (width > 0 && height > 0) {
      const labelX = maxX * config.tileSize + config.tileSize + 10
      const labelY = minY * config.tileSize
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(labelX, labelY, 80, 50)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 1 / camera.zoom
      ctx.strokeRect(labelX, labelY, 80, 50)
      ctx.fillStyle = '#fbbf24'
      ctx.font = `bold ${12 / camera.zoom}px sans-serif`
      ctx.fillText(`W: ${width}`, labelX + 5, labelY + 18 / camera.zoom)
      ctx.fillText(`H: ${height}`, labelX + 5, labelY + 38 / camera.zoom)
    }
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

  renderRulers(ctx, canvas, camera, config, mouseTile)
}

function renderRulers(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, camera: Camera, config: MapConfig, mouseTile?: { x: number; y: number } | null): void {
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
