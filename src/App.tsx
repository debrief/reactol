import { Card, ConfigProvider, Splitter } from 'antd';
import { PathOptions, StyleFunction, CircleMarker, LatLngExpression } from 'leaflet'
import './App.css'
import { MapContainer, Marker, Popup, GeoJSON, TileLayer } from 'react-leaflet'
import initialData from './data/collection.ts'
import { Feature, FeatureCollection, Geometry} from 'geojson'
import { useEffect, useState } from 'react'
import Layers from './components/Layers.tsx';
import Properties from './components/Properties.tsx';
import TimeControl from './components/TimeControl.tsx';
import { noop } from 'antd/es/_util/warning';
import { timeBoundsFor } from './helpers/timeBounds.ts';

interface CustomPathOptions extends PathOptions {
  radius?: number;
}

const setColor: StyleFunction = (feature: Feature<Geometry, unknown> | undefined) => {
  const res: CustomPathOptions = {}
  if (feature) {
    const feat = feature as Feature
    if (feat?.properties?.color) {
      res.color = feat.properties.color
    }
    if (feat.geometry.type === 'Point') {
      res.radius = 30
    }
  }
  res.weight = 3
  return res;
};

function App() {
  const [store, setStore] = useState<FeatureCollection | undefined>(undefined)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [timeBounds, setTimeBounds] = useState<[number, number]>([0, 0])

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
    console.log('new time bounds:', timeBoundsFor(initialData.features))
    setTimeBounds(timeBoundsFor(initialData.features))
  }, [])

  const createLabelledPoint = (pointFeature: Feature, latlng: LatLngExpression) => {
    const color = pointFeature.properties?.color || 'blue';
    const name = pointFeature.properties?.name || '';
    return new CircleMarker(latlng, { radius: 15, color }).bindTooltip(name, { permanent: true, direction: 'center' });
  }

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

  const setChecked = (ids: string[]): void => {
    const newStore = JSON.parse(JSON.stringify(store))
    newStore.features = newStore.features.map((feature: Feature) => {
      const id = feature.id as string
      setFeatureVisibility(feature, ids.includes(id))
      return feature
    })
    setStore(newStore)
  }

  const setSelected = (ids: string[]): void => {
    const selected = store?.features.find((feature) => ids.includes(feature.id as string)) || null;
    setSelectedFeature(selected);
  }

  const setTime = (value: number) => {
    console.log('new time:', value, new Date(value).toISOString())
  }

  const isVisible = (feature: Feature): boolean => {
    return feature.properties?.visible
  }

  return (
    <div className="App">
      <ConfigProvider theme={antdTheme}>
        <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel key='left' collapsible defaultSize="20%" min="20%" max="70%">
            <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
              <Splitter.Panel defaultSize="20%" min="10%" max="20%" resizable={true}>
                <Card title='Time Control'>
                  {timeBounds && 
                    <TimeControl start={timeBounds[0]} end={timeBounds[1]} 
                      setLowerLimit={noop} setUpperLimit={noop} setTime={setTime} />}
                </Card>
              </Splitter.Panel>
              <Splitter.Panel>
                <Card title='Layers' style={{width: '100%', height: '100%'}} >
                  <Layers store={store} setChecked={setChecked} setSelected={setSelected} />
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
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              { 
                store?.features.filter(feature => isVisible(feature)).map((feature, index) => 
                  <GeoJSON key={`${feature.id || index}`} data={feature} style={setColor} pointToLayer={createLabelledPoint}/>)
              }
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
