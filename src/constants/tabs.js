// The four editing sections, in tab order
export const EDITOR_TABS = [
  { key: 'adjust', label: 'Adjust', description: 'Light and colour' },
  { key: 'transform', label: 'Transform', description: 'Rotate, flip, crop and resize' },
  { key: 'filters', label: 'Filters', description: 'One-tap looks' },
  { key: 'decorate', label: 'Decorate', description: 'Text, stickers and drawing' },
]

export const tabId = (key) => `editor-tab-${key}`
export const panelId = (key) => `editor-panel-${key}`
