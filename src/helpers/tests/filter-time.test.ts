import {expect, test} from '@jest/globals';

// const filterTime = require('../filter-time')
import { filterTime } from "../filter-time";

test('adds 1 + 2 to equal 3', () => {
  const res = filterTime(2, 4)
  expect(res).toBe(3);
});