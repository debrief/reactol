import { expect, test } from '@jest/globals'

import { Feature, Geometry } from 'geojson'
import { REFERENCE_POINT_TYPE } from '../../constants'
import { featureIsVisibleInPeriod } from '../featureIsVisibleAtTime'
import { PointProps } from '../../types'

// note: method duplicated here to avoid compiler warning
// TODO: resolve compiler warning when importing this from `App.tsx`
const timeVal = (timeStr: string): number => {
  return new Date(timeStr).getTime()
}

const times = [
  '2024-11-14T16:16:53.662Z',
  '2024-11-15T02:16:53.662Z',
  '2024-11-15T04:16:53.662Z',
  '2024-11-15T10:16:53.662Z'
]

const track: Feature<Geometry, PointProps> = {
  type: 'Feature',
  properties: {
    dataType: REFERENCE_POINT_TYPE,
    name: 'SONO 1-1',
    color: '#F00',
    visible: true,
    time: times[1],
    timeEnd: times[2]
  },
  geometry: {
    coordinates: [1.0, 1.0],
    type: 'Point'
  },
  id: 'f-1'
}

export default track


test('period before start of feature', () => {
  expect(featureIsVisibleInPeriod(track, timeVal(times[0])-10, timeVal(times[0])-1)).toBe(false)
})

test('time after end of feature', () => {
  expect(featureIsVisibleInPeriod(track, timeVal(times[3]) + 1, timeVal(times[3]) + 100)).toBe(false)
})

test('time in period', () => {
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
})


test('no times', () => {
  if (!track.properties) {
    track.properties = {
      dataType: REFERENCE_POINT_TYPE,
      name: 'Test Point',
      visible: true,
      color: '#000000'
    }
  }
  delete track.properties.time
  delete track.properties.timeEnd
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
})


test('only start', () => {
  if (!track.properties) {
    track.properties = {
      dataType: REFERENCE_POINT_TYPE,
      name: 'Test Point',
      visible: true,
      color: '#000000'
    }
  }
  track.properties.time = times[0]
  delete track.properties.timeEnd
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(false  )
  expect(featureIsVisibleInPeriod(track, timeVal(times[0]), timeVal(times[2]))).toBe(true  )
})

test('only end', () => {
  if (!track.properties) {
    track.properties = {
      dataType: REFERENCE_POINT_TYPE,
      name: 'Test Point',
      visible: true,
      color: '#000000'
    }
  }
  track.properties.timeEnd = times[3]
  delete track.properties.time
  expect(featureIsVisibleInPeriod(track, timeVal(times[0]), timeVal(times[2]))).toBe(true)
})

test('mid time', () => {
  if (!track.properties) {
    track.properties = {
      dataType: REFERENCE_POINT_TYPE,
      name: 'Test Point',
      visible: true,
      color: '#000000'
    }
  }
  delete track.properties.time
  delete track.properties.timeEnd
  track.properties.time = times[2]
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[3]))).toBe(true)
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
  expect(featureIsVisibleInPeriod(track, timeVal(times[2]), timeVal(times[3]))).toBe(true)
  expect(featureIsVisibleInPeriod(track, timeVal(times[0]), timeVal(times[1]))).toBe(false)
})


test('missing mid time', () => {
  if (!track.properties) {
    track.properties = {
      dataType: REFERENCE_POINT_TYPE,
      name: 'Test Point',
      visible: true,
      color: '#000000'
    }
  }
  delete track.properties.time
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[3]))).toBe(true)
  expect(featureIsVisibleInPeriod(track, timeVal(times[0]), timeVal(times[1]))).toBe(true)
})