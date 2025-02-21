import { useMemo, useState } from 'react'
import { useAppSelector } from '../../state/hooks'
import { Select, Space, Button } from 'antd'
import { VictoryAxis, VictoryChart, VictoryGroup, VictoryLine, VictoryTheme } from 'victory'
import { bearingCalc } from '../../helpers/calculations/bearingCalc'
import { rangeCalc } from '../../helpers/calculations/rangeCalc'
import { GraphDataset } from '../GraphModal'
import { toShortDTG } from '../../helpers/toDTG'

export const GraphsPanel: React.FC = () => {
  const features = useAppSelector((state) => state.fColl.features)
  const [showDepth, setShowDepth] = useState<boolean>(false)
  const [showLegend, setShowLegend] = useState<boolean>(false)
  const [primaryTrack, setPrimaryTrack] = useState<string>('')
  const [secondaryTracks, setSecondaryTracks] = useState<string[]>([])
  const [data, setData] = useState<GraphDataset[]>([])

  const tracks = useMemo(() => 
    features.filter((feature) => feature.properties?.dataType === 'track')
      .map(track => ({
        label: track.properties?.name || track.id,
        value: track.id
      }))
  , [features])

  // Update data when tracks or calculations change
  useMemo(() => {
    console.log('primaryTrack', primaryTrack, secondaryTracks)
    if (!primaryTrack || secondaryTracks.length === 0) {
      setData([])
      return
    }

    const tracksToPlot = features.filter(track => 
      track.id === primaryTrack || secondaryTracks.includes(track.id as string)
    )

    const bearingData = bearingCalc.calculate(tracksToPlot, primaryTrack)
    const rangeData = rangeCalc.calculate(tracksToPlot, primaryTrack)
    
    console.log('bearingData', tracksToPlot, bearingData)
    console.log('rangeData', rangeData)

    setData([...bearingData, ...rangeData])
  }, [primaryTrack, secondaryTracks, features])

  console.log('data', data)

  const bearingData = data.filter(d => d.label.includes('Bearing'))
  const rangeData = data.filter(d => !d.label.includes('Bearing'))
  const fontSize = 14
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px',
      gap: '16px'
    }}>
      <div>
        <Space>
          <Select
            placeholder="Primary Track"
            style={{ width: 200 }}
            value={primaryTrack}
            onChange={setPrimaryTrack}
            options={tracks}
          />
          <Select
            mode="multiple"
            placeholder="Secondary Tracks/Zones/Points"
            style={{ width: 300 }}
            value={secondaryTracks}
            onChange={setSecondaryTracks}
            options={tracks}
          />
          <Button onClick={() => setShowDepth(!showDepth)}>
            {showDepth ? 'Hide' : 'Show'} Depth
          </Button>
          <Button onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? 'Hide' : 'Show'} Legend
          </Button>
        </Space>
      </div>

      {data.length > 0 && (
        <div style={{ height: '100%', width: '100%', border:'3px solid brown' }}>
          <VictoryChart
            theme={VictoryTheme.material}
            scale={{ x: 'time' }}
            width={1000}
            height={500}
            padding={{ top: 10, bottom: 50, left: 60, right: 60 }}
            domainPadding={{ x: 50, y: 50 }}
          >
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
              label="Range (nm)"
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
              label="Bearing (°)"
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
        </div>
      )}
    </div>
  )
}