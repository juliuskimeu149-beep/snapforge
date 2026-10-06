import { useCallback, useState } from 'react'
import {
  DEFAULT_BRUSH,
  DEFAULT_STICKER_SIZE,
  DEFAULT_TEXT,
} from '../constants/decorations.js'

// crypto.randomUUID needs HTTPS, which phones testing over the LAN won't have
let nextId = 1
const createId = () => `decoration-${nextId++}`

const topZ = (items) => Math.max(0, ...items.map((item) => item.z))

// Text and sticker overlays plus drawing strokes. These live in the editor
// document (so undo / redo cover them); selection, Draw mode and brush
// settings are interface state and are not part of the history.
// Item x / y are fractions (0–1) of the photo's width / height.
//
// Every action is a stable function (it only uses history.commit / replace,
// which never change), so memoised overlays don't re-render while, say, a
// brightness slider is dragged.
export function useDecorations(history) {
  const { items, strokes } = history.present
  const { commit, replace } = history
  const [selectedId, setSelectedId] = useState(null)
  const [drawMode, setDrawModeState] = useState(false)
  const [brush, setBrushState] = useState(DEFAULT_BRUSH)

  const addItem = useCallback(
    (item) => {
      commit((document) => ({
        ...document,
        items: [...document.items, { ...item, z: topZ(document.items) + 1 }],
      }))
      setSelectedId(item.id)
      setDrawModeState(false)
      return item.id
    },
    [commit],
  )

  // Returns the new item's id
  const addText = useCallback(
    () => addItem({ id: createId(), type: 'text', x: 0.5, y: 0.5, ...DEFAULT_TEXT }),
    [addItem],
  )

  // Slight random offset so repeated stickers don't stack exactly
  const addSticker = useCallback(
    (emoji) => {
      const near = () => 0.5 + (Math.random() - 0.5) * 0.2
      return addItem({
        id: createId(),
        type: 'sticker',
        emoji,
        x: near(),
        y: near(),
        size: DEFAULT_STICKER_SIZE,
      })
    },
    [addItem],
  )

  // Repeated changes to the same properties of the same item (a drag, typing,
  // a size slider) group into one undo step
  const updateItem = useCallback(
    (id, patch) => {
      const key = `item:${id}:${Object.keys(patch).sort().join(',')}`
      commit(
        (document) => ({
          ...document,
          items: document.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        }),
        key,
      )
    },
    [commit],
  )

  const deleteItem = useCallback(
    (id) => {
      commit((document) => ({
        ...document,
        items: document.items.filter((item) => item.id !== id),
      }))
      setSelectedId((current) => (current === id ? null : current))
    },
    [commit],
  )

  // Selecting brings the item to the front; that's not an undo step
  const select = useCallback(
    (id) => {
      setSelectedId(id)
      if (id == null) return
      replace((document) => {
        const target = document.items.find((item) => item.id === id)
        const z = topZ(document.items)
        if (!target || target.z === z) return document
        return {
          ...document,
          items: document.items.map((item) =>
            item.id === id ? { ...item, z: z + 1 } : item,
          ),
        }
      })
    },
    [replace],
  )

  const setDrawMode = useCallback((on) => {
    setDrawModeState(on)
    if (on) setSelectedId(null)
  }, [])

  const setBrush = useCallback((patch) => {
    setBrushState((current) => ({ ...current, ...patch }))
  }, [])

  const addStroke = useCallback(
    (stroke) => {
      commit((document) => ({
        ...document,
        strokes: [...document.strokes, stroke],
      }))
    },
    [commit],
  )

  const clearDrawing = useCallback(() => {
    commit((document) =>
      document.strokes.length ? { ...document, strokes: [] } : document,
    )
  }, [commit])

  // Clears selection and Draw mode (brush settings are kept)
  const resetUi = useCallback(() => {
    setSelectedId(null)
    setDrawModeState(false)
  }, [])

  return {
    items,
    strokes,
    // An undo can remove the selected item, so only report one that exists
    selectedId: items.some((item) => item.id === selectedId) ? selectedId : null,
    drawMode,
    brush,
    addText,
    addSticker,
    updateItem,
    deleteItem,
    select,
    setDrawMode,
    setBrush,
    addStroke,
    clearDrawing,
    resetUi,
  }
}
