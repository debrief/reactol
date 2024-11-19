import { Feature, Geometry, MultiPoint } from "geojson";
import { MapContainer, Marker, Popup, GeoJSON, TileLayer, CircleMarker as ReactCircleMarker } from 'react-leaflet'
import { PathOptions, StyleFunction, LatLngExpression, CircleMarker, LeafletMouseEvent } from 'leaflet'
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";
import * as turf from "turf";
import { SelectionState } from "../features/selection/selectionSlice";

interface CustomPathOptions extends PathOptions {
  radius?: number;
}

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

const isTemporal = (feature: Feature): boolean => {
  return feature.properties?.times
}

const timeVal = (timeStr: string): number => {
  return new Date(timeStr).getTime()
}

const calcInterpLocation = (poly: MultiPoint, times: any, current: number, index: number): LatLngExpression => {
  const coords = poly.coordinates
  const isFirst = index === 0
  const beforeIndex = isFirst ? 0 : index - 1
  const afterIndex = isFirst ? 0 : index
  const beforeCoords = coords[beforeIndex]
  const afterCoords = coords[afterIndex]
  const before = turf.point(beforeCoords)
  const after = turf.point(afterCoords)
  const turfPath = turf.lineString([beforeCoords, afterCoords])
  const len = turf.distance(before, after)
  const beforeTime = timeVal(times[beforeIndex])
  const afterTime = timeVal(times[afterIndex])
  const timeDelta = afterTime - beforeTime
  const proportion = (current - beforeTime) / timeDelta
  const lenProp = len * proportion
  const interpolated = isNaN(lenProp) ? before : turf.along(turfPath, lenProp)
  const markerLoc = interpolated.geometry.coordinates.reverse() as LatLngExpression
  return markerLoc
}


const Map: React.FC = () => {
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeatureId = useAppSelector(state => state.selected.selected)
  const {current} = useAppSelector(state => state.time)
  const dispatch = useAppDispatch();

  const setColor: StyleFunction = (feature: Feature<Geometry, unknown> | undefined) => {
    const res: CustomPathOptions = {}
    if (feature) {
      const feat = feature as Feature
      if (feat?.properties?.color) {
        res.color = feat.properties.color
      }
      if(feature.id === selectedFeatureId) {
        res.color = '#aaa'
      }
    }
    res.weight = 3
    return res;
  };
 
  const InterpolatedLocationMarker = (feature: Feature, ctr: number, current: number): React.ReactElement => {
    if (feature.properties?.times) {
      const times = feature.properties.times
      const index = times.findIndex((time: string) => new Date(time).getTime() >= current)
      if (index >= 0) {
        const poly = feature.geometry as MultiPoint
        const markerLoc = calcInterpLocation(poly, times, current, index)
        const key = `marker-${ctr}-${index}`
        return <ReactCircleMarker key={key} radius={5} fillColor="#fff" color={feature.properties?.color || '#f9f'} center={markerLoc}/>
      }
    }
    return <></>
  }

  const onFeatureClick = (event: any) => {
    const featureId = event.layer.feature.id;
    dispatch({ type: 'selection/selectionChanged', payload: { selected: featureId } });
  };

  const createLabelledPoint = (pointFeature: Feature, latlng: LatLngExpression) => {
    const color = pointFeature.properties?.color || 'blue';
    const name = pointFeature.properties?.name || '';
    return new CircleMarker(latlng, { radius: 1, fillOpacity: 1, color, opacity:1 }).bindTooltip(name, { permanent: true, direction: 'center' }).on('click', onFeatureClick);
  }
  

  const featureFor = (feature: Feature): React.ReactElement => {
    switch(feature.properties?.dataType) {
    case TRACK_TYPE:
      return <Track feature={feature}/> 
    case ZONE_TYPE:
      return <Zone feature={feature}/>  
    default:
      return <GeoJSON key={`${feature.id || 'index'}`} data={feature} style={setColor} pointToLayer={createLabelledPoint} eventHandlers={{ click: onFeatureClick }}/> 
    }
  }

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        <TileLayer url='./tiles/{z}/{x}/{y}.png'
          minZoom={0} maxZoom={12} maxNativeZoom={8} tms={false}/>  
        { 
          features.filter(feature => isVisible(feature)).map((featureFor))
        }
        <Marker position={[51.505, -0.09]}>
          <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        { current && features.filter(isTemporal).map((feature, ctr) => InterpolatedLocationMarker(feature, ctr, current)) }
      </MapContainer>
    </>
  );
};

export default Map
