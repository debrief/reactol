import React, { useState, ReactNode, useEffect } from 'react'
import { useAppSelector } from '../../state/hooks'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { featureAsOption, OptionType } from './featureUtils'
import { GraphsContext } from './GraphsContext'

export const GraphsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const features = useAppSelector(selectFeatures)
  
  // State that was previously in GraphsPanel
  const [showDepth, setShowDepth] = useState<boolean>(false)
  const [showLegend, setShowLegend] = useState<boolean>(true)
  const [filterForTime, setFilterForTime] = useState<boolean>(false)
  const [primaryTrack, setPrimaryTrack] = useState<string>('')
  const [secondaryTracks, setSecondaryTracks] = useState<string[]>([])
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false)
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  // Calculate primary track options
  const primaryTrackOptions: OptionType[] = React.useMemo(() =>
    features.filter((feature) => feature.properties?.dataType === 'track')
      .map((feature) => featureAsOption(feature))
  , [features])

  useEffect(() => {
    // set the first track as the primary
    setPrimaryTrack(features.find(feature => feature.properties?.dataType === 'track')?.id as string)
  }, [features])

  useEffect(() => {
    // select all non-primary tracks as the secondary
    setSecondaryTracks(features
      .filter(feature => feature.id !== primaryTrack)
      .filter(feature => feature.properties?.dataType === 'track')
      .map(feature => feature.id as string))
  }, [features, primaryTrack])

  const value = {
    // State values
    showDepth,
    showLegend,
    filterForTime,
    primaryTrack,
    secondaryTracks,
    isTransferModalVisible,
    showTooltip,
    primaryTrackOptions,
    
    // State setters
    setShowDepth,
    setShowLegend,
    setFilterForTime,
    setPrimaryTrack,
    setSecondaryTracks,
    setIsTransferModalVisible,
    setShowTooltip
  }

  return <GraphsContext.Provider value={value}>{children}</GraphsContext.Provider>
}
