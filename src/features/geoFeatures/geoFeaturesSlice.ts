import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Feature, FeatureCollection } from 'geojson'

const initialState: FeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

let counter = 0

const cleanFeature = (feature: Feature): Feature => {
  counter++
  if (!feature.id) {
    feature.id = `f-${counter}`
  }
  if (!feature.properties) {
    feature.properties = {}
  }
  if (feature.properties.visible === undefined) {
    feature.properties.visible = true
  }
  return feature
}

// Create the slice and pass in the initial state
const featuresSlice = createSlice({
  name: 'featureCollection',
  initialState,
  reducers: {
    clearStore(state) {
      state.features = []
    },
    featureAdded(state, action: PayloadAction<Feature>) {
      const cleaned = cleanFeature(action.payload)
      state.features.push(cleaned)
    },
    featuresAdded(state, action: PayloadAction<Feature[]>) {
      const cleaned = action.payload.map(cleanFeature)
      state.features.push(...cleaned)
    },
    featuresVisible(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      console.log('change feature vis', ids)
      state.features.forEach((feature) => {
        if (!feature.properties) {
          feature.properties = {}
        }
        feature.properties.visible = ids.includes(feature.id as string)
      })
    }
  }
})

// Export the generated reducer function
export default featuresSlice.reducer
