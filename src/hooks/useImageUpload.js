import { useEffect, useState } from 'react'
import { isAcceptedImage } from '../utils/image.js'

// Holds the current photo (object URL + decoded element). The decoded element
// is the untouched original that every preview and export is drawn from.
export function useImageUpload() {
  const [image, setImage] = useState(null)

  // Free the previous object URL when the image changes or on unmount
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url)
    }
  }, [image])

  // Resolves to { ok: true } or { ok: false, error } with a message to show
  async function selectFile(file) {
    if (!file) return { ok: false, error: null }
    if (!isAcceptedImage(file)) {
      return {
        ok: false,
        error: `“${file.name}” isn't a supported image. Please choose a JPG, PNG or WebP photo.`,
      }
    }

    const url = URL.createObjectURL(file)
    const element = new Image()
    element.src = url
    try {
      await element.decode()
    } catch {
      URL.revokeObjectURL(url)
      return {
        ok: false,
        error: `“${file.name}” couldn't be opened. The file may be damaged — try another photo.`,
      }
    }

    setImage({
      url,
      name: file.name,
      element,
      width: element.naturalWidth,
      height: element.naturalHeight,
    })
    return { ok: true }
  }

  return { image, selectFile }
}
