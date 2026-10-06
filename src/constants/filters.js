import {
  IDENTITY,
  SEPIA,
  channels,
  contrast,
  mix,
  pipeline,
  saturation,
} from '../utils/colorMatrix.js'

// Filter presets as colour matrices; intensity blends from IDENTITY to these
export const FILTER_PRESETS = [
  { key: 'original', label: 'Original', matrix: IDENTITY },
  {
    key: 'bw',
    label: 'Black & White',
    matrix: pipeline(saturation(0), contrast(1.1)),
  },
  { key: 'sepia', label: 'Sepia', matrix: SEPIA },
  {
    key: 'vintage',
    label: 'Vintage',
    matrix: pipeline(
      saturation(0.8),
      mix(SEPIA, 0.4),
      contrast(0.85),
      channels([1, 0.97, 0.9], [0.06, 0.04, 0.02]),
    ),
  },
  {
    key: 'warm',
    label: 'Warm',
    matrix: channels([1.08, 1.01, 0.86], [0.02, 0.01, 0]),
  },
  {
    key: 'cool',
    label: 'Cool',
    matrix: channels([0.88, 1, 1.1], [0, 0.01, 0.03]),
  },
  {
    key: 'dramatic',
    label: 'Dramatic',
    matrix: pipeline(
      saturation(0.75),
      contrast(1.45),
      channels([1, 1, 1], [-0.03, -0.03, -0.03]),
    ),
  },
  {
    key: 'fade',
    label: 'Fade',
    matrix: pipeline(
      saturation(0.7),
      channels([0.8, 0.8, 0.8], [0.12, 0.12, 0.13]),
    ),
  },
  {
    key: 'vivid',
    label: 'Vivid',
    matrix: pipeline(saturation(1.6), contrast(1.12)),
  },
]

export const DEFAULT_FILTER = { preset: 'original', intensity: 100 }

export function getPresetMatrix(key) {
  return FILTER_PRESETS.find((preset) => preset.key === key)?.matrix ?? IDENTITY
}
