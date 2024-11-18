import { Feature, Geometry, MultiPoint } from "geojson";
import { LatLngExpression  } from 'leaflet'
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { useAppSelector } from "../app/hooks";

export interface TrackProps {
  feature: Feature 
}

const Track: React.FC<TrackProps> = ({feature}) => {
  const selectedFeatureId = useAppSelector(state => state.selected.selected)
  const isSelected = feature.id === selectedFeatureId

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
  
  const trackCoords = (feature.geometry as MultiPoint).coordinates.map(item => [item[1], item[0]]) as LatLngExpression[]

  return (
    <>
      <Polyline key={feature.id + '-line-' + isSelected} positions={trackCoords} weight={2} color={colorFor(feature)}>
        <Tooltip position={trackCoords[0]} direction="auto" opacity={1} permanent>
          {feature.properties?.name}
        </Tooltip>

        </Polyline>
      { trackCoords.map((item, index) => 
        <CircleMarker key={feature.id + '-point-' + index} center={item} radius={3} color={colorFor(feature)} /> )}
    </>
  )
}

export default Track