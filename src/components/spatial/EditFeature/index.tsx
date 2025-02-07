import { useMemo } from 'react'
import { FeatureGroup } from 'react-leaflet'
import { GeomanControls } from 'react-leaflet-geoman-v2'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useDocContext } from '../../../state/DocContext'
import { useAppSelector } from '../../../state/hooks'


/** helper component provides the map graticule */
export const EditFeature: React.FC = () => {
  const {selection} = useDocContext()
  const { features } = useAppSelector(state => state.fColl)

  const selectedFeature = useMemo(() => {
    const singleSelection = selection.length === 1
    if (singleSelection) {
      return features.find(feature => feature.id === selection[0])
    } else {
      return null
    }
  }, [features, selection])

  const handleCreate = (e: unknown) => {
    console.log('handleCreate', e)
  }

  const handleChange = (e: unknown) => {
    console.log('handleChange', e)
  }

  console.log('selectedFeature', selectedFeature)
  return <FeatureGroup>
    <GeomanControls
      options={{
        position: 'bottomleft',
        drawText: false,
      }}
      globalOptions={{
        continueDrawing: true,
        editable: false,
      }}
      onCreate={handleCreate}
      onChange={handleChange}
    />
  </FeatureGroup>
}