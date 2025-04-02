import { useMemo } from 'react'
import { Feature, LineString } from 'geojson'
import { depthCalc } from '../../helpers/calculations/depthCalc'

/**
 * Hook to manage depth data calculations for the GraphsPanel
 */
export const useDepthData = (liveFeatures: Feature[], showDepth: boolean) => {
  // Calculate depth data if needed
  const depthData = useMemo(() => {
    if (showDepth) {
      return depthCalc.calculate(liveFeatures)
    } else {
      return []
    }
  }, [liveFeatures, showDepth])

  // Check if depth data is present in any of the features
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

  return {
    depthData,
    depthPresent
  }
}
