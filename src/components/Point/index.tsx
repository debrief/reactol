import { Feature, Position, Point as GPoint } from "geojson";
import { LeafletMouseEvent } from 'leaflet';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { featureIsVisibleInPeriod } from "../../helpers/featureIsVisibleAtTime";

export interface ZoneProps {
  feature: Feature<GPoint> 
  onClickHandler: {(id: string, modifier: boolean): void}
}

export const Point: React.FC<ZoneProps> = ({feature, onClickHandler}) => {
  const { selection, time } = useAppContext()
  const { start: timeStart, end: timeEnd, filterApplied } = time
  const isSelected = selection.includes(feature.id as string)

  
  const location: [number, number] = useMemo(() => {
    const coords = feature.geometry.coordinates as Position
    const swapped: [number, number] = [coords[1], coords[0]]
    return swapped
  }, [feature])

  const color = useMemo(() => {
    return feature.properties?.color || 'blue';
  }, [feature])

  const isVisible = useMemo(() => {
    return filterApplied ? featureIsVisibleInPeriod(feature, timeStart, timeEnd) : true
  }, [feature, timeStart, timeEnd])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

  const name = feature.properties?.name || '';

  const circleRadius = useMemo(() => {
    return isSelected ? 8 : 4
  }, [isSelected])

  return (
    <>
    { isVisible && <CircleMarker key={'point-' + feature.id + '-' + color} radius={circleRadius} 
        fillColor={color} color={color} fill={true} fillOpacity={10} center={location} eventHandlers={{click: onclick}}>
        <Tooltip key={feature.id + '-tip-'} offset={[0, -20]} direction='center' opacity={1} permanent>
          {name}
        </Tooltip>
      </CircleMarker>}
    </>
  )
}
