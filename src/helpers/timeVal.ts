export const timeVal = (timeStr: string): number => {
  return new Date(timeStr).getTime()
}