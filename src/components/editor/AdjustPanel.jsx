import { ADJUSTMENTS } from '../../constants/adjustments.js'
import PanelSection from '../ui/PanelSection.jsx'
import Slider from '../ui/Slider.jsx'
import './AdjustPanel.css'

function AdjustPanel({ adjustments, onChange, onReset, canReset, disabled }) {
  return (
    <PanelSection
      title="Adjust"
      description="Light and colour"
      resetLabel="Reset Adjustments"
      onReset={onReset}
      canReset={canReset}
      disabled={disabled}
    >
      <div className="adjust-panel__controls">
        {ADJUSTMENTS.map(({ key, label, min, max, step, format }) => (
          <Slider
            key={key}
            label={label}
            value={adjustments[key]}
            min={min}
            max={max}
            defaultValue={0}
            step={step}
            format={format}
            disabled={disabled}
            onChange={(value) => onChange(key, value)}
          />
        ))}
      </div>
    </PanelSection>
  )
}

export default AdjustPanel
