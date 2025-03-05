import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { AppDispatch } from '../../state/store'
import { MULTI_POLYGON_SHAPE, MULTI_ZONE_TYPE } from '../../constants'
import { MultiZoneProps } from '../../types'

interface PolygonData {
  points: Array<{lat: number, lng: number}>
  label: string
}

const parseReplayPolygonLine = (line: string): PolygonData | null => {
  const cleanLine = line.trim()
  if (!cleanLine.startsWith(';POLY:')) {
    return null
  }

  // Remove the ;POLY: prefix and trim
  const data = cleanLine.substring(6).trim()
  
  // Split the remaining string into parts
  const parts = data.split(' ')
  
  // We need at least 31 parts: label (1) + 5 pairs of coordinates (6 parts each = 30)
  if (parts.length < 31) {
    return null
  }

  const label = parts[parts.length - 1]
  const points: Array<{lat: number, lng: number}> = []

  // Process 5 coordinate pairs
  for (let i = 0; i < 6; i++) {
    const startIndex = 1 + (i * 8) // Skip label, then 6 parts per coordinate pair
    
    try {
      // Parse latitude
      const latDeg = parseFloat(parts[startIndex])
      const latMin = parseFloat(parts[startIndex + 1])
      const latSec = parseFloat(parts[startIndex + 2])
      const latDir = parts[startIndex + 3]
      
      // Parse longitude
      const lngDeg = parseFloat(parts[startIndex + 4])
      const lngMin = parseFloat(parts[startIndex + 5])
      const lngSec = parseFloat(parts[startIndex + 6])
      const lngDir = parts[startIndex + 7]

      if (isNaN(latDeg) || isNaN(latMin) || isNaN(latSec) || 
          isNaN(lngDeg) || isNaN(lngMin) || isNaN(lngSec) ||
          !['N', 'S'].includes(latDir) || !['E', 'W'].includes(lngDir)) {
        return null
      }

      // Convert to decimal degrees
      let lat = latDeg + latMin/60 + latSec/3600
      let lng = lngDeg + lngMin/60 + lngSec/3600
      
      // Apply direction
      if (latDir === 'S') lat = -lat
      if (lngDir === 'W') lng = -lng

      const shortLat = parseFloat(lat.toFixed(4))
      const shortLng = parseFloat(lng.toFixed(4))

      points.push({ lat: shortLat, lng: shortLng })
    } catch (e) {
      console.error(e)
      return null
    }
  }

  return { points, label }
}

const convertToGeoJson = (data: PolygonData[]): Feature<Geometry, MultiZoneProps> => {
  const coordinates = data.map(polygonData => {
    // close each polygon by adding the first coordinate
    polygonData.points.push(polygonData.points[0])
    return [polygonData.points.map((point) => [point.lng, point.lat])]
  })

  const multiZoneProps: MultiZoneProps = {
    dataType: MULTI_ZONE_TYPE,
    specifics: {
      shapeType: MULTI_POLYGON_SHAPE
    },
    name: data[0].label, // Using the first polygon's label
    visible: true,
    stroke: '#f00',
    names: data.map(polygonData => polygonData.label)
  }
  
  const zone: Feature<Geometry, MultiZoneProps> = {
    type: 'Feature',
    properties: multiZoneProps,
    geometry: {
      type: 'MultiPolygon',
      coordinates: coordinates
    }
  }
  return zone
}

export const checkRepSuffix = (name: string) => {
  return name.endsWith('.rep')
}

export const loadRepPolygon = async (text: string, _features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch) => {

  const lines = text.split('\n')
  const data: PolygonData[] = []

  for (const line of lines) {
    const parsedLine = parseReplayPolygonLine(line)
    if (parsedLine) {
      data.push(parsedLine)
    }
  }

  // Create a single MultiPolygon feature containing all polygons
  const zone = convertToGeoJson(data)

  console.log('zone', zone)
  dispatch({ type: 'fColl/featuresAdded', payload: [zone] })
}
