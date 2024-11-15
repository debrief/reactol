import './App.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

// const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
//   <Flex justify="center" align="center" style={{ height: '100%' }}>
//   <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
//   {props.text}
//   </Typography.Title>
//   </Flex>
// );

// const circleFeature = new Feature({
//   geometry: new CircleGeom(transform([ -6.2685, 35.8192], 'EPSG:4326', 'EPSG:3857'), 10000 ),
// });

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

// const map = new OlMap({
//   layers: [
//     new OlLayerTile({
//       properties: {
//         name: 'OSM'
//       },
//       source: new OlSourceOSM()
//     }),
//     vectorLayer,
//     pointLayer
//   ],
//   view: new OlView({
//     center: transform([-3, 36], 'EPSG:4326', 'EPSG:3857'),
//     zoom: 7,
//   })
// });

function App() {
  return (
    <div className="App">
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
