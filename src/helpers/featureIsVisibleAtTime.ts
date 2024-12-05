import { Feature } from 'geojson';
import { timeVal } from './generateCurrentLocations';

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
    return true
  }
  return true
}