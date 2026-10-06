import { useId } from 'react'
import { COLOR_SWATCHES } from '../../constants/decorations.js'
import './ColorSwatches.css'

// Preset colour dots plus a custom colour picker
function ColorSwatches({ label, value, onChange, disabled }) {
  const labelId = useId()
  const isCustom = !COLOR_SWATCHES.some((swatch) => swatch.value === value)

  return (
    <div className="color-swatches">
      <span id={labelId} className="color-swatches__label">
        {label}
      </span>
      <div
        className="color-swatches__list"
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch.value}
            type="button"
            role="radio"
            aria-checked={swatch.value === value}
            aria-label={swatch.name}
            className="color-swatch"
            style={{ '--swatch': swatch.value }}
            disabled={disabled}
            onClick={() => onChange(swatch.value)}
          />
        ))}
        <label
          className="color-swatch color-swatch--custom"
          data-checked={isCustom}
          style={isCustom ? { '--swatch': value } : undefined}
        >
          <input
            type="color"
            aria-label="Custom colour"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default ColorSwatches
