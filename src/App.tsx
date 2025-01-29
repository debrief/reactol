import './App.css'
import { Provider } from 'react-redux'
import { store } from './state/store.ts'
import { AppProvider } from './state/AppProvider.tsx'
import Document from './components/Document/index.tsx'

function App() {
 
  return (
    <Provider store={store}>
      <AppProvider>
        <Document />
      </AppProvider>  
    </Provider>  
  )
}

export default App