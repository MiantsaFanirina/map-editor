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

export function fillPolygonWithPoints(points: Point[], config: MapConfig): Point[] {
  if (points.length < 3) return []
  
  const tiles: Point[] = []
  
  let minX = points[0].x
  let maxX = points[0].x
  let minY = points[0].y
  let maxY = points[0].y
  
  for (const p of points) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!isValidTile(x, y, config)) continue
      
      if (isPointInPolygon(x, y, points) || isPointOnPolygonEdge(x, y, points)) {
        tiles.push({ x, y })
      }
    }
  }
  
  return tiles
}

function isPointOnPolygonEdge(px: number, py: number, points: Point[]): boolean {
  const n = points.length
  for (let i = 0; i < n; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    if (isPointOnLine(px, py, p1.x, p1.y, p2.x, p2.y)) {
      return true
    }
  }
  return false
}

function isPointOnLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
  const tolerance = 0.1
  const dx = x2 - x1
  const dy = y2 - y1
  
  if (dx === 0 && dy === 0) {
    return px === x1 && py === y1
  }
  
  const t = (px - x1) / dx
  if (t < 0 || t > 1) return false
  
  const expectedY = y1 + t * dy
  const expectedX = x1 + t * dx
  
  return Math.abs(py - expectedY) <= tolerance && Math.abs(px - expectedX) <= tolerance
}

export function floodFill(startX: number, startY: number, mapData: number[][], config: MapConfig): Point[] {
  const targetTile = mapData[startY]?.[startX]
  if (targetTile === undefined) return []
  
  const filled: Point[] = []
  const visited = new Set<string>()
  const stack: Point[] = [{ x: startX, y: startY }]
  
  while (stack.length > 0) {
    const { x, y } = stack.pop()!
    const key = `${x},${y}`
    
    if (visited.has(key)) continue
    if (!isValidTile(x, y, config)) continue
    if (mapData[y][x] !== targetTile) continue
    
    visited.add(key)
    filled.push({ x, y })
    
    stack.push({ x: x + 1, y })
    stack.push({ x: x - 1, y })
    stack.push({ x, y: y + 1 })
    stack.push({ x, y: y - 1 })
  }
  
  return filled
}

function isPointInPolygon(px: number, py: number, points: Point[]): boolean {
  let inside = false
  const n = points.length
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = points[i].x, yi = points[i].y
    const xj = points[j].x, yj = points[j].y
    
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}
