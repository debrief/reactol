import { Feature, Point, Polygon } from "geojson";
import { MapContainer, ScaleControl, useMap } from 'react-leaflet';
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";
import { useCallback, useEffect, useMemo } from "react";
import { useAppSelector } from "../app/hooks";
import { useAppContext } from "../context/AppContext";
import { Point as DataPoint } from "./Point";
import MouseCoordinates from './MouseCoordinates';
import 'leaflet-auto-graticule'; // P4ca9

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

interface MapProps {
  children: React.ReactNode;
}

const featureFor = (feature: Feature, onClickHandler: (id: string, modifier: boolean) => void): React.ReactElement => {
  switch(feature.properties?.dataType) {
  case TRACK_TYPE:
    return <Track key={feature.id} feature={feature} onClickHandler={onClickHandler} /> 
  case ZONE_TYPE:
    return <Zone key={feature.id} feature={feature as Feature<Polygon>} onClickHandler={onClickHandler}/>  
  case REFERENCE_POINT_TYPE:
    return <DataPoint key={feature.id} feature={feature as Feature<Point>} onClickHandler={onClickHandler} /> 
  default:
    throw new Error('Unknown feature type:' + feature.properties?.dataType)
  }
}

/** helper component that freezer map viewport */
const ViewportProperties: React.FC<{ frozen: boolean }> = ({frozen}) => {
  const map = useMap()
  useEffect(() => {
    if (map) {
      frozen ? map.dragging.disable() : map.dragging.enable()
      frozen ? map.scrollWheelZoom.disable() : map.scrollWheelZoom.enable()
      frozen ? map.touchZoom.disable() : map.touchZoom.enable()
      frozen ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable()
      frozen ? map.boxZoom.disable() : map.boxZoom.enable()  
    }
  },[map, frozen])
  return null
}

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(state => state.featureCollection.features)
  const { selection, setSelection, viewportFrozen } = useAppContext();

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
    return vis.map((feature: Feature) => featureFor(feature, onClickHandler))
  }, [features])

  const formatCoordinate = (coordinate: number, isLat: boolean) => {
    const toPadStr = (num: number) => ('' + num).padStart(2, '0');
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor(((minutesNotTruncated - minutes) * 60));
    const direction = isLat
      ? coordinate >= 0
        ? 'N'
        : 'S'
      : coordinate >= 0
      ? 'E'
      : 'W';

    return `${toPadStr(degrees)}°${toPadStr(minutes)}'${toPadStr(seconds)}" ${direction}`;
  };

  const buildLabel = (lat: number, lng: number) => {
    return `${formatCoordinate(lat, true)}, ${formatCoordinate(lng, false)}`;
  };

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8}  >
        <ViewportProperties frozen={viewportFrozen}/>
        {children}
        { 
          visibleFeatures
        }
        <MouseCoordinates/>
        <ScaleControl position={'bottomleft'}/>
        <AutoGraticule buildLabel={buildLabel} /> {/* Pf91a */}
      </MapContainer>
    </>
  );
};

export default Map
