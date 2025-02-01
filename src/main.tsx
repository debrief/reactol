import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Documents from './components/Documents/index.tsx'
import { AppContextProvider } from './state/AppContextProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContextProvider>
      <Documents />
    </AppContextProvider>
  </StrictMode>
)
