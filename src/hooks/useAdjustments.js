import { DEFAULT_ADJUSTMENTS } from '../constants/adjustments.js'
import { sliceUpdater } from './useHistory.js'

// Preview-only adjustment values; the original image is never modified
export function useAdjustments(history) {
  const adjustments = history.present.adjustments
  const update = sliceUpdater(history, 'adjustments')

  const isDefault = Object.keys(DEFAULT_ADJUSTMENTS).every(
    (key) => adjustments[key] === DEFAULT_ADJUSTMENTS[key],
  )

  // One undo step per slider drag
  function setAdjustment(key, value) {
    update(
      (current) => (current[key] === value ? current : { ...current, [key]: value }),
      `adjust:${key}`,
    )
  }

  function resetAdjustments() {
    if (!isDefault) update(DEFAULT_ADJUSTMENTS)
  }

  return { adjustments, setAdjustment, resetAdjustments, isDefault }
}
