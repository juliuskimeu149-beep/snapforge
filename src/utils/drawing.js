import { REFERENCE_WIDTH } from '../constants/decorations.js'

// Stroke points are stored relative to the photo's centre, in units of the
// photo's width on both axes. Drawings therefore scale with the photo and
// never stretch, even if a crop or rotation changes its shape.

export function pointFromEvent(event, rect) {
  return [
    (event.clientX - rect.left - rect.width / 2) / rect.width,
    (event.clientY - rect.top - rect.height / 2) / rect.width,
  ]
}

function toPixels([u, v], width, height) {
  return [width / 2 + u * width, height / 2 + v * width]
}

function applyStyle(ctx, stroke, width) {
  // The eraser cuts through the drawing layer only, never the photo
  ctx.globalCompositeOperation =
    stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.strokeStyle = stroke.color
  ctx.fillStyle = stroke.color
  ctx.lineWidth = (stroke.size * width) / REFERENCE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

export function drawStroke(ctx, stroke, width, height) {
  applyStyle(ctx, stroke, width)
  const points = stroke.points.map((point) => toPixels(point, width, height))

  // A single tap draws a dot
  if (points.length === 1) {
    const [x, y] = points[0]
    ctx.beginPath()
    ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  ctx.beginPath()
  ctx.moveTo(...points[0])
  for (const point of points.slice(1)) ctx.lineTo(...point)
  ctx.stroke()
}
