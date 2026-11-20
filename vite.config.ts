import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { inspectAttr } from 'kimi-plugin-inspect-react'

export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['atlas-icon.svg', 'atlas-icon-192.png', 'atlas-icon-512.png', 'data/atlas-modelo-v021-20261120.json'],
      manifest: {
        name: 'Atlas de Gestão de TI em camadas',
        short_name: 'Atlas TI',
        description: 'Arquitetura geral de TI em camadas, com exploração 3D e alternativa 2D.',
        lang: 'pt-BR',
        theme_color: '#091014',
        background_color: '#091014',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: './atlas-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './atlas-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: './atlas-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: { port: 3000 },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
