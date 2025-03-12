import { Feature, Geometry } from 'geojson'
import { BACKDROP_TYPE } from '../constants'
import { BackdropProps } from '../types'

const backdrop: Feature<Geometry, BackdropProps> = {
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
}

export default backdrop