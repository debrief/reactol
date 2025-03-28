import { useState, useMemo } from 'react'
import { TimeFilter } from './useGraphData'

export const useUIControls = (
  isDarkMode: boolean,
  time: TimeFilter,
  height: number | null
) => {
  // UI state
  const [showDepth, setShowDepth] = useState<boolean>(false)
  const [showLegend, setShowLegend] = useState<boolean>(true)
  const [filterForTime, setFilterForTime] = useState<boolean>(false)
  const [splitterHeights, setSplitterHeights] = useState<[number, number] | null>(null)
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false)
  const [showTooltip, setShowTooltip] = useState<boolean>(true)

  // Font size for charts
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

  // Reference areas for time filter visualization
  const referenceAreaTop = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return { x1: time?.start, x2: time?.end, y1: 0, y2: 360 }
    }
    return null
  }, [time, filterForTime])

  const referenceAreaBottom = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return { x1: time?.start, x2: time?.end, y1: 0, y2: 360 }
    }
    return null
  }, [time, filterForTime])

  // Handle splitter resize
  const handleSplitterResize = (sizes: number[]) => {
    setSplitterHeights(sizes as [number, number])
  }

  // Calculate relative plot height
  const relativePlotHeight = useMemo(() => {
    const depthPresent = splitterHeights !== null
    if (depthPresent) {
      return (splitterHeights?.[1] || 200)
    } else {
      return (height || 300) - 60 
    }
  }, [height, splitterHeights])

  return {
    // State
    showDepth,
    setShowDepth,
    showLegend,
    setShowLegend,
    filterForTime,
    setFilterForTime,
    splitterHeights,
    isTransferModalVisible,
    setIsTransferModalVisible,
    showTooltip,
    setShowTooltip,
    
    // UI helpers
    fontSize,
    themeColors,
    referenceAreaTop,
    referenceAreaBottom,
    handleSplitterResize,
    relativePlotHeight,
    
    // Constants
    buttonStyle: { margin: '0 1px' }
  }
}
