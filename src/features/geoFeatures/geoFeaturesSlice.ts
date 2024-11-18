import { createSlice } from '@reduxjs/toolkit'
import { FeatureCollection } from 'geojson'

const initialState: FeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

// Create the slice and pass in the initial state
const featuresSlice = createSlice({
  name: 'featureCollection',
  initialState,
  reducers: {}
})

// // check that all features in initial-data have an id
// features.forEach((feature, index) => {
//   if (!feature.id) {
//     feature.id = `f-${index}`
//   }
//   if (!feature.properties) {
//     feature.properties = {}
//   }
//   if (feature.properties.visible === undefined) {
//     feature.properties.visible = true
//   }
// })


// const setFeatureVisibility = (feature: Feature, visible: boolean): void => {
//   if(!feature.properties) {
//     feature.properties = {}
//   }
//   feature.properties.visible = visible
// }

// const setChecked = (ids: string[]): void => {
//   const newStore = JSON.parse(JSON.stringify(store))
//   newStore.features = newStore.features.map((feature: Feature) => {
//     const id = feature.id as string
//     setFeatureVisibility(feature, ids.includes(id))
//     return feature
//   })
//   setStore(newStore)
// }


// Export the generated reducer function
export default featuresSlice.reducer