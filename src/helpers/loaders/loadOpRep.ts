import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { AppDispatch } from '../../app/store';
import { TRACK_TYPE } from '../../constants';

interface OpRepData {
  dtg: string;
  position: string;
  course: string;
  speed: string;
  depth?: string;
}

const parseOpRepLine = (line: string): OpRepData | null => {
  const cleanLine = line.trim()
  if (cleanLine.length === 0) {
    return null;
  }
  const regex = /^(\d{6}Z)\/(\d{4}\.\d{2}[NS])–(\d{5}\.\d{2}[EW])\/(\d{1,3})\/(\d{1,2}\.?\d{0,2}?)\/(\d{1,3}|-)\/\//;
  const match = cleanLine.match(regex);
  if (!match) {
    console.log('failed to match: [' + cleanLine + ']')
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

const convertToGeoJson = (data: OpRepData[], year: number, month: number, name: string, shortName: string): Feature<Geometry, GeoJsonProperties> => {
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
      shortName,
      times,
      courses,
      speeds,
    },
  };
};

export const loadOpRep = async (text: string, _features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, year?: number, month?: number, name?: string, shortName?: string) => {

  if (!year || !month || !name || !shortName) {
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

  const newFeature = convertToGeoJson(data, year, month, name, shortName);
  dispatch({ type: 'featureCollection/featureAdded', payload: newFeature });
};

