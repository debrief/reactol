import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createStore } from './state/store.ts'
import { AppProvider } from './state/AppProvider.tsx'
import './index.css'
import Documents from './components/Documents/index.tsx'

const Root = () => {
  const [store] = useState(createStore())

  return (
    <StrictMode>
      <Provider store={store}>
        <AppProvider>
          <Documents />
        </AppProvider>
      </Provider>
    </StrictMode>
  )
}

export default Root

createRoot(document.getElementById('root')!).render(<Root />)
