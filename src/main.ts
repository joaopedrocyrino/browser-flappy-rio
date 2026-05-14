import {
  drawAraraAzul,
  drawPalmTree,
  drawBondinho,
  drawPausedOverlay,
  drawStartOverlay,
  drawGameOverOverlay,
  drawBlockScreen,
  drawHUD,
  drawPipe,
  drawMountains,
  drawCloud,
  drawOcean,
  drawGround,
  drawSky
} from './portinari';
import type { State, Pipe, BondinhoLine } from './types'

const GRAVITY = 0.42
const JUMP_VELOCITY = -8
const MAX_FALL_SPEED = 12

const BIRD_X_RATIO = 0.22 // bird sits 22% from the left edge regardless of width
const ARARA_SIZE = 90
const ARARA_RADIUS = 18

const PIPE_WIDTH = 70
const PIPE_GAP = 190 // vertical gap between top + bottom pipe
const PIPE_SPEED = 2.8
const PIPE_INTERVAL_MS = 1500
const PIPE_MIN_MARGIN = 80

const GROUND_HEIGHT = 80
const FIXED_TIMESTEP = 1 / 60
const MAX_FIXED_STEPS = 4
const PALM_SPACING = 280
const PALM_OFFSETS = [-50, 230, 510, 790]

// Below these dimensions in CSS px, the game refuses to run. Phone in
// portrait is fine; phone in landscape is intentionally rejected since
// the vertical-gap mechanic needs height.
const MIN_W = 320
const MIN_H = 480

const HIGH_KEY = 'flappy-rio:high'

const canvas = document.getElementById('game') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

/**
 * This is for creating some of the images that repeat a lot only once
 * and use it across the game
 */
const backgroundCanvas = document.createElement('canvas')
const backgroundCtx = backgroundCanvas.getContext('2d')!

const araraCanvas = document.createElement('canvas')
const araraCtx = araraCanvas.getContext('2d')!

const bondinhoCanvas = document.createElement('canvas')
const bondinhoCtx = bondinhoCanvas.getContext('2d')!

const palmTreeCanvas = document.createElement('canvas')
const palmTreeCtx = palmTreeCanvas.getContext('2d')!

const isTouch = window.matchMedia('(pointer: coarse)').matches

const OVERLAY: Record<State, (context: CanvasRenderingContext2D, w: number, h: number, isTouch: boolean, score: number, highScore: number) => void> = {
  playing: () => { },
  start: drawStartOverlay,
  paused: drawPausedOverlay,
  gameover: drawGameOverOverlay
}

let W = 0
let H = 0
let blocked = false
let bondinhoLine: BondinhoLine = { startX: 0, startY: 0, endX: 0, endY: 0 }

let bondinhoScale = 1
let bondinhoW = 0
let bondinhoH = 0

const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

function resize() {
  const vw = window.innerWidth
  const vh = window.innerHeight

  W = vw
  H = vh
  blocked = vw < MIN_W || vh < MIN_H

  // Backing store at device resolution for crispness, CSS size at viewport.
  canvas.width = Math.round(vw * dpr)
  canvas.height = Math.round(vh * dpr)
  canvas.style.width = vw + 'px'
  canvas.style.height = vh + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = true

  // Re-clamp bird if viewport shrank under it.
  if (birdY > H - GROUND_HEIGHT - ARARA_RADIUS) {
    birdY = H - GROUND_HEIGHT - ARARA_RADIUS
  }

  buildBackgroundCache()

  // If we shrank under the min and a game was running, soft-pause it.
  if (blocked && state === 'playing') state = 'paused'
}

// ─── State ──────────────────────────────────────────────────────────────

let birdY = 0
let birdVy = 0
let birdAngle = 0

let pipes: Pipe[] = []
let lastPipeAt = 0

let score = 0
let highScore = readHighScore()

let state: State = 'start'
let lastFrame = 0
let updateAccumulator = 0

function readHighScore() {
  try {
    return Number(localStorage.getItem(HIGH_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

function writeHighScore(value: number) {
  try {
    localStorage.setItem(HIGH_KEY, String(value))
  } catch {
    // High score persistence is optional; gameplay should continue if storage is blocked.
  }
}

function reset() {
  birdY = H / 2
  birdVy = 0
  birdAngle = 0
  pipes = []
  lastPipeAt = 0
  updateAccumulator = 0
  score = 0
}

// ─── Input ───────────────────────────────────────────────────────────────

function action() {
  if (state === 'playing')
    birdVy = JUMP_VELOCITY
  else if (state === 'paused')
    state = 'playing'
  else if (state === 'start' || state === 'gameover') {
    reset()
    state = 'playing'
    birdVy = JUMP_VELOCITY
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    action()
  } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    e.preventDefault()
    if (state === 'playing') state = 'paused'
    else if (state === 'paused') state = 'playing'
  }
})

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault()
  action()
}, { passive: false })

