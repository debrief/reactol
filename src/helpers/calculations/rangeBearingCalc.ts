import { Feature, LineString, MultiPolygon, Point, Polygon, Position } from 'geojson'
import * as turf from '@turf/turf'
import nearestPoint from '@turf/nearest-point'
import pointToPolygonDistance from '@turf/point-to-polygon-distance'
import pointToLineDistance from '@turf/point-to-line-distance'
import { Calculation, GraphDataset, GraphDatum } from '../../types'

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


/** examine the times in the feature, find the index of the time equal to or greater than the  'time' parameter
 * then return the coordinates of the point at that index
 */
const distanceToFeature = (feature: Feature, basePoint: Feature<Point>): number | undefined => {
  const geom = feature.geometry
  // for all the different types of geometry, find the point closest to the basePoint, then calculate the distance
  switch (geom.type) {
  case 'Point':
  {
    if (!geom.coordinates || geom.coordinates.length === 0) return undefined
    const thisPoint = turf.point(geom.coordinates)    
    const distance = turf.distance(thisPoint, basePoint, 'meters')
    return distance
  }
  case 'MultiPoint':
  {
    const pointCollectionArr = geom.coordinates.map((coord: Position) => turf.point(coord))
    const pointCollection = turf.featureCollection(pointCollectionArr)
    const nearestPointCoord = nearestPoint(basePoint, pointCollection)
    return turf.distance(nearestPointCoord, basePoint)
  }
  case 'Polygon':
  {
    const geom = feature as Feature<Polygon>
    const dist = pointToPolygonDistance(basePoint, geom)
    return dist
  }
  case 'MultiPolygon':
  {
    const geom = feature as Feature<MultiPolygon>
    const dist = pointToPolygonDistance(basePoint, geom)
    return dist
  }
  case 'LineString':
  {
    const geom = feature as Feature<LineString>
    const dist = pointToLineDistance(basePoint, geom)
    return dist
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
          const distanceToFeatureVal = distanceToFeature(feature, turfBase)
          if (distanceToFeatureVal === undefined) {
            return undefined
          } else {
            rangeData.data.push({date: new Date(time).getTime(), value: distanceToFeatureVal})
            const relBearing = turf.bearing(turf.point([0, 0]), turfBase)
            const absBearing = relBearing < 0 ? relBearing + 360 : relBearing
            bearingData.data.push({date: new Date(time).getTime(), value: absBearing})
          }
        }
      })
      result.push(rangeData)
      result.push(bearingData)
    })
    return result
  }
}
