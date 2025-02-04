import { Position } from 'geojson'
import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from '../constants'
import { ZoneCircleProps, ZoneCircularRingProps, ZoneCircularSectorProps, ZoneRectangleProps, ZoneSectionCircularRingProps, ZoneShapeProps } from '../zoneShapeTypes'

/** Convert meters to degrees at a given latitude */
export const metersToDegreesAtLatitude = (meters: number, latitude: number): number => {
  // Length of a degree of latitude is roughly constant at 111,319.9 meters
  // Length of a degree of longitude varies with cosine of latitude
  const latitudeDegrees = meters / 111319.9
  const longitudeDegrees = meters / (111319.9 * Math.cos(latitude * Math.PI / 180))
  // Return the larger value to ensure the circle isn't too small
  return Math.max(latitudeDegrees, longitudeDegrees)
}

/**
 * Generate points for a circle or arc
 * @param origin Center point [longitude, latitude]
 * @param radiusM Radius in meters
 * @param startAngle Start angle in degrees (0 = North, clockwise)
 * @param endAngle End angle in degrees
 * @param numPoints Number of points to generate
 * @returns Array of [longitude, latitude] positions
 */
export const generateCirclePoints = (
  origin: [number, number],
  radiusM: number,
  startAngle = 0,
  endAngle = 360,
  numPoints = 12
): Position[] => {
  const points: Position[] = []
  const angleStep = (endAngle - startAngle) / numPoints
  const radiusDegrees = metersToDegreesAtLatitude(radiusM, origin[1])
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (90 - (startAngle + i * angleStep)) * (Math.PI / 180)
    const x = origin[0] + radiusDegrees * Math.cos(angle)
    const y = origin[1] + radiusDegrees * Math.sin(angle)
    points.push([x, y])
  }
  
  // Close the shape by adding the first point again
  if (endAngle - startAngle === 360) {
    points.push([points[0][0], points[0][1]])
  }
  
  return points
}

/**
 * Generate GeoJSON polygon coordinates for different shape types
 * @param specifics Shape properties including type and dimensions
 * @returns Array of coordinate rings defining the shape
 */
export const generateShapeCoordinates = (specifics: ZoneShapeProps, coordinates: Position[][]): Position[][] => {
  switch (specifics.shapeType) {
  case RECTANGLE_SHAPE: {
    const { topLeft, bottomRight } = specifics as ZoneRectangleProps
    return [[
      topLeft,
      [bottomRight[0], topLeft[1]],
      bottomRight,
      [topLeft[0], bottomRight[1]],
      topLeft // Close the polygon
    ]]
  }
  
  case CIRCLE_SHAPE: {
    const { origin, radiusM } = specifics as ZoneCircleProps
    return [generateCirclePoints(origin, radiusM)]
  }
  
  case CIRCULAR_RING_SHAPE: {
    const { origin, innerRadiusM, outerRadiusM } = specifics as ZoneCircularRingProps
    // Create two circles - outer and inner (in reverse for proper polygon with hole)
    const outerRing = generateCirclePoints(origin, outerRadiusM)
    const innerRing = generateCirclePoints(origin, innerRadiusM).reverse()
    return [outerRing, innerRing]
  }
  
  case SECTION_CIRCULAR_RING_SHAPE: {
    const { origin, innerRadiusM, outerRadiusM, startAngle, endAngle } = specifics as ZoneSectionCircularRingProps
    // Create the arc segments and connect them
    const outerArc = generateCirclePoints(origin, outerRadiusM, startAngle, endAngle)
    const innerArc = generateCirclePoints(origin, innerRadiusM, endAngle, startAngle)
    return [[
      ...outerArc,
      ...innerArc,
      outerArc[0] // Close the polygon
    ]]
  }
  
  case CIRCULAR_SECTOR_SHAPE: {
    const { origin, startAngle, endAngle, radiusM } = specifics as ZoneCircularSectorProps
    const arc = generateCirclePoints(origin, radiusM, startAngle, endAngle)
    return [[
      origin,
      ...arc,
      origin // Close the polygon
    ]]
  }
  case POLYGON_SHAPE: {
    // check the first and last coordinates are the same
    const line = coordinates[0]
    if (line[0][0] !== line[line.length - 1][0] || line[0][1] !== line[line.length - 1][1]) {
      line.push([...line[0]])
    }
    return coordinates
  }
  default:
    console.log('Unknown shape type:', specifics)
    return []
  }
}
