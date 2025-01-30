import './App.css'
import { AppProvider } from './state/AppProvider.tsx'
import Document from './components/Document/index.tsx'

function App() {
  return (
    <AppProvider>
      <Document />
    </AppProvider>  
  )
}

export default App