import { Feature, Position, Point as GPoint} from "geojson";
import { LeafletMouseEvent  } from 'leaflet'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { featureIsVisibleInPeriod } from "../helpers/featureIsVisibleAtTime";

export interface ZoneProps {
  feature: Feature<GPoint> 
  onClickHandler: {(id: string, modifier: boolean): void}
}

export const Point: React.FC<ZoneProps> = ({feature, onClickHandler}) => {
  const { selection, time } = useAppContext()
  const { start: timeStart, end: timeEnd } = time
  const isSelected = selection.includes(feature.id as string)

  
  const location: [number, number] = useMemo(() => {
    const coords = feature.geometry.coordinates as Position
    const swapped: [number, number] = [coords[1], coords[0]]
    return swapped
  }, [feature])

  const color = useMemo(() => {
    const col = feature.properties?.color || 'blue';
    return isSelected ? '#aaa' : col;
  }, [feature, isSelected])

  const isVisible = useMemo(() => {
    return featureIsVisibleInPeriod(feature, timeStart, timeEnd)
  }, [feature, timeStart, timeEnd])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

  const name = feature.properties?.name || '';

  return (
    <>
    { isVisible && <CircleMarker key={'point-' + feature.id + '-' + color} radius={5} 
        fillColor={color} color={color} center={location} eventHandlers={{click: onclick}}>
        <Tooltip key={feature.id + '-tip-'} offset={[0, -20]} direction="center" opacity={1} permanent>
          {name}
        </Tooltip>
      </CircleMarker>}
    </>
  )
}

