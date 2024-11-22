import { Calculation, GraphDataset } from "../../components/GraphModal";
import { Feature, MultiPoint } from 'geojson'

export const isTemporal = (feature: Feature): boolean => {
  return !!feature.properties?.times
}

export const latCalc: Calculation = {
  label: 'Latitude',
  value: 'lat',
  isRelative: false,
  calculate:(features: Feature[]): GraphDataset[] => {
    const temporal = features.filter(isTemporal)
    return temporal.map((feature) => {
      const name = feature.properties?.name || feature.id
      return {label: name + ' Latitude', color: feature.properties?.color || undefined, data: feature.properties?.times.map((time: number, index: number) => {
        const geom = feature.geometry as MultiPoint
        return {date: new Date(time).getTime(), value: geom.coordinates[index][1]}
      })}
    })
  }
}