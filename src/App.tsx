import { LatLngExpression } from 'leaflet'
import './App.css'
import { Circle, MapContainer, Marker, Popup, TileLayer, GeoJSON, LayerGroup, LayersControl } from 'react-leaflet'
import track1 from './data/track1.json'
import track2 from './data/track2.json'
import pointsData from './data/points.json'
import zonesData from './data/zones.json'
import { FeatureCollection } from 'geojson'
import React, { useEffect, useState } from 'react'

const center: LatLngExpression = [51.505, -0.09]
const fillBlueOptions = { fillColor: 'blue' }

const setColor = () => {
  return { weight: 3 };
};

function App() {
  const [tracks, setTracks] = useState<React.ReactElement[]>([])
  const [points, setPoints] = useState<React.ReactElement | undefined>(undefined)
  const [zones, setZones] = useState<React.ReactElement | undefined>(undefined)

  useEffect(() => {
    const trackItems = [track1, track2]
    const trackLayers = trackItems.map((track, index) => {
      return <LayersControl.Overlay checked name={`Track-${index}`}>
        <GeoJSON key={`track-${index}`} data={track as FeatureCollection} style={setColor} />
        </LayersControl.Overlay>  
    })
    setPoints(<LayersControl.Overlay checked name={'Points'}>
      <GeoJSON key='points' data={pointsData as FeatureCollection} style={setColor} />
    </LayersControl.Overlay>)
    setZones(<LayersControl.Overlay checked name={'Zones'}>
      <GeoJSON key='sones' data={zonesData as FeatureCollection} style={setColor} />
    </LayersControl.Overlay>)
    setTracks(trackLayers)
  }, [])
  return (
    <div className="App">
        <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name='OpenStreetMap'>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            </LayersControl.BaseLayer>
            {tracks}
            {points}
            {zones}
          </LayersControl>
              <Circle center={center} pathOptions={fillBlueOptions} radius={200} />
          <LayerGroup>
          </LayerGroup>     

          <Marker position={[51.505, -0.09]}>
            <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
    </div>
  )
}

export default App
