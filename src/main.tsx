import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './app/appStore.ts'
import { dataStore } from './app/dataStore.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Provider store={dataStore}>
        <App />
      </Provider>
    </Provider>  
  </StrictMode>,
)
