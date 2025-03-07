import './App.css'
import { Provider } from 'react-redux'
import { createStore } from './state/store.ts'
import { DocContextProvider } from './state/DocContextProvider.tsx'
import Document from './components/Document/index.tsx'
import { useState } from 'react'
import { cleanFeature } from './state/geoFeaturesSlice.ts'

export type AppProps = {
  content?: string
  filePath?: string
  fileName?: string
  withSampleData?: boolean
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

function App({ content, filePath, withSampleData, fileName }: AppProps) {
  const [store] = useState(createStore(toFeatureCollection(content), fileName || filePath))
  return (
    <Provider store={store}>
      <DocContextProvider>
        <Document filePath={filePath} withSampleData={withSampleData} />
      </DocContextProvider>  
    </Provider>  
  )
}

export default App