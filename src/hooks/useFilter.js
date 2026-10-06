import { sliceUpdater } from './useHistory.js'

// Preview-only filter preset and its intensity (0–100%)
export function useFilter(history) {
  const filter = history.present.filter
  const update = sliceUpdater(history, 'filter')

  function setPreset(preset) {
    update((current) =>
      current.preset === preset ? current : { ...current, preset },
    )
  }

  // One undo step per slider drag
  function setIntensity(intensity) {
    update(
      (current) =>
        current.intensity === intensity ? current : { ...current, intensity },
      'filter:intensity',
    )
  }

  return { filter, setPreset, setIntensity }
}
