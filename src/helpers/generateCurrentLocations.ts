import * as turf from "turf";
import { Feature, MultiPoint, Point, Position } from "geojson";

export interface TimeState {
  start: number;
  current: number;
  end: number;
}

const isTemporal = (feature: Feature): boolean => {
  return feature.properties?.times
}

const timeVal = (timeStr: string): number => {
  return new Date(timeStr).getTime()
}

export const calcInterpLocation = (poly: MultiPoint, times: string[], current: number): Position | undefined => {
  const index = times.findIndex((time: string) => new Date(time).getTime() >= current)
  // console.log('index', index, current, times.map((t) => new Date(t).getTime()))
  if (index >= 0) {
    const coords = poly.coordinates
    const isFirst = index === 0
    const beforeIndex = isFirst ? 0 : index - 1
    const afterIndex = isFirst ? 0 : index
    const beforeCoords = coords[beforeIndex]
    const afterCoords = coords[afterIndex]
    const before = turf.point(beforeCoords)
    const after = turf.point(afterCoords)
    const turfPath = turf.lineString([beforeCoords, afterCoords])
    const len = turf.distance(before, after)
    const beforeTime = timeVal(times[beforeIndex])
    const afterTime = timeVal(times[afterIndex])
    const timeDelta = afterTime - beforeTime
    const proportion = (current - beforeTime) / timeDelta
    const lenProp = len * proportion
    const interpolated = isNaN(lenProp) ? before : turf.along(turfPath, lenProp)
    const markerLoc = interpolated.geometry.coordinates
    return markerLoc
  } else {
    return undefined
  }
}

export const generateCurrentLocations = (features: Feature[], time: TimeState): Feature<Point>[] => {
  const temporalFeatures = features.filter(isTemporal)
  const pointFeatures = temporalFeatures.map((feature) => {
    const times = feature.properties?.times
    const poly = feature.geometry as MultiPoint
    const markerLoc = calcInterpLocation(poly, times, time.current)
    if (markerLoc) {
      const pointFeature: Feature<Point> = {
        type: 'Feature',
        id: feature.id,
        geometry: {
          type: 'Point',
          coordinates: markerLoc
        },
        properties: {
          name: feature.properties?.name,
          color: feature.properties?.color
        }
      }
      return pointFeature
    } else {
      return undefined
    }
  })
  const res = pointFeatures.filter((f) => f !== undefined) as Feature<Point>[]
  return res
}

