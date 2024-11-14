import { Card, ConfigProvider, Flex, Splitter, Typography } from 'antd';
import './App.css'
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import MapContext from '@terrestris/react-util/dist/Context/MapContext/MapContext';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import { LayerTree } from '@terrestris/react-geo';
import OlSourceOSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import 'antd/dist/reset.css'
import './react-geo.css'

const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
  <Flex justify="center" align="center" style={{ height: '100%' }}>
  <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
  {props.text}
  </Typography.Title>
  </Flex>
);

const map = new OlMap({
  layers: [
    new OlLayerTile({
      properties: {
        name: 'OSM'
      },
      source: new OlSourceOSM()
    }),
  ],
  view: new OlView({
    center: transform([-3, 36], 'EPSG:4326', 'EPSG:3857'),
    zoom: 7,
  })
});

function App() {
  
  return (
    <div className="App">
      <ConfigProvider theme={{
        components: {
          Splitter: {
            splitBarSize: 10,
          },
    },
      }}>
      <MapContext.Provider value={map}>
        <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel key='left' collapsible defaultSize="20%" min="20%" max="70%">
            <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
              <Splitter.Panel defaultSize="20%" min="10%" max="20%" resizable={true}>
                <Desc text="Time Control" />
              </Splitter.Panel>
              <Splitter.Panel>
                <Card title='Layers' style={{width: '100%', height: '100%'}} >
                  <LayerTree />
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
          <MapComponent id='map'
          map={map}
          />
          </Splitter.Panel>
        </Splitter>
        </MapContext.Provider>
      </ConfigProvider>
    </div>
  )
}

export default App
