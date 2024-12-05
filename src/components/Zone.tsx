import * as turf from "turf";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon"
import { Feature, Geometry, Polygon, Position } from "geojson";
import { LatLngExpression, LeafletMouseEvent  } from 'leaflet'
import { Polyline as ReactPolygon, Tooltip } from 'react-leaflet'
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { featureIsVisibleInPeriod } from "../helpers/featureIsVisibleAtTime";

export interface ZoneProps {
  feature: Feature<Polygon> 
  onClickHandler: {(id: string, modifier: boolean): void}
}

const Zone: React.FC<ZoneProps> = ({feature, onClickHandler}) => {
  const { selection, time, currentLocations } = useAppContext()
  const { start: timeStart, end: timeEnd } = time
  const isSelected = selection.includes(feature.id as string)
  const lastTimeHandled = useRef<number | null>(null)
  const [containsVehicle, setContainsVehicle] = useState<boolean>(false)

  useEffect(() => {
    if (lastTimeHandled.current !== time.current) {
      lastTimeHandled.current = time.current
      setContainsVehicle(currentLocations.some(loc => {
        const point = loc.geometry.coordinates as Position
        const poly = feature as Feature<Polygon>
        const res = booleanPointInPolygon(point, poly)
        return res
      }))
    }
  }, [currentLocations, time, feature, lastTimeHandled])

  const isVisible = useMemo(() => {
    return featureIsVisibleInPeriod(feature, timeStart, timeEnd)
  }, [feature, timeStart, timeEnd])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

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

  const polygon = useMemo(() => {
    const points = turf.featureCollection([turf.polygon((feature.geometry as Polygon).coordinates)])
    const centre = turf.center(points).geometry.coordinates.reverse() as LatLngExpression
    const trackCoords = (feature.geometry as Polygon).coordinates[0].map(item => [item[1], item[0]]) as LatLngExpression[]
    return <ReactPolygon key={feature.id + '-line-' + isSelected + '-' + containsVehicle} fill={true} positions={trackCoords} weight={containsVehicle ? 4 : 2} 
      color={colorFor(feature)} eventHandlers={{click: onclick}} fillOpacity={containsVehicle ? 0.3 : 0.1} >
      <Tooltip position={centre} direction="center" opacity={1} permanent>
        {feature.properties?.name}
      </Tooltip>
      </ReactPolygon>  
  }, [feature, containsVehicle, isSelected])

  return (
    <>
    { isVisible && polygon}
    </>
  )
}

export default Zone
