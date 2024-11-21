import * as turf from '@turf/turf';

export function calculateCoursesAndSpeeds(track) {
  const coordinates = track.geometry.coordinates;
  const times = track.properties.times;

  const courses = [];
  const speeds = [];

  for (let i = 0; i < coordinates.length - 1; i++) {
    const point1 = turf.point(coordinates[i]);
    const point2 = turf.point(coordinates[i + 1]);

    const distance = turf.distance(point1, point2, { units: 'kilometers' });
    const bearing = turf.bearing(point1, point2);

    const time1 = new Date(times[i]).getTime();
    const time2 = new Date(times[i + 1]).getTime();
    const timeDiff = (time2 - time1) / 3600000; // convert milliseconds to hours

    const speed = distance / timeDiff;

    courses.push(bearing);
    speeds.push(speed);
  }

  return { courses, speeds };
}
