import { useId, useState } from 'react'
import './NumberField.css'

// Whole-number input that applies valid values as you type and restores
// the last valid value if left empty or out of range.
function NumberField({ label, value, min = 1, suffix, disabled, onCommit }) {
  const id = useId()
  const text = value == null ? '' : String(value)
  const [draft, setDraft] = useState(text)
  const [syncedText, setSyncedText] = useState(text)

  // Follow outside changes (e.g. the other side of a locked ratio)
  if (text !== syncedText) {
    setSyncedText(text)
    setDraft(text)
  }

  function handleChange(event) {
    const next = event.target.value.replace(/\D/g, '')
    setDraft(next)
    if (next !== '' && Number(next) >= min) onCommit(Number(next))
  }

  return (
    <div className="number-field">
      <label className="number-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="number-field__box">
        <input
          id={id}
          className="number-field__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draft}
          disabled={disabled}
          onChange={handleChange}
          onBlur={() => setDraft(text)}
          onFocus={(event) => event.target.select()}
        />
        {suffix && <span className="number-field__suffix">{suffix}</span>}
      </div>
    </div>
  )
}

export default NumberField
