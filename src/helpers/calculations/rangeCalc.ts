import { Calculation, GraphDataset, GraphDatum } from "../../components/GraphModal";
import { Feature, MultiPoint, Position } from 'geojson'
import * as turf from "turf";
import { isTemporal } from "../trackCalculations";


/** examine the times in the feature, find the index of the time equal to or greater than the  'time' parameter
 * then return the coordinates of the point at that index
 */
const nearestPoint = (feature: Feature, time: number): Position | undefined => {
  const geom = feature.geometry as MultiPoint
  const times = feature.properties?.times as number[]
  const index = times.findIndex((t) => t >= time)
  if (index === -1) {
    return undefined
  }
  return geom.coordinates[index]
}

export const rangeCalc: Calculation = {
  label: 'Range',
  value: 'range',
  isRelative: true,
  calculate:(features: Feature[], baseId?: string): GraphDataset[] => {
    const temporal = features.filter(isTemporal)
    const baseTrack = temporal.find((feature) => feature.id === baseId)
    if (!baseTrack) {
      console.warn('Couldn\'t find base track', baseId)
      return []
    }
    const nonBaseTemporal = temporal.filter((feature) => feature.id !== baseId)
    const baseGeom = baseTrack.geometry as MultiPoint
    return nonBaseTemporal.map((feature) => {
      const name = feature.properties?.name || feature.id

      const ranges = baseTrack.properties?.times.map((time: number, index: number): GraphDatum | undefined => {
        const targetPoint = nearestPoint(feature, time)
        const basePoint = baseGeom.coordinates[index]
        if (!targetPoint) {
          return undefined
        }
        // use turf to calculate distance between points
        const turfTarget = turf.point(targetPoint)
        const turfBase = turf.point(basePoint)
        const distance = turf.distance(turfTarget, turfBase);
        return {date: new Date(time).getTime(), value: distance}
      })

      const nonNullRanges = ranges ? ranges.filter((range: GraphDatum | undefined) => range !== undefined) as GraphDatum[] : []
        
      return {label: name + ' Range', color: feature.properties?.color || undefined, data: nonNullRanges}
    })
  }
}
