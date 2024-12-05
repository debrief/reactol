import {expect, test} from '@jest/globals';

import {  MultiPoint } from 'geojson';
import { calcInterpLocation } from '../generateCurrentLocations';

const times = [
    "2024-11-14T10:00:00.000Z",
    "2024-11-14T11:00:00.000Z",
    "2024-11-14T12:00:00.000Z",
    "2024-11-14T13:00:00.000Z",
    "2024-11-14T14:00:00.000Z",
    "2024-11-14T15:00:00.000Z",
  ]
const coords: MultiPoint = {
    coordinates: [[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0], [5.0, 5.0], [6.0, 6.0]],
    type: 'MultiPoint'
  }

test('time before start', () => {
  const current = calcInterpLocation(coords, times, 0)
  expect(current).toBeFalsy()
});


