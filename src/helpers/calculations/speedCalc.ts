import { Calculation, GraphDataset } from "../../components/GraphModal";
import { Feature, MultiPoint } from 'geojson'
import { isTemporal } from "./latCalc";

export const speedCalc: Calculation = {
  label: 'Speed',
  value: 'speed',
  isRelative: false,
  calculate:(features: Feature[]): GraphDataset[] => {
    const temporal = features.filter(isTemporal)
    return temporal.map((feature) => {
      return {label: feature.properties?.name || feature.id, data: feature.properties?.times.map((time: number, index: number) => {
        const geom = feature.geometry as MultiPoint
        return {date: time, value: geom.coordinates[index][0]}
      })
    }
    })
  }
}
