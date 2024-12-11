import { load } from '../load';
import { FeatureCollection } from 'geojson';
import { createStore } from 'redux';
import featuresReducer from '../../features/geoFeatures/geoFeaturesSlice';

describe('load function', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore(featuresReducer);
  });

  it('should add features to the store from a valid GeoJSON object', () => {
    const geoJsonText = JSON.stringify({
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
    });

    load(geoJsonText, { type: 'FeatureCollection', features: [] }, store.dispatch);

    const state = store.getState();
    expect(state.features.length).toBe(2);
    expect(state.features[0].properties.name).toBe('Feature 1');
    expect(state.features[1].properties.name).toBe('Feature 2');
  });

  it('should not add features to the store from an invalid GeoJSON object', () => {
    const invalidGeoJsonText = JSON.stringify({
      type: 'InvalidType',
      features: []
    });

    load(invalidGeoJsonText, { type: 'FeatureCollection', features: [] }, store.dispatch);

    const state = store.getState();
    expect(state.features.length).toBe(0);
  });
});
