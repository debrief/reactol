import { Calculation, GraphDataset, GraphDatum } from '../../types'
import { Feature, LineString, Position } from 'geojson'
import { isTemporal } from '../trackCalculations'
import * as turf from '@turf/turf'


/** examine the times in the feature, find the index of the time equal to or greater than the  'time' parameter
 * then return the coordinates of the point at that index
 */
const nearestPoint = (feature: Feature, time: number): Position | undefined => {
  const geom = feature.geometry as LineString
  const times = feature.properties?.times as number[]
  const index = times.findIndex((t) => t >= time)
  if (index === -1) {
    return undefined
  }
  return geom.coordinates[index]
}

export const bearingCalc: Calculation = {
  label: 'Bearing (°)',
  value: 'bearing',
  isRelative: true,
  calculate:(features: Feature[], baseId?: string): GraphDataset[] => {
    if (features.length === 0) {
      return []
    }
    const temporal: Feature[] = features.filter(isTemporal)
    const baseTrack = temporal.find((feature) => feature.id === baseId)
    if (!baseTrack) {
      console.warn('Couldn\'t find base track', baseId, features)
      return []
    }
    const nonBaseTemporal = temporal.filter((feature) => feature.id !== baseId)
    const baseGeom = baseTrack.geometry as LineString
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
        const relBearing = turf.bearing(turfTarget, turfBase)
        const absBearing = relBearing < 0 ? relBearing + 360 : relBearing
        return {date: new Date(time).getTime(), value: absBearing}
      })

      const nonNullRanges = ranges ? ranges.filter((range: GraphDatum | undefined) => range !== undefined) as GraphDatum[] : []
        
      return {label: name + ' Bearing', color: feature.properties?.stroke || undefined, data: nonNullRanges, featureName: name}
    })
  }
}
