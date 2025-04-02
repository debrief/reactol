import { Feature, GeoJsonProperties, Geometry, LineString } from 'geojson'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'

/**
 * Filter a track feature to only include points within a specific time range
 */
const filteredTrack = (feature: Feature<Geometry, GeoJsonProperties>, start: number, end: number): Feature<Geometry, GeoJsonProperties> => {
  if (feature.properties?.dataType === 'track') {
    const lineFeature = feature as Feature<LineString, GeoJsonProperties>
    if (!feature.properties?.times) {
      return feature
    }
    let startIndex = -1, endIndex = 0
    const times = feature.properties.times
    for (let i = 0; i < times.length; i++) {
      const time = new Date(times[i]).getTime()
      if (startIndex === -1 && time >= start && time <= end) {
        startIndex = i
      }
      if (time > start && time <= end) {
        endIndex = i
      }
    }
    const res: Feature<LineString, GeoJsonProperties> = {
      ...lineFeature,
      properties: {
        ...feature.properties,
        times: feature.properties.times.slice(startIndex, endIndex + 1),
        speeds: feature.properties.speeds.slice(startIndex, endIndex + 1),
        courses: feature.properties.courses.slice(startIndex, endIndex + 1),
      },
      geometry: {
        type: 'LineString',
        coordinates: lineFeature.geometry.coordinates.slice(startIndex, endIndex + 1)
      }
    }
    return res
  } else {
    return feature
  }
}

/**
 * Filter features based on time period and apply time filtering to tracks
 */
export const getFilteredFeatures = (
  features: Feature[], 
  time: { filterApplied: boolean, start: number, end: number },
  filterForTime: boolean
): Feature[] => {
  if (time && time.filterApplied && filterForTime) {
    return features
      .filter(feature => featureIsVisibleInPeriod(feature, time.start, time.end))
      .map(feature => filteredTrack(feature, time.start, time.end))
  } else {
    return features
  }
}
