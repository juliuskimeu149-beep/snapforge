import { useRef } from 'react'
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
} from '../../constants/app.js'
import './UploadButton.css'

const ACCEPT = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_IMAGE_EXTENSIONS].join(',')

function UploadButton({
  onSelect,
  variant = 'primary',
  label = 'Upload Photo',
  tooltip,
}) {
  const inputRef = useRef(null)

  function handleChange(event) {
    onSelect(event.target.files?.[0])
    // Reset so choosing the same file again still fires onChange
    event.target.value = ''
  }

  return (
    <>
      <button
        type="button"
        className={`upload-button upload-button--${variant}`}
        // Keeps the button named when small screens show only the icon
        aria-label={label}
        data-tooltip={tooltip}
        onClick={() => inputRef.current?.click()}
      >
        <svg
          className="upload-button__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 16V4m0 0-5 5m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <span className="upload-button__label">{label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        hidden
      />
    </>
  )
}

export default UploadButton
