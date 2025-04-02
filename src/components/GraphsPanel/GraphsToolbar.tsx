import React from 'react'
import { Button, Space, Select, Tooltip as ATooltip } from 'antd'
import { FilterOutlined, FilterFilled } from '@ant-design/icons'
import { OptionType } from './featureUtils'

interface GraphsToolbarProps {
  primaryTrack: string
  setPrimaryTrack: (trackId: string) => void
  primaryTrackOptions: OptionType[]
  showDepth: boolean
  setShowDepth: (show: boolean) => void
  showLegend: boolean
  setShowLegend: (show: boolean) => void
  showTooltip: boolean
  setShowTooltip: (show: boolean) => void
  filterForTime: boolean
  setFilterForTime: (filter: boolean) => void
  depthPresent: boolean
  timeFilterApplied: boolean
  openSecondarySelector: () => void
}

export const GraphsToolbar: React.FC<GraphsToolbarProps> = ({
  primaryTrack,
  setPrimaryTrack,
  primaryTrackOptions,
  showDepth,
  setShowDepth,
  showLegend,
  setShowLegend,
  showTooltip,
  setShowTooltip,
  filterForTime,
  setFilterForTime,
  depthPresent,
  timeFilterApplied,
  openSecondarySelector
}) => {
  const buttonStyle = { margin: '0 1px' }

  return (
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
        <Button onClick={openSecondarySelector}>
          Secondary items:
        </Button>
      </ATooltip>
      <ATooltip title={depthPresent ? (showDepth ? 'Hide depth' : 'Show depth') : 'No selected tracks contain depth data'}>
        <Button 
          disabled={!depthPresent} 
          style={buttonStyle} 
          color={showDepth ? 'primary' : 'default'} 
          variant={showDepth ? 'solid' : 'outlined'} 
          onClick={() => setShowDepth(!showDepth)} 
          className={showDepth ? 'fg-profile' : 'fg-profile-o'}
        />
      </ATooltip>
      <ATooltip title={showLegend ? 'Hide legend' : 'Show legend'}>
        <Button 
          style={buttonStyle} 
          color={showLegend ? 'primary' : 'default'} 
          variant={showLegend ? 'solid' : 'outlined'} 
          onClick={() => setShowLegend(!showLegend)} 
          className={showLegend ? 'fg-map-legend' : 'fg-map-legend-o'}
        />
      </ATooltip>
      <ATooltip title={showTooltip ? 'Hide tooltips' : 'Show tooltips'}>
        <Button 
          style={buttonStyle} 
          color={showTooltip ? 'primary' : 'default'} 
          variant={showTooltip ? 'solid' : 'outlined'} 
          onClick={() => setShowTooltip(!showTooltip)} 
          className={'fg-measure-line'}
        />
      </ATooltip>
      <ATooltip
        mouseEnterDelay={0.8}
        title={timeFilterApplied ? 'Trim graphs to current time filter' : 'No time filter applied'}
      >
        <Button
          style={buttonStyle}
          disabled={!timeFilterApplied}
          color={filterForTime ? 'primary' : 'default'} 
          variant={filterForTime ? 'solid' : 'outlined'}
          onClick={() => setFilterForTime(!filterForTime)}
        >
          {filterForTime ? <FilterFilled /> : <FilterOutlined />}
        </Button>
      </ATooltip>
    </Space>
  )
}
