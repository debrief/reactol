import { Feature, Geometry } from "geojson";
import { PathOptions, StyleFunction, LatLngExpression, CircleMarker } from 'leaflet'
import { MapContainer, Marker, Popup, GeoJSON, TileLayer } from 'react-leaflet'
import { useAppSelector } from "../app/hooks";

interface CustomPathOptions extends PathOptions {
  radius?: number;
}

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

const Map: React.FC = () => {
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeatureId = useAppSelector(state => state.selected.selected)

  const createLabelledPoint = (pointFeature: Feature, latlng: LatLngExpression) => {
    const color = pointFeature.properties?.color || 'blue';
    const name = pointFeature.properties?.name || '';
    return new CircleMarker(latlng, { radius: 15, color }).bindTooltip(name, { permanent: true, direction: 'center' });
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
      if(feature.id === selectedFeatureId) {
        res.color = '#aaa'
      }
    }
    res.weight = 3
    return res;
  };

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        <TileLayer url='./tiles/{z}/{x}/{y}.png'
          minZoom={0} maxZoom={12} maxNativeZoom={8} tms={false}/>  
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