import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BBox, Feature, FeatureCollection } from 'geojson'
import * as turf from '@turf/turf'
import { LatLngBounds } from 'leaflet'

export type StoreState = {
  features: FeatureCollection
  details?: HistoryDescriptions
}

type HistoryDescriptions = {
  undo: string
  redo: string
}

const initialState: StoreState = {
  features: {
    type: 'FeatureCollection',
    features: [],
    bbox: undefined
  },
  details: {
    undo: 'Undo store initialisation',
    redo: 'Redo store initialisation'
  }
}

type idDictionary = { [name: string]: string } 

let counter = 0

/** note: this method modifies the contents of the `newIds` argument,
 *  to keep track of the new feature ids
 */
export const cleanFeature = (existingIds: string[],feature: Feature, newIds?: idDictionary): Feature => {
  const newIdsKeys =  Object.keys(newIds || {})
  if (!feature.id) {
    feature.id = `f-${++counter}`
  }
  while (existingIds.includes(feature.id as string) || newIdsKeys?.includes(feature.id as string)) {
    feature.id = `f-${++counter}`
  }
  if (newIds) {
    newIds[feature.id as string] = feature.id as string
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

const namesFor = (features: Feature[]): string => {
  return features.map(feature => feature.properties?.name || feature.id).join(', ')
}

// Create the slice and pass in the initial state
const featuresSlice = createSlice({
  name: 'fColl',
  initialState,
  reducers: {
    storeCleared(state) {
      state.features.features = []
      state.features.bbox = updateBounds(state.features)
      state.details = {
        undo: 'Undo clear store',
        redo: 'Redo clear store'
      } 
    },
    featureAdded(state, action: PayloadAction<Feature>) {
      const existingIds = getExistingIds(state.features.features)
      const cleaned = cleanFeature(existingIds,action.payload)
      state.features.features.push(cleaned)
      state.features.bbox = updateBounds(state.features)
      const itemName = namesFor([action.payload])
      state.details = {
        undo: 'Undo add ' + itemName,
        redo: 'Redo add ' + itemName
      } 
    },
    featuresAdded(state, action: PayloadAction<Feature[]>) {
      const existingIds = getExistingIds(state.features.features)
      // store new ids in a dictionary, so it is passed by reference
      const newIds: idDictionary = {}
      const cleaned = action.payload.map((feature) => cleanFeature(existingIds ,feature, newIds))
      const itemNames = namesFor(action.payload)
      state.features.features.push(...cleaned)
      state.features.bbox = updateBounds(state.features)
      state.details = {
        undo: 'Undo add ' + itemNames,
        redo: 'Redo add ' + itemNames
      } 
    },
    featureUpdated(state, action: PayloadAction<Feature>) {
      const featureIndex = state.features.features.findIndex((feature) => feature.id === action.payload.id)
      state.features.features.splice(featureIndex, 1, action.payload)
      state.features.bbox = updateBounds(state.features)
      const itemName = namesFor([action.payload])
      state.details = {
        undo: 'Undo modify ' + itemName,
        redo: 'Redo modify ' + itemName
      } 
    },
    featuresUpdated(state, action: PayloadAction<Feature[]>) {
      const updates = action.payload
      state.features.features = state.features.features.map(feature => {
        const update = updates.find(u => u.id === feature.id)
        return update || feature
      })
      state.features.bbox = updateBounds(state.features)
      const itemNames = namesFor(updates)
      state.details = {
        undo: 'Undo modify ' + itemNames,
        redo: 'Redo modify ' + itemNames
      } 
    },
    featuresVisChange(state, action: PayloadAction<{ ids: string[], visible: boolean }>) {
      const { ids, visible } = action.payload
      state.features.features.forEach((feature) => {
        if (!feature.properties) {
          feature.properties = {}
        }
        if (ids.includes(feature.id as string)) {
          feature.properties.visible = visible
        }
      })
      state.features.bbox = updateBounds(state.features)
      const itemName = namesFor(state.features.features.filter(feature => ids.includes(feature.id as string)))
      state.details = {
        undo: 'Undo visibility change ' + itemName,
        redo: 'Redo visibility change ' + itemName
      } 
    },
    featuresDeleted(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      const itemName = namesFor(state.features.features.filter(feature => ids.includes(feature.id as string)))
      state.features.features = state.features.features.filter(feature => !ids.includes(feature.id as string))
      state.features.bbox = updateBounds(state.features)
      state.details = {
        undo: 'Undo delete 1' + itemName,
        redo: 'Redo delete ' + itemName
      } 
    },
    featuresDuplicated(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      const newFeatures = state.features.features
        .filter(feature => ids.includes(feature.id as string))
        .map(feature => {
          const newFeature = { ...feature, id: `f-${++counter}` }
          newFeature.properties = { ...feature.properties, name: `Copy of ${feature.properties?.name || feature.id}` }
          return newFeature
        })
      state.features.features.push(...newFeatures)
      state.features.bbox = updateBounds(state.features)
      const itemName = namesFor(newFeatures)
      state.details = {
        undo: 'Undo duplicate ' + itemName,
        redo: 'Redo duplicate ' + itemName
      } 
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

// Selectors for redux-undo state
export const selectFeatures = (state: { fColl: { present: StoreState } }) => state.fColl.present.features.features

// Export the generated reducer function
export default featuresSlice.reducer
