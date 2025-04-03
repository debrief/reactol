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
            title='Collapse All'
            disabled={!isExpanded}
          />
          <ToolButton
            onClick={onClearSelection}
            disabled={!hasSelection}
            className='layers-clear-button'
            icon={<CloseCircleOutlined />}
            title={'Clear selection'}
          />
          <ToolButton
            onClick={onDelete}
            className='layers-delete-button'
            disabled={!hasSelection}
            icon={<DeleteOutlined />}
            title={
              hasSelection
                ? 'Delete selected items'
                : 'Select items to enable delete'
            }
          />
          <CopyButton />
          <PasteButton />
          <Button
            size={'middle'}
            onClick={() => onFilterForTime(!hasTimeFilter)}
          >
            {hasTimeFilter ? <FilterFilled /> : <FilterOutlined />}
          </Button>

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
