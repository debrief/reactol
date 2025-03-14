import { Feature, Geometry } from 'geojson'
import { BACKDROP_TYPE } from '../constants'
import { BackdropProps } from '../types'

const backdrops: Feature<Geometry, BackdropProps>[] = [{
  type: 'Feature',
  properties: {
    dataType: BACKDROP_TYPE,
    name: 'Med Tiles',
    visible: true,
    maxNativeZoom: 8,
    maxZoom: 16,
    url: 'tiles/{z}/{x}/{y}.png'
  },
  geometry: {
    type: 'MultiPoint',
    coordinates: []
  },
  id: 'back-1'
}, {
  type: 'Feature',
  properties: {
    dataType: BACKDROP_TYPE,
    name: 'OpenStreetMap',
    visible: false,
    maxNativeZoom: 20,
    maxZoom: 20,
    url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  geometry: {
    type: 'MultiPoint',
    coordinates: []
  },
  id: 'back-2'
}]

export default backdrops