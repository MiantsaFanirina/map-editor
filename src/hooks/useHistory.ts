import { useState, useCallback } from 'react'
import { MAX_HISTORY } from '../constants/tiles'

export function useHistory(_initialMap: number[][]) {
  const [history, setHistory] = useState<number[][][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = useCallback((newMap: number[][]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newMap.map(row => [...row]))
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [historyIndex])

  const undo = useCallback((): number[][] | null => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      return history[historyIndex - 1].map(row => [...row])
    }
    return null
  }, [history, historyIndex])

  const redo = useCallback((): number[][] | null => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      return history[historyIndex + 1].map(row => [...row])
    }
    return null
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
