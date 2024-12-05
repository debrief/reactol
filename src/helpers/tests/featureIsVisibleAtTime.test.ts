import {expect, test} from '@jest/globals';

import { Feature } from 'geojson';
import { TRACK_TYPE } from '../../constants';
import { timeVal } from '../generateCurrentLocations';
import { featureIsVisibleAtTime } from '../featureIsVisibleAtTime';

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
    visible: true
  },
  geometry: {
    coordinates: [[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0], [5.0, 5.0], [6.0, 6.0]],
    type: 'MultiPoint'
  },
  id: 'f-1'
}


export default track;


test('time before start of feature', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.startTime = times[0]
  expect(featureIsVisibleAtTime(track, timeVal(times[0])-1)).toBe(false)
});

test('time after end of feature', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.endTime = times[3]
  expect(featureIsVisibleAtTime(track, timeVal(times[3]) + 1)).toBe(false)
});

test('time in period', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.startTime = times[0]
  track.properties.endTime = times[3]
  expect(featureIsVisibleAtTime(track, timeVal(times[2]) + 1)).toBe(true)
});


test('no times', () => {
  if (!track.properties) {
    track.properties = {}
  }
  delete track.properties.startTime
  delete track.properties.endTime
  expect(featureIsVisibleAtTime(track, timeVal(times[2]) + 1)).toBe(true)
});


test('only start', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.startTime = times[0]
  delete track.properties.endTime
  expect(featureIsVisibleAtTime(track, timeVal(times[2]))).toBe(true)
});

test('only end', () => {
  if (!track.properties) {
    track.properties = {}
  }
  track.properties.endTime = times[3]
  delete track.properties.startTime
  expect(featureIsVisibleAtTime(track, timeVal(times[2]))).toBe(true)
});