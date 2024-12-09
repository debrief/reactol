import { LeafletMouseEvent } from 'leaflet';
import React, { useMemo, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { Feature, FeatureCollection, LineString, MultiPoint, Point, Polygon } from "geojson";
import * as turf from "@turf/turf";
import './MouseCoordinates.css';
import { useAppContext } from '../context/AppContext';
import { useAppSelector } from '../app/hooks';

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

const bearingToAzimuth = (bearing: number) => {
  return (bearing + 360) % 360;
}

const featureToPoints = (feature: Feature): FeatureCollection<Point> => {
  switch (feature.geometry.type) {
    case 'Point':
      return turf.featureCollection([feature as Feature<Point>]);
    case 'LineString':
      return turf.featureCollection([feature as Feature<LineString>]);
    case 'MultiPoint':
      return turf.explode(feature as Feature<MultiPoint>);
    case 'Polygon':
      return turf.explode(feature as Feature<Polygon>);
    default:
      return turf.featureCollection([]);
  }
}

const MouseCoordinates: React.FC = () => {
  const { selection } = useAppContext();
  const features = useAppSelector(state => state.featureCollection.features)
  const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number }>({lat:0, lng:0});

  const map = useMap()

  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      setMouseCoords({ lat, lng });
    }
  })

  const rangeBearing: {rng: number, brg: number, subject: string} = useMemo(() => {
    if (map) {
      const turfMouse = turf.point([mouseCoords.lng, mouseCoords.lat]);

      if (selection.length === 1) {

        const selectedFeature = features.find((feature) => feature.id === selection[0])
        if (selectedFeature) {
          const asPoints = featureToPoints(selectedFeature);
          const nearestPoint = turf.nearestPoint(turfMouse, asPoints);
          const bearing = bearingToAzimuth(turf.bearing(nearestPoint, turfMouse));
          const range = turf.distance(turfMouse, nearestPoint);
          return {rng: range, brg: bearing, subject: selectedFeature.properties?.name || ''};
        }
      }

      const mapCentre = map.getCenter();
      const turfCentre = turf.point([mapCentre.lng, mapCentre.lat]);
      const bearing = bearingToAzimuth(turf.bearing(turfCentre, turfMouse));
      const range = turf.distance(turfCentre, turfMouse);
      return {rng: range, brg: bearing, subject: 'Map Center'};
    } else {
      return {rng: 0, brg: 0, subject: ''};
    }
  }, [mouseCoords, map, selection]);
  
  return (
    <div className="mouse-coordinates-panel">
      <p>Lat: {formatCoordinate(mouseCoords.lat, true)}</p>
      <p>Lng: {formatCoordinate(mouseCoords.lng, false)}</p>
      <p>Rel to {rangeBearing.subject}:</p>
      <p>{`${(`` + rangeBearing.rng.toFixed(1)).padStart(5, '0')} km`}/
         {`${(`` + rangeBearing.brg.toFixed(1)).padStart(5, '0')} degs`}</p>
    </div>
  );
};

export default MouseCoordinates;
