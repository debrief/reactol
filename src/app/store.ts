import { configureStore } from '@reduxjs/toolkit'
import type { Action } from '@reduxjs/toolkit'
import { FeatureCollection } from 'geojson'

interface FeaturesState {
  collection: FeatureCollection
}

const emptyCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

// An example slice reducer function that shows how a Redux reducer works inside.
// We'll replace this soon with real app logic.
function featuresReducer(state: FeaturesState = { collection: emptyCollection }, action: Action) {
  switch (action.type) {
  // Handle actions here
  default: {
    return state
  }
  }
}

export const store = configureStore({
  // Pass in the root reducer setup as the `reducer` argument
  reducer: {
    // Declare that `state.counter` will be updated by the `counterReducer` function
    features: featuresReducer
  }
})