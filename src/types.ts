import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from './constants'

export type CoreDataProps = {
  dataType: typeof REFERENCE_POINT_TYPE | typeof TRACK_TYPE | typeof ZONE_TYPE
  name: string
  visible: boolean
  color: string
}

export type TrackProps = CoreDataProps & {
  dataType: typeof TRACK_TYPE
  shortName: string
  symbol: 'air' | 'nav' | 'sub' | 'lnd' | 'unk'
  times: string[]
  courses?: number[]
  speeds?: number[]
  labelInterval?: number
  symbolInterval?: number
}

// use types to ensure that either a centre time, or optional start/end times are used, but not both
type PointTime =  {time: string, timeStart?: never, timeEnd?: never};
type PeriodTime = {time?: never, timeStart?: string, timeEnd?: string};

type CoreZoneProps = CoreDataProps & { dataType: typeof ZONE_TYPE }
type CorePointProps = CoreDataProps & { dataType: typeof REFERENCE_POINT_TYPE }

export type ZoneProps = CoreZoneProps | (PointTime | PeriodTime);

export type PointProps = CorePointProps & (PointTime | PeriodTime);

export type NewTrackProps = Omit<TrackProps, 'times' | 'courses' | 'speeds' | 'labelInterval' | 'symbolInterval'> & {
  year: number
  month: number
  labelInterval: string
  symbolInterval: string
}

export type AddTrackProps = {
  trackId: string
}