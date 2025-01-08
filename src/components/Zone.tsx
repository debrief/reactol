import * as turf from "@turf/turf";
import { Feature, Geometry, Polygon } from "geojson";
import { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import { Polyline as ReactPolygon, Tooltip } from 'react-leaflet';
import { useCallback, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { featureIsVisibleInPeriod } from "../helpers/featureIsVisibleAtTime";

export interface ZoneProps {
  feature: Feature<Polygon> 
  onClickHandler: {(id: string, modifier: boolean): void}
}

const Zone: React.FC<ZoneProps> = ({feature, onClickHandler}) => {
  const { selection, time } = useAppContext()
  const { start: timeStart, end: timeEnd, filterApplied } = time
  const isSelected = selection.includes(feature.id as string)

  const isVisible = useMemo(() => {
    return filterApplied ? featureIsVisibleInPeriod(feature, timeStart, timeEnd) : true
  }, [feature, timeStart, timeEnd])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

  const lineWeight = useMemo(() => {
    return isSelected ? 4 : 2
  }, [isSelected])

  const colorFor = useCallback((feature: Feature<Geometry, unknown> | undefined): string => {
    if (feature) {
      const feat = feature as Feature
      if (feat.properties) {
        return feat.properties.color || '#ff0'
      }
    }
    return '#000';
  }, [feature])

  const polygon = useMemo(() => {
    const points = turf.featureCollection([turf.polygon((feature.geometry as Polygon).coordinates)])
    const centre = turf.center(points).geometry.coordinates.reverse() as LatLngExpression
    const trackCoords = (feature.geometry as Polygon).coordinates[0].map(item => [item[1], item[0]]) as LatLngExpression[]
    return <ReactPolygon key={feature.id + '-line-' + isSelected } fill={true} positions={trackCoords} weight={lineWeight} 
      color={colorFor(feature)} eventHandlers={{click: onclick}} fillOpacity={0.1} >
      <Tooltip position={centre} direction='center' opacity={1} permanent>
        {feature.properties?.name}
      </Tooltip>
      </ReactPolygon>  
  }, [feature, isSelected])

  return (
    <>
    { isVisible && polygon}
    </>
  )
}

export default Zone
