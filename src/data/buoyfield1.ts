import { Feature, MultiPoint } from 'geojson'
import { BUOY_FIELD_TYPE } from '../constants'
import { BuoyFieldProps } from '../types'

const field: Feature<MultiPoint, BuoyFieldProps> = {
  type: 'Feature',
  properties: { 
    dataType: BUOY_FIELD_TYPE,
    'marker-color': '#FF0',
    name: 'Z12344',
    shortName: '12344',
    visible: true
  },
  geometry: {
    type: 'MultiPoint',
    coordinates: [
      [-4.567566, 36.359375],
      [-4.460449, 36.374856],
      [-4.350586, 36.396968],
      [-4.229736, 36.40581],
      [-4.564819, 36.264207],
      [-4.460449, 36.304059],
      [-4.345093, 36.319551],
      [-4.22699, 36.337253],
      [-4.559326, 36.217687],
      [-4.460449, 36.252197],
      [-4.345093, 36.267689],
      [-4.22699, 36.285391]
    ]
  },
  id: 'bf-1'
}

export default field
