import { Position } from "geojson";
import { LatLngExpression } from 'leaflet'
import { format } from "date-fns";

export interface CoordInstance {
  pos: LatLngExpression
  time: string
}

const inRange = (time: string, limits: [number, number]): boolean => {
  const timeVal = new Date(time).getTime()
  return timeVal >= limits[0] && timeVal <= limits[1]
}

export const filterTrack = (start: number, end: number, times: string[], coords: Position[]): CoordInstance[] => {
  const validIndices = times.map((time: string, index: number) => inRange(time, [start, end]) ? index : -1)
  const timeIndices = validIndices.filter((index: number) => index !== -1)
  const res = timeIndices.map((index: number): CoordInstance => {
    return {pos:[coords[index][1], coords[index][0]],time: format(times[index], "ddHHmm'Z'")}
  })
  return res
}