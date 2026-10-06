import { memo, useEffect, useId, useRef } from 'react'
import './ConfirmDialog.css'

// Modal confirmation built on <dialog>: traps focus, closes on Escape or a
// click outside, and starts with focus on the safe (Cancel) choice.
function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClose={onCancel}
      // The dialog element itself is only hit when clicking the backdrop
      onClick={(event) => event.target === dialogRef.current && onCancel()}
    >
      <div className="confirm-dialog__body">
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        <p id={messageId} className="confirm-dialog__message">
          {message}
        </p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-dialog__confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default memo(ConfirmDialog)
