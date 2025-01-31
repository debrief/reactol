import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Documents from './components/Documents/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Documents />
  </StrictMode>,
)
