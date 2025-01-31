import { configureStore } from '@reduxjs/toolkit'
import featuresReducer from './geoFeaturesSlice'

export const createStore = (content?: string) => configureStore({
  reducer: {
    fColl: featuresReducer
  },
  preloadedState: content ? {
    fColl: JSON.parse(content)
  } : undefined
})

export const store = createStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
