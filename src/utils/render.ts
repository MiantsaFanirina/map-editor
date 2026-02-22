import type { Camera, MapConfig, Point } from '../types'
import { TILE_TYPES } from '../constants/tiles'

interface RenderOptions {
  canvas: HTMLCanvasElement
  camera: Camera
  mapData: number[][]
  config: MapConfig
  rectSelection?: {
    start: Point | null
    end: Point | null
  }
}

export function renderCanvas({
  canvas,
  camera,
  mapData,
  config,
  rectSelection,
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
      const tileDef = TILE_TYPES[tileId] || TILE_TYPES[0]

      ctx.fillStyle = tileDef.color
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

  if (rectSelection?.start && rectSelection?.end) {
    const { start, end } = rectSelection
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2 / camera.zoom
    ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom])
    ctx.strokeRect(
      minX * config.tileSize,
      minY * config.tileSize,
      (maxX - minX + 1) * config.tileSize,
      (maxY - minY + 1) * config.tileSize
    )
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
    ctx.fillRect(
      minX * config.tileSize,
      minY * config.tileSize,
      (maxX - minX + 1) * config.tileSize,
      (maxY - minY + 1) * config.tileSize
    )
  }

  ctx.restore()
}
