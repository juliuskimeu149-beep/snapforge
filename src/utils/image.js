import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
} from '../constants/app.js'

// Some browsers report an empty MIME type, so fall back to the extension
export function isAcceptedImage(file) {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true
  const name = file.name.toLowerCase()
  return ACCEPTED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))
}

// Small centre-square copy of an image for preview tiles
export function createThumbnail(source, size = 160) {
  const side = Math.min(source.naturalWidth, source.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    source,
    (source.naturalWidth - side) / 2,
    (source.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  )
  return canvas.toDataURL('image/jpeg', 0.85)
}
