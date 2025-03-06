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
  const toPadStr = (num: number) => ('' + num).padStart(2, '0')
  const absolute = Math.abs(coordinate)
  const degrees = Math.floor(absolute)
  const minutesNotTruncated = (absolute - degrees) * 60
  const scaleFactor = 1000000
  const roundedMinutesNotTruncated = (Math.round(minutesNotTruncated * scaleFactor)) / scaleFactor
  const minutes = Math.floor(roundedMinutesNotTruncated)
  const secondPortion = roundedMinutesNotTruncated - minutes
  const wholeSecs = secondPortion * 60
  const seconds = Math.round(wholeSecs)
  const direction = isLat
    ? coordinate >= 0
      ? 'N'
      : 'S'
    : coordinate >= 0
      ? 'E'
      : 'W'
    
  if (allowShorten && minutes === 0 && seconds == 0) {
    return `${toPadStr(degrees)}°${spaceChar}${direction}`
  } else if (allowShorten && seconds === 0) {
    return `${toPadStr(degrees)}°${toPadStr(minutes)}'${spaceChar}${direction}`
  } else {
    return `${toPadStr(degrees)}°${toPadStr(minutes)}'${toPadStr(seconds)}"${spaceChar}${direction}`
  }
}

export const formatNatoCoords = (coordinate: number, isLat: boolean, allowShorten: boolean, spaceChar: string): string => {  if (coordinate === 0) {
  return '0°'
}
const toPadStr2 = (num: number) => ('' + num).padStart(2, '0')
const absolute = Math.abs(coordinate)
const degrees = Math.floor(absolute)
const minutesNotTruncated = (absolute - degrees) * 60
const minutes = (Math.round(minutesNotTruncated * 100)) / 100
const minInt = Math.floor(minutes)
const minDec = Math.round((minutes - minInt) * 100)
const minIntStr = ('' + minInt).padStart(2, '0 ')
const minDecStr = ('' + minDec).padEnd(2, '0 ')
const minStr = (allowShorten && minDecStr === '00') ? minIntStr : minIntStr + '.' + minDecStr
const direction = isLat
  ? coordinate >= 0
    ? 'N'
    : 'S'
  : coordinate >= 0
    ? 'E'
    : 'W'
if (allowShorten && minutes === 0) {
  return `${toPadStr2(degrees)}°${spaceChar}${direction}`
} else {
  return `${toPadStr2(degrees)}°${minStr}'${spaceChar}${direction}`
}
}