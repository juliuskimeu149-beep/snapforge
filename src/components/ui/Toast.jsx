import { memo, useEffect } from 'react'
import './Toast.css'

// Short-lived message over the photo, optionally with one action (e.g. Undo).
// Errors stay a little longer and are announced immediately.
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, toast.tone === 'error' ? 6000 : 4000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div className="toast-region" aria-live="polite">
      {toast && (
        <div
          key={toast.id}
          className={`toast toast--${toast.tone ?? 'info'}`}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <svg className="toast__icon" viewBox="0 0 24 24" aria-hidden="true">
            {toast.tone === 'error' ? (
              <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            ) : (
              <path d="m5 12 5 5 9-10" />
            )}
          </svg>
          <span className="toast__message">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.action.onClick()
                onDismiss()
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(Toast)
