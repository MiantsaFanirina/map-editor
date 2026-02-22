import type { Point, Camera, MapConfig } from '../types'
import type { SelectionShape } from '../constants/tiles'

export function screenToWorld(screenX: number, screenY: number, camera: Camera): Point {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  }
}

export function worldToTile(worldX: number, worldY: number, tileSize: number): Point {
  return {
    x: Math.floor(worldX / tileSize),
    y: Math.floor(worldY / tileSize),
  }
}

export function isValidTile(tileX: number, tileY: number, config: MapConfig): boolean {
  return tileX >= 0 && tileX < config.cols && tileY >= 0 && tileY < config.rows
}

export function generatePreviewText(mapData: number[][]): string {
  return mapData.map(row => row.join(' ')).join('\n')
}

export function downloadMap(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getTilesInShape(
  start: Point,
  end: Point,
  shape: SelectionShape,
  config: MapConfig
): Point[] {
  const tiles: Point[] = []
  
  const minX = Math.min(start.x, end.x)
  const maxX = Math.max(start.x, end.x)
  const minY = Math.min(start.y, end.y)
  const maxY = Math.max(start.y, end.y)
  
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const radiusX = (maxX - minX) / 2
  const radiusY = (maxY - minY) / 2
  
  if (shape === 'fill') {
    for (let y = 0; y < config.rows; y++) {
      for (let x = 0; x < config.cols; x++) {
        tiles.push({ x, y })
      }
    }
    return tiles
  }
  
  if (shape === 'line') {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const steps = Math.max(Math.abs(dx), Math.abs(dy))
    
    if (steps === 0) {
      if (isValidTile(start.x, start.y, config)) {
        tiles.push({ x: start.x, y: start.y })
      }
      return tiles
    }
    
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps
      const x = Math.round(start.x + dx * t)
      const y = Math.round(start.y + dy * t)
      if (isValidTile(x, y, config)) {
        tiles.push({ x, y })
      }
    }
    return tiles
  }
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!isValidTile(x, y, config)) continue
      
      let inShape = false
      
      if (shape === 'rectangle') {
        inShape = true
      }
      else if (shape === 'circle') {
        const nx = radiusX > 0 ? (x - centerX) / radiusX : 0
        const ny = radiusY > 0 ? (y - centerY) / radiusY : 0
        inShape = (nx * nx + ny * ny) <= 1
      }
      else if (shape === 'triangle') {
        const nx = (x - minX) / (maxX - minX || 1)
        const ny = (y - minY) / (maxY - minY || 1)
        
        if (start.x <= end.x) {
          inShape = ny <= 1 - nx
        } else {
          inShape = ny <= nx
        }
      }
      
      if (inShape) {
        tiles.push({ x, y })
      }
    }
  }
  
  return tiles
}

export function fillTriangleWithPoints(p1: Point, p2: Point, p3: Point, config: MapConfig): Point[] {
  const tiles: Point[] = []
  
  const minX = Math.min(p1.x, p2.x, p3.x)
  const maxX = Math.max(p1.x, p2.x, p3.x)
  const minY = Math.min(p1.y, p2.y, p3.y)
  const maxY = Math.max(p1.y, p2.y, p3.y)
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!isValidTile(x, y, config)) continue
      
      if (isPointInTriangle(x, y, p1, p2, p3)) {
        tiles.push({ x, y })
      }
    }
  }
  
  return tiles
}

function isPointInTriangle(px: number, py: number, p1: Point, p2: Point, p3: Point): boolean {
  const d1 = sign(px, py, p1.x, p1.y, p2.x, p2.y)
  const d2 = sign(px, py, p2.x, p2.y, p3.x, p3.y)
  const d3 = sign(px, py, p3.x, p3.y, p1.x, p1.y)
  
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)
  
  return !(hasNeg && hasPos)
}

function sign(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2)
}
