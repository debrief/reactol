import React from 'react'
import { Button, Space, Select, Tooltip as ATooltip } from 'antd'
import { FilterOutlined, FilterFilled } from '@ant-design/icons'
import { useGraphsContext } from './useGraphsContext'
import { useDocContext } from '../../state/DocContext'
import { OptionType } from './featureUtils'
import { FeatureSelectorModal } from './FeatureSelectorModal'
import { useAppSelector } from '../../state/hooks'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { BACKDROP_TYPE } from '../../constants'
import { useGraphData } from './useGraphData'

export const GraphsToolbar: React.FC = () => {
  const { time } = useDocContext()
  const { depthPresent } = useGraphData()
  const features = useAppSelector(selectFeatures)
  const {
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
    secondaryTracks,
    setSecondaryTracks,
    isTransferModalVisible,
    setIsTransferModalVisible
  } = useGraphsContext()

  const buttonStyle = { margin: '0 1px' }
  const timeFilterApplied = time.filterApplied

  return (
    <>
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
      
      <FeatureSelectorModal
        isOpen={isTransferModalVisible}
        title="Manage Secondary Tracks"
        onSave={setSecondaryTracks}
        onClose={() => setIsTransferModalVisible(false)}
        features={features.filter(feature => feature.id !== primaryTrack).filter(feature => feature.properties?.dataType !== BACKDROP_TYPE)}
        defaults={secondaryTracks}
      />
    </>
  )
}
