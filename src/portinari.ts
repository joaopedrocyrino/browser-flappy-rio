import type { BondinhoLine } from './types'

export function drawAraraAzul(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    size: number,
    radius: number
) {
    const center = size / 2

    canvas.width = size
    canvas.height = size

    context.clearRect(0, 0, size, size)
    context.save()
    context.translate(center, center)

    // Tail feathers.
    context.fillStyle = '#0d3f80'
    context.beginPath()
    context.moveTo(-radius, -4)
    context.lineTo(-radius - 18, -2)
    context.lineTo(-radius - 22, 4)
    context.lineTo(-radius - 16, 6)
    context.lineTo(-radius, 4)
    context.closePath()
    context.fill()

    // Wing.
    context.fillStyle = '#0f4a96'
    context.beginPath()
    context.ellipse(-3, 3, 14, 9, -0.25, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = '#08316b'
    context.lineWidth = 1
    for (let i = 0; i < 3; i++) {
        context.beginPath()
        context.moveTo(-12 + i * 4, 6)
        context.lineTo(-3 + i * 4, 11)
        context.stroke()
    }

    // Body.
    context.fillStyle = '#1664c4'
    context.beginPath()
    context.ellipse(0, 0, radius, radius - 2, 0, 0, Math.PI * 2)
    context.fill()

    // Belly highlight.
    context.fillStyle = 'rgba(150, 200, 240, 0.45)'
    context.beginPath()
    context.ellipse(2, 6, radius - 6, 5, 0, 0, Math.PI * 2)
    context.fill()

    // Head.
    context.fillStyle = '#1c75d8'
    context.beginPath()
    context.arc(radius - 6, -3, 11, 0, Math.PI * 2)
    context.fill()

    // Eye ring.
    context.fillStyle = '#ffd34a'
    context.beginPath()
    context.arc(radius - 3, -5, 5, 0, Math.PI * 2)
    context.fill()

    // Eye.
    context.fillStyle = '#fff'
    context.beginPath()
    context.arc(radius - 2, -5, 3, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#000'
    context.beginPath()
    context.arc(radius - 1, -5, 1.5, 0, Math.PI * 2)
    context.fill()

    // Beak.
    context.fillStyle = '#1a1a1a'
    context.beginPath()
    context.moveTo(radius + 2, -1)
    context.quadraticCurveTo(radius + 12, 2, radius + 7, 6)
    context.quadraticCurveTo(radius + 2, 5, radius - 1, 3)
    context.closePath()
    context.fill()

    // Cere.
    context.fillStyle = '#ffd34a'
    context.beginPath()
    context.arc(radius - 1, 2, 1.6, 0, Math.PI * 2)
    context.fill()

    context.restore()
}

export function drawPalmTree(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    const w = 58
    const h = 74

    canvas.width = w
    canvas.height = h
    context.clearRect(0, 0, w, h)

    // Trunk — curved dark brown
    context.strokeStyle = '#3a2410'
    context.lineWidth = 5
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(29, 60)
    context.quadraticCurveTo(25, 30, 27, 5)
    context.stroke()

    // Fronds — a starburst of curved leaves from the top
    const topX = 27
    const topY = 5
    context.strokeStyle = '#1e4f24'
    context.lineWidth = 3
    const fronds = [
        [-22, 6],
        [-16, -8],
        [-4, -14],
        [10, -10],
        [22, -2],
        [18, 10],
    ]
    for (const [dx, dy] of fronds) {
        context.beginPath()
        context.moveTo(topX, topY)
        context.quadraticCurveTo(topX + dx * 0.5, topY + dy * 0.5 - 4, topX + dx, topY + dy)
        context.stroke()
    }
}

export function drawBondinho(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    scale: number,
    w: number,
    h: number,
    pad: number,
    hangerH: number
) {
    canvas.width = Math.ceil(w)
    canvas.height = Math.ceil(h)
    context.clearRect(0, 0, canvas.width, canvas.height)

    const x = canvas.width / 2
    const bodyX = x - w / 2
    const bodyY = pad + hangerH

    context.lineWidth = Math.max(1, scale)
    context.strokeStyle = 'rgba(35, 35, 35, 0.85)'
    context.fillStyle = '#d94735'

    context.beginPath()
    context.moveTo(x, pad)
    context.lineTo(x, bodyY)
    context.stroke()

    context.fillRect(bodyX, bodyY, w, h)

    context.fillStyle = '#f36f4f'
    context.fillRect(bodyX + 2 * scale, bodyY + 2 * scale, w - 4 * scale, 4 * scale)

    context.fillStyle = '#bfe9ff'
    const windowY = bodyY + 7 * scale
    const windowW = 5 * scale
    const gap = 2 * scale
    context.fillRect(bodyX + 3 * scale, windowY, windowW, 4 * scale)
    context.fillRect(bodyX + 3 * scale + windowW + gap, windowY, windowW, 4 * scale)
    context.fillRect(bodyX + 3 * scale + (windowW + gap) * 2, windowY, windowW, 4 * scale)

    context.strokeRect(bodyX, bodyY, w, h)
}

export function drawPausedOverlay(context: CanvasRenderingContext2D, w: number, h: number) {
    context.fillStyle = 'rgba(0, 0, 0, 0.45)'
    context.fillRect(0, 0, w, h)

    context.fillStyle = '#fff'
    context.strokeStyle = 'rgba(0, 0, 0, 0.7)'
    context.lineWidth = 4
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    context.font = 'bold 40px "Trebuchet MS", sans-serif'
    context.strokeText('PAUSED', w / 2, h / 2)
    context.fillText('PAUSED', w / 2, h / 2)

    context.textAlign = 'left'
    context.textBaseline = 'top'
}

export function drawStartOverlay(context: CanvasRenderingContext2D, w: number, h: number, isTouch: boolean) {
    context.fillStyle = 'rgba(0, 0, 0, 0.45)'
    context.fillRect(0, 0, w, h)

    context.fillStyle = '#fff'
    context.strokeStyle = 'rgba(0, 0, 0, 0.7)'
    context.lineWidth = 4
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    context.font = 'bold 48px "Trebuchet MS", sans-serif'
    context.strokeText('FLAPPY RIO', w / 2, h / 2 - 60)
    context.fillText('FLAPPY RIO', w / 2, h / 2 - 60)
    context.font = '18px "Trebuchet MS", sans-serif'

    if (isTouch) {
        context.fillText('TAP TO START', w / 2, h / 2)
        context.fillText('TAP TO FLAP', w / 2, h / 2 + 28)
    } else {
        context.fillText('PRESS SPACE OR ENTER TO START', w / 2, h / 2)
        context.fillText('SPACE / ENTER / CLICK TO FLAP', w / 2, h / 2 + 28)
        context.fillText('P TO PAUSE', w / 2, h / 2 + 56)
    }
    context.textAlign = 'left'
    context.textBaseline = 'top'
}

export function drawGameOverOverlay(
    context: CanvasRenderingContext2D,
    w: number,
    h: number,
    isTouch: boolean,
    score: number,
    highScore: number,
) {
    context.fillStyle = 'rgba(0, 0, 0, 0.45)'
    context.fillRect(0, 0, w, h)

    context.fillStyle = '#fff'
    context.strokeStyle = 'rgba(0, 0, 0, 0.7)'
    context.lineWidth = 4
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    context.font = 'bold 42px "Trebuchet MS", sans-serif'
    context.strokeText('GAME OVER', w / 2, h / 2 - 60)
    context.fillText('GAME OVER', w / 2, h / 2 - 60)
    context.font = '22px "Trebuchet MS", sans-serif'
    context.fillText(`SCORE  ${score}`, w / 2, h / 2 - 10)
    context.fillText(`BEST   ${highScore}`, w / 2, h / 2 + 20)
    context.font = '16px "Trebuchet MS", sans-serif'
    context.fillText(
        isTouch ? 'TAP TO RESTART' : 'PRESS SPACE OR ENTER TO RESTART',
        w / 2,
        h / 2 + 70,
    )

    context.textAlign = 'left'
    context.textBaseline = 'top'
}

export function drawBlockScreen(context: CanvasRenderingContext2D, w: number, h: number) {
    context.fillStyle = '#1d6fc7'
    context.fillRect(0, 0, w, h)

    context.fillStyle = '#fff'
    context.strokeStyle = 'rgba(0, 0, 0, 0.6)'
    context.lineWidth = 3
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    const lineH = 28
    let y = h / 2 - lineH

    context.font = 'bold 26px "Trebuchet MS", sans-serif'
    context.strokeText('Screen too small', w / 2, y)
    context.fillText('Screen too small', w / 2, y)
    y += lineH + 8

    context.font = '14px "Trebuchet MS", sans-serif'
    y += lineH
    context.fillText('Rotate to portrait or open on a larger device', w / 2, y)

    context.textAlign = 'left'
    context.textBaseline = 'top'
}

export function drawHUD(context: CanvasRenderingContext2D, w: number, score: number) {
    context.fillStyle = '#fff'
    context.strokeStyle = 'rgba(0, 0, 0, 0.55)'
    context.lineWidth = 4
    context.font = 'bold 56px "Trebuchet MS", sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.strokeText(String(score), w / 2, 36)
    context.fillText(String(score), w / 2, 36)
    context.textAlign = 'left'
}

export function drawPipe(
    context: CanvasRenderingContext2D,
    pipeWidth: number,
    x: number,
    gapTop: number,
    gapBottom: number,
    horizonY: number
) {
    // Body
    context.fillStyle = '#3aa84a'
    context.fillRect(x, 0, pipeWidth, gapTop)
    context.fillRect(x, gapBottom, pipeWidth, horizonY - gapBottom)

    // Highlight on left edge
    context.fillStyle = '#6ed87a'
    context.fillRect(x + 4, 0, 4, gapTop)
    context.fillRect(x + 4, gapBottom, 4, horizonY - gapBottom)

    // Caps (slightly wider, darker)
    context.fillStyle = '#2c7a32'
    context.fillRect(x - 4, gapTop - 20, pipeWidth + 8, 20)
    context.fillRect(x - 4, gapBottom, pipeWidth + 8, 20)
}

function drawCristo(context: CanvasRenderingContext2D, x: number, peakY: number) {
    const stoneDark = '#9a9794'
    const stoneLight = '#b8b4ae'

    // Two-tier pedestal
    const baseH = 4
    const baseW = 18
    const pedestalH = 6
    const pedestalW = 11
    context.fillStyle = stoneDark
    context.fillRect(x - baseW / 2, peakY - baseH, baseW, baseH)
    context.fillStyle = stoneLight
    context.fillRect(x - pedestalW / 2, peakY - baseH - pedestalH, pedestalW, pedestalH)

    // Statue geometry
    const feetY = peakY - baseH - pedestalH
    const bodyH = 18
    const bodyTopY = feetY - bodyH
    const shouldersY = bodyTopY + 3
    const armSpan = 14
    const robeTopHalf = 3
    const robeHemHalf = 7

    // Robe — trapezoid widening toward the hem
    context.fillStyle = stoneLight
    context.beginPath()
    context.moveTo(x - robeTopHalf, bodyTopY + 2)
    context.lineTo(x + robeTopHalf, bodyTopY + 2)
    context.lineTo(x + robeHemHalf, feetY)
    context.lineTo(x - robeHemHalf, feetY)
    context.closePath()
    context.fill()

    // Subtle vertical robe folds — hint at fabric drape
    context.strokeStyle = stoneDark
    context.lineWidth = 0.6
    context.beginPath()
    context.moveTo(x - 1.5, bodyTopY + 6)
    context.lineTo(x - 3, feetY)
    context.moveTo(x + 1.5, bodyTopY + 6)
    context.lineTo(x + 3, feetY)
    context.stroke()

    // Outstretched arms — slim trapezoids with a slight downward tilt at the
    // hands, like the real statue's arms drop a few degrees at the wrists.
    context.fillStyle = stoneDark
    // Left arm
    context.beginPath()
    context.moveTo(x - 2, shouldersY)
    context.lineTo(x - armSpan, shouldersY + 2)
    context.lineTo(x - armSpan, shouldersY + 4)
    context.lineTo(x - 2, shouldersY + 3)
    context.closePath()
    context.fill()
    // Right arm
    context.beginPath()
    context.moveTo(x + 2, shouldersY)
    context.lineTo(x + armSpan, shouldersY + 2)
    context.lineTo(x + armSpan, shouldersY + 4)
    context.lineTo(x + 2, shouldersY + 3)
    context.closePath()
    context.fill()

    // Head
    context.beginPath()
    context.arc(x, bodyTopY - 2, 3, 0, Math.PI * 2)
    context.fill()
}

export function drawMountains(context: CanvasRenderingContext2D, groundHeight: number, H: number, W: number, bondinhoLine: BondinhoLine) {
    const horizonY = H - groundHeight
    // Make mountain band proportional to height so it scales on tall/short screens.
    const mountainTop = horizonY - Math.min(280, H * 0.35)

    // Far back ridge (soft blue, low contrast — atmospheric depth)
    context.fillStyle = 'rgba(80, 110, 145, 0.55)'
    context.beginPath()
    context.moveTo(0, horizonY - 30)
    context.quadraticCurveTo(W * 0.1, mountainTop + 60, W * 0.25, horizonY - 50)
    context.quadraticCurveTo(W * 0.4, mountainTop + 100, W * 0.55, horizonY - 30)
    context.lineTo(W, horizonY)
    context.lineTo(0, horizonY)
    context.closePath()
    context.fill()

    // ── Corcovado (left of center) with Cristo Redentor on top ─────────────
    const corcovadoBaseLeft = W * 0.20
    const corcovadoBaseRight = W * 0.48
    const corcovadoPeakX = (corcovadoBaseLeft + corcovadoBaseRight) / 2 - 8
    const corcovadoPeakY = mountainTop + 20

    // Body fill
    context.fillStyle = '#2f4534'
    context.beginPath()
    context.moveTo(corcovadoBaseLeft, horizonY)
    context.lineTo(corcovadoPeakX, corcovadoPeakY)
    context.lineTo(corcovadoBaseRight, horizonY)
    context.closePath()
    context.fill()

    // Sun-facing slope highlight (right side, toward sun)
    context.fillStyle = 'rgba(255, 215, 150, 0.18)'
    context.beginPath()
    context.moveTo(corcovadoPeakX, corcovadoPeakY)
    context.lineTo(corcovadoBaseRight, horizonY)
    context.lineTo(corcovadoPeakX + 12, horizonY)
    context.closePath()
    context.fill()

    // Shadow slope (left side, away from sun)
    context.fillStyle = 'rgba(0, 0, 0, 0.15)'
    context.beginPath()
    context.moveTo(corcovadoPeakX, corcovadoPeakY)
    context.lineTo(corcovadoBaseLeft, horizonY)
    context.lineTo(corcovadoPeakX - 8, horizonY)
    context.closePath()
    context.fill()

    // Cristo Redentor on the summit
    drawCristo(context, corcovadoPeakX, corcovadoPeakY - 4)

    // ── Pão de Açúcar (right) — distinctive rounded dome ──────────────────
    const sugarBaseLeft = W * 0.62
    const sugarBaseRight = W * 0.95
    const sugarTopY = mountainTop + 50

    context.fillStyle = '#3a5240'
    context.beginPath()
    context.moveTo(sugarBaseLeft, horizonY)
    context.quadraticCurveTo(sugarBaseLeft + 30, sugarTopY + 20, sugarBaseLeft + 60, sugarTopY)
    context.quadraticCurveTo(
        (sugarBaseLeft + sugarBaseRight) / 2,
        sugarTopY - 30,
        sugarBaseRight - 40,
        sugarTopY + 10,
    )
    context.quadraticCurveTo(sugarBaseRight - 10, sugarTopY + 50, sugarBaseRight, horizonY)
    context.closePath()
    context.fill()

    // Sun-facing highlight on Sugar Loaf
    context.fillStyle = 'rgba(255, 215, 150, 0.18)'
    context.beginPath()
    context.moveTo(sugarBaseLeft + 60, sugarTopY)
    context.quadraticCurveTo(
        (sugarBaseLeft + sugarBaseRight) / 2,
        sugarTopY - 30,
        sugarBaseRight - 40,
        sugarTopY + 10,
    )
    context.quadraticCurveTo(sugarBaseRight - 10, sugarTopY + 50, sugarBaseRight, horizonY)
    context.lineTo((sugarBaseLeft + sugarBaseRight) / 2 + 30, horizonY)
    context.closePath()
    context.fill()

    // Morro da Urca — smaller companion in front of Sugar Loaf
    const urcaBaseLeft = W * 0.55
    const urcaBaseRight = W * 0.7
    const urcaTopY = horizonY - Math.min(110, H * 0.13)
    context.fillStyle = '#2c4030'
    context.beginPath()
    context.moveTo(urcaBaseLeft, horizonY)
    context.quadraticCurveTo(
        urcaBaseLeft + 18,
        urcaTopY,
        (urcaBaseLeft + urcaBaseRight) / 2,
        urcaTopY,
    )
    context.quadraticCurveTo(urcaBaseRight - 10, urcaTopY + 15, urcaBaseRight, horizonY)
    context.closePath()
    context.fill()

    context.strokeStyle = 'rgba(20, 20, 20, 0.5)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(bondinhoLine.startX, bondinhoLine.startY)
    context.lineTo(bondinhoLine.endX, bondinhoLine.endY)
    context.stroke()
}

export function drawCloud(context: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
    context.fillStyle = 'rgba(255, 255, 255, 0.85)'
    context.beginPath()
    context.arc(cx, cy, 18 * scale, 0, Math.PI * 2)
    context.arc(cx + 20 * scale, cy - 6 * scale, 22 * scale, 0, Math.PI * 2)
    context.arc(cx + 40 * scale, cy, 18 * scale, 0, Math.PI * 2)
    context.arc(cx + 22 * scale, cy + 10 * scale, 16 * scale, 0, Math.PI * 2)
    context.fill()
}

export function drawOcean(context: CanvasRenderingContext2D, groundHeight: number, H: number, W: number) {
    const horizonY = H - groundHeight
    const oceanTop = horizonY - 6

    context.fillStyle = '#2c79a8'
    context.fillRect(0, oceanTop, W, groundHeight)
}

export function drawGround(context: CanvasRenderingContext2D, groundHeight: number, H: number, W: number) {
    // Beach sand at the bottom
    context.fillStyle = '#f0d9a3'
    context.fillRect(0, H - groundHeight, W, groundHeight)

    // Wet sand band at the water's edge
    context.fillStyle = '#e3c787'
    context.fillRect(0, H - groundHeight, W, 8)
}

export function drawSky(context: CanvasRenderingContext2D, groundHeight: number, H: number, W: number) {
    const horizonY = H - groundHeight
    const grad = context.createLinearGradient(0, 0, 0, horizonY)
    grad.addColorStop(0, '#4ba6e0')       // upper sky
    grad.addColorStop(0.45, '#a3d8f5')    // mid sky
    grad.addColorStop(0.8, '#ffd9a8')     // warm horizon haze
    grad.addColorStop(1, '#ffb786')       // sunset blush at horizon
    context.fillStyle = grad
    context.fillRect(0, 0, W, horizonY)

    // Sun, positioned proportionally
    const sunX = W * 0.78
    const sunY = H * 0.18
    // Soft halo
    const halo = context.createRadialGradient(sunX, sunY, 10, sunX, sunY, 100)
    halo.addColorStop(0, 'rgba(255, 240, 170, 0.85)')
    halo.addColorStop(0.5, 'rgba(255, 220, 150, 0.25)')
    halo.addColorStop(1, 'rgba(255, 220, 150, 0)')
    context.fillStyle = halo
    context.fillRect(sunX - 100, sunY - 100, 200, 200)
    // Solid sun
    context.fillStyle = '#fff0b3'
    context.beginPath()
    context.arc(sunX, sunY, 36, 0, Math.PI * 2)
    context.fill()
}