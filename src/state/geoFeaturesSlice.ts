import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BBox, Feature, FeatureCollection } from 'geojson';
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

const updateBounds = (state: FeatureCollection): BBox => {
  const visibleFeatures = state.features.filter(feature => feature.properties?.visible);
  return turf.bbox(turf.featureCollection(visibleFeatures)) as BBox;
}


// Create the slice and pass in the initial state
const featuresSlice = createSlice({
  name: 'featureCollection',
  initialState,
  reducers: {
    clearStore(state) {
      state.features = []
      state.bbox = updateBounds(state)
    },
    featureAdded(state, action: PayloadAction<Feature>) {
      const cleaned = cleanFeature(action.payload)
      state.features.push(cleaned)
      state.bbox = updateBounds(state)
    },
    featuresAdded(state, action: PayloadAction<Feature[]>) {
      const cleaned = action.payload.map(cleanFeature)
      state.features.push(...cleaned)
      state.bbox = updateBounds(state)
    },
    featureUpdated(state, action: PayloadAction<Feature>) {
      const featureIndex = state.features.findIndex((feature) => feature.id === action.payload.id)
      state.features.splice(featureIndex, 1, action.payload)
      state.bbox = updateBounds(state)
    },
    featuresUpdated(state, action: PayloadAction<Feature[]>) {
      const cleaned = action.payload.map(cleanFeature)
      const removeUpdated = state.features.filter((feature) => !cleaned.find((f) => f.id === feature.id))
      state.features = removeUpdated.concat(cleaned)
      state.bbox = updateBounds(state)
    },
    featuresVisible(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      state.features.forEach((feature) => {
        if (!feature.properties) {
          feature.properties = {}
        }
        feature.properties.visible = ids.includes(feature.id as string)
      })
      state.bbox = updateBounds(state)
    },
    featuresDeleted(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload;
      state.features = state.features.filter(feature => !ids.includes(feature.id as string));
      state.bbox = updateBounds(state);
    },
    featuresDuplicated(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload;
      const newFeatures = state.features
        .filter(feature => ids.includes(feature.id as string))
        .map(feature => {
          const newFeature = { ...feature, id: `f-${++counter}` };
          newFeature.properties = { ...feature.properties, name: `Copy of ${feature.properties?.name || feature.id}` };
          return newFeature;
        });
      state.features.push(...newFeatures);
      state.bbox = updateBounds(state);
    },
  }
})

// Selector to get bounds in Leaflet's LatLngBounds format
export const selectBounds = (state: FeatureCollection): LatLngBounds => {
  const [minX, minY, maxX, maxY] = state.bbox as [number, number, number, number];
  return new LatLngBounds([minY, minX], [maxY, maxX]);
};

// Export the generated reducer function
export default featuresSlice.reducer
