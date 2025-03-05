import { Feature } from 'geojson'
import track1 from './track1'
import track2 from './track2'
import track3 from './track3'
import zones from './zones'
import points from './points'
import field from './buoyfield1'
import multiPolygon from './multi_polygon'

export type SampleItem = {
  name: string
  data: Feature[]
}

export const sampleItems: SampleItem[] = [
  { name: 'Bulk selection', data: [] },
  { name: 'Track 1', data: [track1] },
  { name: 'Track 2', data: [track2] },
  { name: 'Track 3', data: [track3] },
  { name: 'Buoy field', data: [field] },
  { name: 'Zones', data: zones },
  { name: 'Points', data: points },
  { name: 'Multi Polygon', data: [multiPolygon] },
]
