import { configureStore } from '@reduxjs/toolkit'
import featuresReducer from './geoFeaturesSlice'
import { FeatureCollection } from 'geojson'
import undoable from 'redux-undo'

// Redux-undo action types
export const UNDO_ACTION = '@@redux-undo/UNDO'
export const REDO_ACTION = '@@redux-undo/REDO'

export const createStore = (content?: FeatureCollection, fileName?: string) => configureStore({
  reducer: {
    fColl: undoable(featuresReducer, {
      filter: (action) => {
        const actionType = action.type as string
        return actionType.startsWith('fColl/')
      }
    })
  },
  preloadedState: content ? {
    fColl: {
      past: [],
      present: content,
      future: []
    }
  } : undefined,
  devTools: {
    name: `App - ${fileName}`
  }
})

export const store = createStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
