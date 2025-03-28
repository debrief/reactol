import { Feature, Point, Polygon } from 'geojson'
import { Layer, Marker, Polygon as LeafletPolygon } from 'leaflet'

/**
 * Hook that provides functions for handling feature edits
 */
export const useFeatureEditHandler = () => {
  /**
   * Handles updates to a feature when it's edited on the map
   */
  const editHandler = (
    updatedLayer: Layer | Marker[],
    feature: Feature,
    onChange: (feature: Feature) => void
  ) => {
    switch (feature.geometry.type) {
    case 'Point': {
      const marker = updatedLayer as Marker
      const latlng = marker.getLatLng()
      const newCoords = [latlng.lng, latlng.lat] 
      const geom = { ...feature.geometry, coordinates: newCoords } as Point
      const res = { ...feature, geometry: geom }
      onChange(res)
      break
    }

    case 'MultiPoint': {
      const markers = updatedLayer as Marker[]
      const newCoords = markers.map(marker => {
        const latlng = marker.getLatLng()
        return [latlng.lng, latlng.lat]
      })
      const geom = { ...feature.geometry, coordinates: newCoords }
      const res = { ...feature, geometry: geom }
      onChange(res)
      break
    }

    case 'Polygon': {
      const polygon = updatedLayer as LeafletPolygon
      const latlngs = polygon.getLatLngs() as L.LatLng[][]
      const newCoords = latlngs.map(ring => ring.map(latlng => [latlng.lng, latlng.lat]))
      const geom = { ...feature.geometry, coordinates: newCoords } as Polygon
      const res = { ...feature, geometry: geom }
      onChange(res)
      break
    }

    default:
      console.log('Unknown feature type', feature)
    }
  }

  return {
    editHandler
  }
}
