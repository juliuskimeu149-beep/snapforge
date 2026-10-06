import { useId } from 'react'
import { CROP_RATIOS } from '../../constants/transform.js'
import NumberField from '../ui/NumberField.jsx'
import PanelSection from '../ui/PanelSection.jsx'
import SegmentedControl from '../ui/SegmentedControl.jsx'
import Switch from '../ui/Switch.jsx'
import './TransformPanel.css'

const CROP_OPTIONS = CROP_RATIOS.map(({ key, label }) => ({ value: key, label }))

const ICON_PATHS = {
  rotateLeft: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
  rotateRight: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  flipH: ['m3 7 5 5-5 5V7', 'm21 7-5 5 5 5V7', 'M12 2v20'],
  flipV: ['m7 3 5 5 5-5H7', 'm7 21 5-5 5 5H7', 'M2 12h20'],
}

function ActionButton({ icon, label, ariaLabel, pressed, disabled, onClick }) {
  return (
    <button
      type="button"
      className="transform-action"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {ICON_PATHS[icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <span>{label}</span>
    </button>
  )
}

function TransformPanel({
  image,
  transform,
  outputSize,
  onRotate,
  onFlip,
  onCrop,
  onResize,
  onLockAspect,
  onReset,
  canReset,
}) {
  const cropLabelId = useId()
  const disabled = !image

  return (
    <PanelSection
      title="Transform"
      description="Rotate, flip, crop and resize"
      resetLabel="Reset Transform"
      onReset={onReset}
      canReset={canReset}
      disabled={disabled}
    >
      <div className="transform-actions">
        <ActionButton
          icon="rotateLeft"
          label="Rotate Left"
          ariaLabel="Rotate left 90°"
          disabled={disabled}
          onClick={() => onRotate(-1)}
        />
        <ActionButton
          icon="rotateRight"
          label="Rotate Right"
          ariaLabel="Rotate right 90°"
          disabled={disabled}
          onClick={() => onRotate(1)}
        />
        <ActionButton
          icon="flipH"
          label="Flip Horizontal"
          ariaLabel="Flip horizontal"
          pressed={transform.flipH}
          disabled={disabled}
          onClick={() => onFlip('flipH')}
        />
        <ActionButton
          icon="flipV"
          label="Flip Vertical"
          ariaLabel="Flip vertical"
          pressed={transform.flipV}
          disabled={disabled}
          onClick={() => onFlip('flipV')}
        />
      </div>

      <div className="transform-group">
        <span id={cropLabelId} className="transform-group__label">
          Crop
        </span>
        <SegmentedControl
          options={CROP_OPTIONS}
          value={transform.crop}
          onChange={onCrop}
          disabled={disabled}
          labelledBy={cropLabelId}
        />
      </div>

      <div className="transform-group">
        <div className="transform-group__header">
          <span className="transform-group__label">Resize</span>
          {image && (
            <span className="transform-group__meta">
              Original {image.width} × {image.height}
            </span>
          )}
        </div>
        <div className="resize-fields">
          <NumberField
            label="Width"
            value={outputSize?.width}
            suffix="px"
            disabled={disabled}
            onCommit={(value) => onResize('width', value)}
          />
          <span className="resize-fields__times" aria-hidden="true">
            ×
          </span>
          <NumberField
            label="Height"
            value={outputSize?.height}
            suffix="px"
            disabled={disabled}
            onCommit={(value) => onResize('height', value)}
          />
        </div>
        <Switch
          label="Lock Aspect Ratio"
          checked={transform.lockAspect}
          disabled={disabled}
          onChange={onLockAspect}
        />
      </div>
    </PanelSection>
  )
}

export default TransformPanel
