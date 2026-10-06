import { useCallback, useEffect, useMemo, useState } from 'react'
import { APP_NAME, APP_TAGLINE } from '../../constants/app.js'
import { DEFAULT_EXPORT_SETTINGS } from '../../constants/export.js'
import {
  DEFAULT_DOCUMENT,
  isUneditedDocument,
} from '../../constants/editor.js'
import { EDITOR_TABS, panelId, tabId } from '../../constants/tabs.js'
import { useAdjustments } from '../../hooks/useAdjustments.js'
import { useDecorations } from '../../hooks/useDecorations.js'
import { useFilter } from '../../hooks/useFilter.js'
import { useHistory } from '../../hooks/useHistory.js'
import { useImageUpload } from '../../hooks/useImageUpload.js'
import { useStableCallback } from '../../hooks/useStableCallback.js'
import { useTransform } from '../../hooks/useTransform.js'
import { exportImage } from '../../utils/export.js'
import { createThumbnail, isAcceptedImage } from '../../utils/image.js'
import AdjustPanel from '../editor/AdjustPanel.jsx'
import DecoratePanel from '../editor/DecoratePanel.jsx'
import EditorCanvas from '../editor/EditorCanvas.jsx'
import ExportDialog from '../editor/ExportDialog.jsx'
import FilterPanel from '../editor/FilterPanel.jsx'
import TransformPanel from '../editor/TransformPanel.jsx'
import AppLogo from '../ui/AppLogo.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import Toast from '../ui/Toast.jsx'
import EditorTabs from './EditorTabs.jsx'
import HeaderActions from './HeaderActions.jsx'
import './AppShell.css'

// Text fields keep their own native undo for Ctrl/⌘+Z
const TEXT_ENTRY =
  'textarea, [contenteditable], input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=color]):not([type=file])'

const hasFiles = (event) => [...(event.dataTransfer?.types ?? [])].includes('Files')

