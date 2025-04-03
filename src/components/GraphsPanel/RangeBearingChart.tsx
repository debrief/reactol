import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts'
import { toShortDTG } from '../../helpers/toDTG'
import { GraphDataset } from '../../types'
import { useGraphsContext } from './useGraphsContext'
import { useDocContext } from '../../state/DocContext'

interface RangeBearingChartProps {
  rangeData: GraphDataset[]
  bearingData: GraphDataset[]
  height: number
  themeColors: {
    text: string
    grid: string
    background: string
    tooltip: {
      background: string
      text: string
      border: string
    }
  }
  showTooltip: boolean
  showLegend: boolean
  fontSize: number
}

export const RangeBearingChart: React.FC<RangeBearingChartProps> = ({
  rangeData,
  bearingData,
  height,
  themeColors,
  showTooltip,
  showLegend,
  fontSize
}) => {
  const { time } = useDocContext()
  const { filterForTime } = useGraphsContext()
  
  // Create reference area for time filter visualization
  const referenceArea = useMemo(() => {
    if (time.filterApplied && !filterForTime) {
      return <ReferenceArea yAxisId="bearing" x1={time?.start} x2={time?.end} y1={0} y2={360} stroke="#777" />
    }
    return null
  }, [time, filterForTime])
  return (
    <div style={{ width: '100%', height }}>
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
          {referenceArea}
          {showTooltip && <Tooltip
            allowEscapeViewBox={{ x: true, y: true }}
            labelFormatter={(num) => toShortDTG(num) + 'Z'}
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
  )
}
