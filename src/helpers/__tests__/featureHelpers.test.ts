import { featureColor, colorPropertiesForFeatureType } from '../featureHelpers'
import { sampleItems } from '../../data/sampleItems'
import { REFERENCE_POINT_TYPE, BUOY_FIELD_TYPE, ZONE_TYPE, TRACK_TYPE } from '../../constants'

// Get sample features of different types from the sampleItems collection
const getPointFeature = () => sampleItems.find(item => item.name === 'Points')?.data[0]
const getBuoyFieldFeature = () => sampleItems.find(item => item.name === 'Buoy field')?.data[0]
const getZoneFeature = () => sampleItems.find(item => item.name === 'Zones')?.data[0]
const getTrackFeature = () => sampleItems.find(item => item.name === 'Track 1')?.data[0]

describe('featureColor', () => {
  test('should extract color from reference point features', () => {
    const pointFeature = getPointFeature()
    expect(pointFeature).toBeDefined()
    expect(pointFeature?.properties?.dataType).toBe(REFERENCE_POINT_TYPE)
    
    const color = featureColor(pointFeature!)
    expect(color).toBe(pointFeature?.properties?.['marker-color'])
  })

  test('should extract color from buoy field features', () => {
    const buoyFeature = getBuoyFieldFeature()
    expect(buoyFeature).toBeDefined()
    expect(buoyFeature?.properties?.dataType).toBe(BUOY_FIELD_TYPE)
    
    const color = featureColor(buoyFeature!)
    expect(color).toBe(buoyFeature?.properties?.['marker-color'])
  })

  test('should extract color from zone features', () => {
    const zoneFeature = getZoneFeature()
    expect(zoneFeature).toBeDefined()
    expect(zoneFeature?.properties?.dataType).toBe(ZONE_TYPE)
    
    const color = featureColor(zoneFeature!)
    expect(color).toBe(zoneFeature?.properties?.stroke)
  })

  test('should extract color from track features', () => {
    const trackFeature = getTrackFeature()
    expect(trackFeature).toBeDefined()
    expect(trackFeature?.properties?.dataType).toBe(TRACK_TYPE)
    
    const color = featureColor(trackFeature!)
    expect(color).toBe(trackFeature?.properties?.stroke)
  })

  test('should return default color for features without color properties', () => {
    // Create a feature without color properties
    const featureWithoutColor = {
      type: 'Feature',
      properties: {
        dataType: 'unknown-type',
        name: 'Test Feature'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }
    
    const color = featureColor(featureWithoutColor as any)
    expect(color).toBe('#ffff00') // Default yellow color
  })

  test('should return default color for features without properties', () => {
    // Create a feature without properties
    const featureWithoutProperties = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }
    
    const color = featureColor(featureWithoutProperties as any)
    expect(color).toBe('#ffff00') // Default yellow color
  })
})

describe('colorPropertiesForFeatureType', () => {
  test('should return marker-color property for reference point type', () => {
    const testColor = '#123456'
    const properties = colorPropertiesForFeatureType(REFERENCE_POINT_TYPE, testColor)
    
    expect(properties).toEqual({
      'marker-color': testColor
    })
  })

  test('should return marker-color property for buoy field type', () => {
    const testColor = '#123456'
    const properties = colorPropertiesForFeatureType(BUOY_FIELD_TYPE, testColor)
    
    expect(properties).toEqual({
      'marker-color': testColor
    })
  })

  test('should return stroke and fill properties for zone type', () => {
    const testColor = '#123456'
    const properties = colorPropertiesForFeatureType(ZONE_TYPE, testColor)
    
    expect(properties).toEqual({
      'stroke': testColor,
      'fill': testColor
    })
  })

  test('should return stroke property for track type', () => {
    const testColor = '#123456'
    const properties = colorPropertiesForFeatureType(TRACK_TYPE, testColor)
    
    expect(properties).toEqual({
      'stroke': testColor
    })
  })

  test('should return empty object for unknown feature type', () => {
    const testColor = '#123456'
    const properties = colorPropertiesForFeatureType('unknown-type', testColor)
    
    expect(properties).toEqual({})
  })

  test('should return empty object for undefined feature type', () => {
    const testColor = '#123456'
    const properties = colorPropertiesForFeatureType(undefined, testColor)
    
    expect(properties).toEqual({})
  })
})
