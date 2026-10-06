import {
  EMOJI_FONT_FAMILY,
  REFERENCE_WIDTH,
  STICKER_LINE_HEIGHT,
  TEXT_FONT_FAMILY,
  TEXT_LINE_HEIGHT,
  TEXT_SHADOW,
} from '../constants/decorations.js'
import { EXPORT_BASE_NAME, getExportFormat } from '../constants/export.js'
import { getPresetMatrix } from '../constants/filters.js'
import { getToneTransfer } from './adjustments.js'
import { mix } from './colorMatrix.js'
import { drawStroke } from './drawing.js'
import { renderTransformed } from './transform.js'

// Messages shown to the user when an export can't be completed
export class ExportError extends Error {}

const TOO_LARGE =
  'This image is too large for your browser to export. Try a smaller size under Transform → Resize.'

// Let the browser paint (e.g. the loading spinner) before heavy work
const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value)

// ---------------------------------------------------------------------------
// Colour: the same steps, order and formulas the preview's CSS / SVG filters
// use (tone → contrast → saturate → preset, each clamped), applied to the
// actual pixels so the download matches what's on screen.

// CSS saturate() matrix, with the coefficients from the Filter Effects spec
function cssSaturateMatrix(s) {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ]
}

// Returns a function that recolours ImageData in place, or null if the
// current settings leave colours unchanged
function createColorProcessor(adjustments, filter) {
  const { slope, intercept } = getToneTransfer(adjustments)
  const contrast = 1 + adjustments.contrast / 100
  const saturation = 1 + adjustments.saturation / 100
  const presetActive = filter.preset !== 'original' && filter.intensity > 0
  const toneActive = slope !== 1 || intercept !== 0
  if (!toneActive && contrast === 1 && saturation === 1 && !presetActive) {
    return null
  }

  // Tone and contrast treat every channel alike, so precompute a lookup
  const lut = new Float32Array(256)
  for (let v = 0; v < 256; v++) {
    let x = v / 255
    if (toneActive) x = clamp01(x * slope + intercept)
    if (contrast !== 1) x = clamp01((x - 0.5) * contrast + 0.5)
    lut[v] = x
  }
  const sat = saturation !== 1 ? cssSaturateMatrix(saturation) : null
  const p = presetActive
    ? mix(getPresetMatrix(filter.preset), filter.intensity / 100)
    : null

  return (data) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = lut[data[i]]
      let g = lut[data[i + 1]]
      let b = lut[data[i + 2]]
      if (sat) {
        const r1 = clamp01(sat[0] * r + sat[1] * g + sat[2] * b)
        const g1 = clamp01(sat[3] * r + sat[4] * g + sat[5] * b)
        const b1 = clamp01(sat[6] * r + sat[7] * g + sat[8] * b)
        r = r1
        g = g1
        b = b1
      }
      if (p) {
        const a = data[i + 3] / 255
        const r1 = clamp01(p[0] * r + p[1] * g + p[2] * b + p[3] * a + p[4])
        const g1 = clamp01(p[5] * r + p[6] * g + p[7] * b + p[8] * a + p[9])
        const b1 = clamp01(p[10] * r + p[11] * g + p[12] * b + p[13] * a + p[14])
        r = r1
        g = g1
        b = b1
      }
      data[i] = r * 255
      data[i + 1] = g * 255
      data[i + 2] = b * 255
    }
  }
}

// Works through the image in horizontal strips to limit memory use and
// keep the page responsive on large photos
async function applyColor(ctx, width, height, process) {
  const rowsPerStrip = Math.max(1, Math.floor(2_000_000 / width))
  for (let y = 0; y < height; y += rowsPerStrip) {
    const rows = Math.min(rowsPerStrip, height - y)
    const strip = ctx.getImageData(0, y, width, rows)
    process(strip.data)
    ctx.putImageData(strip, 0, y)
    await nextFrame()
  }
}

// ---------------------------------------------------------------------------
// Decorations