window.addEventListener('resize', resize)
const screenOrientation = window.screen.orientation as ScreenOrientation | undefined
if (screenOrientation) {
  screenOrientation.addEventListener('change', resize)
} else {
  window.addEventListener('orientationchange', resize)
}
resize()
birdY = H / 2 // initialize after first resize so we know H

// ─── Pipe spawning ───────────────────────────────────────────────────────

function spawnPipe() {
  const playArea = H - GROUND_HEIGHT
  const minGapY = PIPE_MIN_MARGIN + PIPE_GAP / 2
  const maxGapY = playArea - PIPE_MIN_MARGIN - PIPE_GAP / 2
  const gapY = minGapY + Math.random() * Math.max(1, maxGapY - minGapY)
  pipes.push({ x: W + PIPE_WIDTH, gapY, passed: false })
}

// ─── Tick ────────────────────────────────────────────────────────────────

function tick(dt: number) {
  const bx = W * BIRD_X_RATIO

  birdVy = Math.min(birdVy + GRAVITY * dt * 60, MAX_FALL_SPEED)
  birdY += birdVy * dt * 60

  const targetAngle = Math.max(-0.5, Math.min(1.2, birdVy / 10))
  birdAngle += (targetAngle - birdAngle) * 0.2

  if (birdY - ARARA_RADIUS < 0) {
    birdY = ARARA_RADIUS
    birdVy = 0
  }
  if (birdY + ARARA_RADIUS >= H - GROUND_HEIGHT) {
    birdY = H - GROUND_HEIGHT - ARARA_RADIUS
    state = 'gameover'
    return
  }

  for (const p of pipes) p.x -= PIPE_SPEED * dt * 60
  pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -10)

  for (const p of pipes) {
    if (!p.passed && p.x + PIPE_WIDTH < bx) {
      p.passed = true
      score++
      if (score > highScore) {
        highScore = score
        writeHighScore(highScore)
      }
    }
  }

  for (const p of pipes) {
    if (p.x > bx + ARARA_RADIUS) continue
    if (p.x + PIPE_WIDTH < bx - ARARA_RADIUS) continue
    const gapTop = p.gapY - PIPE_GAP / 2
    const gapBottom = p.gapY + PIPE_GAP / 2
    if (birdY - ARARA_RADIUS < gapTop || birdY + ARARA_RADIUS > gapBottom) {
      state = 'gameover'
      return
    }
  }
}

function drawClouds() {
  drawCloud(backgroundCtx, W * 0.15, H * 0.12, 1.0)
  drawCloud(backgroundCtx, W * 0.55, H * 0.22, 0.7)
  drawCloud(backgroundCtx, W * 0.92, H * 0.30, 0.55)
}

function getBondinhoLine(): BondinhoLine {
  const horizonY = H - GROUND_HEIGHT
  const mountainTop = horizonY - Math.min(280, H * 0.35)

  const sugarBaseLeft = W * 0.62
  const sugarBaseRight = W * 0.95
  const sugarTopY = mountainTop + 50
  const sugarCurveT = 0.5
  const sugarEndX =
    (1 - sugarCurveT) ** 2 * (sugarBaseLeft + 60) +
    2 * (1 - sugarCurveT) * sugarCurveT * ((sugarBaseLeft + sugarBaseRight) / 2) +
    sugarCurveT ** 2 * (sugarBaseRight - 40)
  const sugarEndY =
    (1 - sugarCurveT) ** 2 * sugarTopY +
    2 * (1 - sugarCurveT) * sugarCurveT * (sugarTopY - 30) +
    sugarCurveT ** 2 * (sugarTopY + 10)

  const urcaBaseLeft = W * 0.55
  const urcaBaseRight = W * 0.7
  const urcaTopY = horizonY - Math.min(110, H * 0.13)

  return {
    startX: (urcaBaseLeft + urcaBaseRight) / 2,
    startY: urcaTopY + 2,
    endX: sugarEndX,
    endY: sugarEndY + 1,
  }
}

