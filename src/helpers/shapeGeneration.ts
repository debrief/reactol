import { Position } from 'geojson'
import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from '../constants'
import { ZoneCircleProps, ZoneCircularRingProps, ZoneCircularSectorProps, ZoneRectangleProps, ZoneSectionCircularRingProps, ZoneShapeProps } from '../zoneShapeTypes'

const DEG_TO_RAD = Math.PI / 180
const EARTH_RADIUS_METERS = 111319.9

// NOTE: we've removed angle validation, since some shapes 
// reverse the start and end angles during generation
// /**
//  * Validates angle values are within the valid range
//  * @param startAngle Start angle in degrees
//  * @param endAngle End angle in degrees
//  * @throws {Error} If angles are invalid
//  */
// const validateAngles = (startAngle: number, endAngle: number) => {
//   if (startAngle < 0 || startAngle > 360) {
//     throw new Error('Start angle must be between 0 and 360 degrees')
//   }
//   if (endAngle < 0 || endAngle > 360) {
//     throw new Error('End angle must be between 0 and 360 degrees')
//   }
//   if (endAngle < startAngle) {
//     throw new Error('End angle must be greater than start angle')
//   }
// }

/**
 * Convert meters to degrees at a given latitude
 * @param meters Distance in meters
 * @param latitude Latitude in degrees
 * @returns Degrees of latitude/longitude
 * @throws {Error} If meters is negative or latitude is invalid
 */
export const metersToDegreesAtLatitude = (meters: number, latitude: number): number => {
  if (meters < 0) {
    throw new Error('Distance in meters must be positive')
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees')
  }
  
  const latitudeDegrees = meters / EARTH_RADIUS_METERS
  const longitudeDegrees = meters / (EARTH_RADIUS_METERS * Math.cos(latitude * DEG_TO_RAD))
  return Math.max(latitudeDegrees, longitudeDegrees)
}

/**
 * Generate points for a circle or arc
 * @param origin Center point [longitude, latitude]
 * @param radiusM Radius in meters
 * @param startAngle Start angle in degrees (0 = North, clockwise)
 * @param endAngle End angle in degrees
 * @param numPoints Number of points to generate (optional, will be calculated based on radius if not provided)
 * @returns Array of [longitude, latitude] positions
 * @throws {Error} If parameters are invalid
 */
export const generateCirclePoints = (
  origin: [number, number],
  radiusM: number,
  startAngle = 0,
  endAngle = 360,
  numPoints = 64
): Position[] => {
  if (radiusM <= 0) {
    throw new Error('Radius must be positive')
  }
  
  // Calculate number of points based on radius if not provided
  // More points for larger circles, minimum of 12
  const points: Position[] = []
  const angleStep = (endAngle - startAngle) / numPoints
  const radiusDegrees = metersToDegreesAtLatitude(radiusM, origin[1])
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (90 - (startAngle + i * angleStep)) * DEG_TO_RAD
    const x = origin[0] + radiusDegrees * Math.cos(angle)
    const y = origin[1] + radiusDegrees * Math.sin(angle)
    points.push([x, y])
  }
  
  if (endAngle - startAngle === 360) {
    points.push([points[0][0], points[0][1]])
  }
  
  return points
}

/**
 * Generate GeoJSON polygon coordinates for different shape types
 * @param specifics Shape properties including type and dimensions
 * @param coordinates Optional array of coordinate rings for polygon shapes
 * @returns Array of coordinate rings defining the shape
 * @throws {Error} If shape parameters are invalid
 */
export const generateShapeCoordinates = (specifics: ZoneShapeProps, coordinates: Position[][]): Position[][] => {
  if (!specifics) {
    throw new Error('Shape specifics are required')
  }

  switch (specifics.shapeType) {
  case RECTANGLE_SHAPE: {
    const { topLeft, bottomRight } = specifics as ZoneRectangleProps
    if (!topLeft || !bottomRight) {
      throw new Error('Rectangle requires both topLeft and bottomRight coordinates')
    }
    return [[
      topLeft,
      [bottomRight[0], topLeft[1]],
      bottomRight,
      [topLeft[0], bottomRight[1]],
      topLeft
    ]]
  }
  
  case CIRCLE_SHAPE: {
    const { origin, radiusM } = specifics as ZoneCircleProps
    if (!origin || !radiusM) {
      throw new Error('Circle requires origin and radius')
    }
    return [generateCirclePoints(origin, radiusM)]
  }
  
  case CIRCULAR_RING_SHAPE: {
    const { origin, innerRadiusM, outerRadiusM } = specifics as ZoneCircularRingProps
    if (!origin || !innerRadiusM || !outerRadiusM) {
      throw new Error('Circular ring requires origin, inner radius, and outer radius')
    }
    if (innerRadiusM >= outerRadiusM) {
      throw new Error('Inner radius must be less than outer radius')
    }
    const outerRing = generateCirclePoints(origin, outerRadiusM)
    const innerRing = generateCirclePoints(origin, innerRadiusM).reverse()
    return [outerRing, innerRing]
  }
  
  case SECTION_CIRCULAR_RING_SHAPE: {
    const { origin, innerRadiusM, outerRadiusM, startAngle, endAngle } = specifics as ZoneSectionCircularRingProps
    if (!origin || !innerRadiusM || !outerRadiusM || startAngle === undefined || endAngle === undefined) {
      throw new Error('Section circular ring requires origin, inner radius, outer radius, start angle, and end angle')
    }
    if (innerRadiusM >= outerRadiusM) {
      throw new Error('Inner radius must be less than outer radius')
    }
    const outerArc = generateCirclePoints(origin, outerRadiusM, startAngle, endAngle)
    const innerArc = generateCirclePoints(origin, innerRadiusM, endAngle, startAngle)
    return [[...outerArc, ...innerArc, outerArc[0]]]
  }
  
  case CIRCULAR_SECTOR_SHAPE: {
    const { origin, startAngle, endAngle, radiusM } = specifics as ZoneCircularSectorProps
    if (!origin || !radiusM || startAngle === undefined || endAngle === undefined) {
      throw new Error('Circular sector requires origin, radius, start angle, and end angle')
    }
    const arc = generateCirclePoints(origin, radiusM, startAngle, endAngle)
    return [[origin, ...arc, origin]]
  }
  
  case POLYGON_SHAPE: {
    if (!coordinates || !coordinates[0] || coordinates[0].length < 3) {
      throw new Error('Polygon requires at least 3 coordinates')
    }
    const line = [...coordinates[0]]
    if (line[0][0] !== line[line.length - 1][0] || line[0][1] !== line[line.length - 1][1]) {
      line.push([...line[0]])
    }
    return [line]
  }
  
  default:
    throw new Error(`Unknown shape type: ${specifics}`)
  }
}
