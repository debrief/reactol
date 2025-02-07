import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Documents from './components/Documents/index.tsx'
import { AppContextProvider } from './state/AppContextProvider'
import { ErrorBoundary } from 'react-error-boundary'

const fallbackRender: React.FC<{ error: Error, resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  resetErrorBoundary && resetErrorBoundary()
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={fallbackRender}>
      <AppContextProvider>
        <Documents />
      </AppContextProvider>
    </ErrorBoundary>
  </StrictMode>
)
