import { configureStore } from '@reduxjs/toolkit'
import featuresReducer from './features/geoFeatures/geoFeaturesSlice'

export const dataStore = configureStore({
  reducer: {
    featureCollection: featuresReducer,
  }
})

export type DataStore = typeof dataStore
export type DataDispatch = typeof dataStore.dispatch
export type RootDataState = ReturnType<typeof dataStore.getState>
