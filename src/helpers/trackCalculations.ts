import * as turf from '@turf/turf';

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
