import {
  CROP_RATIOS,
  MAX_OUTPUT_SIZE,
  PREVIEW_MAX_SIDE,
} from '../constants/transform.js'

// The preview never needs more pixels than the screen can show: cap it at the
// screen's longest side in device pixels (min 1024, max PREVIEW_MAX_SIDE).
// A phone then redraws a ~2500px preview instead of a 4096px one, which is
// faster and lighter on memory. Exports always use the full size.
export function getPreviewMaxSide() {
  if (typeof window === 'undefined') return PREVIEW_MAX_SIDE
  const longest = Math.max(
    window.screen.width,
    window.screen.height,
    window.innerWidth,
    window.innerHeight,
  )
  const devicePixels = Math.ceil(longest * (window.devicePixelRatio || 1))
  return Math.min(PREVIEW_MAX_SIDE, Math.max(1024, devicePixels))
}

export function getCropRatio(cropKey) {
  return CROP_RATIOS.find((crop) => crop.key === cropKey)?.ratio ?? null
}

export function clampSize(value) {
  return Math.min(MAX_OUTPUT_SIZE, Math.max(1, Math.round(value)))
}

// Width and height after rotation (90° and 270° swap them)
function getOrientedSize(width, height, rotation) {
  return rotation % 180 === 0
    ? { width, height }
    : { width: height, height: width }
}

// Largest centred rectangle with the given ratio that fits inside the image
function getCropRect(width, height, ratio) {
  if (!ratio) return { x: 0, y: 0, width, height }
  const cropWidth = Math.min(width, height * ratio)
  const cropHeight = cropWidth / ratio
  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  }
}

// Pixel size of the rotated + cropped image before any resize
export function getBaseSize(width, height, { rotation, crop }) {
  const oriented = getOrientedSize(width, height, rotation)
  const rect = getCropRect(oriented.width, oriented.height, getCropRatio(crop))
  return { width: clampSize(rect.width), height: clampSize(rect.height) }
}

// Draws the original image onto the canvas with rotation, flip, crop and
// resize applied. The source image itself is never modified. The preview is
// capped at maxSide; exports pass Infinity for the full output size.
export function renderTransformed(
  canvas,
  source,
  transform,
  outputSize,
  maxSide = getPreviewMaxSide(),
) {
  const { rotation, flipH, flipV, crop } = transform
  const sourceWidth = source.naturalWidth
  const sourceHeight = source.naturalHeight
  const oriented = getOrientedSize(sourceWidth, sourceHeight, rotation)
  const rect = getCropRect(oriented.width, oriented.height, getCropRatio(crop))

  const scale = Math.min(
    1,
    maxSide / Math.max(outputSize.width, outputSize.height),
  )
  canvas.width = Math.max(1, Math.round(outputSize.width * scale))
  canvas.height = Math.max(1, Math.round(outputSize.height * scale))

  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'

  // Read bottom-up: rotate the image about its centre, flip it on screen
  // axes, move it into the oriented frame, then map the crop onto the canvas.
  // save/restore so anything drawn afterwards (export decorations) isn't
  // rotated or flipped too.
  ctx.save()
  ctx.scale(canvas.width / rect.width, canvas.height / rect.height)
  ctx.translate(-rect.x, -rect.y)
  ctx.translate(oriented.width / 2, oriented.height / 2)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(source, -sourceWidth / 2, -sourceHeight / 2)
  ctx.restore()
}
