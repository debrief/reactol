import { FeatureGroup, useMap } from 'react-leaflet'
import { GeomanControls } from 'react-leaflet-geoman-v2'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { Feature, Point, Polygon } from 'geojson'
import { useDocContext } from '../../../state/DocContext'
import { useEffect, useState } from 'react'
import L, { Layer, PM, Marker, Polygon as LeafletPolygon } from 'leaflet'
import { useAppDispatch } from '../../../state/hooks'
interface PMOptions {
  continueDrawing?: boolean;
  editable?: boolean;
  allowCutting?: boolean;
}

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

export const EditFeature: React.FC = () => {
  const { editableMapFeature } = useDocContext()
  const centreOfMap = useMap().getCenter()
  const [drawOptions, setDrawOptions] = useState<PM.ToolbarOptions>({})
  const [globalOptions, setGlobalOptions] = useState<PM.GlobalOptions>({})
  const dispatch = useAppDispatch()
  const map = useMap()

  useEffect(() => {
    map.pm.removeControls()
    
    if (!editableMapFeature) return

    const feature = editableMapFeature.feature as Feature
    let layerToEdit: Layer | null = null
    const markers: Marker[] = []
    switch (feature.geometry.type) {
    case 'Point': {
      const coords = feature.geometry.coordinates
      const coord = coords.length > 0 ? coords as [number, number] : [centreOfMap.lng, centreOfMap.lat]
      const latlng = L.latLng(coord[1], coord[0])
      layerToEdit = L.marker(latlng, { draggable: true })
      layerToEdit.on('dragend', () => editHandler(layerToEdit as Marker, feature, editableMapFeature.onChange))
      break
    }

    case 'MultiPoint': {
      feature.geometry.coordinates.forEach(coord => {
        const latlng = L.latLng(coord[1], coord[0])
        const marker = L.marker(latlng, { draggable: true })
        marker.on('dragend', () => editHandler(markers, feature, editableMapFeature.onChange))
        markers.push(marker)
        marker.addTo(map)
      })
      break
    }

    case 'Polygon': {
      const coords = feature.geometry.coordinates as [number, number][][]
      const latlngs = coords.map(ring => ring.map(coord => L.latLng(coord[1], coord[0])))
      
      layerToEdit = L.polygon(latlngs, { color: 'blue' })

      const polygonLayer = layerToEdit as LeafletPolygon & { pm?: PMOptions }
      
      setTimeout(() => {
        polygonLayer.pm?.enable({
          allowSelfIntersection: false,
          allowEditing: true,
          allowRemoval: false,
          allowCutting: false,
          draggable: true
        })
      }, 100)
      
      polygonLayer.on('pm:edit', () => editHandler(polygonLayer, feature, editableMapFeature.onChange))
      
      break
    }

    default:
      console.log('Unknown feature type:', feature)
    }

    if (layerToEdit) {
      layerToEdit.addTo(map)
    }

    const globalOpts: PM.GlobalOptions = {
      layerGroup: layerToEdit ? L.layerGroup([layerToEdit, ...markers]) : L.layerGroup(markers),
      continueDrawing: false,
      editable: true,
      allowCutting: false,
      allowRemoval: false,
      allowRotation: false,
      allowSelfIntersectionEdit: false
    }
    setGlobalOptions(globalOpts)

    // switch off all controls
    const toolbarOpts: PM.ToolbarOptions = {
      position: 'bottomright',
      drawControls: false,
      editControls: false
    }

    setDrawOptions(toolbarOpts)

    return () => {
      if (layerToEdit) map.removeLayer(layerToEdit)
      markers.forEach(marker => map.removeLayer(marker))
    }
  }, [map, editableMapFeature, dispatch])

  return (
    <FeatureGroup>
      <GeomanControls options={drawOptions} globalOptions={globalOptions} />
    </FeatureGroup>
  )
}
