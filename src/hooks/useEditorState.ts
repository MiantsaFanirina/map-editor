import { useState, useCallback, useEffect } from 'react'
import type { MapConfig } from '../types'
import type { SelectionShape } from '../constants/tiles'
import { useHistory } from './useHistory'
import { useTileTypes } from './useTileTypes'
import { saveCurrentSession } from '../utils/database'

interface UseEditorStateOptions {
  config: MapConfig
  initialData?: number[][] | null
  initialTileTypes?: string | null
}

interface UseEditorStateReturn {
  mapData: number[][]
  setMapData: React.Dispatch<React.SetStateAction<number[][]>>
  selectedTile: number
  setSelectedTile: (id: number) => void
  selectedShape: SelectionShape
  setSelectedShape: (shape: SelectionShape) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  tileTypes: ReturnType<typeof useTileTypes>['tileTypes']
  addTileType: ReturnType<typeof useTileTypes>['addTileType']
  updateTileType: ReturnType<typeof useTileTypes>['updateTileType']
  removeTileType: ReturnType<typeof useTileTypes>['removeTileType']
  getTileColor: ReturnType<typeof useTileTypes>['getTileColor']
  getTileImage: ReturnType<typeof useTileTypes>['getTileImage']
  startAction: (currentMap: number[][]) => void
  endAction: (finalMap: number[][]) => void
}

export function useEditorState(options: UseEditorStateOptions): UseEditorStateReturn {
  const { config, initialData, initialTileTypes } = options
  
  const [mapData, setMapData] = useState<number[][]>(() => 
    initialData || Array(config.rows).fill(null).map(() => Array(config.cols).fill(0))
  )
  
  const { startAction, endAction, undo, redo, canUndo, canRedo } = useHistory(mapData)
  const tileTypesHook = useTileTypes(initialTileTypes)
  
  const [selectedTile, setSelectedTile] = useState<number>(0)
  const [selectedShape, setSelectedShape] = useState<SelectionShape>('rectangle')

  const handleUndo = useCallback(() => {
    const restored = undo()
    if (restored) setMapData(restored)
  }, [undo])

  const handleRedo = useCallback(() => {
    const restored = redo()
    if (restored) setMapData(restored)
  }, [redo])

  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentSession(config, mapData, JSON.stringify(tileTypesHook.tileTypes))
    }, 1000)
    return () => clearTimeout(timer)
  }, [config, mapData, tileTypesHook.tileTypes])

  return {
    mapData,
    setMapData,
    selectedTile,
    setSelectedTile,
    selectedShape,
    setSelectedShape,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    tileTypes: tileTypesHook.tileTypes,
    addTileType: tileTypesHook.addTileType,
    updateTileType: tileTypesHook.updateTileType,
    removeTileType: tileTypesHook.removeTileType,
    getTileColor: tileTypesHook.getTileColor,
    getTileImage: tileTypesHook.getTileImage,
    startAction,
    endAction,
  }
}
