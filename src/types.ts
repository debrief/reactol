import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE, GROUP_TYPE, BUOY_FIELD_TYPE } from './constants'
import { LineStyleProps, PointStyleProps, PolygonStyleProps } from './standardShapeProps.ts'
import { ZoneShapeProps } from './zoneShapeTypes.ts'
import { Feature } from 'geojson'

/** just a centre time if time provided, else start and end times */
export type TemporalShapeProps = {time?: string, timeEnd?: string} 

export type CoreDataProps = {
  dataType: typeof REFERENCE_POINT_TYPE | typeof TRACK_TYPE | typeof ZONE_TYPE | typeof GROUP_TYPE | typeof BUOY_FIELD_TYPE
  name: string
  visible: boolean
}

export type EnvOptions = 'air' | 'nav' | 'sub' | 'lnd' | 'unk'

type CoreTrackPrps = CoreDataProps & {
  shortName: string
  env: EnvOptions
}

export type TrackProps = CoreTrackPrps & LineStyleProps & {
  dataType: typeof TRACK_TYPE
  times: string[]
  courses?: number[]
  speeds?: number[]
  labelInterval?: number
  symbolInterval?: number
  initialMonth: number
  initialYear: number
}

export type BuoyFieldProps = Omit<CoreTrackPrps, 'env'> & TemporalShapeProps & PointStyleProps & {
  dataType: typeof BUOY_FIELD_TYPE
}  

export type CoreShapeProps = CoreDataProps & TemporalShapeProps


export type ZoneProps = CoreShapeProps & PolygonStyleProps & { dataType: typeof ZONE_TYPE
  specifics: ZoneShapeProps
 }
export type PointProps = CoreShapeProps & PointStyleProps & { dataType: typeof REFERENCE_POINT_TYPE }
export type GroupProps = {
  dataType: typeof GROUP_TYPE
  name: string
  visible: boolean
  units: Array<string | number>
}

export type NewTrackProps = Omit<TrackProps, 'times' | 'courses' | 'speeds' | 'labelInterval' | 'symbolInterval'> & {
  labelInterval: string
  symbolInterval: string
}

export type ExistingTrackProps = {
  trackId: string
}

export type AddTrackProps = {
  trackId: string
}

// graph support types
export interface Calculation {
  label: string
  value: string
  isRelative: boolean
  calculate: {(features: Feature[], baseId?: string): GraphDataset[]}
}

export type GraphDatum = { date: number, value: number | null }

export type GraphDataset = { label: string, 
  featureName: string,
  color?: string,
  data: GraphDatum[] }