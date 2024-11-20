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
      const name = feature.properties?.name || feature.id

      return {label: name + ' Speed', data: feature.properties?.times.map((time: number, index: number) => {
        const geom = feature.geometry as MultiPoint
        return {date: new Date(time).getTime(), value: Math.abs(geom.coordinates[index][0])}
      })
    }
    })
  }
}
