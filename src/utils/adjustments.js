// Exposure scales the light (multiplier); brightness lifts every tone
// evenly (offset). Both are combined into one linear transfer: in * slope + intercept.
export function getToneTransfer({ brightness, exposure }) {
  return {
    slope: 2 ** exposure,
    intercept: brightness / 250,
  }
}

// Builds the CSS `filter` value for the preview image. `toneFilterId`
// points at the SVG filter that applies getToneTransfer().
export function getPreviewFilter(adjustments, toneFilterId) {
  const { brightness, contrast, saturation, exposure } = adjustments
  const filters = []

  if (brightness !== 0 || exposure !== 0) filters.push(`url(#${toneFilterId})`)
  if (contrast !== 0) filters.push(`contrast(${1 + contrast / 100})`)
  if (saturation !== 0) filters.push(`saturate(${1 + saturation / 100})`)

  return filters.length ? filters.join(' ') : 'none'
}
