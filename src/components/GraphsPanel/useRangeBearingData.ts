import { useMemo } from 'react'
import { Feature } from 'geojson'
import { BEARING_DATA, RANGE_DATA, rangeBearingCalc } from '../../helpers/calculations/rangeBearingCalc'

/**
 * Hook to manage range and bearing data calculations for the GraphsPanel
 */
export const useRangeBearingData = (liveFeatures: Feature[], primaryTrack: string) => {
  // Calculate range and bearing data
  const rangeBearingData = useMemo(() => {
    if (primaryTrack === '') return []
    return rangeBearingCalc.calculate(liveFeatures, primaryTrack)
  }, [liveFeatures, primaryTrack])

  // Filter for bearing data only
  const bearingData = useMemo(() => {
    return rangeBearingData.filter(d => d.extraProp === BEARING_DATA)
  }, [rangeBearingData])

  // Filter for range data only
  const rangeData = useMemo(() => {
    return rangeBearingData.filter(d => d.extraProp === RANGE_DATA)
  }, [rangeBearingData])

  return {
    bearingData,
    rangeData
  }
}
