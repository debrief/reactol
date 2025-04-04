import { Feature, Geometry } from 'geojson'
import { timeVal } from './timeVal'
import { TemporalShapeProps, TrackProps } from '../types'
import { trackIsVisibleInPeriod } from './filterTrack'

export const featureIsVisibleInPeriod = (feature: Feature, startTime: number, endTime: number): boolean => {
  if (feature.properties) {
    // if the dataType indicates that it is a track, use the trackIsVisibleInPeriod function
    if (feature.properties.dataType === 'track') {
      return trackIsVisibleInPeriod(feature as Feature<Geometry, TrackProps>, startTime, endTime)
    }
    const props = feature.properties as unknown as TemporalShapeProps
    if (props.time) {
      const startVal = timeVal(props.time)
      if (startVal > endTime) {
        return false
      }
      if (props.timeEnd) {
        const endVal = timeVal(props.timeEnd)
        if (endVal < startTime) {
          return false
        }
      } else {
        // no time end provided, so it's a point rather than a period
        if (startVal < startTime) {
          return false
        }
      }
    }
    return true
  }
  return true
}