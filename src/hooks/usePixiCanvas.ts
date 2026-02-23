import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import type { MapConfig, Camera, Point } from '../types'
import type { SelectionShape } from '../constants/tiles'

interface UsePixiCanvasOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  camera: Camera
  mapData: number[][]
  config: MapConfig
  selection?: { start: Point; end: Point; shape: SelectionShape } | undefined
  trianglePoints: Point[]
  getTileColor: (id: number) => string
  getTileImage?: (id: number) => string | undefined
  mouseTile?: { x: number; y: number } | null
}

const GRID_LINE_EVERY = 5

export function usePixiCanvas(options: UsePixiCanvasOptions) {
  const { containerRef, camera, mapData, config, selection, getTileColor, getTileImage } = options
  const appRef = useRef<PIXI.Application | null>(null)
  const mapContainerRef = useRef<PIXI.Container | null>(null)
  const gridContainerRef = useRef<PIXI.Container | null>(null)
  const selectionContainerRef = useRef<PIXI.Container | null>(null)
  const textureCacheRef = useRef<Map<string, PIXI.Texture>>(new Map())
  const lastMapRef = useRef<string>('')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    console.log('usePixiCanvas: container size', container.clientWidth, container.clientHeight)

    let app: PIXI.Application
    let mapContainer: PIXI.Container
    let gridContainer: PIXI.Container
    let selectionContainer: PIXI.Container

    const init = async () => {
      try {
        console.log('usePixiCanvas: initializing PixiJS')
        app = new PIXI.Application()
        await app.init({ 
          width: container.clientWidth || 800, 
          height: container.clientHeight || 600,
          background: '#111111',
          antialias: true
        })
        console.log('usePixiCanvas: PixiJS initialized')
        appRef.current = app

      mapContainer = new PIXI.Container()
      gridContainer = new PIXI.Container()
      selectionContainer = new PIXI.Container()

      mapContainerRef.current = mapContainer
      gridContainerRef.current = gridContainer
      selectionContainerRef.current = selectionContainer

      app.stage.addChild(mapContainer)
      app.stage.addChild(gridContainer)
      app.stage.addChild(selectionContainer)

      container.appendChild(app.canvas as HTMLCanvasElement)

      const resizeObserver = new ResizeObserver(() => {
        app.renderer.resize(container.clientWidth, container.clientHeight)
        render()
      })
      resizeObserver.observe(container)

      let frameId: number
      const loop = () => {
        render()
        frameId = requestAnimationFrame(loop)
      }
      loop()

      return () => {
        cancelAnimationFrame(frameId)
        resizeObserver.disconnect()
        app.destroy(true, { children: true, texture: false })
      }
      } catch (err) {
        console.error('usePixiCanvas: init failed', err)
      }
    }

    const render = () => {
      if (!appRef.current || !mapContainerRef.current || !gridContainerRef.current || !selectionContainerRef.current) return

      const mapContainer = mapContainerRef.current
      const gridContainer = gridContainerRef.current
      const selectionContainer = selectionContainerRef.current

      mapContainer.position.set(camera.x, camera.y)
      mapContainer.scale.set(camera.zoom)
      gridContainer.position.set(camera.x, camera.y)
      gridContainer.scale.set(camera.zoom)
      selectionContainer.position.set(camera.x, camera.y)
      selectionContainer.scale.set(camera.zoom)

      const mapKey = JSON.stringify(mapData)
      if (mapKey !== lastMapRef.current) {
        lastMapRef.current = mapKey

        mapContainer.removeChildren()

        const visibleLeft = -camera.x / camera.zoom
        const visibleTop = -camera.y / camera.zoom
        const visibleWidth = container.clientWidth / camera.zoom
        const visibleHeight = container.clientHeight / camera.zoom

        const startTileX = Math.max(0, Math.floor(visibleLeft / config.tileSize))
        const endTileX = Math.min(config.cols - 1, Math.ceil((visibleLeft + visibleWidth) / config.tileSize))
        const startTileY = Math.max(0, Math.floor(visibleTop / config.tileSize))
        const endTileY = Math.min(config.rows - 1, Math.ceil((visibleTop + visibleHeight) / config.tileSize))

        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
          for (let tileX = startTileX; tileX <= endTileX; tileX++) {
            const tileId = mapData[tileY]?.[tileX] ?? 0
            const imageUrl = getTileImage?.(tileId)

            const sprite = new PIXI.Sprite()
            sprite.x = tileX * config.tileSize
            sprite.y = tileY * config.tileSize
            sprite.width = config.tileSize
            sprite.height = config.tileSize

            if (imageUrl) {
              let texture = textureCacheRef.current.get(imageUrl)
              if (!texture) {
                PIXI.Assets.load(imageUrl).then((bitmap) => {
                  texture = PIXI.Texture.from(bitmap as any)
                  textureCacheRef.current.set(imageUrl!, texture!)
                  sprite.texture = texture!
                })
              } else {
                sprite.texture = texture
              }
            } else {
              const color = getTileColor(tileId)
              sprite.tint = parseInt(color.replace('#', ''), 16)
            }

            mapContainer.addChild(sprite)
          }
        }
      }

      gridContainer.removeChildren()

      if (camera.zoom >= 0.3) {
        const visibleLeft = -camera.x / camera.zoom
        const visibleTop = -camera.y / camera.zoom
        const visibleWidth = container.clientWidth / camera.zoom
        const visibleHeight = container.clientHeight / camera.zoom

        const startCol = Math.floor(visibleLeft / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY
        const endCol = Math.ceil((visibleLeft + visibleWidth) / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY
        const startRow = Math.floor(visibleTop / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY
        const endRow = Math.ceil((visibleTop + visibleHeight) / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY

        const graphics = new PIXI.Graphics()

        for (let x = startCol; x <= endCol; x += GRID_LINE_EVERY) {
          const isMajor = x % (GRID_LINE_EVERY * 2) === 0
          graphics.lineStyle(1 / camera.zoom, isMajor ? 0.4 : 0.15)
          graphics.moveTo(x * config.tileSize, startRow * config.tileSize)
          graphics.lineTo(x * config.tileSize, endRow * config.tileSize)
        }

        for (let y = startRow; y <= endRow; y += GRID_LINE_EVERY) {
          const isMajor = y % (GRID_LINE_EVERY * 2) === 0
          graphics.lineStyle(1 / camera.zoom, isMajor ? 0.4 : 0.15)
          graphics.moveTo(startCol * config.tileSize, y * config.tileSize)
          graphics.lineTo(endCol * config.tileSize, y * config.tileSize)
        }

        gridContainer.addChild(graphics)
      }

      selectionContainer.removeChildren()

      if (selection?.start && selection?.end) {
        const { start, end, shape } = selection
        const minX = Math.min(start.x, end.x)
        const maxX = Math.max(start.x, end.x)
        const minY = Math.min(start.y, end.y)
        const maxY = Math.max(start.y, end.y)

        const graphics = new PIXI.Graphics()

        if (shape === 'rectangle') {
          const width = (maxX - minX + 1) * config.tileSize
          const height = (maxY - minY + 1) * config.tileSize
          graphics.rect(minX * config.tileSize, minY * config.tileSize, width, height)
          graphics.fill({ color: 0xFBBF24, alpha: 0.3 })
          graphics.stroke({ width: 2 / camera.zoom, color: 0xFBBF24 })
        } else if (shape === 'fill') {
          graphics.rect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)
          graphics.fill({ color: 0xFBBF24, alpha: 0.15 })
          graphics.stroke({ width: 2 / camera.zoom, color: 0xFBBF24 })
        }

        selectionContainer.addChild(graphics)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (!appRef.current) return

    const container = containerRef.current
    if (!container) return

    const mapContainer = mapContainerRef.current
    const gridContainer = gridContainerRef.current
    const selectionContainer = selectionContainerRef.current

    if (!mapContainer || !gridContainer || !selectionContainer) return

    mapContainer.position.set(camera.x, camera.y)
    mapContainer.scale.set(camera.zoom)
    gridContainer.position.set(camera.x, camera.y)
    gridContainer.scale.set(camera.zoom)
    selectionContainer.position.set(camera.x, camera.y)
    selectionContainer.scale.set(camera.zoom)

    const mapKey = JSON.stringify(mapData)
    if (mapKey !== lastMapRef.current) {
      lastMapRef.current = mapKey

      mapContainer.removeChildren()

      const visibleLeft = -camera.x / camera.zoom
      const visibleTop = -camera.y / camera.zoom
      const visibleWidth = container.clientWidth / camera.zoom
      const visibleHeight = container.clientHeight / camera.zoom

      const startTileX = Math.max(0, Math.floor(visibleLeft / config.tileSize))
      const endTileX = Math.min(config.cols - 1, Math.ceil((visibleLeft + visibleWidth) / config.tileSize))
      const startTileY = Math.max(0, Math.floor(visibleTop / config.tileSize))
      const endTileY = Math.min(config.rows - 1, Math.ceil((visibleTop + visibleHeight) / config.tileSize))

      for (let tileY = startTileY; tileY <= endTileY; tileY++) {
        for (let tileX = startTileX; tileX <= endTileX; tileX++) {
          const tileId = mapData[tileY]?.[tileX] ?? 0
          const imageUrl = getTileImage?.(tileId)

          const sprite = new PIXI.Sprite()
          sprite.x = tileX * config.tileSize
          sprite.y = tileY * config.tileSize
          sprite.width = config.tileSize
          sprite.height = config.tileSize

          if (imageUrl) {
            let texture = textureCacheRef.current.get(imageUrl)
            if (!texture) {
              PIXI.Assets.load(imageUrl).then((bitmap) => {
                texture = PIXI.Texture.from(bitmap as any)
                textureCacheRef.current.set(imageUrl!, texture!)
                sprite.texture = texture!
              })
            } else {
              sprite.texture = texture
            }
          } else {
            const color = getTileColor(tileId)
            sprite.tint = parseInt(color.replace('#', ''), 16)
          }

          mapContainer.addChild(sprite)
        }
      }
    }

    gridContainer.removeChildren()

    if (camera.zoom >= 0.3) {
      const visibleLeft = -camera.x / camera.zoom
      const visibleTop = -camera.y / camera.zoom
      const visibleWidth = container.clientWidth / camera.zoom
      const visibleHeight = container.clientHeight / camera.zoom

      const startCol = Math.floor(visibleLeft / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY
      const endCol = Math.ceil((visibleLeft + visibleWidth) / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY
      const startRow = Math.floor(visibleTop / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY
      const endRow = Math.ceil((visibleTop + visibleHeight) / config.tileSize / GRID_LINE_EVERY) * GRID_LINE_EVERY

      const graphics = new PIXI.Graphics()

      for (let x = startCol; x <= endCol; x += GRID_LINE_EVERY) {
        const isMajor = x % (GRID_LINE_EVERY * 2) === 0
        graphics.lineStyle(1 / camera.zoom, 0xFFFFFF, isMajor ? 0.4 : 0.15)
        graphics.moveTo(x * config.tileSize, startRow * config.tileSize)
        graphics.lineTo(x * config.tileSize, endRow * config.tileSize)
      }

      for (let y = startRow; y <= endRow; y += GRID_LINE_EVERY) {
        const isMajor = y % (GRID_LINE_EVERY * 2) === 0
        graphics.lineStyle(1 / camera.zoom, 0xFFFFFF, isMajor ? 0.4 : 0.15)
        graphics.moveTo(startCol * config.tileSize, y * config.tileSize)
        graphics.lineTo(endCol * config.tileSize, y * config.tileSize)
      }

      gridContainer.addChild(graphics)
    }

    selectionContainer.removeChildren()

    if (selection?.start && selection?.end) {
      const { start, end, shape } = selection
      const minX = Math.min(start.x, end.x)
      const maxX = Math.max(start.x, end.x)
      const minY = Math.min(start.y, end.y)
      const maxY = Math.max(start.y, end.y)

      const graphics = new PIXI.Graphics()

      if (shape === 'rectangle') {
        const width = (maxX - minX + 1) * config.tileSize
        const height = (maxY - minY + 1) * config.tileSize
        graphics.rect(minX * config.tileSize, minY * config.tileSize, width, height)
        graphics.fill({ color: 0xFBBF24, alpha: 0.3 })
        graphics.stroke({ width: 2 / camera.zoom, color: 0xFBBF24 })
      } else if (shape === 'fill') {
        graphics.rect(0, 0, config.cols * config.tileSize, config.rows * config.tileSize)
        graphics.fill({ color: 0xFBBF24, alpha: 0.15 })
        graphics.stroke({ width: 2 / camera.zoom, color: 0xFBBF24 })
      }

      selectionContainer.addChild(graphics)
    }
  }, [camera, mapData, config, selection, getTileColor, getTileImage])
}
