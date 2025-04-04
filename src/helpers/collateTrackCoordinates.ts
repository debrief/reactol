import { Feature, Geometry, Position } from 'geojson'
import { LatLngExpression } from 'leaflet'
import { formatInTimeZone } from 'date-fns-tz'
import dayjs from 'dayjs'
import { TrackProps } from '../types'

export interface CoordInstance {
  pos: LatLngExpression
  time: string
  labelVisible: boolean
  symbolVisible: boolean
}

export const trackIsVisibleInPeriod = (track: Feature<Geometry, TrackProps>, start: number, end: number): boolean => {
  const times = track.properties?.times
  if (!times) return false
  const firstTime = dayjs(times[0]).valueOf()
  const lastTime = dayjs(times[times.length - 1]).valueOf()
  return firstTime < end && lastTime > start
}

export const collateTrackCoordinates = (times: string[], coords: Position[], labelInterval?:number, symbolInterval?:number): CoordInstance[] => {
  if (!times || !coords) return []
  let lastLabelTime = dayjs(times[0]).valueOf()
  let lastSymbolTime = dayjs(times[0]).valueOf()
  const res = times.map((time: string, index: number): CoordInstance => {
    const thisTime = dayjs(time).valueOf()
    let labelVisible = false
    let symbolVisible = false
    if (labelInterval && thisTime - lastLabelTime >= labelInterval) {
      labelVisible = true
      lastLabelTime = thisTime
    }
    if (symbolInterval && thisTime - lastSymbolTime >= symbolInterval) {
      symbolVisible = true
      lastSymbolTime = thisTime
    }
    const datestr = formatInTimeZone(times[index], 'UTC', 'ddHHmm\'Z\'')
    return {pos:[coords[index][1], coords[index][0]],time: datestr, labelVisible, symbolVisible}
  })
  return res
}