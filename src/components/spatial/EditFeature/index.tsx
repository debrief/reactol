import { FeatureGroup } from 'react-leaflet'
import { GeomanControls } from 'react-leaflet-geoman-v2'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useDocContext } from '../../../state/DocContext'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import L, { Layer, PM } from 'leaflet'
import Item from 'antd/es/list/Item'


/** helper component provides the map graticule */
export const EditFeature: React.FC = () => {
  const { mapEditableFeature} = useDocContext()
  const [drawOptions, setDrawOptions] = useState<PM.ToolbarOptions>({})
  const [globalOptions, setGlobalOptions] = useState<PM.GlobalOptions>({})
  const [editLayer, setEditLayer] = useState<Layer | undefined>(undefined)

  const map = useMap()


  // const handleCreate = (e: unknown) => {
  //   console.log('handleCreate', e)
  // }

  // const handleChange = (e: unknown) => {
  //   console.log('handleChange', e)
  // }

  const saveDrawing = (): void => {
    console.log('doing save ')
    // // push the data item
    // const asAny = editLayer as unknown as Layer
    // // layers is a dictionary
    // const layers = asAny._layers as Record<string, unknown>
    // if (!layers) {
    //   console.warn('layers object not constructed as expected')
    //   return
    // } else {
    //   // TODO: convert coords
    // }
    // clean up
    cleanUp()
  }

  useEffect(() => {
    // create a layer for the activites
    const layerToEdit = L.geoJSON(mapEditableFeature)
    layerToEdit.addTo(map)

    // listen for when the layer has been edited
    layerToEdit.on('pm:edit', (e) => {
      console.log('edit', e)
    })

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

    // return () => {    
    //   map.removeLayer(layerToEdit)
    // }
  }, [map, mapEditableFeature])

  const cleanUp = (): void => {
    if (map) {
      if (editLayer) {
        editLayer.remove()
        setEditLayer(undefined)
      }
      map.pm.disableDraw()
      // also ditch the lines
      // const layers = map.pm.getGeomanDrawLayers()
      // if (layers.length) {
      //   layers.forEach((layer: Layer) => layer.remove())
      // }
    }
  }

  const cancelDrawing = (): void => {
    cleanUp()
    // saved(undefined)
  }

  return <FeatureGroup>
    <> {(editLayer) &&
      <>
        <div className='leaflet-top leaflet-left'>
          <div className='leaflet-control'>
            <Item onClick={cancelDrawing}><div>Cancel</div></Item>
            <Item onClick={saveDrawing}><div>Save</div></Item>
          </div>
        </div>
        <GeomanControls
          options={drawOptions}
          globalOptions={globalOptions}
        />
      </>
    }
    </>
  </FeatureGroup>
}