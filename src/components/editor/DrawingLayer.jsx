import { memo, useEffect, useRef } from 'react'
import { useElementSize } from '../../hooks/useElementSize.js'
import { drawStroke, pointFromEvent } from '../../utils/drawing.js'

// Transparent canvas over the photo that holds the user's drawing. Strokes
// are kept as data and redrawn, so they stay sharp at any size.
function DrawingLayer({ strokes, active, brush, onStroke }) {
  const canvasRef = useRef(null)
  const strokeRef = useRef(null)
  // Copy of the finished strokes, taken when a new stroke starts
  const snapshotRef = useRef(null)
  const frameRef = useRef(0)
  const { width, height } = useElementSize(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    for (const stroke of strokes) drawStroke(ctx, stroke, width, height)
  }, [strokes, width, height])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  // Draw the in-progress stroke as one path over the snapshot, so it looks
  // exactly like it will once finished (no seams between segments)
  function renderCurrent() {
    frameRef.current = 0
    const current = strokeRef.current
    if (!current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'copy'
    ctx.drawImage(snapshotRef.current, 0, 0)
    ctx.restore()
    drawStroke(ctx, current.stroke, current.rect.width, current.rect.height)
  }

  function handlePointerDown(event) {
    if (!active || strokeRef.current || event.button > 0) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const snapshot = snapshotRef.current ?? document.createElement('canvas')
    snapshot.width = canvas.width
    snapshot.height = canvas.height
    snapshot.getContext('2d').drawImage(canvas, 0, 0)
    snapshotRef.current = snapshot

    strokeRef.current = {
      rect,
      pointerId: event.pointerId,
      stroke: {
        tool: brush.tool,
        size: brush.size,
        color: brush.color,
        points: [pointFromEvent(event, rect)],
      },
    }
    canvas.setPointerCapture(event.pointerId)
    renderCurrent()
  }

  function handlePointerMove(event) {
    const current = strokeRef.current
    if (!current || current.pointerId !== event.pointerId) return
    // Coalesced events give smoother lines on fast finger/pen movement
    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? []
    for (const e of coalesced.length ? coalesced : [event]) {
      current.stroke.points.push(pointFromEvent(e, current.rect))
    }
    // At most one redraw per screen frame, however fast the pointer moves
    if (!frameRef.current) frameRef.current = requestAnimationFrame(renderCurrent)
  }

  function endStroke(event) {
    const current = strokeRef.current
    if (!current || current.pointerId !== event.pointerId) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    strokeRef.current = null
    onStroke(current.stroke)
  }

  return (
    <canvas
      ref={canvasRef}
      className={`drawing-layer${active ? ' is-active' : ''}`}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
    />
  )
}

// Memoised: adjustment / filter changes never touch the drawing
export default memo(DrawingLayer)