// Top-level layout: header, the photo, and the editing tools (a tabbed
// sidebar on desktop; a bottom sheet with a tab bar on phones).
function AppShell() {
  const { image, selectFile } = useImageUpload()
  const history = useHistory(DEFAULT_DOCUMENT)
  const { undo, redo } = history
  const { adjustments, setAdjustment, resetAdjustments, isDefault } =
    useAdjustments(history)
  const {
    transform,
    outputSize,
    rotate,
    toggleFlip,
    setCrop,
    setDimension,
    setLockAspect,
    resetTransform,
    isDefault: isTransformDefault,
  } = useTransform(image, history)
  const { filter, setPreset, setIntensity } = useFilter(history)
  const decorations = useDecorations(history)
  const { selectedId, drawMode, setDrawMode, select, resetUi } = decorations

  const [activeTab, setActiveTab] = useState(EDITOR_TABS[0].key)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  // Remembered between exports for this session
  const [exportSettings, setExportSettings] = useState(DEFAULT_EXPORT_SETTINGS)
  const [dragging, setDragging] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])
  const showToast = (next) => setToast({ id: Date.now(), ...next })

  // Made once per photo (not on every visit to the Filters tab)
  const thumbnail = useMemo(
    () => (image ? createThumbnail(image.element) : null),
    [image],
  )
  const edited = !isUneditedDocument(history.present)

  // Before shows the untouched upload. It's tied to the document it was
  // turned on for: any edit, undo or redo switches back to After for good
  // (cleared here, so undoing back to that document doesn't revive it).
  const [beforeFor, setBeforeFor] = useState(null)
  if (beforeFor !== null && beforeFor !== history.present) setBeforeFor(null)
  const showBefore = Boolean(image) && beforeFor === history.present

  // Tapping text or a sticker on the photo opens the Decorate tab, where its
  // controls are
  const [seenSelection, setSeenSelection] = useState(null)
  if (selectedId !== seenSelection) {
    setSeenSelection(selectedId)
    if (selectedId && activeTab !== 'decorate') setActiveTab('decorate')
  }

  const changeTab = useStableCallback((key) => {
    if (key !== 'decorate') {
      setDrawMode(false)
      select(null)
    }
    setActiveTab(key)
  })

  const setCompare = useStableCallback((before) => {
    setBeforeFor(before ? history.present : null)
    if (before) resetUi()
  })

  async function openFile(file) {
    const result = await selectFile(file)
    if (result.ok) {
      // A new photo starts with a fresh document and empty history
      history.reset(DEFAULT_DOCUMENT)
      resetUi()
      setBeforeFor(null)
      setToast(null)
    } else if (result.error) {
      showToast({ message: result.error, tone: 'error' })
    }
  }

  // Replacing a photo would throw away its edits, so ask first
  const requestOpen = useStableCallback((file) => {
    if (!file) return
    if (!isAcceptedImage(file)) {
      showToast({
        message: `“${file.name}” isn't a supported image. Please choose a JPG, PNG or WebP photo.`,
        tone: 'error',
      })
    } else if (image && edited) {
      setPendingFile(file)
    } else {
      openFile(file)
    }
  })

  // Reset All is itself one undo step, so it can be taken back
  const handleResetAll = useStableCallback(() => {
    history.commit(DEFAULT_DOCUMENT)
    resetUi()
    setConfirmingReset(false)
    showToast({ message: 'All edits removed', action: { label: 'Undo', onClick: undo } })
  })

  const askResetAll = useCallback(() => setConfirmingReset(true), [])
  const cancelResetAll = useCallback(() => setConfirmingReset(false), [])
  const openExport = useStableCallback(() => {
    setDrawMode(false)
    setExportOpen(true)
  })
  const confirmReplace = useStableCallback(() => {
    openFile(pendingFile)
    setPendingFile(null)
  })
  const cancelReplace = useCallback(() => setPendingFile(null), [])

  // Renders the current edits onto the untouched original at full size
  function handleExport({ format, quality }) {
    return exportImage({
      image,
      document: history.present,
      outputSize,
      format,
      quality,
    })
  }

  // Keyboard: Ctrl/⌘+Z undo; Ctrl+Y or Ctrl/⌘+Shift+Z redo; Escape leaves
  // Draw mode or clears the selection. Ignored while a dialog is open.
  useEffect(() => {
    if (!image) return
    function handleKeyDown(event) {
      if (document.querySelector('dialog[open]')) return
      if (event.key === 'Escape') {
        if (event.target.closest?.(TEXT_ENTRY)) return
        if (drawMode) setDrawMode(false)
        else if (selectedId) select(null)
        return
      }
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return
      if (event.target.closest?.(TEXT_ENTRY)) return
      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) undo()
      else if (key === 'y' || (key === 'z' && event.shiftKey)) redo()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [image, undo, redo, drawMode, selectedId, setDrawMode, select])

  // A file dropped outside the photo area must not navigate the page away
  useEffect(() => {
    const block = (event) => hasFiles(event) && event.preventDefault()
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  const dropHandlers = {
    onDragOver(event) {
      if (!hasFiles(event)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      if (!dragging) setDragging(true)
    },
    onDragLeave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
    },
    onDrop(event) {
      if (!hasFiles(event)) return
      event.preventDefault()
      setDragging(false)
      requestOpen(event.dataTransfer.files[0])
    },
  }

  const hasDecorations =
    decorations.items.length > 0 || decorations.strokes.length > 0
  const editedSections = useMemo(
    () => ({
      adjust: !isDefault,
      transform: !isTransformDefault,
      filters: filter.preset !== 'original',
      decorate: hasDecorations,
    }),
    [isDefault, isTransformDefault, filter.preset, hasDecorations],
  )

  return (
    <div className={`app-shell${image ? ' has-photo' : ''}`}>
      <header className="app-header">
        <div className="app-brand">
          <AppLogo size={30} className="app-brand__logo" />
          <div className="app-brand__text">
            <h1 className="app-title">{APP_NAME}</h1>
            <p className="app-tagline">{APP_TAGLINE}</p>
          </div>
        </div>
        {image && (
          <HeaderActions
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            canReset={edited}
            showBefore={showBefore}
            onUndo={undo}
            onRedo={redo}
            onCompare={setCompare}
            onResetAll={askResetAll}
            onUpload={requestOpen}
            onExport={openExport}
          />
        )}
      </header>

      <main
        className={`app-canvas${dragging ? ' is-dragging' : ''}`}
        {...dropHandlers}
      >
        <EditorCanvas
          image={image}
          adjustments={adjustments}
          filter={filter}
          transform={transform}
          outputSize={outputSize}
          decorations={decorations}
          showBefore={showBefore}
          onSelect={requestOpen}
        />
        {dragging && image && (
          <div className="drop-overlay" aria-hidden="true">
            <div className="drop-overlay__card">Drop to open this photo</div>
          </div>
        )}
        <Toast toast={toast} onDismiss={dismissToast} />
      </main>

      <aside className="app-sidebar" aria-label="Editing tools">
        {image ? (
          <>
            <EditorTabs
              active={activeTab}
              edited={editedSections}
              onChange={changeTab}
            />
            {/* Keyed by tab so each section opens scrolled to the top */}
            <div
              key={activeTab}
              id={panelId(activeTab)}
              className="app-panel"
              role="tabpanel"
              aria-labelledby={tabId(activeTab)}
            >
              {activeTab === 'adjust' && (
                <AdjustPanel
                  adjustments={adjustments}
                  onChange={setAdjustment}
                  onReset={resetAdjustments}
                  canReset={!isDefault}
                />
              )}
              {activeTab === 'transform' && (
                <TransformPanel
                  image={image}
                  transform={transform}
                  outputSize={outputSize}
                  onRotate={rotate}
                  onFlip={toggleFlip}
                  onCrop={setCrop}
                  onResize={setDimension}
                  onLockAspect={setLockAspect}
                  onReset={resetTransform}
                  canReset={!isTransformDefault}
                />
              )}
              {activeTab === 'filters' && (
                <FilterPanel
                  image={image}
                  thumbnail={thumbnail}
                  filter={filter}
                  onPreset={setPreset}
                  onIntensity={setIntensity}
                />
              )}
              {activeTab === 'decorate' && (
                <DecoratePanel decorations={decorations} disabled={false} />
              )}
            </div>
          </>
        ) : (
          // Desktop empty state: what's waiting once a photo is open
          <div className="sidebar-empty">
            <h2 className="sidebar-empty__title">Editing tools</h2>
            <p className="sidebar-empty__text">
              Open a photo to unlock these tools.
            </p>
            <ul className="sidebar-empty__list">
              {EDITOR_TABS.map((tab) => (
                <li key={tab.key}>
                  <span className="sidebar-empty__name">{tab.label}</span>
                  <span className="sidebar-empty__desc">{tab.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {exportOpen && (
        <ExportDialog
          settings={exportSettings}
          onSettingsChange={setExportSettings}
          outputSize={outputSize}
          onExport={handleExport}
          onClose={() => setExportOpen(false)}
        />
      )}

      <ConfirmDialog
        open={confirmingReset}
        title="Reset all edits?"
        message="This removes every adjustment, transform, filter, text, sticker and drawing. Your uploaded photo is kept, and you can still undo this."
        confirmLabel="Reset All"
        onConfirm={handleResetAll}
        onCancel={cancelResetAll}
      />
      <ConfirmDialog
        open={pendingFile !== null}
        title="Open a different photo?"
        message="Your current edits will be lost. Export first if you'd like to keep them."
        confirmLabel="Open New Photo"
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
    </div>
  )
}

export default AppShell
