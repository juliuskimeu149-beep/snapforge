import { memo, useRef } from 'react'
import { EDITOR_TABS, panelId, tabId } from '../../constants/tabs.js'
import './EditorTabs.css'

const ICONS = {
  adjust: (
    <>
      <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
    </>
  ),
  transform: (
    <>
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </>
  ),
  filters: (
    <>
      <circle cx="9" cy="9" r="6" />
      <circle cx="15" cy="9" r="6" />
      <circle cx="12" cy="15" r="6" />
    </>
  ),
  decorate: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </>
  ),
}

// Section navigation: tabs along the top of the sidebar on desktop, a
// thumb-reachable bar along the bottom on phones. A dot marks sections that
// have edits.
function EditorTabs({ active, edited, onChange }) {
  const listRef = useRef(null)

  // Arrow keys / Home / End move between tabs (standard tablist behaviour)
  function handleKeyDown(event) {
    const index = EDITOR_TABS.findIndex((tab) => tab.key === active)
    const moves = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: EDITOR_TABS.length - 1,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    const next = EDITOR_TABS[(moves[event.key] + EDITOR_TABS.length) % EDITOR_TABS.length]
    onChange(next.key)
    listRef.current.querySelector(`#${tabId(next.key)}`)?.focus()
  }

  return (
    <div
      ref={listRef}
      className="editor-tabs"
      role="tablist"
      aria-label="Editing tools"
      onKeyDown={handleKeyDown}
    >
      {EDITOR_TABS.map(({ key, label }) => {
        const selected = key === active
        return (
          <button
            key={key}
            id={tabId(key)}
            type="button"
            role="tab"
            data-tab={key}
            aria-selected={selected}
            aria-controls={panelId(key)}
            tabIndex={selected ? 0 : -1}
            className="editor-tab"
            onClick={() => onChange(key)}
          >
            <span className="editor-tab__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {ICONS[key]}
              </svg>
              {edited[key] && (
                <span className="editor-tab__dot" aria-hidden="true" />
              )}
            </span>
            <span className="editor-tab__label">{label}</span>
            {edited[key] && <span className="visually-hidden">(edited)</span>}
          </button>
        )
      })}
    </div>
  )
}

export default memo(EditorTabs)
