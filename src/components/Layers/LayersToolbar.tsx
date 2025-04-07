import React from 'react'
import { Button, Flex } from 'antd'
import {
  ShrinkOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FilterFilled,
  FilterOutlined
} from '@ant-design/icons'
import { ToolButton } from './ToolButton'
import { CopyButton } from './CopyButton'
import { PasteButton } from './PasteButton'
import { useTranslation } from 'react-i18next'

interface LayersToolbarProps {
  onCollapse: () => void
  onClearSelection: () => void
  onDelete: () => void
  onGraph: () => void
  isExpanded: boolean
  hasSelection: boolean
  hasTemporalFeature: boolean
  hasTimeFilter: boolean
  onFilterForTime: (value: boolean) => void
}

export const LayersToolbar: React.FC<LayersToolbarProps> = ({
  onCollapse,
  onClearSelection,
  onDelete,
  isExpanded,
  hasSelection,
  hasTimeFilter,
  onFilterForTime
}) => {
  const { t } = useTranslation()
  return (
    <div style={{ position: 'relative' }}>
      <Flex
        className='toolbar'
        gap='small'
        justify='end'
        wrap
        style={{
          position: 'absolute',
          top: '2px',
          right: '0',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Button.Group>
          <ToolButton
            onClick={onCollapse}
            icon={<ShrinkOutlined />}
            className='layers-collapse-button'
            title={t('layers.collapseAll')}
            disabled={!isExpanded}
          />
          <ToolButton
            onClick={onClearSelection}
            disabled={!hasSelection}
            className='layers-clear-button'
            icon={<CloseCircleOutlined />}
            title={t('layers.clearSelection')}
          />
          <ToolButton
            onClick={onDelete}
            className='layers-delete-button'
            disabled={!hasSelection}
            icon={<DeleteOutlined />}
            title={
              hasSelection
                ? t('layers.deleteSelected')
                : t('layers.selectToEnable')
            }
          />
          <CopyButton />
          <PasteButton />
          <ToolButton
            onClick={() => onFilterForTime(!hasTimeFilter)}
            className='layers-delete-button'
            disabled={false}
            filled={hasTimeFilter}
            icon={hasTimeFilter ? <FilterFilled /> : <FilterOutlined />}
            title={
              hasTimeFilter
                ? t('layers.cancelTimeFilter')
                : t('layers.filterByTime')
            }
          />
          {/* <ToolButton
            onClick={onGraph}
            disabled={!hasTemporalFeature}
            icon={<LineChartOutlined />}
            title={
              hasTemporalFeature
                ? 'View graph of selected features'
                : 'Select a time-related feature to enable graphs'
            }
          /> */}
        </Button.Group>
      </Flex>
    </div>
  )
}