// Drawing goes on its own layer first so the eraser only cuts the drawing
function drawStrokes(ctx, strokes, width, height) {
  if (strokes.length === 0) return
  const layer = document.createElement('canvas')
  layer.width = width
  layer.height = height
  const layerCtx = layer.getContext('2d')
  if (!layerCtx) throw new ExportError(TOO_LARGE)
  for (const stroke of strokes) drawStroke(layerCtx, stroke, width, height)
  ctx.drawImage(layer, 0, 0)
  layer.width = 0 // free the memory straight away
}

// Text / sticker, laid out like the on-screen element: centred on (x, y),
// one line box per line, glyphs vertically centred in each line box
function drawItem(ctx, item, width, height) {
  const isText = item.type === 'text'
  const scale = width / REFERENCE_WIDTH
  const fontSize = item.size * scale
  const lines = isText ? item.text.split('\n') : [item.emoji]
  const lineHeight = fontSize * (isText ? TEXT_LINE_HEIGHT : STICKER_LINE_HEIGHT)
  const centerX = item.x * width
  const centerY = item.y * height

  ctx.save()
  ctx.font = isText
    ? `${item.weight} ${fontSize}px ${TEXT_FONT_FAMILY}`
    : `${fontSize}px ${EMOJI_FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = isText ? item.color : '#000'
  if (isText) {
    ctx.shadowColor = TEXT_SHADOW.color
    ctx.shadowOffsetY = TEXT_SHADOW.offsetY * width
    ctx.shadowBlur = TEXT_SHADOW.blur * width
  }

  lines.forEach((line, index) => {
    if (!line) return
    const lineCenter = centerY + (index - (lines.length - 1) / 2) * lineHeight
    const metrics = ctx.measureText(line)
    const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8
    const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2
    ctx.fillText(line, centerX, lineCenter + (ascent - descent) / 2)
  })
  ctx.restore()
}

// ---------------------------------------------------------------------------

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality))
}

// Builds the finished image from the untouched original plus the editor
// document, at the full output size, and encodes it.
export async function exportImage({ image, document: edits, outputSize, format, quality }) {
  const target = getExportFormat(format)
  const { width, height } = outputSize
  await nextFrame()

  const canvas = document.createElement('canvas')
  const process = createColorProcessor(edits.adjustments, edits.filter)
  try {
    // Pixel-reading is much faster when the canvas knows about it up front
    const ctx = canvas.getContext('2d', { willReadFrequently: Boolean(process) })
    if (!ctx) throw new ExportError(TOO_LARGE)

    // 1. Photo with crop, rotation, flips and resize, at full resolution
    renderTransformed(canvas, image.element, edits.transform, outputSize, Infinity)
    if (canvas.width !== width || canvas.height !== height) {
      throw new ExportError(TOO_LARGE)
    }
    await nextFrame()

    // 2. Adjustments and filter (photo only, like the preview)
    if (process) await applyColor(ctx, width, height, process)

    // 3. Drawing, then text and stickers in their stacking order
    drawStrokes(ctx, edits.strokes, width, height)
    for (const item of [...edits.items].sort((a, b) => a.z - b.z)) {
      drawItem(ctx, item, width, height)
    }

    // JPEG has no transparency; use white instead of black behind it
    if (target.value === 'jpeg') {
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'
    }

    const blob = await canvasToBlob(
      canvas,
      target.mime,
      target.lossy ? quality / 100 : undefined,
    )
    if (!blob) throw new ExportError(TOO_LARGE)
    // Browsers that can't encode a format silently fall back to PNG
    if (blob.type !== target.mime) {
      throw new ExportError(
        `Your browser can't create ${target.label} files. Please choose ${target.value === 'png' ? 'JPEG' : 'PNG or JPEG'} instead.`,
      )
    }
    return { blob, filename: `${EXPORT_BASE_NAME}.${target.extension}` }
  } catch (error) {
    if (error instanceof ExportError) throw error
    throw new ExportError(
      "Something went wrong while creating your photo. Please try again, or try a smaller size.",
      { cause: error },
    )
  } finally {
    canvas.width = 0 // release the full-size canvas
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser time to start the download before freeing the URL
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
