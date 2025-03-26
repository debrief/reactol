import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/darkMode.css'
import Documents from './components/Documents/index.tsx'
import { AppContextProvider } from './state/AppContextProvider'
import { ErrorBoundary } from 'react-error-boundary'
import '@ant-design/v5-patch-for-react-19' // shims to allow ant5 work on react 19
import { ConfigProvider, theme } from 'antd'
import { AppContext } from './state/AppContext'

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
        <AppContext.Consumer>
          {(context) => (
            <ConfigProvider
              theme={{
                algorithm: context && context.isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
              }}
            >
              <Documents />
            </ConfigProvider>
          )}
        </AppContext.Consumer>
      </AppContextProvider>
    </ErrorBoundary>
  </StrictMode>
)
