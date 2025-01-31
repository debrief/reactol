import './App.css'
import { Provider } from 'react-redux'
import { createStore } from './state/store.ts'
import { AppProvider } from './state/AppProvider.tsx'
import Document from './components/Document/index.tsx'
import { useState } from 'react'

export type AppProps = {
  content?: string
}

function App({ content }: AppProps) {
  const [store] = useState(createStore(content))
  return (
    <Provider store={store}>
      <AppProvider>
        <Document />
      </AppProvider>  
    </Provider>  
  )
}

export default App