import { useMemo } from 'react'
import { Feature, GeoJsonProperties, Geometry, LineString } from 'geojson'
import { featureIsVisibleInPeriod } from '../../../helpers/featureIsVisibleAtTime'
import { depthCalc } from '../../../helpers/calculations/depthCalc'
import { BEARING_DATA, RANGE_DATA, rangeBearingCalc } from '../../../helpers/calculations/rangeBearingCalc'

export type TimeFilter = {
  filterApplied: boolean
  start: number
  end: number
}

export const filteredTrack = (feature: Feature<Geometry, GeoJsonProperties>, start: number, end: number): Feature<Geometry, GeoJsonProperties> => {
  if (feature.properties?.dataType === 'track') {
    const lineFeature = feature as Feature<LineString, GeoJsonProperties>
    if (!feature.properties?.times) {
      return feature
    }
    let startIndex = -1, endIndex = 0
    const times = feature.properties.times
    for (let i = 0; i < times.length; i++) {
      const time = new Date(times[i]).getTime()
      if (startIndex === -1 && time >= start && time <= end) {
        startIndex = i
      }
      if (time > start && time <= end) {
        endIndex = i
      }
    }
    const res: Feature<LineString, GeoJsonProperties> = {
      ...lineFeature,
      properties: {
        ...feature.properties,
        times: feature.properties.times.slice(startIndex, endIndex + 1),
        speeds: feature.properties.speeds.slice(startIndex, endIndex + 1),
        courses: feature.properties.courses.slice(startIndex, endIndex + 1),
      },
      geometry: {
        type: 'LineString',
        coordinates: lineFeature.geometry.coordinates.slice(startIndex, endIndex + 1)
      }
    }
    return res
  } else {
    return feature
  }
}

export const useGraphData = (
  featuresToPlot: Feature<Geometry, GeoJsonProperties>[],
  time: TimeFilter,
  filterForTime: boolean,
  showDepth: boolean,
  primaryTrack: string
) => {
  // Get live features based on time filter
  const liveFeatures = useMemo(() => {
    if (time && time.filterApplied && filterForTime) {
      const result = featuresToPlot.filter(feature =>
        featureIsVisibleInPeriod(feature, time.start, time.end)
      ).map(feature => filteredTrack(feature, time.start, time.end))
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

  // Check if depth data is present
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
    const res = rangeBearingCalc.calculate(liveFeatures, primaryTrack)
    return res
  }, [liveFeatures, primaryTrack])

  // Filter bearing data
  const bearingData = useMemo(() => {
    return rangeBearingData.filter(d => d.extraProp === BEARING_DATA)
  }, [rangeBearingData])

  // Filter range data
  const rangeData = useMemo(() => {
    return rangeBearingData.filter(d => d.extraProp === RANGE_DATA)
  }, [rangeBearingData])

  // Combine data for main chart
  const mainData = useMemo(() => {
    const res = [...bearingData, ...rangeData]
    return res
  }, [bearingData, rangeData])

  return {
    liveFeatures,
    depthData,
    depthPresent,
    bearingData,
    rangeData,
    mainData
  }
}
