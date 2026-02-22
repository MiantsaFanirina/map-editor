export interface MapConfig {
  rows: number
  cols: number
  tileSize: number
}

export interface Camera {
  x: number
  y: number
  zoom: number
}

export interface Point {
  x: number
  y: number
}

export interface HistoryState {
  mapData: number[][]
  index: number
}
