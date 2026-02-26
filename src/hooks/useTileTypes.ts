import { useState, useEffect, useCallback } from 'react'

export interface CustomTileType {
  id: number
  color: string
  label: string
  image?: string
}

const DEFAULT_TILES: CustomTileType[] = [
  { id: 0, color: '#374151', label: 'Empty' },
]

const STORAGE_KEY = 'mapEditorTileTypes'

export function useTileTypes(initialValue?: string | null) {
  const [tileTypes, setTileTypes] = useState<CustomTileType[]>(() => {
    if (initialValue !== undefined && initialValue !== null) {
      try {
        return tileTypesFromExport(initialValue)
      } catch {
        try {
          return JSON.parse(initialValue)
        } catch {
          // continue to default
        }
      }
    }
    return DEFAULT_TILES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tileTypes))
  }, [tileTypes])

  const addTileType = useCallback((color: string, label: string, image?: string, id?: number) => {
    setTileTypes(prev => {
      const maxId = prev.length > 0 ? Math.max(...prev.map(t => t.id)) : 0
      return [...prev, { id: id ?? maxId + 1, color, label, image }]
    })
  }, [])

  const updateTileType = useCallback((id: number, color: string, label: string, image?: string) => {
    setTileTypes(prev => prev.map(t => t.id === id ? { ...t, color, label, image } : t))
  }, [])

  const removeTileType = useCallback((id: number) => {
    if (id === 0) return
    setTileTypes(prev => prev.filter(t => t.id !== id))
  }, [])

  const getTileColor = useCallback((id: number): string => {
    return tileTypes.find(t => t.id === id)?.color || '#1f2937'
  }, [tileTypes])

  const getTileImage = useCallback((id: number): string | undefined => {
    return tileTypes.find(t => t.id === id)?.image
  }, [tileTypes])

  return {
    tileTypes,
    addTileType,
    updateTileType,
    removeTileType,
    getTileColor,
    getTileImage,
  }
}

export function tileTypesToExport(tileTypes: CustomTileType[]): string {
  return tileTypes.map(t => {
    const base = `${t.id}:${t.color}:${t.label}`
    if (t.image) {
      return `${base}:${t.image}`
    }
    return base
  }).join('\n')
}

export function tileTypesFromExport(content: string): CustomTileType[] {
  try {
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const dataIndex = line.indexOf('data:')
        let id, color, label, image
        if (dataIndex > 0) {
          const beforeData = line.substring(0, dataIndex)
          const dataParts = beforeData.split(':')
          id = parseInt(dataParts[0])
          color = dataParts[1] || '#4ade80'
          label = dataParts[2] || 'Unknown'
          image = line.substring(dataIndex)
        } else {
          const parts = line.split(':')
          id = parseInt(parts[0])
          color = parts[1] || '#4ade80'
          label = parts[2] || 'Unknown'
          image = parts[3]
        }
        return { id, color, label, image }
      })
      .sort((a, b) => a.id - b.id)
  } catch {
    return DEFAULT_TILES
  }
}
