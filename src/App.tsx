import './App.css'
import { Provider } from 'react-redux'
import { createStore } from './state/store.ts'
import { AppProvider } from './state/AppProvider.tsx'
import Document from './components/Document/index.tsx'
import { useState } from 'react'
import { cleanFeature } from './state/geoFeaturesSlice.ts'

export type AppProps = {
  content?: string
  filePath?: string
}

/** we will allow a feature collection or a single 
 * feature to be loaded into the store
 */
const toFeatureCollection = (content?: string) => {
  if (!content){
    return {
      type: 'FeatureCollection',
      features: []
    }
  }
  const item =JSON.parse(content)
  if (item.type === 'FeatureCollection') {
    return item
  }
  if (item.type === 'Feature') {
    return {
      type: 'FeatureCollection',
      features: [cleanFeature([], item)]
    }
  }
  throw new Error('Unknown type: ' + item.type)
}

function App({ content, filePath }: AppProps) {
  const [store] = useState(createStore(toFeatureCollection(content)))
  return (
    <Provider store={store}>
      <AppProvider>
        <Document filePath={filePath} />
      </AppProvider>  
    </Provider>  
  )
}

export default App