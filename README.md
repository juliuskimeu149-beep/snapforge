# SnapForge

**Edit. Enhance. Export.**

SnapForge is a fast, private photo editor that runs entirely in your browser.
Photos never leave your device: there's no upload to a server, and nothing
about your photos is stored once you close the tab. It installs as an app on
Android and desktop, and works offline after the first visit.

## Features

- **Adjust** — brightness, contrast, saturation and exposure
- **Transform** — rotate, flip, crop (Free, 1:1, 4:5, 16:9) and resize with a
  locked or free aspect ratio
- **Filters** — 9 presets with adjustable intensity
- **Decorate** — draggable text and stickers, freehand drawing with an eraser
- **Undo / Redo**, **Before / After** comparison and **Reset All**
- **Export** to PNG, JPEG or WebP at full resolution, with a quality setting
- Mobile-first layout with touch-sized controls; keyboard shortcuts on desktop
  (Ctrl/⌘+Z undo, Ctrl+Y or Ctrl/⌘+Shift+Z redo, Esc to deselect)

The original photo is never modified. Every edit is applied to a preview, and
the export is rendered from the untouched original at full size.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev       # development server at http://localhost:5173
```

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the development server (no service worker) |
| `npm run build`   | Production build into `dist/`, including the PWA |
| `npm run preview` | Serve the production build locally             |
| `npm run lint`    | Lint with Oxlint                               |

## Installable app (PWA)

The production build includes a web app manifest and a service worker
(via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)):

- Opens in its own window (`display: standalone`) once installed
- Precaches the app shell, so the editor opens offline after the first visit
- Caches **only** the app's own files. Photos are opened as in-memory `blob:`
  URLs, which never pass through the service worker, so they're never cached

To try it, run `npm run build && npm run preview`, open the preview URL in
Chrome or Edge and use the install button in the address bar. Installing
requires HTTPS (or `localhost`) in production.

## Project structure

```
src/
  components/
    editor/    Canvas, panels (Adjust, Transform, Filters, Decorate), export dialog
    layout/    App shell, header actions, section tabs
    ui/        Reusable controls (slider, segmented control, dialogs, toast, logo)
  hooks/       Editor state: history (undo/redo), adjustments, transform, filters, decorations
  utils/       Image transforms, colour matrices, drawing and export rendering
  constants/   Presets, limits and defaults
  styles/      Design tokens and global styles
public/        Favicon and app icons
branding/      Source artwork for the app icons
```
