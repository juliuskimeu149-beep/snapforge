import './SegmentedControl.css'

// Single-choice row of buttons (behaves as a radio group)
function SegmentedControl({ options, value, onChange, disabled, labelledBy }) {
  return (
    <div className="segmented" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className="segmented__option"
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
