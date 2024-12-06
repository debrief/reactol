import {expect, test} from '@jest/globals';

import { Feature } from 'geojson';
import { TRACK_TYPE } from '../../constants';
import { timeVal } from '../generateCurrentLocations';
import { featureIsVisibleInPeriod } from '../featureIsVisibleAtTime';

const times = [
  "2024-11-14T16:16:53.662Z",
  "2024-11-15T02:16:53.662Z",
  "2024-11-15T04:16:53.662Z",
  "2024-11-15T10:16:53.662Z"
]

const track: Feature = {
  type: 'Feature',
  properties: {
    dataType: TRACK_TYPE,
    visible: true,
    startTime: times[1],
    endTime: times[2]
  },
  geometry: {
    coordinates: [[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0], [5.0, 5.0], [6.0, 6.0]],
    type: 'MultiPoint'
  },
  id: 'f-1'
}

export default track;


test('period before start of feature', () => {
  expect(featureIsVisibleInPeriod(track, timeVal(times[0])-10, timeVal(times[0])-1)).toBe(false)
});

test('time after end of feature', () => {
  expect(featureIsVisibleInPeriod(track, timeVal(times[3]) + 1, timeVal(times[3]) + 100)).toBe(false)
});

test('time in period', () => {
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
});


test('no times', () => {
  if (!track.properties) {
    track.properties = {}
  }
  delete track.properties.startTime
  delete track.properties.endTime
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
});


test('only start', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.startTime = times[0]
  delete track.properties.endTime
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
});

test('only end', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.endTime = times[3]
  delete track.properties.startTime
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[2]))).toBe(true)
});

test('mid time', () => {
  if (!track.properties) {
    track.properties = {}
  }
  delete track.properties.startTime
  delete track.properties.endTime
  track.properties.time = times[2]
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[3]))).toBe(true)
  expect(featureIsVisibleInPeriod(track, timeVal(times[0]), timeVal(times[1]))).toBe(false)
});


test('missing mid time', () => {
  if (!track.properties) {
    track.properties = {}
  }
  delete track.properties.startTime
  delete track.properties.endTime
  delete track.properties.time
  expect(featureIsVisibleInPeriod(track, timeVal(times[1]), timeVal(times[3]))).toBe(true)
  expect(featureIsVisibleInPeriod(track, timeVal(times[0]), timeVal(times[1]))).toBe(true)
});