import { useEffect, useMemo, useState } from 'react'
import { Splitter } from 'antd'
import { useAppContext } from '../../state/AppContext'

import { useGraphData } from './useGraphData'
import { GraphsToolbar } from './GraphsToolbar'
import { DepthChart } from './DepthChart'
import { RangeBearingChart } from './RangeBearingChart'
import { GraphsProvider } from './GraphsContextProvider'
import { useGraphsContext } from './useGraphsContext'

export const GraphsPanel: React.FC<{height: number | null, width: number | null}> = (props) => {
  return (
    <GraphsProvider>
      <GraphsPanelContent {...props} />
    </GraphsProvider>
  )
}

const GraphsPanelContent: React.FC<{height: number | null, width: number | null}> = ({height, width}) => {
  const { isDarkMode } = useAppContext()
  const {
    showDepth,
    showLegend,
    filterForTime,
    primaryTrack,
    secondaryTracks,
    showTooltip
  } = useGraphsContext()
  
  const [splitterHeights, setSplitterHeights] = useState<[number, number] | null>(null)
  const [calculatedPlotHeight, setCalculatedPlotHeight] = useState<number | null>(null)

  // These effects are now in GraphsContext

  // Reference areas are now handled in the chart components

  // Toolbar button styles are now handled in the GraphsToolbar component

  // Primary track options are now in GraphsContext

  // Use the custom hook to calculate all graph data
  const { depthData, bearingData, rangeData, depthPresent } = useGraphData({
    primaryTrack,
    secondaryTracks,
    showDepth,
    filterForTime,
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
          depthPresent={depthPresent}
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
              fontSize={fontSize}
            />
          </Splitter.Panel>
        )}
      </Splitter>

     
    </div>
  )
}