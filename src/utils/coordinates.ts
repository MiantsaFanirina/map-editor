import type { Point, Camera, MapConfig } from '../types'

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
