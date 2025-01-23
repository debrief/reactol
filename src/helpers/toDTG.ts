import { format } from 'date-fns'

const toDTG = (date: Date): string => {
  return format(date, 'MMM ddHHmm\'Z\'')
}

export default toDTG