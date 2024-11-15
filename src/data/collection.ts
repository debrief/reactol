import { Feature, FeatureCollection } from 'geojson'
import track1 from './track1.ts'
import track2 from './track2.ts'
import points from './points.ts'
import zones from './zones.ts'

const features: FeatureCollection = {
  type: "FeatureCollection",  
  features: [track1 as Feature, track2 as Feature, ...points,  ...zones]
}

export default features