function buildBackgroundCache() {
  backgroundCanvas.width = W
  backgroundCanvas.height = H
  backgroundCtx.imageSmoothingEnabled = false

  bondinhoScale = Math.max(0.75, Math.min(1.2, W / 900))

  const w = 22 * bondinhoScale
  const h = 14 * bondinhoScale
  const hangerH = 8 * bondinhoScale
  const pad = 2 * bondinhoScale

  bondinhoW = w + pad * 2
  bondinhoH = hangerH + h + pad * 2

  drawBondinho(
    bondinhoCanvas,
    bondinhoCtx,
    bondinhoScale,
    bondinhoW,
    bondinhoH,
    pad,
    hangerH
  )

  drawSky(backgroundCtx, GROUND_HEIGHT, H, W)
  drawClouds()

  bondinhoLine = getBondinhoLine()

  drawMountains(backgroundCtx, GROUND_HEIGHT, H, W, bondinhoLine)

  drawOcean(backgroundCtx, GROUND_HEIGHT, H, W)
  drawGround(backgroundCtx, GROUND_HEIGHT, H, W)
}

function drawBondinhoCacheOnScreen(now: number) {
  const line = bondinhoLine
  const t = (now * 0.000035) % 1
  const carX = line.startX + (line.endX - line.startX) * t
  const carY = line.startY + (line.endY - line.startY) * t
  ctx.drawImage(
    bondinhoCanvas,
    carX - bondinhoW / 2,
    carY - 2 * bondinhoScale,
  )
}

function drawPalmTreeCacheOnScreen(now: number) {
  const offset = (now * 0.2) % PALM_SPACING
  const wrapW = W + PALM_SPACING
  const baseY = H - GROUND_HEIGHT + 4

  for (const startX of PALM_OFFSETS) {
    const wrappedX = ((startX - offset) % wrapW + wrapW) % wrapW - 80
    ctx.drawImage(
      palmTreeCanvas,
      wrappedX - 29,
      baseY - 60,
    )
  }
}

function drawPipes() {
  const horizonY = H - GROUND_HEIGHT
  for (const p of pipes) {
    const gapTop = p.gapY - PIPE_GAP / 2
    const gapBottom = p.gapY + PIPE_GAP / 2

    drawPipe(ctx, PIPE_WIDTH, p.x, gapTop, gapBottom, horizonY)
  }
}

function drawAraraAzulCacheOnScreen() {
  const bx = W * BIRD_X_RATIO

  ctx.save()
  ctx.translate(bx, birdY)
  ctx.rotate(birdAngle)
  ctx.drawImage(araraCanvas, -araraCanvas.width / 2, -araraCanvas.height / 2)
  ctx.restore()
}

function drawHUDCacheOnScreen() {
  if (state === 'start' || state === 'gameover') return

  drawHUD(ctx, W, score)
}

function drawOverlay() {
  OVERLAY[state](ctx, W, H, isTouch, score, highScore)
}

function draw(now: number) {
  /**
   * minimum width and height block
   */
  if (blocked) {
    drawBlockScreen(ctx, W, H)
    return
  }

  ctx.drawImage(backgroundCanvas, 0, 0)
  drawBondinhoCacheOnScreen(now)
  drawPipes()
  drawPalmTreeCacheOnScreen(now)
  drawAraraAzulCacheOnScreen()
  drawHUDCacheOnScreen()
  drawOverlay()
}

// ─── Main loop ───────────────────────────────────────────────────────────

function loop(now: number) {
  if (!lastFrame) lastFrame = now
  const frameDt = Math.min(0.05, (now - lastFrame) / 1000)
  lastFrame = now

  if (state === 'playing' && !blocked) {
    updateAccumulator += frameDt
    let steps = 0
    while (updateAccumulator >= FIXED_TIMESTEP && steps < MAX_FIXED_STEPS) {
      tick(FIXED_TIMESTEP)
      updateAccumulator -= FIXED_TIMESTEP
      steps++
      if (state !== 'playing') break
    }
    if (steps === MAX_FIXED_STEPS) updateAccumulator = 0

    if (state === 'playing' && now - lastPipeAt > PIPE_INTERVAL_MS) {
      spawnPipe()
      lastPipeAt = now
    }
  } else {
    updateAccumulator = 0
    lastPipeAt = now
  }

  draw(now)
  requestAnimationFrame(loop)
}

buildBackgroundCache()
drawAraraAzul(araraCanvas, araraCtx, ARARA_SIZE, ARARA_RADIUS)
drawPalmTree(palmTreeCanvas, palmTreeCtx)
requestAnimationFrame(loop)
