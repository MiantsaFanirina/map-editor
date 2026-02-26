export type SelectionShape = 'rectangle' | 'circle' | 'triangle' | 'line' | 'fill'

export const SELECTION_SHAPES: Record<SelectionShape, { label: string; icon: string }> = {
  rectangle: { label: 'Rectangle', icon: '▢' },
  circle: { label: 'Circle', icon: '◯' },
  triangle: { label: 'Triangle', icon: '△' },
  line: { label: 'Line', icon: '╱' },
  fill: { label: 'Fill All', icon: '▩' },
}

export const DEFAULT_TILE_SIZE = 48
export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3.0
export const ZOOM_SENSITIVITY = 0.001
export const MAX_HISTORY = 50
