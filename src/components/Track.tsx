import { Feature, Geometry, MultiPoint } from "geojson";
import { LatLngExpression  } from 'leaflet'
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { format } from "date-fns";
import { useMemo } from "react";
import { SelectionState } from "../features/selection/selectionSlice";

export interface TrackProps {
  feature: Feature 
}

interface CoordInstance {
  pos: LatLngExpression
  time: string
}

const Track: React.FC<TrackProps> = ({feature}) => {
  const selectedFeatureId = useAppSelector(state => state.selected.selected)
  const isSelected = feature.id === selectedFeatureId
  const {limits} = useAppSelector(state => state.time)
  const dispatch = useAppDispatch()

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
  
  const trackCoords = useMemo(() => {
    if (limits && feature.properties?.times) {
      const coords = (feature.geometry as MultiPoint).coordinates
      const times = feature.properties.times
      const validCoords: CoordInstance[] = []
      const inRange = (time: string, limits: [number, number]): boolean => {
        const timeVal = new Date(time).getTime()
        return timeVal >= limits[0] && timeVal <= limits[1]
      }
      times.forEach((time: string, index: number) => {
        if(inRange(time, limits)) {
          validCoords.push({pos:[coords[index][1], coords[index][0]],time: format(time, "ddHHmm'Z'") })
        }
      })
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

  const onclick = () => {
    const payload: SelectionState = {selected: [feature.id as string]}
    dispatch({type: 'selection/selectionChanged', payload})
  }

  return (
    <>
      <Polyline key={feature.id + '-line-' + isSelected} eventHandlers={{click: onclick}} positions={trackCoords.map((val: CoordInstance) => val.pos)} weight={2} color={colorFor(feature)}/>
      { trackCoords.length && <Polyline key={feature.id + '-start-line-' + isSelected} positions={[trackCoords[0].pos]} weight={2} color={colorFor(feature)}>
        <Tooltip key={feature.id + '-start-name-' + isSelected} 
          direction='left' opacity={1} permanent>{feature.properties?.name}</Tooltip>
      </Polyline> }
      { trackCoords.map((item: CoordInstance, index: number) => 
        <CircleMarker key={feature.id + '-point-' + index} center={item.pos} radius={3} color={colorFor(feature)} eventHandlers={{click: onclick}}>
          {feature.properties?.times && <Tooltip  key={feature.id + '-tip-' + index} offset={[0, -20]} direction="center" opacity={1} permanent>
            {item.time}
          </Tooltip>}
        </CircleMarker> )}
    </>
  )
}

export default Track
