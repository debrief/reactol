import { useEffect, useState } from 'react'
import { Feature } from 'geojson'
import L, { PM, Layer, LatLng, Marker, Polygon as LeafletPolygon, Map } from 'leaflet'
import { useFeatureEditHandler } from './useFeatureEditHandler'

interface PMOptions {
  allowSelfIntersection?: boolean
  allowEditing?: boolean
  allowRemoval?: boolean
  allowCutting?: boolean
  draggable?: boolean
  enable?: (options: PM.EditModeOptions) => void
}

interface EditableMapFeature {
  feature: Feature
  onChange: (feature: Feature) => void
}

export const useFeatureLayerManager = (
  editableMapFeature: EditableMapFeature | null,
  map: Map,
  centreOfMap: LatLng
) => {
  const [drawOptions, setDrawOptions] = useState<PM.ToolbarOptions>({})
  const [globalOptions, setGlobalOptions] = useState<PM.GlobalOptions>({})
  const { editHandler } = useFeatureEditHandler()

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
  }, [map, editableMapFeature, editHandler, centreOfMap])

  return {
    drawOptions,
    globalOptions
  }
}
