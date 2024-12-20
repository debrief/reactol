import { Feature, Geometry, MultiPoint } from "geojson";
import { LeafletMouseEvent } from 'leaflet';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { format } from "date-fns";
import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { CoordInstance, filterTrack } from "../helpers/filterTrack";

export interface TrackProps {
  feature: Feature 
  onClickHandler: {(id: string, modifier: boolean): void}
  showCurrentLocation?: boolean
  showTrackLine?: boolean
}

const colorFor = (feature: Feature<Geometry, unknown> | undefined, isSelected: boolean): string => {
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

const Track: React.FC<TrackProps> = ({feature, onClickHandler, showTrackLine = true}) => {
  const { selection, time } = useAppContext()
  const isSelected = selection.includes(feature.id as string)


  const trackCoords = useMemo(() => {
    if (time && feature.properties?.times) {
      const coords = (feature.geometry as MultiPoint).coordinates
      const times = feature.properties.times
      const validCoords = filterTrack(time.filterApplied, time.start, time.end, times, coords)
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
  }, [feature, time])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

  return (
    <>
      { showTrackLine && <Polyline key={feature.id + '-line-' + isSelected} eventHandlers={{click: onclick}} positions={trackCoords.map((val: CoordInstance) => val.pos)} weight={2} color={colorFor(feature, isSelected)}/>}
      { showTrackLine && trackCoords.length && <CircleMarker key={feature.id + '-start-line-' + isSelected} center={trackCoords[0].pos}  color={colorFor(feature, isSelected)} radius={0}>
        <Tooltip key={feature.id + '-start-name-' + isSelected} 
          direction='left' opacity={1} permanent>{feature.properties?.name}</Tooltip>
      </CircleMarker> }
      { showTrackLine && trackCoords.map((item: CoordInstance, index: number) => 
        <CircleMarker key={feature.id + '-point-' + index} center={item.pos} radius={3} color={colorFor(feature, isSelected)} eventHandlers={{click: onclick}}>
          {feature.properties?.times && <Tooltip  key={feature.id + '-tip-' + index} offset={[0, -20]} direction="center" opacity={1} permanent>
            {item.time}
          </Tooltip>}
        </CircleMarker> )}
    </>
  )
}

export default Track
