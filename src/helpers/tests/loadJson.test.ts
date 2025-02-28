import { cloneDeep } from 'lodash'
import { loadJson } from '../loaders/loadJson'
import featuresReducer from '../../state/geoFeaturesSlice'
import { Feature, Geometry, GeoJsonProperties, FeatureCollection, LineString } from 'geojson'
import { createStore } from '@reduxjs/toolkit'

describe('load function', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore(featuresReducer)
  })

  it('should add features to the store from a valid GeoJSON object', () => {
    const sampleData = {
      type: 'FeatureCollection',
      features: [
        {
          id: 'f-1',
          type: 'Feature',
          properties: { name: 'Feature 1' },
          geometry: {
            type: 'Point',
            coordinates: [102.0, 0.5]
          }
        },
        {
          id: 'f-2',
          type: 'Feature',
          properties: { name: 'Feature 2' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [102.0, 0.0],
              [103.0, 1.0],
              [104.0, 0.0],
              [105.0, 1.0]
            ]
          }
        }
      ]
    }
    const geoJsonText = JSON.stringify(sampleData)
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    loadJson(geoJsonText, existing, store.dispatch)

    const state = store.getState() as FeatureCollection
    expect(state.features.length).toBe(2)
    expect(state.features[0]?.properties?.name).toBe('Feature 1')
    expect(state.features[1]?.properties?.name).toBe('Feature 2')
    const secondString = state.features[1] as Feature<LineString>
    expect(secondString.geometry.coordinates?.length).toBe(4)

    // add again, check it gets longer
    const sampleCopy = cloneDeep(sampleData)
    sampleCopy.features = [sampleCopy.features[1]]
    const justLineString = JSON.stringify(sampleCopy)
    const newExisting = store.getState() as FeatureCollection
    loadJson(justLineString, newExisting.features, store.dispatch)
    const updatedState = store.getState() as FeatureCollection
    // note the count goes up, since we 'clean' the ids when we add new ones
    // so the duplicate will get a new id
    expect(updatedState.features.length).toBe(3)
    const updatedState2 = store.getState() as FeatureCollection
    const newSecondString = updatedState2.features[1] as Feature<LineString>
    expect(newSecondString.geometry.coordinates?.length).toBe(4)
  })

  it('should not add features to the store from an invalid GeoJSON object', () => {
    const invalidGeoJsonText = JSON.stringify({
      type: 'InvalidType',
      features: []
    })

    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    expect(() => loadJson(invalidGeoJsonText, existing, store.dispatch)).toThrow('Invalid GeoJSON format:InvalidType')

    const state = store.getState() as FeatureCollection
    expect(state.features.length).toBe(0)
  })
})
