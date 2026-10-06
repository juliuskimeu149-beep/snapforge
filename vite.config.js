import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable app + offline app shell. The service worker only ever
    // caches the built app files. Photos are opened as in-memory blob: URLs,
    // which never go through the service worker, so they're never stored.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Everything in public/ is already covered by globPatterns below
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: 'SnapForge',
        short_name: 'SnapForge',
        description:
          'A fast, private photo editor that runs in your browser. Edit. Enhance. Export.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#16161b',
        background_color: '#0f0f12',
        categories: ['photo', 'graphics', 'productivity'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Precache the app shell: HTML, JS, CSS and icons
        globPatterns: ['**/*.{html,js,css,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Deliberately no runtimeCaching: nothing else is ever cached
      },
      // The dev server stays service-worker free; test the PWA with a build
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // Expose on the local network so you can test on a phone
    host: true,
  },
})
