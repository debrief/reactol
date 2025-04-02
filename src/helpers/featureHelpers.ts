import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { REFERENCE_POINT_TYPE, BUOY_FIELD_TYPE, ZONE_TYPE, TRACK_TYPE } from '../constants'
import { LineStyleProps, PointStyleProps, PolygonStyleProps } from '../standardShapeProps'

/**
 * Extracts the color from a feature based on its data type
 * @param feature The GeoJSON feature to extract color from
 * @returns The color string (hex, rgb, etc.) or a default yellow color
 */
export const featureColor = (feature: Feature<Geometry, GeoJsonProperties>): string => {
  const defaultColor = '#ffff00'
  if (feature.properties) {
    const fProps = feature.properties
    switch(fProps.dataType) {
    case REFERENCE_POINT_TYPE: 
    case BUOY_FIELD_TYPE: {
      const props = fProps as PointStyleProps
      return props['marker-color'] || defaultColor
    }
    case ZONE_TYPE: {
      const props = fProps as LineStyleProps
      return props['stroke'] || defaultColor
    }
    case TRACK_TYPE: {
      const props = fProps as PolygonStyleProps
      return props['stroke'] || defaultColor
    }
    default: {
      return fProps.color || fProps['stroke'] || fProps['marker-color'] || defaultColor
    }
    }
  }
  // return yellow by default
  return defaultColor
}

/**
 * Produces the correct color properties for a feature type
 * @param featureType The type of feature (from constants)
 * @param color The color to apply
 * @returns An object with the appropriate color properties for the feature type
 */
export const colorPropertiesForFeatureType = (featureType: string | undefined, color: string): { [Name: string]: number | string } => {
  switch(featureType) {
  case REFERENCE_POINT_TYPE:
  case BUOY_FIELD_TYPE:  
    return {
      'marker-color': color,
    }
  case ZONE_TYPE: 
    return {
      'stroke': color,
      'fill': color 
    }
  case TRACK_TYPE:
    return {
      'stroke': color,
    }
  default: 
    return {}  
  }
}
