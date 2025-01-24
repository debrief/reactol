import { Position } from 'geojson'
import { LatLngExpression } from 'leaflet'
import { format } from 'date-fns'
import dayjs from 'dayjs'

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

export const filterTrack = (filterApplied: boolean, start: number, end: number, times: string[], coords: Position[], labelInterval?:number, symbolInterval?:number): CoordInstance[] => {
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
    return {pos:[coords[index][1], coords[index][0]],time: format(times[index], 'ddHHmm\'Z\''), labelVisible, symbolVisible}
  })
  return res
}