import { Card, ConfigProvider, Flex, Splitter, Typography } from 'antd';
import { LatLngExpression, PathOptions, StyleFunction } from 'leaflet'
import './App.css'
import { Circle, MapContainer, Marker, Popup, TileLayer, GeoJSON, LayerGroup, LayersControl } from 'react-leaflet'
import initialData from './data/collection.ts'
import { Feature, FeatureCollection, Geometry} from 'geojson'
import React, { useEffect, useState } from 'react'
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from './constaints.ts';
import Layers from './components/Layers.tsx';

const center: LatLngExpression = [51.505, -0.09]
const fillBlueOptions = { fillColor: 'blue' }

const setColor: StyleFunction = (feature: Feature<Geometry, unknown> | undefined) => {
  const res: PathOptions = {}
  if (feature) {
    const feat = feature as Feature
    if (feat?.properties?.color) {
      res.color = feat.properties.color
    }
  }
  res.weight = 3
  return res;
};

const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
  <Flex justify="center" align="center" style={{ height: '100%' }}>
  <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
  {props.text}
  </Typography.Title>
  </Flex>
);

function App() {
  const [store, setStore] = useState<FeatureCollection | undefined>(undefined)
  const [tracks, setTracks] = useState<React.ReactElement[]>([])
  const [points, setPoints] = useState<React.ReactElement[]>([])
  const [zones, setZones] = useState<React.ReactElement[]>([])

  useEffect(() => {
    console.clear()
    // check that all features in initial-data have an id
    initialData.features.forEach((feature, index) => {
      if (!feature.id) {
        feature.id = `f-${index}`
      }
    })
    setStore(initialData)
  }, [])

  const getVisibleWithFix = (feature: Feature): boolean => {
    if (feature.properties) {
      if (feature.properties.visible === undefined) {
        feature.properties.visible = true
        return true
      } else {
        return feature.properties.visible
      }
    } else {
      feature.properties = { visible: true }
      return true
    }
  }

  useEffect(() => {
    if (store) {
      // find tracks
      setTracks(store.features.filter((feature) => feature.properties?.dataType === TRACK_TYPE).map((feature, index) => 
        <LayersControl.Overlay checked={getVisibleWithFix(feature)} name={`Track-${index}`}>
          <GeoJSON key={`track-${index}`} data={feature} style={setColor} />
        </LayersControl.Overlay>  
      ))

      // find zones
      setZones(store.features.filter((feature) => feature.properties?.dataType === ZONE_TYPE).map((feature, index) => 
        <LayersControl.Overlay checked name={`Zone-${index}`}>
          <GeoJSON key={`zone-${index}`} data={feature} style={setColor} />
        </LayersControl.Overlay>  
      ))

      // find points
      setPoints(store.features.filter((feature) => feature.properties?.dataType === REFERENCE_POINT_TYPE).map((feature, index) => 
        <LayersControl.Overlay checked name={`Point-${index}`}>
          <GeoJSON key={`point-${index}`} data={feature} style={setColor} />
        </LayersControl.Overlay>  
      ))
    }
  }, [store])

  const antdTheme = {
    components: {
      Splitter: {
        splitBarSize: 10,
      }
    }
  }

  const setFeatureVisibility = (feature: Feature, visible: boolean): void => {
    if(!feature.properties) {
      feature.properties = {}
    }
    feature.properties.visible = visible
  }

  function setChecked(ids: string[]): void {
    const newStore = JSON.parse(JSON.stringify(store))
    newStore.features = newStore.features.map((feature: Feature) => {
      const id = feature.id as string
      setFeatureVisibility(feature, ids.includes(id))
      return feature
    })
    setStore(newStore)
  }

  function setSelected(ids: string[]): void {
    console.log('selected', ids)
  }

  return (
    <div className="App">
       <ConfigProvider theme={antdTheme}>

       <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel key='left' collapsible defaultSize="20%" min="20%" max="70%">
            <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
              <Splitter.Panel defaultSize="20%" min="10%" max="20%" resizable={true}>
                <Desc text="Time Control" />
              </Splitter.Panel>
              <Splitter.Panel>
                <Card title='Layers' style={{width: '100%', height: '100%'}} >
                  <Layers zones={zones} tracks={tracks} points={points} setChecked={setChecked} setSelected={setSelected} />
                </Card>
              </Splitter.Panel>
              <Splitter.Panel>
                <Card title='Properties'>
                  <Desc text="Property editor here" />
                </Card>
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
          <Splitter.Panel key='right'>
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
          </Splitter.Panel>
        </Splitter>
      </ConfigProvider>
    </div>
  )
}

export default App
