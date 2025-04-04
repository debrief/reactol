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

const inRange = (filterApplied: boolean, time: string, limits: [number, number]): boolean => {
  const timeVal = new Date(time).getTime()
  return filterApplied ? timeVal >= limits[0] && timeVal <= limits[1] : true
}

export const trackIsVisibleInPeriod = (track: Feature<Geometry, TrackProps>, start: number, end: number): boolean => {
  const times = track.properties?.times
  if (!times) return false
  const firstTime = dayjs(times[0]).valueOf()
  const lastTime = dayjs(times[times.length - 1]).valueOf()
  return firstTime < end && lastTime > start
}

export const filterTrack = (filterApplied: boolean, start: number, end: number, times: string[], coords: Position[], labelInterval?:number, symbolInterval?:number): CoordInstance[] => {
  if (!times || !coords) return []
  const validIndices = times.map((time: string, index: number) => inRange(filterApplied, time, [start, end]) ? index : -1)
  const timeIndices = validIndices.filter((index: number) => index !== -1)
  let lastLabelTime = dayjs(times[timeIndices[0]]).valueOf()
  let lastSymbolTime = dayjs(times[timeIndices[0]]).valueOf()
  const res = timeIndices.map((index: number): CoordInstance => {
    const thisTime = dayjs(times[index]).valueOf()
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