import { Feature, GeoJsonProperties, Geometry, MultiPoint } from "geojson";
import { LatLngExpression, LeafletMouseEvent  } from 'leaflet'
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { format } from "date-fns";
import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { CoordInstance, filterTrack } from "../helpers/filterTrack";
import { Point } from "geojson";

export interface TrackProps {
  feature: Feature 
  onClickHandler: {(id: string, modifier: boolean): void}
  showCurrentLocation?: boolean
  showTrackLine?: boolean
  snailMode?: boolean
}

const Track: React.FC<TrackProps> = ({feature, onClickHandler, showCurrentLocation = true, showTrackLine = true, snailMode = false}) => {
  const { selection, time, currentLocations } = useAppContext()
  const isSelected = selection.includes(feature.id as string)
  const limits: [number, number] = [time.start, time.end]

  const colorFor = (feature: Feature<Geometry, unknown> | undefined): string => {
    if (isSelected) {
      return '#aaa'
    }
    if (feature) {
      const feat = feature as Feature
      if (feat.properties) {
        return feat.properties.color || '#ff0'
      }
    }
    return '#000';
  };
  
  const currentLocation: Feature<Point, GeoJsonProperties> | undefined = useMemo(() => {
    return currentLocations.find((loc) => loc.id === feature.id)
  }, [currentLocations]);

  const trackCoords = useMemo(() => {
    if (limits && feature.properties?.times) {
      const coords = (feature.geometry as MultiPoint).coordinates
      const times = feature.properties.times
      const validCoords = filterTrack(limits[0], limits[1], times, coords)
      return validCoords
    } else {
      const coords = (feature.geometry as MultiPoint).coordinates
      const times = feature.properties?.times
      if (times && times.length) {
        return times.map((time: string, index: number) => {return {pos:[coords[index][1], coords[index][0]],time: format(time, "ddHHmm'Z'")}})
      } else {
        return coords.map((coord: number[]) => {return {pos:[coord[1], coord[0]],time: ''}})
      }
    }
  }, [feature, limits])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

  const interpolatedLocationMarker = useMemo(() => {
    if (currentLocation !== undefined) {
      const loc = currentLocation.geometry.coordinates.slice().reverse() as LatLngExpression
      const color = currentLocation.properties?.color || '#f9f'
      return <CircleMarker key={'current-' + feature.id + '-' + time.current} radius={5} 
        fillColor={color} color={color} center={loc}/>
    } else {
      return <></>
    }
  }, [currentLocation, feature, time.current]);

  const snailModePolyline = useMemo(() => {
    if (snailMode && currentLocation) {
      const coords = trackCoords.map((val: CoordInstance) => val.pos);
      const currentLoc = currentLocation.geometry.coordinates.slice().reverse() as LatLngExpression;
      const allCoords = [...coords, currentLoc];
      const opacityStep = 1 / allCoords.length;
      return allCoords.map((coord, index) => (
        <Polyline
          key={`snail-${feature.id}-${index}`}
          positions={[allCoords[index], allCoords[index + 1]]}
          weight={2}
          color={colorFor(feature)}
          opacity={opacityStep * (index + 1)}
        />
      ));
    }
    return null;
  }, [snailMode, currentLocation, trackCoords]);

  return (
    <>
      { showTrackLine && !snailMode && <Polyline key={feature.id + '-line-' + isSelected} eventHandlers={{click: onclick}} positions={trackCoords.map((val: CoordInstance) => val.pos)} weight={2} color={colorFor(feature)}/>}
      { showTrackLine && !snailMode && trackCoords.length && <Polyline key={feature.id + '-start-line-' + isSelected} positions={[trackCoords[0].pos]} weight={2} color={colorFor(feature)}>
        <Tooltip key={feature.id + '-start-name-' + isSelected} 
          direction='left' opacity={1} permanent>{feature.properties?.name}</Tooltip>
      </Polyline> }
      { showTrackLine && !snailMode && trackCoords.map((item: CoordInstance, index: number) => 
        <CircleMarker key={feature.id + '-point-' + index} center={item.pos} radius={3} color={colorFor(feature)} eventHandlers={{click: onclick}}>
          {feature.properties?.times && <Tooltip  key={feature.id + '-tip-' + index} offset={[0, -20]} direction="center" opacity={1} permanent>
            {item.time}
          </Tooltip>}
        </CircleMarker> )}
        { showCurrentLocation && interpolatedLocationMarker }
        { snailMode && snailModePolyline }
    </>
  )
}

export default Track
