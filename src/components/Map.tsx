import { Feature, Geometry, Point } from "geojson";
import { MapContainer, Marker, Popup, GeoJSON, TileLayer, CircleMarker as ReactCircleMarker } from 'react-leaflet'
import { PathOptions, StyleFunction, LatLngExpression, CircleMarker, LeafletMouseEvent } from 'leaflet'
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";
import { useCallback } from "react";

interface CustomPathOptions extends PathOptions {
  radius?: number;
}

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

const Map: React.FC = () => {
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeaturesId = useAppSelector(state => state.selected.selected)
  const currentLocations = useAppSelector(state => state.currentLocation.locations)
  const {current} = useAppSelector(state => state.time)
  const dispatch = useAppDispatch();

  const setColor: StyleFunction = (feature: Feature<Geometry, unknown> | undefined) => {
    const res: CustomPathOptions = {}
    if (feature) {
      const feat = feature as Feature
      if (feat?.properties?.color) {
        res.color = feat.properties.color
      }
      if(selectedFeaturesId.includes(feature.id as string)) {
        res.color = '#aaa'
      }
    }
    res.weight = 3
    return res;
  };

  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
    if (modifier) {
      // add/remove from selection
      if (selectedFeaturesId.includes(id)) {
        dispatch({type: 'selection/removeSelection', payload: id as string})
      } else {
        dispatch({type: 'selection/addSelection', payload: id as string})
      } 
    } else {
      // just select this item
      dispatch({type: 'selection/selectionChanged', payload: {selected: [id as string]}})
    }
  }, [dispatch, selectedFeaturesId])

  const onTooltipClick = useCallback( (event: LeafletMouseEvent) => {
    if (event.target.feature) {
      onClickHandler(event.target.feature.id as string, event.originalEvent.altKey || event.originalEvent.ctrlKey)
    }
  }, [onClickHandler]);

  const createLabelledPoint = (pointFeature: Feature, latlng: LatLngExpression) => {
    const color = pointFeature.properties?.color || 'blue';
    const name = pointFeature.properties?.name || '';
    return new CircleMarker(latlng, { radius: 1, fillOpacity: 1, color, opacity:1 }).bindTooltip(name, { interactive:true, permanent: true, direction: 'center' }).on('click', onTooltipClick);
  }
  
  const featureFor = (feature: Feature): React.ReactElement => {
    switch(feature.properties?.dataType) {
    case TRACK_TYPE:
      return <Track feature={feature} onClickHandler={onClickHandler}/> 
    case ZONE_TYPE:
      return <Zone feature={feature} onClickHandler={onClickHandler}/>  
    default:
      return <GeoJSON key={`${feature.id || 'index'}`} data={feature} style={setColor} pointToLayer={createLabelledPoint} /> 
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
        {/* { current && currentLocations.map((feature: Feature<Point>) => {
          const coords = feature.geometry.coordinates.slice().reverse() as LatLngExpression
          const color = feature.properties?.color || '#f9f'
          return <ReactCircleMarker key={feature.id as string + '-' + current } radius={5} 
            fillColor={color} color={color} center={coords}/>}
            )} */}
      </MapContainer>
    </>
  );
};

export default Map
