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

export { importFromTxt, exportToTxt } from './fileOperations'
export type { ImportedMapData } from './fileOperations'
