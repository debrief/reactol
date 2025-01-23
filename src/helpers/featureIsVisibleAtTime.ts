import { Feature } from 'geojson'
import { timeVal } from './timeVal'

export const featureIsVisibleInPeriod = (feature: Feature, startTime: number, endTime: number): boolean => {
  if (feature.properties) {
    if (feature.properties?.startTime) {
      const startVal = timeVal(feature.properties.startTime)
      if (startVal > endTime) {
        return false
      }
    }
    if (feature.properties?.endTime) {
      const endVal = timeVal(feature.properties.endTime)
      if (endVal < startTime) {
        return false
      }
    }
    if (feature.properties?.time) {
      const time = timeVal(feature.properties.time)
      return (time < endTime && time > startTime)
    }
    return true
  }
  return true
}