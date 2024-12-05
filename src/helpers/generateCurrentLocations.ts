import * as turf from "turf";
import { Feature, MultiPoint, Point, Position } from "geojson";
import { TimeState } from "../context/AppContext"; // Adjust the import path as necessary

const isTemporal = (feature: Feature): boolean => {
  return feature.properties?.times
}

const timeVal = (timeStr: string): number => {
  return new Date(timeStr).getTime()
}

const calcInterpLocation = (poly: MultiPoint, times: any, current: number, index: number): Position => {
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
}

export const generateCurrentLocations = (features: Feature[], time: TimeState): Feature<Point>[] => {
  const temporalFeatures = features.filter(isTemporal)
  const pointFeatures = temporalFeatures.map((feature) => {
    const times = feature.properties?.times
    const timeNow = time.current
    const index = times.findIndex((time: string) => new Date(time).getTime() >= timeNow)
    if (index >= 0) {
      const poly = feature.geometry as MultiPoint
      const markerLoc = calcInterpLocation(poly, times, time.current, index)
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
    }
    return undefined
  })
  const res = pointFeatures.filter((f) => f !== undefined) as Feature<Point>[]
  return res
}

