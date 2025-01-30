import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE, GROUP_TYPE, BUOY_FIELD_TYPE } from './constants'

/** just a centre time if time provided, else start and end times */
export type TemporalShapeProps = {time?: string, timeEnd?: string} 

export type CoreDataProps = {
  dataType: typeof REFERENCE_POINT_TYPE | typeof TRACK_TYPE | typeof ZONE_TYPE | typeof GROUP_TYPE | typeof BUOY_FIELD_TYPE
  name: string
  visible: boolean
  color: string
}

type CoreTrackPrps = CoreDataProps & {
  shortName: string
  symbol: 'air' | 'nav' | 'sub' | 'lnd' | 'unk'
}

export type TrackProps = CoreTrackPrps & {
  dataType: typeof TRACK_TYPE
  times: string[]
  courses?: number[]
  speeds?: number[]
  labelInterval?: number
  symbolInterval?: number
}

export type BuoyFieldProps = CoreTrackPrps & TemporalShapeProps & {
  dataType: typeof BUOY_FIELD_TYPE
}
  

export type CoreShapeProps = CoreDataProps & TemporalShapeProps

export type ZoneProps = CoreShapeProps & { dataType: typeof ZONE_TYPE }
export type PointProps = CoreShapeProps & { dataType: typeof REFERENCE_POINT_TYPE }
export type GroupProps = {
  dataType: typeof GROUP_TYPE
  name: string
  visible: boolean
  units: Array<string | number>
}

export type NewTrackProps = Omit<TrackProps, 'times' | 'courses' | 'speeds' | 'labelInterval' | 'symbolInterval'> & {
  year: number
  month: number
  labelInterval: string
  symbolInterval: string
}

export type AddTrackProps = {
  trackId: string
}