import { Feature, Point } from "geojson";
import { PointProps } from "../../types";


export interface PointFormProps {
  point: Feature<Point, PointProps>
}

export const PointForm: React.FC<PointFormProps> = ({point}) => {
  return (
    <div>
      <h1>{point.properties.name}</h1>
      <p>Coordinates: {point.geometry.coordinates[0]}, {point.geometry.coordinates[1]}</p>
    </div>
  )
}