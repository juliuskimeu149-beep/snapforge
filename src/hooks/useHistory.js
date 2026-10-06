import { useCallback, useRef, useState } from 'react'

// Changes with the same key this close together become one undo step, so a
// slider drag, a sticker drag or a burst of typing undoes in one go
const MERGE_WINDOW_MS = 800
const MAX_STEPS = 100

// Undo / redo over an immutable document. Every edit replaces `present`
// with a new object; past and future hold earlier and undone versions.
export function useHistory(initial) {
  const [history, setHistory] = useState({
    past: [],
    present: initial,
    future: [],
  })
  const lastCommitRef = useRef({ key: null, time: 0 })

  // update: new document, or (document) => new document. Returning the same
  // document means "no change" and records nothing.
  const commit = useCallback((update, key = null) => {
    const now = Date.now()
    const last = lastCommitRef.current
    const merge =
      key !== null && last.key === key && now - last.time < MERGE_WINDOW_MS
    lastCommitRef.current = { key, time: now }

    setHistory((current) => {
      const next =
        typeof update === 'function' ? update(current.present) : update
      if (next === current.present) return current
      if (merge) return { ...current, present: next, future: [] }
      return {
        past: [...current.past, current.present].slice(-MAX_STEPS),
        present: next,
        future: [],
      }
    })
  }, [])

  // Changes that shouldn't be their own undo step (e.g. bringing a selected
  // sticker to the front)
  const replace = useCallback((update) => {
    setHistory((current) => {
      const next = update(current.present)
      return next === current.present ? current : { ...current, present: next }
    })
  }, [])

  const undo = useCallback(() => {
    lastCommitRef.current = { key: null, time: 0 }
    setHistory((current) => {
      if (current.past.length === 0) return current
      return {
        past: current.past.slice(0, -1),
        present: current.past[current.past.length - 1],
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    lastCommitRef.current = { key: null, time: 0 }
    setHistory((current) => {
      if (current.future.length === 0) return current
      return {
        past: [...current.past, current.present],
        present: current.future[0],
        future: current.future.slice(1),
      }
    })
  }, [])

  // Start over with no history (e.g. a new photo)
  const reset = useCallback((document) => {
    lastCommitRef.current = { key: null, time: 0 }
    setHistory({ past: [], present: document, future: [] })
  }, [])

  return {
    present: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    commit,
    replace,
    undo,
    redo,
    reset,
  }
}

// Updater for one top-level part of the document, e.g. 'adjustments'
export function sliceUpdater(history, name) {
  return (update, key) =>
    history.commit((document) => {
      const value =
        typeof update === 'function' ? update(document[name]) : update
      return value === document[name] ? document : { ...document, [name]: value }
    }, key)
}
