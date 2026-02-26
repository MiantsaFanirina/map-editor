import { useState, useCallback, useRef } from 'react'
import { MAX_HISTORY } from '../constants/tiles'

export function useHistory(initialMap: number[][]) {
  const [, setTick] = useState(0)
  const historyRef = useRef<number[][][]>([initialMap.map(row => [...row])])
  const historyIndexRef = useRef(0)
  const isActionInProgress = useRef(false)
  const initialMapRef = useRef<number[][] | null>(null)
  
  const forceUpdate = useCallback(() => {
    setTick(t => t + 1)
  }, [])
  
  const startAction = useCallback((currentMap: number[][]) => {
    if (isActionInProgress.current) return
    isActionInProgress.current = true
    initialMapRef.current = currentMap.map(row => [...row])
  }, [])
  
  const endAction = useCallback((finalMap: number[][]) => {
    if (!isActionInProgress.current || !initialMapRef.current) {
      isActionInProgress.current = false
      return
    }
    
    const hasChanged = JSON.stringify(initialMapRef.current) !== JSON.stringify(finalMap)
    isActionInProgress.current = false
    initialMapRef.current = null
    
    if (!hasChanged) return
    
    const currentIndex = historyIndexRef.current
    historyRef.current = historyRef.current.slice(0, currentIndex + 1)
    historyRef.current.push(finalMap.map(row => [...row]))
    
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    } else {
      historyIndexRef.current++
    }
    forceUpdate()
  }, [forceUpdate])

  const undo = useCallback((): number[][] | null => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      forceUpdate()
      return historyRef.current[historyIndexRef.current]?.map(row => [...row]) || null
    }
    return null
  }, [forceUpdate])

  const redo = useCallback((): number[][] | null => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      forceUpdate()
      return historyRef.current[historyIndexRef.current]?.map(row => [...row]) || null
    }
    return null
  }, [forceUpdate])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  return {
    startAction,
    endAction,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
