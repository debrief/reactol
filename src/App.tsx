import { Card, ConfigProvider, Flex, Splitter, Typography } from 'antd';
import { PathOptions, StyleFunction } from 'leaflet'
import './App.css'
import { MapContainer, Marker, Popup, TileLayer, GeoJSON, LayerGroup, LayersControl } from 'react-leaflet'
import initialData from './data/collection.ts'
import { Feature, FeatureCollection, Geometry} from 'geojson'
import React, { useEffect, useState } from 'react'
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from './constants.ts';
import Layers from './components/Layers.tsx';
import Properties from './components/Properties.tsx';

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
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  useEffect(() => {
    console.clear()
    // check that all features in initial-data have an id
    initialData.features.forEach((feature, index) => {
      if (!feature.id) {
        feature.id = `f-${index}`
      }
      if (!feature.properties) {
        feature.properties = {}
      }
      if (feature.properties.visible === undefined) {
        feature.properties.visible = true
      }
    })
    setStore(initialData)
  }, [])

  const getVisible = (feature: Feature): boolean => {
    return feature.properties?.visible 
  }

  useEffect(() => {
    if (store) {
      // find tracks
      setTracks(store.features.filter((feature) => feature.properties?.dataType === TRACK_TYPE).map((feature, index) => 
        <LayersControl.Overlay checked={getVisible(feature)} name={`Track-${index}`}>
          <GeoJSON key={`track-${index}`} data={feature} style={setColor} />
        </LayersControl.Overlay>  
      ))

      // find zones
      setZones(store.features.filter((feature) => feature.properties?.dataType === ZONE_TYPE).map((feature, index) => 
        <LayersControl.Overlay checked={getVisible(feature)} name={`Zone-${index}`}>
          <GeoJSON key={`zone-${index}`} data={feature} style={setColor} />
        </LayersControl.Overlay>  
      ))

      // find points
      setPoints(store.features.filter((feature) => feature.properties?.dataType === REFERENCE_POINT_TYPE).map((feature, index) => 
        <LayersControl.Overlay checked={getVisible(feature)} name={`Point-${index}`}>
          <GeoJSON key={`point-${index}`} data={feature} style={setColor} />
        </LayersControl.Overlay>  
      ))
    }
  }, [store])

  const antdTheme = {
    components: {
      Splitter: {
        splitBarSize: 10,
      },
      Table: {
        headerBg: '#555',
        headerColor: '#fff'
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
    const selected = store?.features.find((feature) => ids.includes(feature.id as string)) || null;
    setSelectedFeature(selected);
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
                <Card title='Detail'>
                  <Properties feature={selectedFeature} />
                </Card>
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
          <Splitter.Panel key='right'>
            <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name='OpenStreetMap'>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                </LayersControl.BaseLayer>
                {tracks}
                {points}
                {zones}
              </LayersControl>
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
