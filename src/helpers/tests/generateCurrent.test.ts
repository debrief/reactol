import {expect, test} from '@jest/globals';

import {  MultiPoint } from 'geojson';
import { calcInterpLocation, timeVal } from '../generateCurrentLocations';

const times = [
    "2024-11-14T10:00:00.000Z",
    "2024-11-14T11:00:00.000Z",
    "2024-11-14T12:00:00.000Z",
    "2024-11-14T13:00:00.000Z",
    "2024-11-14T14:00:00.000Z",
    "2024-11-14T15:00:00.000Z",
  ]
const coords: MultiPoint = {
    coordinates: [[1.0, 0.0], [2.0, 0.0], [3.0, 0.0], [4.0, 0.0], [5.0, 0.0], [6.0, 0.0]],
    type: 'MultiPoint'
  }

test('time 1/2 way between 1 and 2', () => {
  const current = calcInterpLocation(coords, times, (timeVal(times[0])  + timeVal(times[1])) / 2)
  expect(current).toBeTruthy()
  expect(current && current[0]).toBeCloseTo(1.5, 2)
  expect(current && current[1]).toBeCloseTo(0, 2)
});

test('time 1/4 way between 2 and 3', () => {
  const current = calcInterpLocation(coords, times, timeVal(times[1]) + (timeVal(times[2]) - timeVal(times[1])) / 4)
  expect(current).toBeTruthy()
  expect(current && current[0]).toBeCloseTo(2.25, 2)
  expect(current && current[1]).toBeCloseTo(0, 2)
});

test('time at 2nd', () => {
  const current = calcInterpLocation(coords, times, timeVal(times[2]))
  expect(current).toEqual(coords.coordinates[2])
});

test('time before start', () => {
  const current = calcInterpLocation(coords, times, 0)
  expect(current).toBeFalsy()
});

test('time at start', () => {
  const current = calcInterpLocation(coords, times, timeVal(times[0]))
  expect(current).toEqual(coords.coordinates[0])
});

test('time at end', () => {
  const current = calcInterpLocation(coords, times, timeVal(times[5]))
  expect(current).toEqual(coords.coordinates[5])
});

test('time after end', () => {
  const current = calcInterpLocation(coords, times, timeVal(times[5]) + 1)
  expect(current).toBeFalsy()
});



