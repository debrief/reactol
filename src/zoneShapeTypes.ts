import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, MULTI_POLYGON_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from './constants'

export type zoneShapes = typeof RECTANGLE_SHAPE | typeof POLYGON_SHAPE | typeof CIRCULAR_RING_SHAPE | typeof SECTION_CIRCULAR_RING_SHAPE | typeof CIRCULAR_SECTOR_SHAPE | typeof CIRCLE_SHAPE | typeof MULTI_POLYGON_SHAPE

// per-shape zone definitions. While the shape is stored as coords, constrution points and definitions are stored as properties

export type CoreZoneShapeProps = {
  shapeType: zoneShapes
}

export type ZoneRectangleProps = CoreZoneShapeProps & {
  shapeType: typeof RECTANGLE_SHAPE
  topLeft: [number, number]
  bottomRight: [number, number]
}

export type ZonePolygonProps = CoreZoneShapeProps & {
  shapeType: typeof POLYGON_SHAPE
  // note: we just use the coordinates object for the 
  // points, so we don't need to store them here
}

export type MultiZonePolygonProps = CoreZoneShapeProps & {
  shapeType: typeof MULTI_POLYGON_SHAPE
  // note: we just use the coordinates object for the 
  // points, so we don't need to store them here
}

export type CoreCircularProps = CoreZoneShapeProps & {
  origin: [number, number]
}

export type ZoneCircularRingProps = CoreCircularProps & {
  shapeType: typeof CIRCULAR_RING_SHAPE
  origin: [number, number]
  innerRadiusM: number 
  outerRadiusM: number 
}

export type ZoneSectionCircularRingProps = CoreCircularProps & {
  shapeType: typeof SECTION_CIRCULAR_RING_SHAPE
  origin: [number, number]
  innerRadiusM: number 
  outerRadiusM: number 
  startAngle: number
  endAngle: number
}

export type ZoneCircularSectorProps = CoreCircularProps & {
  shapeType: typeof CIRCULAR_SECTOR_SHAPE
  origin: [number, number]
  startAngle: number
  endAngle: number
  radiusM: number
}

export type ZoneCircleProps = CoreCircularProps & {
  shapeType: typeof CIRCLE_SHAPE
  origin: [number, number]
  radiusM: number
}

export type ZoneShapeProps = ZoneRectangleProps | ZonePolygonProps | ZoneCircularRingProps | ZoneSectionCircularRingProps | ZoneCircularSectorProps | ZoneCircleProps | MultiZonePolygonProps