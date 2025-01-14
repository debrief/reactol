import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { AppDispatch } from '../../app/store';
import combineFeatures from '../combineFeatures';

export const loadJson = (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch) => {
  const json = JSON.parse(text);
  if (json.type === 'FeatureCollection') {
    const newFeatures = json.features;
    // TODO: validate the properties in the features against the schema
    const combined = combineFeatures(features, newFeatures)
    dispatch({ type: 'featureCollection/featuresUpdated', payload: combined });
  } else if (json.type === 'Feature') {
    const newFeature = json as Feature<Geometry, GeoJsonProperties>
    dispatch({ type: 'featureCollection/featureAdded', payload: newFeature });
  } else {
    throw new Error('Invalid GeoJSON format:' + json.type);
  }
};
