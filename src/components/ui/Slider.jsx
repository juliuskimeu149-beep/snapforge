import { useId } from 'react'
import './Slider.css'

// Range input whose filled track grows outward from the neutral value,
// so negative and positive adjustments read clearly. With `defaultValue`,
// double-clicking the slider puts it back to that value.
function Slider({
  label,
  value,
  min,
  max,
  step,
  neutral = 0,
  defaultValue,
  format = String,
  disabled,
  onChange,
}) {
  const id = useId()
  const toPercent = (v) => ((v - min) / (max - min)) * 100
  const from = Math.min(toPercent(value), toPercent(neutral))
  const to = Math.max(toPercent(value), toPercent(neutral))
  const resettable = defaultValue !== undefined
  const changed = resettable && value !== defaultValue

  return (
    <div className={`slider${changed ? ' is-changed' : ''}`}>
      <div className="slider__header">
        <label className="slider__label" htmlFor={id}>
          {label}
        </label>
        <output className="slider__value" htmlFor={id}>
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        className="slider__input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        title={resettable ? 'Double-click to reset' : undefined}
        style={{ '--fill-from': `${from}%`, '--fill-to': `${to}%` }}
        onChange={(event) => onChange(Number(event.target.value))}
        onDoubleClick={resettable ? () => onChange(defaultValue) : undefined}
      />
    </div>
  )
}

export default Slider
