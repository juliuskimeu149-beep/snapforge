import { useEffect, useId, useRef, useState } from 'react'
import {
  EXPORT_FORMATS,
  EXPORT_QUALITY,
  getExportFormat,
} from '../../constants/export.js'
import { downloadBlob, ExportError, formatFileSize } from '../../utils/export.js'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import Slider from '../ui/Slider.jsx'
import './ExportDialog.css'

// Mounted only while open, so each opening starts fresh; the chosen format
// and quality live in the parent and are remembered between exports.
function ExportDialog({ settings, onSettingsChange, outputSize, onExport, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const formatLabelId = useId()
  // idle | exporting | done | error
  const [status, setStatus] = useState({ state: 'idle' })
  const exporting = status.state === 'exporting'
  const format = getExportFormat(settings.format)

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  async function handleExport() {
    setStatus({ state: 'exporting' })
    try {
      const { blob, filename } = await onExport(settings)
      downloadBlob(blob, filename)
      setStatus({ state: 'done', filename, size: blob.size })
    } catch (error) {
      console.error(error)
      setStatus({
        state: 'error',
        message:
          error instanceof ExportError
            ? error.message
            : 'Export failed. Please try again.',
      })
    }
  }

  function update(patch) {
    onSettingsChange({ ...settings, ...patch })
    if (status.state !== 'exporting') setStatus({ state: 'idle' })
  }

  return (
    <dialog
      ref={dialogRef}
      className="export-dialog"
      aria-labelledby={titleId}
      aria-busy={exporting}
      // Escape: don't close in the middle of an export
      onCancel={(event) => exporting && event.preventDefault()}
      onClose={onClose}
      onClick={(event) =>
        event.target === dialogRef.current && !exporting && onClose()
      }
    >
      <div className="export-dialog__body">
        <div className="export-dialog__header">
          <h2 id={titleId} className="export-dialog__title">
            Export Photo
          </h2>
          <span className="export-dialog__size">
            {outputSize.width} × {outputSize.height} px
          </span>
        </div>

        <div className="export-dialog__group">
          <span id={formatLabelId} className="export-dialog__label">
            Format
          </span>
          <SegmentedControl
            options={EXPORT_FORMATS}
            value={settings.format}
            onChange={(value) => update({ format: value })}
            disabled={exporting}
            labelledBy={formatLabelId}
          />
          <p className="export-dialog__hint">{format.hint}</p>
        </div>

        {/* PNG is lossless, so quality doesn't apply */}
        {format.lossy && (
          <Slider
            label="Quality"
            value={settings.quality}
            min={EXPORT_QUALITY.min}
            max={EXPORT_QUALITY.max}
            step={1}
            neutral={EXPORT_QUALITY.min}
            format={(value) => `${value}%`}
            disabled={exporting}
            onChange={(value) => update({ quality: value })}
          />
        )}

        <div className="export-dialog__status" aria-live="polite">
          {status.state === 'error' && (
            <p className="export-dialog__error" role="alert">
              {status.message}
            </p>
          )}
          {status.state === 'done' && (
            <p className="export-dialog__success">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 5 5 9-10" />
              </svg>
              Downloaded {status.filename} · {formatFileSize(status.size)}
            </p>
          )}
        </div>

        <div className="export-dialog__actions">
          <button
            type="button"
            className="export-dialog__cancel"
            onClick={onClose}
            disabled={exporting}
          >
            {status.state === 'done' ? 'Close' : 'Cancel'}
          </button>
          <button
            type="button"
            className="export-dialog__download"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <span className="export-dialog__spinner" aria-hidden="true" />
                Exporting…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v12m0 0-5-5m5 5 5-5M4 20h16" />
                </svg>
                {status.state === 'done' ? 'Download Again' : 'Download Photo'}
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ExportDialog
