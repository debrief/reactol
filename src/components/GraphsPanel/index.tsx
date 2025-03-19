import {  useMemo, useState } from 'react'
import { Feature, GeoJsonProperties, Geometry, LineString } from 'geojson'
import { useAppSelector } from '../../state/hooks'
import { Select, Space, Splitter, Button, Tooltip as ATooltip, Modal, Transfer } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts'
import {
  FilterOutlined,
  FilterFilled} from '@ant-design/icons'
import { toShortDTG } from '../../helpers/toDTG'
import { useDocContext } from '../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { depthCalc } from '../../helpers/calculations/depthCalc'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { bearingCalc } from '../../helpers/calculations/bearingCalc'
import { BEARING_DATA, RANGE_DATA, rangeBearingCalc } from '../../helpers/calculations/rangeBearingCalc'
import { BACKDROP_TYPE } from '../../constants'

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

export const GraphsPanel: React.FC<{height: number | null, width: number | null}> = ({height}) => {
  const features = useAppSelector(selectFeatures)
  const { time } = useDocContext()
  const [showDepth, setShowDepth] = useState<boolean>(false)
  const [showLegend, setShowLegend] = useState<boolean>(true)
  const [filterForTime, setFilterForTime] = useState<boolean>(false)
  const [primaryTrack, setPrimaryTrack] = useState<string>('')
  const [secondaryTracks, setSecondaryTracks] = useState<string[]>([])
  const [splitterHeights, setSplitterHeights] = useState<[number, number] | null>(null)
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false)
  const [tempSecondaryTracks, setTempSecondaryTracks] = useState<string[]>([])

  const featureOptions: OptionType[] = useMemo(() => {
    if (!primaryTrack) {
      setPrimaryTrack(features.find(feature => feature.properties?.dataType === 'track')?.id as string || '')
    }
    if (!secondaryTracks.length) {
      setSecondaryTracks(features.filter(feature => feature.properties?.dataType === 'track').map(feature => feature.id as string))
    }
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
  }, [features, primaryTrack, secondaryTracks])

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

  const trackOptions: OptionType[] = useMemo(() =>
    featureOptions.filter((feature) => feature.dataType === 'track')
  , [featureOptions])

  const secondaryOptions = useMemo(() => 
    featureOptions.filter(track => track.value !== primaryTrack).filter(feature => feature.dataType !== BACKDROP_TYPE)
  , [primaryTrack, featureOptions])

  const featuresToPlot = useMemo(() => 
    features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )
  , [primaryTrack, secondaryTracks, features])

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
          <Button 
            onClick={() => {
              setTempSecondaryTracks([...secondaryTracks])
              setIsTransferModalVisible(true)
            }}
          >
            Secondary tracks:
          </Button>
          
          <Modal
            title="Manage Secondary Tracks"
            open={isTransferModalVisible}
            onOk={() => {
              setSecondaryTracks(tempSecondaryTracks)
              setIsTransferModalVisible(false)
            }}
            onCancel={() => setIsTransferModalVisible(false)}
            width={600}
          >
            <Transfer
              dataSource={secondaryOptions.map(option => ({
                key: option.value,
                title: option.label,
                description: option.dataType,
                disabled: false
              }))}
              titles={['Available', 'Selected']}
              targetKeys={tempSecondaryTracks}
              onChange={(nextTargetKeys) => setTempSecondaryTracks(nextTargetKeys as string[])}
              render={item => (
                <Space>
                  {featureOptions.find(opt => opt.value === item.key)?.icon}
                  {item.title}
                  <span style={{ color: '#999', fontSize: '12px' }}>{item.description}</span>
                </Space>
              )}
              listStyle={{
                width: 250,
                height: 300,
              }}
              showSearch
              filterOption={(inputValue, item) =>
                item.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                item.description.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
              }
            />
          </Modal>
          <ATooltip title={showDepth ? 'Hide depth' : 'Show depth'}>
            <Button style={buttonStyle} color={showDepth ? 'primary' : 'default'} variant={showDepth ? 'solid' : 'outlined'} onClick={() => setShowDepth(!showDepth)} className={showDepth ? 'fg-profile' : 'fg-profile-o'}></Button>
          </ATooltip>
          <ATooltip title={showLegend ? 'Hide legend' : 'Show legend'}>
            <Button style={buttonStyle} color={showLegend ? 'primary' : 'default'} variant={showLegend ? 'solid' : 'outlined'} onClick={() => setShowLegend(!showLegend)} className={showLegend ? 'fg-map-legend' : 'fg-map-legend-o'}></Button>
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
      <Splitter style={{height: (height || 300) - 60}} layout='vertical' onResize={handleSplitterResize}>
        {depthData.length > 0 && (
          <Splitter.Panel>
            <div style={{ width: '100%', height: splitterHeights?.[0] || 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 60, left: 60, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis 
                    yAxisId="depth"
                    tickFormatter={(t: number) => `${Math.abs(t)}`}
                    label={{ value: depthCalc.label, angle: -90, position: 'insideLeft' }}
                    fontSize={fontSize}
                    type="number"
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
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
                    label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                    fontSize={fontSize}
                  />
                  {referenceAreaTop}
                  <Tooltip 
                    labelFormatter={toShortDTG}
                    formatter={(value: number) => [`${Math.abs(Number(value))}`, 'Depth']}
                  />
                  {showLegend && <Legend verticalAlign="top" height={12} wrapperStyle={{ fontSize:'10px' }} />}
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
                    type="number"
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
                    label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                    fontSize={fontSize}
                  />
                  {/* Range axis (left) */}
                  <YAxis 
                    yAxisId="range"
                    type="number"
                    label={{ value: 'Range (nmi)', angle: -90, position: 'insideLeft' }}
                    fontSize={fontSize}
                  />
                  {/* Bearing axis (right) */}
                  <YAxis 
                    yAxisId="bearing"
                    type="number"
                    orientation="right"
                    domain={[0, 360]}
                    ticks={[0, 90, 180, 270, 360]}
                    tickFormatter={(t: number) => `${t}°`}
                    label={{ value: bearingCalc.label, angle: 90, position: 'insideRight' }}
                    fontSize={fontSize}
                  />
                  {showLegend && <Legend verticalAlign="top" height={12} wrapperStyle={{ fontSize:'10px' }} />}
                  {referenceAreaBottom}
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