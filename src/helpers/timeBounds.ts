import { Feature} from 'geojson'
export const timeBoundsFor = (features: Feature[]): [number, number] => {
  // find all features with time in properties, then find the min and max
  // return those as the bounds
  const featuresWithTimes = features.filter((feature) => feature.properties && feature.properties.times)
  const featureTimes: string[][] = featuresWithTimes.map((feature): string[] => feature.properties?.times)
  const timeValues: string[] = []
  featureTimes.forEach((times) => {
    timeValues.push(...times)
  })
  const timeNumbers = timeValues.map((timeStr) => new Date(timeStr).getTime())
  const minTime = Math.min(...timeNumbers)
  const maxTime = Math.max(...timeNumbers)
  return [minTime, maxTime]
}