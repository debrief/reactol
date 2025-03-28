import { useMemo, useState, useEffect } from 'react'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { getFeatureIcon } from '../../../helpers/getFeatureIcon'
import { BACKDROP_TYPE } from '../../../constants'

export type OptionType = {
  label: string
  value: string
  dataType: string
  icon: React.ReactNode
}

export const useTrackOptions = (features: Feature<Geometry, GeoJsonProperties>[]) => {
  const [primaryTrack, setPrimaryTrack] = useState<string>('')
  const [secondaryTracks, setSecondaryTracks] = useState<string[]>([])
  const [tempSecondaryTracks, setTempSecondaryTracks] = useState<string[]>([])

  // Generate feature options
  const featureOptions: OptionType[] = useMemo(() => {
    return features.map((feature): OptionType => {
      const dataType = feature.properties?.dataType
      const color = feature.properties?.stroke || feature.properties?.color || feature.properties?.['marker-color']
      const environment = feature.properties?.env
      const icon = getFeatureIcon({ dataType, color, environment })
      return {
        label: feature.properties?.shortName || feature.properties?.name || feature.id,
        value: feature.id as string,
        dataType: feature.properties?.dataType as string,
        icon
      }
    })
  }, [features])

  // Initialize primary track if not set
  useEffect(() => {
    if (!primaryTrack) {
      setPrimaryTrack(features.find(feature => feature.properties?.dataType === 'track')?.id as string || '')
    }
  }, [features, primaryTrack])

  // Initialize secondary tracks if empty
  useEffect(() => {
    if (!secondaryTracks.length) {
      setSecondaryTracks(features.filter(feature => feature.properties?.dataType === 'track').map(feature => feature.id as string))
    }
  }, [features, secondaryTracks])

  // Filter track options
  const trackOptions: OptionType[] = useMemo(() =>
    featureOptions.filter((feature) => feature.dataType === 'track')
  , [featureOptions])

  // Filter secondary options
  const secondaryOptions = useMemo(() => 
    featureOptions.filter(track => track.value !== primaryTrack).filter(feature => feature.dataType !== BACKDROP_TYPE)
  , [primaryTrack, featureOptions])

  // Filter features to plot
  const featuresToPlot = useMemo(() => 
    features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )
  , [primaryTrack, secondaryTracks, features])

  return {
    primaryTrack,
    setPrimaryTrack,
    secondaryTracks,
    setSecondaryTracks,
    tempSecondaryTracks,
    setTempSecondaryTracks,
    featureOptions,
    trackOptions,
    secondaryOptions,
    featuresToPlot
  }
}
