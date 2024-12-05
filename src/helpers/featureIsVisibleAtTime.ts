import { Feature } from 'geojson';
import { timeVal } from './generateCurrentLocations';

export const featureIsVisibleAtTime = (feature: Feature, time: number): boolean => {
  if (feature.properties) {
    if (feature.properties?.startTime) {
      const startVal = timeVal(feature.properties.startTime)
      if (startVal > time) {
        console.log('before start', startVal, feature.properties.startTime, time)
        return false
      }
    }
    if (feature.properties?.endTime) {
      const endVal = timeVal(feature.properties.endTime)
      if (endVal < time) {
        console.log('after end', endVal, feature.properties.endTime, time)
        return false
      }
    }
    return true
  }
  return true
}