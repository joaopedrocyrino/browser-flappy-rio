export type State = 'start' | 'playing' | 'paused' | 'gameover'

export type Pipe = { x: number; gapY: number; passed: boolean }

export type BondinhoLine = {
    startX: number
    startY: number
    endX: number
    endY: number
}