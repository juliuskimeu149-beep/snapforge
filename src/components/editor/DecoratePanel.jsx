import { useEffect, useId, useRef, useState } from 'react'
import {
  BRUSH_SIZE,
  BRUSH_TOOLS,
  DEFAULT_TEXT,
  FONT_WEIGHTS,
  STICKERS,
  STICKER_SIZE,
  TEXT_SIZE,
} from '../../constants/decorations.js'
import ColorSwatches from '../ui/ColorSwatches.jsx'
import PanelSection from '../ui/PanelSection.jsx'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import Slider from '../ui/Slider.jsx'
import './DecoratePanel.css'

const ICON_PATHS = {
  text: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
  draw: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6'],
}

function Icon({ name }) {
  return (
    <svg className="decorate-icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function DeleteButton({ label, onClick }) {
  return (
    <button type="button" className="decorate-delete" onClick={onClick}>
      <Icon name="trash" />
      {label}
    </button>
  )
}

function DecoratePanel({ decorations, disabled }) {
  const {
    items,
    selectedId,
    strokes,
    drawMode,
    brush,
    addText,
    addSticker,
    updateItem,
    deleteItem,
    setDrawMode,
    setBrush,
    clearDrawing,
  } = decorations
  const selected = items.find((item) => item.id === selectedId)
  // Only text that was just added grabs focus (and the phone keyboard)
  const [focusId, setFocusId] = useState(null)
  const editorRef = useRef(null)
  const textId = useId()
  const weightLabelId = useId()
  const toolLabelId = useId()
  const stickersLabelId = useId()

  // Bring the controls for the current selection or Draw mode into view
  useEffect(() => {
    if (selectedId || drawMode) {
      editorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedId, drawMode])

  return (
    <PanelSection title="Decorate" description="Text, stickers and drawing">
      <div className="decorate-actions">
        <button
          type="button"
          className="decorate-action"
          disabled={disabled}
          onClick={() => setFocusId(addText())}
        >
          <Icon name="text" />
          Add Text
        </button>
        <button
          type="button"
          className="decorate-action"
          aria-pressed={drawMode}
          disabled={disabled}
          onClick={() => setDrawMode(!drawMode)}
        >
          <Icon name="draw" />
          {drawMode ? 'Done Drawing' : 'Draw'}
        </button>
      </div>

      {!disabled && !selected && !drawMode && items.length > 0 && (
        <p className="decorate-hint">
          Tap text or a sticker on the photo to edit or move it.
        </p>
      )}

      {selected?.type === 'text' && (
        <div ref={editorRef} className="decorate-editor">
          <div className="decorate-group">
            <label htmlFor={textId} className="decorate-group__label">
              Text
            </label>
            <textarea
              key={selected.id}
              id={textId}
              className="decorate-text-input"
              rows={2}
              value={selected.text}
              autoFocus={selected.id === focusId}
              onFocus={(event) => {
                if (selected.text === DEFAULT_TEXT.text) event.target.select()
              }}
              onChange={(event) =>
                updateItem(selected.id, { text: event.target.value })
              }
            />
          </div>
          <Slider
            label="Font Size"
            value={selected.size}
            min={TEXT_SIZE.min}
            max={TEXT_SIZE.max}
            step={1}
            neutral={TEXT_SIZE.min}
            onChange={(size) => updateItem(selected.id, { size })}
          />
          <ColorSwatches
            label="Text Color"
            value={selected.color}
            onChange={(color) => updateItem(selected.id, { color })}
          />
          <div className="decorate-group">
            <span id={weightLabelId} className="decorate-group__label">
              Font Weight
            </span>
            <SegmentedControl
              options={FONT_WEIGHTS}
              value={selected.weight}
              onChange={(weight) => updateItem(selected.id, { weight })}
              labelledBy={weightLabelId}
            />
          </div>
          <DeleteButton
            label="Delete Text"
            onClick={() => deleteItem(selected.id)}
          />
        </div>
      )}

      {selected?.type === 'sticker' && (
        <div ref={editorRef} className="decorate-editor">
          <Slider
            label={`Sticker Size ${selected.emoji}`}
            value={selected.size}
            min={STICKER_SIZE.min}
            max={STICKER_SIZE.max}
            step={1}
            neutral={STICKER_SIZE.min}
            onChange={(size) => updateItem(selected.id, { size })}
          />
          <DeleteButton
            label="Delete Sticker"
            onClick={() => deleteItem(selected.id)}
          />
        </div>
      )}

      {drawMode && (
        <div ref={editorRef} className="decorate-editor">
          <p className="decorate-hint">
            Draw on the photo with your finger or mouse.
          </p>
          <div className="decorate-group">
            <span id={toolLabelId} className="visually-hidden">
              Drawing tool
            </span>
            <SegmentedControl
              options={BRUSH_TOOLS}
              value={brush.tool}
              onChange={(tool) => setBrush({ tool })}
              labelledBy={toolLabelId}
            />
          </div>
          <Slider
            label={brush.tool === 'eraser' ? 'Eraser Size' : 'Brush Size'}
            value={brush.size}
            min={BRUSH_SIZE.min}
            max={BRUSH_SIZE.max}
            step={1}
            neutral={BRUSH_SIZE.min}
            onChange={(size) => setBrush({ size })}
          />
          {brush.tool === 'brush' && (
            <ColorSwatches
              label="Brush Color"
              value={brush.color}
              onChange={(color) => setBrush({ color })}
            />
          )}
          <button
            type="button"
            className="decorate-secondary"
            disabled={strokes.length === 0}
            onClick={clearDrawing}
          >
            Clear Drawing
          </button>
        </div>
      )}

      <div className="decorate-group">
        <span id={stickersLabelId} className="decorate-group__label">
          Stickers
        </span>
        <div
          className="sticker-grid"
          role="group"
          aria-labelledby={stickersLabelId}
        >
          {STICKERS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="sticker-button"
              aria-label={`Add ${emoji} sticker`}
              disabled={disabled}
              onClick={() => addSticker(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </PanelSection>
  )
}

export default DecoratePanel
