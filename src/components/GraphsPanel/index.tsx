import {  useEffect, useMemo, useState } from 'react'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { useAppSelector } from '../../state/hooks'
import { Splitter } from 'antd'
import { useAppContext } from '../../state/AppContext'
import { ReferenceArea } from 'recharts'
import { useDocContext } from '../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { BACKDROP_TYPE } from '../../constants'
import { useGraphData } from './useGraphData'
import { FeatureSelectorModal } from './FeatureSelectorModal'
import { featureAsOption, OptionType } from './featureUtils'
import { filterTrackDataToPeriod } from '../../helpers/filterTrackDataToPeriod'
import { GraphsToolbar } from './GraphsToolbar'
import { DepthChart } from './DepthChart'
import { RangeBearingChart } from './RangeBearingChart'

export const GraphsPanel: React.FC<{height: number | null, width: number | null}> = ({height, width}) => {
  const features = useAppSelector(selectFeatures)
  const { time } = useDocContext()
  const { isDarkMode } = useAppContext()
  const [showDepth, setShowDepth] = useState<boolean>(false)
  const [showLegend, setShowLegend] = useState<boolean>(true)
  const [filterForTime, setFilterForTime] = useState<boolean>(false)
  const [primaryTrack, setPrimaryTrack] = useState<string>('')
  const [secondaryTracks, setSecondaryTracks] = useState<string[]>([])
  const [splitterHeights, setSplitterHeights] = useState<[number, number] | null>(null)
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false)
  const [showTooltip, setShowTooltip] = useState<boolean>(true)
  const [calculatedPlotHeight, setCalculatedPlotHeight] = useState<number | null>(null)

  useEffect(() => {
    // set the first track as the primary
    setPrimaryTrack(features.find(feature => feature.properties?.dataType === 'track')?.id as string)
  }, [features])

  useEffect(() => {
    // select all non-primary tracks as the secondary
    setSecondaryTracks(features.filter(feature => feature.id !== primaryTrack).filter(feature => feature.properties?.dataType === 'track').map(feature => feature.id as string))
  }, [features, primaryTrack])

  const referenceAreaDepth = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return <ReferenceArea yAxisId="course" x1={time?.start} x2={time?.end} y1={0} y2={360} stroke="#777" />
    }
    return null
  }, [time, filterForTime])

  const referenceAreaRangeBearing = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return <ReferenceArea yAxisId="bearing" x1={time?.start} x2={time?.end} y1={0} y2={360} stroke="#777" />
    }
    return null
  }, [time, filterForTime])

  // Toolbar button styles are now handled in the GraphsToolbar component

  const primaryTrackOptions: OptionType[] = useMemo(() =>
    features.filter((feature) => feature.properties?.dataType === 'track').map((feature) => featureAsOption(feature))
  , [features])

  const featuresToPlot = useMemo(() => 
    features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )
  , [primaryTrack, secondaryTracks, features])

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

  // Use the custom hook to calculate all graph data
  const { depthData, bearingData, rangeData, depthPresent } = useGraphData({
    liveFeatures,
    primaryTrack,
    showDepth
  })

  const fontSize = 12
  
  // Theme colors based on dark mode
  const themeColors = useMemo(() => ({
    text: isDarkMode ? '#f0f0f0' : '#333333',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    background: isDarkMode ? '#2a2a2a' : '#ffffff',
    tooltip: {
      background: isDarkMode ? '#333333' : '#ffffff',
      text: isDarkMode ? '#f0f0f0' : '#333333',
      border: isDarkMode ? '#444444' : '#cccccc'
    }
  }), [isDarkMode])

  // Legend data is now handled directly by Recharts Legend component

  const handleSplitterResize = (sizes: number[]) => {
    setSplitterHeights(sizes as [number, number])
  }

  // Calculate the initial relativePlotHeight based on current conditions
  const initialPlotHeight = useMemo(() => {
    if (depthData.length > 0) {
      return (splitterHeights?.[1] || 200)
    } else {
      return (height || 300) - 60 
    }
  }, [height, splitterHeights, depthData])
  
  // Use the calculated height or the state value
  const relativePlotHeight = calculatedPlotHeight ?? initialPlotHeight
  
  // Set the plot height when the component has finished loading
  useEffect(() => {
    if (height !== null && width !== null) {
      // Component has loaded with dimensions
      if (depthData.length > 0) {
        // If we have depth data, use the splitter height
        setCalculatedPlotHeight(splitterHeights?.[1] || 200)
      } else {
        // Otherwise use the available space
        setCalculatedPlotHeight((height || 300) - 60)
      }
    }
  }, [height, width, depthData.length, splitterHeights])

  console.log('panel secondaries', secondaryTracks)

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
      gap: '16px'
    }}>
      <div>
        <GraphsToolbar
          primaryTrack={primaryTrack}
          setPrimaryTrack={setPrimaryTrack}
          primaryTrackOptions={primaryTrackOptions}
          showDepth={showDepth}
          setShowDepth={setShowDepth}
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
          filterForTime={filterForTime}
          setFilterForTime={setFilterForTime}
          depthPresent={depthPresent}
          timeFilterApplied={time.filterApplied}
          openSecondarySelector={() => setIsTransferModalVisible(true)}
        />
        <FeatureSelectorModal
          isOpen={isTransferModalVisible}
          title="Manage Secondary Tracks"
          onSave={setSecondaryTracks}
          onClose={() => setIsTransferModalVisible(false)}
          features={features.filter(feature => feature.id !== primaryTrack).filter(feature => feature.properties?.dataType !== BACKDROP_TYPE)}
          defaults={secondaryTracks}
        />
      </div>
      <Splitter layout='vertical' onResize={handleSplitterResize}>
        {depthData.length > 0 && (
          <Splitter.Panel>
            <DepthChart
              depthData={depthData}
              height={splitterHeights?.[0] || 200}
              themeColors={themeColors}
              showTooltip={showTooltip}
              showLegend={showLegend}
              referenceArea={referenceAreaDepth}
              fontSize={fontSize}
            />
          </Splitter.Panel>
        )}
        {bearingData.length > 0 && rangeData.length > 0 && (
          <Splitter.Panel>
            <RangeBearingChart
              rangeData={rangeData}
              bearingData={bearingData}
              height={relativePlotHeight}
              themeColors={themeColors}
              showTooltip={showTooltip}
              showLegend={showLegend}
              referenceArea={referenceAreaRangeBearing}
              fontSize={fontSize}
            />
          </Splitter.Panel>
        )}
      </Splitter>

     
    </div>
  )
}