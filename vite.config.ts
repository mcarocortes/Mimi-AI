import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/** En GitHub Pages la app vive en /Mimi-AI/, no en la raíz del dominio. */
const base = process.env.GITHUB_PAGES === 'true' ? '/Mimi-AI/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon-32.png', 'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png', 'mimi.png'],
      manifest: {
        name: 'MIMI AI',
        short_name: 'MIMI',
        description: 'Asistente de IA con coach de prompts, plantillas y analítica.',
        theme_color: '#e85002',
        background_color: '#f9f9f9',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: `${base}login`,
        scope: base,
        lang: 'es',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
