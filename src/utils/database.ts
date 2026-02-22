export interface SavedMap {
  id: number
  name: string
  rows: number
  cols: number
  tileSize: number
  data: number[][]
  tileTypes?: string
  createdAt: string
  updatedAt: string
}

const CURRENT_SESSION_KEY = 'mapEditorCurrentSession'

export interface CurrentSession {
  config: { rows: number; cols: number; tileSize: number }
  data: number[][]
  tileTypes: string
  savedMapId?: number
  savedAt: string
}

let maps: SavedMap[] = []
let nextId = 1

export function initDatabase(): Promise<void> {
  const saved = localStorage.getItem('mapEditorMaps')
  if (saved) {
    try {
      maps = JSON.parse(saved)
      nextId = Math.max(0, ...maps.map(m => m.id)) + 1
    } catch {
      maps = []
      nextId = 1
    }
  }
  return Promise.resolve()
}

function saveToStorage() {
  localStorage.setItem('mapEditorMaps', JSON.stringify(maps))
}

export function saveCurrentSession(config: { rows: number; cols: number; tileSize: number }, data: number[][], tileTypes: string, savedMapId?: number) {
  const session: CurrentSession = {
    config,
    data,
    tileTypes,
    savedMapId,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session))
}

export function getCurrentSession(): CurrentSession | null {
  const saved = localStorage.getItem(CURRENT_SESSION_KEY)
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

export function clearCurrentSession() {
  localStorage.removeItem(CURRENT_SESSION_KEY)
}

export function saveMap(name: string, rows: number, cols: number, tileSize: number, mapData: number[][], tileTypes?: string, updateId?: number): number {
  if (updateId) {
    const existing = maps.find(m => m.id === updateId)
    if (existing) {
      existing.rows = rows
      existing.cols = cols
      existing.tileSize = tileSize
      existing.data = mapData
      existing.tileTypes = tileTypes
      existing.updatedAt = new Date().toISOString()
      saveToStorage()
      return existing.id
    }
  }
  
  const existing = maps.find(m => m.name === name)
  if (existing) {
    existing.rows = rows
    existing.cols = cols
    existing.tileSize = tileSize
    existing.data = mapData
    existing.tileTypes = tileTypes
    existing.updatedAt = new Date().toISOString()
    saveToStorage()
    return existing.id
  }
  
  const id = nextId++
  const newMap: SavedMap = {
    id,
    name,
    rows,
    cols,
    tileSize,
    data: mapData,
    tileTypes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  maps.push(newMap)
  saveToStorage()
  return id
}

export function loadMap(id: number): SavedMap | null {
  return maps.find(m => m.id === id) || null
}

export function getAllMaps(): SavedMap[] {
  return [...maps].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function deleteMap(id: number): void {
  maps = maps.filter(m => m.id !== id)
  saveToStorage()
}

export function importFromTxt(content: string): { rows: number; cols: number; data: number[][]; tileTypes?: string } | null {
  try {
    const lines = content.trim().split('\n')
    if (lines.length === 0) return null
    
    let tileTypes: string | undefined
    let mapStartIndex = 0
    
    const mapStartLine = lines.findIndex((line, i) => {
      if (line.trim() === 'MAP') {
        mapStartIndex = i + 1
        return true
      }
      return false
    })
    
    if (mapStartLine >= 0) {
      const tilesLine = lines.findIndex((line, i) => i > mapStartLine && line.trim() === 'TILES')
      if (tilesLine >= 0) {
        tileTypes = lines.slice(tilesLine + 1).join('\n')
      }
      const mapLines = lines.slice(mapStartIndex, tilesLine >= 0 ? tilesLine : undefined)
        .filter(line => line.trim().length > 0)
        .filter(line => line.trim().split(/\s+/).some(n => n !== '0'))
      const data = mapLines.map(line => line.trim().split(/\s+/).map(Number))
      const rows = data.length
      const maxCols = Math.max(0, ...data.map(row => row.length))
      const normalizedData = data.map(row => {
        const padded = [...row]
        while (padded.length < maxCols) {
          padded.push(0)
        }
        return padded
      })
      return { rows, cols: maxCols, data: normalizedData, tileTypes }
    }
    
    const mapLines = lines
      .filter(line => line.trim().length > 0)
      .filter(line => line.trim().split(/\s+/).some(n => n !== '0'))
    const data = mapLines.map(line => line.trim().split(/\s+/).map(Number))
    const rows = data.length
    const maxCols = Math.max(0, ...data.map(row => row.length))
    const normalizedData = data.map(row => {
      const padded = [...row]
      while (padded.length < maxCols) {
        padded.push(0)
      }
      return padded
    })
    
    return { rows, cols: maxCols, data: normalizedData }
  } catch {
    return null
  }
}

export function exportToTxt(mapData: number[][]): string {
  return mapData.map(row => row.join(' ')).join('\n')
}
