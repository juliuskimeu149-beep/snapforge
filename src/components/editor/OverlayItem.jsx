import { memo, useRef } from 'react'
import {
  EMOJI_FONT_FAMILY,
  REFERENCE_WIDTH,
  STICKER_LINE_HEIGHT,
  TEXT_FONT_FAMILY,
  TEXT_LINE_HEIGHT,
  TEXT_SHADOW,
} from '../../constants/decorations.js'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

const KEY_MOVES = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

// A text or sticker placed on the photo. Drag with mouse or touch; with the
// keyboard, arrows move it and Delete removes it.
function OverlayItem({ item, selected, interactive, onSelect, onMove, onDelete }) {
  const dragRef = useRef(null)
  const isText = item.type === 'text'

  function handlePointerDown(event) {
    if (!interactive || event.button > 0) return
    // Keep the photo underneath from treating this as "tap to deselect"
    event.stopPropagation()
    onSelect(item.id)
    const rect = event.currentTarget.parentElement.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      rect,
      // Grab offset, so the item doesn't jump to centre on the finger
      dx: event.clientX - (rect.left + item.x * rect.width),
      dy: event.clientY - (rect.top + item.y * rect.height),
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const { rect, dx, dy } = drag
    onMove(item.id, {
      x: clamp01((event.clientX - dx - rect.left) / rect.width),
      y: clamp01((event.clientY - dy - rect.top) / rect.height),
    })
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }

  function handleKeyDown(event) {
    if (KEY_MOVES[event.key]) {
      event.preventDefault()
      const step = event.shiftKey ? 0.05 : 0.01
      const [mx, my] = KEY_MOVES[event.key]
      onMove(item.id, {
        x: clamp01(item.x + mx * step),
        y: clamp01(item.y + my * step),
      })
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onDelete(item.id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label={isText ? `Text: ${item.text}` : `Sticker ${item.emoji}`}
      aria-pressed={selected}
      className={`overlay-item overlay-item--${item.type}${selected ? ' is-selected' : ''}`}
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        zIndex: 2 + item.z,
        // cqw = 1% of the photo's on-screen width, so sizes scale with it
        fontSize: `calc(${item.size} * 100cqw / ${REFERENCE_WIDTH})`,
        fontFamily: isText ? TEXT_FONT_FAMILY : EMOJI_FONT_FAMILY,
        lineHeight: isText ? TEXT_LINE_HEIGHT : STICKER_LINE_HEIGHT,
        textShadow: isText
          ? `0 ${TEXT_SHADOW.offsetY * 100}cqw ${TEXT_SHADOW.blur * 100}cqw ${TEXT_SHADOW.color}`
          : undefined,
        color: item.color,
        fontWeight: item.weight,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      onFocus={() => onSelect(item.id)}
    >
      {isText ? item.text || ' ' : item.emoji}
      {selected && interactive && (
        // Touch/mouse shortcut; keyboard users have Delete and the panel button
        <button
          type="button"
          className="overlay-item__delete"
          aria-hidden="true"
          tabIndex={-1}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(item.id)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Memoised: only re-renders when this item, its selection or its handlers change
export default memo(OverlayItem)
