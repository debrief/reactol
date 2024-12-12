import { loadJson } from '../loadJson';
import featuresReducer from '../../features/geoFeatures/geoFeaturesSlice';
import { Feature, Geometry, GeoJsonProperties, FeatureCollection, LineString } from "geojson";
import { createStore } from '@reduxjs/toolkit';

describe('load function', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore(featuresReducer);
  });

  it('should add features to the store from a valid GeoJSON object', () => {
    const sampleData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Feature 1' },
          geometry: {
            type: 'Point',
            coordinates: [102.0, 0.5]
          }
        },
        {
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
    const geoJsonText = JSON.stringify(sampleData);
    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    loadJson(geoJsonText, existing, store.dispatch);

    const state = store.getState() as FeatureCollection;
    expect(state.features.length).toBe(2);
    expect(state.features[0]?.properties?.name).toBe('Feature 1');
    expect(state.features[1]?.properties?.name).toBe('Feature 2');
    const secondString = state.features[1] as Feature<LineString>;
    expect(secondString.geometry.coordinates?.length).toBe(4);

    // add again, check it gets longer
    const justLineString = JSON.stringify([sampleData.features[1]]);
    const newExisting = store.getState() as FeatureCollection;
    loadJson(justLineString, newExisting.features, store.dispatch);
    const updatedState = store.getState() as FeatureCollection;
    expect(updatedState.features.length).toBe(2);
    const newSecondString = state.features[1] as Feature<LineString>;
    expect(newSecondString.geometry.coordinates?.length).toBe(8);
  });

  it('should not add features to the store from an invalid GeoJSON object', () => {
    const invalidGeoJsonText = JSON.stringify({
      type: 'InvalidType',
      features: []
    });

    const existing: Feature<Geometry, GeoJsonProperties>[] = [];
    loadJson(invalidGeoJsonText, existing, store.dispatch);

    const state = store.getState() as FeatureCollection;
    expect(state.features.length).toBe(0);
  });
});
