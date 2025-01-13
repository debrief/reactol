/**
 * Helper function to format coordinates as degrees, minutes, seconds, and hemisphere.
 * @param {number} coordinate - The coordinate value to format.
 * @param {boolean} isLat - Whether the coordinate is latitude (true) or longitude (false).
 * @param {boolean} allowShorten - Whether to omit minor units if they are zero.
 * @param {string} spaceChar - The separator to use before the direction value.
 * @returns {string} - The formatted coordinate string.
 */
export const formatCoordinate = (coordinate: number, isLat: boolean, allowShorten: boolean, spaceChar: string): string => {
  if (coordinate === 0) {
    return '0°'
  }
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
    
  if (allowShorten && minutes === 0 && seconds == 0) {
    return `${toPadStr(degrees)}°${spaceChar}${direction}`;
  } else if (allowShorten && seconds === 0) {
    return `${toPadStr(degrees)}°${toPadStr(minutes)}'${spaceChar}${direction}`;
  } else {
    return `${toPadStr(degrees)}°${toPadStr(minutes)}'${toPadStr(seconds)}"${spaceChar}${direction}`;
  }
};
