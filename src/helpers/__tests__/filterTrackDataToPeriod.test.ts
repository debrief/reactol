import { filterTrackDataToPeriod } from '../filterTrackDataToPeriod'
import { Feature, LineString, GeoJsonProperties, Point } from 'geojson'

describe('filterTrackDataToPeriod', () => {
  // Test case 1: Track with points inside and outside the time range
  test('filters track points within time range', () => {
    // Create a sample track feature with timestamps
    const trackFeature: Feature<LineString, GeoJsonProperties> = {
      type: 'Feature',
      properties: {
        dataType: 'track',
        times: [
          '2023-01-01T10:00:00Z', // 1672567200000
          '2023-01-01T11:00:00Z', // 1672570800000
          '2023-01-01T12:00:00Z', // 1672574400000
          '2023-01-01T13:00:00Z', // 1672578000000
          '2023-01-01T14:00:00Z'  // 1672581600000
        ],
        speeds: [10, 12, 15, 14, 11],
        courses: [90, 95, 100, 98, 92]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4]
        ]
      }
    }

    // Filter for time range 11:00 to 13:00
    const start = new Date('2023-01-01T11:00:00Z').getTime()
    const end = new Date('2023-01-01T13:00:00Z').getTime()
    
    const filtered = filterTrackDataToPeriod(trackFeature, start, end) as Feature<LineString, GeoJsonProperties>
    
    // Expect only the points between 11:00 and 13:00 to be included
    expect(filtered.properties?.times).toEqual([
      '2023-01-01T11:00:00Z',
      '2023-01-01T12:00:00Z',
      '2023-01-01T13:00:00Z'
    ])
    expect(filtered.properties?.speeds).toEqual([12, 15, 14])
    expect(filtered.properties?.courses).toEqual([95, 100, 98])
    expect(filtered.geometry.coordinates).toEqual([
      [1, 1],
      [2, 2],
      [3, 3]
    ])
  })

  // Test case 2: Track with no points in the time range
  test('returns empty arrays when no points in time range', () => {
    const trackFeature: Feature<LineString, GeoJsonProperties> = {
      type: 'Feature',
      properties: {
        dataType: 'track',
        times: [
          '2023-01-01T10:00:00Z',
          '2023-01-01T11:00:00Z'
        ],
        speeds: [10, 12],
        courses: [90, 95]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      }
    }

    // Filter for time range after all points
    const start = new Date('2023-01-01T15:00:00Z').getTime()
    const end = new Date('2023-01-01T16:00:00Z').getTime()
    
    const filtered = filterTrackDataToPeriod(trackFeature, start, end) as Feature<LineString, GeoJsonProperties>
    
    // Since startIndex will be -1 and endIndex will be 0, we should get empty arrays
    expect(filtered.properties?.times).toEqual([])
    expect(filtered.properties?.speeds).toEqual([])
    expect(filtered.properties?.courses).toEqual([])
    expect(filtered.geometry.coordinates).toEqual([])
  })

  // Test case 3: Non-track feature should be returned as is
  test('returns non-track features unchanged', () => {
    const pointFeature = {
      type: 'Feature',
      properties: {
        dataType: 'point',
        name: 'Test Point'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }

    const start = new Date('2023-01-01T10:00:00Z').getTime()
    const end = new Date('2023-01-01T12:00:00Z').getTime()
    
    const result = filterTrackDataToPeriod(pointFeature as Feature<Point, GeoJsonProperties>, start, end) as Feature<Point, GeoJsonProperties>
    
    // The feature should be returned unchanged
    expect(result).toEqual(pointFeature)
  })

  // Test case 4: Track without times property
  test('returns track unchanged if no times property', () => {
    const trackFeature: Feature<LineString, GeoJsonProperties> = {
      type: 'Feature',
      properties: {
        dataType: 'track'
        // No times property
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      }
    }

    const start = new Date('2023-01-01T10:00:00Z').getTime()
    const end = new Date('2023-01-01T12:00:00Z').getTime()
    
    const result = filterTrackDataToPeriod(trackFeature, start, end) as Feature<LineString, GeoJsonProperties>
    
    // The feature should be returned unchanged
    expect(result).toEqual(trackFeature)
  })
})
