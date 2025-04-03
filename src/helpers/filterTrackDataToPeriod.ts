import { Feature, GeoJsonProperties, Geometry, LineString } from 'geojson'

/**
 * Filters a track feature to only include points within a specified time range
 * @param feature The feature to filter
 * @param start Start time in milliseconds
 * @param end End time in milliseconds
 * @returns A new feature with only the points within the time range
 */
export const filterTrackDataToPeriod = (feature: Feature<Geometry, GeoJsonProperties>, start: number, end: number): Feature<Geometry, GeoJsonProperties> => {
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
        speeds: feature.properties.speeds?.slice(startIndex, endIndex + 1),
        courses: feature.properties.courses?.slice(startIndex, endIndex + 1),
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
