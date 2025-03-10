import { loadOpRep } from '../loaders/loadOpRep'
import featuresReducer, { StoreState } from '../../state/geoFeaturesSlice'
import { Feature, Geometry, GeoJsonProperties, LineString } from 'geojson'
import { createStore } from '@reduxjs/toolkit'
import { TRACK_TYPE } from '../../constants'

describe('loadOpRep function', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore(featuresReducer)
  })

  it('should parse OpRep format files and add features to the store', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(sampleOpRepData, existing, store.dispatch, undefined, {initialYear:2024, initialMonth:12, name:'name-b', shortName:'bbb', env: 'air', stroke: 
      '#ff0', visible: true, dataType: TRACK_TYPE, labelInterval: '600000', symbolInterval: '60000'})

    const state = store.getState() as StoreState
    expect(state.data.features.length).toBe(1)
    const feature = state.data.features[0] as Feature<LineString>
    expect(feature.geometry.type).toBe('LineString')
    expect(feature.geometry.coordinates.length).toBe(3)
    expect(feature.properties?.times.length).toBe(3)
    expect(feature.properties?.courses.length).toBe(3)
    expect(feature.properties?.speeds.length).toBe(3)
    expect(feature.properties?.labelInterval).toBe(600000)
    expect(feature.properties?.symbolInterval).toBe(60000)
  })

  it('should convert parsed data into GeoJson LineString track object', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(sampleOpRepData, existing, store.dispatch, undefined, {initialYear:2024, initialMonth:12, name:'name-a', shortName:'bbb', env: 'air', stroke: 
    '#ff0', visible: true, dataType: TRACK_TYPE, labelInterval: '600000', symbolInterval: '60000'})

    const state = store.getState() as StoreState
    const feature = state.data.features[0] as Feature<LineString>
    expect(feature.geometry.type).toBe('LineString')
    expect(feature.geometry.coordinates.length).toBe(3)
  })

  it('should store depth data as negative elevation field', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/150//
      271301Z/3731.30N–01643.75E/095/15.0/150//
      271302Z/3731.35N–01643.81E/095/15.0/150//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(sampleOpRepData, existing, store.dispatch, undefined, {initialYear:2024, initialMonth:12, name:'name-a', shortName:'bbb', env: 'air', stroke: 
      '#ff0', visible: true, dataType: TRACK_TYPE, labelInterval: '600000', symbolInterval: '60000'})

    const state = store.getState() as StoreState
    const feature = state.data.features[0] as Feature<LineString>
    expect(feature.geometry.coordinates[0][2]).toBe(-150)
  })

  it('should store times, courses, and speeds as arrays in properties dictionary', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(sampleOpRepData, existing, store.dispatch, undefined, {initialYear:2024, initialMonth:12, name:'name-a', shortName:'bbb', env: 'air', stroke: 
      '#ff0', visible: true, dataType: TRACK_TYPE, labelInterval: '600000', symbolInterval: '60000'})

    const state = store.getState() as StoreState
    const feature = state.data.features[0] as Feature<LineString>
    expect(feature.properties?.times.length).toBe(3)
    expect(feature.properties?.courses.length).toBe(3)
    expect(feature.properties?.speeds.length).toBe(3)
    expect(feature.properties?.courses[0]).toBe(95)
    expect(feature.properties?.speeds[0]).toBe(15)
  })

  it('should verify each line of text matches the expected format', async () => {
    const invalidOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      DELIBERATELY_INVALID_LINE
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(invalidOpRepData, existing, store.dispatch, undefined, {initialYear:2024, initialMonth:12, name:'name-a', shortName:'bbb', env: 'air', stroke: 
      '#ff0', visible: true, dataType: TRACK_TYPE, labelInterval: '600000', symbolInterval: '60000'})

    const state = store.getState() as StoreState
    const feature = state.data.features[0] as Feature<LineString>
    expect(feature.geometry.coordinates.length).toBe(2)
  })

  it('should correctly use the year, month and name values', async () => {
    const validOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(validOpRepData, existing, store.dispatch, undefined, {initialYear:2023, initialMonth:11, name:'name-b', shortName:'bbb', env: 'air', stroke: 
      '#ff0', visible: true, dataType: TRACK_TYPE, labelInterval: '600000', symbolInterval: '60000'})

    const state = store.getState() as StoreState
    const feature = state.data.features[0] as Feature<LineString>
    expect(feature.geometry.coordinates.length).toBe(2)
    expect(feature.properties?.name).toBe('name-b')
    const firstTime = feature.properties?.times[0]
    expect(firstTime).toBeTruthy()
    expect(firstTime?.startsWith('2023-11')).toBe(true)
  })

  it('should append data to an existing track when existingTrackDetails is provided', async () => {
    // Create an initial track
    const initialOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
    `
    const existing: Feature<Geometry, GeoJsonProperties>[] = []
    await loadOpRep(initialOpRepData, existing, store.dispatch, undefined, {
      initialYear: 2024,
      initialMonth: 12,
      name: 'test-track',
      shortName: 'tt',
      env: 'air',
      stroke: '#ff0',
      visible: true,
      dataType: TRACK_TYPE,
      labelInterval: '600000',
      symbolInterval: '60000'
    })

    // Get the created track's ID
    const state = store.getState() as StoreState
    expect(state.data.features.length).toBe(1)
    const trackId = state.data.features[0].id

    // Add more data to the existing track
    const additionalOpRepData = `
      271302Z/3731.35N–01643.81E/095/15.0/-//
      271303Z/3731.40N–01643.87E/095/15.0/-//
    `
    
    await loadOpRep(additionalOpRepData, state.data.features, store.dispatch, {
      trackId: trackId as string
    })

    // Verify the updated track
    const updatedState = store.getState() as StoreState
    const feature = updatedState.data.features[0] as Feature<LineString>
    
    expect(updatedState.data.features.length).toBe(1) // Still only one track
    expect(feature.geometry.coordinates.length).toBe(4) // Combined coordinates
    expect(feature.properties?.times.length).toBe(4) // Combined times
    expect(feature.properties?.courses.length).toBe(4) // Combined courses
    expect(feature.properties?.speeds.length).toBe(4) // Combined speeds
    
    // Verify the times are in chronological order
    const times = feature.properties?.times
    expect(times?.every((time: string, i: number) => i === 0 || time > times[i - 1])).toBe(true)
  })


})
