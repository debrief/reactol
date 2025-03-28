import { FeatureGroup, useMap } from 'react-leaflet'
import { GeomanControls } from 'react-leaflet-geoman-v2'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useDocContext } from '../../../state/DocContext'

// Import custom hooks
import { useFeatureLayerManager } from './hooks/useFeatureLayerManager'

/**
 * Component for editing features on the map
 */
export const EditFeature: React.FC = () => {
  const { editableMapFeature } = useDocContext()
  const map = useMap()
  const centreOfMap = map.getCenter()
  
  // Use custom hook to manage feature layers and editing
  const { drawOptions, globalOptions } = useFeatureLayerManager(
    editableMapFeature,
    map,
    centreOfMap
  )

  return (
    <FeatureGroup>
      <GeomanControls options={drawOptions} globalOptions={globalOptions} />
    </FeatureGroup>
  )
}
