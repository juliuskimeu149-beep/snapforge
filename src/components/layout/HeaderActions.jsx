import { memo, useId } from 'react'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import UploadButton from '../ui/UploadButton.jsx'
import './HeaderActions.css'

const ICON_PATHS = {
  undo: ['M9 14 4 9l5-5', 'M4 9h11a5 5 0 0 1 0 10h-3'],
  redo: ['m15 14 5-5-5-5', 'M20 9H9a5 5 0 0 0 0 10h3'],
  reset: [
    'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
    'M3 3v5h5',
    'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16',
    'M16 16h5v5',
  ],
  export: ['M12 4v12m0 0-5-5m5 5 5-5', 'M4 20h16'],
  // Split view: original | edited
  compare: [
    'M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3',
    'M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3',
    'M12 3v18',
  ],
}

const COMPARE_OPTIONS = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
]

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl+'

// Icon + label button; the label hides on smaller screens and the tooltip
// (mouse / keyboard) explains it, including its shortcut
function HeaderButton({
  icon,
  label,
  tooltip,
  shortcut,
  primary,
  pressed,
  align,
  className = '',
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`header-button${primary ? ' header-button--primary' : ''} ${className}`}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      aria-pressed={pressed}
      data-tooltip={shortcut ? `${tooltip ?? label} (${shortcut})` : (tooltip ?? label)}
      data-tooltip-align={align}
      disabled={disabled}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {ICON_PATHS[icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <span className="header-button__label">{label}</span>
    </button>
  )
}

function HeaderActions({
  canUndo,
  canRedo,
  canReset,
  showBefore,
  onUndo,
  onRedo,
  onCompare,
  onResetAll,
  onUpload,
  onExport,
}) {
  const compareLabelId = useId()

  return (
    <div className="header-actions">
      <div className="header-actions__group">
        <HeaderButton
          icon="undo"
          label="Undo"
          tooltip={canUndo ? 'Undo last edit' : 'Nothing to undo'}
          shortcut={`${MOD}Z`}
          disabled={!canUndo}
          onClick={onUndo}
        />
        <HeaderButton
          icon="redo"
          label="Redo"
          tooltip={canRedo ? 'Redo' : 'Nothing to redo'}
          shortcut={isMac ? '⇧⌘Z' : 'Ctrl+Y'}
          disabled={!canRedo}
          onClick={onRedo}
        />
      </div>

      <span className="header-actions__divider" aria-hidden="true" />

      {/* Wider screens: a Before | After switch */}
      <div
        className="header-compare"
        data-tooltip="Compare with the original photo"
      >
        <span id={compareLabelId} className="visually-hidden">
          Compare with original
        </span>
        <SegmentedControl
          options={COMPARE_OPTIONS}
          value={showBefore ? 'before' : 'after'}
          onChange={(value) => onCompare(value === 'before')}
          labelledBy={compareLabelId}
        />
      </div>
      {/* Phones: one toggle button, lit up while showing the original */}
      <HeaderButton
        icon="compare"
        label={showBefore ? 'Showing Before' : 'Before / After'}
        tooltip="Compare with the original photo"
        pressed={showBefore}
        className="header-button--compare"
        onClick={() => onCompare(!showBefore)}
      />

      <HeaderButton
        icon="reset"
        label="Reset All"
        tooltip={canReset ? 'Remove every edit' : 'No edits to reset'}
        disabled={!canReset}
        onClick={onResetAll}
      />

      <span className="header-actions__divider" aria-hidden="true" />

      <UploadButton
        onSelect={onUpload}
        variant="secondary"
        tooltip="Open a different photo"
      />
      <HeaderButton
        icon="export"
        label="Export"
        tooltip="Download the edited photo"
        primary
        align="end"
        onClick={onExport}
      />
    </div>
  )
}

// Memoised: props are flags plus stable callbacks, so slider drags skip it
export default memo(HeaderActions)
