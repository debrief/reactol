import { Feature, Point, Polygon } from "geojson";
import { MapContainer } from 'react-leaflet';
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";
import { useCallback, useEffect, useMemo } from "react";
import { useAppSelector } from "../app/hooks";
import { useAppContext } from "../context/AppContext";
import { generateCurrentLocations } from "../helpers/generateCurrentLocations";
import { Point as DataPoint } from "./Point";
import MouseCoordinates from './MouseCoordinates';

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

interface MapProps {
  children: React.ReactNode;
}

const featureFor = (feature: Feature, onClickHandler: (id: string, modifier: boolean) => void, snailMode: boolean): React.ReactElement => {
  switch(feature.properties?.dataType) {
  case TRACK_TYPE:
    return <Track key={feature.id} feature={feature} onClickHandler={onClickHandler} snailMode={snailMode}/> 
  case ZONE_TYPE:
    return <Zone key={feature.id} feature={feature as Feature<Polygon>} onClickHandler={onClickHandler}/>  
  case REFERENCE_POINT_TYPE:
    return <DataPoint key={feature.id} feature={feature as Feature<Point>} onClickHandler={onClickHandler} /> 
  default:
    throw new Error('Unknown feature type:' + feature.properties?.dataType)
  }
}

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(state => state.featureCollection.features)
  const { selection, setSelection, time, setCurrentLocations } = useAppContext();

  useEffect(() => {
    if (time.current && features.length) {
      const pointFeatures = generateCurrentLocations(features, time)
      setCurrentLocations(pointFeatures)
    } else {
      setCurrentLocations([])
    }
  }, [time, features])

  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
    if (modifier) {
      // add/remove from selection
      if (selection.includes(id)) {
        setSelection(selection.filter((selectedId) => selectedId !== id));
      } else {
        setSelection([...selection, id]);
      } 
    } else {
      // just select this item
      setSelection([id]);
    }
  }, [selection, setSelection])

  const visibleFeatures = useMemo(() => {
    const vis = features.filter(feature => isVisible(feature))
    return vis.map((feature: Feature) => featureFor(feature, onClickHandler, false))
  }, [features])

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        {children}
        { 
          visibleFeatures
        }
        <MouseCoordinates/>
      </MapContainer>
    </>
  );
};

export default Map
