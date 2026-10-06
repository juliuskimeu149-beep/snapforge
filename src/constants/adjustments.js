const formatSigned = (value) => (value > 0 ? `+${value}` : `${value}`)

// Slider definitions for the Adjust panel. All defaults are 0 (no change).
export const ADJUSTMENTS = [
  {
    key: 'brightness',
    label: 'Brightness',
    min: -100,
    max: 100,
    step: 1,
    format: formatSigned,
  },
  {
    key: 'contrast',
    label: 'Contrast',
    min: -100,
    max: 100,
    step: 1,
    format: formatSigned,
  },
  {
    key: 'saturation',
    label: 'Saturation',
    min: -100,
    max: 100,
    step: 1,
    format: formatSigned,
  },
  {
    // Measured in stops (EV): +1 doubles the light, -1 halves it
    key: 'exposure',
    label: 'Exposure',
    min: -2,
    max: 2,
    step: 0.1,
    format: (value) => formatSigned(Number(value.toFixed(1))),
  },
]

export const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
}
