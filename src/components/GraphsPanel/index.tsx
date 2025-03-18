import {  useMemo, useState } from 'react'
import { Feature, LineString } from 'geojson'
import { useAppSelector } from '../../state/hooks'
import { Select, Space, Checkbox, Splitter } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toShortDTG } from '../../helpers/toDTG'
import { useDocContext } from '../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { depthCalc } from '../../helpers/calculations/depthCalc'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { bearingCalc } from '../../helpers/calculations/bearingCalc'
import { BEARING_DATA, RANGE_DATA, rangeBearingCalc } from '../../helpers/calculations/rangeBearingCalc'

type OptionType = {
  label: string
  value: string
  dataType: string
  icon: React.ReactNode
}

const filteredTrack = (feature: Feature, start: number, end: number) => {
  if (feature.properties?.dataType === 'track') {
    const lineFeature = feature as Feature<LineString>
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
    const res: Feature<LineString> = {
      ...feature,
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

export const GraphsPanel: React.FC<{height: number | null, width: number | null}> = ({height}) => {
  const features = useAppSelector(selectFeatures)
  const { time } = useDocContext()
  const [showDepth, setShowDepth] = useState<boolean>(true)
  const [showLegend, setShowLegend] = useState<boolean>(true)
  const [primaryTrack, setPrimaryTrack] = useState<string>('')
  const [secondaryTracks, setSecondaryTracks] = useState<string[]>([])
  const [splitterHeights, setSplitterHeights] = useState<[number, number] | null>(null)

  const featureOptions: OptionType[] = useMemo(() => 
    features.map(feature => {
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
  , [features])

  const trackOptions: OptionType[] = useMemo(() =>
    featureOptions.filter((feature) => feature.dataType === 'track')
  , [featureOptions])

  const secondaryOptions = useMemo(() => 
    featureOptions.filter(track => track.value !== primaryTrack)
  , [primaryTrack, featureOptions])

  const featuresToPlot = useMemo(() => 
    features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )
  , [primaryTrack, secondaryTracks, features])

  const liveFeatures = useMemo(() => {
    if (time && time.filterApplied) {
      const result = featuresToPlot.filter(feature =>
        featureIsVisibleInPeriod(feature, time.start, time.end)
      ).map(feature => filteredTrack(feature, time.start, time.end))
      return result
    } else {
      return featuresToPlot
    }
  }, [featuresToPlot, time])

  const depthData = useMemo(() => {
    if (showDepth) {
      return depthCalc.calculate(liveFeatures)
    } else {
      return []
    }
  }, [liveFeatures, showDepth])

  const rangeBearingData = useMemo(() => {
    if (primaryTrack === '') return []
    const tNow = Date.now()
    const res = rangeBearingCalc.calculate(liveFeatures, primaryTrack)
    console.log('range/bearing data took:', Date.now() - tNow)
    return res
  }, [liveFeatures, primaryTrack])

  const bearingData = useMemo(() => {
    // filter the bearing data
    return rangeBearingData.filter(d => d.extraProp === BEARING_DATA)
  }, [rangeBearingData])

  const rangeData = useMemo(() => {
    // filter the bearing data
    return rangeBearingData.filter(d => d.extraProp === RANGE_DATA)
  }, [rangeBearingData])

  const mainData = useMemo(() => {
    const res = [...bearingData, ...rangeData]
    return res
  }, [bearingData, rangeData])

  const fontSize = 12

  // Legend data is now handled directly by Recharts Legend component

  const handleSplitterResize = (sizes: number[]) => {
    setSplitterHeights(sizes as [number, number])
  }

  const relativePlotHeight = useMemo(() => {
    if (depthData.length > 0) {
      return (splitterHeights?.[1] || 200)
    } else {
      return (height || 300) - 60 
    }
  }, [height, splitterHeights, depthData])

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px',
      gap: '16px'
    }}>
      <div>
        <Space align='center'>
          Primary:
          <Select
            placeholder="Primary Track"
            style={{ width: 100 }}
            value={primaryTrack}
            size="small"
            onChange={setPrimaryTrack}
            options={trackOptions}
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
          Secondary:
          <Select
            mode="multiple"
            placeholder="Secondary Tracks/Zones/Points"
            style={{ width: 100 }}
            value={secondaryTracks}
            onChange={setSecondaryTracks}
            maxTagCount={'responsive'}
            options={secondaryOptions}
          />
          <Checkbox checked={showDepth} onClick={() => setShowDepth(!showDepth)}>
            Depth
          </Checkbox>
          <Checkbox checked={showLegend} onClick={() => setShowLegend(!showLegend)}>
            Legend
          </Checkbox>
        </Space>
      </div>
      <Splitter style={{height: (height || 300) - 60}} layout='vertical' onResize={handleSplitterResize}>
        {depthData.length > 0 && (
          <Splitter.Panel>
            <div style={{ width: '100%', height: splitterHeights?.[0] || 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={depthData.flatMap(dataset => 
                    dataset.data.map(point => ({
                      ...point,
                      name: dataset.featureName,
                      color: dataset.color || '#1890ff'
                    }))
                  )}
                  margin={{ top: 20, right: 60, left: 60, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={toShortDTG} 
                    label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                    fontSize={fontSize}
                  />
                  <YAxis 
                    tickFormatter={(t: number) => `${Math.abs(t)}`}
                    label={{ value: depthCalc.label, angle: -90, position: 'insideLeft' }}
                    fontSize={fontSize}
                  />
                  <Tooltip 
                    labelFormatter={toShortDTG}
                    formatter={(value: number) => [`${Math.abs(Number(value))}`, 'Depth']}
                  />
                  {showLegend && <Legend verticalAlign="top" height={12} wrapperStyle={{ fontSize:'10px' }} />}
                  {depthData.map((dataset, index) => (
                    <Line
                      key={index}
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
        {mainData.length > 0 && (
          <Splitter.Panel>
            <div style={{ width: '100%', height: relativePlotHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 60, left: 60, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={toShortDTG} 
                    label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                    fontSize={fontSize}
                    allowDuplicatedCategory={false}
                  />
                  {/* Range axis (left) */}
                  <YAxis 
                    yAxisId="range"
                    label={{ value: 'Range (nmi)', angle: -90, position: 'insideLeft' }}
                    fontSize={fontSize}
                  />
                  {/* Bearing axis (right) */}
                  <YAxis 
                    yAxisId="bearing"
                    orientation="right"
                    domain={[0, 360]}
                    ticks={[0, 90, 180, 270, 360]}
                    tickFormatter={(t: number) => `${t}°`}
                    label={{ value: bearingCalc.label, angle: 90, position: 'insideRight' }}
                    fontSize={fontSize}
                  />
                  {showLegend && <Legend verticalAlign="top" height={12} wrapperStyle={{ fontSize:'10px' }} />}
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    labelFormatter={(num) =>toShortDTG(num) + 'Z'}
                    formatter={(value: number, name: string) => [`${Math.round(Number(value))}`, name]}
                    itemStyle={{ fontSize: '12px', margin: '0', padding: '0' }}
                    wrapperStyle={{ fontSize: '14px', margin: '0', padding: '0' }}
                  />
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