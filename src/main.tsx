import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/ibm-plex-sans'
import './index.css'
import App from './App.tsx'

if (!new URLSearchParams(window.location.search).has('capture')) {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
