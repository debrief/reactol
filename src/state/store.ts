import { configureStore } from '@reduxjs/toolkit'
import featuresReducer from './geoFeaturesSlice'

export const createStore = () => configureStore({
  reducer: {
    fColl: featuresReducer
  }
})

export const store = createStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
