import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { AppDispatch } from '../../app/store';
import combineFeatures from '../combineFeatures';
import { TRACK_TYPE } from '../../constants';

interface OpRepData {
  dtg: string;
  position: string;
  course: string;
  speed: string;
  depth?: string;
}

const parseOpRepLine = (line: string): OpRepData | null => {
  const regex = /^(\d{6}Z)\/(\d{4}\.\d{2}[NS])–(\d{5}\.\d{2}[EW])\/(\d{3})\/(\d{2}\.\d)\/(\d{3}|-)\/\//;
  const match = line.match(regex);
  if (!match) {
    return null;
  }
  return {
    dtg: match[1],
    position: `${match[2]} ${match[3]}`,
    course: match[4],
    speed: match[5],
    depth: match[6] === '-' ? undefined : match[6],
  };
};

const convertToGeoJson = (data: OpRepData[], year: number, month: number, name: string): Feature<Geometry, GeoJsonProperties> => {
  const latStringToValue = (coord: string) => {
    const degrees = parseFloat(coord.slice(0, 2));
    const minutes = parseFloat(coord.slice(2));
    return degrees + minutes / 60;
  }
  const longStringToValue = (coord: string) => {
    const degrees = parseFloat(coord.slice(0, 3));
    const minutes = parseFloat(coord.slice(3));
    return degrees + minutes / 60;
  }
  const coordinates = data.map((item) => {
    const lat = latStringToValue(item.position.split(' ')[0]);
    const lon = longStringToValue(item.position.split(' ')[1]);
    if (item.depth !== undefined) {
      const depth = -parseFloat(item.depth);
      return [lon, lat, depth];
    } else {
      return [lon, lat];
    }
  });

  const times = data.map((item) => {
    const day = parseInt(item.dtg.slice(0, 2), 10);
    const hour = parseInt(item.dtg.slice(2, 4), 10);
    const minute = parseInt(item.dtg.slice(4, 6), 10);
    return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
  });

  const courses = data.map((item) => parseInt(item.course, 10));
  const speeds = data.map((item) => parseFloat(item.speed));

  return {
    type: 'Feature',
    geometry: {
      type: 'MultiPoint',
      coordinates,
    },
    properties: {
      dataType: TRACK_TYPE,
      color: coordinates[0].length === 3 ? '#F00' : '#00F',
      name,
      times,
      courses,
      speeds,
    },
  };
};

export const loadOpRep = async (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, year?: number, month?: number, name?: string) => {

  if (!year || !month || !name) {
    return;
  }

  const lines = text.split('\n');
  const data: OpRepData[] = [];

  for (const line of lines) {
    const parsedLine = parseOpRepLine(line);
    if (parsedLine) {
      data.push(parsedLine);
    }
  }

  const newFeature = convertToGeoJson(data, year, month, name);

  console.log('new  feature', newFeature);
  const combined = combineFeatures(features, [newFeature]);
  dispatch({ type: 'featureCollection/featuresUpdated', payload: combined });
};

