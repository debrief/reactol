import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { AppDispatch } from '../app/store';

export const load = (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch) => {
  try {
    const json = JSON.parse(text);
    if (json.type === 'FeatureCollection') {
      const newFeatures = json.features;
      console.log('todo - check if this is a an existing feature and update it', features.length);
      dispatch({ type: 'featureCollection/featuresAdded', payload: newFeatures });
    } else {
      console.error('Invalid GeoJSON format');
    }
  } catch (error) {
    console.error('Error parsing GeoJSON:', error);
  }
};
