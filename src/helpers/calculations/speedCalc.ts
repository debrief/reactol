import { Calculation, GraphDataset } from '../../components/GraphModal'
import { Feature } from 'geojson'
import { isTemporal } from '../trackCalculations'

export const speedCalc: Calculation = {
  label: 'Speed',
  value: 'speed',
  isRelative: false,
  calculate:(features: Feature[]): GraphDataset[] => {
    const temporal = features.filter(isTemporal)
    // filter to tracks with speeds
    const withSpeed = temporal.filter((feature) => feature.properties?.speeds?.length > 1)

    return withSpeed.map((feature) => {
      const name = feature.properties?.name || feature.id


      return {label: name + ' Speed', color: feature.properties?.color || undefined, data: feature.properties?.times.map((time: number, index: number) => {
        return {date: new Date(time).getTime(), value: feature.properties?.speeds[index]}})}
    })
  }
}

