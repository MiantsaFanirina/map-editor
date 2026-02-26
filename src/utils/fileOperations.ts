export interface ImportedMapData {
  rows: number
  cols: number
  data: number[][]
  tileTypes?: string
}

export function importFromTxt(content: string): ImportedMapData | null {
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
