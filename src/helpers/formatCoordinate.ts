/**
 * Helper function to format coordinates as degrees, minutes, seconds, and hemisphere.
 * @param {number} coordinate - The coordinate value to format.
 * @param {boolean} isLat - Whether the coordinate is latitude (true) or longitude (false).
 * @returns {string} - The formatted coordinate string.
 */
export const formatCoordinate = (coordinate: number, isLat: boolean): string => {
  const toPadStr = (num: number) => ('' + num).padStart(2, '0');
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor(((minutesNotTruncated - minutes) * 60));
  const direction = isLat
    ? coordinate >= 0
      ? 'N'
      : 'S'
    : coordinate >= 0
    ? 'E'
    : 'W';

  return `${toPadStr(degrees)}°${toPadStr(minutes)}'${toPadStr(seconds)}" ${direction}`;
};
