// Crop presets; ratio is width / height (null = keep the full image)
export const CROP_RATIOS = [
  { key: 'free', label: 'Free', ratio: null },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '4:5', label: '4:5', ratio: 4 / 5 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
]

// Largest allowed output width or height, in pixels
export const MAX_OUTPUT_SIZE = 8192

// The preview canvas is capped so huge outputs stay fast and within
// mobile browser canvas limits; the displayed result looks the same
export const PREVIEW_MAX_SIDE = 4096

export const DEFAULT_TRANSFORM = {
  rotation: 0, // 0, 90, 180 or 270, clockwise
  flipH: false,
  flipV: false,
  crop: 'free',
  size: null, // { width, height } once resized; null = natural size
  lockAspect: true,
  aspect: null, // locked width / height; null = use the natural ratio
}
