import { Feature } from 'geojson'

/**
 * Validates if a string contains valid GeoJSON data
 * @param text The string to validate
 * @returns True if the string contains valid GeoJSON data, false otherwise
 */
export const isValidGeoJSON = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text)
    // Check if it's a Feature or FeatureCollection
    if (parsed.type === 'Feature') {
      return true
    }
    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return true
    }
    if (Array.isArray(parsed)) {
      const featureArray = parsed as Feature[]
      if (featureArray.length && featureArray[0].type === 'Feature') {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}
