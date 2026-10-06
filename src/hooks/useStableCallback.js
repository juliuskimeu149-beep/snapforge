import { useCallback, useLayoutEffect, useRef } from 'react'

// A function whose identity never changes but which always runs the latest
// version of `fn`. Lets memoised children skip re-rendering when the parent
// re-renders (e.g. on every slider step) without reading stale state.
export function useStableCallback(fn) {
  const ref = useRef(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback((...args) => ref.current(...args), [])
}
