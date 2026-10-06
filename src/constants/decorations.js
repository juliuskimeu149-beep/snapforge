// Text, sticker and brush sizes are measured against a 400px-wide photo
// and scale with the photo on screen, so decorations keep their proportions.
export const REFERENCE_WIDTH = 400

// Shared by the on-screen overlays and the exported image so they match
export const TEXT_FONT_FAMILY =
  "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
export const EMOJI_FONT_FAMILY =
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"
export const TEXT_LINE_HEIGHT = 1.15
export const STICKER_LINE_HEIGHT = 1
// Text shadow as fractions of the photo width (offset y, blur)
export const TEXT_SHADOW = { offsetY: 0.0025, blur: 0.0075, color: 'rgb(0 0 0 / 0.35)' }

export const STICKERS = ['❤️', '😂', '🔥', '✨', '⭐', '😎', '🎉', '💯', '😍', '👍', '🌈', '🌸']

export const COLOR_SWATCHES = [
  { value: '#ffffff', name: 'White' },
  { value: '#111111', name: 'Black' },
  { value: '#ff3b30', name: 'Red' },
  { value: '#ff9500', name: 'Orange' },
  { value: '#ffcc00', name: 'Yellow' },
  { value: '#34c759', name: 'Green' },
  { value: '#0a84ff', name: 'Blue' },
  { value: '#bf5af2', name: 'Purple' },
]

export const FONT_WEIGHTS = [
  { value: 400, label: 'Regular' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 900, label: 'Black' },
]

export const BRUSH_TOOLS = [
  { value: 'brush', label: 'Brush' },
  { value: 'eraser', label: 'Eraser' },
]

export const TEXT_SIZE = { min: 12, max: 120 }
export const STICKER_SIZE = { min: 24, max: 200 }
export const BRUSH_SIZE = { min: 1, max: 60 }

export const DEFAULT_TEXT = {
  text: 'Your text',
  size: 36,
  color: '#ffffff',
  weight: 700,
}
export const DEFAULT_STICKER_SIZE = 64
export const DEFAULT_BRUSH = { tool: 'brush', size: 8, color: '#ff3b30' }
