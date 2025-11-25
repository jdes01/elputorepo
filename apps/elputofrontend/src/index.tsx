import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'

const run = async () => {
  const isDevelopment = import.meta.env.VITE_STAGE === 'development'
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true' && isDevelopment

  if (useMocks) {
    const { worker } = await import('./mocks/worker')

    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

run()
