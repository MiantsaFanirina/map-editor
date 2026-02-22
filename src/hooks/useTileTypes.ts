import { useState, useEffect, useCallback } from 'react'

export interface CustomTileType {
  id: number
  color: string
  label: string
}

const DEFAULT_TILES: CustomTileType[] = [
  { id: 0, color: '#4ade80', label: 'Grass' },
]

const STORAGE_KEY = 'mapEditorTileTypes'

export function useTileTypes(initialValue?: string) {
  const [tileTypes, setTileTypes] = useState<CustomTileType[]>(() => {
    if (initialValue) {
      try {
        return JSON.parse(initialValue)
      } catch {
        // continue to localStorage fallback
      }
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_TILES
      }
    }
    return DEFAULT_TILES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tileTypes))
  }, [tileTypes])

  const addTileType = useCallback((color: string, label: string) => {
    setTileTypes(prev => {
      const maxId = prev.length > 0 ? Math.max(...prev.map(t => t.id)) : 0
      return [...prev, { id: maxId + 1, color, label }]
    })
  }, [])

  const updateTileType = useCallback((id: number, color: string, label: string) => {
    setTileTypes(prev => prev.map(t => t.id === id ? { ...t, color, label } : t))
  }, [])

  const removeTileType = useCallback((id: number) => {
    if (id === 0) return
    setTileTypes(prev => prev.filter(t => t.id !== id))
  }, [])

  const resetToDefault = useCallback(() => {
    setTileTypes(DEFAULT_TILES)
  }, [])

  const getTileColor = useCallback((id: number): string => {
    return tileTypes.find(t => t.id === id)?.color || '#4ade80'
  }, [tileTypes])

  const getTileLabel = useCallback((id: number): string => {
    return tileTypes.find(t => t.id === id)?.label || 'Unknown'
  }, [tileTypes])

  return {
    tileTypes,
    addTileType,
    updateTileType,
    removeTileType,
    resetToDefault,
    getTileColor,
    getTileLabel,
  }
}

export function tileTypesToExport(tileTypes: CustomTileType[]): string {
  return tileTypes.map(t => `${t.id}:${t.color}:${t.label}`).join('\n')
}

export function tileTypesFromExport(content: string): CustomTileType[] {
  try {
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [id, color, label] = line.split(':')
        return { id: parseInt(id), color, label }
      })
      .sort((a, b) => a.id - b.id)
  } catch {
    return DEFAULT_TILES
  }
}
