import { ConfigProvider, Flex, Splitter, Typography } from 'antd';
import './App.css'
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import MapContext from '@terrestris/react-util/dist/Context/MapContext/MapContext';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerTile from 'ol/layer/Tile';
import { LayerTree, TimeLayerSliderPanel } from '@terrestris/react-geo';
import OlSourceOSM from 'ol/source/OSM';
import OlSourceTileWMS from 'ol/source/TileWMS';
import moment from 'moment';
import { transformExtent } from 'ol/proj';
// import 'antd/dist/antd.min.css'
// import 'react-geo.css'


const center = [ 788453.4890155146, 6573085.729161344 ];


const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
  <Flex justify="center" align="center" style={{ height: '100%' }}>
  <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
  {props.text}
  </Typography.Title>
  </Flex>
);

const extent = transformExtent([-126, 24, -66, 50], 'EPSG:4326', 'EPSG:3857');

const timeLayers = [
  new OlLayerTile({
    extent: extent,
    // type: 'WMSTime',
    // timeFormat: 'YYYY-MM-DDTHH:mm',
    // roundToFullHours: true,
    source: new OlSourceTileWMS({
      attributions: ['Iowa State University'],
      url: '//mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi',
      params: {LAYERS: 'nexrad-n0r-wmst'}
    })
  })
];

const layerGroup = new OlLayerGroup({
  properties: {
    name: 'Layergroup 2',
  },
  layers: [
    new OlLayerTile({
      properties: {
        name: 'OSM-Overlay-WMS'
      },
      minResolution: 0,
      maxResolution: 200,
      source: new OlSourceTileWMS({
        url: 'https://ows.terrestris.de/osm/service',
        params: {
          LAYERS: 'OSM-Overlay-WMS'
        }
      })
    }),
    new OlLayerTile({
      properties: {
        name: 'SRTM30-Contour'
      },
      minResolution: 0,
      maxResolution: 10,
      visible: false,
      source: new OlSourceTileWMS({
        url: 'https://ows.terrestris.de/osm/service',
        params: {
          LAYERS: 'SRTM30-Contour'
        }
      })
    }),
    new OlLayerTile({
      properties: {
        name: 'SRTM30-Colored-Hillshade'
      },
      minResolution: 0,
      maxResolution: 10,
      visible: false,
      source: new OlSourceTileWMS({
        url: 'https://ows.terrestris.de/osm/service',
        params: {
          LAYERS: 'SRTM30-Colored-Hillshade'
        }
      })
    })
  ]
});

const anotherLayerGroup = new OlLayerGroup({
  properties: {
    name: 'Layergroup 1',
    visible: false
  },
  layers: [
    new OlLayerTile({
      properties: {
        name: 'OSM-Overlay-WMS A'
      },
      minResolution: 0,
      maxResolution: 200,
      source: new OlSourceTileWMS({
        url: 'https://ows.terrestris.de/osm/service',
        params: {
          LAYERS: 'OSM-Overlay-WMS'
        }
      })
    }),
    new OlLayerTile({
      properties: {
        name: 'OSM-Overlay-WMS B'
      },
      minResolution: 0,
      maxResolution: 200,
      source: new OlSourceTileWMS({
        url: 'https://ows.terrestris.de/osm/service',
        params: {
          LAYERS: 'OSM-Overlay-WMS'
        }
      })
    }),
    layerGroup
  ]
});

const map = new OlMap({
  layers: [
    new OlLayerTile({
      properties: {
        name: 'OSM'
      },
      source: new OlSourceOSM()
    }),
    new OlLayerGroup({
      properties: {
        name: 'Time Layers'
      },
      visible: true,
      layers: timeLayers
    }),
    anotherLayerGroup,
    new OlLayerGroup({
      properties: {
        name: 'Empty layergroup'
      },
      visible: true,
      layers: []
    })
  ],
  view: new OlView({
    center: center,
    zoom: 16,
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
              <Splitter.Panel defaultSize={'20%'}>
                <TimeLayerSliderPanel
                  initStartDate={moment().subtract(3, 'hours')}
                  initEndDate={moment()}
                  timeAwareLayers={timeLayers}
                  autoPlaySpeedOptions={[0.5, 1, 2, 3]}
                  dateFormat='YYYY-MM-DD HH:mm'
                />
              </Splitter.Panel>
              <Splitter.Panel>
                <LayerTree className="top"/>
              </Splitter.Panel>
              <Splitter.Panel>
                <Desc text="Properties" />
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
