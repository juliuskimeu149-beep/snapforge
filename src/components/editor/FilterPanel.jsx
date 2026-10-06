import { useId } from 'react'
import { FILTER_PRESETS } from '../../constants/filters.js'
import { toSvgValues } from '../../utils/colorMatrix.js'
import PanelSection from '../ui/PanelSection.jsx'
import Slider from '../ui/Slider.jsx'
import './FilterPanel.css'

// thumbnail: small copy of the photo, made once per photo by the parent
function FilterPanel({ image, thumbnail, filter, onPreset, onIntensity }) {
  const titleId = useId()
  // useId output may contain characters that aren't valid in url(#...)
  const idBase = `tile-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const disabled = !image

  return (
    <PanelSection title="Filters" description="One-tap looks, mixed to taste">
      {/* Full-strength version of each preset, used by the tiles */}
      <svg className="filter-panel__defs" aria-hidden="true">
        {FILTER_PRESETS.map(({ key, matrix }) => (
          <filter
            key={key}
            id={`${idBase}-${key}`}
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix type="matrix" values={toSvgValues(matrix)} />
          </filter>
        ))}
      </svg>

      <span id={titleId} className="visually-hidden">
        Filter presets
      </span>
      <div className="filter-tiles" role="radiogroup" aria-labelledby={titleId}>
        {FILTER_PRESETS.map(({ key, label }) => {
          const active = filter.preset === key
          const style =
            key === 'original' ? undefined : { filter: `url(#${idBase}-${key})` }
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              className="filter-tile"
              disabled={disabled}
              onClick={() => onPreset(key)}
            >
              <span className="filter-tile__preview">
                {thumbnail ? (
                  <img src={thumbnail} alt="" style={style} />
                ) : (
                  <span className="filter-tile__sample" style={style} />
                )}
                {active && (
                  <svg
                    className="filter-tile__check"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
              </span>
              <span className="filter-tile__label">{label}</span>
            </button>
          )
        })}
      </div>

      <Slider
        label="Intensity"
        value={filter.intensity}
        min={0}
        max={100}
        defaultValue={100}
        step={1}
        format={(value) => `${value}%`}
        disabled={disabled || filter.preset === 'original'}
        onChange={onIntensity}
      />
    </PanelSection>
  )
}

export default FilterPanel
