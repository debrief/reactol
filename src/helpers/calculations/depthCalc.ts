import { Feature, LineString } from 'geojson'
import { isTemporal } from '../trackCalculations'
import { Calculation, GraphDataset } from '../../types'

export const depthCalc: Calculation = {
  label: 'Depth',
  value: 'depth',
  isRelative: false,
  calculate:(features: Feature[]): GraphDataset[] => {
    const temporal = features.filter(isTemporal)

    // filter to tracks
    const tracks = temporal.filter((feature) => feature.geometry?.type === 'LineString')

    // filter to tracks with depths
    const withDepth = tracks.filter((feature) => {
      const lineString = feature as Feature<LineString>
      const hasPoints = lineString.geometry?.coordinates.length > 0
      if (hasPoints) {
        return lineString.geometry.coordinates[0].length === 3
      }
      return false
    })

    return withDepth.map((feature) => {
      const name = feature.properties?.name || feature.id

      return {label: name + '  Depth', color: feature.properties?.stroke || undefined, data: feature.properties?.times.map((time: number, index: number) => {
        const lineString = feature as Feature<LineString>
        const coords = lineString.geometry?.coordinates
        return {date: new Date(time).getTime(), value: coords[index][2]}}), featureName: name}
    })
  }
}

