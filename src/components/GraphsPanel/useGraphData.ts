import { useMemo } from 'react'
import { Feature, LineString } from 'geojson'
import { depthCalc } from '../../helpers/calculations/depthCalc'
import { BEARING_DATA, RANGE_DATA, rangeBearingCalc } from '../../helpers/calculations/rangeBearingCalc'
import { GraphDataset } from '../../types'

interface UseGraphDataProps {
  liveFeatures: Feature[]
  primaryTrack: string
  showDepth: boolean
}

interface GraphData {
  depthData: GraphDataset[]
  bearingData: GraphDataset[]
  rangeData: GraphDataset[]
  depthPresent: boolean
}

/**
 * Custom hook to calculate graph data for depth, range and bearing
 */
export const useGraphData = ({ liveFeatures, primaryTrack, showDepth }: UseGraphDataProps): GraphData => {
  // Calculate depth data
  const depthData = useMemo(() => {
    if (showDepth) {
      return depthCalc.calculate(liveFeatures)
    } else {
      return []
    }
  }, [liveFeatures, showDepth])

  // Check if depth data is present in any track
  const depthPresent = useMemo(() => {
    const tracks = liveFeatures.filter((feature) => feature.geometry?.type === 'LineString')

    // filter to tracks with depths
    const withDepth = tracks.filter((feature) => {
      const lineString = feature as Feature<LineString>
      const hasPoints = lineString.geometry?.coordinates.length > 0
      if (hasPoints) {
        return lineString.geometry.coordinates[0].length === 3
      }
      return false
    })
    return withDepth.length > 0
  }, [liveFeatures])

  // Calculate range and bearing data
  const rangeBearingData = useMemo(() => {
    if (primaryTrack === '') return []
    return rangeBearingCalc.calculate(liveFeatures, primaryTrack)
  }, [liveFeatures, primaryTrack])

  // Filter for bearing data
  const bearingData = useMemo(() => {
    return rangeBearingData.filter(d => d.extraProp === BEARING_DATA)
  }, [rangeBearingData])

  // Filter for range data
  const rangeData = useMemo(() => {
    return rangeBearingData.filter(d => d.extraProp === RANGE_DATA)
  }, [rangeBearingData])

  return {
    depthData,
    bearingData,
    rangeData,
    depthPresent
  }
}
