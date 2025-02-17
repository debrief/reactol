import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BBox, Feature, FeatureCollection } from 'geojson'
import * as turf from '@turf/turf'
import { LatLngBounds } from 'leaflet'

const initialState: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
  bbox: undefined
}

let counter = 0

export const cleanFeature = (existingIds: string[],feature: Feature): Feature => {
  counter++
  if (!feature.id) {
    feature.id = `f-${counter}`
  }
  while (existingIds.includes(feature.id as string)) {
    feature.id = `f-${++counter}`
  }
  if (!feature.properties) {
    feature.properties = {}
  }
  if (feature.properties.visible === undefined) {
    feature.properties.visible = true
  }
  return feature
}

const updateBounds = (state: FeatureCollection): BBox | undefined => {
  const visibleFeatures = state.features.filter(feature => feature.properties?.visible)
  if (visibleFeatures.length === 0) {
    return undefined
  } else {
    return turf.bbox(turf.featureCollection(visibleFeatures)) as BBox
  }
}

const getExistingIds = (features: Feature[]): string[] => {
  return features.map(feature => feature.id as string)
}

// Create the slice and pass in the initial state
const featuresSlice = createSlice({
  name: 'fColl',
  initialState,
  reducers: {
    storeCleared(state) {
      state.features = []
      state.bbox = updateBounds(state)
    },
    featureAdded(state, action: PayloadAction<Feature>) {
      const existingIds = getExistingIds(state.features)
      const cleaned = cleanFeature(existingIds,action.payload)
      state.features.push(cleaned)
      state.bbox = updateBounds(state)
    },
    featuresAdded(state, action: PayloadAction<Feature[]>) {
      const existingIds = getExistingIds(state.features)
      const cleaned = action.payload.map((feature) => cleanFeature(existingIds,feature))
      state.features.push(...cleaned)
      state.bbox = updateBounds(state)
    },
    featureUpdated(state, action: PayloadAction<Feature>) {
      const featureIndex = state.features.findIndex((feature) => feature.id === action.payload.id)
      state.features.splice(featureIndex, 1, action.payload)
      state.bbox = updateBounds(state)
    },
    featuresUpdated(state, action: PayloadAction<Feature[]>) {
      const cleaned = action.payload.map((feature) => cleanFeature([], feature))
      const removeUpdated = state.features.filter((feature) => !cleaned.find((f) => f.id === feature.id))
      state.features = removeUpdated.concat(cleaned)
      state.bbox = updateBounds(state)
    },
    featureVisibilities(state, action: PayloadAction<{ ids: string[], }>) {
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
      const { ids } = action.payload
      state.features = state.features.filter(feature => !ids.includes(feature.id as string))
      state.bbox = updateBounds(state)
    },
    featuresDuplicated(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      const newFeatures = state.features
        .filter(feature => ids.includes(feature.id as string))
        .map(feature => {
          const newFeature = { ...feature, id: `f-${++counter}` }
          newFeature.properties = { ...feature.properties, name: `Copy of ${feature.properties?.name || feature.id}` }
          return newFeature
        })
      state.features.push(...newFeatures)
      state.bbox = updateBounds(state)
    },
  }
})

// Selector to get bounds in Leaflet's LatLngBounds format
export const selectBounds = (state: FeatureCollection): LatLngBounds | null => {
  if (!state.bbox) {
    return null
  } else {
    const [minX, minY, maxX, maxY] = state.bbox as [number, number, number, number]
    return new LatLngBounds([minY, minX], [maxY, maxX])
  }
}

// Export the generated reducer function
export default featuresSlice.reducer
