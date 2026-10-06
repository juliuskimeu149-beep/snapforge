import { useEffect, useId, useRef } from 'react'
import { getPresetMatrix } from '../../constants/filters.js'
import { getPreviewFilter, getToneTransfer } from '../../utils/adjustments.js'
import { mix, toSvgValues } from '../../utils/colorMatrix.js'
import { renderTransformed } from '../../utils/transform.js'
import UploadButton from '../ui/UploadButton.jsx'
import DrawingLayer from './DrawingLayer.jsx'
import OverlayItem from './OverlayItem.jsx'
import './Decorations.css'
import './EditorCanvas.css'

function EditorCanvas({
  image,
  adjustments,
  filter,
  transform,
  outputSize,
  decorations,
  showBefore,
  onSelect,
}) {
  const canvasRef = useRef(null)
  // useId output may contain characters that aren't valid in url(#...)
  const idBase = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const toneFilterId = `tone-${idBase}`
  const presetFilterId = `preset-${idBase}`
  const { slope, intercept } = getToneTransfer(adjustments)

  // Adjustments first, then the filter preset on top
  const presetActive = filter.preset !== 'original' && filter.intensity > 0
  const presetValues = toSvgValues(
    mix(getPresetMatrix(filter.preset), filter.intensity / 100),
  )
  const adjustFilter = getPreviewFilter(adjustments, toneFilterId)
  const cssFilter =
    [
      adjustFilter !== 'none' && adjustFilter,
      presetActive && `url(#${presetFilterId})`,
    ]
      .filter(Boolean)
      .join(' ') || 'none'
  const outputWidth = outputSize?.width
  const outputHeight = outputSize?.height

  // Redraw only when the geometry changes; adjustments are a CSS filter on
  // top, so dragging those sliders never re-renders the pixels
  useEffect(() => {
    if (!image || !canvasRef.current) return
    renderTransformed(canvasRef.current, image.element, transform, {
      width: outputWidth,
      height: outputHeight,
    })
  }, [image, transform, outputWidth, outputHeight])

  return (
    <div className="editor-canvas">
      {image ? (
        <>
          <svg className="editor-canvas__filters" aria-hidden="true">
            <filter id={toneFilterId} colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncR type="linear" slope={slope} intercept={intercept} />
                <feFuncG type="linear" slope={slope} intercept={intercept} />
                <feFuncB type="linear" slope={slope} intercept={intercept} />
              </feComponentTransfer>
            </filter>
            <filter id={presetFilterId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={presetValues} />
            </filter>
          </svg>
          {/* Before / After: both views stay mounted in the same spot and
              only visibility changes, so switching is instant */}
          <div
            key={`before-${image.url}`}
            className={`editor-stage editor-stage--before${showBefore ? '' : ' is-hidden'}`}
            style={{ '--ratio': image.width / image.height }}
            aria-hidden={!showBefore}
          >
            <img
              className="editor-stage__original"
              src={image.url}
              alt={`${image.name} (original, unedited)`}
              draggable="false"
            />
          </div>
          <div
            key={image.url}
            className={`editor-stage${decorations.drawMode ? ' is-drawing' : ''}${showBefore ? ' is-hidden' : ''}`}
            style={{ '--ratio': outputWidth / outputHeight }}
            aria-hidden={showBefore}
            // Tapping the photo itself (not an item) clears the selection
            onPointerDown={() => decorations.select(null)}
          >
            {/* Preview only; the uploaded image is never modified. The
                filter applies to the photo, not to the decorations above */}
            <canvas
              ref={canvasRef}
              className="editor-canvas__image"
              role="img"
              aria-label={image.name}
              style={{ filter: cssFilter }}
            />
            <DrawingLayer
              strokes={decorations.strokes}
              active={decorations.drawMode}
              brush={decorations.brush}
              onStroke={decorations.addStroke}
            />
            {decorations.items.map((item) => (
              <OverlayItem
                key={item.id}
                item={item}
                selected={item.id === decorations.selectedId}
                interactive={!decorations.drawMode}
                onSelect={decorations.select}
                onMove={decorations.updateItem}
                onDelete={decorations.deleteItem}
              />
            ))}
          </div>
          {showBefore && (
            <span className="editor-canvas__badge" aria-live="polite">
              Before — original photo
            </span>
          )}
        </>
      ) : (
        <div className="editor-empty">
          <div className="editor-empty__card">
            <div className="editor-empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="m21 16-5-5-9 9" />
              </svg>
            </div>
            <h2 className="editor-empty__title">Start with a photo</h2>
            <p className="editor-empty__text">
              <span className="editor-empty__text--pointer">
                Drag a photo here, or choose one from your device.
              </span>
              <span className="editor-empty__text--touch">
                Choose a photo from your device to start editing.
              </span>
            </p>
            <UploadButton onSelect={onSelect} />
            <p className="editor-empty__formats">
              JPG, PNG or WebP · your original is never changed
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorCanvas
