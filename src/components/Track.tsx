import { Feature, Geometry, MultiPoint } from "geojson";
import { LatLngExpression  } from 'leaflet'
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { useAppSelector } from "../app/hooks";
import { format } from "date-fns";

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

  const timeFor = (feature: Feature, index: number): string => {
    if (feature.properties?.times) {
      const time = feature.properties.times[index]
      return format(time, "ddHHmm'Z'")
    } else {
      return ''
    }
  }
    
  
  const trackCoords = (feature.geometry as MultiPoint).coordinates.map(item => [item[1], item[0]]) as LatLngExpression[]

  return (
    <>
      <Polyline key={feature.id + '-line-' + isSelected} positions={trackCoords} weight={2} color={colorFor(feature)}>
        <Tooltip key={feature.id + '-tip-' + isSelected}  position={trackCoords[0]} direction="auto" opacity={1} permanent>
          {feature.properties?.name}
        </Tooltip>
      </Polyline>
      { trackCoords.map((item, index) => 
        <CircleMarker key={feature.id + '-point-' + index} center={item} radius={3} color={colorFor(feature)}>
          {feature.properties?.times && <Tooltip  key={feature.id + '-tip-' + index} offset={[0, -20]} direction="center" opacity={1} permanent>
            {timeFor(feature, index)}
          </Tooltip>}
         </CircleMarker> )}
    </>
  )
}

export default Track