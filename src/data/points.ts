import { Feature, Geometry } from 'geojson'
import { REFERENCE_POINT_TYPE } from '../constants'
import { PointProps } from '../types'

const points: Feature<Geometry, PointProps>[] = [
  {
    type: 'Feature',
    id: 'p-1',
    properties: {
      name: 'SONO 1-1',
      dataType: REFERENCE_POINT_TYPE,
      'marker-color': '#FF0000',
      visible: true,
      time: '2024-11-14T19:10:00.000Z',
    },
    geometry: {
      coordinates: [
        -4.8936104075163485,
        36.21513817682367
      ],
      type: 'Point'
    }
  },
  {
    type: 'Feature',
    id: 'p-2',
    properties: {
      name: 'SONO 1-2',
      dataType: REFERENCE_POINT_TYPE,
      'marker-color': '#00FF00',
      visible: true,
      time: '2024-11-14T21:10:00.000Z',
      timeEnd: '2024-11-15T02:10:00.000Z'
    },
    geometry: {
      coordinates: [
        -3.5247318661170937,
        36.58891965401024
      ],
      type: 'Point'
    }
  },
  {
    type: 'Feature',
    id: 'p-3',
    properties: {
      name: 'NEW SONO',
      dataType: REFERENCE_POINT_TYPE,
      'marker-color': '#0000FF',
      visible: true
    },
    geometry: {
      coordinates: [
        -4.0060650478869775,
        35.69294394874646
      ],
      type: 'Point'
    }
  },
  {
    type: 'Feature',
    id: 'p-4',
    properties: {
      name: 'POINT D-1',
      dataType: REFERENCE_POINT_TYPE,
      'marker-color': '#FFFF00',
      visible: true
    },
    geometry: {
      coordinates: [
        -2.302065101137316,
        35.892217563281974
      ],
      type: 'Point'
    }
  }
]

export default points
