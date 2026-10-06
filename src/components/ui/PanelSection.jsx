import { useId } from 'react'
import './PanelSection.css'

// One editing section: a header (title, short description, optional reset)
// that stays pinned while the section's controls scroll beneath it
function PanelSection({
  title,
  description,
  resetLabel,
  onReset,
  canReset,
  disabled,
  children,
}) {
  const titleId = useId()

  return (
    <section className="panel-section" aria-labelledby={titleId}>
      <div className="panel-section__header">
        <div className="panel-section__heading">
          <h2 id={titleId} className="panel-section__title">
            {title}
          </h2>
          {description && (
            <p className="panel-section__description">{description}</p>
          )}
        </div>
        {onReset && (
          <button
            type="button"
            className="panel-section__reset"
            onClick={onReset}
            disabled={disabled || !canReset}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {resetLabel}
          </button>
        )}
      </div>
      <div className="panel-section__body">{children}</div>
    </section>
  )
}

export default PanelSection
