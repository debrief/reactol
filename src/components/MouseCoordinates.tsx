import { LeafletMouseEvent } from 'leaflet';
import React, { useMemo, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import * as turf from "@turf/turf";
import './MouseCoordinates.css';
import { useAppContext } from '../context/AppContext';

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

const MouseCoordinates: React.FC = () => {
  const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number }>({lat:0, lng:0});
  const { selection } = useAppContext();

  const map = useMap()

  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      setMouseCoords({ lat, lng });
    }
  })

  const rangeBearing: {rng: number, brg: number} = useMemo(() => {
    if (map) {
      const turfMouse = turf.point([mouseCoords.lng, mouseCoords.lat]);

      if (selection.length === 1) {
        const selectedFeature = map.featureGroup.getLayer(selection[0]);
        if (selectedFeature) {
          const nearestPoint = turf.nearestPoint(turfMouse, selectedFeature.toGeoJSON());
          const bearing = bearingToAzimuth(turf.bearing(turfMouse, nearestPoint));
          const range = turf.distance(turfMouse, nearestPoint);
          return {rng: range, brg: bearing};
        }
      }

      const mapCentre = map.getCenter();
      const turfCentre = turf.point([mapCentre.lng, mapCentre.lat]);
      const bearing = bearingToAzimuth(turf.bearing(turfCentre, turfMouse));
      const range = turf.distance(turfCentre, turfMouse);
      return {rng: range, brg: bearing};
    } else {
      return {rng: 0, brg: 0};
    }
  }, [mouseCoords, map, selection]);
  
  return (
    <div className="mouse-coordinates-panel">
      <p>Lat: {formatCoordinate(mouseCoords.lat, true)}</p>
      <p>Lng: {formatCoordinate(mouseCoords.lng, false)}</p>
      <p>Rng: {`${(`` + rangeBearing.rng.toFixed(1)).padStart(2, '0')} km`}</p>
      <p>Brg: {`${(`` + rangeBearing.brg.toFixed(1)).padStart(3, '0')} degs`}</p>
    </div>
  );
};

export default MouseCoordinates;
