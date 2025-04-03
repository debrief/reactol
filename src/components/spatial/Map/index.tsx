import React from 'react'
import { MapContainer } from 'react-leaflet'
import { MapFeatures } from './MapFeatures'
import { ViewportTracker } from './ViewportTracker'
import { MapControls } from './MapControls'

interface MapProps {
  children: React.ReactNode
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
