import { formatInTimeZone } from 'date-fns-tz'

const toDTG = (date: Date): string => {
  return formatInTimeZone(date, 'UTC', 'MMM ddHHmm\'Z\'')
}

export const toShortDTG = (date: Date): string => {
  return formatInTimeZone(date, 'UTC', 'ddHHmm')
}

export default toDTG