import React, { useCallback } from 'react'
import { MapContainer } from 'react-leaflet'
import { useAppSelector } from '../../../state/hooks'
import { selectFeatures } from '../../../state/geoFeaturesSlice'
import { useDocContext } from '../../../state/DocContext'
import { MapFeatures } from './MapFeatures'
import { ViewportTracker } from './ViewportTracker'
import { MapControls } from './MapControls'

interface MapProps {
  children: React.ReactNode
}

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(selectFeatures)
  const { selection, setSelection, preview } = useDocContext()

  const theFeatures = preview ? preview.data.features : features

  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
    if (modifier) {
      // add/remove from selection
      if (selection.includes(id)) {
        setSelection(selection.filter((selectedId) => selectedId !== id))
      } else {
        setSelection([...selection, id])
      }
    } else {
      // just select this item
      setSelection([id])
    }
  }, [selection, setSelection])

  return (
    <MapContainer
      zoomControl={false}
      attributionControl={false}
      center={[35.505, -4.09]}
      zoom={8}
    >
      {children}
      <MapFeatures 
        features={theFeatures}
        onClickHandler={onClickHandler}
      />
      <ViewportTracker/>
      <MapControls/>
    </MapContainer>
  )
}

export default Map
