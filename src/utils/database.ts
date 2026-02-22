import initSqlJs, { type Database } from 'sql.js'

let db: Database | null = null
let initialized = false

export async function initDatabase(): Promise<void> {
  if (initialized) return
  
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  })
  
  const savedData = localStorage.getItem('mapEditorDB')
  if (savedData) {
    const data = Uint8Array.from(atob(savedData), c => c.charCodeAt(0))
    db = new SQL.Database(data)
  } else {
    db = new SQL.Database()
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS maps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rows INTEGER NOT NULL,
      cols INTEGER NOT NULL,
      tileSize INTEGER NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  initialized = true
}

export function saveDatabase(): void {
  if (!db) return
  const data = db.export()
  const base64 = btoa(String.fromCharCode(...data))
  localStorage.setItem('mapEditorDB', base64)
}

export interface SavedMap {
  id: number
  name: string
  rows: number
  cols: number
  tileSize: number
  data: number[][]
  createdAt: string
  updatedAt: string
}

export function saveMap(name: string, rows: number, cols: number, tileSize: number, mapData: number[][]): number {
  if (!db) return -1
  
  const dataStr = JSON.stringify(mapData)
  
  const existing = db.exec(`SELECT id FROM maps WHERE name = '${name}'`)
  if (existing.length > 0 && existing[0].values.length > 0) {
    const id = existing[0].values[0][0] as number
    db.run(
      `UPDATE maps SET rows = ?, cols = ?, tileSize = ?, data = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [rows, cols, tileSize, dataStr, id]
    )
    saveDatabase()
    return id
  }
  
  db.run(
    `INSERT INTO maps (name, rows, cols, tileSize, data) VALUES (?, ?, ?, ?, ?)`,
    [name, rows, cols, tileSize, dataStr]
  )
  
  const result = db.exec(`SELECT last_insert_rowid()`)
  const id = result[0].values[0][0] as number
  saveDatabase()
  return id
}

export function loadMap(id: number): SavedMap | null {
  if (!db) return null
  
  const result = db.exec(`SELECT id, name, rows, cols, tileSize, data, createdAt, updatedAt FROM maps WHERE id = ${id}`)
  if (result.length === 0 || result[0].values.length === 0) return null
  
  const row = result[0].values[0]
  return {
    id: row[0] as number,
    name: row[1] as string,
    rows: row[2] as number,
    cols: row[3] as number,
    tileSize: row[4] as number,
    data: JSON.parse(row[5] as string),
    createdAt: row[6] as string,
    updatedAt: row[7] as string,
  }
}

export function getAllMaps(): SavedMap[] {
  if (!db) return []
  
  const result = db.exec(`SELECT id, name, rows, cols, tileSize, data, createdAt, updatedAt FROM maps ORDER BY updatedAt DESC`)
  if (result.length === 0) return []
  
  return result[0].values.map(row => ({
    id: row[0] as number,
    name: row[1] as string,
    rows: row[2] as number,
    cols: row[3] as number,
    tileSize: row[4] as number,
    data: JSON.parse(row[5] as string),
    createdAt: row[6] as string,
    updatedAt: row[7] as string,
  }))
}

export function deleteMap(id: number): void {
  if (!db) return
  db.run(`DELETE FROM maps WHERE id = ?`, [id])
  saveDatabase()
}

export function importFromTxt(content: string): { rows: number; cols: number; data: number[][] } | null {
  try {
    const lines = content.trim().split('\n')
    if (lines.length === 0) return null
    
    const data = lines.map(line => 
      line.trim().split(/\s+/).map(Number)
    )
    
    const rows = data.length
    const cols = data[0]?.length || 0
    
    return { rows, cols, data }
  } catch {
    return null
  }
}

export function exportToTxt(mapData: number[][]): string {
  return mapData.map(row => row.join(' ')).join('\n')
}
