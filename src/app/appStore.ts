import { configureStore } from '@reduxjs/toolkit'

import selectionReducer from '../features/selection/selectionSlice'
import timeReducer from '../features/time/timeSlice'
import currentLocationReducer from '../features/currentLocation/currentLocationSlice'

export const store = configureStore({
  // Pass in the root reducer setup as the `reducer` argument
  reducer: {
    // Declare that `state.counter` will be updated by the `counterReducer` function
    selected: selectionReducer,
    time: timeReducer,
    currentLocation: currentLocationReducer
  }
})

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type AppRootState = ReturnType<typeof store.getState>
