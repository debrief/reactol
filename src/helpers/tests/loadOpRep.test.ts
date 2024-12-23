import { loadOpRep } from '../loaders/loadOpRep';
import featuresReducer from '../../features/geoFeatures/geoFeaturesSlice';
import { Feature, Geometry, GeoJsonProperties, FeatureCollection, MultiPoint } from "geojson";
import { createStore } from '@reduxjs/toolkit';

describe('loadOpRep function', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore(featuresReducer);
  });

  it('should parse OpRep format files and add features to the store', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `;
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    await loadOpRep(sampleOpRepData, existing, store.dispatch, 2024, 12, 'name-a');

    const state = store.getState() as FeatureCollection;
    expect(state.features.length).toBe(1);
    const feature = state.features[0] as Feature<MultiPoint>;
    expect(feature.geometry.type).toBe('MultiPoint');
    expect(feature.geometry.coordinates.length).toBe(3);
    expect(feature.properties?.times.length).toBe(3);
    expect(feature.properties?.courses.length).toBe(3);
    expect(feature.properties?.speeds.length).toBe(3);
  });

  it('should convert parsed data into GeoJson MultiPoint track object', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `;
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    await loadOpRep(sampleOpRepData, existing, store.dispatch, 2024, 12, 'name-a');

    const state = store.getState() as FeatureCollection;
    const feature = state.features[0] as Feature<MultiPoint>;
    expect(feature.geometry.type).toBe('MultiPoint');
    expect(feature.geometry.coordinates.length).toBe(3);
  });

  it('should store depth data as negative elevation field', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/150//
      271301Z/3731.30N–01643.75E/095/15.0/150//
      271302Z/3731.35N–01643.81E/095/15.0/150//
    `;
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    await loadOpRep(sampleOpRepData, existing, store.dispatch, 2024, 12, 'name-a');

    const state = store.getState() as FeatureCollection;
    const feature = state.features[0] as Feature<MultiPoint>;
    expect(feature.geometry.coordinates[0][2]).toBe(-150);
  });

  it('should store times, courses, and speeds as arrays in properties dictionary', async () => {
    const sampleOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271301Z/3731.30N–01643.75E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `;
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    await loadOpRep(sampleOpRepData, existing, store.dispatch, 2024, 12, 'name-a');

    const state = store.getState() as FeatureCollection;
    const feature = state.features[0] as Feature<MultiPoint>;
    expect(feature.properties?.times.length).toBe(3);
    expect(feature.properties?.courses.length).toBe(3);
    expect(feature.properties?.speeds.length).toBe(3);
  });

  it('should verify each line of text matches the expected format', async () => {
    const invalidOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      DELIBERATELY_INVALID_LINE
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `;
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    await loadOpRep(invalidOpRepData, existing, store.dispatch, 2024, 12, 'name-a');

    const state = store.getState() as FeatureCollection;
    const feature = state.features[0] as Feature<MultiPoint>;
    expect(feature.geometry.coordinates.length).toBe(2);
  });

  it('should correctly use the year, month and name values', async () => {
    const validOpRepData = `
      271300Z/3731.25N–01643.69E/095/15.0/-//
      271302Z/3731.35N–01643.81E/095/15.0/-//
    `;
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    await loadOpRep(validOpRepData, existing, store.dispatch, 2023, 11, 'name-b');

    const state = store.getState() as FeatureCollection;
    const feature = state.features[0] as Feature<MultiPoint>;
    expect(feature.geometry.coordinates.length).toBe(2);
    expect(feature.properties?.name).toBe('name-b');
    const firstTime = feature.properties?.times[0];
    expect(firstTime).toBeTruthy();
    expect(firstTime?.startsWith('2023-11')).toBe(true);
  });
});
