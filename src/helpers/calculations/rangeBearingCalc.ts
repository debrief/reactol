import { Feature, LineString, Point, Position } from 'geojson'
import * as turf from '@turf/turf'
import nearestPoint from '@turf/nearest-point'
import pointToLineDistance from '@turf/point-to-line-distance'
import { Calculation, GraphDataset, GraphDatum } from '../../types'
import nearestPointOnLine from '@turf/nearest-point-on-line'

/** examine the times in the feature, find the index of the time equal to or greater than the  'time' parameter
 * then return the coordinates of the point at that index
 */
const nearestPointTrack = (feature: Feature, time: number): Position | undefined => {
  if (feature.properties?.times !== undefined) {
    const geom = feature.geometry as LineString
    const times = feature.properties?.times as number[]
    const index = times.findIndex((t) => t >= time)
    if (index === -1) {
      return undefined
    }
    return geom.coordinates[index]
  } else {
    return undefined
  }
}


/** calculate the range and bearing from the `basePoint` to the nearest point on the `feature` shape
 */
const rangeBearingFeature = (feature: Feature, basePoint: Feature<Point>): {range: number, bearing: number} | undefined => {
  const geom = feature.geometry
  // for all the different types of geometry, find the point closest to the basePoint, then calculate the distance
  switch (geom.type) {
  case 'Point':
  {
    if (!geom.coordinates || geom.coordinates.length === 0) return undefined
    const thisPoint = turf.point(geom.coordinates)    
    const distance = turf.distance(thisPoint, basePoint, 'meters')
    return {range: distance, bearing: turf.bearing(thisPoint, basePoint)}
  }
  case 'MultiPoint':
  {
    const pointCollectionArr = geom.coordinates.map((coord: Position) => turf.point(coord))
    const pointCollection = turf.featureCollection(pointCollectionArr)
    const nearestPointCoord = nearestPoint(basePoint, pointCollection)
    return {range: turf.distance(nearestPointCoord, basePoint), bearing: turf.bearing(nearestPointCoord, basePoint)}
  }
  case 'Polygon':
  {
    const geom = feature as Feature<LineString>
    const distance = pointToLineDistance(basePoint, geom)
    const nearest = nearestPointOnLine(geom, basePoint)
    console.log('nearest', geom, nearest)
    const bearing = turf.bearing(nearest, basePoint)
    return {range: distance, bearing: bearing}
  }
  case 'MultiPolygon':
  {
    throw new Error('Multipolygon not supported for range/bearing')
    // const geom = feature as Feature<MultiPolygon>
    // const geom0 = turf.polygon(geom.coordinates[0])
    // const dist = pointToPolygonDistance(basePoint, geom)
    // const bearing = turf.bearing(basePoint, geom)
    // return {range: dist, bearing: bearing}
  }
  case 'LineString':
  {
    const geom = feature as Feature<LineString>
    const dist = pointToLineDistance(basePoint, geom)
    const nearest = nearestPointOnLine(geom, basePoint)
    console.log('nearest', geom, nearest)
    const bearing = turf.bearing(nearest, basePoint)
    return {range: dist, bearing: bearing}
  }
  default:
    return undefined
  }
}

export const RANGE_DATA = 'range'
export const BEARING_DATA = 'bearing'

export const rangeBearingCalc: Calculation = {
  label: 'Range (m)',
  value: 'range',
  isRelative: true,
  calculate:(features: Feature[], baseId?: string): GraphDataset[] => {
    const result: GraphDataset[] = []
    if (features.length === 0) {
      return result
    }

    const baseTrack = features.find((feature) => feature.id === baseId)
    if (!baseTrack) {
      console.warn('Couldn\'t find base track', baseId)
      return result
    }
    const nonBaseTrack = features.filter((feature) => feature.id !== baseId)
    const baseGeom = baseTrack.geometry as LineString
    nonBaseTrack.forEach((feature) => {
      const name = feature.properties?.shortName || feature.properties?.name || feature.id
      const rangeData: GraphDataset = {
        label: name + ' Range',
        color: feature.properties?.stroke || feature.properties?.['marker-color'] || undefined,
        data: [],
        featureName: name,
        extraProp: RANGE_DATA
      }
      const bearingData: GraphDataset = {
        label: name + ' Bearing',
        color: feature.properties?.stroke || feature.properties?.['marker-color'] || undefined,
        data: [],
        featureName: name,
        extraProp: BEARING_DATA
      }
      baseTrack.properties?.times.forEach((time: number, index: number): GraphDatum | undefined => {
        const basePoint = baseGeom.coordinates[index]
        const turfBase = turf.point(basePoint)
        if (feature.properties?.times !== undefined) {
          const nearestPoint = nearestPointTrack(feature, time)
          if (nearestPoint === undefined) {
            return undefined
          } else {
            const turfTarget = turf.point(nearestPoint)
            const distance = turf.distance(turfTarget, turfBase)
            const relBearing = turf.bearing(turfTarget, turfBase)
            const absBearing = relBearing < 0 ? relBearing + 360 : relBearing
    
            rangeData.data.push({date: new Date(time).getTime(), value: distance}) 
            bearingData.data.push({date: new Date(time).getTime(), value: absBearing})
          }
        } else {
          const rangeBearingToFeatureVal = rangeBearingFeature(feature, turfBase)
          if (rangeBearingToFeatureVal === undefined) {
            return undefined
          } else {
            rangeData.data.push({date: new Date(time).getTime(), value: rangeBearingToFeatureVal.range})
            bearingData.data.push({date: new Date(time).getTime(), value: rangeBearingToFeatureVal.bearing})
          }
        }
      })
      result.push(rangeData)
      result.push(bearingData)
    })
    return result
  }
}
