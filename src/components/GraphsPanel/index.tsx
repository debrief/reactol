import {  useEffect, useMemo, useState } from 'react'
import { Feature, GeoJsonProperties, Geometry, LineString } from 'geojson'
import { useAppSelector } from '../../state/hooks'
import { Select, Space, Splitter, Button, Tooltip as ATooltip } from 'antd'
import { useAppContext } from '../../state/AppContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts'
import {
  FilterOutlined,
  FilterFilled} from '@ant-design/icons'
import { toShortDTG } from '../../helpers/toDTG'
import { useDocContext } from '../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { depthCalc } from '../../helpers/calculations/depthCalc'
import { FeatureIcon } from '../Layers/FeatureIcon'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { BACKDROP_TYPE } from '../../constants'
import { useGraphData } from './useGraphData'
import { FeatureSelectorModal } from './FeatureSelectorModal'

type OptionType = {
  label: string
  value: string
  dataType: string
  icon: React.ReactNode
}

const filteredTrack = (feature: Feature<Geometry, GeoJsonProperties>, start: number, end: number): Feature<Geometry, GeoJsonProperties> => {
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

const optionTypeFor: (feature: Feature) => OptionType = (feature: Feature) => ({
  label: feature.properties?.shortName || feature.properties?.name || feature.id,
  value: feature.id as string,
  dataType: feature.properties?.dataType as string,
  icon: <FeatureIcon dataType={feature.properties?.dataType} color={feature.properties?.stroke || feature.properties?.color || feature.properties?.['marker-color']} environment={feature.properties?.env} />
})

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
    setPrimaryTrack(features.find(feature => feature.properties?.dataType === 'track')?.id as string)
  }, [features])

  useEffect(() => {
    setSecondaryTracks(features.filter(feature => feature.id !== primaryTrack).filter(feature => feature.properties?.dataType === 'track').map(feature => feature.id as string))
  }, [features, primaryTrack])

  const referenceAreaTop = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return <ReferenceArea yAxisId="course" x1={time?.start} x2={time?.end} y1={0} y2={360} stroke="#777" />
    }
    return null
  }, [time, filterForTime])

  const referenceAreaBottom = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return <ReferenceArea yAxisId="bearing" x1={time?.start} x2={time?.end} y1={0} y2={360} stroke="#777" />
    }
    return null
  }, [time, filterForTime])

  const buttonStyle = { margin: '0 1px' }

  const primaryTrackOptions: OptionType[] = useMemo(() =>
    features.filter((feature) => feature.properties?.dataType === 'track').map((feature) => optionTypeFor(feature))
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
      ).map(feature => filteredTrack(feature, time.start, time.end))
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
        <Space align='center'>
          <ATooltip title="Select primary track">
            Primary:
            <Select
              placeholder="Primary Track"
              style={{ width: 100 }}
              value={primaryTrack}
              size="small"
              onChange={setPrimaryTrack}
              options={primaryTrackOptions}
              optionRender={option => (
                <Space>
                  {(option as unknown as OptionType).icon}
                  {option.label}
                </Space>
              )}
              labelRender={option => (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(option as OptionType).icon}
                  {option.label}
                </span>
              )}
            />
          </ATooltip>
          <ATooltip title="Manage secondary items">
            <Button onClick={() => setIsTransferModalVisible(true)}>
              Secondary items:
            </Button>
          </ATooltip>
          
          <FeatureSelectorModal
            isOpen={isTransferModalVisible}
            title="Manage Secondary Tracks"
            onSave={setSecondaryTracks}
            onClose={() => setIsTransferModalVisible(false)}
            features={features.filter(feature => feature.id !== primaryTrack).filter(feature => feature.properties?.dataType !== BACKDROP_TYPE)}
            defaults={secondaryTracks}
          />
          <ATooltip title={depthPresent ? (showDepth ? 'Hide depth' : 'Show depth') : 'No selected tracks contain depth data'}>
            <Button disabled={!depthPresent} style={buttonStyle} color={showDepth ? 'primary' : 'default'} variant={showDepth ? 'solid' : 'outlined'} onClick={() => setShowDepth(!showDepth)} className={showDepth ? 'fg-profile' : 'fg-profile-o'}></Button>
          </ATooltip>
          <ATooltip title={showLegend ? 'Hide legend' : 'Show legend'}>
            <Button style={buttonStyle} color={showLegend ? 'primary' : 'default'} variant={showLegend ? 'solid' : 'outlined'} onClick={() => setShowLegend(!showLegend)} className={showLegend ? 'fg-map-legend' : 'fg-map-legend-o'}></Button>
          </ATooltip>
          <ATooltip title={showTooltip ? 'Hide tooltips' : 'Show tooltips'}>
            <Button style={buttonStyle} color={showTooltip ? 'primary' : 'default'} variant={showTooltip ? 'solid' : 'outlined'} onClick={() => setShowTooltip(!showTooltip)} className={'fg-measure-line'}></Button>
          </ATooltip>
          <ATooltip
            mouseEnterDelay={0.8}
            title={time.filterApplied ? 'Trim graphs to current time filter' : 'No time filter applied'}
          >
            <Button
              style={buttonStyle}
              disabled={!time.filterApplied}
              color={filterForTime ? 'primary' : 'default'} 
              variant={filterForTime ? 'solid' : 'outlined'}
              onClick={() => setFilterForTime(!filterForTime)}
            >
              {filterForTime ? <FilterFilled /> : <FilterOutlined />}
            </Button>
          </ATooltip>
        </Space>
      </div>
      <Splitter layout='vertical' onResize={handleSplitterResize}>
        {depthData.length > 0 && (
          <Splitter.Panel>
            <div style={{ width: '100%', height: splitterHeights?.[0] || 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 60, left: 60, bottom: 50 }}
                  style={{ backgroundColor: themeColors.background }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                  <YAxis 
                    yAxisId="depth"
                    tickFormatter={(t: number) => `${Math.abs(t)}`}
                    label={{ value: depthCalc.label, angle: -90, position: 'insideLeft', style: { fill: themeColors.text } }}
                    fontSize={fontSize}
                    type="number"
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
                    tick={{ fill: themeColors.text }}
                  />
                  {/* we don't use this course axis, it's just for the reference area shading */}
                  <YAxis 
                    yAxisId="course"
                    tickFormatter={(t: number) => `${Math.abs(t)}`}
                    type="number"
                    domain={[0, 360]}
                    orientation='right'
                    hide={true}
                  />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={toShortDTG} 
                    type="number"
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
                    label={{ value: 'Time', position: 'insideBottom', offset: -10, style: { fill: themeColors.text } }}
                    fontSize={fontSize}
                    tick={{ fill: themeColors.text }}
                  />
                  {referenceAreaTop}
                  {showTooltip && <Tooltip 
                    labelFormatter={toShortDTG}
                    formatter={(value: number) => [`${Math.abs(Number(value))}`, 'Depth']}
                    contentStyle={{ 
                      backgroundColor: themeColors.tooltip.background,
                      color: themeColors.tooltip.text,
                      border: `1px solid ${themeColors.tooltip.border}`
                    }}
                  />}
                  {showLegend && <Legend 
                    verticalAlign="top" 
                    height={12} 
                    wrapperStyle={{ fontSize:'10px' }}
                    formatter={(value) => <span style={{ color: themeColors.text }}>{value}</span>}
                  />}
                  {depthData.map((dataset, index) => (
                    <Line
                      key={index}
                      yAxisId="depth"
                      type="monotone"
                      dataKey="value"
                      data={dataset.data}
                      name={dataset.featureName}
                      stroke={dataset.color || '#1890ff'}
                      dot={false}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Splitter.Panel>
        )}
        {bearingData.length > 0 && rangeData.length > 0 && (
          <Splitter.Panel>
            <div style={{ width: '100%', height: relativePlotHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 60, left: 60, bottom: 50 }}
                  style={{ backgroundColor: themeColors.background }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={toShortDTG} 
                    type="number"
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
                    label={{ value: 'Time', position: 'insideBottom', offset: -10, style: { fill: themeColors.text } }}
                    fontSize={fontSize}
                    tick={{ fill: themeColors.text }}
                  />
                  {/* Range axis (left) */}
                  <YAxis 
                    yAxisId="range"
                    type="number"
                    label={{ value: 'Range (nmi)', angle: -90, position: 'insideLeft', style: { fill: themeColors.text } }}
                    fontSize={fontSize}
                    tick={{ fill: themeColors.text }}
                  />
                  {/* Bearing axis (right) */}
                  <YAxis 
                    yAxisId="bearing"
                    type="number"
                    orientation="right"
                    domain={[0, 360]}
                    ticks={[0, 90, 180, 270, 360]}
                    tickFormatter={(t: number) => `${t}°`}
                    label={{ value: 'Bearing (°)', angle: 90, position: 'insideRight', style: { fill: themeColors.text } }}
                    fontSize={fontSize}
                    tick={{ fill: themeColors.text }}
                  />
                  {showLegend && <Legend 
                    verticalAlign="top" 
                    height={12} 
                    wrapperStyle={{ fontSize:'10px' }}
                    formatter={(value) => <span style={{ color: themeColors.text }}>{value}</span>}
                  />}
                  {referenceAreaBottom}
                  {showTooltip && <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    labelFormatter={(num) =>toShortDTG(num) + 'Z'}
                    formatter={(value: number, name: string) => [`${Math.round(Number(value))}`, name]}
                    itemStyle={{ fontSize: '12px', margin: '0', padding: '0' }}
                    wrapperStyle={{ fontSize: '14px', margin: '0', padding: '0' }}
                    contentStyle={{ 
                      backgroundColor: themeColors.tooltip.background,
                      color: themeColors.tooltip.text,
                      border: `1px solid ${themeColors.tooltip.border}`
                    }}
                  />}
                  {/* Range data */}
                  {rangeData.map((dataset, index) => (
                    <Line
                      key={index}
                      yAxisId="range"
                      type="monotone"
                      dataKey="value"
                      data={dataset.data}
                      name={`${dataset.featureName} Rng`}
                      stroke={dataset.color || '#1890ff'}
                      dot={false}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                    />
                  ))}
                  {/* Bearing data */}
                  {bearingData.map((dataset, index) => (
                    <Line
                      key={`bearing-${index}`}
                      yAxisId="bearing"
                      type="monotone"
                      dataKey="value"
                      data={dataset.data}
                      name={`${dataset.featureName} Brg`}
                      stroke={dataset.color || '#f5222d'}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Splitter.Panel>
        )}
      </Splitter>

     
    </div>
  )
}