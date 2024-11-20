import * as turf from "turf";
import { Feature, Geometry, Polygon } from "geojson";
import { LatLngExpression  } from 'leaflet'
import { Polyline as ReactPolygon, Tooltip } from 'react-leaflet'
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { SelectionState } from "../features/selection/selectionSlice";

export interface TrackProps {
  feature: Feature 
}

const Zone: React.FC<TrackProps> = ({feature}) => {
  const selectedFeaturesId = useAppSelector(state => state.selected.selected)
  const dispatch = useAppDispatch()
  const isSelected = selectedFeaturesId && selectedFeaturesId.includes(feature.id as string)

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

  const points = turf.featureCollection([turf.polygon((feature.geometry as Polygon).coordinates)])
  const centre = turf.center(points).geometry.coordinates.reverse() as LatLngExpression
  const trackCoords = (feature.geometry as Polygon).coordinates[0].map(item => [item[1], item[0]]) as LatLngExpression[]

  const onclick = () => {
    const payload: SelectionState = {selected: [feature.id as string]}
    dispatch({type: 'selection/selectionChanged', payload})
  }
  return (
    <>
      <ReactPolygon key={feature.id + '-line2' + isSelected} fill={true} positions={trackCoords} weight={2} 
        color={colorFor(feature)} eventHandlers={{click: onclick}} >
        <Tooltip position={centre} direction="center" opacity={1} permanent>
          {feature.properties?.name}
        </Tooltip>
      </ReactPolygon>  
    </>
  )
}

export default Zone
