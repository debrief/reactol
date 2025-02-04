import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from './constants'

export type zoneShapes = typeof RECTANGLE_SHAPE | typeof POLYGON_SHAPE | typeof CIRCULAR_RING_SHAPE | typeof SECTION_CIRCULAR_RING_SHAPE | typeof CIRCULAR_SECTOR_SHAPE | typeof CIRCLE_SHAPE

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

export type ZoneCircularRingProps = CoreZoneShapeProps & {
  shapeType: typeof CIRCULAR_RING_SHAPE
  origin: [number, number]
  innerRadiusM: number 
  outerRadiusM: number 
}

export type ZoneSectionCircularRingProps = CoreZoneShapeProps & {
  shapeType: typeof SECTION_CIRCULAR_RING_SHAPE
  origin: [number, number]
  innerRadiusM: number 
  outerRadiusM: number 
  startAngle: number
  endAngle: number
}

export type ZoneCircularSectorProps = CoreZoneShapeProps & {
  shapeType: typeof CIRCULAR_SECTOR_SHAPE
  origin: [number, number]
  startAngle: number
  endAngle: number
}

export type ZoneCircleProps = CoreZoneShapeProps & {
  shapeType: typeof CIRCLE_SHAPE
  origin: [number, number]
  radiusM: number
}

export type ZoneShapeProps = ZoneRectangleProps | ZonePolygonProps | ZoneCircularRingProps | ZoneSectionCircularRingProps | ZoneCircularSectorProps | ZoneCircleProps