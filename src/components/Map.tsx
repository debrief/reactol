import { Feature, Geometry, Polygon } from "geojson";
import { MapContainer,  GeoJSON } from 'react-leaflet'
import { PathOptions, StyleFunction, LatLngExpression, CircleMarker, LeafletMouseEvent } from 'leaflet'
import { TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";
import { useCallback, useEffect, useMemo } from "react";
import { useAppSelector } from "../app/hooks";
import { useAppContext } from "../context/AppContext";
import { generateCurrentLocations } from "../helpers/generateCurrentLocations";

interface CustomPathOptions extends PathOptions {
  radius?: number;
}

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

const createLabelledPoint = (pointFeature: Feature, latlng: LatLngExpression, onTooltipClick: (event: LeafletMouseEvent) => void) => {
  const color = pointFeature.properties?.color || 'blue';
  const name = pointFeature.properties?.name || '';
  return new CircleMarker(latlng, { radius: 1, fillOpacity: 1, color, opacity:1 }).bindTooltip(name, { interactive:true, permanent: true, direction: 'center' }).on('click', onTooltipClick);
}

interface MapProps {
  children: React.ReactNode;
}

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(state => state.featureCollection.features)
  const { selection, setSelection, time, setCurrentLocations } = useAppContext();

  const styleFor: StyleFunction = (feature: Feature<Geometry, unknown> | undefined) => {
    const res: CustomPathOptions = {}
    if (feature) {
      const feat = feature as Feature
      if (feat?.properties?.color) {
        res.color = feat.properties.color
      }
      if(selection.includes(feature.id as string)) {
        res.color = '#aaa'
      }
    }
    res.weight = 3
    return res;
  };

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

  const onTooltipClick = useCallback( (event: LeafletMouseEvent) => {
    if (event.target.feature) {
      onClickHandler(event.target.feature.id as string, event.originalEvent.altKey || event.originalEvent.ctrlKey)
    }
  }, [onClickHandler]);

  const featureFor = (feature: Feature): React.ReactElement => {
    switch(feature.properties?.dataType) {
    case TRACK_TYPE:
      return <Track key={feature.id} feature={feature} onClickHandler={onClickHandler}/> 
    case ZONE_TYPE:
      return <Zone key={feature.id} feature={feature as Feature<Polygon>} onClickHandler={onClickHandler}/>  
    default:
      return <GeoJSON key={`${feature.id || 'index'}`} data={feature} style={styleFor} 
      pointToLayer={(pointFeature, latlng) => createLabelledPoint(pointFeature, latlng, onTooltipClick)} /> 
    }
  }

  const visibleFeatures = useMemo(() => {
    const vis = features.filter(feature => isVisible(feature))
    return vis.map(featureFor)
  }, [features])

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        {children}
        { 
          visibleFeatures
        }
      </MapContainer>
    </>
  );
};

export default Map
