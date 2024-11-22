import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { dataStore } from './dataStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Provider store={dataStore}>
        <App />
      </Provider>
    </Provider>  
  </StrictMode>,
)
