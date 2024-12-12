import { format } from "date-fns"

const toDTG = (date: Date): string => {
  return format(date, "ddHHmm'Z'")
}

export default toDTG