import {  useMemo, useState } from 'react'
import { Feature, LineString } from 'geojson'
import { useAppSelector } from '../../state/hooks'
import { Select, Space, Checkbox, Splitter } from 'antd'
import { VictoryAxis, VictoryChart, VictoryGroup, VictoryLine, VictoryTheme, VictoryLegend } from 'victory'
import { bearingCalc } from '../../helpers/calculations/bearingCalc'
import { rangeCalc } from '../../helpers/calculations/rangeCalc'
import { toShortDTG } from '../../helpers/toDTG'
import { useDocContext } from '../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { depthCalc } from '../../helpers/calculations/depthCalc'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'
import { GROUP_TYPE } from '../../constants'

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

export const GraphsPanel: React.FC<{height: number | null, width: number | null}> = ({height, width}) => {
  const features = useAppSelector((state) => state.fColl.features)
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
    featureOptions.filter(track => track.value !== primaryTrack).filter((track) => track.dataType !== 'a' + GROUP_TYPE)
  , [primaryTrack, featureOptions])

  const featuresToPlot = useMemo(() => 
    features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )
  , [primaryTrack, secondaryTracks, features])

  const liveFeatures = useMemo(() => {
    if (time && time.filterApplied) {
      return featuresToPlot.filter(feature =>
        featureIsVisibleInPeriod(feature, time.start, time.end)
      ).map(feature => filteredTrack(feature, time.start, time.end))
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
  
  const bearingData = useMemo(() => {
    if (primaryTrack === '') return []
    const tNow = Date.now()
    const res = bearingCalc.calculate(liveFeatures, primaryTrack)
    console.log('bearing data took:', Date.now() - tNow)
    return res
  }, [liveFeatures, primaryTrack])

  const rangeData = useMemo(() => {
    if (primaryTrack === '') return []
    const tNow = Date.now()
    const res = rangeCalc.calculate(liveFeatures, primaryTrack)
    console.log('range data took:', Date.now() - tNow)
    return res
  }, [liveFeatures, primaryTrack])

  const mainData = useMemo(() => {
    const res = [...bearingData, ...rangeData]
    return res
  }, [bearingData, rangeData])

  const fontSize = 12

  const legendData = useMemo(() => 
    rangeData.map(dataset => ({
      name: dataset.featureName,
      symbol: { fill: dataset.color || '#1890ff' }
    }))
  , [rangeData])

  const depthLegendData = useMemo(() => 
    depthData.map(dataset => ({
      name: dataset.featureName,
      symbol: { fill: dataset.color || '#1890ff' }
    }))
  , [depthData])

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
      overflow: 'auto',
      gap: '16px'
    }}>
      <div style={{ padding: '16px' }}>
        <Space align='center' wrap>
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
      <Splitter layout='vertical' onResize={handleSplitterResize}>
        {depthData.length > 0 && (
          <Splitter.Panel style={{ overflow: 'hidden' }}>
            <VictoryChart
              theme={VictoryTheme.material}
              scale={{ x: 'time' }}
              standalone={true}
              width={width || 400}
              height={splitterHeights?.[0] || 200}
              padding={{ top: 10, bottom: 50, left: 60, right: 60 }}
              domainPadding={{ x: 50, y: 50 }}
            >
              {showLegend && depthLegendData.length > 0 && (
                <VictoryLegend
                  x={80}
                  y={0}
                  orientation="horizontal"
                  gutter={20}
                  style={{ 
                    labels: { fontSize }
                  }}
                  data={depthLegendData}
                />
              )}
              <VictoryAxis
                tickFormat={(t) => toShortDTG(t)}
                style={{
                  tickLabels: { fontSize: fontSize, padding: 5 },
                  axisLabel: { fontSize: fontSize, padding: 30 }
                }}
                orientation='bottom'
              />
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fontSize: fontSize, padding: 5 },
                  axisLabel: { fontSize: fontSize, padding: 30 }
                }}
                label={depthCalc.label}
                tickFormat={(t: number) => `${Math.abs(t)}`}
              />
              {/* Depth data */}
              <VictoryGroup>
                {depthData.map((dataset, index) => (
                  <VictoryLine
                    key={index}
                    style={{
                      data: { stroke: dataset.color || '#1890ff' }
                    }}
                    data={dataset.data}
                    x="date"
                    y="value"
                  />
                ))}
              </VictoryGroup>
            </VictoryChart>
          </Splitter.Panel>
        )}
        {mainData.length > 0 && (
          <Splitter.Panel style={{ overflow: 'hidden' }}>
            <VictoryChart
              theme={VictoryTheme.material}
              scale={{ x: 'time' }}
              standalone={true}
              width={width || 400}
              height={relativePlotHeight}
              padding={{ top: 10, bottom: 50, left: 60, right: 60 }}
              domainPadding={{ x: 50, y: 50 }}
            >
              {showLegend && legendData.length > 0 && (
                <VictoryLegend
                  x={80}
                  y={0}
                  orientation="horizontal"
                  gutter={20}
                  style={{ 
                    labels: { fontSize }
                  }}
                  data={legendData}
                />
              )}
              <VictoryAxis
                tickFormat={(t) => toShortDTG(t)}
                style={{
                  tickLabels: { fontSize: fontSize, padding: 5 },
                  axisLabel: { fontSize: fontSize, padding: 30 }
                }}
              />
              {/* Range axis (left) */}
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fontSize: fontSize, padding: 5 },
                  axisLabel: { fontSize: fontSize, padding: 30 }
                }}
                label={rangeCalc.label}
              />
              {/* Bearing axis (right) */}
              <VictoryAxis
                dependentAxis
                orientation="right"
                domain={[0, 360]}
                tickValues={[0, 90, 180, 270, 360]}
                tickFormat={(t: number) => `${t}°`}
                style={{
                  tickLabels: { fontSize: fontSize, padding: 5 },
                  axisLabel: { fontSize: fontSize, padding: 30 },
                  axis: { strokeDasharray: '4,4' }
                }}
                label={bearingCalc.label}
              />
              {/* Range data */}
              <VictoryGroup>
                {rangeData.map((dataset, index) => (
                  <VictoryLine
                    key={index}
                    style={{
                      data: { stroke: dataset.color || '#1890ff' }
                    }}
                    data={dataset.data}
                    x="date"
                    y="value"
                  />
                ))}
              </VictoryGroup>
              {/* Bearing data */}
              <VictoryGroup>
                {bearingData.map((dataset, index) => (
                  <VictoryLine
                    key={`bearing-${index}`}
                    style={{
                      data: { 
                        stroke: dataset.color || '#f5222d',
                        strokeDasharray: '4,4'
                      }
                    }}
                    data={dataset.data}
                    x="date"
                    y="value"
                  />
                ))}
              </VictoryGroup>
            </VictoryChart>
          </Splitter.Panel>
        )}
      </Splitter>

     
    </div>
  )
}