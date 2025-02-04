import { Feature, Polygon, Position } from 'geojson'
import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE, ZONE_TYPE } from '../constants'
import { ZoneProps } from '../types'
import { ZoneRectangleProps, ZoneShapeProps } from '../zoneShapeTypes'

const zoneShapePropsFor = (shapeType: string): ZoneShapeProps => {
  switch (shapeType) {
  case RECTANGLE_SHAPE:
    return {
      shapeType: RECTANGLE_SHAPE,
      topLeft: [0, 0],
      bottomRight: [0, 0],
    } as ZoneRectangleProps  
  case POLYGON_SHAPE:
    return {
      shapeType: POLYGON_SHAPE
    }
  case CIRCULAR_RING_SHAPE:
    return {
      shapeType: CIRCULAR_RING_SHAPE,
      origin: [0, 0],
      innerRadiusM: 1000,
      outerRadiusM: 5000,
    }
  case SECTION_CIRCULAR_RING_SHAPE:
    return {
      shapeType: SECTION_CIRCULAR_RING_SHAPE,
      origin: [0, 0],
      innerRadiusM: 1000,
      outerRadiusM: 5000,
      startAngle: 0, 
      endAngle: 90}
  case CIRCULAR_SECTOR_SHAPE:
    return {
      shapeType: CIRCULAR_SECTOR_SHAPE,
      origin: [0, 0],
      radiusM: 5000,
      startAngle: 0, 
      endAngle: 90}
  case CIRCLE_SHAPE:
    return {
      shapeType: CIRCLE_SHAPE,
      origin: [0, 0],
      radiusM: 5000}     
  default:
    throw new Error(`Unknown shape type: ${shapeType}`)  
  }
}

export const zoneFeatureFor = (shapeType: string) => {
  const isPolygon = shapeType === POLYGON_SHAPE
  const coords: Position[] = isPolygon ? [[22, 23],[33, 34], [34, 33],[22, 23]] : []
  const zone: Feature<Polygon, ZoneProps> = {
    type: 'Feature',
    properties: {
      name: '',
      dataType: ZONE_TYPE,
      specifics:  zoneShapePropsFor(shapeType),
      color: '#FF0000',
      visible: true,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  }
  return zone
}