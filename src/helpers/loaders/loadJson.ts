import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { AppDispatch } from '../../app/store';
import combineFeatures from '../combineFeatures';

export const loadJson = (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch) => {
  const json = JSON.parse(text);
  if (json.type === 'FeatureCollection') {
    const newFeatures = json.features;
    const combined = combineFeatures(features, newFeatures)
    dispatch({ type: 'featureCollection/featuresUpdated', payload: combined });
  } else {
    throw new Error('Invalid GeoJSON format:' + json.type);
  }
};
