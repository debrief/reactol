import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toShortDTG } from '../../helpers/toDTG'
import { GraphDataset } from '../../types'
import { depthCalc } from '../../helpers/calculations/depthCalc'

interface DepthChartProps {
  depthData: GraphDataset[]
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
  referenceArea: React.ReactNode
  fontSize: number
}

export const DepthChart: React.FC<DepthChartProps> = ({
  depthData,
  height,
  themeColors,
  showTooltip,
  showLegend,
  referenceArea,
  fontSize
}) => {
  return (
    <div style={{ width: '100%', height }}>
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
          {referenceArea}
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
  )
}
