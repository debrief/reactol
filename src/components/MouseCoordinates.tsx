import React from 'react';

interface MouseCoordinatesProps {
  lat: number;
  lng: number;
}

const formatCoordinate = (coordinate: number, isLat: boolean) => {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = isLat
    ? coordinate >= 0
      ? 'N'
      : 'S'
    : coordinate >= 0
    ? 'E'
    : 'W';

  return `${degrees}°${minutes}'${seconds}" ${direction}`;
};

const MouseCoordinates: React.FC<MouseCoordinatesProps> = ({ lat, lng }) => {
  return (
    <div className="mouse-coordinates-panel">
      <p>Lat: {formatCoordinate(lat, true)}</p>
      <p>Lng: {formatCoordinate(lng, false)}</p>
    </div>
  );
};

export default MouseCoordinates;
