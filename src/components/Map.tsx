import { Feature, Geometry, MultiPoint, Point, Polygon, Position } from "geojson";
import { MapContainer, Marker, Popup, GeoJSON, CircleMarker as ReactCircleMarker } from 'react-leaflet'
import { PathOptions, StyleFunction, LatLngExpression, CircleMarker, LeafletMouseEvent } from 'leaflet'
import { TRACK_TYPE, ZONE_TYPE } from "../constants";
import Track from "./Track";
import Zone from "./Zone";
import * as turf from "turf";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { useAppContext } from "../context/AppContext";

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

const calcInterpLocation = (poly: MultiPoint, times: any, current: number, index: number): Position => {
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
  const markerLoc = interpolated.geometry.coordinates
  return markerLoc
}

interface MapProps {
  children: React.ReactNode;
}

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(state => state.featureCollection.features)
  const { selection, setSelection, time } = useAppContext();
  const [currentLocations, setCurrentLocations] = useState<Feature<Point>[]>([])

  const setColor: StyleFunction = (feature: Feature<Geometry, unknown> | undefined) => {
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
      const temporalFeatures = features.filter(isTemporal)
      const pointFeatures = temporalFeatures.map((feature) => {
        const times = feature.properties?.times
        const timeNow = time.current
        const index = times.findIndex((time: string) => new Date(time).getTime() >= timeNow)
        if (index >= 0) {
          const poly = feature.geometry as MultiPoint
          const markerLoc = calcInterpLocation(poly, times, time.current, index)
          const pointFeature: Feature<Point> = {
            type: 'Feature',
            id: feature.id,
            geometry: {
              type: 'Point',
              coordinates: markerLoc
            },
            properties: {
              name: feature.properties?.name,
              color: feature.properties?.color
            }
          }
          return pointFeature
        }
        return undefined
      }).filter((f) => f !== undefined) as Feature<Point>[]
      setCurrentLocations(pointFeatures)
    } else {
      setCurrentLocations([])
    }
  }, [time, features])

  const InterpolatedLocationMarker = (feature: Feature<Point>, current: number): React.ReactElement => {
    const loc = feature.geometry.coordinates.slice().reverse() as LatLngExpression
    const color = feature.properties?.color || '#f9f'
    return <ReactCircleMarker key={'current-' + feature.id + '-' + current} radius={5} 
      fillColor={color} color={color} center={loc}/>
  }

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
      return <Zone feature={feature as Feature<Polygon>} onClickHandler={onClickHandler} currentLocations={currentLocations}/>  
    default:
      return <GeoJSON key={`${feature.id || 'index'}`} data={feature} style={setColor} pointToLayer={createLabelledPoint} /> 
    }
  }

  return (
    <>
      <MapContainer center={[35.505, -4.09]} zoom={8} scrollWheelZoom={true}>
        {children}
        { 
          features.filter(feature => isVisible(feature)).map((featureFor))
        }
        { time.current && currentLocations.map((feature) => InterpolatedLocationMarker(feature, time.current)) }
      </MapContainer>
    </>
  );
};

export default Map
