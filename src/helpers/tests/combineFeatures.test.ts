import { expect, test } from '@jest/globals'

import { Feature, LineString } from 'geojson'
import { TRACK_TYPE } from '../../constants'
import combineFeatures from '../combineFeatures'

const track: Feature = {
  type: 'Feature',
  properties: {
    dataType: TRACK_TYPE,
    'stroke': '#F00',
    name: 'Track 1',
    courses: [1, 2, 3, 4, 5, 6],
    speeds: [11, 12, 13, 14, 15, 16],
    times: [
      '2024-11-14T10:00:00.000Z',
      '2024-11-14T11:00:00.000Z',
      '2024-11-14T12:00:00.000Z',
      '2024-11-14T13:00:00.000Z',
      '2024-11-14T14:00:00.000Z',
      '2024-11-14T15:00:00.000Z',
    ],
    visible: true
  },
  geometry: {
    coordinates: [[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0], [5.0, 5.0], [6.0, 6.0]],
    type: 'LineString'
  },
  id: 'f-1'
}

test('feature doesnt already exist', () => {
  const existing = [] as Feature[]
  const newFeature = [{...track}]
  const combined = combineFeatures(existing, newFeature)
  expect(combined.length).toBe(1) 
  const trackItem = combined[0] as Feature<LineString>
  expect(trackItem.properties?.dataType).toBe(TRACK_TYPE)
  expect(trackItem.geometry.coordinates.length).toBe(6)
  expect(trackItem.properties?.speeds.length).toBe(6)
  expect(trackItem.properties?.courses.length).toBe(6)
  expect(trackItem.properties?.times.length).toBe(6)
})

test('feature already exists', () => {
  const existing = [track]
  const newFeature = [{...track}]
  const combined = combineFeatures(existing, newFeature)
  expect(combined.length).toBe(1) 
  const trackItem = combined[0] as Feature<LineString>
  expect(trackItem.properties?.dataType).toBe(TRACK_TYPE)
  expect(trackItem.geometry.coordinates.length).toBe(12)
  expect(trackItem.properties?.speeds.length).toBe(12)
  expect(trackItem.properties?.courses.length).toBe(12)
  expect(trackItem.properties?.times.length).toBe(12)
})
