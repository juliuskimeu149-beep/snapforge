import { DEFAULT_TRANSFORM, MAX_OUTPUT_SIZE } from '../constants/transform.js'
import { clampSize, getBaseSize } from '../utils/transform.js'
import { sliceUpdater } from './useHistory.js'

// Preview-only rotate / flip / crop / resize settings for the current image
export function useTransform(image, history) {
  const transform = history.present.transform
  const setTransform = sliceUpdater(history, 'transform')

  const baseSize = image
    ? getBaseSize(image.width, image.height, transform)
    : null
  const outputSize = transform.size ?? baseSize
  const aspect =
    transform.aspect ?? (baseSize ? baseSize.width / baseSize.height : 1)

  // direction: -1 = left (counter-clockwise), 1 = right (clockwise)
  function rotate(direction) {
    setTransform((current) => {
      const rotation = (current.rotation + direction * 90 + 360) % 360
      // Without a crop ratio, a resize simply swaps sides
      if (current.crop === 'free' && current.size) {
        return {
          ...current,
          rotation,
          size: { width: current.size.height, height: current.size.width },
          aspect: current.aspect && 1 / current.aspect,
        }
      }
      return { ...current, rotation, size: null, aspect: null }
    })
  }

  function toggleFlip(axis) {
    setTransform((current) => ({ ...current, [axis]: !current[axis] }))
  }

  // A new crop changes the base size, so the resize starts over
  function setCrop(crop) {
    setTransform((current) => ({ ...current, crop, size: null, aspect: null }))
  }

  function setDimension(dimension, value) {
    if (!outputSize) return
    const { lockAspect } = transform
    let width = dimension === 'width' ? value : outputSize.width
    let height = dimension === 'height' ? value : outputSize.height
    if (lockAspect) {
      if (dimension === 'width') height = value / aspect
      else width = value * aspect
      // Shrink both sides together if either would pass the size limit
      const fit = Math.min(1, MAX_OUTPUT_SIZE / Math.max(width, height))
      width *= fit
      height *= fit
    }
    const size = { width: clampSize(width), height: clampSize(height) }
    // Typing a number is one undo step, not one per digit
    setTransform((current) => ({ ...current, size }), 'transform:resize')
  }

  // Locking keeps whatever ratio the output has right now
  function setLockAspect(lockAspect) {
    setTransform((current) => ({
      ...current,
      lockAspect,
      aspect:
        lockAspect && outputSize
          ? outputSize.width / outputSize.height
          : null,
    }))
  }

  const isDefault = Object.keys(DEFAULT_TRANSFORM).every(
    (key) => transform[key] === DEFAULT_TRANSFORM[key],
  )

  function resetTransform() {
    if (!isDefault) setTransform(DEFAULT_TRANSFORM)
  }

  return {
    transform,
    outputSize,
    rotate,
    toggleFlip,
    setCrop,
    setDimension,
    setLockAspect,
    resetTransform,
    isDefault,
  }
}
