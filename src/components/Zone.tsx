import * as turf from "turf";
import { Feature, Geometry, Polygon } from "geojson";
import { LatLngExpression  } from 'leaflet'
import { Polyline as ReactPolygon, Tooltip } from 'react-leaflet'
import { useAppSelector } from "../app/hooks";

export interface TrackProps {
  feature: Feature 
}

const Zone: React.FC<TrackProps> = ({feature}) => {
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

  const points = turf.featureCollection([turf.polygon((feature.geometry as Polygon).coordinates)])
  const centre = turf.center(points).geometry.coordinates.reverse() as LatLngExpression
  const trackCoords = (feature.geometry as Polygon).coordinates[0].map(item => [item[1], item[0]]) as LatLngExpression[]

  return (
    <>
      <ReactPolygon key={feature.id + '-line2' + isSelected} fill={true} positions={trackCoords} weight={2} color={colorFor(feature)} >
        <Tooltip position={centre} direction="center" opacity={1} permanent>
          {feature.properties?.name}
        </Tooltip>
      </ReactPolygon>  
    </>
  )
}

export default Zone