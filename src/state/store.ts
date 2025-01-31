import { configureStore } from '@reduxjs/toolkit'
import featuresReducer from './geoFeaturesSlice'
import { FeatureCollection } from 'geojson'

export const createStore = (content?: FeatureCollection) => configureStore({
  reducer: {
    fColl: featuresReducer
  },
  preloadedState: content ? {
    fColl: content
  } : undefined
})

export const store = createStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
