import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BBox, Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import * as turf from '@turf/turf'
import { LatLngBounds } from 'leaflet'

export type ViewportChangeType = 'pan' | 'zoom_in' | 'zoom_out' | 'fit_to_window' | 'restore'

export type ViewportState = {
  north: number
  south: number
  east: number
  west: number
  zoom: number
  changeType: ViewportChangeType
}

type CoreUpdated = {
  property?: string
}
export type FeatureUpdated = CoreUpdated & {
  feature: Feature<Geometry, GeoJsonProperties>
}

export type FeaturesUpdated = CoreUpdated & {
  features: Feature<Geometry, GeoJsonProperties>[]
}

export type StoreState = {
  data: FeatureCollection
  details?: HistoryDescriptions
  viewport?: ViewportState
}

type HistoryDescriptions = {
  time: number
  undo: string
  redo: string
}

const newDetails = (undo: string, redo:string): HistoryDescriptions => {
  return {
    time: Date.now(),
    undo,
    redo
  }
}

const initialState: StoreState = {
  data: {
    type: 'FeatureCollection',
    features: [],
    bbox: undefined
  },
  details: newDetails(
    'Undo store initialisation', 'Redo store initialisation'),
  viewport: undefined
}

type idDictionary = { [name: string]: string } 

let counter = 0

/** note: this method modifies the contents of the `newIds` argument,
 *  to keep track of the new feature ids
 */
export const cleanFeature = (existingIds: string[], feature: Feature, newIds?: idDictionary): Feature => {
  let result = feature // note: we will clone this, if we have to
  const newIdsKeys =  Object.keys(newIds || {})
  if (!result.id) {
    result.id = `f-${++counter}`
  }
  while (existingIds.includes(result.id as string) || newIdsKeys?.includes(result.id as string)) {
    // ok, we can't amend the id for the original feature. In this 
    // case we'll have to clone the feature and then modify it.
    // note:  a shallow copy is ok, since id sits at the top level
    const newFeature = {...feature, id: `f-${++counter}`}
    result = newFeature
  }
  if (newIds) {
    newIds[result.id as string] = result.id as string
  }  

  if (!result.properties) {
    result.properties = {}
  }
  if (result.properties.visible === undefined) {
    result.properties.visible = true
  }
  return result
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
    setViewport(state, action: PayloadAction<ViewportState>) {
      state.viewport = action.payload
      const changeType = action.payload.changeType
      let description = 'viewport '
      switch (changeType) {
      case 'zoom_in':
        description += 'zoom in'
        break
      case 'zoom_out':
        description += 'zoom out'
        break
      case 'fit_to_window':
        description += 'fit to window'
        break
      case 'restore':
        description += 'restore'
        break
      default:
        description += 'pan'
      }
      state.details = newDetails(
        `Undo ${description}`,
        `Redo ${description}`
      )
    },
    storeCleared(state) {
      state.data.features = []
      state.data.bbox = updateBounds(state.data)
      state.details = newDetails(
        'Undo clear store',
        'Redo clear store'
      )
    },
    featureAdded(state, action: PayloadAction<Feature>) {
      const existingIds = getExistingIds(state.data.features)
      const cleaned = cleanFeature(existingIds,action.payload)
      state.data.features.push(cleaned)
      state.data.bbox = updateBounds(state.data)
      const itemName = namesFor([action.payload])
      state.details = newDetails(
        'Undo add ' + itemName,
        'Redo add ' + itemName
      )
    },
    featuresAdded(state, action: PayloadAction<Feature[]>) {
      const existingIds = getExistingIds(state.data.features)
      // store new ids in a dictionary, so it is passed by reference
      const newIds: idDictionary = {}
      const cleaned = action.payload.map((feature) => cleanFeature(existingIds ,feature, newIds))
      const itemNames = namesFor(action.payload)
      state.data.features.push(...cleaned)
      state.data.bbox = updateBounds(state.data)
      state.details = newDetails(
        'Undo add ' + itemNames,
        'Redo add ' + itemNames
      )
    },
    featureUpdated(state, action: PayloadAction<FeatureUpdated>) {
      const featureIndex = state.data.features.findIndex((feature) => feature.id === action.payload.feature.id)
      state.data.features.splice(featureIndex, 1, action.payload.feature)
      state.data.bbox = updateBounds(state.data)
      const itemName = namesFor([action.payload.feature])
      const description = action.payload.property ? `${action.payload.property} of ${itemName}` : `modify ${itemName}`
      state.details = newDetails(
        `Undo ${description}`,
        `Redo ${description}`
      )
    },
    featuresUpdated(state, action: PayloadAction<FeaturesUpdated>) {
      const updates = action.payload
      state.data.features = state.data.features.map(feature => {
        const update = updates.features.find(u => u.id === feature.id)
        return update || feature
      })
      state.data.bbox = updateBounds(state.data)
      const itemNames = namesFor(updates.features)
      const description = action.payload.property ? `${action.payload.property} of ${itemNames}` : `modify ${itemNames}`
      state.details = newDetails(
        `Undo ${description}`,
        `Redo ${description}`
      )
    },
    featuresVisChange(state, action: PayloadAction<{ ids: string[], visible: boolean }>) {
      const { ids, visible } = action.payload
      state.data.features.forEach((feature) => {
        if (!feature.properties) {
          feature.properties = {}
        }
        if (ids.includes(feature.id as string)) {
          feature.properties.visible = visible
        }
      })
      state.data.bbox = updateBounds(state.data)
      const itemName = namesFor(state.data.features.filter(feature => ids.includes(feature.id as string)))
      state.details = newDetails(
        'Undo visibility change ' + itemName,
        'Redo visibility change ' + itemName
      )
    },
    featuresDeleted(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      const itemName = namesFor(state.data.features.filter(feature => ids.includes(feature.id as string)))
      state.data.features = state.data.features.filter(feature => !ids.includes(feature.id as string))
      state.data.bbox = updateBounds(state.data)
      state.details = newDetails(
        'Undo delete ' + itemName,
        'Redo delete ' + itemName
      )
    },
    featuresDuplicated(state, action: PayloadAction<{ ids: string[], }>) {
      const { ids } = action.payload
      const newFeatures = state.data.features
        .filter(feature => ids.includes(feature.id as string))
        .map(feature => {
          const newFeature = { ...feature, id: `f-${++counter}` }
          newFeature.properties = { ...feature.properties, name: `Copy of ${feature.properties?.name || feature.id}` }
          return newFeature
        })
      state.data.features.push(...newFeatures)
      state.data.bbox = updateBounds(state.data)
      const itemName = namesFor(newFeatures)
      state.details = newDetails(
        'Undo duplicate ' + itemName,
        'Redo duplicate ' + itemName
      )
    },
  }
})

// Selector to get bounds in Leaflet's LatLngBounds format
export const selectBounds = (state: StoreState): LatLngBounds | null => {
  if (!state.data.bbox) {
    return null
  } else {
    const [minX, minY, maxX, maxY] = state.data.bbox as [number, number, number, number]
    return new LatLngBounds([minY, minX], [maxY, maxX])
  }
}

// Selectors for redux-undo state
export const selectFeatures = (state: { fColl: { present: StoreState } }) => state.fColl.present.data.features

// Export the generated reducer function
export default featuresSlice.reducer
