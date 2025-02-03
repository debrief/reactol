import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from '../constants'
import { ZoneRectangleProps, ZoneShapeProps } from '../zoneShapeTypes'

export const zoneShapePropsFor = (shapeType: string): ZoneShapeProps => {
  switch (shapeType) {
  case RECTANGLE_SHAPE:
    return {
      shapeType: RECTANGLE_SHAPE,
      topLeft: [22, 33],
      bottomRight: [33, 44],
    } as ZoneRectangleProps  
  case POLYGON_SHAPE:
    return {
      shapeType: POLYGON_SHAPE,
      points: [[22, 33], [33, 44]],
    }
  case CIRCULAR_RING_SHAPE:
    return {
      shapeType: CIRCULAR_RING_SHAPE,
      origin: [22, 33],
      innerRadiusM: 44,
      outerRadiusM: 55,
    }
  case SECTION_CIRCULAR_RING_SHAPE:
    return {
      shapeType: SECTION_CIRCULAR_RING_SHAPE,
      origin: [22, 33],
      innerRadiusM: 44,
      outerRadiusM: 55,
      startAngle: 66, 
      endAngle: 77}
  case CIRCULAR_SECTOR_SHAPE:
    return {
      shapeType: CIRCULAR_SECTOR_SHAPE,
      origin: [22, 33],
      startAngle: 66, 
      endAngle: 77}
  case CIRCLE_SHAPE:
    return {
      shapeType: CIRCLE_SHAPE,
      origin: [22, 33],
      radiusM: 44}     
  default:
    throw new Error(`Unknown shape type: ${shapeType}`)  
  }
}
