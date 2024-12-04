import {expect, test} from '@jest/globals';

import { filterTime } from "../filter-time";

import { Feature, MultiPoint } from 'geojson';
import { TRACK_TYPE } from '../../constants';

const track: Feature = {
  type: 'Feature',
  properties: {
    dataType: TRACK_TYPE,
    color: '#F00',
    name: 'Track 1',
    times: [
      "2024-11-14T10:00:00.000Z",
      "2024-11-14T11:00:00.000Z",
      "2024-11-14T12:00:00.000Z",
      "2024-11-14T13:00:00.000Z",
      "2024-11-14T14:00:00.000Z",
      "2024-11-14T15:00:00.000Z",
    ],
    visible: true
  },
  geometry: {
    coordinates: [[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0], [5.0, 5.0], [6.0, 6.0]],
    type: 'MultiPoint'
  },
  id: 'f-1'
}


export default track;


test('span before start', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-14T09:00:00.000Z").getTime()
  const timeEnd = new Date("2024-11-14T11:30:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res[0]).toEqual({pos: [1,1], time: '141000Z'})
  expect(res[1]).toEqual({pos: [2,2], time: '141100Z'})
});

test('span after end', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-14T12:30:00.000Z").getTime()
  const timeEnd = new Date("2024-11-14T21:00:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res[0]).toEqual({pos: [4,4], time: '141300Z'})
  expect(res[1]).toEqual({pos: [5,5], time: '141400Z'})
  expect(res[2]).toEqual({pos: [6,6], time: '141500Z'})
});

test('span whole period', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-14T01:30:00.000Z").getTime()
  const timeEnd = new Date("2024-11-14T21:00:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res.length).toEqual(6)
});

test('span one value', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-14T13:30:00.000Z").getTime()
  const timeEnd = new Date("2024-11-14T14:30:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res[0]).toEqual({pos: [5,5], time: '141400Z'})
  expect(res.length).toEqual(1)
});

test('before period', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-14T03:30:00.000Z").getTime()
  const timeEnd = new Date("2024-11-14T04:30:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res.length).toEqual(0)
});

test('after period', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-15T03:30:00.000Z").getTime()
  const timeEnd = new Date("2024-11-15T04:30:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res.length).toEqual(0)
});

test('between value', () => {
  const times = track.properties?.times
  const geom = track.geometry as MultiPoint
  const coords = geom.coordinates
  const timeStart = new Date("2024-11-14T13:30:00.000Z").getTime()
  const timeEnd = new Date("2024-11-14T13:40:00.000Z").getTime()
  const res = filterTime(timeStart, timeEnd, times, coords)
  expect(res.length).toEqual(0)
});
