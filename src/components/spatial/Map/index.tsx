import React from 'react'
import { MapContainer } from 'react-leaflet'
import ScaleNautic from 'react-leaflet-nauticsale'
import { Graticule } from '../AutoGraticule'
import { HomeControl } from '../../HomeControl'
import MouseCoordinates from '../MouseCoordinates'
import { PolylineMeasure } from '../PolylineMeasure'
import { EditFeature } from '../EditFeature'
import TimePeriod from '../TimePeriod'

// Import custom hooks
import { useSelectionHandling } from './hooks/useSelectionHandling'
import { useFeatureRenderer } from './hooks/useFeatureRenderer'
import { useViewportTracking } from './hooks/useViewportTracking'
import { useMapControls } from './hooks/useMapControls'

interface MapProps {
  children: React.ReactNode
}

// Separate component for map features
const MapFeatures: React.FC = () => {
  const { onClickHandler } = useSelectionHandling()
  const { visibleFeatures } = useFeatureRenderer(onClickHandler)

  return <>{visibleFeatures}</>
}

// Component to track viewport changes
const ViewportTracker: React.FC = () => {
  // Use the viewport tracking hook
  useViewportTracking()
  return null
}

const MapControls: React.FC = () => {
  // Use the map controls hook
  const { gridFormatter } = useMapControls()

  return (
    <>
      <MouseCoordinates/>
      <ScaleNautic nautic={true} metric={false} imperial={false} />
      <Graticule formatter={gridFormatter}/>
      <PolylineMeasure/>
      <HomeControl/>
      <TimePeriod/>
      <EditFeature/>
    </>
  )
}

const Map: React.FC<MapProps> = ({ children }) => {
  return (
    <MapContainer
      zoomControl={false}
      attributionControl={false}
      center={[35.505, -4.09]}
      zoom={8}
    >
      {children}
      <MapFeatures />
      <ViewportTracker/>
      <MapControls/>
    </MapContainer>
  )
}

export default Map
