import { isValidGeoJSON } from '../geoJSONValidation'

describe('geoJSONValidation', () => {
  describe('isValidGeoJSON', () => {
    test('should return true for a valid Feature', () => {
      const validFeature = JSON.stringify({
        type: 'Feature',
        properties: {
          name: 'Test Feature'
        },
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        }
      })
      
      expect(isValidGeoJSON(validFeature)).toBe(true)
    })

    test('should return true for a valid FeatureCollection', () => {
      const validFeatureCollection = JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Test Feature 1'
            },
            geometry: {
              type: 'Point',
              coordinates: [0, 0]
            }
          },
          {
            type: 'Feature',
            properties: {
              name: 'Test Feature 2'
            },
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [1, 1]]
            }
          }
        ]
      })
      
      expect(isValidGeoJSON(validFeatureCollection)).toBe(true)
    })

    test('should return true for an array of Features', () => {
      const validFeatureArray = JSON.stringify([
        {
          type: 'Feature',
          properties: {
            name: 'Test Feature 1'
          },
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          }
        },
        {
          type: 'Feature',
          properties: {
            name: 'Test Feature 2'
          },
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [1, 1]]
          }
        }
      ])
      
      expect(isValidGeoJSON(validFeatureArray)).toBe(true)
    })

    test('should return false for an empty array', () => {
      const emptyArray = JSON.stringify([])
      
      expect(isValidGeoJSON(emptyArray)).toBe(false)
    })

    test('should return false for an array with non-Feature objects', () => {
      const invalidArray = JSON.stringify([
        {
          name: 'Not a Feature',
          coordinates: [0, 0]
        }
      ])
      
      expect(isValidGeoJSON(invalidArray)).toBe(false)
    })

    test('should return false for a non-GeoJSON object', () => {
      const invalidObject = JSON.stringify({
        name: 'Not GeoJSON',
        value: 42
      })
      
      expect(isValidGeoJSON(invalidObject)).toBe(false)
    })

    test('should return false for invalid JSON', () => {
      const invalidJSON = '{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [0, 0] '
      
      expect(isValidGeoJSON(invalidJSON)).toBe(false)
    })

    test('should return false for non-JSON string', () => {
      const nonJSONString = 'This is not JSON'
      
      expect(isValidGeoJSON(nonJSONString)).toBe(false)
    })
  })
})
