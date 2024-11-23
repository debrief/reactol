import { configureStore } from '@reduxjs/toolkit'

import featuresReducer from '../features/geoFeatures/geoFeaturesSlice'

export const store = configureStore({
  reducer: {
    featureCollection: featuresReducer
  }
})

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
