import './Switch.css'

// Checkbox styled as an on/off switch
function Switch({ label, checked, disabled, onChange }) {
  return (
    <label className="switch">
      <span className="switch__label">{label}</span>
      <input
        className="switch__input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch__track" aria-hidden="true" />
    </label>
  )
}

export default Switch
