import { Feature, Geometry } from "geojson";
import { PathOptions, StyleFunction, CircleMarker, LatLngExpression } from 'leaflet'
import { MapContainer, Marker, Popup, GeoJSON, TileLayer } from 'react-leaflet'
import { useAppSelector } from "../app/hooks";


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

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

const Map: React.FC = () => {
  const features = useAppSelector(state => state.featureCollection.features)

  const createLabelledPoint = (pointFeature: Feature, latlng: LatLngExpression) => {
    const color = pointFeature.properties?.color || 'blue';
    const name = pointFeature.properties?.name || '';
    return new CircleMarker(latlng, { radius: 15, color }).bindTooltip(name, { permanent: true, direction: 'center' });
  }

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        { 
          features.filter(feature => isVisible(feature)).map((feature, index) => 
            <GeoJSON key={`${feature.id || index}`} data={feature} style={setColor} pointToLayer={createLabelledPoint}/>)
        }
        <Marker position={[51.505, -0.09]}>
          <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
};

export default Map