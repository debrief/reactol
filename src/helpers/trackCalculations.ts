import * as turf from "turf";
import { MultiPoint, Polygon, Position} from 'geojson'
import { Feature } from 'geojson'

const timeVal = (timeStr: string): number => {
  return new Date(timeStr).getTime()
}

export const calcInterpLocation = (poly: MultiPoint, times: any, current: number, index: number): Position => {
  const coords = poly.coordinates
  const isFirst = index === 0
  const beforeIndex = isFirst ? 0 : index - 1
  const afterIndex = isFirst ? 0 : index
  const beforeCoords = coords[beforeIndex]
  const afterCoords = coords[afterIndex]
  const before = turf.point(beforeCoords)
  const after = turf.point(afterCoords)
  const turfPath = turf.lineString([beforeCoords, afterCoords])
  const len = turf.distance(before, after)
  const beforeTime = timeVal(times[beforeIndex])
  const afterTime = timeVal(times[afterIndex])
  const timeDelta = afterTime - beforeTime
  const proportion = (current - beforeTime) / timeDelta
  const lenProp = len * proportion
  const interpolated = isNaN(lenProp) ? before : turf.along(turfPath, lenProp)
  const markerLoc = interpolated.geometry.coordinates.reverse() as Position
  return markerLoc
}

export const isTemporal = (feature: Feature): boolean => {
  return !!feature.properties?.times
}

export function calculateCoursesAndSpeeds(track: any) {
  const poly = track.geometry as Polygon
  const coordinates = poly.coordinates as any as [[number, number]];
  const times = track.properties?.times;

  const courses = [];
  const speeds = [];

  for (let i = 0; i < coordinates.length - 1; i++) {
    const point1 = turf.point(coordinates[i]);
    const point2 = turf.point(coordinates[i + 1]);

    const distance = turf.distance(point1, point2);
    const bearing = turf.bearing(point1, point2);

    const time1 = new Date(times[i]).getTime();
    const time2 = new Date(times[i + 1]).getTime();
    const timeDiff = (time2 - time1) / 3600000; // convert milliseconds to hours

    const speed = distance / timeDiff;

    courses.push(bearing);
    speeds.push(speed);
  }

  // Add one last item to courses and speeds arrays as the average of the previous two items
  if (courses.length > 1) {
    const lastCourse = (courses[courses.length - 1] + courses[courses.length - 2]) / 2;
    courses.push(lastCourse);
  }

  if (speeds.length > 1) {
    const lastSpeed = (speeds[speeds.length - 1] + speeds[speeds.length - 2]) / 2;
    speeds.push(lastSpeed);
  }

  return { courses, speeds };
}
