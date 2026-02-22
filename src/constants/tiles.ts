export interface TileType {
  color: string
  label: string
}

export const TILE_TYPES: Record<number, TileType> = {
  0: { color: '#4ade80', label: 'Grass' },
  1: { color: '#374151', label: 'Wall' },
  2: { color: '#3b82f6', label: 'Water' },
  3: { color: '#a8a29e', label: 'Road' },
  4: { color: '#166534', label: 'Base Area' },
  5: { color: '#f9a8d4', label: 'Healing Area' },
  7: { color: '#92400e', label: 'Buildings' },
  8: { color: '#15803d', label: 'Trees' },
}

export const DEFAULT_TILE_SIZE = 48
export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3.0
export const ZOOM_SENSITIVITY = 0.001
export const MAX_HISTORY = 50
