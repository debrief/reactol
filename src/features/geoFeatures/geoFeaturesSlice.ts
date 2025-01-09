import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Feature, FeatureCollection } from 'geojson'
import * as turf from '@turf/turf';
import { LatLngBounds } from 'leaflet';

const initialState: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
  bbox: [0, 0, 0, 0]
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
    featuresUpdated(state, action: PayloadAction<Feature[]>) {
      const cleaned = action.payload.map(cleanFeature)
      const removeUpdated = state.features.filter((feature) => !cleaned.find((f) => f.id === feature.id))
      state.features = removeUpdated.concat(cleaned)
    },
    featuresVisible(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      state.features.forEach((feature) => {
        if (!feature.properties) {
          feature.properties = {}
        }
        feature.properties.visible = ids.includes(feature.id as string)
      })
    },
    updateBounds(state) {
      const visibleFeatures = state.features.filter(feature => feature.properties?.visible);
      const bbox = turf.bbox(turf.featureCollection(visibleFeatures));
      state.bbox = bbox;
    }
  }
})

// Selector to get bounds in Leaflet's LatLngBounds format
export const selectBounds = (state: FeatureCollection): LatLngBounds => {
  const [minX, minY, maxX, maxY] = state.bbox;
  return new LatLngBounds([minY, minX], [maxY, maxX]);
};

// Export the generated reducer function
export default featuresSlice.reducer
