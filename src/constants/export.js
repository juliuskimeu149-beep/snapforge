export const EXPORT_FORMATS = [
  {
    value: 'png',
    label: 'PNG',
    mime: 'image/png',
    extension: 'png',
    lossy: false,
    hint: 'Lossless and keeps transparency. Largest files.',
  },
  {
    value: 'jpeg',
    label: 'JPEG',
    mime: 'image/jpeg',
    extension: 'jpg',
    lossy: true,
    hint: 'Best for sharing photos. Small files, works everywhere.',
  },
  {
    value: 'webp',
    label: 'WebP',
    mime: 'image/webp',
    extension: 'webp',
    lossy: true,
    hint: 'Modern format. Smaller than JPEG at the same quality.',
  },
]

export const EXPORT_QUALITY = { min: 10, max: 100, default: 90 }
export const DEFAULT_EXPORT_SETTINGS = {
  format: 'jpeg',
  quality: EXPORT_QUALITY.default,
}
export const EXPORT_BASE_NAME = 'edited-photo'

export function getExportFormat(value) {
  return EXPORT_FORMATS.find((format) => format.value === value)
}
