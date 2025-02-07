import { FeatureGroup } from 'react-leaflet'
import { GeomanControls } from 'react-leaflet-geoman-v2'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { Feature, Point } from 'geojson'
import { useDocContext } from '../../../state/DocContext'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import L, { Layer, PM } from 'leaflet'
import { useAppDispatch } from '../../../state/hooks'


/** helper component provides the map graticule */
export const EditFeature: React.FC = () => {
  const { editableMapFeature} = useDocContext()
  const [drawOptions, setDrawOptions] = useState<PM.ToolbarOptions>({})
  const [globalOptions, setGlobalOptions] = useState<PM.GlobalOptions>({})
  const [editLayer, setEditLayer] = useState<Layer | undefined>(undefined)
  const dispatch = useAppDispatch()

  const map = useMap()

  console.log('editableMapFeature', editableMapFeature)  

  useEffect(() => {
    if (editableMapFeature === null && editLayer) {
      editLayer.remove()
      setEditLayer(undefined)
      map.pm.disableDraw()
    }
  }, [editLayer, editableMapFeature, map.pm])


  useEffect(() => {
    if (editableMapFeature === null) {
      return
    }

    const feature = editableMapFeature.feature as Feature

    // create a layer for the activites
    const layerToEdit = L.geoJSON(feature)
    layerToEdit.addTo(map)

    // listen for when the layer has been edited
    const editHandler: PM.EditEventHandler = (e: {
      layer: L.Layer;
    }) => {
      const result = e.layer as unknown as {_latlng : L.LatLng}
      const latLng = result._latlng
      console.log('edit 3', latLng)
      if (feature.geometry.type === 'Point') {
        const newCoords = [latLng.lng, latLng.lat]
        const geom = { ... feature.geometry, coordinates: newCoords } as Point
        const res = { ... feature, geometry: geom}
        editableMapFeature.onChange(res)
      }
    }
    layerToEdit.on('pm:edit', editHandler)

    const globalOpts: PM.GlobalOptions = {
      layerGroup: layerToEdit,
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
    
    layerToEdit.options.pmIgnore = false // Specialy needed for LayerGroups
    L.PM.reInitLayer(layerToEdit) // Make the LayerGroup accessable for Geoman
    const editOptions: PM.EditModeOptions = {
      allowRemoval: false,
      allowCutting: false,
      draggable: true
    }
    layerToEdit.pm.enable(editOptions)

    setEditLayer(layerToEdit)

    return () => {    
      map.removeLayer(layerToEdit)
    }
  }, [map, editableMapFeature, dispatch])

  return <FeatureGroup>
    <> {(editLayer) &&
      <>
        <GeomanControls
          options={drawOptions}
          globalOptions={globalOptions}
        />
      </>
    }
    </>
  </FeatureGroup>
}