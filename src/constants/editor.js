import { DEFAULT_ADJUSTMENTS } from './adjustments.js'
import { DEFAULT_FILTER } from './filters.js'
import { DEFAULT_TRANSFORM } from './transform.js'

// Every edit lives in this one document, which is what undo / redo
// snapshot. The uploaded photo itself is never part of it.
export const DEFAULT_DOCUMENT = {
  adjustments: DEFAULT_ADJUSTMENTS,
  transform: DEFAULT_TRANSFORM,
  filter: DEFAULT_FILTER,
  items: [], // text and stickers
  strokes: [], // drawing
}

const sameValues = (value, defaults) =>
  Object.keys(defaults).every((key) => value[key] === defaults[key])

// True when there is nothing for Reset All to remove
export function isUneditedDocument(document) {
  return (
    sameValues(document.adjustments, DEFAULT_ADJUSTMENTS) &&
    sameValues(document.transform, DEFAULT_TRANSFORM) &&
    document.filter.preset === DEFAULT_FILTER.preset &&
    document.items.length === 0 &&
    document.strokes.length === 0
  )
}
