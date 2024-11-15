import { LatLngExpression } from 'leaflet'
import './App.css'
import { Circle, MapContainer, Marker, Popup, TileLayer, GeoJSON, LayerGroup, LayersControl } from 'react-leaflet'
import track1 from './data/track1.json'
import track2 from './data/track2.json'
import points from './data/points.json'
import zones from './data/zones.json'
import { FeatureCollection } from 'geojson'

// const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
//   <Flex justify="center" align="center" style={{ height: '100%' }}>
//   <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
//   {props.text}
//   </Typography.Title>
//   </Flex>
// );

const center: LatLngExpression = [51.505, -0.09]
const fillBlueOptions = { fillColor: 'blue' }

// const vectorSource = new VectorSource({
//   features: new GeoJSON().readFeatures(track1)
// });
// vectorSource.getFeatures().push(circleFeature);

// const pointSource = new VectorSource({
//   features: new GeoJSON().readFeatures(points)
// });

// const style = new Style({
//   fill: new Fill({
//       color: 'rgba(255, 100, 50, 0.3)'
//   }),
//   stroke: new Stroke({
//       width: 2,
//       color: 'rgba(255, 100, 50, 0.8)'
//   }),
//   image: new Circle({
//       fill: new Fill({
//           color: 'rgba(55, 200, 150, 0.5)'
//       }),
//       stroke: new Stroke({
//           width: 1,
//           color: 'rgba(55, 200, 150, 0.8)'
//       }),
//       radius: 7
//   }),
// });

// const vectorLayer = new VectorLayer({
//   source: vectorSource,
//   style: style,
//   properties: {
//     name: 'Tracks'
//   }
// });

// const pointLayer = new VectorLayer({
//   source: pointSource,
//   style: style,
//   properties: {
//     name: 'Points'
//   }
// });

const setColor = () => {
  return { weight: 3 };
};

function App() {
  return (
    <div className="App">
        <MapContainer center={[32.505, -4.09]} zoom={8} scrollWheelZoom={true}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name='OpenStreetMap'>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              <TileLayer url='https://t1.openseamap.org/seamark/{z}/{x}/{y}.png'/>
            </LayersControl.BaseLayer>  
            <LayersControl.Overlay checked name='tracks'>
              <LayersControl.Overlay checked name='track 1'>
                <GeoJSON key='t1' data={track1 as FeatureCollection} style={setColor} />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked name='track 2'>
                <GeoJSON key='t2' data={track2 as FeatureCollection} style={setColor} />
              </LayersControl.Overlay>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name='points'>
              <GeoJSON key='points' data={points as FeatureCollection} style={setColor} />
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name='zones'>
              <GeoJSON key='zones' data={zones as FeatureCollection} style={setColor} />
            </LayersControl.Overlay>
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
