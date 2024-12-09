import { LeafletMouseEvent } from 'leaflet';
import React, { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import './MouseCoordinates.css';

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

const MouseCoordinates: React.FC = () => {
  const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number }>({lat:0, lng:0});

  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      setMouseCoords({ lat, lng });
    }
  })
  
  return (
    <div className="mouse-coordinates-panel">
      <p>Lat: {formatCoordinate(mouseCoords.lat, true)}</p>
      <p>Lng: {formatCoordinate(mouseCoords.lng, false)}</p>
    </div>
  );
};

export default MouseCoordinates;
