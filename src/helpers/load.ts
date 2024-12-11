import { FeatureCollection } from 'geojson';
import { AppDispatch } from '../app/store';

export const load = (text: string, features: FeatureCollection, dispatch: AppDispatch) => {
  try {
    const json = JSON.parse(text);
    if (json.type === 'FeatureCollection') {
      const newFeatures = json.features;
      dispatch({ type: 'featureCollection/featuresAdded', payload: newFeatures });
    } else {
      console.error('Invalid GeoJSON format');
    }
  } catch (error) {
    console.error('Error parsing GeoJSON:', error);
  }
};
