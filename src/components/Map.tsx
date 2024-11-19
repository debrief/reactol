import { Feature, Geometry, MultiPoint } from "geojson";
import { PathOptions, StyleFunction, LatLngExpression, CircleMarker } from 'leaflet'
import { MapContainer, Marker, Popup, GeoJSON, TileLayer } from 'react-leaflet'
import { useAppSelector } from "../app/hooks";
import { TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";

interface CustomPathOptions extends PathOptions {
  radius?: number;
}

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

const Map: React.FC = () => {
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeatureId = useAppSelector(state => state.selected.selected)
  const {current} = useAppSelector(state => state.time)

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

  const featureFor = (feature: Feature): React.ReactElement => {
    switch(feature.properties?.dataType) {
    case TRACK_TYPE:
      return <Track feature={feature}/> 
    case ZONE_TYPE:
      return <Zone feature={feature}/>  
    default:
      return <GeoJSON key={`${feature.id || 'index'}`} data={feature} style={setColor} pointToLayer={createLabelledPoint}/> 
    }
  }

  const isTemporal = (feature: Feature): boolean => {
    return feature.properties?.times
  }

  const CurrentMarker = (feature: Feature, ctr: number, current: number): React.ReactElement => {
    if (feature.properties?.times) {
      const times = feature.properties.times
      const index = times.findIndex((time: string) => new Date(time).getTime() >= current)
      if (index >= 0) {
        const poly = feature.geometry as MultiPoint
        const coords = poly.coordinates
        const key = `marker-${ctr}-${index}`
        const location = [coords[index][1], coords[index][0]] as LatLngExpression
        return <Marker key={key} position={location}>
        </Marker>
      }
    }
    return <></>
  }


  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        { 
          features.filter(feature => isVisible(feature)).map((featureFor))
        }
        <Marker position={[51.505, -0.09]}>
          <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        { current && features.filter(isTemporal).map((feature, ctr) => CurrentMarker(feature, ctr, current)) }
      </MapContainer>
    </>
  );
};

export default Map