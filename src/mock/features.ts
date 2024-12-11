import { FeatureCollection } from 'geojson';
import { TRACK_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE } from '../constants';

const mockFeatures: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          dataType: TRACK_TYPE,
          color: '#F00',
          name: 'VAN GALEN',
          times: [
            '2024-11-14T16:16:53.662Z',
            '2024-11-14T18:16:53.662Z',
            '2024-11-14T20:16:53.662Z',
            '2024-11-14T22:16:53.662Z',
            '2024-11-15T00:16:53.662Z',
          ],
          courses: [
            252.1444002648299,
            247.7027788431718,
            246.51974075635033,
            255.89722958754757,
            253.75321749413487,
          ],
          speeds: [
            6.897450072808652,
            5.594994487778988,
            4.003923885317973,
            4.347747522443429,
            4.735925296595918,
          ],
          visible: false,
        },
        geometry: {
          type: 'MultiPoint',
          coordinates: [
            [-1.97, 36.42],
            [-2.58, 36.26],
            [-3.06, 36.1],
            [-3.4, 35.98],
            [-3.79, 35.9],
            [-3.89, 36.0],
            [-4.0, 36.1],
          ],
        },
        id: 'f-1',
      },
      {
        type: 'Feature',
        properties: {
          dataType: ZONE_TYPE,
          name: 'SAP 1-1',
          color: '#F00',
          startTime: '2024-11-14T19:10:00.000Z',
          endTime: '2024-11-15T04:10:00.000Z',
          visible: true,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-4.3348149616245735, 36.59618279278054],
              [-4.368613191708192, 36.21103443054283],
              [-3.7264425195973274, 36.15286660993874],
              [-3.697472423788696, 36.57293534444898],
              [-4.3348149616245735, 36.59618279278054],
            ],
          ],
        },
        id: 'f-4',
      },
      {
        type: 'Feature',
        properties: {
          dataType: REFERENCE_POINT_TYPE,
          name: 'SONO 1-1',
          color: '#FF0000',
          time: '2024-11-14T19:10:00.000Z',
          visible: true,
        },
        geometry: {
          type: 'Point',
          coordinates: [-4.8936104075163485, 36.21513817682367],
        },
        id: 'f-9',
      },
      {
        type: 'Feature',
        properties: {
          dataType: TRACK_TYPE,
          color: '#00F',
          name: 'TRACK 2',
          times: [
            '2024-11-15T00:00:00.000Z',
            '2024-11-15T01:00:00.000Z',
            '2024-11-15T02:00:00.000Z',
          ],
          courses: [180, 190, 200],
          speeds: [5, 6, 4],
          visible: true,
        },
        geometry: {
          type: 'MultiPoint',
          coordinates: [
            [-2.0, 36.45],
            [-2.1, 36.48],
            [-2.2, 36.51],
          ],
        },
        id: 'f-10',
      },
      {
        type: 'Feature',
        properties: {
          dataType: ZONE_TYPE,
          name: 'ZONE 2',
          color: '#00F',
          startTime: '2024-11-14T22:30:00.000Z',
          endTime: '2024-11-15T05:30:00.000Z',
          visible: true,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-4.3348149616245735, 36.59618279278054],
              [-4.368613191708192, 36.21103443054283],
              [-3.7264425195973274, 36.15286660993874],
              [-3.697472423788696, 36.57293534444898],
              [-4.3348149616245735, 36.59618279278054],
            ],
          ],
        },
        id: 'f-11',
      },
      {
        type: 'Feature',
        properties: {
          dataType: TRACK_TYPE,
          color: '#FF0',
          name: 'TRACK 3',
          times: [
            '2024-11-14T12:00:00.000Z',
            '2024-11-14T13:00:00.000Z',
            '2024-11-14T14:00:00.000Z',
            '2024-11-14T15:00:00.000Z',
          ],
          courses: [180, 170, 160, 150],
          speeds: [7, 8, 6, 5],
          visible: true,
        },
        geometry: {
          type: 'MultiPoint',
          coordinates: [
            [-3.5, 36.5],
            [-3.6, 36.6],
            [-3.7, 36.7],
            [-3.8, 36.8],
          ],
        },
        id: 'f-12',
      },
      {
        type: 'Feature',
        properties: {
          dataType: REFERENCE_POINT_TYPE,
          name: 'POINT 2',
          color: '#FFFF00',
          time: '2024-11-15T10:00:00.000Z',
          visible: true,
        },
        geometry: {
          type: 'Point',
          coordinates: [-3.0, 36.9],
        },
        id: 'f-13',
      },
      {
        type: 'Feature',
        properties: {
          dataType: REFERENCE_POINT_TYPE,
          name: 'POINT 3',
          color: '#00FF00',
          time: '2024-11-15T15:00:00.000Z',
          visible: false,
        },
        geometry: {
          type: 'Point',
          coordinates: [-3.5, 37.0],
        },
        id: 'f-14',
      },
      {
        type: 'Feature',
        properties: {
          dataType: ZONE_TYPE,
          name: 'ZONE 3',
          color: '#0F0',
          startTime: '2024-11-14T22:30:00.000Z',
          endTime: '2024-11-15T06:30:00.000Z',
          visible: false,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-4.5, 36.4],
              [-4.6, 36.5],
              [-4.7, 36.6],
              [-4.8, 36.7],
              [-4.9, 36.8],
              [-4.5, 36.4],
            ],
          ],
        },
        id: 'f-15',
      }
    ],
  };

export default mockFeatures