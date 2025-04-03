import { useMemo } from 'react'
import { Feature, LineString, GeoJsonProperties, Geometry } from 'geojson'
import { depthCalc } from '../../helpers/calculations/depthCalc'
import { BEARING_DATA, RANGE_DATA, rangeBearingCalc } from '../../helpers/calculations/rangeBearingCalc'
import { GraphDataset } from '../../types'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { filterTrackDataToPeriod } from '../../helpers/filterTrackDataToPeriod'
import { useAppSelector } from '../../state/hooks'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { useDocContext } from '../../state/DocContext'

interface UseGraphDataProps {
  primaryTrack: string
  secondaryTracks: string[]
  showDepth: boolean
  filterForTime: boolean
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
export const useGraphData = ({ primaryTrack, secondaryTracks, showDepth, filterForTime }: UseGraphDataProps): GraphData => {

  const { time } = useDocContext()

  // Get all features from the store
  const features = useAppSelector(selectFeatures)

  // Filter features to only include the primary track and selected secondary tracks
  const featuresToPlot = useMemo(() => 
    features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )
  , [primaryTrack, secondaryTracks, features])

  // Apply time filtering if needed
  const liveFeatures: Feature<Geometry, GeoJsonProperties>[] = useMemo(() => {
    if (time && time.filterApplied && filterForTime) {
      const result = featuresToPlot.filter(feature =>
        featureIsVisibleInPeriod(feature, time.start, time.end)
      ).map(feature => filterTrackDataToPeriod(feature, time.start, time.end))
      return result
    } else {
      return featuresToPlot
    }
  }, [featuresToPlot, time, filterForTime])
  
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
