# SnapForge brand assets

Source artwork for the app icon. The shipped files live in `public/`:

| File | Used for |
| --- | --- |
| `public/favicon.svg`, `public/icons/icon.svg` | Browser tab icon, header logo artwork, manifest SVG icon |
| `public/icons/icon-192.png`, `icon-512.png` | Manifest icons (Android, desktop install) |
| `public/icons/icon-maskable-512.png` | Android adaptive icon (rendered from `icon-maskable.svg`) |
| `public/icons/apple-touch-icon-180.png` | iOS home screen (rendered from `icon-maskable.svg`) |
| `public/icons/favicon-32.png` | Fallback favicon |

`icon-maskable.svg` is full-bleed with the artwork inside the central safe
zone, so Android launchers can crop it to any shape. The header logo is the
same mark drawn inline by `src/components/ui/AppLogo.jsx`.
